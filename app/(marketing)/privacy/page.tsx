'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, UserCheck, Globe, Bell } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="bg-slate-900 py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-blue-400 font-black text-[10px] uppercase tracking-[0.5em] mb-4 block"
          >
            Trust & Security
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6 uppercase"
          >
            Privacy <span className="text-blue-400">Policy</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-sm md:text-base font-medium max-w-2xl mx-auto italic"
          >
            Your privacy is our priority. Learn how Dream Properties protects and manages your personal information.
          </motion.p>
        </div>
      </section>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-8 md:p-16 border border-slate-100">
          <div className="space-y-12">
            
            {/* Introduction */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <Shield size={24} />
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">1. Overview</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                At Dream Properties Sole Selling Pvt Ltd ("Dream Properties", "we", "us", or "our"), we respect your privacy and are committed to protecting it through our compliance with this policy. This policy describes the types of information we may collect from you or that you may provide when you visit our website and our practices for collecting, using, maintaining, protecting, and disclosing that information.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <UserCheck size={24} />
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">2. Information We Collect</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                We collect several types of information from and about users of our Website, including:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm font-medium">
                <li>Personal identification information (Name, email address, phone number, etc.)</li>
                <li>Property preferences and search history.</li>
                <li>Technical data such as IP address, browser type, and operating system.</li>
                <li>Interaction data regarding how you use our platform.</li>
              </ul>
            </section>

            {/* How We Use Your Data */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <Eye size={24} />
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">3. Use of Information</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                We use information that we collect about you or that you provide to us to:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Services</p>
                  <p className="text-xs font-bold text-slate-800">Provide property recommendations and facilitate site visits.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Communication</p>
                  <p className="text-xs font-bold text-slate-800">Contact you regarding inquiries and project updates.</p>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <Lock size={24} />
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">4. Data Security</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure. All information you provide to us is stored on our secure servers behind firewalls.
              </p>
            </section>

            {/* Cookies */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <Globe size={24} />
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">5. Cookies & Tracking</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Our website uses "cookies" to enhance the user experience. You may choose to set your web browser to refuse cookies, or to alert you when cookies are being sent. If you do so, note that some parts of the site may not function properly.
              </p>
            </section>

            {/* Updates */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <Bell size={24} />
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">6. Changes to Policy</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                It is our policy to post any changes we make to our privacy policy on this page. The date the privacy policy was last revised is identified at the bottom of the page.
              </p>
            </section>

            <div className="pt-8 border-t border-slate-100 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Last Updated: October 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
