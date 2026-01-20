'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuickBookingForm } from './QuickBookingForm';
import Hero1 from "../../public/assets/hero-1.png"
import Hero2 from "../../public/assets/hero-2.png"
const HERO_IMAGES = [
  Hero1,Hero2
 
];

export const HeroSection: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative md:h-[600px] overflow-visible mb-24 md:mb-8 flex flex-col">
      {/* Mobile Height Spacer */}
      <img 
        src={typeof HERO_IMAGES[0] === 'string' ? HERO_IMAGES[0] : (HERO_IMAGES[0] as any).src}
        className="w-full h-auto md:hidden invisible block"
        alt="Spacer"
        aria-hidden="true"
      />

      {/* Hero Background Image */}
      <div className="absolute inset-0 z-0 bg-slate-900">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentImageIndex}
            src={typeof HERO_IMAGES[currentImageIndex] === 'string' ? HERO_IMAGES[currentImageIndex] : (HERO_IMAGES[currentImageIndex] as any).src}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 w-full h-full object-cover"
            alt="Luxury Real Estate Background"
          />
        </AnimatePresence>
      </div>

      {/* Quick Booking Form */}
      <div className="absolute bottom-0 w-full translate-y-[70%] md:translate-y-12 z-10">
        <QuickBookingForm />
      </div>
    </section>
  );
};
