'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/types';
import { SuperAdminDashboard } from '@/components/dashboard/SuperAdminDashboard';
import { BuilderDashboard } from '@/components/dashboard/BuilderDashboard';
import { TelecallerDashboard, SalesExecutiveDashboard } from '@/components/dashboard/StaffDashboards';

export default function DashboardPage() {
  const { data: session } = useSession();

  if (!session) return null;

  const role = session.user.role;

  if (role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN) {
    return <SuperAdminDashboard />;
  }

  if (role === UserRole.BUILDER) {
    return <BuilderDashboard />;
  }

  if (role === (UserRole as any).TELECALLER) {
    return <TelecallerDashboard />;
  }

  if (role === (UserRole as any).SALES_EXECUTIVE) {
    return <SalesExecutiveDashboard />;
  }

  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-slate-500 font-bold uppercase tracking-widest">Select an option from the menu</p>
    </div>
  );
}
