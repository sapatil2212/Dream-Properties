import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Gavel, FileWarning, HelpCircle, CheckCircle, AlertTriangle, Briefcase } from 'lucide-react';

export const TermsOfService: React.FC = () => {
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
            Agreement
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6 uppercase"
          >
            Terms of <span className="text-blue-400">Service</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-sm md:text-base font-medium max-w-2xl mx-auto italic"
          >
            Please read these terms carefully before using the Dream Properties platform.
          </motion.p>
        </div>
      </section>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-8 md:p-16 border border-slate-100">
          <div className="space-y-12">
            
            {/* Acceptance */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <CheckCircle size={24} />
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">1. Acceptance of Terms</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.
              </p>
            </section>

            {/* Intellectual Property */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <Briefcase size={24} />
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">2. Intellectual Property Rights</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                The Website and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by Dream Properties and are protected by international copyright, trademark, and other intellectual property or proprietary rights laws.
              </p>
            </section>

            {/* Prohibited Uses */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <AlertTriangle size={24} />
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">3. Prohibited Uses</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                You may use the Website only for lawful purposes and in accordance with these Terms of Service. You agree not to:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600 text-sm font-medium">
                <li>Use the Website in any way that violates any applicable local or international law.</li>
                <li>To transmit any advertising or promotional material, including "junk mail" or "spam".</li>
                <li>To impersonate or attempt to impersonate Dream Properties, an employee, or any other user.</li>
                <li>To engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Website.</li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <Scale size={24} />
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">4. Limitation of Liability</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                In no event will Dream Properties, its affiliates or their licensors, service providers, employees, agents, officers or directors be liable for damages of any kind, under any legal theory, arising out of or in connection with your use, or inability to use, the Website.
              </p>
            </section>

            {/* Governing Law */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <Gavel size={24} />
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">5. Governing Law</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                All matters relating to the Website and these Terms of Service, and any dispute or claim arising therefrom or related thereto, shall be governed by and construed in accordance with the internal laws of India without giving effect to any choice or conflict of law provision or rule.
              </p>
            </section>

            <div className="pt-8 border-t border-slate-100 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                Effective Date: January 1, 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};