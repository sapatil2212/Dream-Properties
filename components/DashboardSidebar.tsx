'use client';

import React from 'react';
import { ChevronRight, LogOut, Command } from 'lucide-react';
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
  const items = NAV_ITEMS[role] || [];
  const pathname = usePathname();

  if (!items || items.length === 0) return null;

  return (
    <aside className={`fixed left-0 top-0 h-full bg-white border-r border-slate-100 transition-all duration-300 z-50 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        <div className="h-16 flex items-center px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <Command size={18} className="text-white" />
            </div>
            {!collapsed && (
              <span className="font-black text-slate-900 text-sm tracking-tight uppercase">Dream<span className="text-blue-600">SaaS</span></span>
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-6">
          {!collapsed && <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 px-3 mb-4">Main Menu</p>}
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center p-2.5 rounded-xl transition-all group relative ${
                pathname === item.href
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className={`${collapsed ? 'mx-auto' : 'mr-3'} transition-transform group-hover:scale-110`}>{item.icon}</div>
              {!collapsed && <span className="text-[11px] font-black uppercase tracking-wider">{item.label}</span>}
              {!collapsed && pathname === item.href && (
                 <div className="absolute right-3 w-1.5 h-1.5 bg-white/40 rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
           <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className={`flex items-center w-full p-2.5 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={20} className={collapsed ? '' : 'mr-3'} />
            {!collapsed && <span className="text-[11px] font-black uppercase tracking-widest">Logout</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <ChevronRight size={18} className={`transition-transform duration-500 ${collapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>
      </div>
    </aside>
  );
}
