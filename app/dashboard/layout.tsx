'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect, usePathname } from 'next/navigation';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { UserRole } from '@/types';
import { Menu } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [collapsed, setCollapsed] = useState(false); // Default to expanded on desktop
  const pathname = usePathname();
  
  // Set sidebar to collapsed by default on mobile screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Force collapsed state on mobile
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setCollapsed(true);
    }
  }, [pathname]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    redirect('/login');
  }

  const title = pathname?.split('/').pop()?.replace('-', ' ').toUpperCase() || 'DASHBOARD';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar 
        role={session.user.role as UserRole} 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
      />
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-0 lg:ml-20' : 'ml-0 lg:ml-64'} w-full`}>
        <DashboardHeader 
          title={title} 
          user={{ name: session.user.name || 'User', role: session.user.role }}
          onMenuClick={() => setCollapsed(!collapsed)}
          isSidebarCollapsed={collapsed}
        />
        <main className="p-4 sm:p-6 lg:p-8 max-w-full lg:max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
