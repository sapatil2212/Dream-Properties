'use client';

import React from 'react';
import { IndianRupee, Briefcase, Calendar } from 'lucide-react';
import { Card, Badge, DataTable, StatCard } from '@/components/UIComponents';
import { MOCK_TRANSACTIONS } from '@/constants';

export default function FinancePage() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Revenue" value="₹1.24 Cr" trend="+15%" icon={<IndianRupee className="text-emerald-600" size={20} />} color="bg-emerald-50" />
        <StatCard label="Builder Subs" value="₹42.5k" trend="+5%" icon={<Briefcase className="text-blue-600" size={20} />} color="bg-blue-50" />
        <StatCard label="Pending Payouts" value="₹12.8k" trend="-2%" trendUp={false} icon={<Calendar className="text-amber-600" size={20} />} color="bg-amber-50" />
      </div>

      <Card>
        <div className="p-6 border-b border-slate-100">
           <h3 className="font-black uppercase tracking-tight text-slate-900">Transaction History</h3>
        </div>
        <DataTable headers={['Reference', 'Date', 'Amount', 'Type', 'Status']}>
           {MOCK_TRANSACTIONS.map(tx => (
             <tr key={tx.id} className="hover:bg-slate-50">
               <td className="px-6 py-4">
                 <p className="text-sm font-bold text-slate-900">{tx.description}</p>
                 <p className="text-[10px] text-slate-400 font-bold uppercase">TXN_{tx.id.toUpperCase()}</p>
               </td>
               <td className="px-6 py-4 text-xs font-bold text-slate-600">{tx.date}</td>
               <td className="px-6 py-4">
                 <p className="text-sm font-black text-slate-900">₹{(tx.amount/1000).toFixed(1)}k</p>
               </td>
               <td className="px-6 py-4">
                 <Badge variant="neutral">{tx.type}</Badge>
               </td>
               <td className="px-6 py-4">
                 <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{tx.status}</span>
                 </div>
               </td>
             </tr>
           ))}
        </DataTable>
      </Card>
    </div>
  );
}
