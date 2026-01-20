'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Mail, Phone, Calendar, MessageSquare, Eye, Search, Inbox, Filter, Download, FileText, FileSpreadsheet, File, Trash2, UserPlus, MapPin, Target, User } from 'lucide-react';
import { Card, DataTable, Badge, Button, Input, Modal, EmptyState, Skeleton, Select } from '@/components/UIComponents';
import { AlertModal } from '@/components/ui/alert-modal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function InquiriesPage() {
  const { data: session } = useSession();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [telecallers, setTelecallers] = useState<any[]>([]);
  const [salesExecutives, setSalesExecutives] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Alert Modal State
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    fetchInquiries();
    if (isAdmin) {
      fetchStaff();
    }
  }, [isAdmin]);

  const fetchInquiries = async () => {
    try {
      const res = await fetch('/api/contact');
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const [resTele, resSales] = await Promise.all([
        fetch('/api/employees?role=TELECALLER'),
        fetch('/api/employees?role=SALES_EXECUTIVE')
      ]);
      
      const telecallersData = await resTele.json();
      const salesExecutivesData = await resSales.json();
      
      setTelecallers(telecallersData);
      setSalesExecutives(salesExecutivesData);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
    setDeleteSuccess(false);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/contact/${deleteId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setDeleteSuccess(true);
        setIsDeleting(false);
        // Wait a moment before closing to show success message
        setTimeout(() => {
            setInquiries(inquiries.filter(i => i.id !== deleteId));
            setDeleteId(null);
            setDeleteSuccess(false);
        }, 1500);
      } else {
        alert('Failed to delete inquiry');
        setIsDeleting(false);
      }
    } catch (error) {
      console.error('Error deleting inquiry:', error);
      setIsDeleting(false);
    }
  };

  const handleAssign = async (id: number, type: 'assignedTo' | 'salesExecutiveId', value: string) => {
    if (!value) return;
    setAssigningId(id);

    try {
      const payload = { [type]: value };
      const res = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updatedInquiry = await res.json();
        setInquiries(inquiries.map(i => i.id === updatedInquiry.id ? updatedInquiry : i));
      } else {
        alert('Failed to assign inquiry');
      }
    } catch (error) {
      console.error('Error assigning inquiry:', error);
    } finally {
      setAssigningId(null);
    }
  };

  const filteredInquiries = inquiries.filter(inq => {
    const fullName = `${inq.firstName || ''} ${inq.lastName || ''}`.trim();
    const matchesSearch = 
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inq.phone && inq.phone.includes(searchTerm));

    if (!matchesSearch) return false;

    if (dateFilter === 'all') return true;
    
    const date = new Date(inq.createdAt);
    const now = new Date();
    
    if (dateFilter === 'today') {
      return date.toDateString() === now.toDateString();
    }
    
    if (dateFilter === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      return date >= weekAgo;
    }
    
    if (dateFilter === 'month') {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      return date >= monthAgo;
    }

    return true;
  });

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Inquiries Report', 14, 15);
    
    const tableData = filteredInquiries.map(inq => [
      new Date(inq.createdAt).toLocaleDateString(),
      `${inq.firstName} ${inq.lastName}`,
      inq.email,
      inq.phone || 'N/A',
      inq.interestedIn || 'N/A',
      `${inq.city || ''} ${inq.state || ''}`,
      inq.subject || 'General'
    ]);

    autoTable(doc, {
      head: [['Date', 'Name', 'Email', 'Phone', 'Interested', 'Location', 'Subject']],
      body: tableData,
      startY: 20,
    });

    doc.save('inquiries.pdf');
    setShowExportMenu(false);
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredInquiries.map(inq => ({
      Date: new Date(inq.createdAt).toLocaleDateString(),
      Name: `${inq.firstName} ${inq.lastName}`,
      Email: inq.email,
      Phone: inq.phone || 'N/A',
      'Interested In': inq.interestedIn,
      City: inq.city,
      State: inq.state,
      Subject: inq.subject || 'General',
      Message: inq.message,
      'Assigned To': inq.assignedStaff?.name || 'Unassigned'
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inquiries");
    XLSX.writeFile(workbook, "inquiries.xlsx");
    setShowExportMenu(false);
  };

  const exportWord = () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Inquiries</title></head><body>";
    const footer = "</body></html>";
    
    let html = header;
    html += "<h1>Inquiries Report</h1>";
    html += "<table border='1' style='border-collapse: collapse; width: 100%;'>";
    html += "<thead><tr><th>Date</th><th>Name</th><th>Email</th><th>Phone</th><th>Interested</th><th>Location</th><th>Subject</th><th>Message</th></tr></thead><tbody>";
    
    filteredInquiries.forEach(inq => {
      html += `<tr>
        <td>${new Date(inq.createdAt).toLocaleDateString()}</td>
        <td>${inq.firstName} ${inq.lastName}</td>
        <td>${inq.email}</td>
        <td>${inq.phone || 'N/A'}</td>
        <td>${inq.interestedIn || 'N/A'}</td>
        <td>${inq.city || ''}, ${inq.state || ''}</td>
        <td>${inq.subject || 'General'}</td>
        <td>${inq.message}</td>
      </tr>`;
    });
    
    html += "</tbody></table>" + footer;
    
    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inquiries.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  const headers = ['Date', 'Name', 'Contact Info', 'Interested In'];
  if (isAdmin) {
    headers.push('Telecaller');
    headers.push('Sales Exec');
  }
  headers.push('Actions');

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Search by name, email or phone..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select
            options={[
              { label: 'All Time', value: 'all' },
              { label: 'Today', value: 'today' },
              { label: 'This Week', value: 'week' },
              { label: 'This Month', value: 'month' },
            ]}
            value={dateFilter}
            onChange={setDateFilter}
            className="w-40"
          />

          <div className="relative">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <Download size={16} />
              Export
            </Button>
            
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20">
                  <button onClick={exportPDF} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700">
                    <FileText size={16} className="text-red-500" /> PDF
                  </button>
                  <button onClick={exportExcel} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700">
                    <FileSpreadsheet size={16} className="text-emerald-500" /> Excel
                  </button>
                  <button onClick={exportWord} className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700">
                    <File size={16} className="text-blue-500" /> Word
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <DataTable headers={headers}>
          {isLoading ? (
            <tr><td colSpan={headers.length} className="text-center py-10"><Skeleton className="h-4 w-full" /></td></tr>
          ) : filteredInquiries.length === 0 ? (
            <tr><td colSpan={headers.length} className="text-center py-10"><EmptyState title="No Inquiries" message="No contact inquiries found." icon={<Inbox size={32} />} /></td></tr>
          ) : (
            filteredInquiries.map((inq) => (
              <tr key={inq.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar size={14} />
                    <span className="text-xs font-bold">{new Date(inq.createdAt).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-slate-900">{inq.firstName} {inq.lastName}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                      <Mail size={12} className="text-blue-500" />
                      {inq.email}
                    </div>
                    {inq.phone && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                        <Phone size={12} className="text-emerald-500" />
                        {inq.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                    <Target size={12} className="text-purple-500" />
                    {inq.interestedIn || 'N/A'}
                  </div>
                </td>
                {isAdmin && (
                  <>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <User size={12} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-[10px] font-bold text-slate-600">
                            {inq.assignedStaff?.name || 'Unassigned'}
                          </p>
                          <Select
                            options={telecallers.map((s) => ({
                              label: s.name,
                              value: s.id.toString(),
                            }))}
                            value={inq.assignedStaff?.id?.toString() || ''}
                            onChange={(value) => handleAssign(inq.id, 'assignedTo', value)}
                            placeholder={assigningId === inq.id ? 'Assigning...' : 'Assign telecaller...'}
                            className="text-[10px] w-32"
                            size="sm"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <User size={12} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-[10px] font-bold text-slate-600">
                            {inq.salesExecutive?.name || 'Unassigned'}
                          </p>
                          <Select
                            options={salesExecutives.map((s) => ({
                              label: s.name,
                              value: s.id.toString(),
                            }))}
                            value={inq.salesExecutive?.id?.toString() || ''}
                            onChange={(value) => handleAssign(inq.id, 'salesExecutiveId', value)}
                            placeholder={assigningId === inq.id ? 'Assigning...' : 'Assign sales exec...'}
                            className="text-[10px] w-32"
                            size="sm"
                          />
                        </div>
                      </div>
                    </td>
                  </>
                )}
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedInquiry(inq)}
                      className="text-blue-600 hover:bg-blue-50 p-2"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </Button>
                    
                    {isAdmin && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteClick(inq.id)}
                        className="text-rose-600 hover:bg-rose-50 p-2"
                        title="Delete Inquiry"
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

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedInquiry}
        onClose={() => setSelectedInquiry(null)}
        title="Inquiry Details"
      >
        {selectedInquiry && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Name</label>
                <p className="text-sm font-bold text-slate-900">{selectedInquiry.firstName} {selectedInquiry.lastName}</p>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</label>
                <p className="text-sm font-bold text-slate-900">{new Date(selectedInquiry.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Interested In</label>
                <p className="text-sm font-bold text-slate-900">{selectedInquiry.interestedIn || 'N/A'}</p>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location</label>
                <p className="text-sm font-bold text-slate-900">{selectedInquiry.city ? `${selectedInquiry.city}, ${selectedInquiry.state || ''}` : 'N/A'}</p>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email</label>
                <p className="text-sm font-bold text-slate-900">{selectedInquiry.email}</p>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone</label>
                <p className="text-sm font-bold text-slate-900">{selectedInquiry.phone || 'N/A'}</p>
              </div>
              {selectedInquiry.propertyId && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Property ID</label>
                  <p className="text-sm font-bold text-slate-900">{selectedInquiry.propertyId}</p>
                </div>
              )}
              {selectedInquiry.salesExecutive && (
                <>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned To</label>
                    <p className="text-sm font-bold text-slate-900">{selectedInquiry.salesExecutive?.name || 'Unassigned'}</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Message</label>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {selectedInquiry.message}
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button onClick={() => setSelectedInquiry(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <AlertModal 
        isOpen={!!deleteId} 
        onClose={() => !isDeleting && setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Inquiry"
        message="Are you sure you want to delete this inquiry? This action cannot be undone."
        isLoading={isDeleting}
        isSuccess={deleteSuccess}
      />
    </div>
  );
}
