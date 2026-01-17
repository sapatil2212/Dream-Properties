'use client';

import React from 'react';
import { LayoutGrid, Search, Bell, User } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  user: {
    name: string;
    role: string;
  };
}

export function DashboardHeader({ title, user }: DashboardHeaderProps) {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-slate-50 rounded-lg text-slate-400 hidden lg:block">
           <LayoutGrid size={18} />
        </div>
        <h1 className="text-sm font-black text-slate-900 uppercase tracking-tighter">{title}</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input
            type="text"
            placeholder="Command search..."
            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none focus:bg-white focus:border-blue-500/20 w-64 transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl relative transition-all">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
          </button>
          
          <div className="h-6 w-px bg-slate-100 mx-2"></div>
          
          <div className="flex items-center gap-3 pl-2 group cursor-pointer">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-black text-slate-900 leading-tight uppercase tracking-tight">{user.name}</p>
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{user.role.replace('_', ' ')}</p>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 group-hover:border-blue-400 group-hover:bg-blue-50 transition-all overflow-hidden">
              <User size={20} className="text-slate-400 group-hover:text-blue-600" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
