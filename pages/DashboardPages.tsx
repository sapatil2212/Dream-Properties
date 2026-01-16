import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { UserRole, Lead, Property, Builder, Transaction } from '../types.ts';
import { MOCK_LEADS, MOCK_PROPERTIES, MOCK_BUILDERS, MOCK_TRANSACTIONS } from '../constants.tsx';
import { Card, Badge, Button, Input, Modal, DataTable, EmptyState, Skeleton, Select } from '../components/UIComponents.tsx';
import { 
  TrendingUp, Users, Home, IndianRupee, Phone, Calendar, 
  ArrowUpRight, MessageSquare, Plus, Building2, Eye, 
  MoreVertical, Search, Filter, Download, CheckCircle,
  CalendarCheck, MapPin, Handshake, Target, User, Trash2, 
  Edit3, Briefcase, BarChart4, ShieldCheck
} from 'lucide-react';

const StatCard: React.FC<{ label: string, value: string, trend: string, trendUp?: boolean, icon: React.ReactNode, color: string }> = ({ label, value, trend, trendUp = true, icon, color }) => (
  <Card className="p-6 group hover:border-blue-200 transition-all duration-300">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-3 rounded-2xl ${color} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {trendUp ? <ArrowUpRight size={14} /> : null} {trend}
      </div>
    </div>
    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{label}</p>
    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
  </Card>
);

export const SuperAdminDashboard: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [dataSummary, setDataSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/superadmin/accounts-summary', {
          credentials: 'include'
        });
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
    buyers: dataSummary.buyers.length,
    staff: dataSummary.staff.length,
    builders: dataSummary.builders.length
  } : { total: 0, buyers: 0, staff: 0, builders: 0 };

  const recentAccounts = dataSummary ? [
    ...dataSummary.buyers,
    ...dataSummary.builders,
    ...dataSummary.staff
  ].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5) : [];

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
                    <td className="px-6 py-4 text-xs font-bold text-slate-600">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <Badge variant={u.status === 'Active' ? 'success' : 'danger'}>{u.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Link to="/dashboard/users">
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
};

export const BuildersManagement: React.FC = () => {
  const [showAddBuilder, setShowAddBuilder] = useState(false);

  return (
    <div className="space-y-6">
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
            <Input placeholder="Search builders..." className="w-64" icon={<Search size={14} />} />
            <Button variant="ghost" size="icon" className="border border-slate-100"><Filter size={16} /></Button>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total: {MOCK_BUILDERS.length}</p>
        </div>
        <DataTable headers={['Builder Profile', 'Inventory', 'Verification', 'Last Active', 'Actions']}>
          {MOCK_BUILDERS.map(b => (
            <tr key={b.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <img src={b.logo} className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 object-cover" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{b.name}</p>
                    <p className="text-[10px] text-blue-600 font-bold uppercase tracking-tight">Corporate Partner</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-xs font-black text-slate-700">{b.totalInventory} Units</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{b.activeProjects} Active Projects</p>
              </td>
              <td className="px-6 py-4">
                <Badge variant={b.status === 'Active' ? 'success' : 'warning'}>{b.status}</Badge>
              </td>
              <td className="px-6 py-4 text-xs font-bold text-slate-500">2 days ago</td>
              <td className="px-6 py-4">
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="rounded-lg text-slate-400"><Edit3 size={16} /></Button>
                  <Button variant="ghost" size="icon" className="rounded-lg text-slate-400 hover:text-rose-600"><Trash2 size={16} /></Button>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </Card>

      <Modal isOpen={showAddBuilder} onClose={() => setShowAddBuilder(false)} title="Partner Onboarding">
         <div className="space-y-4">
            <Input label="Company Official Name" placeholder="e.g. Skyline Group Pvt Ltd" />
            <Input label="RERA Registration ID" placeholder="PRM/NA/..." />
            <div className="grid grid-cols-2 gap-4">
               <Input label="Primary Contact" placeholder="Point of Contact" />
               <Input label="Phone Number" placeholder="+91 XXXXX XXXXX" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setShowAddBuilder(false)}>Cancel</Button>
              <Button className="px-8" onClick={() => setShowAddBuilder(false)}>Verify & Add</Button>
            </div>
         </div>
      </Modal>
    </div>
  );
};

export const InventoryManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Global Inventory</h2>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">Monitor all live listings across the network</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="gap-2"><Download size={16} /> Export CSV</Button>
           <Button className="gap-2"><Plus size={18} /> Add Property</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_PROPERTIES.map(p => (
          <Card key={p.id} className="relative group">
            <div className="aspect-[16/9] overflow-hidden">
               <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-5">
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{p.title}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.location}</p>
                  </div>
                  <Badge variant={p.status === 'Fast Filling' ? 'warning' : 'success'}>{p.status}</Badge>
               </div>
               <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <p className="text-sm font-black text-blue-600">{p.price.split(' ')[0]}</p>
                  <div className="flex gap-2">
                     <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 text-slate-400"><Eye size={16} /></Button>
                     <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 text-slate-400"><Edit3 size={16} /></Button>
                  </div>
               </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const LeadsHub: React.FC = () => {
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
              <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[8px] font-black text-white">+12</div>
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
          {MOCK_LEADS.map(l => (
            <tr key={l.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <p className="text-sm font-bold text-slate-900">{l.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{l.phone}</p>
              </td>
              <td className="px-6 py-4">
                <p className="text-xs font-black text-slate-700">{l.propertyOfInterest}</p>
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
              <td className="px-6 py-4 text-xs font-bold text-slate-500">{l.date}</td>
            </tr>
          ))}
        </DataTable>
      </Card>
    </div>
  );
};

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/superadmin/accounts-summary', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        // Flatten categories for the table
        const allUsers = [
          ...data.buyers,
          ...data.builders,
          ...data.staff,
          ...data.others
        ].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
      const response = await fetch('http://localhost:5000/api/superadmin/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId, status: newStatus })
      });
      if (response.ok) {
        setSuccessMsg(`User ${newStatus === 'Active' ? 'enabled' : 'disabled'} successfully`);
        fetchUsers();
      }
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const handleSendCredentials = async (email: string) => {
    try {
      setSuccessMsg('Sending credentials...');
      const response = await fetch('http://localhost:5000/api/superadmin/send-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email })
      });
      if (response.ok) {
        setSuccessMsg('Login details sent to ' + email);
      } else {
        setError('Failed to send credentials');
      }
    } catch (err) {
      setError('Network error');
    }
  };

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

      <Card>
        <div className="overflow-x-auto">
          <DataTable headers={['User Detail', 'Role', 'Status', 'Security Key', 'Joined', 'Actions']}>
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-10"><Skeleton className="h-4 w-full" /></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10"><EmptyState title="No users found" description="No registered accounts found in the system." /></td></tr>
            ) : (
              users.map((u) => (
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
                    <Badge variant={u.status === 'Active' ? 'success' : 'danger'}>{u.status}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">
                      {u.security_key || 'N/A'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-bold text-slate-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {(u.role === 'ADMIN' || u.role === 'TELECALLER' || u.role === 'SALES_EXECUTIVE') && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-[10px] font-black uppercase tracking-widest"
                          onClick={() => handleSendCredentials(u.email)}
                        >
                          Send Creds
                        </Button>
                      )}
                      <Button 
                        variant={u.status === 'Active' ? 'ghost' : 'primary'} 
                        size="sm"
                        className={`h-8 text-[10px] font-black uppercase tracking-widest ${u.status === 'Active' ? 'text-rose-600 hover:bg-rose-50' : ''}`}
                        onClick={() => handleToggleStatus(u.id, u.status)}
                      >
                        {u.status === 'Active' ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </DataTable>
        </div>
      </Card>
    </div>
  );
};

export const FinanceView: React.FC = () => {
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
};

export const ReportsView: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center">
      <BarChart4 size={40} />
    </div>
    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Analytics Dashboard</h3>
    <p className="text-slate-500 text-sm font-medium max-w-md">Detailed performance metrics and conversion graphs are being generated for this cycle.</p>
    <Button variant="outline">Refresh Data</Button>
  </div>
);

export const SettingsView: React.FC = () => (
  <div className="max-w-2xl space-y-6">
    <Card className="p-8">
       <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-slate-100 rounded-[2.5rem] flex items-center justify-center text-slate-400 border border-slate-200">
             <User size={32} />
          </div>
          <div>
             <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">System Settings</h3>
             <p className="text-sm font-medium text-slate-500">Configure your global platform preferences</p>
          </div>
       </div>
       <div className="space-y-4">
          <Input label="Platform Name" defaultValue="Dream Properties SaaS" />
          <Input label="Support Email" defaultValue="dreampropertiesnsk@gmail.com" />
          <div className="pt-4 flex justify-end">
            <Button>Save Preferences</Button>
          </div>
       </div>
    </Card>
    
    <Card className="p-8 border-rose-100">
       <h4 className="text-sm font-black text-rose-600 uppercase tracking-widest mb-4">Security Zone</h4>
       <div className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-100">
          <div className="flex items-center gap-3">
             <ShieldCheck className="text-rose-600" />
             <p className="text-xs font-bold text-rose-900">Two-Factor Authentication is currently inactive.</p>
          </div>
          <Button variant="danger" size="sm">Enable</Button>
       </div>
    </Card>
  </div>
);

export const BuilderDashboard: React.FC = () => {
  const [showAddProperty, setShowAddProperty] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em] mb-2 block">Project Control</span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Inventory Overview</h2>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" size="md" className="flex-1 md:flex-none gap-2">
            <Download size={14} /> Reports
          </Button>
          <Button onClick={() => setShowAddProperty(true)} className="flex-1 md:flex-none gap-2">
            <Plus size={18} /> New Project
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Active Listings" value="14" trend="+2" icon={<Home className="text-blue-600" size={20} />} color="bg-blue-50" />
        <StatCard label="Inbound Leads" value="482" trend="+15%" icon={<Users className="text-amber-600" size={20} />} color="bg-amber-50" />
        <StatCard label="Est. Pipeline" value="₹420M" trend="+5%" icon={<IndianRupee className="text-emerald-600" size={20} />} color="bg-emerald-50" />
      </div>

      <Card>
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                 <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input placeholder="Filter inventory..." className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white transition-all text-xs font-bold outline-none" />
              </div>
              <Button variant="outline" size="sm" className="rounded-xl px-4">
                <Filter size={14} className="mr-2" /> Filter
              </Button>
           </div>
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total: 14 Properties</p>
        </div>
        <DataTable headers={['Project Detail', 'Market Value', 'Engagement', 'Status', 'Actions']}>
           {MOCK_PROPERTIES.map(p => (
             <tr key={p.id} className="hover:bg-slate-50/50 group transition-colors">
               <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img src={p.images[0]} className="w-14 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200" />
                    <div>
                       <p className="text-sm font-bold text-slate-900">{p.title}</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{p.type} • {p.location}</p>
                    </div>
                  </div>
               </td>
               <td className="px-6 py-4">
                 <p className="text-xs font-black text-slate-900">{p.price.split(' ')[0]}</p>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{p.pricePerSqft.split(' ')[0]}</p>
               </td>
               <td className="px-6 py-4">
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-slate-500">
                       <Eye size={14} /> <span className="text-xs font-bold">{p.views}</span>
                    </div>
                    <div className="flex items-center gap-1 text-blue-600">
                       <Users size={14} /> <span className="text-xs font-bold">{p.leadsCount}</span>
                    </div>
                 </div>
               </td>
               <td className="px-6 py-4">
                 <Badge variant={p.status === 'Fast Filling' ? 'warning' : 'success'}>{p.status}</Badge>
               </td>
               <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="rounded-lg text-slate-400"><ArrowUpRight size={18} /></Button>
                    <Button variant="ghost" size="icon" className="rounded-lg text-slate-400"><MoreVertical size={18} /></Button>
                  </div>
               </td>
             </tr>
           ))}
        </DataTable>
      </Card>
    </div>
  );
};

export const TelecallerDashboard: React.FC = () => (
  <div className="space-y-8">
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Pending Calls" value="12" trend="+3" icon={<Phone className="text-blue-600" size={20} />} color="bg-blue-50" />
        <StatCard label="Today's Site Visits" value="04" trend="+2" icon={<Calendar className="text-indigo-600" size={20} />} color="bg-indigo-50" />
        <StatCard label="Avg Turnaround" value="14m" trend="-15%" trendUp={false} icon={<TrendingUp className="text-emerald-600" size={20} />} color="bg-emerald-50" />
     </div>

     <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card>
             <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <h3 className="font-black uppercase tracking-tight text-slate-900">Immediate Action Queue</h3>
                <div className="flex gap-2">
                   <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Live Queue</span>
                </div>
             </div>
             <DataTable headers={['Prospect', 'Inquiry Property', 'Time Ago', 'Priority', 'Actions']}>
                {MOCK_LEADS.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                       <p className="text-sm font-bold text-slate-900">{lead.name}</p>
                       <p className="text-[10px] text-slate-400 font-black tracking-tight">{lead.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                       <p className="text-xs font-bold text-slate-700">{lead.propertyOfInterest}</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{lead.source}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500">2h ago</td>
                    <td className="px-6 py-4">
                      <Badge variant={lead.status === 'New' ? 'info' : 'warning'}>{lead.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex gap-2">
                          <Button variant="primary" size="sm" className="rounded-lg shadow-none"><Phone size={14} className="mr-2" /> Connect</Button>
                          <Button variant="outline" size="icon" className="rounded-lg text-slate-400 border-slate-200"><MessageSquare size={14} /></Button>
                       </div>
                    </td>
                  </tr>
                ))}
             </DataTable>
          </Card>
        </div>

        <div className="lg:col-span-4">
           <Card className="p-6">
              <h3 className="font-black uppercase tracking-tight text-slate-900 mb-6">Daily Performance</h3>
              <div className="flex flex-col items-center justify-center py-8">
                 <div className="relative w-40 h-40">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                       <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                       <path className="text-blue-600" strokeWidth="3" strokeDasharray="75, 100" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-2xl font-black text-slate-900">75%</span>
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Target</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 w-full gap-4 mt-8">
                    <div className="text-center">
                       <p className="text-xl font-black text-slate-900">32</p>
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Calls Made</p>
                    </div>
                    <div className="text-center">
                       <p className="text-xl font-black text-slate-900">08</p>
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Interested</p>
                    </div>
                 </div>
              </div>
              <Button className="w-full mt-6 bg-slate-900 hover:bg-black rounded-xl uppercase tracking-widest text-[10px] font-black py-3">Submit Daily Log</Button>
           </Card>
        </div>
     </div>
  </div>
);

export const SalesExecutiveDashboard: React.FC = () => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showClosureModal, setShowClosureModal] = useState(false);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Active Pipeline" value="28" trend="+4" icon={<Target className="text-blue-600" size={20} />} color="bg-blue-50" />
        <StatCard label="Visits This Week" value="12" trend="+3" icon={<MapPin className="text-indigo-600" size={20} />} color="bg-indigo-50" />
        <StatCard label="Closures (MTD)" value="05" trend="+1" icon={<Handshake className="text-emerald-600" size={20} />} color="bg-emerald-50" />
        <StatCard label="Conversion Rate" value="18%" trend="+2%" icon={<TrendingUp className="text-amber-600" size={20} />} color="bg-amber-50" />
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-black uppercase tracking-tight text-slate-900">My Sales Pipeline</h3>
              <div className="flex gap-2">
                 <Badge variant="neutral">Assigned: 28</Badge>
                 <Badge variant="success">Closed: 05</Badge>
              </div>
            </div>
            <DataTable headers={['Client Name', 'Property Info', 'Status', 'Current Milestone', 'Actions']}>
              {MOCK_LEADS.map(lead => (
                <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{lead.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{lead.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-black text-slate-700">{lead.propertyOfInterest}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{lead.source}</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={lead.status === 'Closed' ? 'success' : lead.status === 'Site Visit Scheduled' ? 'warning' : 'info'}>
                      {lead.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {lead.status === 'Site Visit Scheduled' ? 'Site Viewing' : lead.status === 'Interested' ? 'Pre-Closing' : 'Prospecting'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-lg h-8 px-3"
                        onClick={() => { setSelectedLead(lead); setShowScheduleModal(true); }}
                      >
                        <Calendar size={12} className="mr-1.5" /> Visit
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="rounded-lg h-8 px-3"
                        onClick={() => { setSelectedLead(lead); setShowClosureModal(true); }}
                      >
                        <CheckCircle size={12} className="mr-1.5" /> Close
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </DataTable>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <Card className="p-6">
             <div className="flex items-center justify-between mb-6">
                <h3 className="font-black uppercase tracking-tight text-slate-900">Today's Visits</h3>
                <CalendarCheck size={18} className="text-blue-600" />
             </div>
             <div className="space-y-4">
                {[
                  { time: '10:30 AM', client: 'Rahul Sharma', project: 'Sky Towers', status: 'On Track' },
                  { time: '02:00 PM', client: 'Amit Patel', project: 'Urban Oasis', status: 'Pending' },
                  { time: '04:30 PM', client: 'Sneha Gupta', project: 'Meadow Lands', status: 'Delayed' },
                ].map((visit, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 relative group">
                    <div className="flex flex-col items-center justify-center shrink-0 border-r border-slate-200 pr-4">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Time</p>
                       <p className="text-xs font-black text-slate-900 whitespace-nowrap">{visit.time}</p>
                    </div>
                    <div>
                       <p className="text-xs font-black text-slate-900">{visit.client}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{visit.project}</p>
                       <div className="flex items-center gap-1.5 mt-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${visit.status === 'Delayed' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{visit.status}</span>
                       </div>
                    </div>
                  </div>
                ))}
             </div>
             <Button variant="outline" className="w-full mt-6 rounded-xl border-slate-200 text-slate-400 uppercase tracking-widest text-[10px]">
                View Full Calendar
             </Button>
           </Card>
        </div>
      </div>

      <Modal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} title="Schedule Site Visit">
         {selectedLead && (
           <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600">
                    <User size={18} />
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Scheduling For</p>
                    <p className="text-sm font-black text-slate-900">{selectedLead.name}</p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <Input label="Visit Date" type="date" required />
                 <Input label="Visit Time" type="time" required />
              </div>
              <Input label="Pickup Location (If any)" placeholder="Address for client pickup" />
              <div className="flex justify-end gap-3 pt-6">
                 <Button variant="ghost" onClick={() => setShowScheduleModal(false)}>Cancel</Button>
                 <Button className="px-8 shadow-none" onClick={() => setShowScheduleModal(false)}>Confirm Visit</Button>
              </div>
           </div>
         )}
      </Modal>

      <Modal isOpen={showClosureModal} onClose={() => setShowClosureModal(false)} title="Finalize Deal Closure">
         {selectedLead && (
           <div className="space-y-6">
              <div className="bg-emerald-50 p-5 rounded-[2rem] border border-emerald-100 mb-4">
                 <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600">
                       <Handshake size={24} />
                    </div>
                    <div>
                       <h4 className="text-sm font-black text-emerald-900 uppercase">Closing Details</h4>
                       <p className="text-[10px] font-bold text-emerald-700">{selectedLead.propertyOfInterest}</p>
                    </div>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <Input label="Unit Number" placeholder="e.g. 1204-B" required />
                 <Input label="Final Sale Value" placeholder="₹ in Lakhs" required icon={<IndianRupee size={16} />} />
              </div>
              <div className="flex justify-end gap-3 pt-6">
                 <Button variant="ghost" onClick={() => setShowClosureModal(false)}>Cancel</Button>
                 <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-700 shadow-none px-10" onClick={() => setShowClosureModal(false)}>
                    Confirm Closure
                 </Button>
              </div>
           </div>
         )}
      </Modal>
    </div>
  );
};

export const AdminDashboard: React.FC = () => <SuperAdminDashboard />;