'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Eye,
  Edit3,
  Power,
  Send,
  Search,
  Filter,
  Download,
  Share2,
  FileText,
  FileSpreadsheet,
  FileIcon,
  Mail,
  MessageCircle,
} from 'lucide-react';
import { Card, Badge, Button, Input, DataTable, EmptyState, Skeleton } from '@/components/UIComponents';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

type ReportFormat = 'pdf' | 'excel' | 'word' | 'text';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [performance, setPerformance] = useState<any | null>(null);
  const [isPerformanceLoading, setIsPerformanceLoading] = useState(false);
  const [reportFormat, setReportFormat] = useState<ReportFormat>('pdf');
  const [accountsExportFormat, setAccountsExportFormat] = useState<ReportFormat>('pdf');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    mobile: '',
    propertyType: '',
    lookingTo: '',
    projectName: '',
    propertyAddress: '',
    password: '',
    securityKey: '',
  });

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, users.length]);

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

  const loadUserDetails = async (userId: number, mode: 'view' | 'edit') => {
    setIsDetailLoading(true);
    setIsPerformanceLoading(true);
    setPerformance(null);
    try {
      const response = await fetch(`/api/superadmin/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedUser(data);

        try {
          const perfResponse = await fetch(`/api/superadmin/account-performance/${userId}`);
          if (perfResponse.ok) {
            const perfData = await perfResponse.json();
            setPerformance(perfData);
          }
        } catch (perfError) {
          console.error('Failed to load performance report', perfError);
        } finally {
          setIsPerformanceLoading(false);
        }

        if (mode === 'edit') {
          setEditForm({
            name: data.name || '',
            email: data.email || '',
            mobile: data.mobile || '',
            propertyType: data.propertyType || '',
            lookingTo: data.lookingTo || '',
            projectName: data.projectName || '',
            propertyAddress: data.propertyAddress || '',
            password: '',
            securityKey: data.securityKey || '',
          });
        }
      } else {
        try {
          const data = await response.json();
          setError(data.message || 'Failed to load account details');
        } catch {
          setError('Failed to load account details');
        }
        setIsPerformanceLoading(false);
      }
    } catch (err) {
      setError('Network error while loading details');
      setIsPerformanceLoading(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleViewDetails = (userId: number) => {
    setShowDetailModal(true);
    loadUserDetails(userId, 'view');
  };

  const handleEditUser = (userId: number) => {
    setShowEditModal(true);
    loadUserDetails(userId, 'edit');
  };

  const handleOpenEditFromDetails = () => {
    if (!selectedUser) return;
    setShowDetailModal(false);
    setShowEditModal(true);
    setEditForm({
      name: selectedUser.name || '',
      email: selectedUser.email || '',
      mobile: selectedUser.mobile || '',
      propertyType: selectedUser.propertyType || '',
      lookingTo: selectedUser.lookingTo || '',
      projectName: selectedUser.projectName || '',
      propertyAddress: selectedUser.propertyAddress || '',
      password: '',
      securityKey: selectedUser.securityKey || '',
    });
  };

  const handleEditFieldChange = (field: string, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;

    if (!editForm.name || !editForm.email || !editForm.mobile) {
      setError('Name, email and mobile are required');
      return;
    }

    setIsSavingUser(true);
    try {
      const payload: any = {
        name: editForm.name,
        email: editForm.email,
        mobile: editForm.mobile,
        propertyType: editForm.propertyType || null,
        lookingTo: editForm.lookingTo || null,
        projectName: editForm.projectName || null,
        propertyAddress: editForm.propertyAddress || null,
        securityKey: editForm.securityKey || null,
      };

      if (editForm.password) {
        payload.password = editForm.password;
      }

      const response = await fetch(`/api/superadmin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg('Account updated successfully');
        setTimeout(() => setSuccessMsg(''), 3000);
        setShowEditModal(false);
        setSelectedUser(data.user);
        setEditForm((prev) => ({ ...prev, password: '' }));
        fetchUsers();
      } else {
        setError(data.message || 'Failed to update account');
      }
    } catch (err) {
      setError('Network error while saving changes');
    } finally {
      setIsSavingUser(false);
    }
  };

  const getPerformanceMetrics = () => {
    if (!selectedUser || !performance) return [];
    if (performance.type === 'telecaller') {
      return [
        { label: 'Calls Today', value: performance.calls?.today ?? 0 },
        { label: 'Calls This Week', value: performance.calls?.thisWeek ?? 0 },
        { label: 'Calls This Month', value: performance.calls?.thisMonth ?? 0 },
        { label: 'Lifetime Calls', value: performance.calls?.lifetime ?? 0 },
      ];
    }
    if (performance.type === 'buyer') {
      return [
        { label: 'Properties in Favourites', value: performance.favorites?.total ?? 0 },
        { label: 'Property Enquiries', value: performance.enquiries?.total ?? 0 },
      ];
    }
    if (performance.type === 'builder') {
      return [
        { label: 'Total Properties', value: performance.properties?.total ?? 0 },
        { label: 'Approved Properties', value: performance.properties?.approved ?? 0 },
        { label: 'Pending Properties', value: performance.properties?.pending ?? 0 },
        { label: 'Rejected Properties', value: performance.properties?.rejected ?? 0 },
        { label: 'Flagged Properties', value: performance.properties?.flagged ?? 0 },
        { label: 'Total Views', value: performance.views?.total ?? 0 },
      ];
    }
    return [];
  };

  const exportPerformanceToPDF = () => {
    if (!selectedUser || !performance) return;
    const metrics = getPerformanceMetrics();
    if (!metrics.length) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Account Performance Report', 14, 20);

    doc.setFontSize(12);
    doc.text(`Name: ${selectedUser.name}`, 14, 30);
    doc.text(`Role: ${selectedUser.role.replace('_', ' ')}`, 14, 37);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 44);

    let y = 60;
    metrics.forEach((m) => {
      doc.text(`${m.label}: ${m.value}`, 14, y);
      y += 8;
    });

    doc.save(`performance_${selectedUser.id}_${Date.now()}.pdf`);
  };

  const exportPerformanceToExcel = () => {
    if (!selectedUser || !performance) return;
    const metrics = getPerformanceMetrics();
    if (!metrics.length) return;

    const worksheet = XLSX.utils.json_to_sheet(metrics);
    worksheet['!cols'] = [{ wch: 35 }, { wch: 15 }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Performance');
    XLSX.writeFile(workbook, `performance_${selectedUser.id}_${Date.now()}.xlsx`);
  };

  const exportPerformanceToWord = () => {
    if (!selectedUser || !performance) return;
    const metrics = getPerformanceMetrics();
    if (!metrics.length) return;

    let content = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Account Performance Report</title></head><body style="font-family: Arial, sans-serif; padding: 20px;">';
    content += `<h1 style="text-align:center; color:#1e40af; margin-bottom: 10px;">Account Performance Report</h1>`;
    content += `<p style="text-align:center; color:#64748b; font-size: 14px; margin-bottom: 20px;">Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>`;
    content += `<p style="font-size: 14px; margin-bottom: 8px;"><strong>Name:</strong> ${selectedUser.name}</p>`;
    content += `<p style="font-size: 14px; margin-bottom: 16px;"><strong>Role:</strong> ${selectedUser.role.replace('_', ' ')}</p>`;
    content += `<table style="width:100%; border-collapse:collapse; margin-top:10px; border: 1px solid #cbd5e1;">`;
    content += '<thead><tr style="background-color:#1e40af;">';
    content += '<th style="border:1px solid #cbd5e1; padding:8px; text-align:left; color:#fff;">Metric</th>';
    content += '<th style="border:1px solid #cbd5e1; padding:8px; text-align:left; color:#fff;">Value</th>';
    content += '</tr></thead><tbody>';

    metrics.forEach((m, index) => {
      const bgColor = index % 2 === 0 ? '#f8fafc' : '#ffffff';
      content += `<tr style="background-color:${bgColor};">`;
      content += `<td style="border:1px solid #cbd5e1; padding:8px;">${m.label}</td>`;
      content += `<td style="border:1px solid #cbd5e1; padding:8px;">${m.value}</td>`;
      content += '</tr>';
    });

    content += '</tbody></table>';
    content += '</body></html>';

    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance_${selectedUser.id}_${Date.now()}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPerformance = () => {
    if (reportFormat === 'pdf') {
      exportPerformanceToPDF();
    } else if (reportFormat === 'excel') {
      exportPerformanceToExcel();
    } else if (reportFormat === 'word') {
      exportPerformanceToWord();
    }
  };

  const buildPerformanceText = (format: ReportFormat) => {
    if (!selectedUser || !performance) return '';
    const roleLabel = selectedUser.role.replace('_', ' ');
    const greeting = `Dear ${selectedUser.name},\n\n`;
    let intro = `Here is your ${roleLabel} performance report`;
    if (format !== 'text') {
      intro += ` in ${format.toUpperCase()} format`;
    }
    intro += ':\n\n';

    const metrics = getPerformanceMetrics();
    const lines = metrics.map((m) => `• ${m.label}: ${m.value}`);

    const closing = '\n\nBest regards,\nDream Properties Team';

    return greeting + intro + lines.join('\n') + closing;
  };

  const handleShareWhatsApp = () => {
    if (!selectedUser || !performance) return;
    const message = buildPerformanceText(reportFormat);
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleShareEmail = () => {
    if (!selectedUser || !performance) return;
    const subject = `Account Performance Report - ${selectedUser.name}`;
    const body = buildPerformanceText(reportFormat);
    const mailto = `mailto:${encodeURIComponent(selectedUser.email)}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  const exportAccountsToPDF = () => {
    if (!users.length) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Accounts Report', 14, 20);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

    const rows = filteredUsers.map((u) => [
      u.name || '',
      u.email || '',
      u.mobile || '',
      (u.role || '').toString().replace('_', ' '),
      u.status || '',
      new Date(u.createdAt).toLocaleDateString(),
    ]);

    let y = 40;
    doc.setFontSize(9);
    doc.text('Name | Email | Mobile | Role | Status | Joined', 14, y);
    y += 6;
    rows.forEach((row) => {
      const line = row.join(' | ');
      doc.text(line, 14, y);
      y += 5;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save(`accounts_report_${Date.now()}.pdf`);
  };

  const exportAccountsToExcel = () => {
    if (!users.length) return;
    const worksheet = XLSX.utils.json_to_sheet(
      filteredUsers.map((u) => ({
        Name: u.name || '',
        Email: u.email || '',
        Mobile: u.mobile || '',
        Role: (u.role || '').toString().replace('_', ' '),
        Status: u.status || '',
        Joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '',
      })),
    );
    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 30 },
      { wch: 15 },
      { wch: 18 },
      { wch: 12 },
      { wch: 12 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Accounts');
    XLSX.writeFile(workbook, `accounts_report_${Date.now()}.xlsx`);
  };

  const exportAccountsToWord = () => {
    if (!users.length) return;
    let content =
      '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Accounts Report</title></head><body style="font-family: Arial, sans-serif; padding: 20px;">';
    content += `<h1 style="text-align:center; color:#1e40af; margin-bottom: 10px;">Accounts Report</h1>`;
    content += `<p style="text-align:center; color:#64748b; font-size: 14px; margin-bottom: 20px;">Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>`;
    content += `<table style="width:100%; border-collapse:collapse; margin-top:10px; border: 1px solid #cbd5e1;">`;
    content += '<thead><tr style="background-color:#1e40af;">';
    ['Name', 'Email', 'Mobile', 'Role', 'Status', 'Joined'].forEach((h) => {
      content += `<th style="border:1px solid #cbd5e1; padding:8px; text-align:left; color:#fff;">${h}</th>`;
    });
    content += '</tr></thead><tbody>';

    filteredUsers.forEach((u: any, index: number) => {
      const bgColor = index % 2 === 0 ? '#f8fafc' : '#ffffff';
      content += `<tr style="background-color:${bgColor};">`;
      content += `<td style="border:1px solid #cbd5e1; padding:8px;">${u.name || ''}</td>`;
      content += `<td style="border:1px solid #cbd5e1; padding:8px;">${u.email || ''}</td>`;
      content += `<td style="border:1px solid #cbd5e1; padding:8px;">${u.mobile || ''}</td>`;
      content += `<td style="border:1px solid #cbd5e1; padding:8px;">${(u.role || '').toString().replace(
        '_',
        ' ',
      )}</td>`;
      content += `<td style="border:1px solid #cbd5e1; padding:8px;">${u.status || ''}</td>`;
      content += `<td style="border:1px solid #cbd5e1; padding:8px;">${
        u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''
      }</td>`;
      content += '</tr>';
    });

    content += '</tbody></table>';
    content += '</body></html>';

    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `accounts_report_${Date.now()}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportAccounts = () => {
    if (accountsExportFormat === 'pdf') {
      exportAccountsToPDF();
    } else if (accountsExportFormat === 'excel') {
      exportAccountsToExcel();
    } else if (accountsExportFormat === 'word') {
      exportAccountsToWord();
    }
  };

  const filteredUsers = users.filter((u) => {
    const role = (u.role || '').toString();
    if (roleFilter !== 'ALL') {
      if (roleFilter === 'BUYER_USER') {
        if (!(role === 'BUYER' || role === 'USER')) return false;
      } else if (roleFilter === 'BUILDER') {
        if (role !== 'BUILDER') return false;
      } else if (roleFilter === 'STAFF') {
        if (!['ADMIN', 'TELECALLER', 'SALES_EXECUTIVE', 'SAAS_OWNER'].includes(role)) return false;
      } else if (roleFilter === 'OTHER') {
        if (['BUYER', 'USER', 'BUILDER', 'ADMIN', 'TELECALLER', 'SALES_EXECUTIVE', 'SAAS_OWNER'].includes(role)) {
          return false;
        }
      }
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;

    const haystack = [
      u.name,
      u.email,
      u.mobile,
      u.role,
      u.status,
      u.propertyType,
      u.lookingTo,
      u.projectName,
      u.propertyAddress,
      u.securityKey,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSafe - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Accounts Management</h2>
          <p className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">Real-time directory of all platform users and agency staff</p>
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
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <Input
              placeholder="Search accounts (name, email, mobile, role, etc.)..."
              className="w-48 sm:w-64"
              icon={<Search size={14} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="text-[10px] font-medium border border-slate-200 rounded-lg px-2 py-1 bg-white"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All account types</option>
              <option value="BUYER_USER">Buyer / User</option>
              <option value="BUILDER">Builder</option>
              <option value="STAFF">Staff (Admin / Telecaller / Sales)</option>
              <option value="OTHER">Other</option>
            </select>
            <div className="flex items-center gap-1">
              <select
                className="text-[10px] font-medium border border-slate-200 rounded-lg px-2 py-1 bg-white"
                value={accountsExportFormat}
                onChange={(e) => setAccountsExportFormat(e.target.value as ReportFormat)}
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="word">Word</option>
              </select>
              <Button
                variant="ghost"
                size="icon"
                className="border border-slate-200"
                onClick={handleExportAccounts}
                disabled={isLoading || filteredUsers.length === 0}
                title="Export accounts"
              >
                <Download size={16} />
              </Button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          <DataTable headers={['User Detail', 'Role', 'Mobile', 'Logged In', 'Status', 'Joined', 'Actions']}>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-10"><Skeleton className="h-4 w-full" /></td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10"><EmptyState title="No users found" message="No registered accounts found in the system." /></td></tr>
            ) : (
              paginatedUsers.map((u: any) => {
                const isOnline = u.lastActiveAt && (new Date().getTime() - new Date(u.lastActiveAt).getTime() < 5 * 60 * 1000);
                return (
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
                    {isOnline ? (
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Online</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                         <span className="flex h-3 w-3 rounded-full bg-slate-300"></span>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Offline</span>
                      </div>
                    )}
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
                        onClick={() => handleViewDetails(u.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditUser(u.id)}
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
              );
            })
            )}
          </DataTable>
        </div>
        {filteredUsers.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-slate-100 text-[11px] text-slate-600 gap-2">
            <span>
              Showing {filteredUsers.length === 0 ? 0 : startIndex + 1}-
              {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-3 text-[11px]"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPageSafe === 1}
              >
                Previous
              </Button>
              <span className="text-[11px]">
                Page {currentPageSafe} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-3 text-[11px]"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPageSafe === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Dialog
        open={showDetailModal}
        onOpenChange={(open) => {
          setShowDetailModal(open);
          if (!open) {
            setSelectedUser(null);
            setPerformance(null);
          }
        }}
      >
        <DialogContent className="w-[95vw] sm:max-w-3xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Account Details</DialogTitle>
            <DialogDescription className="text-xs">
              View complete profile and activity summary for this account.
            </DialogDescription>
          </DialogHeader>
          {isDetailLoading || !selectedUser ? (
            <div className="py-8 flex justify-center">
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <User size={32} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{selectedUser.name}</h2>
                  <p className="text-sm text-slate-500">{selectedUser.email}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                    {selectedUser.role.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Mobile</p>
                  <p className="text-sm font-bold text-slate-900">{selectedUser.mobile || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Joined Date</p>
                  <p className="text-sm font-bold text-slate-900">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                  <Badge variant={selectedUser.status === 'Active' ? 'success' : 'error'}>
                    {selectedUser.status}
                  </Badge>
                </div>
                {selectedUser.lookingTo && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      Looking For
                    </p>
                    <p className="text-sm font-bold text-slate-900">{selectedUser.lookingTo}</p>
                  </div>
                )}
                {selectedUser.propertyType && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      Property Type
                    </p>
                    <p className="text-sm font-bold text-slate-900">{selectedUser.propertyType}</p>
                  </div>
                )}
                {selectedUser.securityKey && (
                  <div className="col-span-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                      Security Key
                    </p>
                    <p className="text-sm font-mono font-bold bg-slate-100 px-3 py-2 rounded-lg text-slate-700">
                      {selectedUser.securityKey}
                    </p>
                  </div>
                )}
                {selectedUser.role === 'BUILDER' && (
                  <>
                    {selectedUser.projectName && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                          Firm Name
                        </p>
                        <p className="text-sm font-bold text-slate-900">{selectedUser.projectName}</p>
                      </div>
                    )}
                    {selectedUser.propertyAddress && (
                      <div className="col-span-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                          Office Address
                        </p>
                        <p className="text-sm font-bold text-slate-900">{selectedUser.propertyAddress}</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Performance Report
                    </p>
                    <p className="text-xs text-slate-500">
                      Role-wise account activity summary with export and share options
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="text-[10px] font-medium border border-slate-200 rounded-lg px-2 py-1 bg-white"
                      value={reportFormat}
                      onChange={(e) => setReportFormat(e.target.value as ReportFormat)}
                    >
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="word">Word</option>
                      <option value="text">Plain text</option>
                    </select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="border border-slate-200"
                      onClick={handleExportPerformance}
                      disabled={isPerformanceLoading || !performance || reportFormat === 'text'}
                      title="Export report"
                    >
                      <Download size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="border border-slate-200"
                      onClick={handleShareWhatsApp}
                      disabled={isPerformanceLoading || !performance}
                      title="Share via WhatsApp"
                    >
                      <MessageCircle size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="border border-slate-200"
                      onClick={handleShareEmail}
                      disabled={isPerformanceLoading || !performance}
                      title="Share via Email"
                    >
                      <Mail size={16} />
                    </Button>
                  </div>
                </div>

                {isPerformanceLoading ? (
                  <div className="py-4">
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : performance && getPerformanceMetrics().length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {getPerformanceMetrics().map((metric) => (
                      <div key={metric.label} className="p-3 rounded-xl bg-slate-50">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                          {metric.label}
                        </p>
                        <p className="text-lg font-black text-slate-900">{metric.value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 font-medium">
                    Performance reporting is currently available for Telecaller and Buyer/User
                    accounts. For other roles, metrics are not tracked yet.
                  </p>
                )}
              </div>

              <DialogFooter className="flex flex-row gap-3">
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
                  onClick={handleOpenEditFromDetails}
                >
                  Edit User
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={showEditModal}
        onOpenChange={(open) => {
          setShowEditModal(open);
          if (!open) {
            setEditForm((prev) => ({ ...prev, password: '' }));
          }
        }}
      >
        <DialogContent className="w-[95vw] sm:max-w-xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription className="text-xs">
              Update profile information or reset password for this account.
            </DialogDescription>
          </DialogHeader>
          {!selectedUser ? (
            <div className="py-6">
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    label="Full Name"
                    value={editForm.name}
                    onChange={(e) => handleEditFieldChange('name', e.target.value)}
                  />
                  <Input
                    label="Mobile"
                    value={editForm.mobile}
                    onChange={(e) => handleEditFieldChange('mobile', e.target.value)}
                  />
                </div>
                <Input
                  label="Email"
                  value={editForm.email}
                  onChange={(e) => handleEditFieldChange('email', e.target.value)}
                />
                {(selectedUser.role === 'BUYER' || selectedUser.role === 'USER') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      label="Looking For"
                      value={editForm.lookingTo}
                      onChange={(e) => handleEditFieldChange('lookingTo', e.target.value)}
                    />
                    <Input
                      label="Preferred Property Type"
                      value={editForm.propertyType}
                      onChange={(e) => handleEditFieldChange('propertyType', e.target.value)}
                    />
                  </div>
                )}
                {selectedUser.role === 'BUILDER' && (
                  <div className="space-y-3">
                    <Input
                      label="Firm Name"
                      value={editForm.projectName}
                      onChange={(e) => handleEditFieldChange('projectName', e.target.value)}
                    />
                    <Input
                      label="Office Address"
                      value={editForm.propertyAddress}
                      onChange={(e) => handleEditFieldChange('propertyAddress', e.target.value)}
                    />
                  </div>
                )}
                {['ADMIN', 'TELECALLER', 'SALES_EXECUTIVE', 'SAAS_OWNER'].includes(
                  selectedUser.role,
                ) && (
                  <Input
                    label="Security Key"
                    value={editForm.securityKey}
                    onChange={(e) => handleEditFieldChange('securityKey', e.target.value)}
                  />
                )}
                <div className="space-y-2">
                  <Input
                    label="New Password (optional)"
                    type="password"
                    value={editForm.password}
                    onChange={(e) => handleEditFieldChange('password', e.target.value)}
                  />
                  <p className="text-[10px] text-slate-500 font-medium">
                    Leave blank to keep the current password unchanged.
                  </p>
                </div>
              </div>
              <DialogFooter className="flex flex-row gap-3 pt-4 flex-wrap">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowEditModal(false)}
                  disabled={isSavingUser}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSaveUser}
                  isLoading={isSavingUser}
                >
                  Save Changes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
