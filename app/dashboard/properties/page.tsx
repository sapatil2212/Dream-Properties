'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Download, Eye, Trash2, Edit2, X } from 'lucide-react';
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
        <Button variant="outline" className="gap-2">
          <Download size={16} /> Export CSV
        </Button>
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-10">
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                </TableRow>
              ) : properties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-10 text-slate-400">
                    {isAdmin ? 'No properties in queue' : 'No properties posted yet'}
                  </TableCell>
                </TableRow>
              ) : (
                properties.map((p) => (
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
