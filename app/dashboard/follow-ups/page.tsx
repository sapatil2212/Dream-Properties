'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/types';
import { TelecallerDashboard } from '@/components/dashboard/StaffDashboards';

export default function FollowUpsPage() {
  const { data: session } = useSession();

  if (!session) return null;

  const role = session.user.role;

  if (role === (UserRole as any).TELECALLER) {
    return <TelecallerDashboard compact />;
  }

  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-slate-500 font-bold uppercase tracking-widest">Follow-ups are available for telecaller accounts</p>
    </div>
  );
}
