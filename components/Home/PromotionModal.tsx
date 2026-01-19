'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Promotion {
  id: number;
  imageUrl: string;
}

export const PromotionModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [promotion, setPromotion] = useState<Promotion | null>(null);

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const res = await fetch('/api/promotions?active=true');
        if (res.ok) {
          const data = await res.json();
          // Get the most recent active promotion
          if (data && data.length > 0) {
            setPromotion(data[0]);
            // Small delay before showing
            setTimeout(() => setIsOpen(true), 1000);
          }
        }
      } catch (error) {
        console.error('Error fetching promotion:', error);
      }
    };

    fetchPromotion();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!promotion) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative bg-white rounded-2xl overflow-hidden shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col"
          >
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"
            >
              <X size={20} />
            </button>
            
            <div className="flex-1 overflow-auto">
              <img
                src={promotion.imageUrl}
                alt="Special Offer"
                className="w-full h-auto object-contain"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
