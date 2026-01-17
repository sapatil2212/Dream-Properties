'use client';

import React, { useState, useEffect } from 'react';
import { 
  Download, Eye, Trash2, Search 
} from 'lucide-react';
import { 
  Card, Badge, Button, DataTable, Skeleton 
} from '@/components/UIComponents';

export default function InventoryManagementPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/superadmin/properties-for-approval');
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (err) { 
      console.error(err); 
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { 
    fetchProperties(); 
  }, []);

  const handleApproval = async (propertyId: number, status: string) => {
    try {
      const response = await fetch('/api/superadmin/approve-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, status })
      });
      if (response.ok) {
        alert(`Property ${status.toLowerCase()} successfully`);
        fetchProperties();
      }
    } catch (err) { 
      alert('Failed to update property status'); 
    }
  };

  const handleDelete = async (propertyId: number) => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/superadmin/delete-property/${propertyId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        alert('Property deleted successfully');
        fetchProperties();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete property');
      }
    } catch (err) {
      alert('Failed to delete property');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Global Inventory</h2>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">Review and approve property submissions</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="gap-2"><Download size={16} /> Export CSV</Button>
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-black uppercase tracking-tight text-slate-900">Property Approval Queue</h3>
        </div>
        <DataTable headers={['Property Detail', 'Builder', 'Type', 'Price', 'Status', 'Actions']}>
          {isLoading ? (
            <tr><td colSpan={6} className="text-center py-10"><Skeleton className="h-4 w-full" /></td></tr>
          ) : properties.length === 0 ? (
            <tr><td colSpan={6} className="text-center py-10 text-slate-400">No properties in queue</td></tr>
          ) : (
            properties.map(p => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-slate-900">{p.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{p.location}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs font-bold text-slate-700">{p.builder_name}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{p.builder_email}</p>
                </td>
                <td className="px-6 py-4 text-xs font-black text-blue-600 uppercase">{p.type}</td>
                <td className="px-6 py-4 font-bold text-slate-900">{p.price}</td>
                <td className="px-6 py-4">
                  <Badge variant={p.status === 'Approved' ? 'success' : p.status === 'Rejected' ? 'error' : 'warning'}>
                    {p.status}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {p.status === 'Pending Approval' && (
                      <>
                        <Button variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8 text-[10px]" onClick={() => handleApproval(p.id, 'Approved')}>Approve</Button>
                        <Button variant="outline" size="sm" className="text-rose-600 border-rose-100 hover:bg-rose-50 h-8 text-[10px]" onClick={() => handleApproval(p.id, 'Rejected')}>Reject</Button>
                      </>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><Eye size={16} /></Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      onClick={() => handleDelete(p.id)}
                      title="Delete Property"
                    >
                      <Trash2 size={16} />
                    </Button>
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
