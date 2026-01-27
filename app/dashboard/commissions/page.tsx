'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select } from '@/components/UIComponents';
import { Search, Filter, Download } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function CommissionsPage() {
  const { data: session } = useSession();
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/commissions');
      if (res.ok) {
        const data = await res.json();
        setCommissions(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, []);

  const filteredCommissions = commissions.filter(c => {
    const matchesSearch = 
        c.lead?.name?.toLowerCase().includes(search.toLowerCase()) || 
        c.lead?.propertyOfInterest?.toLowerCase().includes(search.toLowerCase()) ||
        c.channelPartner?.user?.name?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCommission = filteredCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Commissions</h1>
          <p className="text-slate-500 text-sm">Track earnings and deal status</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-semibold text-sm">
            Total Value: ₹{totalCommission.toLocaleString()}
        </div>
      </div>

      <Card className="p-4 border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input 
            placeholder="Search lead, property or partner..." 
            className="pl-9" 
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
             <select 
                className="h-10 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
            >
                <option value="ALL">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Paid">Paid</option>
            </select>
            <Button variant="outline" title="Export">
                <Download size={16} />
            </Button>
        </div>
      </Card>

      <Card className="overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">Lead Details</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Partner</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Deal Value</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Commission</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading commissions...</td></tr>
              ) : filteredCommissions.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No commissions found</td></tr>
              ) : (
                filteredCommissions.map(comm => (
                  <tr key={comm.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{comm.lead?.name || 'Unknown Lead'}</div>
                      <div className="text-xs text-slate-500">{comm.lead?.propertyOfInterest}</div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="font-medium">{comm.channelPartner?.user?.name || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                        ₹{comm.dealValue?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                        <div className="font-bold text-green-700">₹{comm.commissionAmount?.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400">{comm.commissionRate}% Rate</div>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                            ${comm.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                              comm.status === 'Approved' ? 'bg-blue-100 text-blue-700' : 
                              'bg-orange-100 text-orange-700'}`}>
                            {comm.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500 text-xs">
                        {new Date(comm.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
