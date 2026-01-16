import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserRole } from '../../types.ts';
import { Card, Button, Input, Modal } from '../../components/UIComponents.tsx';
import { Mail, Lock, User, Phone, Key, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SaasAuthProps {
  onLogin: (role: UserRole, user: any) => void;
  currentUser: any;
}

export const SaasAuth: React.FC<SaasAuthProps> = ({ onLogin, currentUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && currentUser.role !== UserRole.BUYER) {
      window.location.hash = '#/dashboard';
    }
  }, [currentUser]);
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    role: '' as UserRole | '',
    securityKey: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
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
    if (!formData.name || !formData.email || !formData.mobile || !formData.password || !formData.role) {
      setError('Please fill all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/saas/register-step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          password: formData.password,
          role: formData.role
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setShowOTPModal(true);
      } else {
        setError(data.message || 'Signup failed');
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
      const response = await fetch('http://localhost:5000/api/saas/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
      const response = await fetch('http://localhost:5000/api/saas/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          securityKey: formData.securityKey
        }),
      });

      const data = await response.json();
      if (response.ok) {
        onLogin(data.user.role, data.user);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-[440px]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-xl shadow-blue-200">
            <ShieldCheck className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">SaaS Portal</h1>
          <p className="text-slate-500 mt-2">Manage your real estate agency efficiently</p>
        </div>

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
            {!isLogin && (
              <Input
                label="Full Name"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                icon={<User size={18} className="text-slate-400" />}
                required
              />
            )}

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

            {!isLogin && (
              <Input
                label="Mobile Number"
                name="mobile"
                placeholder="10-digit mobile number"
                value={formData.mobile}
                onChange={handleInputChange}
                icon={<Phone size={18} className="text-slate-400" />}
                required
              />
            )}

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

            {!isLogin ? (
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Role</label>
                <div className="relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all text-sm font-medium appearance-none"
                    required
                  >
                    <option value="">Choose your role</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                    <option value={UserRole.TELECALLER}>Telecaller</option>
                    <option value={UserRole.SALES_EXECUTIVE}>Sales Executive</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ArrowRight size={16} className="text-slate-400 rotate-90" />
                  </div>
                </div>
              </div>
            ) : (
              <Input
                label="Security Key"
                name="securityKey"
                placeholder="Enter your security key"
                value={formData.securityKey}
                onChange={handleInputChange}
                icon={<Key size={18} className="text-slate-400" />}
                required
              />
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
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
              <ArrowLeft size={16} />
              Back to Website
            </Link>
          </div>
        </Card>
      </div>

      <Modal isOpen={showOTPModal} onClose={() => setShowOTPModal(false)}>
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
};
