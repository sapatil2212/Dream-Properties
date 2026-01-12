import React from 'react';
import { Instagram, Facebook, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const XIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const Footer: React.FC = () => (
  <footer className="bg-slate-900 text-white pt-16 pb-8 px-6 md:px-8 border-t border-slate-800">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="col-span-1 md:col-span-2">
        <div className="flex items-center mb-6">
          <img 
            src="/assets/dp-logo.png" 
            alt="Dream Properties Logo" 
            className="h-12 w-auto brightness-110 rounded-lg"
          />
        </div>
        <p className="text-slate-400 max-w-sm mb-8 font-medium leading-relaxed">
          The leading multi-tenant real estate ecosystem empowering builders and buyers through verified technology and transparent management.
        </p>
        
        {/* Social Icons Container */}
        <div className="flex gap-4">
          {[
            { icon: <Instagram size={18} />, href: "https://instagram.com", color: "hover:text-pink-500" },
            { icon: <Facebook size={18} />, href: "https://facebook.com", color: "hover:text-blue-500" },
            { icon: <XIcon size={18} />, href: "https://x.com", color: "hover:text-blue-400" },
            { icon: <Linkedin size={18} />, href: "https://linkedin.com", color: "hover:text-blue-700" },
            { icon: <Youtube size={18} />, href: "https://youtube.com", color: "hover:text-red-500" }
          ].map((social, i) => (
            <a 
              key={i} 
              href={social.href} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center transition-all duration-300 ${social.color} hover:bg-white hover:scale-110`}
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-black uppercase tracking-widest text-[11px] text-blue-500 mb-6">Quick Navigation</h4>
        <ul className="space-y-4 text-sm font-bold">
          <li><Link to="/" className="text-slate-400 hover:text-white transition-colors">Home</Link></li>
          <li><Link to="/properties" className="text-slate-400 hover:text-white transition-colors">Search Properties</Link></li>
          <li><Link to="/about" className="text-slate-400 hover:text-white transition-colors">Our Story</Link></li>
          <li><Link to="/contact" className="text-slate-400 hover:text-white transition-colors">Contact Support</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="font-black uppercase tracking-widest text-[11px] text-blue-500 mb-6">Contact Channels</h4>
        <ul className="space-y-5">
          <li className="flex items-start gap-3 group">
            <div className="p-2 bg-slate-800 rounded-lg text-blue-400 shrink-0 self-start group-hover:bg-blue-600 group-hover:text-white transition-all"><Mail size={16} /></div>
            <a href="mailto:dreampropertiesnsk@gmail.com" className="text-sm font-bold text-slate-300 hover:text-white transition-colors truncate pt-1.5">
              dreampropertiesnsk@gmail.com
            </a>
          </li>
          <li className="flex items-start gap-3 group">
            <div className="p-2 bg-slate-800 rounded-lg text-emerald-400 shrink-0 self-start group-hover:bg-emerald-600 group-hover:text-white transition-all"><Phone size={16} /></div>
            <a href="tel:+919881159245" className="text-sm font-bold text-slate-300 hover:text-white transition-colors pt-1.5">
              +91 98811 59245
            </a>
          </li>
          <li className="flex items-start gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-rose-400 shrink-0 self-start"><MapPin size={16} /></div>
            <span className="text-sm font-bold text-slate-300 leading-relaxed pt-1.5">
              Office No 957, Roongtha Future-X, RD circle, Nashik 422 009
            </span>
          </li>
        </ul>
      </div>
    </div>
    
    <div className="max-w-7xl mx-auto border-t border-slate-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
      <div>&copy; 2026 Dream Properties Sole Selling Pvt Ltd.</div>
      <div className="flex gap-6">
        <Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
        <Link to="/terms-of-service" className="hover:text-white">Terms of Service</Link>
      </div>
    </div>
  </footer>
);