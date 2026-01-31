'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Download, Eye, Trash2, Edit2, X, Flag, CheckCircle, Search, Filter, FileText, FileSpreadsheet, Plus, Share2, Star, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Upload, Image as ImageIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ConfirmDialog, Modal, Select, Input, Badge, Skeleton, Button, DataTable, DatePicker } from '@/components/UIComponents';
import ImageViewer from '@/components/ImageViewer';
import { SuccessModal } from '@/components/ui/success-modal';
import { AlertModal } from '@/components/ui/alert-modal';

// Image Viewer Component - Moved to @/components/ImageViewer

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
  const [sortBy, setSortBy] = useState('Newest');
  const [typeFilter, setTypeFilter] = useState('All');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [shareMenuPropertyId, setShareMenuPropertyId] = useState<number | null>(null);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  
  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Alert Modal State
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'error' | 'warning'>('error');
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Image Viewer State
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [uploadingImages, setUploadingImages] = useState(false);

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
        setSuccessMessage(status === 'Approved' ? 'The property has been approved and the builder has been notified.' : 'The property has been rejected and the builder has been notified.');
        setShowSuccessModal(true);
        fetchProperties();
        if (selectedProperty?.id === propertyId) {
          setIsModalOpen(false);
          setSelectedProperty(null);
        }
      } else {
        const data = await response.json();
        setAlertMessage(data.message || 'Failed to update property status.');
        setAlertType('error');
        setShowAlertModal(true);
      }
    } catch (err) {
      setAlertMessage('Failed to update property status. Please try again.');
      setAlertType('error');
      setShowAlertModal(true);
    }
  };

  const handleFlagProperty = async (propertyId: number, flag: string | null, listingType: string) => {
    if (flag) {
      if (listingType === 'Sell' && flag !== 'Sold') {
        setAlertMessage('Properties for sale can only be flagged as "Sold".');
        setAlertType('warning');
        setShowAlertModal(true);
        return;
      }
      if (listingType === 'Rent' && flag !== 'Rented') {
        setAlertMessage('Properties for rent can only be flagged as "Rented".');
        setAlertType('warning');
        setShowAlertModal(true);
        return;
      }
      if (listingType === 'Lease' && flag !== 'Leased') {
        setAlertMessage('Properties for lease can only be flagged as "Leased".');
        setAlertType('warning');
        setShowAlertModal(true);
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
        setSuccessMessage(data.message || 'Property flag updated successfully.');
        setShowSuccessModal(true);
        fetchProperties();
      } else {
        const error = await response.json();
        setAlertMessage(error.message || 'Failed to flag property.');
        setAlertType('error');
        setShowAlertModal(true);
      }
    } catch (err) {
      setAlertMessage('Failed to flag property. Please try again.');
      setAlertType('error');
      setShowAlertModal(true);
    }
  };

  const handleDelete = async (propertyId: number) => {
    try {
      // Use the general delete endpoint that works for both admin and builder
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccessMessage('The property has been deleted successfully.');
        setShowSuccessModal(true);
        fetchProperties();
        if (selectedProperty?.id === propertyId) {
          setIsModalOpen(false);
          setSelectedProperty(null);
        }
      } else {
        const data = await response.json();
        setAlertMessage(data.message || 'Failed to delete property.');
        setAlertType('error');
        setShowAlertModal(true);
      }
    } catch (err) {
      setAlertMessage('Failed to delete property. Please try again.');
      setAlertType('error');
      setShowAlertModal(true);
    }
  };

  const openDeleteConfirm = (propertyId: number) => {
    setDeleteTargetId(propertyId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    await handleDelete(deleteTargetId);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
    setDeleteTargetId(null);
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
      } else {
        setAlertMessage('Failed to load property details.');
        setAlertType('error');
        setShowAlertModal(true);
      }
    } catch (err) {
      setAlertMessage('Failed to load property details. Please try again.');
      setAlertType('error');
      setShowAlertModal(true);
    }
  };

  const handleEditProperty = async (propertyId: number) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedProperty(data);
        setEditedProperty(data);
        setIsModalOpen(true);
        setIsEditing(true);
      } else {
        setAlertMessage('Failed to load property details.');
        setAlertType('error');
        setShowAlertModal(true);
      }
    } catch (err) {
      setAlertMessage('Failed to load property details. Please try again.');
      setAlertType('error');
      setShowAlertModal(true);
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
        setSuccessMessage('Property details have been updated successfully.');
        setShowSuccessModal(true);
        setSelectedProperty(editedProperty);
        setIsEditing(false);
        fetchProperties();
      } else {
        const data = await response.json();
        setAlertMessage(data.message || 'Failed to update property.');
        setAlertType('error');
        setShowAlertModal(true);
      }
    } catch (err) {
      setAlertMessage('Failed to update property. Please try again.');
      setAlertType('error');
      setShowAlertModal(true);
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

  const getStatusVariant = (status: string): 'success' | 'error' | 'warning' | 'neutral' => {
    if (status === 'Approved') return 'success';
    if (status === 'Rejected') return 'error';
    if (status === 'Pending_Approval' || status === 'Pending') return 'warning';
    return 'neutral';
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

  const buildShareMessage = (property: any, url: string) => {
    const parts = [
      'Check out this property on Dream Properties:',
      property.title || 'Property',
      property.location ? `Location: ${property.location}` : null,
      property.price && property.price !== 'NA' ? `Price: ${property.price}` : null,
      url,
    ].filter(Boolean);
    return parts.join('\n');
  };

  const handleShareWhatsApp = (property: any) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/properties/${property.id}`;
    const message = buildShareMessage(property, url);
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(shareUrl, '_blank');
  };

  const handleShareEmail = (property: any) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/properties/${property.id}`;
    const message = buildShareMessage(property, url);
    const subject = `Property Details: ${property.title || 'Property'}`;
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.location.href = mailto;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map((file: File) => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const base64 = reader.result as string;
              const response = await fetch('/api/upload-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64 })
              });
              const data = await response.json();
              if (data.success) {
                resolve(data.url);
              } else {
                reject(data.error || data.message || 'Upload failed');
              }
            } catch (err) {
              reject(err);
            }
          };
          reader.readAsDataURL(file);
        });
      });

      const urls = await Promise.all(uploadPromises);
      setEditedProperty((prev: any) => ({
        ...prev,
        images: [...(prev.images || []), ...urls]
      }));
    } catch (err: any) {
      setAlertMessage(err?.toString() || 'Failed to upload images. Please try again.');
      setAlertType('error');
      setShowAlertModal(true);
    } finally {
      setUploadingImages(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Inventory Management</h2>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">
            {isAdmin ? 'Manage all property submissions' : 'View and manage your listings'}
          </p>
        </div>
        <div className="flex gap-2">
          {(isAdmin || isBuilder) && (
            <Link href="/dashboard/post-property">
              <Button className="gap-2 shadow-none bg-blue-600 hover:bg-blue-700 text-white">
                <Plus size={18} /> Post New Property
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 flex items-center justify-end gap-3">
          <div className="w-64">
            <Input 
              placeholder="Search properties..." 
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              icon={<Search size={14} />}
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
                { label: 'Approved', value: 'Approved' },
                { label: 'Pending', value: 'Pending_Approval' },
                { label: 'Rejected', value: 'Rejected' }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Filter Status"
              size="sm"
            />
          </div>
          <div className="w-40">
            <Select
              options={[
                { label: 'All Types', value: 'All' },
                { label: 'Residential', value: 'Residential' },
                { label: 'Commercial', value: 'Commercial' },
                { label: 'Plots', value: 'Plots' }
              ]}
              value={typeFilter}
              onChange={setTypeFilter}
              placeholder="Filter Type"
              size="sm"
            />
          </div>
          <div className="w-32">
            <Select
              options={[
                { label: 'Export PDF', value: 'pdf' },
                { label: 'Export Excel', value: 'excel' },
                { label: 'Export Word', value: 'word' }
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
        <CardContent className="p-0 md:overflow-visible">
          <DataTable
            className="md:overflow-visible"
            headers={[
              'Property Details',
              ...(isAdmin ? ['Builder'] : []),
              'Type',
              'Price',
              'Status',
              'Featured',
              'Flag',
              'Actions'
            ]}
          >
            {isLoading ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="text-center py-10">
                    <Skeleton className="h-4 w-full" />
                  </td>
                </tr>
              ) : properties.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="text-center py-10 text-slate-400">
                    {isAdmin ? 'No properties in queue' : 'No properties posted yet'}
                  </td>
                </tr>
              ) : (
                filteredProperties.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 border-b border-slate-100 last:border-0 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900 text-xs">{p.title}</p>
                        <p className="text-xs text-slate-500">{p.location}</p>
                        <div className="flex flex-wrap gap-1 mt-1 sm:hidden">
                          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{p.type}</span>
                          <Badge variant={getStatusVariant(p.status)} className="text-xs h-5">
                            {p.status === 'Pending_Approval' ? 'Pending' : p.status}
                          </Badge>
                          {p.propertyFlag && (
                            <Badge variant="neutral" className="bg-indigo-50 text-indigo-600 border-indigo-100 font-bold text-xs h-5">
                              {p.propertyFlag}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div>
                          <p className="text-xs font-medium text-slate-700">
                            {p.builder_name || 'N/A'}
                          </p>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-xs font-medium text-blue-600">{p.type}</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-xs">{p.price}</td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <Badge variant={getStatusVariant(p.status)} className="text-xs">
                        {p.status === 'Pending_Approval' ? 'Pending' : p.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      {p.isFeatured ? (
                        <span className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                          <Star size={14} className="fill-amber-500" />
                          Featured
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      {p.propertyFlag ? (
                        <Badge variant="neutral" className="bg-indigo-50 text-indigo-600 border-indigo-100 font-bold text-xs">
                          {p.propertyFlag}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        {/* Admin-only approval buttons */}
                        {isAdmin && (p.status === 'Pending_Approval' || p.status === 'Pending Approval') && (
                          <>
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-xs h-8 px-2 sm:px-3"
                              onClick={() => handleApproval(p.id, 'Approved')}
                            >
                              <span className="hidden sm:inline">Approve</span>
                              <CheckCircle size={14} className="sm:hidden" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs h-8 px-2 sm:px-3"
                              onClick={() => handleApproval(p.id, 'Rejected')}
                            >
                              <span className="hidden sm:inline">Reject</span>
                              <X size={14} className="sm:hidden" />
                            </Button>
                          </>
                        )}
                        {/* Admin-only flag button for approved properties */}
                        {isAdmin && p.status === 'Approved' && (
                          <div className="relative inline-block">
                            <Button
                              variant="outline"
                              size="icon"
                              className={`${p.propertyFlag ? "bg-orange-50 border-orange-200 text-orange-700" : ""} h-8 w-8`}
                              onClick={() => setFlaggingPropertyId(flaggingPropertyId === p.id ? null : p.id)}
                              title={p.propertyFlag || 'Flag Property'}
                            >
                              <Flag size={14} />
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleViewDetails(p.id)}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </Button>
                        {isAdmin && (
                          <Link href={`/dashboard/post-property?id=${p.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8"
                              title="Edit Property"
                            >
                              <Edit2 size={14} />
                            </Button>
                          </Link>
                        )}
                        <div className="relative inline-block">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              setShareMenuPropertyId(
                                shareMenuPropertyId === p.id ? null : p.id,
                              )
                            }
                            title="Share Property"
                          >
                            <Share2 size={14} />
                          </Button>
                          {shareMenuPropertyId === p.id && (
                            <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 z-50 py-1">
                              <button
                                onClick={() => {
                                  handleShareWhatsApp(p);
                                  setShareMenuPropertyId(null);
                                }}
                                className="w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-slate-50 flex items-center gap-2"
                              >
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>Share via WhatsApp</span>
                              </button>
                              <button
                                onClick={() => {
                                  handleShareEmail(p);
                                  setShareMenuPropertyId(null);
                                }}
                                className="w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-slate-50 flex items-center gap-2"
                              >
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                <span>Share via Email</span>
                              </button>
                            </div>
                          )}
                        </div>
                        {isBuilder && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 w-8"
                            onClick={() => window.location.href = `/dashboard/edit-property/${p.id}`}
                            title="Edit Property"
                          >
                            <Edit2 size={14} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 w-8"
                          onClick={() => openDeleteConfirm(p.id)}
                          title="Delete Property"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
          </DataTable>
        </CardContent>
      </Card>

      {/* Property Details Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title={isEditing ? 'Edit Property' : 'Property Details'}
        className="max-w-5xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-500">
            {isEditing
              ? 'Modify the property information below'
              : 'View complete property information'}
          </p>
          {!isEditing && isAdmin && (
            <Link href={`/dashboard/post-property?id=${selectedProperty?.id}`}>
              <Button variant="outline" size="sm">
                <Edit2 size={16} className="mr-2" />
                Edit
              </Button>
            </Link>
          )}
        </div>

          {selectedProperty && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 pb-2 border-b">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Title"
                        value={isEditing ? (editedProperty?.title || '') : (selectedProperty.title || '')}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        readOnly={!isEditing}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-slate-50 text-slate-700" : ""}
                    />
                    <Input
                        label="Type"
                        value={isEditing ? (editedProperty?.type || '') : (selectedProperty.type || '')}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        readOnly={!isEditing}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-slate-50 text-slate-700" : ""}
                    />
                    {isEditing ? (
                        <Select
                            label="Listing Type"
                            options={[{ label: 'Sale', value: 'Sell' }, { label: 'Rent', value: 'Rent' }, { label: 'Lease', value: 'Lease' }]}
                            value={editedProperty?.listingType || 'Sell'}
                            onChange={(val) => handleInputChange('listingType', val)}
                        />
                    ) : (
                        <Input
                            label="Listing Type"
                            value={selectedProperty.listingType || 'N/A'}
                            readOnly={true}
                            disabled={true}
                            className="bg-slate-50 text-slate-700"
                        />
                    )}
                    <Input
                        label="Price"
                        value={isEditing ? (editedProperty?.price || '') : (selectedProperty.price || '')}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        readOnly={!isEditing}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-slate-50 font-bold text-blue-600" : ""}
                    />
                    <Input
                        label="Area"
                        value={isEditing ? (editedProperty?.area || '') : (selectedProperty.area || '')}
                        onChange={(e) => handleInputChange('area', e.target.value)}
                        readOnly={!isEditing}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-slate-50 text-slate-700" : ""}
                    />
                    <div>
                        <label className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-500">Status</label>
                        {isEditing && isAdmin ? (
                             <Select
                                options={[
                                    { label: 'Pending Approval', value: 'Pending_Approval' },
                                    { label: 'Approved', value: 'Approved' },
                                    { label: 'Rejected', value: 'Rejected' },
                                    { label: 'Sold', value: 'Sold' }
                                ]}
                                value={editedProperty?.status || 'Pending_Approval'}
                                onChange={(val) => handleInputChange('status', val)}
                             />
                        ) : (
                            <div className="mt-1 h-[42px] flex items-center px-3.5 rounded-xl border border-slate-200 bg-slate-50">
                                 <Badge variant={getStatusVariant(selectedProperty.status)} className="text-xs">
                                    {selectedProperty.status === 'Pending_Approval' ? 'Pending Approval' : selectedProperty.status}
                                 </Badge>
                            </div>
                        )}
                    </div>
                    {isEditing && isAdmin && (
                         <Select
                            label="Featured"
                            options={[{ label: 'Yes', value: 'true' }, { label: 'No', value: 'false' }]}
                            value={editedProperty?.isFeatured ? 'true' : 'false'}
                            onChange={(val) => handleInputChange('isFeatured', val === 'true')}
                         />
                    )}
                </div>
              </div>

              {/* Location Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 pb-2 border-b">
                  Location
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Location"
                        value={isEditing ? (editedProperty?.location || '') : (selectedProperty.location || '')}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        readOnly={!isEditing}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-slate-50 text-slate-700" : ""}
                    />
                    <div className="md:col-span-2">
                        <label className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-500">Address</label>
                        <textarea
                            className={`w-full px-3.5 py-2 mt-1 rounded-xl border bg-white transition-all focus:border-blue-500 outline-none disabled:bg-slate-50 text-[13px] font-medium border-slate-200 min-h-[60px]`}
                            value={isEditing ? (editedProperty?.address || '') : (selectedProperty.address || '')}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            disabled={!isEditing}
                        />
                    </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 pb-2 border-b">
                  Description
                </h3>
                 <div>
                    <textarea
                        className={`w-full px-3.5 py-2 mt-1 rounded-xl border bg-white transition-all focus:border-blue-500 outline-none disabled:bg-slate-50 text-[13px] font-medium border-slate-200 min-h-[100px]`}
                        value={isEditing ? (editedProperty?.description || '') : (selectedProperty.description || '')}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        disabled={!isEditing}
                        placeholder={!isEditing ? "No description available" : ""}
                    />
                </div>
              </div>

              {/* Property Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 pb-2 border-b">
                  Property Details
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Input
                        label="Bedrooms"
                        type="number"
                        value={isEditing ? (editedProperty?.bedrooms || '') : (selectedProperty.bedrooms || '')}
                        onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                        readOnly={!isEditing}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-slate-50 text-slate-700" : ""}
                    />
                    <Input
                        label="Bathrooms"
                        type="number"
                        value={isEditing ? (editedProperty?.bathrooms || '') : (selectedProperty.bathrooms || '')}
                        onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                        readOnly={!isEditing}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-slate-50 text-slate-700" : ""}
                    />
                    {isEditing ? (
                        <DatePicker
                            label="Possession Date"
                            value={editedProperty?.possessionDate || ''}
                            onChange={(val) => handleInputChange('possessionDate', val)}
                        />
                    ) : (
                         <Input
                            label="Possession Date"
                            value={selectedProperty.possessionDate || ''}
                            readOnly={true}
                            disabled={true}
                            className="bg-slate-50 text-slate-700"
                        />
                    )}
                    <Input
                        label="RERA ID"
                        value={isEditing ? (editedProperty?.reraId || '') : (selectedProperty.reraId || '')}
                        onChange={(e) => handleInputChange('reraId', e.target.value)}
                        readOnly={!isEditing}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-slate-50 text-slate-700" : ""}
                    />
                </div>
              </div>

              {/* Media & Links */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 pb-2 border-b">
                  Media & Links
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Map Link"
                        value={isEditing ? (editedProperty?.mapLink || '') : (selectedProperty.mapLink || '')}
                        onChange={(e) => handleInputChange('mapLink', e.target.value)}
                        readOnly={!isEditing}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-slate-50 text-slate-700" : ""}
                        placeholder="Google Maps Embed URL"
                    />
                    <Input
                        label="Video Link"
                        value={isEditing ? (editedProperty?.videoUrl || '') : (selectedProperty.videoUrl || '')}
                        onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                        readOnly={!isEditing}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-slate-50 text-slate-700" : ""}
                        placeholder="YouTube/Vimeo URL"
                    />
                </div>
              </div>

              {/* Builder Information */}
              {selectedProperty.builder && isAdmin && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 pb-2 border-b">
                    Builder Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <Input
                        label="Name"
                        value={selectedProperty.builder.name || 'N/A'}
                        readOnly={true}
                        disabled={true}
                        className="bg-slate-50 text-slate-700"
                    />
                    <Input
                        label="Email"
                        value={selectedProperty.builder.email || 'N/A'}
                        readOnly={true}
                        disabled={true}
                        className="bg-slate-50 text-slate-700"
                    />
                    <Input
                        label="Mobile"
                        value={selectedProperty.builder.mobile || 'N/A'}
                        readOnly={true}
                        disabled={true}
                        className="bg-slate-50 text-slate-700"
                    />
                  </div>
                </div>
              )}

              {/* Amenities */}
              {(isEditing || (selectedProperty.amenities && Array.isArray(selectedProperty.amenities) && selectedProperty.amenities.length > 0)) && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 pb-2 border-b">
                    Amenities
                  </h3>
                  {isEditing ? (
                       <div className="space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-500">Amenities (Comma separated)</label>
                          <textarea
                               className="w-full px-3.5 py-2 mt-1 rounded-xl border bg-white transition-all focus:border-blue-500 outline-none disabled:bg-slate-50 text-[13px] font-medium border-slate-200 min-h-[60px]"
                               value={Array.isArray(editedProperty?.amenities) ? editedProperty.amenities.join(', ') : (typeof editedProperty?.amenities === 'string' ? editedProperty.amenities : '')}
                               onChange={(e) => handleInputChange('amenities', e.target.value.split(',').map((s: string) => s.trim()))}
                          />
                       </div>
                  ) : (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {selectedProperty.amenities.map((amenity: string, index: number) => (
                          <Badge key={index} variant="neutral" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                  )}
                </div>
              )}

              {/* Images */}
              {(isEditing || (selectedProperty.images && Array.isArray(selectedProperty.images) && selectedProperty.images.length > 0)) && (
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 pb-2 border-b flex justify-between items-center">
                    <span>Property Images ({isEditing ? (editedProperty?.images?.length || 0) : (selectedProperty.images?.length || 0)})</span>
                  </h3>
                  
                  {uploadingImages && (
                    <div className="text-xs text-blue-600 font-medium animate-pulse">
                      Uploading images...
                    </div>
                  )}

                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {(isEditing ? (editedProperty?.images || []) : (selectedProperty.images || [])).map((image: string, index: number) => (
                      <div 
                        key={index} 
                        className="aspect-video bg-slate-100 rounded-lg overflow-hidden cursor-pointer group relative"
                        onClick={() => {
                            if (!isEditing) {
                              setCurrentImageIndex(index);
                              setIsImageViewerOpen(true);
                            }
                        }}
                      >
                        <img
                          src={image}
                          alt={`Property ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        
                        {isEditing && isAdmin ? (
                           <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      setEditedProperty((prev: any) => ({
                                          ...prev,
                                          images: prev.images.filter((_: any, i: number) => i !== index)
                                      }));
                                  }}
                                  className="p-1.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 shadow-sm"
                              >
                                  <Trash2 size={12} />
                              </button>
                           </div>
                        ) : (
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <ZoomIn className="text-white drop-shadow-md" size={24} />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Add Image Card for Edit Mode */}
                    {isEditing && isAdmin && (
                      <label className="aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group p-2 text-center">
                          <ImageIcon className="text-slate-300 group-hover:text-blue-500 mb-1" size={24} />
                          <span className="text-[10px] font-bold text-slate-400 group-hover:text-blue-600 block">Add Image</span>
                          <span className="text-[8px] font-medium text-slate-400 group-hover:text-blue-500 block mt-0.5">Max 10MB</span>
                          <input 
                              type="file" 
                              multiple 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handleImageUpload}
                              disabled={uploadingImages}
                          />
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t mt-4">
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
          </div>
      </Modal>
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />
      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        message={alertMessage}
        type={alertType}
      />
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          if (isDeleting) return;
          setShowDeleteConfirm(false);
          setDeleteTargetId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Property"
        message="Are you sure you want to delete this property? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
      <ImageViewer
        images={selectedProperty?.images || []}
        initialIndex={currentImageIndex}
        isOpen={isImageViewerOpen}
        onClose={() => setIsImageViewerOpen(false)}
      />
    </div>
  );
}
