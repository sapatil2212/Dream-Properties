'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, ShieldCheck, Check, Shield, Phone, Building2, Briefcase } from 'lucide-react';
import { Input, Button, Modal } from '@/components/UIComponents';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DashboardSettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const user = session?.user;

  // Redirect regular users to their profile page
  useEffect(() => {
    if (user?.role === 'USER' || user?.role === 'BUYER') {
      router.push('/dashboard/profile/settings');
    }
  }, [user, router]);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
    email: user?.email || '',
    firmName: user?.firmName || '',
    officeAddress: user?.officeAddress || '',
  });

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpType, setOtpType] = useState<'email' | 'password'>('email');
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isCurrentPasswordVerified, setIsCurrentPasswordVerified] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        mobile: user.mobile || '',
        email: user.email || '',
        firmName: user.firmName || '',
        officeAddress: user.officeAddress || '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/dashboard/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        await updateSession({ 
          ...session, 
          user: { 
            ...session?.user, 
            name: formData.name, 
            mobile: formData.mobile,
            firmName: formData.firmName,
            officeAddress: formData.officeAddress
          } 
        });
        setSuccessMessage('Your profile has been updated successfully.');
        setShowSuccessModal(true);
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update profile');
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
      const response = await fetch('/api/dashboard/profile/verify-password', {
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
      const response = await fetch('/api/dashboard/profile/request-otp', {
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
      const response = await fetch('/api/dashboard/profile/request-otp', {
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

      const response = await fetch(`/api/dashboard/profile/${endpoint}`, {
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
            setFormData(prev => ({ ...prev, email: newEmail }));
            updateSession({ ...session, user: { ...session?.user, email: newEmail } });
            setIsEditingEmail(false);
          }
          if (otpType === 'password') {
            setIsEditingPassword(false);
            setNewPassword('');
            setConfirmPassword('');
            setCurrentPassword('');
            setIsCurrentPasswordVerified(false);
          }
          setSuccessMessage(`${otpType === 'email' ? 'Email' : 'Password'} updated successfully!`);
          setShowSuccessModal(true);
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

  if (!user || user.role === 'USER' || user.role === 'BUYER') {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your professional profile and security settings</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Personal Information</h2>
                <p className="text-xs text-slate-500">Update your personal details</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input 
                  label="Full Name *" 
                  value={formData.name} 
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  icon={<User size={18} />} 
                />
                <Input 
                  label="Mobile Number *" 
                  value={formData.mobile} 
                  onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                  icon={<Phone size={18} />} 
                />
              </div>

              {/* Business Information - Only for Builder/Admin roles */}
              {(user.role === 'BUILDER' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                <>
                  <Input 
                    label={user.role === 'BUILDER' ? 'Firm/Company Name' : 'Organization Name'}
                    value={formData.firmName} 
                    onChange={(e) => setFormData(prev => ({ ...prev, firmName: e.target.value }))}
                    icon={<Building2 size={18} />} 
                    placeholder="e.g., ABC Builders Pvt. Ltd."
                  />
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-2 block">Office Address</label>
                    <textarea
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium resize-none"
                      rows={3}
                      value={formData.officeAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, officeAddress: e.target.value }))}
                      placeholder="Complete office address with city and pincode"
                    />
                  </div>
                </>
              )}

              <Button 
                onClick={handleUpdateProfile} 
                isLoading={isLoading} 
                className="w-full sm:w-auto px-8"
              >
                Save Changes
              </Button>
            </div>
          </section>

          {/* Security Section */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Security & Access</h2>
                <p className="text-xs text-slate-500">Manage your login credentials</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Email Section */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-bold uppercase text-slate-600">Email Address</label>
                  <span className="text-xs font-bold text-emerald-500 uppercase flex items-center gap-1">
                    <Check size={12} /> Verified
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <Mail size={16} className="text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">{formData.email}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditingEmail(!isEditingEmail)}
                  className="w-full"
                >
                  {isEditingEmail ? 'Cancel' : 'Change Email'}
                </Button>
                
                <AnimatePresence>
                  {isEditingEmail && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 mt-3"
                    >
                      <Input 
                        label="New Email" 
                        placeholder="new.email@company.com" 
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        icon={<Mail size={16} />}
                      />
                      <Button 
                        onClick={handleRequestEmailChange} 
                        isLoading={isLoading}
                        size="sm"
                        className="w-full"
                      >
                        Send Verification Code
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Password Section */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <label className="text-xs font-bold uppercase text-slate-600 mb-3 block">Password</label>
                <div className="flex items-center gap-3 mb-3">
                  <Lock size={16} className="text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">••••••••</span>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditingPassword(!isEditingPassword);
                    setIsCurrentPasswordVerified(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError('');
                  }}
                  className="w-full"
                >
                  {isEditingPassword ? 'Cancel' : 'Update Password'}
                </Button>

                <AnimatePresence>
                  {isEditingPassword && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 mt-3"
                    >
                      {!isCurrentPasswordVerified ? (
                        <>
                          <Input 
                            label="Current Password" 
                            type="password"
                            placeholder="Enter current password" 
                            value={currentPassword}
                            onChange={(e) => {
                              setCurrentPassword(e.target.value);
                              setPasswordError('');
                            }}
                            icon={<Lock size={16} />}
                            error={passwordError}
                          />
                          <Button 
                            onClick={handleVerifyCurrentPassword} 
                            isLoading={isLoading}
                            size="sm"
                            className="w-full"
                          >
                            Verify Current Password
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-700">
                            <ShieldCheck size={16} />
                            <span className="text-xs font-bold">Current password verified</span>
                          </div>
                          <Input 
                            label="New Password" 
                            type="password"
                            placeholder="Enter new password" 
                            value={newPassword}
                            onChange={(e) => {
                              setNewPassword(e.target.value);
                              setPasswordError('');
                            }}
                            icon={<Lock size={16} />}
                          />
                          <Input 
                            label="Confirm Password" 
                            type="password"
                            placeholder="Confirm new password" 
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              setPasswordError('');
                            }}
                            icon={<ShieldCheck size={16} />}
                            error={passwordError}
                          />
                          <Button 
                            onClick={handleRequestPasswordChange} 
                            isLoading={isLoading}
                            size="sm"
                            className="w-full bg-rose-600 hover:bg-rose-700"
                          >
                            Update Password
                          </Button>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - Role Info */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <Briefcase size={28} />
            </div>
            <h3 className="text-lg font-bold mb-2">Your Role</h3>
            <p className="text-2xl font-black mb-4">{user.role.replace('_', ' ')}</p>
            <p className="text-sm text-blue-100">
              You have {user.role === 'SUPER_ADMIN' ? 'full system' : user.role === 'ADMIN' ? 'administrative' : 'professional'} access to the platform.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-3">Security Tips</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <Check size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Use a strong, unique password</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Keep your email address updated</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>Never share your credentials</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Modal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)}
        title="Update Successful"
      >
        <div className="text-center space-y-4 py-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <Check size={32} strokeWidth={3} />
          </div>
          <p className="text-sm text-slate-600 font-medium">{successMessage}</p>
          <Button onClick={() => setShowSuccessModal(false)} className="w-full">
            Great, Thanks!
          </Button>
        </div>
      </Modal>

      {/* OTP Verification Modal */}
      <Modal 
        isOpen={showOtpModal} 
        onClose={() => setShowOtpModal(false)} 
        title={`Verify ${otpType === 'email' ? 'New Email' : 'Identity'}`}
      >
        <div className="text-center space-y-6">
          <p className="text-sm text-slate-500">
            We've sent a 6-digit code to {otpType === 'email' ? 'your new email' : 'your current email'}. Please enter it below.
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
                  if (val && index < 5) document.getElementById(`dashboard-otp-${index+1}`)?.focus();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !digit && index > 0) {
                    document.getElementById(`dashboard-otp-${index - 1}`)?.focus();
                  }
                }}
                id={`dashboard-otp-${index}`}
                className="w-12 h-14 text-center text-xl font-black bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-blue-600 focus:bg-white outline-none transition-all"
              />
            ))}
          </div>

          <Button 
            className={`w-full py-4 rounded-xl ${isVerified ? 'bg-emerald-500' : ''}`}
            onClick={handleVerifyOtp}
            disabled={isVerified || isLoading}
          >
            {isVerified ? (
              <span className="flex items-center justify-center gap-2">
                <Check size={18} /> Verified
              </span>
            ) : (
              'Confirm Update'
            )}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
