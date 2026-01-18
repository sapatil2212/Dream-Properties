'use client';

import React from 'react';
import { ChevronRight, LogOut, Command, HelpCircle, Menu } from 'lucide-react';
import { UserRole } from '@/types';
import { NAV_ITEMS } from '@/constants';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface SidebarProps {
  role: UserRole;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

export function DashboardSidebar({ role, collapsed, setCollapsed }: SidebarProps) {
  const [isMobile, setIsMobile] = React.useState(false);
  
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const items = NAV_ITEMS[role] || [];
  const pathname = usePathname();

  if (!items || items.length === 0) return null;

  return (
    <>
      {/* Mobile overlay when sidebar is open */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 z-40 lg:hidden transition-opacity duration-300 ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        onClick={() => setCollapsed(true)}
      />
      
      {/* Mobile sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full bg-white border-r border-slate-100 transition-all duration-300 z-50
          ${isMobile ? (collapsed ? 'w-0 -translate-x-full' : 'w-[240px]') : (collapsed ? 'w-20' : 'w-64')}
          ${isMobile ? 'shadow-lg' : ''}`}
        style={{ overflow: 'hidden' }}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center px-4 lg:px-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              {/* Mobile logo */}
              {isMobile && !collapsed && (
                <img 
                  src="/assets/dp-logo.png" 
                  alt="Dream Properties Logo" 
                  className="h-8 w-auto object-contain"
                />
              )}
              
              {/* Desktop logo */}
              {!isMobile && (
                <>
                  {collapsed ? (
                    <img 
                      src="/assets/dp-logo.png" 
                      alt="Dream Properties Logo" 
                      className="h-8 w-8 object-contain rounded-lg"
                    />
                  ) : (
                    <img 
                      src="/assets/dp-logo.png" 
                      alt="Dream Properties Logo" 
                      className="h-8 w-auto object-contain"
                    />
                  )}
                </>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto w-full">
            {!collapsed && <p className="text-[11px] font-medium text-slate-400 px-2 mb-3">Main Menu</p>}
            {items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => isMobile && setCollapsed(true)}
                className={`flex items-center p-2 rounded-lg transition-all group relative w-full
                  ${pathname === item.href
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <div className={`${collapsed && !isMobile ? 'mx-auto' : 'mr-2'} transition-transform group-hover:scale-110 flex-shrink-0`}>
                  {React.cloneElement(item.icon, { size: 18 })}
                </div>
                {!collapsed && <span className="text-xs font-medium truncate">{item.label}</span>}
                {!collapsed && pathname === item.href && (
                  <div className="absolute right-2 w-1.5 h-1.5 bg-white/40 rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-slate-100 space-y-1.5">
            {/* Help & Support */}
            <div className={`flex items-center w-full p-2 rounded-lg text-slate-600 transition-all ${collapsed && !isMobile ? 'justify-center' : 'gap-2'}`}>
              <HelpCircle size={18} />
              {!collapsed && (
                <div className="flex-1">
                  <p className="text-[11px] font-semibold text-slate-700">Help & Support</p>
                  <a href="mailto:support@dreamproperties.com" className="text-[10px] text-blue-600 hover:underline">support@dreamproperties.com</a>
                </div>
              )}
            </div>

            {/* Logout */}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className={`flex items-center w-full p-2 rounded-lg text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all ${collapsed && !isMobile ? 'justify-center' : ''}`}
            >
              <LogOut size={18} className={collapsed && !isMobile ? '' : 'mr-2'} />
              {!collapsed && <span className="text-xs font-medium">Logout</span>}
            </button>
            
            {/* Collapse Toggle - Only visible on desktop */}
            {!isMobile && (
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="flex items-center justify-center w-full p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <ChevronRight size={16} className={`transition-transform duration-500 ${collapsed ? '' : 'rotate-180'}`} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
