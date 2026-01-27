'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Select } from '@/components/UIComponents';
import { Users, MapPin, CreditCard, ShieldCheck, Briefcase, ChevronLeft, X, CheckCircle } from 'lucide-react';

const PARTNER_TYPES = [
  "Individual Broker",
  "Channel Partner Firm",
  "Referral Partner",
  "Digital Channel Partner",
  "Corporate Channel Partner"
];

const STATES = [
  "Maharashtra", "Delhi", "Karnataka", "Telangana", "Tamil Nadu", "Gujarat", "Uttar Pradesh", "Rajasthan", "West Bengal", "Madhya Pradesh", "Other"
];

const PROPERTY_TYPES = ["Residential", "Commercial", "Industrial", "Land/Plots"];

export default function PartnerRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    // Common
    name: '',
    email: '',
    mobile: '',
    city: '',
    state: '',
    partnerType: 'Individual Broker',
    password: '',
    confirmPassword: '',
    agreementAccepted: false,

    // Individual Broker
    brokerLicense: '',
    yearsOfExperience: '',
    primaryOperatingArea: '', 
    preferredPropertyType: [] as string[],

    // Firm / Agency
    firmName: '',
    firmRegistrationNumber: '',
    firmAddress: '',
    authorizedPersonName: '',
    authorizedPersonMobile: '',
    authorizedPersonEmail: '',
    numberOfAgents: '',
    
    // Referral
    profession: '',
    organizationName: '',
    relationshipType: '',

    // Digital
    companyName: '',
    websiteUrl: '',
    leadSourceType: [] as string[],
    monthlyLeadCapacity: '',
    technicalContactPerson: '',
    technicalContactEmail: '',
    billingType: '',

    // Corporate
    corporateRegistrationNumber: '',
    authorizedSignatoryName: '',
    authorizedSignatoryEmail: '',
    authorizedSignatoryPhone: '',
    contractValidityPeriod: '',

    // Common Optional
    gstNumber: '',

    // Bank
    bankName: '',
    accountNumber: '',
    ifscCode: ''
  });

  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // OTP State
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [emailOtp, setEmailOtp] = useState(['', '', '', '', '', '']);
  // const [mobileOtp, setMobileOtp] = useState(''); // Mobile OTP disabled
  const [verifying, setVerifying] = useState(false);

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...emailOtp];
    newOtp[index] = value;
    setEmailOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !emailOtp[index] && index > 0) {
        const prevInput = document.getElementById(`otp-${index - 1}`);
        if (prevInput) prevInput.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleMultiSelect = (field: string, value: string) => {
    setFormData(prev => {
      const list = prev[field as keyof typeof prev] as string[];
      if (list.includes(value)) {
        return { ...prev, [field]: list.filter(i => i !== value) };
      } else {
        return { ...prev, [field]: [...list, value] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!formData.agreementAccepted) {
      setError("Please accept the Terms & Agreements");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register-partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      
      setShowOTPModal(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setVerifying(true);
    setError('');
    
    try {
        const res = await fetch('/api/auth/verify-partner-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: formData.email,
                emailOtp: emailOtp.join(''),
                // mobileOtp
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Verification failed');

        setShowOTPModal(false);
        setSuccess(true);
    } catch (err: any) {
        setError(err.message);
    } finally {
        setVerifying(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-100">
           <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 mb-6">
             <ShieldCheck className="h-8 w-8 text-emerald-600" />
           </div>
           <h2 className="text-2xl font-black text-slate-900 mb-2">Application Submitted</h2>
           <p className="text-sm text-slate-500 mb-8">
             Your application has been received. Our team will review your details and contact you shortly.
           </p>
           <Button onClick={() => router.push('/dashboard')} className="w-full">
             Go to Dashboard
           </Button>
        </div>
      </div>
    );
  }

  const inputClass = "text-xs py-2 px-3 h-9"; // Helper class for smaller inputs if needed, though Input component has its own styles. 
  // Since Input component styles are encapsulated, we rely on its internal sizing or pass className.
  // The UIComponents Input uses `px-3.5 py-2 text-[13px]`. That's already quite compact. 
  // We will just use the standard Input and Select.

  return (
    <div className="min-h-screen flex bg-white overflow-hidden font-sans">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
         <div 
            className="absolute inset-0 bg-cover bg-center opacity-60 transition-transform duration-1000 hover:scale-105" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }}
         ></div>
         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-slate-900/10"></div>
         
         <div className="relative z-10 p-16 w-full max-w-2xl text-white">
            <div className="mb-12">
               <div className="flex items-center gap-3 mb-8">
                 <img src="/assets/dp-logo.png" alt="Dream Properties" className="h-12 w-auto bg-white rounded-lg p-1" />
               </div>
               <h1 className="text-5xl font-black tracking-tight mb-6 leading-tight">
                 Join Our Elite <br/>
                 <span className="text-blue-500">Partner Network</span>
               </h1>
               <p className="text-lg text-slate-300 leading-relaxed">
                 Connect with top developers, access exclusive inventory, and grow your real estate business with our premium platform.
               </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
               <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-blue-600 transition-colors">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="font-black text-2xl">500+</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Partners</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-blue-600 transition-colors">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <p className="font-black text-2xl">₹100Cr+</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deals Closed</p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col h-screen overflow-y-auto bg-white">
        <div className="flex-1 w-full max-w-2xl mx-auto p-6 sm:p-12 lg:p-16">
            <Link href="/" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 mb-10 transition-colors">
              <ChevronLeft size={14} className="mr-1" /> Back to Home
            </Link>
            
            <div className="mb-10">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Partner Registration</h2>
              <p className="text-sm font-medium text-slate-500">Enter your details to create your partner account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <X size={14} /> {error}
                </div>
              )}

              {/* Basic Info */}
              <div className="space-y-5">
                 <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Users size={14} className="text-blue-600" /> Basic Information
                 </h3>
                 
                 <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Input label="Full Name" required name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className="h-10" />
                    <Input label="Mobile Number" required name="mobile" value={formData.mobile} onChange={handleChange} placeholder="+91 9876543210" className="h-10" />
                    <Input label="Email Address" type="email" required name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" className="h-10" />
                    
                    <Select
                      label="State"
                      options={STATES.map(s => ({ label: s, value: s }))}
                      value={formData.state}
                      onChange={(val) => handleSelectChange('state', val)}
                      placeholder="Select State"
                    />
                    
                    <Input label="City" required name="city" value={formData.city} onChange={handleChange} placeholder="Mumbai" className="h-10" />

                    <div className="sm:col-span-2">
                      <Select
                        label="Partner Type"
                        options={PARTNER_TYPES.map(t => ({ label: t, value: t }))}
                        value={formData.partnerType}
                        onChange={(val) => handleSelectChange('partnerType', val)}
                      />
                    </div>
                 </div>
              </div>

              {/* Professional Details */}
              <div className="space-y-5">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Briefcase size={14} className="text-blue-600" /> Professional Details
                </h3>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {formData.partnerType === 'Individual Broker' && (
                    <>
                      <Input label="Broker License / RERA No" name="brokerLicense" value={formData.brokerLicense} onChange={handleChange} className="h-10" />
                      <Input label="Years of Experience" type="number" name="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleChange} className="h-10" />
                      <div className="sm:col-span-2">
                         <Input label="Primary Operating Area" required name="primaryOperatingArea" value={formData.primaryOperatingArea} onChange={handleChange} placeholder="e.g. Bandra, Andheri (Comma separated)" className="h-10" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-500 mb-2 block">Preferred Property Type</label>
                        <div className="flex flex-wrap gap-3">
                          {PROPERTY_TYPES.map(pt => (
                            <label key={pt} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${formData.preferredPropertyType.includes(pt) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200 hover:border-slate-300'}`}>
                              <input 
                                type="checkbox" 
                                className="hidden"
                                checked={formData.preferredPropertyType.includes(pt)} 
                                onChange={() => handleMultiSelect('preferredPropertyType', pt)} 
                              />
                              <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.preferredPropertyType.includes(pt) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                                {formData.preferredPropertyType.includes(pt) && <CheckCircle size={10} className="text-white" />}
                              </div>
                              <span className="text-[11px] font-bold uppercase tracking-wide">{pt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {formData.partnerType === 'Channel Partner Firm' && (
                    <>
                      <Input label="Firm / Agency Name" required name="firmName" value={formData.firmName} onChange={handleChange} className="h-10" />
                      <Input label="Firm Registration No." name="firmRegistrationNumber" value={formData.firmRegistrationNumber} onChange={handleChange} className="h-10" />
                      <div className="sm:col-span-2">
                         <label className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-500 mb-1 block">Firm Address</label>
                         <textarea 
                           name="firmAddress" 
                           required 
                           rows={3} 
                           value={formData.firmAddress} 
                           onChange={handleChange} 
                           className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-[13px] font-medium outline-none focus:border-blue-500 transition-all resize-none"
                         ></textarea>
                      </div>
                      <Input label="Authorized Person Name" required name="authorizedPersonName" value={formData.authorizedPersonName} onChange={handleChange} className="h-10" />
                      <Input label="Authorized Person Mobile" required name="authorizedPersonMobile" value={formData.authorizedPersonMobile} onChange={handleChange} className="h-10" />
                      <Input label="Authorized Person Email" required type="email" name="authorizedPersonEmail" value={formData.authorizedPersonEmail} onChange={handleChange} className="h-10" />
                      <Input label="Number of Agents" type="number" name="numberOfAgents" value={formData.numberOfAgents} onChange={handleChange} className="h-10" />
                      <Input label="GST Number" name="gstNumber" value={formData.gstNumber} onChange={handleChange} className="h-10" />
                    </>
                  )}

                  {formData.partnerType === 'Referral Partner' && (
                    <>
                      <div className="sm:col-span-2">
                        <Select
                           label="Profession"
                           options={[
                             { label: 'Chartered Accountant', value: 'CA' },
                             { label: 'Lawyer', value: 'Lawyer' },
                             { label: 'Existing Client', value: 'Existing Client' },
                             { label: 'Other', value: 'Other' },
                           ]}
                           value={formData.profession}
                           onChange={(val) => handleSelectChange('profession', val)}
                        />
                      </div>
                      <Input label="Organization Name" name="organizationName" value={formData.organizationName} onChange={handleChange} className="h-10" />
                      <Input label="Relationship Type" name="relationshipType" value={formData.relationshipType} onChange={handleChange} className="h-10" />
                    </>
                  )}

                  {formData.partnerType === 'Digital Channel Partner' && (
                    <>
                      <Input label="Company Name" required name="companyName" value={formData.companyName} onChange={handleChange} className="h-10" />
                      <Input label="Website URL" name="websiteUrl" value={formData.websiteUrl} onChange={handleChange} className="h-10" />
                      <div className="sm:col-span-2">
                        <label className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-500 mb-2 block">Lead Source Type</label>
                        <div className="flex flex-wrap gap-3">
                           {['Social Media', 'Google Ads', 'Content Marketing', 'Email Marketing'].map(type => (
                            <label key={type} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${formData.leadSourceType.includes(type) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200 hover:border-slate-300'}`}>
                              <input 
                                type="checkbox" 
                                className="hidden"
                                checked={formData.leadSourceType.includes(type)} 
                                onChange={() => handleMultiSelect('leadSourceType', type)} 
                              />
                              <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.leadSourceType.includes(type) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                                {formData.leadSourceType.includes(type) && <CheckCircle size={10} className="text-white" />}
                              </div>
                              <span className="text-[11px] font-bold uppercase tracking-wide">{type}</span>
                            </label>
                           ))}
                        </div>
                      </div>
                      <Input label="Monthly Lead Capacity" type="number" name="monthlyLeadCapacity" value={formData.monthlyLeadCapacity} onChange={handleChange} className="h-10" />
                      <Input label="Technical Contact Person" required name="technicalContactPerson" value={formData.technicalContactPerson} onChange={handleChange} className="h-10" />
                      <Input label="Technical Contact Email" required type="email" name="technicalContactEmail" value={formData.technicalContactEmail} onChange={handleChange} className="h-10" />
                      <div className="sm:col-span-2">
                        <Select
                           label="Billing Type"
                           options={[
                             { label: 'Cost Per Lead (CPL)', value: 'CPL' },
                             { label: 'Cost Per Acquisition (CPA)', value: 'CPA' },
                           ]}
                           value={formData.billingType}
                           onChange={(val) => handleSelectChange('billingType', val)}
                        />
                      </div>
                    </>
                  )}

                  {formData.partnerType === 'Corporate Channel Partner' && (
                    <>
                      <Input label="Company Name" required name="companyName" value={formData.companyName} onChange={handleChange} className="h-10" />
                      <Input label="Corporate Registration No." name="corporateRegistrationNumber" value={formData.corporateRegistrationNumber} onChange={handleChange} className="h-10" />
                      <Input label="Authorized Signatory Name" required name="authorizedSignatoryName" value={formData.authorizedSignatoryName} onChange={handleChange} className="h-10" />
                      <Input label="Authorized Signatory Email" required type="email" name="authorizedSignatoryEmail" value={formData.authorizedSignatoryEmail} onChange={handleChange} className="h-10" />
                      <Input label="Authorized Signatory Phone" required name="authorizedSignatoryPhone" value={formData.authorizedSignatoryPhone} onChange={handleChange} className="h-10" />
                      <Input label="Contract Validity Period" name="contractValidityPeriod" value={formData.contractValidityPeriod} onChange={handleChange} placeholder="e.g. 2024-2025" className="h-10" />
                      <Input label="GST Number" name="gstNumber" value={formData.gstNumber} onChange={handleChange} className="h-10" />
                    </>
                  )}
                </div>
              </div>

              {/* Bank Details */}
              {formData.partnerType !== 'Individual Broker' && (
                <div className="space-y-5">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                    <CreditCard size={14} className="text-blue-600" /> Bank Details
                  </h3>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <Input label="Bank Name" required name="bankName" value={formData.bankName} onChange={handleChange} placeholder="HDFC Bank" className="h-10" />
                    <Input label="Account Number" required name="accountNumber" value={formData.accountNumber} onChange={handleChange} placeholder="1234567890" className="h-10" />
                    <Input label="IFSC Code" required name="ifscCode" value={formData.ifscCode} onChange={handleChange} placeholder="HDFC0001234" className="h-10" />
                  </div>
                </div>
              )}

              {/* Security */}
              <div className="space-y-5">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-2">
                  <ShieldCheck size={14} className="text-blue-600" /> Security
                </h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Input label="Password" type="password" required name="password" value={formData.password} onChange={handleChange} className="h-10" />
                  <Input label="Confirm Password" type="password" required name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="h-10" />
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center h-5">
                  <input
                    id="agreement"
                    name="agreementAccepted"
                    type="checkbox"
                    required
                    checked={formData.agreementAccepted}
                    onChange={(e) => handleCheckboxChange('agreementAccepted', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-[11px] leading-relaxed">
                  <label htmlFor="agreement" className="font-bold text-slate-700">
                    I agree to the <button type="button" onClick={() => setShowTerms(true)} className="text-blue-600 hover:text-blue-700 hover:underline">Terms and Agreements</button>
                  </label>
                  <p className="text-slate-400 mt-0.5">By registering, you agree to our policies regarding data privacy and partner code of conduct.</p>
                </div>
              </div>

              <Button type="submit" isLoading={loading} className="w-full h-12 text-xs">
                SUBMIT APPLICATION
              </Button>
              <div className="mt-6 text-center">
                <p className="text-xs text-slate-500 font-medium">
                    Already registered?{' '}
                    <Link href="/login" className="text-blue-600 font-bold hover:underline">
                        Log in
                    </Link>
                </p>
              </div>
            </form>
        </div>
      </div>

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowTerms(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
            <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">Terms and Agreements</h3>
            <div className="h-96 overflow-y-auto prose prose-sm prose-slate text-sm text-slate-600 pr-2 custom-scrollbar">
              <p>1. <strong>Partner Obligations:</strong> The partner agrees to promote the properties ethically.</p>
              <p>2. <strong>Commission:</strong> Commissions are paid upon successful deal closure and receipt of payment from the client.</p>
              <p>3. <strong>Confidentiality:</strong> Partner shall maintain the confidentiality of client data.</p>
              <p>4. <strong>Termination:</strong> Dream Properties reserves the right to terminate partnership for violation of terms.</p>
              <p className="text-slate-400 italic">This is a sample agreement text...</p>
            </div>
            <div className="mt-8 flex justify-end pt-6 border-t border-slate-100">
              <Button onClick={() => setShowTerms(false)} variant="secondary">Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 z-[110] overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in-95 duration-200">
             <button onClick={() => setShowOTPModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
              <X size={20} />
            </button>
            
            <div className="text-center mb-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 mb-4">
                    <ShieldCheck className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Verification Required</h3>
                <p className="text-xs text-slate-500 font-medium">
                    We've sent a verification code to your email.
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">Email OTP</label>
                    <p className="text-[10px] text-slate-400">Sent to {formData.email}</p>
                    <div className="flex justify-center gap-2">
                      {emailOtp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className="w-10 h-12 md:w-12 md:h-14 text-center text-xl font-black bg-slate-50 border-2 border-slate-100 rounded-xl focus:bg-white focus:border-blue-600 outline-none transition-all"
                        />
                      ))}
                    </div>
                </div>
                
                {/* 
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">Mobile OTP</label>
                    <p className="text-[10px] text-slate-400">Sent to {formData.mobile}</p>
                    <Input 
                        value={mobileOtp} 
                        onChange={(e) => setMobileOtp(e.target.value)} 
                        placeholder="Enter Mobile OTP" 
                        className="text-center tracking-widest font-bold text-lg"
                    />
                </div>
                */}

                {error && (
                    <div className="bg-rose-50 text-rose-600 px-4 py-2 rounded-lg text-xs font-bold text-center">
                        {error}
                    </div>
                )}

                <Button 
                    onClick={handleVerifyOTP} 
                    isLoading={verifying} 
                    className="w-full mt-4"
                >
                    VERIFY & COMPLETE
                </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}