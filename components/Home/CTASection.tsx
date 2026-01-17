'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/UIComponents';

export const CTASection: React.FC = () => {
  const router = useRouter();

  return (
    <section className="py-8 md:py-16 px-4 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-slate-900 flex flex-col lg:flex-row min-h-[260px] md:min-h-[380px]">
          {/* Left Side: Image Content */}
          <div className="w-full lg:w-1/2 relative min-h-[160px] lg:min-h-full">
            <img 
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200" 
              alt="Luxury Living Room" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 to-transparent lg:hidden" />
          </div>

          {/* Right Side: Text Content */}
          <div className="w-full lg:w-1/2 p-6 md:p-10 lg:p-12 flex flex-col justify-center relative">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-blue-400 font-black text-[8px] md:text-[10px] uppercase tracking-[0.4em] mb-2 block">
                Take the next step
              </span>
              
              <h2 className="text-xl md:text-3xl font-black text-white leading-tight mb-4">
                Your <span className="text-blue-400">Dream Home</span> is just a click away.
              </h2>
              
              <p className="text-slate-400 text-[10px] md:text-sm font-medium leading-relaxed mb-6 max-w-lg">
                Whether you're looking for a luxury villa or a modern workspace in Nashik, our experts are here to guide you.
              </p>

              <div className="flex flex-row gap-2">
                <Button 
                  onClick={() => router.push('/contact')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-2.5 rounded-lg flex items-center justify-center gap-1.5 font-black text-[9px] md:text-[11px] uppercase tracking-widest transition-all group border-none shadow-none whitespace-nowrap"
                >
                  Contact <ArrowRight size={12} className="hidden sm:inline group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <a 
                  href="https://wa.me/919881159245" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg border-2 border-slate-700 text-white font-black text-[9px] md:text-[11px] uppercase tracking-widest hover:bg-white/5 transition-all whitespace-nowrap"
                >
                  <MessageCircle size={12} className="text-emerald-400" />
                  WhatsApp
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
