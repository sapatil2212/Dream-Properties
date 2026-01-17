'use client';

import React from 'react';
import { BarChart4 } from 'lucide-react';
import { Button } from '@/components/UIComponents';

export default function ReportsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center">
        <BarChart4 size={40} />
      </div>
      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Analytics Dashboard</h3>
      <p className="text-slate-500 text-sm font-medium max-w-md">Detailed performance metrics and conversion graphs are being generated for this cycle.</p>
      <Button variant="outline">Refresh Data</Button>
    </div>
  );
}
