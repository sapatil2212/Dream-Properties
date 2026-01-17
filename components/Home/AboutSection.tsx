'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/UIComponents';
import Link from 'next/link';

export const AboutSection: React.FC = () => {
  const stats = [
    {
      value: "1,200+",
      title: "Properties Sold",
      description: "Connecting buyers with dream homes and investment opportunities."
    },
    {
      value: "95%",
      title: "Customer Satisfaction",
      description: "Delivering exceptional service, ensuring client satisfaction every step."
    },
    {
      value: "₹500M+",
      title: "in Transactions",
      description: "Showcasing leadership in multi-crore real estate transactions across the region."
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12 md:mb-16">
          
          {/* Left Content Side */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col"
          >
            <span className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mb-4">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" /> ABOUT US
            </span>
            
            <h2 className="text-xl md:text-4xl font-black text-[#0f2e33] leading-tight mb-6 uppercase">
              Why choose us for all your <br />
              <span className="text-blue-600">real estate needs</span>
            </h2>
            
            <div className="space-y-4 mb-8">
              <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed">
                After years of dedicated service in the Nashik real estate market, Dream Properties has now expanded to offer an integrated multi-tenant platform for premium residential and commercial spaces.
              </p>
              <p className="text-slate-600 text-sm md:text-base font-medium leading-relaxed">
                We are equipped with state-of-the-art verification systems and high-end property management tools, ensuring safe, transparent, and reliable results for every buyer.
              </p>
            </div>

            <div className="space-y-3 mb-8">
              {[
                "Unparalleled Expertise in Nashik Market",
                "Direct Access to RERA Verified Developers",
                "End-to-End Legal & Documentation Support"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center">
                    <Check size={12} className="text-blue-600 stroke-[3]" />
                  </div>
                  <span className="text-slate-800 font-bold text-sm">{text}</span>
                </div>
              ))}
            </div>

            <div>
              <Link href="/about">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold text-xs transition-all group shadow-none border-none uppercase tracking-widest">
                  Explore More <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right Image Side */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="rounded-[40px_40px_0px_40px] overflow-hidden shadow-xl border border-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200" 
                alt="Modern Architecture" 
                className="w-full h-[340px] md:h-[400px] object-cover"
              />
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="absolute -bottom-4 -right-2 md:-right-4 w-1/2 max-w-[220px] bg-white p-1.5 rounded-[20px] shadow-lg border-2 border-white overflow-hidden"
            >
              <div className="flex gap-1 h-[120px] md:h-[140px]">
                <img 
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400" 
                  alt="Interior" 
                  className="w-1/2 h-full object-cover rounded-l-[16px]"
                />
                <img 
                  src="https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e?auto=format&fit=crop&q=80&w=400" 
                  alt="Interior 2" 
                  className="w-1/2 h-full object-cover rounded-r-[16px]"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -3 }}
              className="bg-[#f8f9fa] p-8 rounded-[1.5rem] border border-transparent hover:border-slate-200 transition-all duration-300"
            >
              <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                {stat.value}
              </h3>
              <p className="text-base font-bold text-slate-800 mb-2">
                {stat.title}
              </p>
              <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
