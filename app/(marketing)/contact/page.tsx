'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Instagram, Linkedin, Facebook, Twitter, Youtube } from 'lucide-react';
import { Button, Card, Input, Select } from '@/components/UIComponents';
import { SuccessModal } from '@/components/ui/success-modal';

const PROPERTY_CATEGORIES = [
  "Residential Apartment",
  "Independent House/Villa",
  "Residential Land/Plot",
  "Commercial Office",
  "Commercial Shop",
  "Industrial Land",
  "Agricultural Land",
  "Farmhouse",
  "Other"
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", 
  "Lakshadweep", "Puducherry"
];

export default function ContactPage() {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', message: '', interestedIn: '', city: '', state: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setShowSuccessModal(true);
        setFormData({ firstName: '', lastName: '', email: '', phone: '', message: '', interestedIn: '', city: '', state: '' });
      } else {
        alert(data.message || "Failed to submit inquiry.");
      }
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="bg-slate-900 py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-blue-400 font-black text-[10px] uppercase tracking-[0.5em] mb-4 block"
          >
            Connect With Us
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6"
          >
            Let's Find Your <br />
            <span className="text-blue-400">Future Address</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg font-medium italic max-w-xl mx-auto"
          >
            Have a question or want to schedule a site visit? Our expert advisors are ready to assist you 24/7.
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 grid lg:grid-cols-12 gap-12">
        {/* Contact Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-7 h-full"
        >
          <Card className="h-full p-6 md:p-8 border border-slate-200 rounded-2xl shadow-none flex flex-col justify-center">
            <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">Drop us a line</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input 
                  label="First Name" 
                  placeholder="John" 
                  required 
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
                <Input 
                  label="Last Name" 
                  placeholder="Doe" 
                  required 
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input 
                  label="Phone Number" 
                  placeholder="+91 XXXXX XXXXX" 
                  required 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <Input 
                  label="Email Address" 
                  placeholder="john@example.com" 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-500">Interested In</label>
                <Select
                  options={PROPERTY_CATEGORIES.map(c => ({ label: c, value: c }))}
                  value={formData.interestedIn}
                  onChange={(value) => setFormData({ ...formData, interestedIn: value })}
                  placeholder="Select Property Category"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input 
                  label="City" 
                  placeholder="e.g. Nashik" 
                  required 
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-500">State</label>
                  <Select
                    options={INDIAN_STATES.map(s => ({ label: s, value: s }))}
                    value={formData.state}
                    onChange={(value) => setFormData({ ...formData, state: value })}
                    placeholder="Select State"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Message</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:border-blue-500 outline-none text-[13px] font-medium min-h-[120px] transition-all"
                  placeholder="Tell us what you're looking for..."
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full md:w-auto px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2.5"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                <Send size={16} />
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Contact Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-5 h-full"
        >
          <Card className="h-full border border-slate-200 rounded-2xl shadow-none overflow-hidden flex flex-col bg-white">
            {/* Map Section - Top Half */}
            <div className="h-1/2 min-h-[300px] w-full relative border-b border-slate-100">
               <iframe 
                 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3749.478914518172!2d73.76298529678955!3d19.988404899999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bddeb3cde669261%3A0x80c1409b4e120554!2sRoongta%20Futurex%20Nashik!5e0!3m2!1sen!2sin!4v1768885215205!5m2!1sen!2sin" 
                 width="100%" 
                 height="100%" 
                 style={{ border: 0 }} 
                 allowFullScreen 
                 loading="lazy" 
                 referrerPolicy="no-referrer-when-downgrade"
                 className="grayscale hover:grayscale-0 transition-all duration-500"
               />
            </div>

            {/* Contact Details - Bottom Half */}
            <div className="flex-1 p-8 flex flex-col justify-center space-y-8 bg-white">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <Phone size={16} />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone</p>
                    </div>
                    <p className="text-sm font-bold text-slate-800">+91 98811 59245</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <MessageCircle size={16} />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">WhatsApp</p>
                    </div>
                    <p className="text-sm font-bold text-slate-800">+91 98811 59245</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Mail size={16} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</p>
                  </div>
                  <p className="text-sm font-bold text-slate-800">dreampropertiesnsk@gmail.com</p>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-amber-600">
                    <MapPin size={16} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Address</p>
                  </div>
                  <p className="text-sm font-bold text-slate-800 leading-relaxed">
                    Office No 957, 9th floor, Roongtha Future-X, RD circle, Nashik 422 009
                  </p>
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center gap-4">
                  {[
                    { icon: <Instagram size={18} />, href: "#" },
                    { icon: <Linkedin size={18} />, href: "#" },
                    { icon: <Facebook size={18} />, href: "#" },
                    { icon: <Twitter size={18} />, href: "#" },
                    { icon: <Youtube size={18} />, href: "#" }
                  ].map((social, i) => (
                    <a 
                      key={i} 
                      href={social.href} 
                      className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all"
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
}
