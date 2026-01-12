import React from 'react';
import { motion } from 'framer-motion';
import { QuickBookingForm } from './QuickBookingForm.tsx';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[420px] md:min-h-[500px] overflow-visible mb-64 md:mb-20">
      {/* Hero Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1920"
          className="absolute inset-0 w-full h-full object-cover"
          alt="Luxury Real Estate Background"
        />
        <div className="absolute inset-0 bg-slate-900/70" />
      </div>

      {/* Hero Text Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white pt-16 md:pt-20 pb-32 md:pb-28">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-xl md:text-5xl font-black mb-3 tracking-tight leading-tight uppercase">
            Discover Your <br className="md:hidden" /><span className="text-blue-400">Perfect Home</span>
          </h1>
          <p className="text-[10px] md:text-lg text-white/80 font-medium max-w-xl mx-auto px-4">
            Nashik's Premier Multi-Tenant Real Estate Hub connecting you with verified premium developments.
          </p>
        </motion.div>
      </div>

      {/* Quick Booking Form */}
      <QuickBookingForm />
    </section>
  );
};