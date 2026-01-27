'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Modal } from '@/components/UIComponents';
import { AlertModal } from '@/components/ui/alert-modal';
import { Search, CheckCircle, XCircle, Clock, Shield, DollarSign, Eye, Edit3, Trash2, FileText, Upload } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function ChannelPartnersPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [activeTab, setActiveTab] = useState<'partners' | 'settings'>('partners');
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [commissionRate, setCommissionRate] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({
    name: '',
    email: '',
    mobile: '',
    city: '',
    state: '',
    partnerType: '',
    gstNumber: '',
    reraNumber: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    commissionRate: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    partnerId: null,
    partnerName: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Legal Settings State
  const [agreementTerms, setAgreementTerms] = useState('');
  const [signatureUrl, setSignatureUrl] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/channel-partners');
      if (res.ok) {
        const data = await res.json();
        setPartners(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
        const body: any = { status };
        if (status === 'Approved' && commissionRate) {
            body.commissionRate = commissionRate;
        }

        const res = await fetch(`/api/channel-partners/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            fetchPartners();
            setIsApproveModalOpen(false);
            setCommissionRate('');
        } else {
            alert('Failed to update status');
        }
    } catch (error) {
        console.error(error);
        alert('Error updating status');
    }
  };

  const openApproveModal = (partner: any) => {
      setSelectedPartner(partner);
      setCommissionRate(partner.channelPartner?.commissionRate || '');
      setIsApproveModalOpen(true);
  };

  const openEditModal = (partner: any) => {
      setSelectedPartner(partner);
      setEditForm({
        name: partner.name || '',
        email: partner.email || '',
        mobile: partner.mobile || '',
        city: partner.channelPartner?.city || '',
        state: partner.channelPartner?.state || '',
        partnerType: partner.channelPartner?.partnerType || '',
        gstNumber: partner.channelPartner?.gstNumber || '',
        reraNumber: partner.channelPartner?.reraNumber || '',
        bankName: partner.channelPartner?.bankName || '',
        accountNumber: partner.channelPartner?.accountNumber || '',
        ifscCode: partner.channelPartner?.ifscCode || '',
        commissionRate: partner.channelPartner?.commissionRate?.toString() || ''
      });
      setIsEditModalOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setEditForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async () => {
      if (!selectedPartner) return;
      setIsSaving(true);
      try {
          const payload: any = {
            name: editForm.name,
            email: editForm.email,
            mobile: editForm.mobile,
            city: editForm.city,
            state: editForm.state,
            partnerType: editForm.partnerType,
            gstNumber: editForm.gstNumber,
            reraNumber: editForm.reraNumber,
            bankName: editForm.bankName,
            accountNumber: editForm.accountNumber,
            ifscCode: editForm.ifscCode
          };
          if (editForm.commissionRate !== '') {
            const rate = parseFloat(editForm.commissionRate);
            if (!isNaN(rate)) {
              payload.commissionRate = rate;
            }
          }

          const res = await fetch(`/api/channel-partners/${selectedPartner.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (res.ok) {
            await fetchPartners();
            setIsEditModalOpen(false);
          } else {
            const data = await res.json();
            alert(data.message || 'Failed to update partner');
          }
      } catch (error) {
          console.error(error);
          alert('Error updating partner');
      } finally {
          setIsSaving(false);
      }
  };

  const handleDeletePartner = (partner: any) => {
      if (!partner) return;
      setDeleteModal({
        isOpen: true,
        partnerId: partner.id,
        partnerName: partner.name
      });
  };

  const confirmDelete = async () => {
      if (!deleteModal.partnerId) return;
      setIsDeleting(true);
      try {
          const res = await fetch(`/api/channel-partners/${deleteModal.partnerId}`, {
            method: 'DELETE'
          });
          if (res.ok) {
            await fetchPartners();
            setDeleteModal({ isOpen: false, partnerId: null, partnerName: '' });
          } else {
            const data = await res.json();
            alert(data.message || 'Failed to delete partner');
          }
      } catch (error) {
          console.error(error);
          alert('Error deleting partner');
      } finally {
          setIsDeleting(false);
      }
  };

  useEffect(() => {
    if (activeTab === 'settings' && (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'SAAS_OWNER')) {
      const fetchSettings = async () => {
        try {
          // Fetch terms
          const termsRes = await fetch('/api/settings?key=channel_partner_agreement_terms');
          if (termsRes.ok) {
            const data = await termsRes.json();
            if (data.value) {
                setAgreementTerms(data.value);
            } else {
                // Set default terms if empty
                setAgreementTerms(`This Agreement is entered on <strong>{{EFFECTIVE_DATE}}</strong> between <strong>Dream Properties</strong>, owner of a real estate SaaS platform, and <strong>{{PARTNER_NAME}}</strong> (“Partner”).

1. PURPOSE

The Company provides a cloud-based real estate Channel Management SaaS ("Platform") to manage listings, channel partners, inventory, and leads. The Partner is authorized to use the Platform strictly under this Agreement.

2. ACCESS & LICENSE

The Company grants the Partner a limited, non-exclusive, revocable, non-transferable license to access and use the Platform for lawful business purposes only. No ownership rights are transferred.

3. PARTNER RESPONSIBILITIES

The Partner shall:

Ensure accuracy and legality of all listings and data

Comply with applicable real estate, RERA (if applicable), and data protection laws

Not misrepresent properties, pricing, or availability

Maintain confidentiality and system security

4. PLATFORM USE RESTRICTIONS

The Partner shall not:

Copy, resell, reverse engineer, or misuse the Platform

Share login credentials or grant unauthorized access

Use the Platform for unlawful or fraudulent purposes

5. COMMERCIAL TERMS

Subscription fees, commissions, or revenue sharing (if any) shall be as agreed separately. The Company is not responsible for transaction disputes between third parties.

6. DATA & CONFIDENTIALITY

All platform data, customer data, and business information are confidential. Data may be processed only for Platform-related purposes in accordance with applicable laws.

7. INTELLECTUAL PROPERTY

All intellectual property rights in the Platform, software, branding, and documentation remain the exclusive property of the Company.

8. LIMITATION OF LIABILITY

The Platform is provided on an "as-is" basis. The Company shall not be liable for indirect or consequential damages. Total liability shall not exceed fees paid in the preceding 6 months.

9. TERM & TERMINATION

Either Party may terminate this Agreement with 30 days' written notice or immediately for breach or misuse. Access to the Platform shall cease upon termination.`);
            }
          }
          // Fetch signature
          const sigRes = await fetch('/api/settings?key=authorized_signatory_signature');
          if (sigRes.ok) {
            const data = await sigRes.json();
            if (data.value) setSignatureUrl(data.value);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchSettings();
    }
  }, [activeTab, user]);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      // Save Terms
      await fetch('/api/settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'channel_partner_agreement_terms', value: agreementTerms })
      });
      // Save Signature
      await fetch('/api/settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'authorized_signatory_signature', value: signatureUrl })
      });
      setShowSuccessModal(true);
    } catch (e) {
      alert('Failed to save settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setSignatureUrl(data.url);
      } else {
        alert('Failed to upload signature');
      }
    } catch (e) {
      alert('Error uploading signature');
    }
  };

  const openDetailsModal = (partner: any) => {
      setSelectedPartner(partner);
      setIsDetailsModalOpen(true);
  };

  const filteredPartners = partners.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.mobile.includes(search)
  );

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'Approved': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1"><CheckCircle size={12}/> Approved</span>;
          case 'Rejected': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1"><XCircle size={12}/> Rejected</span>;
          default: return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1"><Clock size={12}/> Pending</span>;
      }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Channel Partners</h1>
                <p className="text-slate-500 text-sm">Manage partner applications and approvals</p>
            </div>
            {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'SAAS_OWNER') && (
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('partners')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    activeTab === 'partners'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Partners List
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    activeTab === 'settings'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Agreement Settings
                </button>
              </div>
            )}
        </div>

        {activeTab === 'partners' ? (
          <>
            <div className="flex justify-end">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input 
                        placeholder="Search partners..." 
                        className="pl-9 w-64"
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                    />
                </div>
            </div>
            <Card className="overflow-hidden border border-slate-200">
           <div className="overflow-x-auto">
               <table className="w-full text-left text-sm">
                 <thead className="bg-slate-50 border-b border-slate-200">
                     <tr>
                         <th className="px-6 py-4 font-semibold text-slate-700">Partner Details</th>
                         <th className="px-6 py-4 font-semibold text-slate-700">RERA / City</th>
                         <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                         <th className="px-6 py-4 font-semibold text-slate-700">Commission</th>
                         <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {loading ? (
                       <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading partners...</td></tr>
                   ) : filteredPartners.length === 0 ? (
                       <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No partners found</td></tr>
                   ) : (
                       filteredPartners.map(partner => (
                           <tr key={partner.id} className="hover:bg-slate-50 transition-colors">
                               <td className="px-6 py-4">
                                   <div className="font-medium text-slate-900">{partner.name}</div>
                                   <div className="text-xs text-slate-500">{partner.email}</div>
                                   <div className="text-xs text-slate-500">{partner.mobile}</div>
                               </td>
                               <td className="px-6 py-4">
                                   <div className="text-slate-900">{partner.channelPartner?.city || '-'}</div>
                                   <div className="text-xs text-slate-500 font-mono">{partner.channelPartner?.reraNumber || 'No RERA'}</div>
                               </td>
                               <td className="px-6 py-4">
                                   {getStatusBadge(partner.channelPartner?.approvalStatus || 'Pending')}
                               </td>
                               <td className="px-6 py-4">
                                   {partner.channelPartner?.commissionRate ? `${partner.channelPartner.commissionRate}%` : '-'}
                               </td>
                               <td className="px-6 py-4 text-right space-x-2">
                                   <Button size="sm" variant="ghost" onClick={() => openDetailsModal(partner)} title="View Details">
                                       <Eye size={16} className="text-slate-600" />
                                   </Button>
                                   {partner.channelPartner?.approvalStatus === 'Pending' && (
                                       <>
                                           <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => openApproveModal(partner)}>
                                               Approve
                                           </Button>
                                           <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleStatusUpdate(partner.id, 'Rejected')}>
                                               Reject
                                           </Button>
                                       </>
                                   )}
                                   {partner.channelPartner?.approvalStatus === 'Approved' && (
                                       <Button size="sm" variant="outline" onClick={() => openApproveModal(partner)}>
                                           Edit Rate
                                       </Button>
                                   )}
                                   <Button
                                     size="sm"
                                     variant="ghost"
                                     onClick={() => openEditModal(partner)}
                                     title="Edit Partner"
                                   >
                                     <Edit3 size={16} className="text-amber-600" />
                                   </Button>
                                   <Button
                                     size="sm"
                                     variant="ghost"
                                     onClick={() => handleDeletePartner(partner)}
                                     title="Delete Partner"
                                     disabled={isDeleting}
                                   >
                                     <Trash2 size={16} className="text-rose-600" />
                                   </Button>
                               </td>
                           </tr>
                       ))
                   )}
                 </tbody>
               </table>
           </div>
        </Card>
        </>
        ) : (
            <Card className="p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">Legal Agreement Settings</h2>
                        <p className="text-xs text-slate-500">Manage agreement terms and authorized signatures</p>
                    </div>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-bold text-slate-700 mb-2 block">Channel Partner Agreement Terms (HTML Supported)</label>
                        <p className="text-xs text-slate-500 mb-2">
                            Use HTML tags for formatting. Example: &lt;b&gt;Bold&lt;/b&gt;, &lt;br/&gt; for line break, &lt;ul&gt;&lt;li&gt;List item&lt;/li&gt;&lt;/ul&gt;
                        </p>
                        <textarea
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono resize-y min-h-[400px]"
                            value={agreementTerms}
                            onChange={(e) => setAgreementTerms(e.target.value)}
                            placeholder="<p>Enter legal terms here...</p>"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-700 mb-2 block">Authorized Signatory Signature</label>
                        <div className="flex items-center gap-4">
                            {signatureUrl && (
                                <div className="border border-slate-200 rounded-lg p-2 bg-white">
                                    <img src={signatureUrl} alt="Signature" className="h-16 object-contain" />
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="relative">
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleSignatureUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-600 hover:bg-slate-50">
                                        <Upload size={16} />
                                        <span className="text-sm">Upload Signature Image</span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Recommended: Transparent PNG, max 2MB</p>
                            </div>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                        <Button 
                            onClick={handleSaveSettings} 
                            isLoading={isSavingSettings} 
                            className="w-full sm:w-auto px-8 bg-indigo-600 hover:bg-indigo-700"
                        >
                            Save Legal Settings
                        </Button>
                    </div>
                </div>
            </Card>
        )}

        {/* Success Modal */}
        <Modal 
            isOpen={showSuccessModal} 
            onClose={() => setShowSuccessModal(false)}
            title="Success"
            className="max-w-sm"
        >
            <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                    <CheckCircle size={32} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">Settings Saved</h3>
                    <p className="text-sm text-slate-500 mt-1">Legal agreement settings have been updated successfully.</p>
                </div>
                <div className="pt-4">
                    <Button onClick={() => setShowSuccessModal(false)} className="w-full bg-slate-900 hover:bg-slate-800">
                        Close
                    </Button>
                </div>
            </div>
        </Modal>

        {/* Approve Modal */}
        <Modal 
            isOpen={isApproveModalOpen && !!selectedPartner} 
            onClose={() => setIsApproveModalOpen(false)}
            title={`Approve Partner: ${selectedPartner?.name}`}
            className="max-w-md"
        >
            <div className="space-y-4">
                <Input 
                    label="Set Commission Rate (%)" 
                    type="number" 
                    placeholder="e.g. 2.0"
                    value={commissionRate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommissionRate(e.target.value)}
                />
                <p className="text-xs text-slate-500">
                    Default global rate applies if left blank, or set a specific rate for this partner.
                </p>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={() => setIsApproveModalOpen(false)}>Cancel</Button>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => selectedPartner && handleStatusUpdate(selectedPartner.id, 'Approved')}>
                        {selectedPartner?.channelPartner?.approvalStatus === 'Approved' ? 'Update Rate' : 'Approve & Activate'}
                    </Button>
                </div>
            </div>
        </Modal>

        {/* Details Modal */}
        <Modal
            isOpen={isDetailsModalOpen && !!selectedPartner}
            onClose={() => setIsDetailsModalOpen(false)}
            title="Partner Details"
            className="max-w-lg"
        >
            <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                {selectedPartner && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase">Full Name</label>
                                <p className="text-sm font-medium">{selectedPartner.name}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
                                <p className="text-sm">{getStatusBadge(selectedPartner.channelPartner?.approvalStatus)}</p>
                            </div>
                             <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase">Email</label>
                                <p className="text-sm font-medium">{selectedPartner.email}</p>
                            </div>
                             <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase">Mobile</label>
                                <p className="text-sm font-medium">{selectedPartner.mobile}</p>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-4">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm"><Shield size={14} className="text-blue-600"/> Professional Info</h4>
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg">
                                <div>
                                    <label className="text-xs text-slate-500">RERA Number</label>
                                    <p className="text-sm font-mono">{selectedPartner.channelPartner?.reraNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500">City</label>
                                    <p className="text-sm">{selectedPartner.channelPartner?.city}</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-4">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm"><DollarSign size={14} className="text-green-600"/> Bank Details</h4>
                            <div className="grid grid-cols-1 gap-3 bg-slate-50 p-3 rounded-lg">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-xs text-slate-500">Bank Name</label>
                                        <p className="text-sm">{selectedPartner.channelPartner?.bankName || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500">IFSC Code</label>
                                        <p className="text-sm font-mono">{selectedPartner.channelPartner?.ifscCode || '-'}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500">Account Number</label>
                                    <p className="text-sm font-mono">{selectedPartner.channelPartner?.accountNumber || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
            </div>
        </Modal>

        {/* Edit Modal */}
        <Modal
            isOpen={isEditModalOpen && !!selectedPartner}
            onClose={() => setIsEditModalOpen(false)}
            title="Edit Channel Partner"
            className="max-w-lg"
        >
            <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditChange}
                  />
                  <Input
                    label="Email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                  />
                  <Input
                    label="Mobile"
                    name="mobile"
                    value={editForm.mobile}
                    onChange={handleEditChange}
                  />
                  <Input
                    label="City"
                    name="city"
                    value={editForm.city}
                    onChange={handleEditChange}
                  />
                  <Input
                    label="State"
                    name="state"
                    value={editForm.state}
                    onChange={handleEditChange}
                  />
                  <Input
                    label="Partner Type"
                    name="partnerType"
                    value={editForm.partnerType}
                    onChange={handleEditChange}
                  />
                  <Input
                    label="GST Number"
                    name="gstNumber"
                    value={editForm.gstNumber}
                    onChange={handleEditChange}
                  />
                  <Input
                    label="RERA Number"
                    name="reraNumber"
                    value={editForm.reraNumber}
                    onChange={handleEditChange}
                  />
                  <Input
                    label="Bank Name"
                    name="bankName"
                    value={editForm.bankName}
                    onChange={handleEditChange}
                  />
                  <Input
                    label="Account Number"
                    name="accountNumber"
                    value={editForm.accountNumber}
                    onChange={handleEditChange}
                  />
                  <Input
                    label="IFSC Code"
                    name="ifscCode"
                    value={editForm.ifscCode}
                    onChange={handleEditChange}
                  />
                  <Input
                    label="Commission Rate (%)"
                    name="commissionRate"
                    value={editForm.commissionRate}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit} isLoading={isSaving}>
                    Save Changes
                  </Button>
                </div>
            </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <AlertModal
            isOpen={deleteModal.isOpen}
            onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
            onConfirm={confirmDelete}
            title="Delete Channel Partner"
            message={`Are you sure you want to delete channel partner?`}
            type="error"
            isLoading={isDeleting}
        />
    </div>
  );
}
