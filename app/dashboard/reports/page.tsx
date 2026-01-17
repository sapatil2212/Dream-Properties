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
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Property Status Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Property Status Distribution</CardTitle>
            <CardDescription>Overview of property approval status</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Approved', value: properties.filter(p => p.status === 'Approved').length, color: '#10b981' },
                      { name: 'Pending', value: properties.filter(p => p.status === 'Pending_Approval').length, color: '#f59e0b' },
                      { name: 'Rejected', value: properties.filter(p => p.status === 'Rejected').length, color: '#ef4444' },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {[
                      { name: 'Approved', value: properties.filter(p => p.status === 'Approved').length, color: '#10b981' },
                      { name: 'Pending', value: properties.filter(p => p.status === 'Pending_Approval').length, color: '#f59e0b' },
                      { name: 'Rejected', value: properties.filter(p => p.status === 'Rejected').length, color: '#ef4444' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Property Type Distribution Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Property Type Distribution</CardTitle>
            <CardDescription>Properties by type category</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { type: 'Residential', count: properties.filter(p => p.type === 'Residential').length },
                    { type: 'Commercial', count: properties.filter(p => p.type === 'Commercial').length },
                    { type: 'Plots', count: properties.filter(p => p.type === 'Plots').length },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Property Views Trend Line Chart */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Property Views Trend</CardTitle>
          <CardDescription>Total views across all properties</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={properties.slice(0, 10).map((p, index) => ({
                  name: p.title?.substring(0, 15) || `Property ${index + 1}`,
                  views: p.views || 0,
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
