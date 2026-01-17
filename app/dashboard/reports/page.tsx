'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { BarChart4, Download, FileText, FileSpreadsheet, FileIcon, TrendingUp, Users, Building2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function ReportsPage() {
  const { data: session } = useSession();
  const [properties, setProperties] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reportType, setReportType] = useState('properties');
  const [exportFormat, setExportFormat] = useState('pdf');

  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN';
  const isBuilder = session?.user?.role === 'BUILDER';

  useEffect(() => {
    fetchData();
  }, [reportType]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (reportType === 'properties') {
        const endpoint = isAdmin 
          ? '/api/superadmin/properties-for-approval' 
          : '/api/builder/my-properties';
        const response = await fetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          setProperties(data);
        }
      } else if (reportType === 'leads') {
        const response = await fetch('/api/leads');
        if (response.ok) {
          const data = await response.json();
          setLeads(data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToWord = () => {
    const data = reportType === 'properties' ? properties : leads;
    
    if (data.length === 0) {
      alert('No data available to export');
      return;
    }

    const headers = reportType === 'properties' 
      ? ['Title', 'Location', 'Type', 'Price', 'Status', 'Area']
      : ['Name', 'Email', 'Phone', 'Status', 'Property Interest', 'Source'];
    
    let content = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${reportType.toUpperCase()} Report</title></head><body style="font-family: Arial, sans-serif; padding: 20px;">`;
    content += `<h1 style="text-align:center; color:#1e40af; margin-bottom: 10px;">${reportType.toUpperCase()} Report</h1>`;
    content += `<p style="text-align:center; color:#64748b; font-size: 14px; margin-bottom: 20px;">Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>`;
    content += `<table style="width:100%; border-collapse:collapse; margin-top:20px; border: 2px solid #1e40af;">`;
    content += `<thead><tr style="background-color:#1e40af;">`;
    headers.forEach(h => content += `<th style="border:1px solid #cbd5e1; padding:10px; text-align:left; color: white; font-weight: bold;">${h}</th>`);
    content += `</tr></thead><tbody>`;
    
    data.forEach((item: any, index: number) => {
      const bgColor = index % 2 === 0 ? '#f8fafc' : '#ffffff';
      content += `<tr style="background-color:${bgColor};">`;
      if (reportType === 'properties') {
        content += `<td style="border:1px solid #cbd5e1; padding:8px;">${item.title || 'N/A'}</td>`;
        content += `<td style="border:1px solid #cbd5e1; padding:8px;">${item.location || 'N/A'}</td>`;
        content += `<td style="border:1px solid #cbd5e1; padding:8px;">${item.type || 'N/A'}</td>`;
        content += `<td style="border:1px solid #cbd5e1; padding:8px; font-weight: bold;">${item.price || 'N/A'}</td>`;
        content += `<td style="border:1px solid #cbd5e1; padding:8px;">${item.status === 'Pending_Approval' ? 'Pending Approval' : (item.status || 'N/A')}</td>`;
        content += `<td style="border:1px solid #cbd5e1; padding:8px;">${item.area || 'N/A'}</td>`;
      } else {
        content += `<td style="border:1px solid #cbd5e1; padding:8px;">${item.name || 'N/A'}</td>`;
        content += `<td style="border:1px solid #cbd5e1; padding:8px;">${item.email || 'N/A'}</td>`;
        content += `<td style="border:1px solid #cbd5e1; padding:8px;">${item.phone || 'N/A'}</td>`;
        content += `<td style="border:1px solid #cbd5e1; padding:8px;">${item.status || 'N/A'}</td>`;
        content += `<td style="border:1px solid #cbd5e1; padding:8px;">${item.propertyOfInterest || 'N/A'}</td>`;
        content += `<td style="border:1px solid #cbd5e1; padding:8px;">${item.source || 'N/A'}</td>`;
      }
      content += `</tr>`;
    });
    
    content += `</tbody></table>`;
    content += `<p style="margin-top: 20px; text-align: center; color: #64748b; font-size: 12px;">Total Records: ${data.length}</p>`;
    content += `</body></html>`;
    
    const blob = new Blob([content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportType}_report_${new Date().getTime()}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const data = reportType === 'properties' ? properties : leads;
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(30, 64, 175);
    doc.text(`${reportType.toUpperCase()} Report`, 14, 22);
    
    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Prepare table data
    const headers = reportType === 'properties' 
      ? [['Title', 'Location', 'Type', 'Price', 'Status']]
      : [['Name', 'Email', 'Phone', 'Status', 'Property']];
    
    const rows = data.map((item: any) => {
      if (reportType === 'properties') {
        return [
          item.title || 'N/A',
          item.location || 'N/A',
          item.type || 'N/A',
          item.price || 'N/A',
          item.status === 'Pending_Approval' ? 'Pending Approval' : (item.status || 'N/A')
        ];
      } else {
        return [
          item.name || 'N/A',
          item.email || 'N/A',
          item.phone || 'N/A',
          item.status || 'N/A',
          item.propertyOfInterest || 'N/A'
        ];
      }
    });
    
    // Add table using autoTable
    autoTable(doc, {
      head: headers,
      body: rows,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255] },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 35 },
        2: { cellWidth: 30 },
        3: { cellWidth: 35 },
        4: { cellWidth: 30 }
      }
    });
    
    doc.save(`${reportType}_report_${new Date().getTime()}.pdf`);
  };

  const exportToExcel = () => {
    const data = reportType === 'properties' ? properties : leads;
    
    if (data.length === 0) {
      alert('No data available to export');
      return;
    }
    
    const worksheet = reportType === 'properties'
      ? XLSX.utils.json_to_sheet(data.map((item: any) => ({
          'Title': item.title || 'N/A',
          'Location': item.location || 'N/A',
          'Type': item.type || 'N/A',
          'Listing Type': item.listingType || 'N/A',
          'Price': item.price || 'N/A',
          'Status': item.status === 'Pending_Approval' ? 'Pending Approval' : (item.status || 'N/A'),
          'Area': item.area || 'N/A',
          'Bedrooms': item.bedrooms || 'N/A',
          'Bathrooms': item.bathrooms || 'N/A',
          'Description': item.description ? item.description.substring(0, 100) + '...' : 'N/A'
        })))
      : XLSX.utils.json_to_sheet(data.map((item: any) => ({
          'Name': item.name || 'N/A',
          'Email': item.email || 'N/A',
          'Phone': item.phone || 'N/A',
          'Status': item.status || 'N/A',
          'Property Interest': item.propertyOfInterest || 'N/A',
          'Source': item.source || 'N/A',
          'Date': item.date || 'N/A'
        })));
    
    // Set column widths
    const columnWidths = reportType === 'properties'
      ? [{ wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 40 }]
      : [{ wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 12 }];
    
    worksheet['!cols'] = columnWidths;
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, reportType.toUpperCase());
    XLSX.writeFile(workbook, `${reportType}_report_${new Date().getTime()}.xlsx`);
  };

  const handleExport = () => {
    try {
      if (exportFormat === 'word') {
        exportToWord();
        setTimeout(() => alert('Word document exported successfully!'), 500);
      } else if (exportFormat === 'pdf') {
        exportToPDF();
        setTimeout(() => alert('PDF document exported successfully!'), 500);
      } else if (exportFormat === 'excel') {
        exportToExcel();
        setTimeout(() => alert('Excel spreadsheet exported successfully!'), 500);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  // Calculate statistics
  const stats = {
    total: reportType === 'properties' ? properties.length : leads.length,
    approved: properties.filter((p: any) => p.status === 'Approved').length,
    pending: properties.filter((p: any) => p.status === 'Pending_Approval' || p.status === 'Pending Approval').length,
    rejected: properties.filter((p: any) => p.status === 'Rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900">Reports & Analytics</h2>
          <p className="text-sm text-slate-500 mt-1">
            Generate and export detailed reports
          </p>
        </div>
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
          <BarChart4 size={32} />
        </div>
      </div>

      {/* Statistics Cards */}
      {reportType === 'properties' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Properties</CardDescription>
              <CardTitle className="text-3xl font-bold">{stats.total}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Building2 size={14} />
                <span>All listings</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Approved</CardDescription>
              <CardTitle className="text-3xl font-bold text-emerald-600">{stats.approved}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-xs text-emerald-600">
                <TrendingUp size={14} />
                <span>Live properties</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending</CardDescription>
              <CardTitle className="text-3xl font-bold text-amber-600">{stats.pending}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-xs text-amber-600">
                <Eye size={14} />
                <span>Awaiting review</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Rejected</CardDescription>
              <CardTitle className="text-3xl font-bold text-rose-600">{stats.rejected}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-xs text-rose-600">
                <Users size={14} />
                <span>Not approved</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Export Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Export Report</CardTitle>
          <CardDescription>
            Select report type and format to export your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Report Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="properties">Properties Report</SelectItem>
                  <SelectItem value="leads">Leads Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Export Format */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Export Format</label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-rose-600" />
                      PDF Document
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet size={16} className="text-emerald-600" />
                      Excel Spreadsheet
                    </div>
                  </SelectItem>
                  <SelectItem value="word">
                    <div className="flex items-center gap-2">
                      <FileIcon size={16} className="text-blue-600" />
                      Word Document
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Export Button */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 invisible">Action</label>
              <Button 
                onClick={handleExport} 
                className="w-full gap-2"
                disabled={isLoading || (reportType === 'properties' ? properties.length === 0 : leads.length === 0)}
              >
                <Download size={18} />
                Export Report
              </Button>
            </div>
          </div>

          {/* Data Preview */}
          <div className="mt-6 border-t pt-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Data Preview</h3>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              <div className="text-sm text-slate-600">
                <p>Total Records: <span className="font-bold text-slate-900">{reportType === 'properties' ? properties.length : leads.length}</span></p>
                <p className="mt-1 text-xs text-slate-500">
                  Report will include all {reportType} data with complete details
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="text-blue-600" size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 text-sm">Export Formats Available</h4>
              <p className="text-xs text-blue-700 mt-1">
                <strong>PDF:</strong> Best for sharing and printing • <strong>Excel:</strong> For data analysis • <strong>Word:</strong> For documentation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
