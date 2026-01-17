'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, Eye, Edit3, Power, Send, Search, Filter 
} from 'lucide-react';
import { 
  Card, Badge, Button, Input, Modal, DataTable, EmptyState, Skeleton 
} from '@/components/UIComponents';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/superadmin/accounts-summary');
      if (response.ok) {
        const data = await response.json();
        // Flatten categories for the table
        const allUsers = [
          ...(data.buyers || []),
          ...(data.builders || []),
          ...(data.staff || []),
          ...(data.others || [])
        ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setUsers(allUsers);
      } else {
        setError('Failed to fetch accounts');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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
        setSuccessMsg(`User ${newStatus === 'Active' ? 'enabled' : 'disabled'} successfully`);
        setTimeout(() => setSuccessMsg(''), 3000);
        fetchUsers();
      }
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleSendCredentials = async (email: string) => {
    try {
      setSuccessMsg('Sending credentials...');
      const response = await fetch('/api/superadmin/send-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (response.ok) {
        setSuccessMsg('Login details sent to ' + email);
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setError('Failed to send credentials');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.mobile?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Accounts Management</h2>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">Real-time directory of all platform users and agency staff</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100 flex justify-between items-center">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-900 hover:scale-110">×</button>
        </div>
      )}
      
      {error && (
        <div className="p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-100 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-rose-900 hover:scale-110">×</button>
        </div>
      )}

      <Card>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex gap-2">
            <Input 
              placeholder="Search accounts..." 
              className="w-64" 
              icon={<Search size={14} />} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="ghost" size="icon" className="border border-slate-100"><Filter size={16} /></Button>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total: {filteredUsers.length}</p>
        </div>
        <div className="overflow-x-auto">
          <DataTable headers={['User Detail', 'Role', 'Mobile', 'Status', 'Joined', 'Actions']}>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-10"><Skeleton className="h-4 w-full" /></td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10"><EmptyState title="No users found" message="No registered accounts found in the system." /></td></tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{u.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] text-blue-600 font-black tracking-widest uppercase">{u.role.replace('_', ' ')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] text-slate-600 font-bold">{u.mobile || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={u.status === 'Active' ? 'success' : 'error'}>{u.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-bold text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedUser(u); setShowDetailModal(true); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => { setSelectedUser(u); setShowEditModal(true); }}
                        className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                        title="Edit User"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u.id, u.status)}
                        className={`p-2 rounded-lg transition-all ${u.status === 'Active' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                        title={u.status === 'Active' ? 'Disable Account' : 'Enable Account'}
                      >
                        <Power size={16} />
                      </button>
                      {['ADMIN', 'TELECALLER', 'SALES_EXECUTIVE'].includes(u.role) && (
                        <button
                          onClick={() => handleSendCredentials(u.email)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Send Login Credentials"
                        >
                          <Send size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </DataTable>
        </div>
      </Card>

      {/* User Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Account Details">
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                <User size={32} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">{selectedUser.name}</h2>
                <p className="text-sm text-slate-500">{selectedUser.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Role</p>
                <p className="text-sm font-bold text-slate-900">{selectedUser.role.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                <Badge variant={selectedUser.status === 'Active' ? 'success' : 'error'}>{selectedUser.status}</Badge>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Mobile</p>
                <p className="text-sm font-bold text-slate-900">{selectedUser.mobile || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Joined Date</p>
                <p className="text-sm font-bold text-slate-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              </div>
              {selectedUser.securityKey && (
                <div className="col-span-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Security Key</p>
                  <p className="text-sm font-mono font-bold bg-slate-100 px-3 py-2 rounded-lg text-slate-700">{selectedUser.securityKey}</p>
                </div>
              )}
              {selectedUser.role === 'BUILDER' && selectedUser.projectName && (
                <>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Firm Name</p>
                    <p className="text-sm font-bold text-slate-900">{selectedUser.projectName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Property Type</p>
                    <p className="text-sm font-bold text-slate-900">{selectedUser.propertyType}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Office Address</p>
                    <p className="text-sm font-bold text-slate-900">{selectedUser.propertyAddress}</p>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-100">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowDetailModal(false)}
              >
                Close
              </Button>
              <Button 
                variant="primary" 
                className="flex-1"
                onClick={() => { setShowDetailModal(false); setShowEditModal(true); }}
              >
                Edit User
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit User">
        {selectedUser && (
          <div className="space-y-4">
            <Input label="Name" value={selectedUser.name} readOnly />
            <Input label="Email" value={selectedUser.email} readOnly />
            <Input label="Mobile" value={selectedUser.mobile || ''} readOnly />
            <p className="text-[10px] text-slate-500 italic font-bold uppercase tracking-wider">Note: Profile editing is restricted to basic verification. Contact support for system-level changes.</p>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => setShowEditModal(false)}
            >
              Close
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
