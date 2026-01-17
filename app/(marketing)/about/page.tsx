'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, Award, Globe, ShieldCheck, TrendingUp, CheckCircle2, Heart } from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { icon: <Building2 className="text-blue-600" size={20} />, label: 'Verified Projects', value: '150+' },
    { icon: <Users className="text-blue-600" size={20} />, label: 'Global Clients', value: '5000+' },
    { icon: <Award className="text-blue-600" size={20} />, label: 'Years of Trust', value: '15+' },
    { icon: <Globe className="text-blue-600" size={20} />, label: 'Global Presence', value: 'Worldwide' },
  ];

  const values = [
    {
      title: "Radical Transparency",
      desc: "Every contract, every dimension, and every price is verified and shared with 100% honesty.",
      icon: <ShieldCheck size={24} className="text-blue-600" />
    },
    {
      title: "Builder Synergy",
      desc: "We don't just list properties; we partner with elite builders to ensure structural excellence.",
      icon: <Building2 size={24} className="text-blue-600" />
    },
    {
      title: "Digital-First Approach",
      desc: "Advanced virtual tours and real-time lead tracking for a frictionless experience.",
      icon: <TrendingUp size={24} className="text-blue-600" />
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-slate-900 py-32 md:py-48 px-4 overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            <span className="text-blue-400 font-black text-[10px] uppercase tracking-[0.5em] mb-8 block">
              Who We Are
            </span>
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tight leading-[1.1] mb-10 uppercase text-center">
              Bridging Dreams <br />
              <span className="text-blue-400">With Reality.</span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-3xl mx-auto text-center">
              Dream Properties is more than a marketplace. We are a technology-driven ecosystem designed to bring transparency to the premium real estate landscape.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Floating Stats Block */}
      <section className="relative z-20 -mt-10 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white shadow-2xl shadow-slate-200/60 rounded-[2.5rem] p-4 md:p-2 border border-slate-100"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-0 divide-x-0 lg:divide-x divide-slate-100">
              {stats.map((stat, idx) => (
                <div key={idx} className="p-8 flex flex-col items-center text-center group">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    {stat.icon}
                  </div>
                  <p className="text-2xl md:text-3xl font-black text-slate-900 mb-1">{stat.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="py-24 md:py-32 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.3em] mb-4">Our Journey</h2>
              <h3 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight uppercase tracking-tighter">
                A Decade of Integrity <br /> In Every Square Foot.
              </h3>
            </div>
            
            <div className="space-y-6 text-slate-600 text-base md:text-lg font-medium leading-relaxed">
              <p>
                Founded on the belief that real estate is the most emotional investment a person makes, Dream Properties began as a dedicated consultancy driven by core values of trust and clarity. Today, we stand as a beacon of excellence for thousands of property owners worldwide.
              </p>
              <p>
                Our multi-tenant platform empowers builders to showcase their finest work while giving buyers the tools they need to make informed, safe, and life-changing decisions.
              </p>
            </div>

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['Verified Projects', 'Direct-to-Builder Pricing', 'Legal Advisory Suite', '24/7 Digital Concierge'].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-blue-600" />
                  <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-white">
              <img 
                src="https://images.unsplash.com/photo-1600585154526-990dcea4db0d?auto=format&fit=crop&q=80&w=1200" 
                alt="Luxury Interior"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 bg-blue-600 text-white p-10 rounded-[2.5rem] shadow-2xl hidden md:block border-8 border-white">
              <p className="text-5xl font-black mb-1">15+</p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Years of Excellence</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-24 bg-slate-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-4 block">Our DNA</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter">The Dream Standard</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 border border-slate-100"
              >
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-8">
                  {value.icon}
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">
                  {value.title}
                </h3>
                <p className="text-sm md:text-base text-slate-500 leading-relaxed font-medium">
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Statement Section */}
      <section className="relative py-40 px-4 text-center overflow-hidden bg-white">
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-[0.05] grayscale">
          <img 
            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1920" 
            alt="World Map" 
            className="w-full h-full object-cover scale-110"
          />
        </div>

        <div className="max-w-5xl mx-auto space-y-12 relative z-10">
          <Heart size={48} className="text-rose-500 mx-auto animate-pulse" />
          <h2 className="text-2xl md:text-5xl font-black text-slate-900 leading-[2.5] uppercase tracking-tight">
            Our vision is simple: <br className="hidden md:block" />
            To ensure that everyone, everywhere, <br className="hidden md:block" />
            wakes up in a space they truly love.
          </h2>
          <div className="flex items-center justify-center gap-4 pt-6">
            <div className="w-12 h-1 bg-blue-600 rounded-full" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Founded with Passion</p>
            <div className="w-12 h-1 bg-blue-600 rounded-full" />
          </div>
        </div>
      </section>
    </div>
  );
}
