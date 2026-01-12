
import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

export const QuickBanner: React.FC = () => (
  <div className="hidden md:block bg-slate-900 text-slate-200 py-2 border-b border-slate-800 relative z-[40]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-2 text-[10px] sm:text-xs font-medium">
      <div className="flex items-center gap-4">
        <a href="tel:+919881159245" className="flex items-center gap-1.5 hover:text-white transition-colors">
          <Phone size={12} className="text-blue-400" />
          <span>Call / WhatsApp: +91 98811 59245</span>
        </a>
        <a href="mailto:dreampropertiesnsk@gmail.com" className="flex items-center gap-1.5 hover:text-white transition-colors">
          <Mail size={12} className="text-blue-400" />
          <span className="hidden sm:inline">dreampropertiesnsk@gmail.com</span>
        </a>
      </div>
      <div className="flex items-center gap-1.5 text-center md:text-right">
        <MapPin size={12} className="text-blue-400 shrink-0" />
        <span className="line-clamp-1 md:line-clamp-none">
          Office No 957, 9th floor, Roongtha Future-X, RD circle, Nashik 422 009
        </span>
      </div>
    </div>
  </div>
);
