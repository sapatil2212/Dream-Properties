'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuickBookingForm } from './QuickBookingForm';
import Hero1 from "../../public/assets/hero-1.png"
import Hero2 from "../../public/assets/hero-2.png"
import MobileHero1 from "../../public/assets/Mobile-Hero-images/mobile-hero1.png"

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
    <section className="relative flex flex-col md:block mb-0 md:mb-8 md:h-[600px]">
      
      {/* Hero Background Image */}
      <div className="relative w-full h-[60vh] md:absolute md:inset-0 md:h-full z-0 bg-slate-900 overflow-hidden">
        {/* Desktop Slideshow */}
        <div className="hidden md:block w-full h-full">
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

        {/* Mobile Hero Image */}
        <div className="block md:hidden w-full h-full">
          <motion.img
            src={typeof MobileHero1 === 'string' ? MobileHero1 : (MobileHero1 as any).src}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 w-full h-full object-cover"
            alt="Luxury Real Estate Background"
          />
        </div>
      </div>

      {/* Quick Booking Form */}
      {/* Mobile: relative, below image. Desktop: absolute, bottom overlapping */}
      <div className="relative z-10 w-full mt-4 md:mt-0 md:absolute md:bottom-0 md:translate-y-12">
        <QuickBookingForm />
      </div>
    </section>
  );
};
