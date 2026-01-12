import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, MessageSquare, ShieldCheck, Trophy, ChevronRight, ChevronDown } from 'lucide-react';

const STEPS = [
  {
    title: 'Discover & List',
    description: 'Sign up to list your property or explore our exclusive, verified collection of premium flats and villas.',
    icon: <UserPlus className="text-blue-600" size={18} />,
    color: 'bg-blue-50',
  },
  {
    title: 'Connect & Enquire',
    description: 'Found the right property? Place an enquiry instantly and connect with our expert real estate advisors.',
    icon: <MessageSquare className="text-indigo-600" size={18} />,
    color: 'bg-indigo-50',
  },
  {
    title: 'Expert Management',
    description: 'We manage everything: site visits, negotiations, legal documentation, and developer coordination.',
    icon: <ShieldCheck className="text-emerald-600" size={18} />,
    color: 'bg-emerald-50',
  },
  {
    title: 'Deal Closed',
    description: 'Enjoy a smooth, transparent handover. Your dream property is officially yours with zero stress.',
    icon: <Trophy className="text-amber-600" size={18} />,
    color: 'bg-amber-50',
  },
];

export const ProcessSteps: React.FC = () => {
  return (
    <section className="py-20 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-blue-600 font-black text-[9px] uppercase tracking-[0.4em] mb-2 block">The Process</span>
          <h2 className="text-lg md:text-4xl font-black text-slate-900 tracking-tight uppercase">How It Works</h2>
          <div className="w-12 h-1.5 bg-blue-600 mx-auto mt-4 rounded-full" />
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex flex-row items-stretch gap-6">
          {STEPS.map((step, idx) => (
            <React.Fragment key={idx}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex-1 flex relative"
              >
                <div className="bg-white border border-slate-200 rounded-3xl p-8 h-full shadow-sm hover:shadow-xl transition-all duration-500 group relative flex flex-col w-full z-10">
                  <div className={`w-12 h-12 rounded-2xl ${step.color} flex items-center justify-center mb-6 shrink-0`}>
                    {step.icon}
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-3 group-hover:text-blue-600 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-slate-500 text-[11px] font-bold leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {idx < STEPS.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-[15px] -translate-y-1/2 z-20 pointer-events-none">
                    <div className="bg-white p-2 rounded-full border border-slate-100 shadow-xl">
                      <ChevronRight size={14} className="text-blue-500" />
                    </div>
                  </div>
                )}
              </motion.div>
            </React.Fragment>
          ))}
        </div>

        {/* Mobile View */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="md:hidden bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm divide-y divide-slate-100"
        >
          {STEPS.map((step, idx) => (
            <div key={idx} className={`${idx !== 0 ? 'pt-8' : ''} ${idx !== STEPS.length - 1 ? 'pb-8' : ''} relative`}>
              <div className="flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-2xl ${step.color} flex items-center justify-center mb-4 shrink-0 border border-white shadow-sm`}>
                  {step.icon}
                </div>
                
                <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-tight mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-500 text-[10px] font-bold leading-relaxed max-w-[260px]">
                  {step.description}
                </p>
              </div>

              {idx < STEPS.length - 1 && (
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-white p-1.5 rounded-full border border-slate-100 shadow-md">
                    <ChevronDown size={12} className="text-blue-500" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};