'use client';

import React, { useState, useEffect } from 'react';
import { User, Plus, Download, Search } from 'lucide-react';
import { Card, Badge, Button, Input, DataTable, Skeleton } from '@/components/UIComponents';

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Leads Central</h2>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">Lifecycle management for all inquiries</p>
        </div>
        <div className="flex gap-2">
           <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500">
                  <User size={14} />
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[8px] font-black text-white">+{leads.length}</div>
           </div>
           <Button className="gap-2 shadow-none"><Plus size={18} /> New Inquiry</Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
           <div className="flex gap-4 items-center">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                 {['All', 'Hot', 'Interested', 'Closed'].map(t => (
                   <button key={t} className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white/50 transition-colors">
                     {t}
                   </button>
                 ))}
              </div>
              <Input placeholder="Filter by phone/name..." className="w-48" />
           </div>
           <Button variant="outline" size="sm" className="gap-2"><Download size={14} /> Report</Button>
        </div>
        <DataTable headers={['Prospect Info', 'Inquiry Property', 'Assigned To', 'Status', 'Last Contact']}>
          {isLoading ? (
            <tr><td colSpan={5} className="px-6 py-4 text-center text-slate-400 font-bold">Loading leads...</td></tr>
          ) : leads.length === 0 ? (
            <tr><td colSpan={5} className="px-6 py-4 text-center text-slate-400 font-bold">No leads found</td></tr>
          ) : (
            leads.map(l => (
              <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-slate-900">{l.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{l.phone}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs font-black text-slate-700">{l.propertyOfInterest || l.property?.title}</p>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{l.source}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                     <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><User size={12} /></div>
                     <p className="text-xs font-bold text-slate-600">Rahul J.</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={l.status === 'Closed' ? 'success' : l.status === 'New' ? 'info' : 'warning'}>{l.status}</Badge>
                </td>
                <td className="px-6 py-4 text-xs font-bold text-slate-500">{new Date(l.createdAt).toLocaleDateString()}</td>
              </tr>
            ))
          )}
        </DataTable>
      </Card>
    </div>
  );
}

