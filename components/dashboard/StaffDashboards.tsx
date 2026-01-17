'use client';

import React, { useState, useEffect } from 'react';
import { PhoneCall, CalendarCheck, Search, Filter, MessageSquare, ArrowUpRight, Users } from 'lucide-react';
import { Card, Badge, Button, Input, DataTable, StatCard, Skeleton } from '@/components/UIComponents';

export function TelecallerDashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads?status=New');
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
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="My Queue" value={leads.length.toString()} trend="+3 new" icon={<PhoneCall size={20} className="text-blue-600" />} color="bg-blue-50" />
        <StatCard label="Calls Done" value="0" trend="+0% today" icon={<MessageSquare size={20} className="text-emerald-600" />} color="bg-emerald-50" />
        <StatCard label="Site Visits" value="0" trend="Scheduled" icon={<CalendarCheck size={20} className="text-amber-600" />} color="bg-amber-50" />
      </div>

      <Card>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-black uppercase tracking-tight text-slate-900">Lead Assignment Queue</h3>
          <div className="flex gap-2">
            <Input placeholder="Search phone..." className="w-48" />
            <Button variant="ghost" size="icon" className="border border-slate-100"><Filter size={16} /></Button>
          </div>
        </div>
        <DataTable headers={['Prospect', 'Interest', 'Source', 'Status', 'Actions']}>
          {isLoading ? (
            <tr><td colSpan={5} className="px-6 py-4 text-center"><Skeleton className="h-4 w-full" /></td></tr>
          ) : leads.length === 0 ? (
            <tr><td colSpan={5} className="px-6 py-4 text-center text-slate-400 font-bold">No leads in queue</td></tr>
          ) : (
            leads.map(l => (
              <tr key={l.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-slate-900">{l.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{l.phone}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs font-black text-slate-700">{l.propertyOfInterest || l.property?.title}</p>
                </td>
                <td className="px-6 py-4 text-xs font-bold text-slate-500">{l.source}</td>
                <td className="px-6 py-4">
                  <Badge variant="warning">{l.status}</Badge>
                </td>
                <td className="px-6 py-4">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><PhoneCall size={16} /></button>
                </td>
              </tr>
            ))
          )}
        </DataTable>
      </Card>
    </div>
  );
}

export function SalesExecutiveDashboard() {
  const [visits, setVisits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVisits = async () => {
    try {
      const response = await fetch('/api/site-visits?status=Scheduled');
      if (response.ok) {
        const data = await response.json();
        setVisits(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="My Pipeline" value="₹0" trend="Est. Value" icon={<ArrowUpRight size={20} className="text-blue-600" />} color="bg-blue-50" />
        <StatCard label="Site Visits" value={visits.length.toString()} trend="This Week" icon={<CalendarCheck size={20} className="text-emerald-600" />} color="bg-emerald-50" />
        <StatCard label="Hot Leads" value="0" trend="To Follow-up" icon={<Users size={20} className="text-rose-600" />} color="bg-rose-50" />
      </div>

      <Card>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-black uppercase tracking-tight text-slate-900">Upcoming Site Visits</h3>
        </div>
        <DataTable headers={['Client', 'Property', 'Date & Time', 'Status']}>
          {isLoading ? (
            <tr><td colSpan={4} className="px-6 py-4 text-center"><Skeleton className="h-4 w-full" /></td></tr>
          ) : visits.length === 0 ? (
            <tr><td colSpan={4} className="px-6 py-4 text-center text-slate-400 font-bold">No visits scheduled</td></tr>
          ) : (
            visits.map((v, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-bold text-slate-900">{v.lead?.name}</td>
                <td className="px-6 py-4 text-xs font-black text-blue-600 uppercase">{v.property?.title}</td>
                <td className="px-6 py-4 text-xs font-bold text-slate-600">{new Date(v.visitDate).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <Badge variant={v.status === 'Confirmed' ? 'success' : 'warning'}>{v.status}</Badge>
                </td>
              </tr>
            ))
          )}
        </DataTable>
      </Card>
    </div>
  );
}

