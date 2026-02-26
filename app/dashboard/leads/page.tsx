'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, Plus, Download, Eye, Edit2, Share2, Search, FileText, FileSpreadsheet, File, Trash2 } from 'lucide-react';
import { Card, Badge, Button, Input, DataTable, Skeleton, Select, Modal } from '@/components/UIComponents';
import { AlertModal } from '@/components/ui/alert-modal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';

export default function LeadsPage() {
  const { data: session } = useSession();
  const [leads, setLeads] = useState<any[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [staff, setStaff] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detailLead, setDetailLead] = useState<any | null>(null);
  const [editLead, setEditLead] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' });
  const [isSavingLead, setIsSavingLead] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Newest');
  const [newLead, setNewLead] = useState({
    name: '',
    email: '',
    phone: '',
    propertyId: '',
    propertyTitle: '',
    source: 'Manual',
    message: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [deleteLeadId, setDeleteLeadId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteLead = async () => {
    if (!deleteLeadId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/leads?id=${deleteLeadId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setLeads(prev => prev.filter(l => l.id !== deleteLeadId));
        setDeleteLeadId(null);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete lead');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting lead');
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
        setFilteredLeads(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let result = [...leads];
    
    if (filterStatus !== 'All') {
      result = result.filter(l => l.status === filterStatus);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(l => 
        l.name?.toLowerCase().includes(query) || 
        l.phone?.toLowerCase().includes(query) ||
        l.email?.toLowerCase().includes(query)
      );
    }

    if (sortBy === 'Newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    
    setFilteredLeads(result);
  }, [leads, filterStatus, searchQuery, sortBy]);

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/superadmin/accounts-summary');
      if (response.ok) {
        const data = await response.json();
        setStaff(data.staff || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/properties', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        console.log('Properties fetched:', data);
        setProperties(data || []);
      } else {
        console.error('Failed to fetch properties:', response.status);
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchStaff();
    fetchProperties();
  }, []);

  const telecallers = staff.filter((s: any) => s.role === 'TELECALLER');
  const salesExecutives = staff.filter((s: any) => s.role === 'SALES_EXECUTIVE');

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: Record<string, string> = {};
    if (!newLead.name.trim()) errors.name = 'Name is required';
    if (!newLead.email.trim()) errors.email = 'Email is required';
    if (!newLead.phone.trim()) errors.phone = 'Phone is required';
    if (!newLead.propertyId) errors.propertyId = 'Property is required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLead.name,
          email: newLead.email,
          phone: newLead.phone,
          propertyId: newLead.propertyId,
          propertyTitle: newLead.propertyTitle,
          source: newLead.source || 'Manual',
          message: newLead.message,
        }),
      });
      if (response.ok) {
        setShowNewModal(false);
        setNewLead({
          name: '',
          email: '',
          phone: '',
          propertyId: '',
          propertyTitle: '',
          source: 'Manual',
          message: '',
        });
        setFormErrors({});
        setIsLoading(true);
        await fetchLeads();
      } else {
        let errorMessage = 'Failed to create lead';
        try {
          const errorData = await response.json();
          if (errorData && typeof errorData.message === 'string' && errorData.message.trim()) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
        }
        setAlertTitle('Lead Creation Failed');
        setAlertMessage(errorMessage);
        setAlertOpen(true);
      }
    } catch (err) {
      console.error(err);
      setAlertTitle('Lead Creation Failed');
      setAlertMessage('Error creating lead');
      setAlertOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditLeadSave = async () => {
    if (!editLead) return;
    setIsSavingLead(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: editLead.id,
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        const updatedLead = result.lead || result;
        setLeads(prev =>
          prev.map(item =>
            item.id === updatedLead.id ? { ...item, ...updatedLead } : item
          )
        );
        setDetailLead(prev =>
          prev && prev.id === updatedLead.id ? { ...prev, ...updatedLead } : prev
        );
        setEditLead(null);
      } else {
        alert('Failed to update lead information');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating lead information');
    } finally {
      setIsSavingLead(false);
    }
  };

  const role = session?.user?.role;
  const isAdminView = role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'SAAS_OWNER';

  const headers = isAdminView
    ? ['Prospect Info', 'Inquiry Property', 'Lead Source', 'Telecaller', 'Sales Executive', 'Status', 'Last Contact', 'Actions']
    : ['Prospect Info', 'Inquiry Property', 'Status', 'Last Contact', 'Actions'];

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Leads Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 28);
    
    autoTable(doc, {
      startY: 35,
      head: [['Name', 'Phone', 'Email', 'Property', 'Status', 'Source', 'Created At']],
      body: filteredLeads.map(l => [
        l.name, 
        l.phone, 
        l.email || '-',
        l.propertyOfInterest || l.property?.title || '-',
        l.status,
        l.source,
        new Date(l.createdAt).toLocaleDateString()
      ]),
    });
    doc.save('leads-report.pdf');
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredLeads.map(l => ({
      Name: l.name,
      Phone: l.phone,
      Email: l.email,
      Property: l.propertyOfInterest || l.property?.title || '-',
      Status: l.status,
      Source: l.source,
      'Created At': new Date(l.createdAt).toLocaleDateString()
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, "leads-report.xlsx");
  };

  const exportToWord = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ children: [new TextRun({ text: "Leads Report", bold: true, size: 32 })] }),
          new Paragraph({ text: `Generated on ${new Date().toLocaleDateString()}` }),
          new Paragraph({ text: "" }), // Spacer
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: ["Name", "Phone", "Property", "Status", "Source"].map(text =>
                  new TableCell({ 
                    children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
                    width: { size: 20, type: WidthType.PERCENTAGE }
                  })
                ),
              }),
              ...filteredLeads.map(l =>
                new TableRow({
                  children: [
                    l.name,
                    l.phone,
                    l.propertyOfInterest || l.property?.title || '-',
                    l.status,
                    l.source
                  ].map(text => new TableCell({ children: [new Paragraph({ text: text || '-' })] }))
                })
              )
            ]
          })
        ]
      }]
    });
    
    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads-report.docx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
            <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[8px] font-black text-white">+{leads.length}</div>
          </div>
          <Button className="gap-2 shadow-none" onClick={() => setShowNewModal(true)}><Plus size={18} /> New Inquiry</Button>
        </div>
      </div>

      <AlertModal
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        title={alertTitle}
        message={alertMessage}
        type="error"
      />

      <AlertModal
        isOpen={!!deleteLeadId}
        onClose={() => setDeleteLeadId(null)}
        title="Delete Lead"
        message="Are you sure you want to delete this lead? This action cannot be undone."
        type="warning"
        onConfirm={handleDeleteLead}
        isLoading={isDeleting}
      />

      <Card>
        <div className="p-4 border-b border-slate-100 flex items-center justify-end gap-3">
          <div className="w-64">
            <Input 
              placeholder="Search leads..." 
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              icon={<Search size={14} />}
              inputSize="sm"
            />
          </div>
          <div className="w-32">
            <Select
              options={[
                { label: 'Newest First', value: 'Newest' },
                { label: 'Oldest First', value: 'Oldest' }
              ]}
              value={sortBy}
              onChange={setSortBy}
              placeholder="Sort Order"
              size="sm"
            />
          </div>
          <div className="w-40">
            <Select
              options={[
                { label: 'All Status', value: 'All' },
                { label: 'New', value: 'New' },
                { label: 'Hot', value: 'Hot' },
                { label: 'Interested', value: 'Interested' },
                { label: 'Closed', value: 'Closed' }
              ]}
              value={filterStatus}
              onChange={setFilterStatus}
              placeholder="Filter Status"
              size="sm"
            />
          </div>
          <div className="w-32">
            <Select
              options={[
                { label: 'PDF Report', value: 'pdf' },
                { label: 'Excel Sheet', value: 'excel' },
                { label: 'Word Doc', value: 'word' }
              ]}
              value=""
              onChange={(val) => {
                if (val === 'pdf') exportToPDF();
                if (val === 'excel') exportToExcel();
                if (val === 'word') exportToWord();
              }}
              placeholder="Export"
              size="sm"
              icon={<Download size={14} />}
            />
          </div>
        </div>
        <DataTable headers={headers}>
          {isLoading ? (
            <tr><td colSpan={headers.length} className="px-6 py-4 text-center text-slate-400 font-bold">Loading leads...</td></tr>
          ) : filteredLeads.length === 0 ? (
            <tr><td colSpan={headers.length} className="px-6 py-4 text-center text-slate-400 font-bold">No leads found</td></tr>
          ) : (
            filteredLeads.map(l => (
              <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-slate-900">{l.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{l.phone}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs font-black text-slate-700">{l.propertyOfInterest || l.property?.title}</p>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{l.source}</p>
                </td>
                {isAdminView && (
                  <td className="px-6 py-4">
                    {l.channelPartner ? (
                      <div>
                        <p className="text-xs font-bold text-blue-700">{l.channelPartner.user?.name}</p>
                        <p className="text-[10px] text-slate-500">{l.channelPartner.user?.mobile || l.channelPartner.user?.email}</p>
                        <Badge variant="info" className="mt-1 text-[9px] py-0 px-1">Channel Partner</Badge>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">-</span>
                    )}
                  </td>
                )}
                {isAdminView && (
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <User size={12} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-bold text-slate-600">
                          {l.assignedStaff?.name || 'Unassigned'}
                        </p>
                        <Select
                          options={
                            telecallers.map((s) => ({
                              label: s.name,
                              value: s.id.toString(),
                            }))
                          }
                          value={l.assignedStaff?.id?.toString() || ''}
                          onChange={async (value: string) => {
                            if (!value) return;
                            setAssigningId(l.id);
                            try {
                              const res = await fetch('/api/leads/assign', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ leadId: l.id, staffId: value }),
                              });
                              if (res.ok) {
                                const result = await res.json();
                                setLeads(prev =>
                                  prev.map(item =>
                                    item.id === l.id ? { ...item, assignedStaff: result.lead.assignedStaff } : item
                                  )
                                );
                              } else {
                                alert('Failed to assign lead');
                              }
                            } catch (err) {
                              alert('Error assigning lead');
                            } finally {
                              setAssigningId(null);
                            }
                          }}
                          placeholder={assigningId === l.id ? 'Assigning...' : 'Assign telecaller...'}
                          className="text-[10px]"
                          size="sm"
                        />
                      </div>
                    </div>
                  </td>
                )}
                {isAdminView && (
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <User size={12} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-bold text-slate-600">
                          {l.salesExecutive?.name || 'Unassigned'}
                        </p>
                        <Select
                          options={salesExecutives.map((s: any) => ({
                            label: s.name,
                            value: s.id.toString(),
                          }))}
                          value={l.salesExecutive?.id?.toString() || ''}
                          onChange={async (value: string) => {
                            if (!value) return;
                            setAssigningId(l.id);
                            try {
                              const res = await fetch('/api/leads/assign-sales-executive', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ leadId: l.id, staffId: value }),
                              });
                              if (res.ok) {
                                const result = await res.json();
                                setLeads(prev =>
                                  prev.map(item =>
                                    item.id === l.id ? { ...item, salesExecutive: result.lead.salesExecutive } : item
                                  )
                                );
                              } else {
                                alert('Failed to assign sales executive');
                              }
                            } catch (err) {
                              alert('Error assigning sales executive');
                            } finally {
                              setAssigningId(null);
                            }
                          }}
                          placeholder={assigningId === l.id ? 'Assigning...' : 'Assign sales executive...'}
                          className="text-[10px]"
                          size="sm"
                        />
                      </div>
                    </div>
                  </td>
                )}
                <td className="px-6 py-4">
                  <Badge variant={l.status === 'Closed' ? 'success' : l.status === 'New' ? 'info' : 'warning'}>{l.status}</Badge>
                </td>
                <td className="px-6 py-4 text-xs font-bold text-slate-500">{new Date(l.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-amber-600"
                      onClick={() => {
                        setEditLead(l);
                        setEditForm({
                          name: l.name || '',
                          email: l.email || '',
                          phone: l.phone || '',
                        });
                      }}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-emerald-600"
                      onClick={async () => {
                        const shareText = `Lead
Name: ${l.name}
Phone: ${l.phone}
Email: ${l.email}
Status: ${l.status}
Property: ${l.propertyOfInterest || l.property?.title || ''}`;
                        try {
                          if (navigator.share) {
                            await navigator.share({
                              title: `Lead - ${l.name}`,
                              text: shareText,
                            });
                          } else if (navigator.clipboard) {
                            await navigator.clipboard.writeText(shareText);
                            alert('Lead details copied to clipboard');
                          } else {
                            alert(shareText);
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                    >
                      <Share2 size={16} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-blue-600"
                      onClick={() => setDetailLead(l)}
                    >
                      <Eye size={16} />
                    </Button>
                    {(isAdminView || role === 'CHANNEL_PARTNER') && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-rose-600"
                        onClick={() => setDeleteLeadId(l.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </DataTable>
      </Card>
      <Modal
        isOpen={showNewModal}
        onClose={() => !isSubmitting && setShowNewModal(false)}
        title="New Inquiry"
      >
        <form onSubmit={handleCreateLead} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Name"
              placeholder="Full name"
              value={newLead.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLead({ ...newLead, name: e.target.value })}
              error={formErrors.name}
            />
            <Input
              label="Email"
              type="email"
              placeholder="email@example.com"
              value={newLead.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLead({ ...newLead, email: e.target.value })}
              error={formErrors.email}
            />
            <Input
              label="Phone"
              placeholder="+91 9XXXXXXXXX"
              value={newLead.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLead({ ...newLead, phone: e.target.value })}
              error={formErrors.phone}
            />
            <div>
              <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">
                Property
              </label>
              <Select
                options={properties.map(p => ({ label: p.title, value: p.id.toString() }))}
                value={newLead.propertyId}
                onChange={(val) => {
                  const p = properties.find(prop => prop.id.toString() === val);
                  setNewLead({ ...newLead, propertyId: val, propertyTitle: p?.title || '' });
                }}
                placeholder="Select Property"
                error={formErrors.propertyId}
              />
            </div>
            <Input
              label="Property Title"
              placeholder="Optional property title"
              value={newLead.propertyTitle}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLead({ ...newLead, propertyTitle: e.target.value })}
            />
            <Input
              label="Source"
              placeholder="Source of lead"
              value={newLead.source}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLead({ ...newLead, source: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">
              Notes
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-xs font-medium min-h-[80px]"
              placeholder="Add any additional context or requirements"
              value={newLead.message}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewLead({ ...newLead, message: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => !isSubmitting && setShowNewModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="px-4"
              isLoading={isSubmitting}
            >
              Create Lead
            </Button>
          </div>
        </form>
      </Modal>
      <Modal
        isOpen={!!editLead}
        onClose={() => {
          if (isSavingLead) return;
          setEditLead(null);
        }}
        title="Edit Lead"
      >
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">
              Lead Information
            </p>
            <p className="text-xs text-slate-500">
              Update the client details for this inquiry.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Name"
              value={editForm.name}
              onChange={e =>
                setEditForm(prev => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
            <Input
              label="Phone"
              value={editForm.phone}
              onChange={e =>
                setEditForm(prev => ({
                  ...prev,
                  phone: e.target.value,
                }))
              }
            />
            <Input
              label="Email"
              value={editForm.email}
              onChange={e =>
                setEditForm(prev => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (isSavingLead) return;
                setEditLead(null);
              }}
              disabled={isSavingLead}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleEditLeadSave} isLoading={isSavingLead}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={!!detailLead}
        onClose={() => setDetailLead(null)}
        title="Lead Details"
      >
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Prospect</p>
            <p className="text-sm font-bold text-slate-900">
              {detailLead?.name}{' '}
              <span className="text-[11px] text-slate-400 font-medium">
                {detailLead?.phone}
              </span>
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              {detailLead?.email}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Property</p>
            <p className="text-xs font-bold text-slate-900">
              {detailLead?.property?.title || detailLead?.propertyOfInterest || 'Not specified'}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              {detailLead?.property?.address || detailLead?.property?.location || 'Address not available'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-[11px]">
            <div>
              <p className="font-black uppercase tracking-widest text-slate-500 mb-1">Status</p>
              <p className="font-semibold text-slate-900">{detailLead?.status}</p>
            </div>
            <div>
              <p className="font-black uppercase tracking-widest text-slate-500 mb-1">Source</p>
              <p className="font-semibold text-slate-900">{detailLead?.source}</p>
            </div>
            <div>
              <p className="font-black uppercase tracking-widest text-slate-500 mb-1">Created On</p>
              <p className="font-semibold text-slate-900">
                {detailLead?.createdAt ? new Date(detailLead.createdAt).toLocaleString() : '-'}
              </p>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">Latest Notes</p>
            <p className="text-xs text-slate-600 whitespace-pre-line">
              {detailLead?.lastNote || 'No notes added yet'}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
