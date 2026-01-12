import React from 'react';
import { ChevronRight, Bell, Search, User, LogOut, LayoutGrid, Command } from 'lucide-react';
import { UserRole } from '../types.ts';
import { NAV_ITEMS } from '../constants.tsx';
import { Link, useLocation } from 'react-router-dom';

export const Sidebar: React.FC<{ role: UserRole, collapsed: boolean, setCollapsed: (c: boolean) => void, onLogout: () => void }> = ({ role, collapsed, setCollapsed, onLogout }) => {
  const items = NAV_ITEMS[role];
  const location = useLocation();

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
              to={item.href}
              className={`flex items-center p-2.5 rounded-xl transition-all group relative ${
                location.pathname === item.href
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className={`${collapsed ? 'mx-auto' : 'mr-3'} transition-transform group-hover:scale-110`}>{item.icon}</div>
              {!collapsed && <span className="text-[11px] font-black uppercase tracking-wider">{item.label}</span>}
              {!collapsed && location.pathname === item.href && (
                 <div className="absolute right-3 w-1.5 h-1.5 bg-white/40 rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
           <button
            onClick={onLogout}
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
};

export const DashboardHeader: React.FC<{ title: string, user: { name: string, role: string } }> = ({ title, user }) => (
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