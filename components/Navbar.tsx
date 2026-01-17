'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, Building2, Info, Phone, User, Home, PlusCircle, Settings, Heart, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './UIComponents';
import { UserRole } from '../types';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPropertiesDropdownOpen, setIsPropertiesDropdownOpen] = useState(false);

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

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  const onAuthClick = () => {
    router.push('/login');
    closeMenu();
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 transition-all duration-300 z-[50] backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Image Logo Only */}
            <Link href="/" className="flex items-center" onClick={closeMenu}>
              <img 
                src="/assets/dp-logo.png" 
                alt="Dream Properties Logo" 
                className="h-10 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                href="/" 
                className={`text-[11px] font-black uppercase tracking-[0.15em] transition-colors ${
                  pathname === '/' ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'
                }`}
              >
                Home
              </Link>

              {/* Properties Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setIsPropertiesDropdownOpen(true)}
                onMouseLeave={() => setIsPropertiesDropdownOpen(false)}
              >
                <button 
                  className={`flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.15em] transition-colors ${
                    pathname?.startsWith('/properties') ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'
                  }`}
                >
                  Properties
                  <ChevronDown size={12} className={`transition-transform duration-200 ${isPropertiesDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isPropertiesDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 mt-0 pt-4 w-48 z-[70]"
                    >
                      <div className="bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 p-2 overflow-hidden">
                        {[
                          { label: 'All Properties', href: '/properties' },
                          { label: 'Buy', href: '/properties/sell' },
                          { label: 'Rent', href: '/properties/rent' },
                          { label: 'Lease', href: '/properties/lease' },
                        ].map((item) => (
                          <Link 
                            key={item.href} 
                            href={item.href}
                            className={`flex items-center px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                              pathname === item.href ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link 
                href="/about" 
                className={`text-[11px] font-black uppercase tracking-[0.15em] transition-colors ${
                  pathname === '/about' ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'
                }`}
              >
                About Us
              </Link>

              <Link 
                href="/contact" 
                className={`text-[11px] font-black uppercase tracking-[0.15em] transition-colors ${
                  pathname === '/contact' ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'
                }`}
              >
                Contact
              </Link>
              
              <div className="h-4 w-px bg-gray-200" />
              
              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-[11px] font-black uppercase">
                      {user.name?.charAt(0)}
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isProfileOpen && (
                      <>
                        <div className="fixed inset-0 z-[60]" onClick={() => setIsProfileOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-200/50 p-2 z-[70] overflow-hidden"
                        >
                          <div className="px-3 py-2 border-b border-slate-50 mb-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Signed in as</p>
                            <p className="text-[12px] font-black text-slate-900 truncate">{user.name}</p>
                          </div>
                          
                          {user.role !== 'USER' && user.role !== 'BUYER' && (
                            <Link 
                              href="/dashboard" 
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all group"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <LayoutDashboard size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                              <span className="text-[11px] font-black uppercase tracking-wider">Dashboard</span>
                            </Link>
                          )}
                          
                          <Link 
                            href="/dashboard/profile/settings" 
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all group"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Settings size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                            <span className="text-[11px] font-black uppercase tracking-wider">Account Settings</span>
                          </Link>
                          
                          <Link 
                            href="/dashboard/profile/favorites" 
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all group"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Heart size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                            <span className="text-[11px] font-black uppercase tracking-wider">Interested</span>
                          </Link>

                          <div className="h-px bg-slate-50 my-1" />

                          <button 
                            onClick={() => { setIsProfileOpen(false); handleLogout(); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-all group"
                          >
                            <LogOut size={16} className="text-rose-400 group-rose:text-rose-600 transition-colors" />
                            <span className="text-[11px] font-black uppercase tracking-wider">Logout</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onAuthClick} 
                  className="font-black text-[10px] uppercase tracking-widest px-5 border-slate-200 hover:border-blue-600 hover:text-blue-600 flex items-center gap-2 rounded-xl"
                >
                  <User size={14} />
                  Login
                </Button>
              )}
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
                  <Link
                    href="/"
                    onClick={closeMenu}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                      pathname === '/' ? 'bg-blue-50 text-blue-600 font-black' : 'text-slate-600 hover:bg-slate-50 font-bold'
                    }`}
                  >
                    <span className="shrink-0 opacity-70"><Home size={16} /></span>
                    <span className="text-[11px] uppercase tracking-wider">Home</span>
                  </Link>

                  <div className="flex flex-col gap-1 pl-4 border-l-2 border-slate-100 ml-6 my-1">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 ml-4">Properties</p>
                    {[
                      { label: 'All Listings', href: '/properties', icon: <Building2 size={14} /> },
                      { label: 'Buy', href: '/properties/sell', icon: <Building2 size={14} /> },
                      { label: 'Rent', href: '/properties/rent', icon: <Building2 size={14} /> },
                      { label: 'Lease', href: '/properties/lease', icon: <Building2 size={14} /> },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMenu}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                          pathname === item.href ? 'bg-blue-50 text-blue-600 font-black' : 'text-slate-600 hover:bg-slate-50 font-bold'
                        }`}
                      >
                        <span className="text-[10px] uppercase tracking-wider">{item.label}</span>
                      </Link>
                    ))}
                  </div>

                  <Link
                    href="/about"
                    onClick={closeMenu}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                      pathname === '/about' ? 'bg-blue-50 text-blue-600 font-black' : 'text-slate-600 hover:bg-slate-50 font-bold'
                    }`}
                  >
                    <span className="shrink-0 opacity-70"><Info size={16} /></span>
                    <span className="text-[11px] uppercase tracking-wider">About Us</span>
                  </Link>

                  <Link
                    href="/contact"
                    onClick={closeMenu}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                      pathname === '/contact' ? 'bg-blue-50 text-blue-600 font-black' : 'text-slate-600 hover:bg-slate-50 font-bold'
                    }`}
                  >
                    <span className="shrink-0 opacity-70"><Phone size={16} /></span>
                    <span className="text-[11px] uppercase tracking-wider">Contact</span>
                  </Link>
                </div>
                
                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-2" />
                
                {/* Action Buttons Section - Side by Side */}
                <div className="flex items-center gap-2.5">
                  {user ? (
                    <div className="flex flex-col w-full gap-2">
                      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white text-[12px] font-black uppercase">
                          {user.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black text-slate-900 truncate uppercase tracking-wider">{user.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{(user as any).role}</p>
                        </div>
                      </div>
                      
                      <div className={`grid gap-2 ${user.role !== 'USER' && user.role !== 'BUYER' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                        {user.role !== 'USER' && user.role !== 'BUYER' && (
                          <Link 
                            href="/dashboard" 
                            onClick={closeMenu}
                            className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-100 rounded-xl hover:bg-blue-50 hover:border-blue-100 transition-all group"
                          >
                            <LayoutDashboard size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                            <span className="text-[9px] font-black text-slate-500 group-hover:text-blue-600 uppercase tracking-widest text-center">Dashboard</span>
                          </Link>
                        )}
                        
                        <Link 
                          href="/dashboard/profile/settings" 
                          onClick={closeMenu}
                          className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-100 rounded-xl hover:bg-blue-50 hover:border-blue-100 transition-all group"
                        >
                          <Settings size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                          <span className="text-[9px] font-black text-slate-500 group-hover:text-blue-600 uppercase tracking-widest text-center">Settings</span>
                        </Link>
                        
                        <Link 
                          href="/dashboard/profile/favorites" 
                          onClick={closeMenu}
                          className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-slate-100 rounded-xl hover:bg-blue-50 hover:border-blue-100 transition-all group"
                        >
                          <Heart size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                          <span className="text-[9px] font-black text-slate-500 group-hover:text-blue-600 uppercase tracking-widest text-center">Interested</span>
                        </Link>
                      </div>

                      <Button 
                        variant="outline" 
                        className="w-full py-3.5 border-rose-100 text-rose-600 hover:bg-rose-50 hover:border-rose-200 flex items-center justify-center gap-2 rounded-xl font-black uppercase text-[10px] tracking-widest"
                        onClick={() => { closeMenu(); handleLogout(); }}
                      >
                        <LogOut size={16} />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Post Property Button */}
                      <Link
                        href="/login"
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
                        onClick={onAuthClick}
                      >
                        <User size={15} strokeWidth={2.5} />
                        Login
                      </Button>
                    </>
                  )}
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