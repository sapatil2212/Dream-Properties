'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, Eye, TrendingUp, Plus, Trash2, Edit2, Flag, Star 
} from 'lucide-react';
import { 
  Card, Button, DataTable, Badge, StatCard, Skeleton, Alert, ConfirmDialog 
} from '@/components/UIComponents';
import Link from 'next/link';

export function BuilderDashboard() {
  const [stats, setStats] = useState({ properties: 0, leads: 0, views: 0, conversions: 0 });
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchMyProperties = async () => {
    try {
      const response = await fetch('/api/builder/my-properties');
      if (response.ok) {
        const data = await response.json();
        setMyProperties(data);
        
        // Calculate total views from all properties
        const totalViews = data.reduce((sum: number, property: any) => sum + (property.views || 0), 0);
        
        setStats(prev => ({ 
          ...prev, 
          properties: data.length,
          views: totalViews
        }));
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
    try {
      const response = await fetch(`/api/superadmin/delete-property/${propertyId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setAlertConfig({
          type: 'success',
          title: 'Property Deleted',
          message: 'The property has been deleted successfully.',
        });
        setShowAlert(true);
        fetchMyProperties();
      } else {
        const data = await response.json();
        setAlertConfig({
          type: 'error',
          title: 'Delete Failed',
          message: data.message || 'Failed to delete property.',
        });
        setShowAlert(true);
      }
    } catch (err) {
      setAlertConfig({
        type: 'error',
        title: 'Network Error',
        message: 'Failed to delete property. Please try again.',
      });
      setShowAlert(true);
    }
  };

  const openDeleteConfirm = (propertyId: number) => {
    setDeleteTargetId(propertyId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    await handleDeleteProperty(deleteTargetId);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
    setDeleteTargetId(null);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard label="Total Properties" value={stats.properties.toString()} trend="+2" icon={<Building2 className="text-blue-600" size={20} />} color="bg-blue-50" />
        <StatCard label="Property Views" value={stats.views.toString()} trend="+24%" icon={<Eye size={20} className="text-amber-600" />} color="bg-amber-50" />
        <StatCard label="Conversion Rate" value={`${stats.conversions}%`} trend="+5%" icon={<TrendingUp className="text-emerald-600" size={20} />} color="bg-emerald-50" />
      </div>

      <Card>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-black uppercase tracking-tight text-slate-900">Your Inventory</h3>
        </div>
        <DataTable headers={['Property', 'Type', 'Price', 'Status', 'Featured', 'Sold/Rented', 'Views', 'Actions']}>
          {isLoading ? (
            <tr><td colSpan={8} className="text-center py-10"><Skeleton className="h-4 w-full" /></td></tr>
          ) : myProperties.length === 0 ? (
            <tr><td colSpan={8} className="text-center py-10 text-slate-400">No properties posted yet</td></tr>
          ) : (
            myProperties.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-3 py-2">
                  <p className="text-xs font-bold text-slate-900">{p.title}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">{p.location}</p>
                </td>
                <td className="px-3 py-2">
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{p.type}</p>
                </td>
                <td className="px-3 py-2 text-sm font-bold text-slate-900">{p.price}</td>
                <td className="px-3 py-2">
                  <Badge variant={p.status === 'Approved' ? 'success' : p.status === 'Rejected' ? 'error' : 'warning'} className="text-[10px] px-2 py-0.5">
                    {p.status === 'Pending_Approval' ? 'Pending Approval' : p.status}
                  </Badge>
                </td>
                <td className="px-3 py-2">
                  {p.isFeatured ? (
                    <span className="flex items-center gap-1 text-amber-500 font-bold text-[10px]">
                      <Star size={12} className="fill-amber-500" />
                      Featured
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">-</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {p.propertyFlag ? (
                    <div className="flex items-center gap-1">
                      <Flag size={12} className="text-orange-600" />
                      <span className="text-[10px] font-bold text-orange-600 uppercase">{p.propertyFlag}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400">-</span>
                  )}
                </td>
                <td className="px-3 py-2 text-[11px] font-bold text-slate-600">{p.views || 0}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <Link href={`/properties/${p.id}`}>
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View Property">
                        <Eye size={16} />
                      </button>
                    </Link>
                    {!p.propertyFlag && (
                      <>
                        <Link href={`/dashboard/post-property?id=${p.id}`}>
                          <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Edit Property">
                            <Edit2 size={16} />
                          </button>
                        </Link>
                        <button 
                          onClick={() => openDeleteConfirm(p.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete Property"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </DataTable>
      </Card>
      <Alert
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        autoClose={alertConfig.type === 'success'}
        duration={3000}
      />
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          if (isDeleting) return;
          setShowDeleteConfirm(false);
          setDeleteTargetId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Property"
        message="Are you sure you want to delete this property? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
