import React, { useState, useEffect } from 'react';
import { Menu, X, Building2, Info, Phone, User, Home, PlusCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './UIComponents.tsx';

interface NavbarProps {
  onAuthClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onAuthClick }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMenuOpen]);

  const navLinks = [
    { label: 'Home', href: '/', icon: <Home size={16} /> },
    { label: 'Properties', href: '/properties', icon: <Building2 size={16} /> },
    { label: 'About Us', href: '/about', icon: <Info size={16} /> },
    { label: 'Contact', href: '/contact', icon: <Phone size={16} /> },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 transition-all duration-300 z-[50] backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Image Logo Only */}
            <Link to="/" className="flex items-center" onClick={closeMenu}>
              <img 
                src="/assets/dp-logo.png" 
                alt="Dream Properties Logo" 
                className="h-10 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  to={link.href} 
                  className={`text-[11px] font-black uppercase tracking-[0.15em] transition-colors ${
                    location.pathname === link.href ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="h-4 w-px bg-gray-200" />
              
              {/* Post Property Button */}
              <Link 
                to="/login" 
                className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.15em] text-slate-700 hover:text-blue-600 transition-colors"
              >
                <span>Post Property</span>
                <span className="relative overflow-hidden bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                  FREE
                  <span className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </span>
              </Link>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onAuthClick} 
                className="font-black text-[10px] uppercase tracking-widest px-5 border-slate-200 hover:border-blue-600 hover:text-blue-600 flex items-center gap-2 rounded-xl"
              >
                <User size={14} />
                Login
              </Button>
            </div>

            {/* Mobile Burger Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1.5 text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Opening from Top */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-xl overflow-hidden md:hidden z-[100]"
            >
              <div className="px-5 py-6 flex flex-col gap-4">
                {/* Navigation Links with improved spacing */}
                <div className="flex flex-col gap-1">
                  {navLinks.map((link, index) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={closeMenu}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                        location.pathname === link.href 
                          ? 'bg-blue-50 text-blue-600 font-black' 
                          : 'text-slate-600 hover:bg-slate-50 font-bold'
                      }`}
                    >
                      <span className="shrink-0 opacity-70">{link.icon}</span>
                      <span className="text-[11px] uppercase tracking-wider">{link.label}</span>
                    </Link>
                  ))}
                </div>
                
                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2" />
                
                {/* Action Buttons Section - Side by Side */}
                <div className="flex items-center gap-2.5">
                  {/* Post Property Button */}
                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl px-2 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.98]"
                  >
                    <PlusCircle size={15} strokeWidth={2.5} />
                    <span className="font-black text-[9px] uppercase tracking-wider flex items-center gap-1">
                      Post Property
                      <span className="relative overflow-hidden bg-white/20 backdrop-blur-sm text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase border border-white/30">
                        FREE
                        <span className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                      </span>
                    </span>
                  </Link>
                  
                  {/* Login Button */}
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1 py-3.5 rounded-xl font-black uppercase tracking-wider text-[10px] border-2 border-slate-300 hover:border-blue-600 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    onClick={() => { closeMenu(); onAuthClick(); }}
                  >
                    <User size={15} strokeWidth={2.5} />
                    Login
                  </Button>
                </div>
                
                {/* Helper Text */}
                <p className="text-center text-[9px] text-slate-400 font-medium uppercase tracking-widest mt-2 px-4">
                  Trusted by 500+ Builders in Nashik
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Background Blur Overlay when menu open */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMenu}
            className="fixed inset-0 bg-black/20 backdrop-blur-[4px] z-[45] md:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
};