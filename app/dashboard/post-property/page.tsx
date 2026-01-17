'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, X, Plus, FileText, Image as ImageIcon, Upload, Check } from 'lucide-react';
import { Button, Input, Card, Alert } from '@/components/UIComponents';
import { motion, AnimatePresence } from 'framer-motion';

export default function PostPropertyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingPDF, setUploadingPDF] = useState(false);

  // Alert states
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  });

  const [formData, setFormData] = useState({
    // Step 1: Property Type & Details
    type: '',
    propertySubtype: '',
    listingType: '',
    title: '',
    price: '',
    area: '',
    areaUnit: 'sq.ft.',
    
    // Step 2: Location & Description
    location: '',
    address: '',
    description: '',
    
    // Step 3: Property Specific
    bedrooms: '',
    bathrooms: '',
    possessionDate: '',
    reraId: '',
    
    // Rental-specific fields
    furnishing: '',
    listedBy: '',
    bachelorsAllowed: '',
    carpetArea: '',
    maintenance: '',
    totalFloors: '',
    carParking: '',
    
    // Step 4: Project Details
    projectUnits: '',
    projectArea: '',
    configurations: '',
    avgPrice: '',
    launchDate: '',
    sizes: '',
    projectSize: '',
    
    // Step 5: Amenities & Features
    amenities: [] as string[],
    highlights: [] as string[],
    specifications: [] as { label: string; value: string }[],
    
    // Step 6: Images
    images: [] as string[],
    
    // Step 7: Location Details
    mapLink: '',
    nearbyLocations: [] as { name: string; type: string; distance: string; time: string }[],
    
    // Step 8: Documents
    attachments: [] as { name: string; url: string; size: string }[],
  });

  const [tempInputs, setTempInputs] = useState({
    amenity: '',
    highlight: '',
    specLabel: '',
    specValue: '',
    nearbyName: '',
    nearbyType: 'School',
    nearbyDistance: '',
    nearbyTime: '',
  });

  // Property Type Options
  const propertyTypes = ['Residential', 'Commercial', 'Plots'];

  // Sub-type options based on property type
  const subtypeOptions = {
    Residential: [
      'Flats/Apartments',
      'Villas',
      'Rowhouses',
      'Individual Houses'
    ],
    Commercial: [
      'Office Spaces',
      'IT Parks & Tech Hubs',
      'Shops & Showrooms',
      'Shopping Complexes & Malls',
      'Co-working Spaces',
      'Business Centers',
      'Hotels & Resorts',
      'Restaurants & Cafés',
      'Warehouses & Godowns',
      'Industrial Sheds',
      'Logistics Parks',
      'Hospitals & Clinics',
      'Educational Institutes',
      'Banks & Financial Offices'
    ],
    Plots: [
      'Residential Plots (NA - Non Agricultural)',
      'Commercial Plots',
      'Agricultural Plots'
    ]
  };

  const listingTypeOptions = ['Sell', 'Rent', 'Lease'];

  const nearbyTypes = ['School', 'Bus Stand', 'Shopping', 'Hospital', 'Coffee', 'Others'];

  // Step validation
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.type && formData.propertySubtype && formData.listingType && formData.title && formData.price && formData.area);
      case 2:
        return !!(formData.location && formData.address && formData.description);
      case 3:
        if (formData.type === 'Residential') {
          return !!(formData.bedrooms && formData.bathrooms);
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 8));
    } else {
      setAlertConfig({
        type: 'warning',
        title: 'Required Fields Missing',
        message: 'Please fill all required fields before proceeding to the next step.'
      });
      setShowAlert(true);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
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
                reject('Upload failed');
              }
            } catch (err) {
              reject(err);
            }
          };
          reader.readAsDataURL(file);
        });
      });

      const urls = await Promise.all(uploadPromises);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (err) {
      setAlertConfig({
        type: 'error',
        title: 'Upload Failed',
        message: 'Failed to upload images. Please try again.'
      });
      setShowAlert(true);
    } finally {
      setUploadingImages(false);
    }
  };

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPDF(true);
    try {
      const file = files[0];
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setAlertConfig({
          type: 'error',
          title: 'File Too Large',
          message: 'File size exceeds 10MB limit. Please upload a smaller file.'
        });
        setShowAlert(true);
        return;
      }

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
            setFormData(prev => ({
              ...prev,
              attachments: [
                ...prev.attachments,
                {
                  name: file.name,
                  url: data.url,
                  size: `${(file.size / 1024).toFixed(2)} KB`
                }
              ]
            }));
          }
        } catch (err) {
          setAlertConfig({
            type: 'error',
            title: 'Upload Failed',
            message: 'Failed to upload document. Please try again.'
          });
          setShowAlert(true);
        } finally {
          setUploadingPDF(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setAlertConfig({
        type: 'error',
        title: 'Upload Failed',
        message: 'Failed to upload document. Please try again.'
      });
      setShowAlert(true);
      setUploadingPDF(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setAlertConfig({
          type: 'success',
          title: 'Property Submitted!',
          message: 'Your property has been submitted for approval. Our admin team will review it shortly.'
        });
        setShowAlert(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        const data = await response.json();
        setAlertConfig({
          type: 'error',
          title: 'Submission Failed',
          message: data.message || 'Failed to submit property. Please try again.'
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

  const steps = [
    { number: 1, title: 'Property Type' },
    { number: 2, title: 'Location' },
    { number: 3, title: 'Details' },
    { number: 4, title: 'Project Info' },
    { number: 5, title: 'Features' },
    { number: 6, title: 'Images' },
    { number: 7, title: 'Map' },
    { number: 8, title: 'Documents' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => router.push('/dashboard')} 
              className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900">Post New Property</h1>
              <p className="text-xs text-slate-500 font-medium">Step {currentStep} of 8</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            {steps.map((step, idx) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep > step.number 
                      ? 'bg-emerald-500 text-white' 
                      : currentStep === step.number 
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                      : 'bg-slate-200 text-slate-400'
                  }`}>
                    {currentStep > step.number ? <Check size={14} /> : step.number}
                  </div>
                  <span className={`text-[9px] font-bold whitespace-nowrap ${
                    currentStep === step.number ? 'text-blue-600' : 'text-slate-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-0.5 w-8 flex-shrink-0 ${
                    currentStep > step.number ? 'bg-emerald-500' : 'bg-slate-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-8">
              {/* Step 1: Property Type & Basic Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Property Type & Details</h2>
                    <p className="text-sm text-slate-500">Tell us about the property type and basic information</p>
                  </div>

                  <div className="space-y-4">
                    {/* Property Type */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-2 block">Property Type *</label>
                      <div className="grid grid-cols-3 gap-3">
                        {propertyTypes.map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setFormData({ ...formData, type, propertySubtype: '' })}
                            className={`p-4 rounded-xl border-2 text-sm font-bold transition-all ${
                              formData.type === type
                                ? 'border-blue-600 bg-blue-50 text-blue-600'
                                : 'border-slate-200 hover:border-slate-300 text-slate-600'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Property Sub-Type */}
                    {formData.type && (
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-2 block">Property Sub-Type *</label>
                        <select
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={formData.propertySubtype}
                          onChange={e => setFormData({ ...formData, propertySubtype: e.target.value })}
                        >
                          <option value="">Select sub-type</option>
                          {subtypeOptions[formData.type as keyof typeof subtypeOptions]?.map(subtype => (
                            <option key={subtype} value={subtype}>{subtype}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Property For */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-2 block">Property For *</label>
                      <div className="grid grid-cols-3 gap-3">
                        {listingTypeOptions.map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setFormData({ ...formData, listingType: type })}
                            className={`p-4 rounded-xl border-2 text-sm font-bold transition-all ${
                              formData.listingType === type
                                ? 'border-blue-600 bg-blue-50 text-blue-600'
                                : 'border-slate-200 hover:border-slate-300 text-slate-600'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Property Name/Title */}
                    <Input
                      label="Project/Property Name/Title *"
                      placeholder="e.g., Dream Heights Residency"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />

                    {/* Price/Rent and Area - Side by Side */}
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label={formData.listingType === 'Rent' ? 'Rent (Monthly) *' : 'Price *'}
                        placeholder={formData.listingType === 'Rent' ? 'e.g., ₹25,000/month' : 'e.g., ₹45 Lacs onwards'}
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                      />
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            label="Area *"
                            placeholder="e.g., 1200"
                            value={formData.area}
                            onChange={e => setFormData({ ...formData, area: e.target.value })}
                          />
                        </div>
                        <div className="w-28">
                          <label className="text-xs font-bold text-slate-700 mb-2 block">Unit</label>
                          <select
                            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                            value={formData.areaUnit}
                            onChange={e => setFormData({ ...formData, areaUnit: e.target.value })}
                          >
                            <option value="sq.ft.">sq.ft.</option>
                            <option value="sq.yd.">sq.yd.</option>
                            <option value="Acres">Acres</option>
                            <option value="Hectares">Hectares</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Location & Description */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Location & Description</h2>
                    <p className="text-sm text-slate-500">Where is this property located?</p>
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Location (City/Area) *"
                      placeholder="e.g., Nashik Road, Nashik"
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                    />

                    <Input
                      label="Complete Address *"
                      placeholder="e.g., Plot No. 45, Hill Road, Nashik Road, Nashik - 422101"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                    />

                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-2 block">Property Description *</label>
                      <textarea
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe the property in detail... Include key features, location advantages, and what makes it special."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Property Specific Details */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Property Details</h2>
                    <p className="text-sm text-slate-500">Specific details about the property</p>
                  </div>

                  <div className="space-y-4">
                    {formData.type === 'Residential' && (
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Bedrooms *"
                          type="number"
                          placeholder="e.g., 3"
                          value={formData.bedrooms}
                          onChange={e => setFormData({ ...formData, bedrooms: e.target.value })}
                        />
                        <Input
                          label="Bathrooms *"
                          type="number"
                          placeholder="e.g., 2"
                          value={formData.bathrooms}
                          onChange={e => setFormData({ ...formData, bathrooms: e.target.value })}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label={formData.listingType === 'Rent' ? 'Available From' : 'Possession Date'}
                        placeholder={formData.listingType === 'Rent' ? 'e.g., Immediately / Jan 2025' : 'e.g., Dec 2025'}
                        value={formData.possessionDate}
                        onChange={e => setFormData({ ...formData, possessionDate: e.target.value })}
                      />
                      {formData.listingType !== 'Rent' && (
                        <Input
                          label="RERA ID"
                          placeholder="e.g., P02400009392"
                          value={formData.reraId}
                          onChange={e => setFormData({ ...formData, reraId: e.target.value })}
                        />
                      )}
                    </div>
                    
                    {/* Rental-specific fields */}
                    {formData.listingType === 'Rent' && (
                      <>
                        <div className="border-t border-slate-200 pt-4 mt-4">
                          <h3 className="text-lg font-black text-slate-900 mb-4">Rental Details</h3>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-bold text-slate-700 mb-2 block">Furnishing</label>
                              <select
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.furnishing}
                                onChange={e => setFormData({ ...formData, furnishing: e.target.value })}
                              >
                                <option value="">Select furnishing</option>
                                <option value="Fully Furnished">Fully Furnished</option>
                                <option value="Semi Furnished">Semi Furnished</option>
                                <option value="Unfurnished">Unfurnished</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="text-xs font-bold text-slate-700 mb-2 block">Listed By</label>
                              <select
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.listedBy}
                                onChange={e => setFormData({ ...formData, listedBy: e.target.value })}
                              >
                                <option value="">Select type</option>
                                <option value="Owner">Owner</option>
                                <option value="Builder">Builder</option>
                                <option value="Dealer">Dealer</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="text-xs font-bold text-slate-700 mb-2 block">Bachelors Allowed</label>
                              <select
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.bachelorsAllowed}
                                onChange={e => setFormData({ ...formData, bachelorsAllowed: e.target.value })}
                              >
                                <option value="">Select option</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                              </select>
                            </div>
                            
                            <Input
                              label="Carpet Area"
                              placeholder="e.g., 1200 sq.ft."
                              value={formData.carpetArea}
                              onChange={e => setFormData({ ...formData, carpetArea: e.target.value })}
                            />
                            
                            <Input
                              label="Maintenance (Monthly)"
                              placeholder="e.g., ₹2,000"
                              value={formData.maintenance}
                              onChange={e => setFormData({ ...formData, maintenance: e.target.value })}
                            />
                            
                            <Input
                              label="Total Floors"
                              placeholder="e.g., 10"
                              value={formData.totalFloors}
                              onChange={e => setFormData({ ...formData, totalFloors: e.target.value })}
                            />
                            
                            <Input
                              label="Car Parking"
                              placeholder="e.g., 2"
                              value={formData.carParking}
                              onChange={e => setFormData({ ...formData, carParking: e.target.value })}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Project Details - Hidden for Rent */}
              {currentStep === 4 && formData.listingType !== 'Rent' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Project Information</h2>
                    <p className="text-sm text-slate-500">Additional project details (optional)</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Total Project Units"
                      type="number"
                      placeholder="e.g., 203"
                      value={formData.projectUnits}
                      onChange={e => setFormData({ ...formData, projectUnits: e.target.value })}
                    />
                    <Input
                      label="Project Area"
                      placeholder="e.g., 2.08 Acres"
                      value={formData.projectArea}
                      onChange={e => setFormData({ ...formData, projectArea: e.target.value })}
                    />
                    <Input
                      label="Configurations"
                      placeholder="e.g., 3, 4 BHK Apartments"
                      value={formData.configurations}
                      onChange={e => setFormData({ ...formData, configurations: e.target.value })}
                    />
                    <Input
                      label="Average Price"
                      placeholder="e.g., 7.4 K/sq.ft"
                      value={formData.avgPrice}
                      onChange={e => setFormData({ ...formData, avgPrice: e.target.value })}
                    />
                    <Input
                      label="Launch Date"
                      placeholder="e.g., Apr 2025"
                      value={formData.launchDate}
                      onChange={e => setFormData({ ...formData, launchDate: e.target.value })}
                    />
                    <Input
                      label="Size Range"
                      placeholder="e.g., 1664 - 3983 sq.ft."
                      value={formData.sizes}
                      onChange={e => setFormData({ ...formData, sizes: e.target.value })}
                    />
                    <Input
                      label="Project Size"
                      placeholder="e.g., 1 Building - 203 units"
                      value={formData.projectSize}
                      onChange={e => setFormData({ ...formData, projectSize: e.target.value })}
                      className="col-span-2"
                    />
                  </div>
                </div>
              )}
              
              {/* Skip Step 4 for Rental Properties - Show message */}
              {currentStep === 4 && formData.listingType === 'Rent' && (
                <div className="space-y-6">
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Check size={32} className="text-blue-600" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mb-2">Project Information Not Required</h2>
                    <p className="text-sm text-slate-500">For rental listings, project details are optional. Click Next to continue.</p>
                  </div>
                </div>
              )}

              {/* Step 5: Features & Amenities */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Features & Amenities</h2>
                    <p className="text-sm text-slate-500">Add amenities, highlights, and specifications</p>
                  </div>

                  {/* Amenities */}
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-3 block">Amenities</label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        placeholder="e.g., Swimming Pool"
                        value={tempInputs.amenity}
                        onChange={e => setTempInputs({ ...tempInputs, amenity: e.target.value })}
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (tempInputs.amenity.trim()) {
                            setFormData(prev => ({ ...prev, amenities: [...prev.amenities, tempInputs.amenity] }));
                            setTempInputs({ ...tempInputs, amenity: '' });
                          }
                        }}
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.amenities.map((amenity, idx) => (
                        <span key={idx} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">
                          {amenity}
                          <button onClick={() => setFormData(prev => ({ ...prev, amenities: prev.amenities.filter((_, i) => i !== idx) }))}>
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Highlights */}
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-3 block">Highlights</label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        placeholder="e.g., Sea-facing"
                        value={tempInputs.highlight}
                        onChange={e => setTempInputs({ ...tempInputs, highlight: e.target.value })}
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (tempInputs.highlight.trim()) {
                            setFormData(prev => ({ ...prev, highlights: [...prev.highlights, tempInputs.highlight] }));
                            setTempInputs({ ...tempInputs, highlight: '' });
                          }
                        }}
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.highlights.map((highlight, idx) => (
                        <span key={idx} className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">
                          {highlight}
                          <button onClick={() => setFormData(prev => ({ ...prev, highlights: prev.highlights.filter((_, i) => i !== idx) }))}>
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Specifications */}
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-3 block">Specifications</label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        placeholder="Label (e.g., Flooring)"
                        value={tempInputs.specLabel}
                        onChange={e => setTempInputs({ ...tempInputs, specLabel: e.target.value })}
                      />
                      <Input
                        placeholder="Value (e.g., Vitrified Tiles)"
                        value={tempInputs.specValue}
                        onChange={e => setTempInputs({ ...tempInputs, specValue: e.target.value })}
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (tempInputs.specLabel.trim() && tempInputs.specValue.trim()) {
                            setFormData(prev => ({
                              ...prev,
                              specifications: [...prev.specifications, { label: tempInputs.specLabel, value: tempInputs.specValue }]
                            }));
                            setTempInputs({ ...tempInputs, specLabel: '', specValue: '' });
                          }
                        }}
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.specifications.map((spec, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <div>
                            <span className="text-xs font-bold text-slate-400 uppercase">{spec.label}</span>
                            <p className="text-sm font-bold text-slate-900">{spec.value}</p>
                          </div>
                          <button onClick={() => setFormData(prev => ({ ...prev, specifications: prev.specifications.filter((_, i) => i !== idx) }))}>
                            <X size={16} className="text-slate-400 hover:text-rose-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Images */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Property Images</h2>
                    <p className="text-sm text-slate-500">Upload high-quality images of the property</p>
                  </div>

                  <div>
                    <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-500 transition-all cursor-pointer bg-slate-50 hover:bg-blue-50/50">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <ImageIcon size={28} className="text-blue-600" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-slate-700">Click to upload images</p>
                          <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB each</p>
                        </div>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploadingImages}
                      />
                    </label>

                    {uploadingImages && (
                      <p className="text-center text-sm text-blue-600 mt-4">Uploading images...</p>
                    )}

                    <div className="grid grid-cols-3 gap-4 mt-6">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative group aspect-video rounded-xl overflow-hidden border-2 border-slate-200">
                          <img src={img} className="w-full h-full object-cover" alt={`Property ${idx + 1}`} />
                          <button
                            onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))}
                            className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 7: Map & Nearby Locations */}
              {currentStep === 7 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Location & Map</h2>
                    <p className="text-sm text-slate-500">Add map link and nearby locations</p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-2 block">Google Maps Embed Link</label>
                    <Input
                      placeholder="https://www.google.com/maps/embed?pb=..."
                      value={formData.mapLink}
                      onChange={e => {
                        let value = e.target.value.trim();
                        // Extract URL from iframe if pasted
                        if (value.includes('<iframe')) {
                          const match = value.match(/src=["'](.*?)["']/);
                          if (match && match[1]) {
                            value = match[1];
                          }
                        }
                        setFormData({ ...formData, mapLink: value });
                      }}
                    />
                    <p className="text-xs text-slate-500 mt-2">
                      <span className="font-bold">Tip:</span> Go to Google Maps → Share → Embed a map → Copy only the URL from src="..." (not the entire iframe code)
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-200">
                    <label className="text-sm font-bold text-slate-700 mb-3 block">Nearby Locations</label>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <Input
                        placeholder="Location Name"
                        value={tempInputs.nearbyName}
                        onChange={e => setTempInputs({ ...tempInputs, nearbyName: e.target.value })}
                      />
                      <select
                        className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                        value={tempInputs.nearbyType}
                        onChange={e => setTempInputs({ ...tempInputs, nearbyType: e.target.value })}
                      >
                        {nearbyTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <Input
                        placeholder="Distance (e.g., 2.5 km)"
                        value={tempInputs.nearbyDistance}
                        onChange={e => setTempInputs({ ...tempInputs, nearbyDistance: e.target.value })}
                      />
                      <div className="flex gap-2">
                        <Input
                          placeholder="Time (e.g., 5 mins)"
                          value={tempInputs.nearbyTime}
                          onChange={e => setTempInputs({ ...tempInputs, nearbyTime: e.target.value })}
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (tempInputs.nearbyName && tempInputs.nearbyDistance && tempInputs.nearbyTime) {
                              setFormData(prev => ({
                                ...prev,
                                nearbyLocations: [
                                  ...prev.nearbyLocations,
                                  {
                                    name: tempInputs.nearbyName,
                                    type: tempInputs.nearbyType,
                                    distance: tempInputs.nearbyDistance,
                                    time: tempInputs.nearbyTime
                                  }
                                ]
                              }));
                              setTempInputs({ ...tempInputs, nearbyName: '', nearbyDistance: '', nearbyTime: '' });
                            }
                          }}
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {formData.nearbyLocations.map((nearby, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{nearby.name}</p>
                            <p className="text-xs text-slate-500">{nearby.type} • {nearby.distance} • {nearby.time}</p>
                          </div>
                          <button onClick={() => setFormData(prev => ({ ...prev, nearbyLocations: prev.nearbyLocations.filter((_, i) => i !== idx) }))}>
                            <X size={16} className="text-slate-400 hover:text-rose-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 8: Documents */}
              {currentStep === 8 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Documents & Attachments</h2>
                    <p className="text-sm text-slate-500">Upload property related documents (PDF only, max 10MB)</p>
                  </div>

                  <div>
                    <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-500 transition-all cursor-pointer bg-slate-50 hover:bg-blue-50/50">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                          <Upload size={28} className="text-blue-600" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-slate-700">Click to upload PDF documents</p>
                          <p className="text-xs text-slate-500 mt-1">Maximum size: 10MB per file</p>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handlePDFUpload}
                        disabled={uploadingPDF}
                      />
                    </label>

                    {uploadingPDF && (
                      <p className="text-center text-sm text-blue-600 mt-4">Uploading document...</p>
                    )}

                    <div className="space-y-3 mt-6">
                      {formData.attachments.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText size={18} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{doc.name}</p>
                              <p className="text-xs text-slate-500">{doc.size}</p>
                            </div>
                          </div>
                          <button onClick={() => setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== idx) }))}>
                            <X size={16} className="text-slate-400 hover:text-rose-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-200">
                {currentStep > 1 && (
                  <Button variant="outline" onClick={handlePrevious} className="gap-2">
                    <ArrowLeft size={16} /> Previous
                  </Button>
                )}
                
                <div className="flex-1" />

                {currentStep < 8 ? (
                  <Button onClick={handleNext} className="gap-2">
                    Next <ArrowRight size={16} />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} isLoading={isSubmitting} className="gap-2">
                    Submit Property
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Alert Component */}
      <Alert
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        autoClose={alertConfig.type === 'success'}
        duration={3000}
      />
    </div>
  );
}
