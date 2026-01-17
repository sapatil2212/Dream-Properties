'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, ShieldCheck, Check, Shield, ArrowLeft, Phone } from 'lucide-react';
import { Input, Button, Modal } from '@/components/UIComponents';
import { useSession } from 'next-auth/react';

export default function AccountSettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const user = session?.user;

  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpType, setOtpType] = useState<'email' | 'password'>('email');
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setMobile(user.mobile || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isCurrentPasswordVerified, setIsCurrentPasswordVerified] = useState(false);

  // Forgot Password Flow State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'EMAIL' | 'OTP' | 'NEW_PW'>('EMAIL');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState(['', '', '', '', '', '']);
  const [forgotNewPW, setForgotNewPW] = useState('');
  const [forgotConfirmPW, setForgotConfirmPW] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [isForgotSuccess, setIsForgotSuccess] = useState(false);

  const handleUpdateName = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/profile/update-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile }),
      });
      if (response.ok) {
        await updateSession({ ...session, user: { ...session?.user, name, mobile } });
        setSuccessMessage('Your profile has been updated successfully.');
        setShowSuccessModal(true);
      } else {
        alert('Failed to update profile');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCurrentPassword = async () => {
    if (!currentPassword) {
      setPasswordError('Please enter your current password');
      return;
    }
    setIsLoading(true);
    setPasswordError('');
    try {
      const response = await fetch('/api/profile/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: currentPassword }),
      });
      if (response.ok) {
        setIsCurrentPasswordVerified(true);
      } else {
        const data = await response.json();
        setPasswordError(data.message || 'Incorrect password');
      }
    } catch (err) {
      setPasswordError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestEmailChange = async () => {
    if (!newEmail || newEmail === user?.email) {
      alert('Please enter a different email address');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/profile/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, type: 'email' }),
      });
      if (response.ok) {
        setOtpType('email');
        setShowOtpModal(true);
      } else {
        alert('Failed to send OTP');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPasswordChange = async () => {
    if (!newPassword || !confirmPassword) {
      setPasswordError('Please fill all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/profile/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email, type: 'password' }),
      });
      if (response.ok) {
        setOtpType('password');
        setShowOtpModal(true);
      } else {
        alert('Failed to send OTP');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('');
    setIsLoading(true);
    try {
      const endpoint = otpType === 'email' ? 'update-email' : 'update-password';
      const body = otpType === 'email' 
        ? { newEmail, otp: enteredOtp }
        : { currentEmail: user?.email, newPassword, otp: enteredOtp };

      const response = await fetch(`/api/profile/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setIsVerified(true);
        setTimeout(() => {
          setIsVerified(false);
          setShowOtpModal(false);
          if (otpType === 'email') {
            setEmail(newEmail);
            updateSession({ ...session, user: { ...session?.user, email: newEmail } });
            setIsEditingEmail(false);
          }
          if (otpType === 'password') {
            setIsEditingPassword(false);
          }
        }, 2000);
      } else {
        const data = await response.json();
        alert(data.message || 'Verification failed');
      }
    } catch (err) {
      alert('Network error');
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

  if (!user) return null;

  return (
    <div className="max-w-[95%] mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Account Settings</h1>
        <p className="text-slate-500 text-sm font-medium">Manage your profile and security settings</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <section className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <User size={20} />
              </div>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Personal Information</h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input 
                  label="Full Name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  icon={<User size={18} />} 
                />
                <Input 
                  label="Mobile Number" 
                  value={mobile} 
                  onChange={(e) => setMobile(e.target.value)} 
                  icon={<Phone size={18} />} 
                />
              </div>
              <Button onClick={handleUpdateName} isLoading={isLoading} className="px-8 rounded-xl font-black uppercase text-[10px] tracking-widest">
                Save Changes
              </Button>
            </div>
          </section>

          <section className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                <ShieldCheck size={20} />
              </div>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Security & Access</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-0.5">
                    <Check size={10} /> Verified
                  </span>
                </div>
                <div className="space-y-3 flex-1">
                  <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 flex items-center gap-2 truncate">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{email}</span>
                  </div>
                  <Button variant="outline" onClick={() => setIsEditingEmail(!isEditingEmail)} className="w-full rounded-xl font-black uppercase text-[8px] tracking-widest py-2 border-slate-200">
                    {isEditingEmail ? 'Cancel' : 'Change Email'}
                  </Button>
                  
                  <AnimatePresence>
                    {isEditingEmail && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 pt-2 overflow-hidden"
                      >
                        <Input 
                          label="New Email" 
                          placeholder="New email" 
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          icon={<Mail size={14} />}
                          className="py-2 text-xs"
                        />
                        <Button onClick={handleRequestEmailChange} isLoading={isLoading} className="w-full rounded-xl font-black uppercase text-[8px] tracking-widest py-2.5">
                          Verify
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Password</label>
                <div className="space-y-3 flex-1">
                  <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 flex items-center gap-2">
                    <Lock size={14} className="text-slate-400 shrink-0" />
                    ••••••••
                  </div>
                  <Button variant="outline" onClick={() => {
                    setIsEditingPassword(!isEditingPassword);
                    setIsCurrentPasswordVerified(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError('');
                  }} className="w-full rounded-xl font-black uppercase text-[8px] tracking-widest py-2 border-slate-200">
                    {isEditingPassword ? 'Cancel' : 'Update Password'}
                  </Button>

                  <AnimatePresence>
                    {isEditingPassword && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 pt-2 overflow-hidden"
                      >
                        {!isCurrentPasswordVerified ? (
                          <div className="space-y-3">
                            <Input 
                              label="Current" 
                              type="password"
                              placeholder="Current PW" 
                              value={currentPassword}
                              onChange={(e) => {
                                setCurrentPassword(e.target.value);
                                setPasswordError('');
                              }}
                              icon={<Lock size={14} />}
                              error={passwordError}
                              className="py-2 text-xs"
                            />
                            <div className="flex flex-col gap-2">
                              <button 
                                onClick={() => setShowForgotModal(true)}
                                className="text-[8px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors text-left"
                              >
                                Forgot?
                              </button>
                              <Button 
                                onClick={handleVerifyCurrentPassword} 
                                isLoading={isLoading} 
                                className="w-full rounded-xl font-black uppercase text-[8px] tracking-widest py-2"
                              >
                                Verify
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-2 text-emerald-600">
                              <ShieldCheck size={14} />
                              <span className="text-[8px] font-black uppercase tracking-widest">Verified</span>
                            </div>
                            <Input 
                              label="New" 
                              type="password"
                              placeholder="New PW" 
                              value={newPassword}
                              onChange={(e) => {
                                setNewPassword(e.target.value);
                                setPasswordError('');
                              }}
                              icon={<Lock size={14} />}
                              className="py-2 text-xs"
                            />
                            <Input 
                              label="Confirm" 
                              type="password"
                              placeholder="Confirm" 
                              value={confirmPassword}
                              onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                setPasswordError('');
                              }}
                              icon={<ShieldCheck size={14} />}
                              error={passwordError}
                              className="py-2 text-xs"
                            />
                            <Button 
                              onClick={handleRequestPasswordChange} 
                              isLoading={isLoading} 
                              className="w-full rounded-xl font-black uppercase text-[8px] tracking-widest py-2 bg-rose-600 hover:bg-rose-700"
                            >
                              Update
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="hidden lg:block h-full min-h-[500px] sticky top-12">
          <div className="relative h-full w-full rounded-[3rem] overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200" 
              alt="Security" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
            <div className="absolute bottom-10 left-10 right-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-4">
                <Shield className="text-blue-400" size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Secure Access</span>
              </div>
              <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Protect Your Account</h3>
              <p className="text-slate-300 text-sm font-medium leading-relaxed">
                Maintain the highest level of security by regularly updating your credentials and verifying your identity.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)}
        title="Update Successful"
      >
        <div className="text-center space-y-4 py-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <Check size={32} strokeWidth={3} />
          </div>
          <p className="text-sm text-slate-600 font-medium">
            {successMessage}
          </p>
          <Button 
            onClick={() => setShowSuccessModal(false)}
            className="w-full rounded-xl font-black uppercase text-[10px] tracking-widest py-3"
          >
            Great, Thanks!
          </Button>
        </div>
      </Modal>

      <Modal 
        isOpen={showOtpModal} 
        onClose={() => setShowOtpModal(false)} 
        title={`Verify ${otpType === 'email' ? 'New Email' : 'Identity'}`}
      >
        <div className="text-center space-y-6">
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            We've sent a 6-digit code to {otpType === 'email' ? 'your new email' : 'your current email'}.<br/>Please enter it below to confirm.
          </p>
          
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.length > 1 || isNaN(Number(val))) return;
                  const newOtp = [...otp];
                  newOtp[index] = val;
                  setOtp(newOtp);
                  if (val && index < 5) document.getElementById(`otp-set-${index+1}`)?.focus();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !digit && index > 0) {
                    document.getElementById(`otp-set-${index - 1}`)?.focus();
                  }
                }}
                id={`otp-set-${index}`}
                className="w-10 h-12 text-center text-xl font-black bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-blue-600 outline-none transition-all"
              />
            ))}
          </div>

          <Button 
            className={`w-full py-4 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all ${isVerified ? 'bg-emerald-500' : ''}`}
            onClick={handleVerifyOtp}
            disabled={isVerified || isLoading}
          >
            {isVerified ? (
              <span className="flex items-center justify-center gap-2"><Check size={18} /> Verified</span>
            ) : (
              'Confirm Update'
            )}
          </Button>
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
                  <ArrowLeft size={16} /> Back
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
                      id={`forgot-otp-set-${index}`}
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
                        if (val && index < 5) document.getElementById(`forgot-otp-set-${index + 1}`)?.focus();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && index > 0) {
                          document.getElementById(`forgot-otp-set-${index - 1}`)?.focus();
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
                      className="flex items-center justify-center gap-2"
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
