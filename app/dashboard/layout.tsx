'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, usePathname } from 'next/navigation';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { UserRole } from '@/types';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    redirect('/login');
  }

  // Generic roles check (Removed restriction for BUYER to allow access to profile settings/favorites)
  // if (session.user.role === (UserRole as any).BUYER) {
  //   redirect('/');
  // }

  const title = pathname.split('/').pop()?.replace('-', ' ').toUpperCase() || 'DASHBOARD';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar 
        role={session.user.role as UserRole} 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
      />
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        <DashboardHeader 
          title={title} 
          user={{ name: session.user.name || 'User', role: session.user.role }} 
        />
        <main className="p-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
