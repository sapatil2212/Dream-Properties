'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Download, Eye, Trash2, Edit2, X, Flag, CheckCircle, Search, Filter, FileText, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function InventoryManagementPage() {
  const { data: session } = useSession();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProperty, setEditedProperty] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [flaggingPropertyId, setFlaggingPropertyId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);

  // Determine user role
  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'ADMIN';
  const isBuilder = session?.user?.role === 'BUILDER';

  const fetchProperties = async () => {
    try {
      // Use different API based on role
      const endpoint = isAdmin 
        ? '/api/superadmin/properties-for-approval' 
        : '/api/builder/my-properties';
      
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched properties:', data.length);
        setProperties(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    let filtered = properties;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((p: any) => 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.type?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter((p: any) => p.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'All') {
      filtered = filtered.filter((p: any) => p.type === typeFilter);
    }

    setFilteredProperties(filtered);
  }, [properties, searchQuery, statusFilter, typeFilter]);

  const handleApproval = async (propertyId: number, status: string) => {
    try {
      const response = await fetch('/api/superadmin/approve-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, status }),
      });
      if (response.ok) {
        alert(`Property ${status.toLowerCase()} successfully`);
        fetchProperties();
        if (selectedProperty?.id === propertyId) {
          setIsModalOpen(false);
          setSelectedProperty(null);
        }
      }
    } catch (err) {
      alert('Failed to update property status');
    }
  };

  const handleFlagProperty = async (propertyId: number, flag: string | null, listingType: string) => {
    // Validate flag matches listing type
    if (flag) {
      if (listingType === 'Sell' && flag !== 'Sold') {
        alert('Properties for sale can only be flagged as "Sold"');
        return;
      }
      if (listingType === 'Rent' && flag !== 'Rented') {
        alert('Properties for rent can only be flagged as "Rented"');
        return;
      }
      if (listingType === 'Lease' && flag !== 'Leased') {
        alert('Properties for lease can only be flagged as "Leased"');
        return;
      }
    }

    try {
      const response = await fetch('/api/superadmin/flag-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, flag }),
      });
      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        fetchProperties();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to flag property');
      }
    } catch (err) {
      alert('Failed to flag property');
    }
  };

  const handleDelete = async (propertyId: number) => {
    if (
      !confirm(
        'Are you sure you want to delete this property? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      // Use the general delete endpoint that works for both admin and builder
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Property deleted successfully');
        fetchProperties();
        if (selectedProperty?.id === propertyId) {
          setIsModalOpen(false);
          setSelectedProperty(null);
        }
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete property');
      }
    } catch (err) {
      alert('Failed to delete property');
    }
  };

  const handleViewDetails = async (propertyId: number) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedProperty(data);
        setEditedProperty(data);
        setIsModalOpen(true);
        setIsEditing(false);
      }
    } catch (err) {
      alert('Failed to load property details');
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedProperty({ ...selectedProperty });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEditedProperty((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/properties/${selectedProperty.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedProperty),
      });
      
      if (response.ok) {
        alert('Property updated successfully');
        setSelectedProperty(editedProperty);
        setIsEditing(false);
        fetchProperties();
      } else {
        alert('Failed to update property');
      }
    } catch (err) {
      alert('Failed to update property');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
    setEditedProperty(null);
    setIsEditing(false);
  };

  const getStatusVariant = (status: string) => {
    if (status === 'Approved') return 'default';
    if (status === 'Rejected') return 'destructive';
    return 'secondary';
  };

  const exportToPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      
      const doc = new jsPDF();
      
      // Load logo image
      const logoImg = new Image();
      logoImg.src = '/assets/dp-logo.png';
      
      await new Promise((resolve, reject) => {
        logoImg.onload = resolve;
        logoImg.onerror = reject;
      });
      
      // Add logo to top right corner
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.addImage(logoImg, 'PNG', pageWidth - 50, 10, 40, 15);
      
      // Add watermark in center with 95% opacity
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.saveGraphicsState();
      // @ts-ignore - jsPDF GState type definition issue
      doc.setGState({ opacity: 0.05 }); // 95% transparency = 5% opacity
      const watermarkSize = 80;
      doc.addImage(
        logoImg, 
        'PNG', 
        (pageWidth - watermarkSize) / 2, 
        (pageHeight - watermarkSize) / 2, 
        watermarkSize, 
        watermarkSize * (logoImg.height / logoImg.width)
      );
      doc.restoreGraphicsState();
      
      // Add title
      doc.setFontSize(18);
      doc.text('Properties Report', 14, 20);
      
      // Add date
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28);
      
      // Prepare table data
      const tableData = filteredProperties.map((p: any) => [
        p.title || 'N/A',
        p.type || 'N/A',
        p.price || 'N/A',
        p.status === 'Pending_Approval' ? 'Pending' : p.status || 'N/A',
        p.location || 'N/A',
        p.propertyFlag || '-'
      ]);
      
      // Add table
      autoTable(doc, {
        head: [['Property', 'Type', 'Price', 'Status', 'Location', 'Flag']],
        body: tableData,
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 9 }
      });
      
      // Save PDF
      doc.save(`properties_${new Date().toISOString().split('T')[0]}.pdf`);
      setShowExportMenu(false);
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const exportToExcel = () => {
    const headers = ['Property', 'Type', 'Price', 'Status', 'Location'];
    const rows = filteredProperties.map((p: any) => [
      p.title,
      p.type,
      p.price,
      p.status,
      p.location
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach((row: any[]) => {
      csvContent += row.map((cell: any) => `"${cell || ''}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `properties_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setShowExportMenu(false);
  };

  const exportToWord = async () => {
    try {
      const { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, AlignmentType } = await import('docx');
      
      // Create header
      const headerParagraph = new Paragraph({
        children: [
          new TextRun({
            text: 'Properties Report',
            bold: true,
            size: 32,
          }),
        ],
        spacing: { after: 200 },
      });
      
      const dateParagraph = new Paragraph({
        children: [
          new TextRun({
            text: `Generated: ${new Date().toLocaleDateString()}`,
            size: 20,
          }),
        ],
        spacing: { after: 400 },
      });
      
      // Create table header
      const tableHeader = new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Property', bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Type', bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Price', bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Status', bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Location', bold: true })] })] }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Flag', bold: true })] })] }),
        ],
      });
      
      // Create table rows
      const tableRows = filteredProperties.map((p: any) => 
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(p.title || 'N/A')] }),
            new TableCell({ children: [new Paragraph(p.type || 'N/A')] }),
            new TableCell({ children: [new Paragraph(p.price || 'N/A')] }),
            new TableCell({ children: [new Paragraph(p.status === 'Pending_Approval' ? 'Pending' : p.status || 'N/A')] }),
            new TableCell({ children: [new Paragraph(p.location || 'N/A')] }),
            new TableCell({ children: [new Paragraph(p.propertyFlag || '-')] }),
          ],
        })
      );
      
      // Create table
      const table = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [tableHeader, ...tableRows],
      });
      
      // Create document
      const doc = new Document({
        sections: [
          {
            children: [headerParagraph, dateParagraph, table],
          },
        ],
      });
      
      // Generate and download
      const blob = await Packer.toBlob(doc);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `properties_${new Date().toISOString().split('T')[0]}.docx`;
      link.click();
      setShowExportMenu(false);
    } catch (error) {
      console.error('Word export error:', error);
      alert('Failed to export Word document. Please try again.');
    }
  };

  const renderValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.length > 0 ? value.join(', ') : 'N/A';
      }
      return JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900">
            {isAdmin ? 'Property Inventory' : 'My Properties'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin 
              ? 'Review and approve property submissions' 
              : 'Manage your property listings'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <Input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending_Approval">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Types</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Plots">Plots</option>
          </select>

          {/* Export Dropdown */}
          <div className="relative">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowExportMenu(!showExportMenu)}
              title="Export"
            >
              <Download size={16} />
            </Button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-50 py-1">
                <button
                  onClick={exportToExcel}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
                >
                  <FileSpreadsheet size={16} className="text-emerald-600" />
                  Export to Excel
                </button>
                <button
                  onClick={exportToPDF}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
                >
                  <FileText size={16} className="text-rose-600" />
                  Export to PDF
                </button>
                <button
                  onClick={exportToWord}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
                >
                  <FileText size={16} className="text-blue-600" />
                  Export to Word
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isAdmin ? 'Property Approval Queue' : 'Your Property Listings'}
          </CardTitle>
          <CardDescription>
            {isAdmin
              ? 'Manage all property submissions and their approval status'
              : 'View and manage all your posted properties'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property Details</TableHead>
                {isAdmin && <TableHead>Builder</TableHead>}
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Flag</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-10">
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                </TableRow>
              ) : properties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-10 text-slate-400">
                    {isAdmin ? 'No properties in queue' : 'No properties posted yet'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProperties.map((p) => (
                  <TableRow key={p.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{p.title}</p>
                        <p className="text-xs text-slate-500">{p.location}</p>
                      </div>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {p.builder_name || 'N/A'}
                          </p>
                          <p className="text-xs text-slate-500">{p.builder_email || ''}</p>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <span className="text-sm font-medium text-blue-600">{p.type}</span>
                    </TableCell>
                    <TableCell className="font-medium">{p.price}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(p.status)}>
                        {p.status === 'Pending_Approval' ? 'Pending Approval' : p.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {p.propertyFlag ? (
                        <Badge variant="secondary" className="bg-orange-500 text-white border-orange-600 font-bold">
                          <Flag size={14} className="mr-1 fill-white" />
                          {p.propertyFlag}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Admin-only approval buttons */}
                        {isAdmin && (p.status === 'Pending_Approval' || p.status === 'Pending Approval') && (
                          <>
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => handleApproval(p.id, 'Approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-rose-600 border-rose-200 hover:bg-rose-50"
                              onClick={() => handleApproval(p.id, 'Rejected')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {/* Admin-only flag button for approved properties */}
                        {isAdmin && p.status === 'Approved' && (
                          <div className="relative inline-block">
                            <Button
                              variant="outline"
                              size="sm"
                              className={p.propertyFlag ? "bg-orange-50 border-orange-200 text-orange-700" : ""}
                              onClick={() => setFlaggingPropertyId(flaggingPropertyId === p.id ? null : p.id)}
                              title="Flag Property"
                            >
                              <Flag size={14} className="mr-1" />
                              {p.propertyFlag || 'Flag'}
                            </Button>
                            {flaggingPropertyId === p.id && (
                              <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 z-50 py-1">
                                {p.listingType === 'Sell' && (
                                  <button
                                    onClick={() => {
                                      handleFlagProperty(p.id, p.propertyFlag === 'Sold' ? null : 'Sold', p.listingType);
                                      setFlaggingPropertyId(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    {p.propertyFlag === 'Sold' ? <X size={14} /> : <CheckCircle size={14} />}
                                    {p.propertyFlag === 'Sold' ? 'Remove Flag' : 'Mark as Sold'}
                                  </button>
                                )}
                                {p.listingType === 'Rent' && (
                                  <button
                                    onClick={() => {
                                      handleFlagProperty(p.id, p.propertyFlag === 'Rented' ? null : 'Rented', p.listingType);
                                      setFlaggingPropertyId(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    {p.propertyFlag === 'Rented' ? <X size={14} /> : <CheckCircle size={14} />}
                                    {p.propertyFlag === 'Rented' ? 'Remove Flag' : 'Mark as Rented'}
                                  </button>
                                )}
                                {p.listingType === 'Lease' && (
                                  <button
                                    onClick={() => {
                                      handleFlagProperty(p.id, p.propertyFlag === 'Leased' ? null : 'Leased', p.listingType);
                                      setFlaggingPropertyId(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    {p.propertyFlag === 'Leased' ? <X size={14} /> : <CheckCircle size={14} />}
                                    {p.propertyFlag === 'Leased' ? 'Remove Flag' : 'Mark as Leased'}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        {/* View button for all */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(p.id)}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </Button>
                        {/* Builder-only edit button */}
                        {isBuilder && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            onClick={() => window.location.href = `/dashboard/edit-property/${p.id}`}
                            title="Edit Property"
                          >
                            <Edit2 size={16} />
                          </Button>
                        )}
                        {/* Delete button for all */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => handleDelete(p.id)}
                          title="Delete Property"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Property Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-xl flex items-center justify-between">
              <span>{isEditing ? 'Edit Property' : 'Property Details'}</span>
              {!isEditing && isAdmin && (
                <Button variant="outline" size="sm" onClick={handleEditToggle}>
                  <Edit2 size={16} className="mr-2" />
                  Edit
                </Button>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {isEditing
                ? 'Modify the property information below'
                : 'View complete property information'}
            </DialogDescription>
          </DialogHeader>

          {selectedProperty && (
            <div className="space-y-4">
              {/* Basic Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 pb-1.5 border-b">
                  Basic Information
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Title</Label>
                    {isEditing ? (
                      <Input
                        value={editedProperty?.title || ''}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="mt-1 h-9 text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-slate-600">{selectedProperty.title}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs">Type</Label>
                    {isEditing ? (
                      <Input
                        value={editedProperty?.type || ''}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        className="mt-1 h-9 text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-slate-600">{selectedProperty.type}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs">Listing Type</Label>
                    <p className="mt-1 text-sm text-slate-600">
                      {renderValue(selectedProperty.listingType)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs">Price</Label>
                    {isEditing ? (
                      <Input
                        value={editedProperty?.price || ''}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        className="mt-1 h-9 text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm font-semibold text-blue-600">{selectedProperty.price}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs">Area</Label>
                    {isEditing ? (
                      <Input
                        value={editedProperty?.area || ''}
                        onChange={(e) => handleInputChange('area', e.target.value)}
                        className="mt-1 h-9 text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-slate-600">{selectedProperty.area}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs">Status</Label>
                    <div className="mt-1">
                      <Badge variant={getStatusVariant(selectedProperty.status)} className="text-xs">
                        {selectedProperty.status === 'Pending_Approval' ? 'Pending Approval' : selectedProperty.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 pb-1.5 border-b">
                  Location
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Location</Label>
                    {isEditing ? (
                      <Input
                        value={editedProperty?.location || ''}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="mt-1 h-9 text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-slate-600">{selectedProperty.location}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs">Address</Label>
                    {isEditing ? (
                      <Textarea
                        value={editedProperty?.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="mt-1 text-sm min-h-[60px]"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-slate-600">{selectedProperty.address}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 pb-1.5 border-b">
                  Description
                </h3>
                {isEditing ? (
                  <Textarea
                    value={editedProperty?.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="mt-1 text-sm min-h-[80px]"
                  />
                ) : (
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {selectedProperty.description || 'No description available'}
                  </p>
                )}
              </div>

              {/* Property Details */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 pb-1.5 border-b">
                  Property Details
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs">Bedrooms</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editedProperty?.bedrooms || ''}
                        onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                        className="mt-1 h-9 text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-slate-600">
                        {renderValue(selectedProperty.bedrooms)}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs">Bathrooms</Label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={editedProperty?.bathrooms || ''}
                        onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                        className="mt-1 h-9 text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-slate-600">
                        {renderValue(selectedProperty.bathrooms)}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs">Possession Date</Label>
                    {isEditing ? (
                      <Input
                        value={editedProperty?.possessionDate || ''}
                        onChange={(e) => handleInputChange('possessionDate', e.target.value)}
                        className="mt-1 h-9 text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-slate-600">
                        {renderValue(selectedProperty.possessionDate)}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs">RERA ID</Label>
                    {isEditing ? (
                      <Input
                        value={editedProperty?.reraId || ''}
                        onChange={(e) => handleInputChange('reraId', e.target.value)}
                        className="mt-1 h-9 text-sm"
                      />
                    ) : (
                      <p className="mt-1 text-sm text-slate-600">
                        {renderValue(selectedProperty.reraId)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Builder Information */}
              {selectedProperty.builder && isAdmin && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 pb-1.5 border-b">
                    Builder Information
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Name</Label>
                      <p className="mt-1 text-sm text-slate-600">
                        {selectedProperty.builder.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs">Email</Label>
                      <p className="mt-1 text-sm text-slate-600">
                        {selectedProperty.builder.email || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs">Mobile</Label>
                      <p className="mt-1 text-sm text-slate-600">
                        {selectedProperty.builder.mobile || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Amenities */}
              {selectedProperty.amenities && Array.isArray(selectedProperty.amenities) && selectedProperty.amenities.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 pb-1.5 border-b">
                    Amenities
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProperty.amenities.map((amenity: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Images */}
              {selectedProperty.images && Array.isArray(selectedProperty.images) && selectedProperty.images.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 pb-1.5 border-b">
                    Property Images ({selectedProperty.images.length})
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {selectedProperty.images.slice(0, 8).map((image: string, index: number) => (
                      <div key={index} className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`Property ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 pt-3 border-t mt-4">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleEditToggle} disabled={isSaving} size="sm">
                  Cancel
                </Button>
                <Button onClick={handleSaveChanges} disabled={isSaving} size="sm">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <>
                {isAdmin && (selectedProperty?.status === 'Pending_Approval' || selectedProperty?.status === 'Pending Approval') && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-rose-600 border-rose-200 hover:bg-rose-50"
                      onClick={() => handleApproval(selectedProperty.id, 'Rejected')}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleApproval(selectedProperty.id, 'Approved')}
                    >
                      Approve
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={handleCloseModal} size="sm">
                  Close
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
