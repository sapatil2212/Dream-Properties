'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { UserRole } from '@/types';
import { Card, Button, Input, Modal, Select, DatePicker } from '@/components/UIComponents';
import { Mail, Lock, User, Phone, Key, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, Calendar, MapPin, Briefcase, Clock } from 'lucide-react';
import Link from 'next/link';

export default function SaasAuthPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (!session) return;
    if (session.user.role === (UserRole as any).BUYER) {
      router.push('/');
    } else {
      router.push('/saas/dashboard');
    }
  }, [session, router]);

  const [isLoading, setIsLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: '' as UserRole | '',
    securityKey: '',
    dob: '',
    gender: '',
    address: '',
    occupation: '',
    experienceYears: '',
    experienceMonths: '',
    isFresher: false,
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
        setFormData({ ...formData, [name]: value });
    }
    setError('');
    if (fieldErrors[name]) {
        setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleValueChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    if (fieldErrors[name]) {
        setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1 || isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setError('');
    
    // Validation
    const errors: Record<string, string> = {};
    if (!formData.role) errors.role = 'Role is required';
    if (!formData.email) errors.email = 'Email is required';
    if (!formData.mobile) errors.mobile = 'Mobile is required';
    if (!formData.password) errors.password = 'Password is required';
    if (!formData.confirmPassword) errors.confirmPassword = 'Confirm Password is required';
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }

    if (formData.role && formData.role !== 'ADMIN') {
        if (!formData.firstName) errors.firstName = 'First Name is required';
        if (!formData.lastName) errors.lastName = 'Last Name is required';
        if (!formData.dob) errors.dob = 'Date of Birth is required';
        if (!formData.address) errors.address = 'Address is required';
        if (!formData.gender) errors.gender = 'Gender is required';
        if (!formData.occupation) errors.occupation = 'Occupation is required';
    } else if (formData.role === 'ADMIN') {
        if (!formData.name) errors.name = 'Full Name is required';
    }

    if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
    }

    setIsLoading(true);
    try {
      const fullName = formData.role === 'ADMIN' ? formData.name : `${formData.firstName} ${formData.lastName}`.trim();

      const response = await fetch('/api/saas/register-step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          mobile: formData.mobile,
          password: formData.password,
          role: formData.role,
          dob: formData.dob,
          gender: formData.gender,
          address: formData.address,
          occupation: formData.occupation,
          experienceYears: formData.experienceYears,
          experienceMonths: formData.experienceMonths,
          isFresher: formData.isFresher
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setShowOTPModal(true);
      } else {
        if (data.message && data.message.toLowerCase().includes('email already registered')) {
            setFieldErrors({ email: data.message });
        } else {
            setError(data.message || 'Signup failed');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');
    if (otpValue.length < 6) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/saas/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: otpValue }),
      });

      const data = await response.json();
      if (response.ok) {
        setShowOTPModal(false);
        setSuccessMsg("Registration successful login details will be received via email");
        setIsLogin(true);
      } else {
        setError(data.message || 'OTP verification failed');
      }
    } catch (err) {
      setError('Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.securityKey) {
      setError('Please enter email, password and security key');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        securityKey: formData.securityKey,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/saas/dashboard');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className={`w-full transition-all duration-300 ${isLogin ? 'max-w-[500px]' : 'max-w-3xl'}`}>
        <Card className="p-8 border-none shadow-2xl shadow-slate-200/60 overflow-hidden relative">
          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-emerald-700 animate-in fade-in slide-in-from-top-4">
              <CheckCircle2 className="shrink-0 mt-0.5" size={18} />
              <p className="text-sm font-medium leading-relaxed">{successMsg}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 animate-in fade-in slide-in-from-top-4">
              <div className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-red-600" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
            <button
              onClick={() => { setIsLogin(true); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${!isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit} className="space-y-5">
            
            {/* Role Selection - First for Registration */}
            {!isLogin && (
                <Select
                  label="Select Role"
                  options={[
                    { label: 'Admin', value: (UserRole as any).ADMIN },
                    { label: 'Telecaller', value: (UserRole as any).TELECALLER },
                    { label: 'Sales Executive', value: (UserRole as any).SALES_EXECUTIVE }
                  ]}
                  value={formData.role}
                  onChange={(val) => handleValueChange('role', val)}
                  placeholder="Choose your role"
                  error={fieldErrors.role}
                />
            )}

            {/* Fields based on Role */}
            {!isLogin && formData.role && formData.role !== 'ADMIN' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="First Name"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        error={fieldErrors.firstName}
                    />
                    <Input
                        label="Last Name"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        error={fieldErrors.lastName}
                    />

                    <DatePicker
                        label="Date of Birth"
                        value={formData.dob}
                        onChange={(val) => handleValueChange('dob', val)}
                        error={fieldErrors.dob}
                    />

                    <Select
                        label="Gender"
                        options={[
                            { label: 'Male', value: 'Male' },
                            { label: 'Female', value: 'Female' },
                            { label: 'Other', value: 'Other' }
                        ]}
                        value={formData.gender}
                        onChange={(val) => handleValueChange('gender', val)}
                        placeholder="Select Gender"
                        error={fieldErrors.gender}
                    />

                    <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="name@company.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        icon={<Mail size={18} className="text-slate-400" />}
                        required
                        error={fieldErrors.email}
                    />

                    <Input
                        label="Mobile Number"
                        name="mobile"
                        placeholder="10-digit mobile number"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        icon={<Phone size={18} className="text-slate-400" />}
                        required
                        error={fieldErrors.mobile}
                    />

                    <div className="flex flex-col gap-1 w-full md:col-span-2">
                        <label className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-500">Full Address</label>
                        <div className="relative">
                            <MapPin size={18} className="absolute left-3 top-3 text-slate-400" />
                            <textarea
                                name="address"
                                placeholder="Enter full address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className={`w-full min-h-[80px] px-3.5 py-2 pl-10 rounded-xl border bg-white transition-all focus:border-blue-500 outline-none text-[13px] font-medium resize-none ${fieldErrors.address ? 'border-rose-500 bg-rose-50/20' : 'border-slate-200'}`}
                                required
                            />
                        </div>
                        {fieldErrors.address && (
                            <p className="text-[10px] font-bold text-rose-500 tracking-tight mt-1">
                                {fieldErrors.address}
                            </p>
                        )}
                    </div>

                    <Input
                        label="Occupation"
                        name="occupation"
                        placeholder="Current Occupation"
                        value={formData.occupation}
                        onChange={handleInputChange}
                        icon={<Briefcase size={18} className="text-slate-400" />}
                        required
                        error={fieldErrors.occupation}
                    />

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                             <label className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-500">Experience</label>
                             <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    name="isFresher"
                                    checked={formData.isFresher}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-xs font-medium text-slate-700">I am a Fresher</span>
                             </label>
                        </div>
                        
                        {!formData.isFresher && (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                <Input
                                    label="Years"
                                    name="experienceYears"
                                    type="number"
                                    placeholder="0"
                                    value={formData.experienceYears}
                                    onChange={handleInputChange}
                                    min={0}
                                />
                                <Input
                                    label="Months"
                                    name="experienceMonths"
                                    type="number"
                                    placeholder="0"
                                    value={formData.experienceMonths}
                                    onChange={handleInputChange}
                                    min={0}
                                    max={11}
                                />
                            </div>
                        )}
                    </div>

                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        icon={<Lock size={18} className="text-slate-400" />}
                        required
                        error={fieldErrors.password}
                    />
                    
                    <Input
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        icon={<Lock size={18} className="text-slate-400" />}
                        required
                        error={fieldErrors.confirmPassword}
                    />
                </div>
            ) : !isLogin ? (
                // Admin or No Role Selected (Default View)
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <Input
                            label="Full Name"
                            name="name"
                            placeholder="Name"
                            value={formData.name}
                            onChange={handleInputChange}
                            icon={<User size={18} className="text-slate-400" />}
                            required
                            error={fieldErrors.name}
                        />
                    </div>

                    <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="name@company.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        icon={<Mail size={18} className="text-slate-400" />}
                        required
                        error={fieldErrors.email}
                    />

                    <Input
                        label="Mobile Number"
                        name="mobile"
                        placeholder="10-digit mobile number"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        icon={<Phone size={18} className="text-slate-400" />}
                        required
                        error={fieldErrors.mobile}
                    />

                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        icon={<Lock size={18} className="text-slate-400" />}
                        required
                        error={fieldErrors.password}
                    />
                    
                    <Input
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        icon={<Lock size={18} className="text-slate-400" />}
                        required
                        error={fieldErrors.confirmPassword}
                    />
                </div>
            ) : (
                // Login View
                <div className="space-y-5">
                    <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="name@company.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        icon={<Mail size={18} className="text-slate-400" />}
                        required
                    />
                     <Input
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        icon={<Lock size={18} className="text-slate-400" />}
                        required
                    />
                    <Input
                        label="Security Key"
                        name="securityKey"
                        placeholder="Enter your security key"
                        value={formData.securityKey}
                        onChange={handleInputChange}
                        icon={<Key size={18} className="text-slate-400" />}
                        required
                    />
                </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full h-12 text-sm font-bold shadow-lg shadow-blue-200"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : isLogin ? 'Sign In to Portal' : 'Register for OTP'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
              <ArrowLeft size={16} />
              Back to home
            </Link>
          </div>
        </Card>
      </div>

      <Modal isOpen={showOTPModal} onClose={() => setShowOTPModal(false)} title="Verify OTP">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail className="text-blue-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h2>
          <p className="text-slate-500 mb-8">We've sent a 6-digit verification code to <span className="text-slate-900 font-semibold">{formData.email}</span></p>

          <div className="flex justify-center gap-3 mb-8">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOTPChange(idx, e.target.value)}
                className="w-12 h-14 text-center text-xl font-bold bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all"
              />
            ))}
          </div>

          <Button
            onClick={handleVerifyOTP}
            disabled={isLoading || otp.join('').length < 6}
            className="w-full h-12 text-sm font-bold"
          >
            {isLoading ? 'Verifying...' : 'Verify & Register'}
          </Button>

          <button
            onClick={() => setShowOTPModal(false)}
            className="mt-6 text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            I'll do this later
          </button>
        </div>
      </Modal>
    </div>
  );
}
