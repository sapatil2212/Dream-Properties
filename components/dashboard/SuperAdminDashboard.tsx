'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, User, Briefcase, Building2, Download, ArrowUpRight 
} from 'lucide-react';
import { 
  Card, Button, DataTable, Badge, StatCard, Skeleton 
} from '@/components/UIComponents';
import Link from 'next/link';

export function SuperAdminDashboard() {
  const [isExporting, setIsExporting] = useState(false);
  const [dataSummary, setDataSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/superadmin/accounts-summary');
        if (response.ok) {
          const data = await response.json();
          setDataSummary(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const stats = dataSummary ? {
    total: dataSummary.total,
    buyers: dataSummary.buyers?.length || 0,
    staff: dataSummary.staff?.length || 0,
    builders: dataSummary.builders?.length || 0
  } : { total: 0, buyers: 0, staff: 0, builders: 0 };

  const recentAccounts = dataSummary ? [
    ...(dataSummary.buyers || []),
    ...(dataSummary.builders || []),
    ...(dataSummary.staff || [])
  ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5) : [];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Accounts" value={stats.total.toString()} trend="+12%" icon={<Users className="text-blue-600" size={20} />} color="bg-blue-50" />
        <StatCard label="Buyer / Users" value={stats.buyers.toString()} trend="+8%" icon={<User size={20} className="text-indigo-600" />} color="bg-indigo-50" />
        <StatCard label="Agency Staff" value={stats.staff.toString()} trend="+4%" icon={<Briefcase size={20} className="text-amber-600" />} color="bg-amber-50" />
        <StatCard label="Partner Builders" value={stats.builders.toString()} trend="+18%" icon={<Building2 className="text-emerald-600" size={20} />} color="bg-emerald-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black uppercase tracking-tight text-slate-900">Recent Registrations</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" isLoading={isExporting} onClick={() => {
                  setIsExporting(true);
                  setTimeout(() => setIsExporting(false), 2000);
                }}>
                  <Download size={14} className="mr-2" /> Export
                </Button>
              </div>
            </div>
            <DataTable headers={['Name', 'Role', 'Joined', 'Status', 'Actions']}>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10"><Skeleton className="h-4 w-full" /></td></tr>
              ) : recentAccounts.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10">No recent activity</td></tr>
              ) : (
                recentAccounts.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 group transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                          <User size={18} className="text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{u.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{u.role.replace('_', ' ')}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <Badge variant={u.status === 'Active' ? 'success' : 'error'}>{u.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Link href="/dashboard/users">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <ArrowUpRight size={16} />
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </DataTable>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6">
            <h3 className="font-black uppercase tracking-tight text-slate-900 mb-6">Revenue Distribution</h3>
            <div className="space-y-6">
              {[
                { label: 'Platform Subs', amount: '₹4.2M', percentage: 34, color: 'bg-blue-500' },
                { label: 'Commission Fees', amount: '₹6.8M', percentage: 55, color: 'bg-emerald-500' },
                { label: 'Premium Listings', amount: '₹1.4M', percentage: 11, color: 'bg-amber-500' },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-tight">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="text-slate-900">{item.amount}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      className={`h-full ${item.color}`} 
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-8 rounded-xl border-slate-100 text-slate-400">View Detailed Report</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
