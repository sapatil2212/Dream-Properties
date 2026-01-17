'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, X, Plus, Check, Loader2, AlertCircle } from 'lucide-react';
import { Button, Input, Card, Alert } from '@/components/UIComponents';
import { motion, AnimatePresence } from 'framer-motion';

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [propertyStatus, setPropertyStatus] = useState(''); // Track current status

  // Alert states
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  });

  const [formData, setFormData] = useState({
    type: '',
    propertySubtype: '',
    listingType: '',
    title: '',
    price: '',
    area: '',
    areaUnit: 'sq.ft.',
    location: '',
    address: '',
    description: '',
    bedrooms: '',
    bathrooms: '',
    possessionDate: '',
    reraId: '',
    furnishing: '',
    listedBy: '',
    bachelorsAllowed: '',
    carpetArea: '',
    maintenance: '',
    totalFloors: '',
    carParking: '',
    projectUnits: '',
    projectArea: '',
    configurations: '',
    avgPrice: '',
    launchDate: '',
    sizes: '',
    projectSize: '',
    amenities: [] as string[],
    highlights: [] as string[],
    specifications: [] as { label: string; value: string }[],
    images: [] as string[],
    mapLink: '',
    nearbyLocations: [] as { name: string; type: string; distance: string; time: string }[],
    attachments: [] as { name: string; url: string; size: string }[],
  });

  useEffect(() => {
    fetchPropertyData();
  }, [id]);

  const fetchPropertyData = async () => {
    try {
      const response = await fetch(`/api/properties/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPropertyStatus(data.status); // Store the current status
        setFormData({
          type: data.type || '',
          propertySubtype: data.propertySubtype || '',
          listingType: data.listingType || '',
          title: data.title || '',
          price: data.price || '',
          area: data.area || '',
          areaUnit: data.areaUnit || 'sq.ft.',
          location: data.location || '',
          address: data.address || '',
          description: data.description || '',
          bedrooms: data.bedrooms?.toString() || '',
          bathrooms: data.bathrooms?.toString() || '',
          possessionDate: data.possessionDate || '',
          reraId: data.reraId || '',
          furnishing: data.furnishing || '',
          listedBy: data.listedBy || '',
          bachelorsAllowed: data.bachelorsAllowed || '',
          carpetArea: data.carpetArea || '',
          maintenance: data.maintenance || '',
          totalFloors: data.totalFloors || '',
          carParking: data.carParking || '',
          projectUnits: data.projectUnits?.toString() || '',
          projectArea: data.projectArea || '',
          configurations: data.configurations || '',
          avgPrice: data.avgPrice || '',
          launchDate: data.launchDate || '',
          sizes: data.sizes || '',
          projectSize: data.projectSize || '',
          amenities: Array.isArray(data.amenities) ? data.amenities : [],
          highlights: Array.isArray(data.highlights) ? data.highlights : [],
          specifications: Array.isArray(data.specifications) ? data.specifications : [],
          images: Array.isArray(data.images) ? data.images : [],
          mapLink: data.mapLink || '',
          nearbyLocations: Array.isArray(data.nearbyLocations) ? data.nearbyLocations : [],
          attachments: Array.isArray(data.attachments) ? data.attachments : [],
        });
      } else {
        setAlertConfig({
          type: 'error',
          title: 'Property Not Found',
          message: 'Unable to load property details.'
        });
        setShowAlert(true);
      }
    } catch (err) {
      console.error('Failed to fetch property:', err);
      setAlertConfig({
        type: 'error',
        title: 'Error',
        message: 'Failed to load property data.'
      });
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setAlertConfig({
          type: 'success',
          title: 'Property Updated Successfully!',
          message: 'Your property changes have been saved and will be re-verified by our team. You will be notified once approved.'
        });
        setShowAlert(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        const data = await response.json();
        setAlertConfig({
          type: 'error',
          title: 'Update Failed',
          message: data.message || 'Failed to update property. Please try again.'
        });
        setShowAlert(true);
      }
    } catch (err) {
      setAlertConfig({
        type: 'error',
        title: 'Network Error',
        message: 'Unable to connect to server. Please check your internet connection.'
      });
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/dashboard')} 
              className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900">Edit Property</h1>
              <p className="text-xs text-slate-500 font-medium">Update your property information</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Re-approval Warning Banner */}
        {propertyStatus === 'Approved' && (
          <div className="mb-6 bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-black text-amber-900 text-sm mb-1">Re-Approval Required</h3>
              <p className="text-xs text-amber-800 leading-relaxed">
                This property is currently <span className="font-bold">APPROVED</span> and visible to users. 
                Any changes you make will require <span className="font-bold">re-verification</span> by our admin team. 
                The property status will change to <span className="font-bold">Pending Approval</span> until reviewed.
              </p>
            </div>
          </div>
        )}

        <Card className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Property: {formData.title}</h2>
            <p className="text-sm text-slate-500">Make changes and submit for approval</p>
          </div>

          {/* Quick Edit Form - All fields in one view */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-slate-900 pb-2 border-b">Basic Information</h3>
              
              <Input
                label="Property Title *"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Dream Heights Residency"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={formData.listingType === 'Rent' ? 'Rent (Monthly) *' : 'Price *'}
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  placeholder={formData.listingType === 'Rent' ? 'e.g., ₹25,000/month' : 'e.g., ₹45 Lacs'}
                />
                <Input
                  label="Area *"
                  value={formData.area}
                  onChange={e => setFormData({ ...formData, area: e.target.value })}
                  placeholder="e.g., 1200 sq.ft."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Location *"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Nashik Road, Nashik"
                />
                <Input
                  label="Address"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Complete address"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 mb-2 block">Description</label>
                <textarea
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium min-h-[100px]"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Property description..."
                />
              </div>
            </div>

            {/* Property Details */}
            {formData.type === 'Residential' && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-900 pb-2 border-b">Property Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={e => setFormData({ ...formData, bedrooms: e.target.value })}
                    placeholder="e.g., 3"
                  />
                  <Input
                    label="Bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={e => setFormData({ ...formData, bathrooms: e.target.value })}
                    placeholder="e.g., 2"
                  />
                </div>
              </div>
            )}

            {/* Rental Fields */}
            {formData.listingType === 'Rent' && (
              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-900 pb-2 border-b">Rental Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-2 block">Furnishing</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                      value={formData.furnishing}
                      onChange={e => setFormData({ ...formData, furnishing: e.target.value })}
                    >
                      <option value="">Select</option>
                      <option value="Fully Furnished">Fully Furnished</option>
                      <option value="Semi Furnished">Semi Furnished</option>
                      <option value="Unfurnished">Unfurnished</option>
                    </select>
                  </div>
                  <Input
                    label="Maintenance (Monthly)"
                    value={formData.maintenance}
                    onChange={e => setFormData({ ...formData, maintenance: e.target.value })}
                    placeholder="e.g., ₹2,000"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-8 mt-8 border-t">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Update Property
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>

      {/* Alert Component */}
      <Alert
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
      />
    </div>
  );
}
