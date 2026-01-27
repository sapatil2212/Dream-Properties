'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { UserRole } from '@/types';
import { Card, Button, Input, Modal, Select } from '@/components/UIComponents';
import { Mail, Lock, User, ArrowRight, Key, ArrowLeft, Home, Phone, Building2, ShoppingBag, Monitor, Warehouse, Maximize, MoreHorizontal, Check, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  
  useEffect(() => {
    if (session?.user) {
      // Redirect Buyers/Users to Home, others to Dashboard
      // Check for both USER and BUYER roles to be safe
      if (session.user.role === UserRole.USER || session.user.role === 'BUYER') {
        router.push('/');
      } else {
        router.push('/dashboard');
      }
    }
  }, [session, router]);

  const [role, setRole] = useState<UserRole | 'OWNER' | ''>('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [propertyType, setPropertyType] = useState('Residential');
  const [lookingTo, setLookingTo] = useState('Buy');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [loginEmailError, setLoginEmailError] = useState('');
  const [loginPasswordError, setLoginPasswordError] = useState('');
  const [loginCommonError, setLoginCommonError] = useState('');
  
  const [signupNameError, setSignupNameError] = useState('');
  const [signupMobileError, setSignupMobileError] = useState('');
  const [signupEmailError, setSignupEmailError] = useState('');
  const [signupPasswordError, setSignupPasswordError] = useState('');
  const [signupRoleError, setSignupRoleError] = useState('');
  const [signupProjectNameError, setSignupProjectNameError] = useState('');
  const [signupPropertyAddressError, setSignupPropertyAddressError] = useState('');
  
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  // Forgot Password Flow State
  const [forgotStep, setForgotStep] = useState<'EMAIL' | 'OTP' | 'NEW_PW'>('EMAIL');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState(['', '', '', '', '', '']);
  const [forgotNewPW, setForgotNewPW] = useState('');
  const [forgotConfirmPW, setForgotConfirmPW] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [isForgotSuccess, setIsForgotSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    projectName: '',
    propertyAddress: ''
  });

  const propertyTypes = [
    { name: 'Residential', icon: <Home size={16} /> },
    { name: 'Office', icon: <Building2 size={16} /> },
    { name: 'Retail Shop', icon: <ShoppingBag size={16} /> },
    { name: 'Showroom', icon: <Monitor size={16} /> },
    { name: 'Warehouse', icon: <Warehouse size={16} /> },
    { name: 'Plot', icon: <Maximize size={16} /> },
    { name: 'Others', icon: <MoreHorizontal size={16} /> },
  ];

  const ROLES = [
    { label: 'Buyer / User', value: UserRole.USER },
    { label: 'Builder', value: UserRole.BUILDER },
    { label: 'Individual Owner', value: 'OWNER' },
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showOTPModal && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [showOTPModal, countdown]);

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1 || isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError('');

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSignupSubmit = async () => {
    setSignupNameError('');
    setSignupMobileError('');
    setSignupEmailError('');
    setSignupPasswordError('');
    setSignupRoleError('');
    setSignupProjectNameError('');
    setSignupPropertyAddressError('');

    let hasError = false;

    if (!formData.name.trim()) {
      setSignupNameError('Please enter your full name');
      hasError = true;
    }

    if (!formData.mobile.trim()) {
      setSignupMobileError('Please enter your mobile number');
      hasError = true;
    } else if (!/^[0-9]{10}$/.test(formData.mobile.replace(/[\s-]/g, ''))) {
      setSignupMobileError('Please enter a valid 10-digit mobile number');
      hasError = true;
    }

    if (!formData.email.trim()) {
      setSignupEmailError('Please enter your email address');
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setSignupEmailError('Please enter a valid email address');
      hasError = true;
    }

    if (!formData.password) {
      setSignupPasswordError('Please enter a password');
      hasError = true;
    } else if (formData.password.length < 6) {
      setSignupPasswordError('Password must be at least 6 characters');
      hasError = true;
    }

    if (!role) {
      setSignupRoleError('Please select your role');
      hasError = true;
    }

    if (role === 'BUILDER') {
      if (!formData.projectName.trim()) {
        setSignupProjectNameError('Please enter firm name');
        hasError = true;
      }
      if (!formData.propertyAddress.trim()) {
        setSignupPropertyAddressError('Please enter office address');
        hasError = true;
      }
    }

    if (hasError) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register-step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role,
          propertyType,
          lookingTo
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setShowOTPModal(true);
      } else {
        setSignupEmailError(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      setSignupEmailError("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register-step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role, propertyType, lookingTo }),
      });
      if (response.ok) {
        setCountdown(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
      }
    } catch (error) {
      console.error("Resend error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const enteredOtp = otp.join('');
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: enteredOtp }),
      });

      const data = await response.json();
      if (response.ok) {
        setIsVerified(true);
        setOtpError('');
        setTimeout(() => {
          setIsVerified(false);
          setShowOTPModal(false);
          setIsLogin(true);
          setFormData({ name: '', mobile: '', email: '', password: '', projectName: '', propertyAddress: '' });
          setOtp(['', '', '', '', '', '']);
        }, 3000);
      } else {
        setOtpError(data.message || 'Invalid OTP');
      }
    } catch (error) {
      setOtpError('Verification service unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  const onLoginSubmit = async () => {
    setLoginEmailError('');
    setLoginPasswordError('');
    setLoginCommonError('');

    let hasError = false;
    if (!formData.email) {
      setLoginEmailError('Please enter email');
      hasError = true;
    }
    if (!formData.password) {
      setLoginPasswordError('Please enter password');
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setLoginCommonError(result.error);
      } else {
        router.refresh();
      }
    } catch (error) {
      setLoginCommonError('Login service unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotStep1 = async () => {
    if (!forgotEmail) {
      setForgotError('Please enter email');
      return;
    }
    setIsLoading(true);
    setForgotError('');
    try {
      const response = await fetch('/api/auth/forgot-password-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await response.json();
      if (response.ok) {
        setForgotStep('OTP');
      } else {
        setForgotError(data.message || 'User not found');
      }
    } catch (error) {
      setForgotError('Service unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotStep2 = () => {
    if (forgotOtp.join('').length < 6) {
      setForgotError('Please enter 6-digit OTP');
      return;
    }
    setForgotStep('NEW_PW');
    setForgotError('');
  };

  const handleForgotStep3 = async () => {
    if (forgotNewPW !== forgotConfirmPW) {
      setForgotError('Passwords do not match');
      return;
    }
    if (forgotNewPW.length < 6) {
      setForgotError('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: forgotEmail, 
          otp: forgotOtp.join(''), 
          newPassword: forgotNewPW 
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsForgotSuccess(true);
        setTimeout(() => {
          setShowForgotModal(false);
          setIsForgotSuccess(false);
          setForgotStep('EMAIL');
          setForgotEmail('');
          setForgotOtp(['', '', '', '', '', '']);
          setForgotNewPW('');
          setForgotConfirmPW('');
        }, 3000);
      } else {
        setForgotError(data.message || 'Reset failed');
      }
    } catch (error) {
      setForgotError('Service unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white overflow-hidden font-sans">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? 'login-img' : 'signup-img'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
             <div 
                className="absolute inset-0 bg-cover bg-center opacity-60 transition-transform duration-1000 hover:scale-105" 
                style={{ backgroundImage: `url('${isLogin 
                  ? "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1200" 
                  : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200"
                }')` }}
             ></div>
          </motion.div>
        </AnimatePresence>
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-slate-900/10"></div>
         
         <div className="relative z-10 p-16 w-full max-w-2xl text-white">
            <div className="mb-12">
               <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <Building2 className="text-white" size={20} />
                 </div>
                 <span className="text-2xl font-black tracking-tight">Dream Properties</span>
               </div>
               <h1 className="text-5xl font-black tracking-tight mb-6 leading-tight">
                 {isLogin ? 'Welcome Back' : 'Join Our Network'}
               </h1>
               <p className="text-lg text-slate-300 leading-relaxed">
                 {isLogin 
                   ? 'Access your dashboard, manage properties, and track your real estate journey.'
                   : 'Connect with top developers, access exclusive inventory, and grow your real estate business.'}
               </p>
            </div>
         </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col h-screen overflow-y-auto bg-white">
        <div className="flex-1 w-full max-w-2xl mx-auto p-6 sm:p-12 lg:p-16">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors group mb-8"
          >
            <Home size={14} className="group-hover:-translate-y-0.5 transition-transform" />
            Back to Home
          </Link>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                    {isLogin ? 'Sign In' : 'Create Account'}
                </h1>
                <p className="text-sm font-medium text-slate-500">
                    {isLogin ? 'Enter your details to access your account' : 'Register as a builder, buyer, or owner'}
                </p>
              </div>

              <div className="space-y-3">
                {isLogin && loginCommonError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-rose-50 border border-rose-100 rounded-xl mb-4"
                  >
                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest text-center">
                      {loginCommonError}
                    </p>
                  </motion.div>
                )}
                
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-3">
                    <Input 
                      label="Full Name" 
                      placeholder="John Doe" 
                      icon={<User size={18} />} 
                      value={formData.name}
                      error={signupNameError}
                      onChange={(e) => {
                        setFormData({...formData, name: e.target.value});
                        setSignupNameError('');
                      }}
                    />
                    <Input 
                      label="Mobile Number" 
                      placeholder="+91 98765 43210" 
                      icon={<Phone size={18} />} 
                      value={formData.mobile}
                      error={signupMobileError}
                      onChange={(e) => {
                        setFormData({...formData, mobile: e.target.value});
                        setSignupMobileError('');
                      }}
                    />
                  </div>
                )}
                
                <Input 
                  label="Email Address" 
                  placeholder="name@company.com" 
                  icon={<Mail size={18} />} 
                  value={formData.email}
                  error={isLogin ? loginEmailError : signupEmailError}
                  onChange={(e) => {
                    setFormData({...formData, email: e.target.value});
                    if (isLogin) {
                      setLoginEmailError('');
                      setLoginCommonError('');
                    } else {
                      setSignupEmailError('');
                    }
                  }}
                />
                <Input 
                  label="Password" 
                  type="password" 
                  placeholder="••••••••" 
                  icon={<Lock size={18} />} 
                  value={formData.password}
                  error={isLogin ? loginPasswordError : signupPasswordError}
                  onChange={(e) => {
                    setFormData({...formData, password: e.target.value});
                    if (isLogin) {
                      setLoginPasswordError('');
                      setLoginCommonError('');
                    } else {
                      setSignupPasswordError('');
                    }
                  }}
                />
                
                {!isLogin && (
                  <div className="space-y-1.5 pt-1">
                    <Select
                      label="I AM"
                      options={ROLES}
                      value={role}
                      onChange={(val) => {
                        const newRole = val as UserRole | 'OWNER';
                        setRole(newRole);
                        setSignupRoleError('');
                        setLookingTo(newRole === UserRole.USER ? 'Buy' : 'Rent');
                      }}
                      placeholder="Select your role"
                      error={signupRoleError}
                    />
                  </div>
                )}
                
                {!isLogin && role && (
                  <>
                    {role === 'BUILDER' && (
                      <div className="space-y-3 pt-1">
                        <Input 
                          label="Firm Name" 
                          placeholder="e.g., ABC Builders Pvt Ltd" 
                          icon={<Building2 size={18} />} 
                          value={formData.projectName}
                          error={signupProjectNameError}
                          onChange={(e) => {
                            setFormData({...formData, projectName: e.target.value});
                            setSignupProjectNameError('');
                          }}
                        />
                        <Input 
                          label="Office Address" 
                          placeholder="e.g., Sector 21, Pune" 
                          icon={<Home size={18} />} 
                          value={formData.propertyAddress}
                          error={signupPropertyAddressError}
                          onChange={(e) => {
                            setFormData({...formData, propertyAddress: e.target.value});
                            setSignupPropertyAddressError('');
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2 pt-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Property Type</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {propertyTypes.map((type) => (
                          <button
                            key={type.name}
                            type="button"
                            onClick={() => setPropertyType(type.name)}
                            className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border-2 transition-all ${
                              propertyType === type.name 
                                ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm' 
                                : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                            }`}
                          >
                            <div className={propertyType === type.name ? 'text-blue-600' : 'text-slate-300'}>
                              {React.cloneElement(type.icon as React.ReactElement<any>, { size: 16 })}
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-tighter ${propertyType === type.name ? 'text-blue-600' : 'text-slate-500'}`}>
                              {type.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Looking to</label>
                      <div className={`grid grid-cols-2 gap-1.5`}>
                        {(role === UserRole.USER 
                          ? ['Buy', 'Rent'] 
                          : ['Rent', 'Sell', 'Lease', 'Resale']
                        ).map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setLookingTo(option)}
                            className={`py-2 rounded-xl border-2 font-black uppercase tracking-widest text-[10px] transition-all ${
                              lookingTo === option 
                                ? 'border-blue-600 bg-blue-50 text-blue-600' 
                                : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                
                {isLogin && (
                  <div className="flex justify-end">
                    <button onClick={() => setShowForgotModal(true)} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors">Forgot Password?</button>
                  </div>
                )}

                <Button 
                  className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] mt-6 gap-2 shadow-none" 
                  onClick={() => isLogin ? onLoginSubmit() : handleSignupSubmit()}
                  isLoading={isLoading}
                >
                  {isLogin ? 'Log In' : 'Create My Account'}
                  <ArrowRight size={16} />
                </Button>

                <div className="text-center mt-8">
                  <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={() => setIsLogin(!isLogin)} className="ml-2 text-blue-600 hover:text-blue-700 font-black border-none bg-transparent cursor-pointer p-0">{isLogin ? 'Sign Up Now' : 'Sign In Instead'}</button>
                  </p>
                </div>

                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-100">
                  <ShieldCheck size={16} className="text-slate-400" />
                  <Link 
                    href="/saas" 
                    className="text-slate-500 hover:text-blue-600 text-[10px] font-bold uppercase tracking-widest transition-colors"
                  >
                    Super Admin & SaaS Owner Login
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <Modal isOpen={showOTPModal} onClose={() => setShowOTPModal(false)} title="Verify Your Account">
        <div className="space-y-8 text-center">
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Enter OTP</h2>
            <p className="text-slate-500 text-sm font-medium">We've sent a 6-digit verification code to <span className="font-bold text-slate-900">{formData.email}</span>.</p>
          </div>
          
          <div className="flex flex-col items-center gap-4">
            <div className="flex justify-center gap-2 md:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !digit && index > 0) {
                      document.getElementById(`otp-${index - 1}`)?.focus();
                    }
                  }}
                  className={`w-10 h-12 md:w-12 md:h-14 text-center text-xl font-black bg-slate-50 border-2 rounded-xl focus:bg-white transition-all outline-none ${
                    otpError ? 'border-rose-500 text-rose-600' : 'border-slate-100 focus:border-blue-600'
                  }`}
                />
              ))}
            </div>
            
            {otpError && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[11px] font-bold text-rose-500 uppercase tracking-wider"
              >
                {otpError}
              </motion.p>
            )}
          </div>

          <div className="space-y-4">
            <Button 
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all duration-500 ${
                isVerified ? 'bg-emerald-500 hover:bg-emerald-600' : ''
              }`} 
              onClick={handleVerifyOTP}
              disabled={isVerified}
              isLoading={isLoading && !isVerified}
            >
              {isVerified ? (
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <Check size={18} strokeWidth={3} className="animate-bounce" />
                  Verified Successfully!
                </motion.div>
              ) : (
                'Verify & Register'
              )}
            </Button>
            <button 
              className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                canResend ? 'text-blue-600 hover:text-blue-700' : 'text-slate-400 cursor-not-allowed'
              }`}
              onClick={handleResendOTP}
              disabled={!canResend || isLoading}
            >
              {canResend ? 'Resend OTP' : `Resend OTP in 00:${countdown.toString().padStart(2, '0')}`}
            </button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={showForgotModal} 
        onClose={() => {
          setShowForgotModal(false);
          setForgotStep('EMAIL');
          setForgotError('');
        }} 
        title="Reset Password"
      >
        <div className="space-y-6">
          {forgotStep === 'EMAIL' && (
            <>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">Please provide your email address to receive a verification code.</p>
              <div className="space-y-4">
                <Input 
                  label="Email Address" 
                  placeholder="name@company.com" 
                  icon={<Mail size={18} />} 
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  error={forgotError}
                />
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  className="w-full py-3 rounded-xl font-black uppercase tracking-widest text-[11px]" 
                  onClick={handleForgotStep1}
                  isLoading={isLoading}
                >
                  Send Verification Code
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full py-3 rounded-xl font-black uppercase tracking-widest text-[11px] gap-2" 
                  onClick={() => setShowForgotModal(false)}
                >
                  <ArrowLeft size={16} /> Back to Sign In
                </Button>
              </div>
            </>
          )}

          {forgotStep === 'OTP' && (
            <>
              <div className="text-center space-y-2">
                <p className="text-slate-500 text-sm font-medium">Enter the 6-digit code sent to your email.</p>
                <div className="flex justify-center gap-2">
                  {forgotOtp.map((digit, index) => (
                    <input
                      key={index}
                      id={`forgot-otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.length > 1 || isNaN(Number(val))) return;
                        const newOtp = [...forgotOtp];
                        newOtp[index] = val;
                        setForgotOtp(newOtp);
                        setForgotError('');
                        if (val && index < 5) document.getElementById(`forgot-otp-${index + 1}`)?.focus();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && index > 0) {
                          document.getElementById(`forgot-otp-${index - 1}`)?.focus();
                        }
                      }}
                      className="w-10 h-12 text-center text-xl font-black bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all"
                    />
                  ))}
                </div>
                {forgotError && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-wider">{forgotError}</p>}
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  className="w-full py-3 rounded-xl font-black uppercase tracking-widest text-[11px]" 
                  onClick={handleForgotStep2}
                >
                  Verify OTP
                </Button>
                <button onClick={() => setForgotStep('EMAIL')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
                  Wrong Email? Go Back
                </button>
              </div>
            </>
          )}

          {forgotStep === 'NEW_PW' && (
            <>
              <p className="text-slate-500 text-sm font-medium">Create a strong new password for your account.</p>
              <div className="space-y-4">
                <Input 
                  label="New Password" 
                  type="password"
                  placeholder="••••••••" 
                  icon={<Lock size={18} />} 
                  value={forgotNewPW}
                  onChange={(e) => setForgotNewPW(e.target.value)}
                />
                <Input 
                  label="Confirm New Password" 
                  type="password"
                  placeholder="••••••••" 
                  icon={<ShieldCheck size={18} />} 
                  value={forgotConfirmPW}
                  onChange={(e) => setForgotConfirmPW(e.target.value)}
                  error={forgotError}
                />
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all duration-500 ${
                    isForgotSuccess ? 'bg-emerald-500 hover:bg-emerald-600' : ''
                  }`} 
                  onClick={handleForgotStep3}
                  isLoading={isLoading}
                  disabled={isForgotSuccess}
                >
                  {isForgotSuccess ? (
                    <motion.div 
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <Check size={18} strokeWidth={3} className="animate-bounce" />
                      Reset Successfully!
                    </motion.div>
                  ) : (
                    'Reset Password'
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
