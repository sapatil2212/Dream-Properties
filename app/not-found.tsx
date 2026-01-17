'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/UIComponents';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="w-24 h-24 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-8"
        >
          <AlertCircle size={48} />
        </motion.div>
        
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-6xl font-black text-slate-900 mb-4"
        >
          404
        </motion.h1>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-slate-500 font-medium mb-10 max-w-md mx-auto"
        >
          Oops! The page you're looking for has vanished into thin air. Let's get you back home.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button 
            onClick={() => router.push('/')}
            className="gap-2 px-8 py-4 rounded-xl font-bold"
          >
            <Home size={18} />
            Back to Home
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
