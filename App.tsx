import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { UserRole } from './types.ts';
import { Sidebar, DashboardHeader } from './components/LayoutComponents.tsx';
import { HomePage } from './pages/Home.tsx';
import { PropertyListingPage } from './pages/Properties.tsx';
import { PropertyDetailsPage } from './pages/PropertyDetails.tsx';
import { CategoryDetailPage } from './pages/CategoryDetailPage.tsx';
import { NotFoundPage } from './pages/NotFound.tsx';
import { AboutPage } from './pages/About.tsx';
import { ContactPage } from './pages/Contact.tsx';
import { PrivacyPolicy } from './pages/PrivacyPolicy.tsx';
import { TermsOfService } from './pages/TermsOfService.tsx';
import { SaasAuth } from './pages/SaasAuth/SaasAuth.tsx';
import { AccountSettings } from './pages/Profile/AccountSettings.tsx';
import { PropertiesInterested } from './pages/Profile/PropertiesInterested.tsx';
import { 
  SuperAdminDashboard, BuilderDashboard, TelecallerDashboard, SalesExecutiveDashboard,
  BuildersManagement, InventoryManagement, LeadsHub, UserManagement, FinanceView, ReportsView, SettingsView
} from './pages/DashboardPages.tsx';
import { Card, Button, Input, Modal } from './components/UIComponents.tsx';
import { QuickBanner } from './components/QuickBanner.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { Mail, Lock, User, ArrowRight, Key, ArrowLeft, Home, Phone, Building2, ShoppingBag, Monitor, Warehouse, Maximize, MoreHorizontal, Check, ShieldCheck, Heart, Settings, LogOut, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const AuthPage: React.FC<{ onLogin: (role: UserRole, user: any) => void, currentUser: any }> = ({ onLogin, currentUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === UserRole.BUYER) {
        window.location.hash = '#/';
      } else {
        window.location.hash = '#/dashboard';
      }
    }
  }, [currentUser]);
  const [role, setRole] = useState<UserRole | ''>('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [propertyType, setPropertyType] = useState('Residential');
  const [lookingTo, setLookingTo] = useState('Buy');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [loginEmailError, setLoginEmailError] = useState('');
  const [loginPasswordError, setLoginPasswordError] = useState('');
  const [loginCommonError, setLoginCommonError] = useState('');
  
  // Sign-up form errors
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

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    projectName: '',
    propertyAddress: ''
  });

  const propertyTypes = [
    { name: 'Residential', icon: <Home size={20} /> },
    { name: 'Office', icon: <Building2 size={20} /> },
    { name: 'Retail Shop', icon: <ShoppingBag size={20} /> },
    { name: 'Showroom', icon: <Monitor size={20} /> },
    { name: 'Warehouse', icon: <Warehouse size={20} /> },
    { name: 'Plot', icon: <Maximize size={20} /> },
    { name: 'Others', icon: <MoreHorizontal size={20} /> },
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
    setOtpError(''); // Clear error when typing

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSignupSubmit = async () => {
    // Clear all previous errors
    setSignupNameError('');
    setSignupMobileError('');
    setSignupEmailError('');
    setSignupPasswordError('');
    setSignupRoleError('');
    setSignupProjectNameError('');
    setSignupPropertyAddressError('');

    let hasError = false;

    // Validate all required fields
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

    // Validate builder-specific fields
    if (role === UserRole.BUILDER) {
      if (!formData.projectName.trim()) {
        setSignupProjectNameError('Please enter project name');
        hasError = true;
      }
      if (!formData.propertyAddress.trim()) {
        setSignupPropertyAddressError('Please enter property address');
        hasError = true;
      }
    }

    if (hasError) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register-step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
        setGeneratedOtp(''); // Backend manages OTP now, we just verify the user's input
      } else {
        // Show server-side validation errors
        if (data.message.toLowerCase().includes('email')) {
          setSignupEmailError(data.message);
        } else {
          setSignupEmailError(data.message || "Registration failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      setSignupEmailError("Server error. Please ensure backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register-step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await response.json();
      if (response.ok) {
        onLogin(data.user.role as UserRole, data.user);
      } else {
        // Show common error for invalid credentials
        setLoginCommonError('Invalid credentials');
        setLoginEmailError('');
        setLoginPasswordError('');
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
      const response = await fetch('http://localhost:5000/api/auth/forgot-password-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8">
      <motion.div 
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`bg-white w-full max-w-5xl flex flex-col ${isLogin ? 'md:flex-row' : 'md:flex-row-reverse'} rounded-[2.5rem] overflow-hidden border border-slate-200 min-h-[650px]`}
      >
        <motion.div layout className="w-full md:w-1/2 relative hidden md:block">
          <img 
            src={isLogin 
              ? "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=1200" 
              : "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200"
            } 
            alt="Luxury Real Estate" className="absolute inset-0 w-full h-full object-cover"
          />
        </motion.div>

        <motion.div layout className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center items-center bg-white relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm mt-4"
            >
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors group mb-4"
              >
                <Home size={14} className="group-hover:-translate-y-0.5 transition-transform" />
                Back to Home
              </Link>
              <div className="mb-6 text-center md:text-left">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 mb-1 uppercase tracking-tight">{isLogin ? 'Sign In' : 'Create Account'}</h1>
                <p className="text-slate-400 text-[11px] font-medium">{isLogin ? 'Enter your credentials to access your dashboard' : 'Register as a builder or buyer to get started'}</p>
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
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">I AM</label>
                    <select
                      value={role}
                      onChange={(e) => {
                        const newRole = e.target.value as UserRole;
                        setRole(newRole);
                        setSignupRoleError('');
                        // Reset lookingTo based on role
                        setLookingTo(newRole === UserRole.BUYER ? 'Buy' : 'Rent');
                      }}
                      className={`w-full p-2.5 bg-slate-50 border rounded-xl text-[13px] font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none ${
                        signupRoleError ? 'border-red-500' : 'border-slate-200'
                      }`}
                    >
                      <option value="" disabled>Select your role</option>
                      <option value={UserRole.BUYER}>Buyer / User</option>
                      <option value={UserRole.BUILDER}>Owner / Builder</option>
                    </select>
                    {signupRoleError && (
                      <p className="text-[10px] text-red-500 mt-1">{signupRoleError}</p>
                    )}
                  </div>
                )}
                
                {!isLogin && role && (
                  <>
                    {role === UserRole.BUILDER && (
                      <div className="space-y-3 pt-1">
                        <Input 
                          label="Project Name" 
                          placeholder="e.g., Dream Heights Residency" 
                          icon={<Building2 size={18} />} 
                          value={formData.projectName}
                          error={signupProjectNameError}
                          onChange={(e) => {
                            setFormData({...formData, projectName: e.target.value});
                            setSignupProjectNameError('');
                          }}
                        />
                        <Input 
                          label="Property Address" 
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
                              {React.cloneElement(type.icon as React.ReactElement, { size: 16 })}
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
                      <div className={`grid ${role === UserRole.BUYER ? 'grid-cols-2' : 'grid-cols-2'} gap-1.5`}>
                        {(role === UserRole.BUYER 
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
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>

      <Modal isOpen={showOTPModal} onClose={() => setShowOTPModal(false)} title="Verify Your Account">
        <div className="space-y-8 text-center">
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Enter OTP</h2>
            <p className="text-slate-500 text-sm font-medium">We've sent a 6-digit verification code to your mobile number.</p>
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
};

const Layout: React.FC<{ 
  children: React.ReactNode, 
  role: UserRole | null, 
  user: any | null,
  onLogout: () => void 
}> = ({ children, role, user, onLogout }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAuthPage = location.pathname === '/login';

  if (isAuthPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  if (!isDashboard) {
    return (
      <div className="flex flex-col min-h-screen">
        <QuickBanner />
        <Navbar 
          onAuthClick={() => window.location.hash = '#/login'} 
          user={user}
          onLogout={onLogout}
        />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    );
  }

  if (!role) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} collapsed={collapsed} setCollapsed={setCollapsed} onLogout={onLogout} />
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        <DashboardHeader 
          title={location.pathname.split('/').pop()?.replace('-', ' ').toUpperCase() || 'DASHBOARD'} 
          user={{ name: user?.name || 'User', role }} 
        />
        <main className="p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id?: number; name: string; email: string; mobile?: string; role: UserRole } | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/profile/me', {
          credentials: 'include'
        });
        if (response.ok) {
          const user = await response.json();
          console.log('Session restored with user data:', user); // Debug log
          setCurrentUser(user);
          setUserRole(user.role);
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogin = (role: UserRole, user?: any) => {
    console.log('Login successful, user data:', user); // Debug log
    setUserRole(role);
    if (user) {
      setCurrentUser(user);
    }
    
    if (role === UserRole.BUYER) {
      window.location.hash = '#/';
    } else {
      window.location.hash = '#/dashboard';
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    }
    setUserRole(null);
    setCurrentUser(null);
    window.location.hash = '#/';
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Restoring Session...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <ScrollToTop />
      <Layout role={userRole} user={currentUser} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertyListingPage />} />
          <Route path="/properties/:id" element={<PropertyDetailsPage />} />
          <Route path="/category/:slug" element={<CategoryDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/saas-portal" element={<SaasAuth onLogin={handleLogin} currentUser={currentUser} />} />
          <Route path="/login" element={<AuthPage onLogin={handleLogin} currentUser={currentUser} />} />
          <Route path="/account-settings" element={<AccountSettings user={currentUser} onUpdateUser={setCurrentUser} />} />
          <Route path="/properties-interested" element={<PropertiesInterested />} />
          
          {/* Dashboard Sub-routes */}
          <Route path="/dashboard" element={
            userRole === UserRole.SUPER_ADMIN ? <SuperAdminDashboard /> :
            userRole === UserRole.ADMIN ? <SuperAdminDashboard /> :
            userRole === UserRole.BUILDER ? <BuilderDashboard /> :
            userRole === UserRole.TELECALLER ? <TelecallerDashboard /> :
            userRole === UserRole.SALES_EXECUTIVE ? <SalesExecutiveDashboard /> :
            <Navigate to="/login" replace />
          } />
          
          <Route path="/dashboard/builders" element={<BuildersManagement />} />
          <Route path="/dashboard/properties" element={<InventoryManagement />} />
          <Route path="/dashboard/leads" element={<LeadsHub />} />
          <Route path="/dashboard/follow-ups" element={<LeadsHub />} />
          <Route path="/dashboard/site-visits" element={<LeadsHub />} />
          <Route path="/dashboard/users" element={<UserManagement />} />
          <Route path="/dashboard/employees" element={<UserManagement />} />
          <Route path="/dashboard/billing" element={<FinanceView />} />
          <Route path="/dashboard/finance" element={<FinanceView />} />
          <Route path="/dashboard/reports" element={<ReportsView />} />
          <Route path="/dashboard/settings" element={<SettingsView />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;