'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Eye, TrendingUp, Plus, Trash2 
} from 'lucide-react';
import { 
  Card, Button, DataTable, Badge, StatCard, Skeleton 
} from '@/components/UIComponents';
import Link from 'next/link';

export function BuilderDashboard() {
  const [stats, setStats] = useState({ properties: 0, leads: 0, views: 0, conversions: 0 });
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyProperties = async () => {
    try {
      const response = await fetch('/api/builder/my-properties');
      if (response.ok) {
        const data = await response.json();
        setMyProperties(data);
        setStats(prev => ({ ...prev, properties: data.length }));
      }
    } catch (err) { 
      console.error(err); 
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { 
    fetchMyProperties(); 
  }, []);

  const handleDeleteProperty = async (propertyId: number) => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/superadmin/delete-property/${propertyId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Property deleted successfully');
        fetchMyProperties();
      } else {
        alert('Failed to delete property');
      }
    } catch (err) {
      alert('Failed to delete property');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Builder Insights</h2>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">Performance overview for your active listings</p>
        </div>
        <Link href="/dashboard/post-property">
          <Button className="gap-2">
            <Plus size={18} /> Post New Property
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Properties" value={stats.properties.toString()} trend="+2" icon={<Building2 className="text-blue-600" size={20} />} color="bg-blue-50" />
        <StatCard label="Total Leads" value={stats.leads.toString()} trend="+12%" icon={<Users size={20} className="text-indigo-600" />} color="bg-indigo-50" />
        <StatCard label="Property Views" value={stats.views.toString()} trend="+24%" icon={<Eye size={20} className="text-amber-600" />} color="bg-amber-50" />
        <StatCard label="Conversion Rate" value={`${stats.conversions}%`} trend="+5%" icon={<TrendingUp className="text-emerald-600" size={20} />} color="bg-emerald-50" />
      </div>

      <Card>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-black uppercase tracking-tight text-slate-900">Your Inventory</h3>
        </div>
        <DataTable headers={['Property', 'Type', 'Price', 'Status', 'Views', 'Actions']}>
          {isLoading ? (
            <tr><td colSpan={6} className="text-center py-10"><Skeleton className="h-4 w-full" /></td></tr>
          ) : myProperties.length === 0 ? (
            <tr><td colSpan={6} className="text-center py-10 text-slate-400">No properties posted yet</td></tr>
          ) : (
            myProperties.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-slate-900">{p.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{p.location}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{p.type}</p>
                </td>
                <td className="px-6 py-4 font-bold text-slate-900">{p.price}</td>
                <td className="px-6 py-4">
                  <Badge variant={p.status === 'Approved' ? 'success' : p.status === 'Rejected' ? 'error' : 'warning'}>{p.status}</Badge>
                </td>
                <td className="px-6 py-4 text-xs font-bold text-slate-600">0</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link href={`/properties/${p.id}`}>
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Eye size={16} /></button>
                    </Link>
                    <button 
                      onClick={() => handleDeleteProperty(p.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </DataTable>
      </Card>
    </div>
  );
}
