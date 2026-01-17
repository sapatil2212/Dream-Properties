'use client';

import React from 'react';
import { User, ShieldCheck } from 'lucide-react';
import { Card, Button, Input } from '@/components/UIComponents';

export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <Card className="p-8">
         <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-400 border border-slate-200">
               <User size={32} />
            </div>
            <div>
               <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">System Settings</h3>
               <p className="text-sm font-medium text-slate-500">Configure your global platform preferences</p>
            </div>
         </div>
         <div className="space-y-4">
            <Input label="Platform Name" defaultValue="Dream Properties SaaS" />
            <Input label="Support Email" defaultValue="dreampropertiesnsk@gmail.com" />
            <div className="pt-4 flex justify-end">
              <Button>Save Preferences</Button>
            </div>
         </div>
      </Card>
      
      <Card className="p-8 border-rose-100">
         <h4 className="text-sm font-black text-rose-600 uppercase tracking-widest mb-4">Security Zone</h4>
         <div className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-100">
            <div className="flex items-center gap-3">
               <ShieldCheck className="text-rose-600" />
               <p className="text-xs font-bold text-rose-900">Two-Factor Authentication is currently inactive.</p>
            </div>
            <Button variant="danger" size="sm">Enable</Button>
         </div>
      </Card>
    </div>
  );
}
