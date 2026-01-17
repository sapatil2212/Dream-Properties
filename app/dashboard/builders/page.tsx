'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, Search, Filter, Plus, Eye, Edit3, Power, CheckCircle 
} from 'lucide-react';
import { 
  Card, Badge, Button, Input, Modal, DataTable, Skeleton 
} from '@/components/UIComponents';

export default function BuildersPage() {
  const [showAddBuilder, setShowAddBuilder] = useState(false);
  const [builders, setBuilders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilder, setSelectedBuilder] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchBuilders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/superadmin/accounts-summary');
      if (response.ok) {
        const data = await response.json();
        setBuilders(data.builders || []);
      } else {
        setError('Failed to fetch builders');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuilders();
  }, []);

  const handleToggleStatus = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Disabled' : 'Active';
    try {
      const response = await fetch('/api/superadmin/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus })
      });
      if (response.ok) {
        setSuccessMsg(`Builder ${newStatus === 'Active' ? 'enabled' : 'disabled'} successfully`);
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchBuilders();
      }
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const filteredBuilders = builders.filter(b => 
    b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.projectName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 text-emerald-700">
          <CheckCircle size={18} className="shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-600">
          <div className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-rose-600" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Partner Builders</h2>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">Manage network developers and verification</p>
        </div>
        <Button onClick={() => setShowAddBuilder(true)} className="gap-2">
          <Plus size={18} /> Onboard Builder
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex gap-2">
            <Input 
              placeholder="Search builders..." 
              className="w-64" 
              icon={<Search size={14} />} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="ghost" size="icon" className="border border-slate-100"><Filter size={16} /></Button>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total: {filteredBuilders.length}</p>
        </div>
        <DataTable headers={['Builder Profile', 'Project Info', 'Contact', 'Status', 'Actions']}>
          {isLoading ? (
            <tr><td colSpan={5} className="text-center py-10"><Skeleton className="h-4 w-full" /></td></tr>
          ) : filteredBuilders.length === 0 ? (
            <tr><td colSpan={5} className="text-center py-10 text-slate-400 text-sm">No builders found</td></tr>
          ) : (
            filteredBuilders.map(b => (
              <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 border border-blue-200 flex items-center justify-center">
                      <Building2 size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{b.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{b.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs font-black text-slate-700">{b.projectName || 'N/A'}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{b.propertyType || 'Not specified'}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs font-bold text-slate-600">{b.mobile}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{new Date(b.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={b.status === 'Active' ? 'success' : 'error'}>{b.status}</Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setSelectedBuilder(b); setShowDetailModal(true); }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => { setSelectedBuilder(b); setShowEditModal(true); }}
                      className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                      title="Edit Builder"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(b.id, b.status)}
                      className={`p-2 rounded-lg transition-all ${
                        b.status === 'Active' 
                          ? 'text-rose-600 hover:bg-rose-50' 
                          : 'text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={b.status === 'Active' ? 'Disable Builder' : 'Enable Builder'}
                    >
                      <Power size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </DataTable>
      </Card>

      {/* Builder Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Builder Details">
        {selectedBuilder && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Full Name</p>
                <p className="text-sm font-bold text-slate-900">{selectedBuilder.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Email</p>
                <p className="text-sm font-bold text-slate-900">{selectedBuilder.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Mobile</p>
                <p className="text-sm font-bold text-slate-900">{selectedBuilder.mobile}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                <Badge variant={selectedBuilder.status === 'Active' ? 'success' : 'error'}>{selectedBuilder.status}</Badge>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Firm Name</p>
                <p className="text-sm font-bold text-slate-900">{selectedBuilder.projectName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Property Type</p>
                <p className="text-sm font-bold text-slate-900">{selectedBuilder.propertyType || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Office Address</p>
                <p className="text-sm font-bold text-slate-900">{selectedBuilder.propertyAddress || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Registered On</p>
                <p className="text-sm font-bold text-slate-900">{new Date(selectedBuilder.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button onClick={() => setShowDetailModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Builder Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Builder Information">
        {selectedBuilder && (
          <div className="space-y-4">
            <Input 
              label="Full Name" 
              defaultValue={selectedBuilder.name}
              placeholder="Builder name"
              readOnly
            />
            <Input 
              label="Firm Name" 
              defaultValue={selectedBuilder.projectName}
              placeholder="Firm name"
              readOnly
            />
            <Input 
              label="Office Address" 
              defaultValue={selectedBuilder.propertyAddress}
              placeholder="Office address"
              readOnly
            />
            <p className="text-[10px] text-slate-500 italic font-bold uppercase tracking-wider">Note: Builder details are verified at registration. Manual edits are restricted.</p>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button className="px-8" onClick={() => setShowEditModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Builder Modal */}
      <Modal isOpen={showAddBuilder} onClose={() => setShowAddBuilder(false)} title="Partner Onboarding">
         <div className="space-y-4">
            <p className="text-sm text-slate-500 mb-4">Builders can self-register through the main sign-up page. Use this form only for manual verification.</p>
            <Input label="Company Official Name" placeholder="e.g. Skyline Group Pvt Ltd" />
            <Input label="RERA Registration ID" placeholder="PRM/NA/..." />
            <div className="grid grid-cols-2 gap-4">
               <Input label="Primary Contact" placeholder="Point of Contact" />
               <Input label="Phone Number" placeholder="+91 XXXXX XXXXX" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setShowAddBuilder(false)}>Cancel</Button>
              <Button className="px-8" onClick={() => setShowAddBuilder(false)}>Verify & Add</Button>
            </div>
         </div>
      </Modal>
    </div>
  );
}
