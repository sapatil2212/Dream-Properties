'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, X, Plus, FileText, Image as ImageIcon, Upload, Check, Sparkles } from 'lucide-react';
import { Button, Input, Card, Alert, Select } from '@/components/UIComponents';
import { motion, AnimatePresence } from 'framer-motion';
import { AIPropertyAutoFill } from '@/components/dashboard/AIPropertyAutoFill';
import { SuccessModal } from '@/components/ui/success-modal';
import { useSession } from 'next-auth/react';

export default function PostPropertyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PostPropertyContent />
    </Suspense>
  );
}

function PostPropertyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams?.get('id');
  const isEditing = !!editId;
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingPDF, setUploadingPDF] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Alert states
  const [showAlert, setShowAlert] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAiSuccessModal, setShowAiSuccessModal] = useState(false);
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
    isFeatured: false,
    title: '',
    projectBuilderName: '',
    price: '',
    area: '',
    areaUnit: 'Sq.Ft',
    negotiable: '',
    carpetArea: '',
    
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
    videoUrl: '',
    nearbyLocations: [] as { name: string; type: string; distance: string; time: string }[],
    
    // Step 8: Documents
    attachments: [] as { name: string; url: string; size: string }[],
    floorPlans: [] as { title: string; url: string }[],
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
    floorPlanTitle: '',
  });

  // Field errors for inline validation
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (editId) {
      const fetchPropertyData = async () => {
        try {
          const response = await fetch(`/api/properties/${editId}`);
          if (response.ok) {
            const data = await response.json();
            
            // Helper to parse JSON fields safely
            const safeParse = (val: any) => {
                if (typeof val === 'string') {
                    try {
                        return JSON.parse(val);
                    } catch (e) {
                        return [];
                    }
                }
                return val || [];
            };

            setFormData(prev => ({
              ...prev,
              type: data.type || '',
              propertySubtype: data.propertySubtype || '',
              listingType: data.listingType || '',
              isFeatured: data.isFeatured || false,
              title: data.title || '',
              projectBuilderName: data.projectBuilderName || '',
              price: data.price ? String(data.price) : '',
              area: data.area ? String(data.area) : '',
              areaUnit: data.areaUnit || 'Sq.Ft',
              location: data.location || '',
              address: data.address || '',
              description: data.description || '',
              bedrooms: data.bedrooms ? String(data.bedrooms) : '',
              bathrooms: data.bathrooms ? String(data.bathrooms) : '',
              possessionDate: data.possessionDate ? new Date(data.possessionDate).toISOString().split('T')[0] : '',
              reraId: data.reraId || '',
              furnishing: data.furnishing || '',
              listedBy: data.listedBy || '',
              bachelorsAllowed: data.bachelorsAllowed || '',
              carpetArea: data.carpetArea ? String(data.carpetArea) : '',
              maintenance: data.maintenance ? String(data.maintenance) : '',
              totalFloors: data.totalFloors ? String(data.totalFloors) : '',
              carParking: data.carParking || '',
              projectUnits: data.projectUnits ? String(data.projectUnits) : '',
              projectArea: data.projectArea ? String(data.projectArea) : '',
              configurations: data.configurations || '',
              avgPrice: data.avgPrice ? String(data.avgPrice) : '',
              launchDate: data.launchDate ? new Date(data.launchDate).toISOString().split('T')[0] : '',
              sizes: data.sizes || '',
              projectSize: data.projectSize || '',
              amenities: safeParse(data.amenities),
              highlights: safeParse(data.highlights),
              specifications: safeParse(data.specifications),
              images: safeParse(data.images),
              mapLink: data.mapLink || '',
              videoUrl: data.videoUrl || '',
              nearbyLocations: safeParse(data.nearbyLocations),
              attachments: safeParse(data.attachments),
              floorPlans: safeParse(data.floorPlans),
            }));
          } else {
             setAlertConfig({
                type: 'error',
                title: 'Error',
                message: 'Failed to fetch property details.'
             });
             setShowAlert(true);
          }
        } catch (error) {
          console.error('Error fetching property details:', error);
          setAlertConfig({
             type: 'error',
             title: 'Error',
             message: 'Failed to fetch property details.'
          });
          setShowAlert(true);
        }
      };
      fetchPropertyData();
    }
  }, [editId]);

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

  const handleAIAutoFill = (data: any) => {
    setFormData(prev => ({
      ...prev,
      title: data.title || prev.title,
      description: data.description || prev.description,
      price: data.price ? String(data.price) : prev.price,
      area: data.area ? String(data.area) : prev.area,
      location: data.location || prev.location,
      address: data.address || prev.address,
      type: data.type || prev.type,
      bedrooms: data.bedrooms ? String(data.bedrooms) : prev.bedrooms,
      bathrooms: data.bathrooms ? String(data.bathrooms) : prev.bathrooms,
      possessionDate: data.possessionDate || prev.possessionDate,
      reraId: data.reraId || prev.reraId,
      projectUnits: data.projectUnits ? String(data.projectUnits) : prev.projectUnits,
      projectArea: data.projectArea ? String(data.projectArea) : prev.projectArea,
      configurations: data.configurations || prev.configurations,
      avgPrice: data.avgPrice ? String(data.avgPrice) : prev.avgPrice,
      launchDate: data.launchDate || prev.launchDate,
      sizes: data.sizes || prev.sizes,
      projectSize: data.projectSize || prev.projectSize,
      propertySubtype: data.propertySubtype || prev.propertySubtype,
      listingType: data.listingType || prev.listingType,
      furnishing: data.furnishing || prev.furnishing,
      amenities: Array.isArray(data.amenities) ? [...new Set([...prev.amenities, ...data.amenities])] : prev.amenities,
      highlights: Array.isArray(data.highlights) ? [...new Set([...prev.highlights, ...data.highlights])] : prev.highlights,
      specifications: Array.isArray(data.specifications) ? [...prev.specifications, ...data.specifications] : prev.specifications,
      mapLink: data.mapLink || prev.mapLink,
      videoUrl: data.videoUrl || prev.videoUrl,
      bachelorsAllowed: data.bachelorsAllowed || prev.bachelorsAllowed,
      maintenance: data.maintenance ? String(data.maintenance) : prev.maintenance,
      totalFloors: data.totalFloors ? String(data.totalFloors) : prev.totalFloors,
      carParking: data.carParking || prev.carParking,
    }));
  };

  // Step validation
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.type && formData.propertySubtype && formData.listingType && formData.title && formData.area);
      case 2:
        return !!(formData.location && formData.description);
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
    // Clear previous errors
    setFieldErrors({});
    
    // Validate and set errors for specific fields
    const errors: { [key: string]: string } = {};
    
    if (currentStep === 1) {
      if (!formData.type) errors.type = 'Please select a property type';
      if (!formData.propertySubtype) errors.propertySubtype = 'Please select a property sub-type';
      if (!formData.listingType) errors.listingType = 'Please select listing type (Sell/Rent/Lease)';
      if (!formData.title) errors.title = 'Property name/title is required';
      if (!formData.area) errors.area = 'Area is required';
    } else if (currentStep === 2) {
      if (!formData.location) errors.location = 'Location is required';
      if (!formData.description) errors.description = 'Property description is required';
    } else if (currentStep === 3) {
      if (formData.type === 'Residential') {
        if (!formData.bedrooms) errors.bedrooms = 'Number of bedrooms is required';
        if (!formData.bathrooms) errors.bathrooms = 'Number of bathrooms is required';
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    
    // Proceed to next step if no errors
    setCurrentStep(prev => Math.min(prev + 1, 8));
  };

  const handlePrevious = () => {
    setFieldErrors({}); // Clear errors when going back
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
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
      setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (err: any) {
      setAlertConfig({
        type: 'error',
        title: 'Upload Failed',
        message: err?.toString() || 'Failed to upload images. Please try again.'
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

  const handleAiGenerate = async () => {
    if (!aiInput.trim()) {
      setAlertConfig({
        type: 'warning',
        title: 'Input Required',
        message: 'Please enter property description or features to generate amenities.'
      });
      setShowAlert(true);
      return;
    }

    setIsGeneratingAi(true);
    try {
      const response = await fetch('/api/ai/generate-amenities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiInput })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFormData(prev => ({
          ...prev,
          amenities: [...new Set([...prev.amenities, ...data.data.amenities])],
          highlights: [...new Set([...prev.highlights, ...data.data.highlights])],
          specifications: [...prev.specifications, ...data.data.specifications]
        }));
        
        setShowAiSuccessModal(true);
        setAiInput(''); // Clear input after success
      } else {
        throw new Error(data.error || 'Failed to generate amenities');
      }
    } catch (err) {
      setAlertConfig({
        type: 'error',
        title: 'AI Generation Failed',
        message: 'Could not generate amenities. Please try again or add manually.'
      });
      setShowAlert(true);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const url = isEditing ? `/api/properties/${editId}` : '/api/properties';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setShowSuccessModal(true);
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

  // Handle step navigation for admin users
  const handleStepClick = (stepNumber: number) => {
    // Don't allow navigating to current step
    if (stepNumber === currentStep) return;
    
    // Allow navigating to completed steps (backward navigation)
    if (stepNumber < currentStep) {
      setCurrentStep(stepNumber);
      setFieldErrors({}); // Clear errors when navigating
      return;
    }
    
    // For forward navigation, validate required fields in current step
    const isValid = validateStep(currentStep);
    
    if (isValid) {
      setCurrentStep(stepNumber);
      setFieldErrors({}); // Clear errors when navigating
    } else {
      // Show validation error
      setAlertConfig({
        type: 'error',
        title: 'Required Fields Missing',
        message: 'Please fill all required fields in the current step before proceeding.'
      });
      setShowAlert(true);
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
    { number: 8, title: 'Docs & Plans' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header - Scrollable with the form */}
      <div className="pt-6 pb-4">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header Container with full rounded borders */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => router.push('/dashboard/properties')} 
                className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-xl font-black text-slate-900">{isEditing ? 'Edit Property' : 'Post New Property'}</h1>
                <p className="text-xs text-slate-500 font-medium">Step {currentStep} of 8</p>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-start justify-between w-full px-4">
              {steps.map((step, idx) => (
                <React.Fragment key={step.number}>
                  <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer ${
                        currentStep > step.number 
                          ? 'bg-emerald-500 text-white shadow-md hover:bg-emerald-600' 
                          : currentStep === step.number 
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-lg scale-110' 
                          : isAdmin
                            ? 'bg-slate-200 text-slate-400 hover:bg-slate-300 hover:text-slate-600'
                            : 'bg-slate-200 text-slate-400'
                      }`}
                      onClick={() => isAdmin && handleStepClick(step.number)}
                    >
                      {currentStep > step.number ? <Check size={14} /> : step.number}
                    </div>
                    <span className={`text-[10px] font-bold whitespace-nowrap ${
                      currentStep === step.number ? 'text-blue-600' : 'text-slate-400'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 mt-4 mx-2 transition-colors duration-300 ${
                      currentStep > step.number ? 'bg-emerald-500' : 'bg-slate-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form Content - Separate container with full rounded borders */}
      <div className="max-w-5xl mx-auto px-4">
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
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 mb-2">Property Type & Details</h2>
                      <p className="text-sm text-slate-500">Tell us about the property type and basic information</p>
                    </div>
                    {!showAIModal && (
                      <button
                        onClick={() => setShowAIModal(true)}
                        className="py-2.5 px-5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl font-bold transition-all flex items-center gap-2 group text-sm whitespace-nowrap"
                      >
                        <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
                        Use AI Assistant to Auto-Fill Form
                      </button>
                    )}
                  </div>

                  {showAIModal && (
                    <div className="mt-6">
                      <AIPropertyAutoFill 
                        onDataExtracted={handleAIAutoFill} 
                        forcedOpen={true}
                        onClose={() => setShowAIModal(false)}
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Property Type and Property For - Side by Side */}
                    <div className="grid grid-cols-2 gap-6">
                      {/* Property Type */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-2 block">Property Type *</label>
                        <div className="grid grid-cols-3 gap-3">
                          {propertyTypes.map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                const defaultUnit = type === 'Plots' ? 'Sq. Yards' : 'Sq.Ft';
                                setFormData({ ...formData, type, propertySubtype: '', areaUnit: defaultUnit });
                                setFieldErrors(prev => ({ ...prev, type: '' }));
                              }}
                              className={`p-4 rounded-xl border-2 text-sm font-bold transition-all ${
                                formData.type === type
                                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                                  : fieldErrors.type
                                  ? 'border-red-300 hover:border-red-400 text-slate-600'
                                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                        {fieldErrors.type && (
                          <p className="text-xs text-red-600 mt-1.5 font-medium">{fieldErrors.type}</p>
                        )}
                      </div>

                      {/* Property For */}
                      <div>
                        <label className="text-xs font-bold text-slate-700 mb-2 block">Property For *</label>
                        <div className="grid grid-cols-3 gap-3">
                          {listingTypeOptions.map(type => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, listingType: type });
                                setFieldErrors(prev => ({ ...prev, listingType: '' }));
                              }}
                              className={`p-4 rounded-xl border-2 text-sm font-bold transition-all ${
                                formData.listingType === type
                                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                                  : fieldErrors.listingType
                                  ? 'border-red-300 hover:border-red-400 text-slate-600'
                                  : 'border-slate-200 hover:border-slate-300 text-slate-600'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                        {fieldErrors.listingType && (
                          <p className="text-xs text-red-600 mt-1.5 font-medium">{fieldErrors.listingType}</p>
                        )}
                        

                      </div>
                    </div>

                    {/* Property Sub-Type and Featured Checkbox */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.type && (
                        <div>
                          <Select
                            label="Property Sub-Type *"
                            placeholder="Select sub-type"
                            value={formData.propertySubtype}
                            options={subtypeOptions[formData.type as keyof typeof subtypeOptions]?.map(subtype => ({ label: subtype, value: subtype })) || []}
                            onChange={(value) => {
                              setFormData({ ...formData, propertySubtype: value });
                              setFieldErrors(prev => ({ ...prev, propertySubtype: '' }));
                            }}
                            error={fieldErrors.propertySubtype}
                          />
                        </div>
                      )}
                      
                      <div className={formData.type ? "pt-5" : ""}>
                        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
                          <input
                            type="checkbox"
                            id="isFeatured"
                            checked={formData.isFeatured}
                            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="isFeatured" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                            Mark as Featured Property
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Property Name/Title */}
                    <div className="space-y-4">
                      <div>
                        <Input
                          label="Project/Property Name/Title *"
                          placeholder="e.g., Dream Heights Residency"
                          value={formData.title}
                          onChange={e => {
                            setFormData({ ...formData, title: e.target.value });
                            setFieldErrors(prev => ({ ...prev, title: '' }));
                          }}
                        />
                        {fieldErrors.title && (
                          <p className="text-xs text-red-600 mt-1.5 font-medium">{fieldErrors.title}</p>
                        )}
                      </div>

                      <div>
                        <Input
                          label="Project / Builder Name"
                          placeholder="e.g., Reliable Builders"
                          value={formData.projectBuilderName}
                          onChange={e => {
                            setFormData({ ...formData, projectBuilderName: e.target.value });
                            setFieldErrors(prev => ({ ...prev, projectBuilderName: '' }));
                          }}
                        />
                      </div>
                    </div>

                    {/* Price/Rent and Area - Side by Side */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Input
                          label={formData.listingType === 'Rent' ? 'Rent (Monthly)' : 'Price'}
                          placeholder={formData.listingType === 'Rent' ? 'e.g., ₹25,000/month' : 'e.g. Rs.45Lacs'}
                          value={formData.price}
                          onChange={e => {
                            setFormData({ ...formData, price: e.target.value });
                            setFieldErrors(prev => ({ ...prev, price: '' }));
                          }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            label={(formData.type === 'Residential' || formData.type === 'Commercial') ? 'Built-up Area *' : 'Plot Area *'}
                            placeholder="e.g., 1200"
                            value={formData.area}
                            onChange={e => {
                              setFormData({ ...formData, area: e.target.value });
                              setFieldErrors(prev => ({ ...prev, area: '' }));
                            }}
                          />
                          {fieldErrors.area && (
                            <p className="text-xs text-red-600 mt-1.5 font-medium">{fieldErrors.area}</p>
                          )}
                        </div>
                        <div className="w-32">
                          <Select
                            label="Unit"
                            value={formData.areaUnit}
                            options={
                              formData.type === 'Plots'
                                ? ['Sq. Yards', 'Sq. Mtrs', 'Sq.Ft', 'Acres', 'Hectares'].map(u => ({ label: u, value: u }))
                                : ['Sq.Ft'].map(u => ({ label: u, value: u }))
                            }
                            onChange={(value) => setFormData({ ...formData, areaUnit: value })}
                          />
                        </div>
                      </div>
                    </div>

                    {(formData.type === 'Residential' || formData.type === 'Commercial') && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Input
                            label="Carpet Area (optional)"
                            placeholder="e.g., 900"
                            value={formData.carpetArea}
                            onChange={e => setFormData({ ...formData, carpetArea: e.target.value })}
                          />
                        </div>
                        <div>
                          <Select
                            label="Price Negotiation"
                            placeholder="Select"
                            value={formData.negotiable}
                            options={['Negotiable', 'Non-Negotiable'].map(o => ({ label: o, value: o }))}
                            onChange={(value) => {
                              setFormData(prev => {
                                const updated = { ...prev, negotiable: value };
                                const other = value === 'Negotiable' ? 'Non-Negotiable' : 'Negotiable';
                                const withoutOther = prev.highlights.filter(h => h !== other);
                                const withThis = withoutOther.includes(value) ? withoutOther : [...withoutOther, value];
                                return { ...updated, highlights: withThis };
                              });
                            }}
                          />
                        </div>
                      </div>
                    )}
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
                    <div>
                      <Input
                        label="Location (City/Area) *"
                        placeholder="e.g., Nashik Road, Nashik"
                        value={formData.location}
                        onChange={e => {
                          setFormData({ ...formData, location: e.target.value });
                          setFieldErrors(prev => ({ ...prev, location: '' }));
                        }}
                      />
                      {fieldErrors.location && (
                        <p className="text-xs text-red-600 mt-1.5 font-medium">{fieldErrors.location}</p>
                      )}
                    </div>

                    <div>
                      <Input
                        label="Complete Address"
                        placeholder="e.g., Plot No. 45, Hill Road, Nashik Road, Nashik - 422101"
                        value={formData.address}
                        onChange={e => {
                          setFormData({ ...formData, address: e.target.value });
                          setFieldErrors(prev => ({ ...prev, address: '' }));
                        }}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-2 block">Property Description *</label>
                      <textarea
                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium min-h-[150px] focus:outline-none focus:ring-2 ${
                          fieldErrors.description
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-slate-200 focus:ring-blue-500'
                        }`}
                        placeholder="Describe the property in detail... Include key features, location advantages, and what makes it special."
                        value={formData.description}
                        onChange={e => {
                          setFormData({ ...formData, description: e.target.value });
                          setFieldErrors(prev => ({ ...prev, description: '' }));
                        }}
                      />
                      {fieldErrors.description && (
                        <p className="text-xs text-red-600 mt-1.5 font-medium">{fieldErrors.description}</p>
                      )}
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
                        <div>
                          <Input
                            label="Bedrooms *"
                            placeholder="e.g., 3"
                            value={formData.bedrooms}
                            onChange={e => {
                              setFormData({ ...formData, bedrooms: e.target.value });
                              setFieldErrors(prev => ({ ...prev, bedrooms: '' }));
                            }}
                          />
                          {fieldErrors.bedrooms && (
                            <p className="text-xs text-red-600 mt-1.5 font-medium">{fieldErrors.bedrooms}</p>
                          )}
                        </div>
                        <div>
                          <Input
                            label="Bathrooms *"
                            placeholder="e.g., 2"
                            value={formData.bathrooms}
                            onChange={e => {
                              setFormData({ ...formData, bathrooms: e.target.value });
                              setFieldErrors(prev => ({ ...prev, bathrooms: '' }));
                            }}
                          />
                          {fieldErrors.bathrooms && (
                            <p className="text-xs text-red-600 mt-1.5 font-medium">{fieldErrors.bathrooms}</p>
                          )}
                        </div>
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
                              <Select
                                label="Furnishing"
                                placeholder="Select furnishing"
                                value={formData.furnishing}
                                options={['Fully Furnished', 'Semi Furnished', 'Unfurnished'].map(o => ({ label: o, value: o }))}
                                onChange={(value) => setFormData({ ...formData, furnishing: value })}
                              />
                            </div>
                            
                            <div>
                              <Select
                                label="Listed By"
                                placeholder="Select type"
                                value={formData.listedBy}
                                options={['Owner', 'Builder', 'Dealer'].map(o => ({ label: o, value: o }))}
                                onChange={(value) => setFormData({ ...formData, listedBy: value })}
                              />
                            </div>
                            
                            <div>
                              <Select
                                label="Bachelors Allowed"
                                placeholder="Select option"
                                value={formData.bachelorsAllowed}
                                options={['Yes', 'No'].map(o => ({ label: o, value: o }))}
                                onChange={(value) => setFormData({ ...formData, bachelorsAllowed: value })}
                              />
                            </div>
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

                  {/* AI Generation Section */}
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={18} className="text-indigo-600" />
                      <h3 className="font-bold text-indigo-900">AI Auto-Fill</h3>
                    </div>
                    <p className="text-xs text-indigo-700 mb-3">
                      Paste your property description, brochure text, or feature list below. Our AI will automatically extract and categorize amenities, highlights, and specifications for you.
                    </p>
                    <textarea
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="Paste property details here..."
                      className="w-full p-3 text-sm rounded-lg border border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px] mb-3"
                    />
                    <Button 
                      onClick={handleAiGenerate} 
                      isLoading={isGeneratingAi}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Sparkles size={16} className="mr-2" />
                      Generate Features with AI
                    </Button>
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
                          <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 10MB each • Recommended ratio 4:5</p>
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
                        <div key={idx} className="relative group aspect-[4/5] rounded-xl overflow-hidden border-2 border-slate-200">
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

                  {isAdmin && (
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-2 block">Property Video Link (YouTube/Vimeo)</label>
                      <Input
                        placeholder="e.g., https://www.youtube.com/watch?v=..."
                        value={formData.videoUrl}
                        onChange={e => {
                          let value = e.target.value.trim();
                           if (value.includes('<iframe')) {
                            const match = value.match(/src=[\"'](.*?)[\"']/);
                            if (match && match[1]) {
                              value = match[1];
                            }
                          }
                          setFormData({ ...formData, videoUrl: value });
                        }}
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        <span className="font-bold">Note:</span> Supports YouTube, Vimeo, or direct video URLs.
                      </p>
                    </div>
                  )}

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

              {/* Step 8: Documents & Floor Plans */}
              {currentStep === 8 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Documents & Floor Plans</h2>
                    <p className="text-sm text-slate-500">Upload brochure and floor plan images</p>
                  </div>

                  {/* Brochure Upload */}
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Property Brochure (PDF)</label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-500 transition-all cursor-pointer bg-slate-50 hover:bg-blue-50/50">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Upload size={24} className="text-slate-400" />
                        <p className="text-sm font-bold text-slate-600">Click to upload PDF</p>
                      </div>
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handlePDFUpload}
                        disabled={uploadingPDF}
                      />
                    </label>
                    {uploadingPDF && <p className="text-sm text-blue-600 mt-2">Uploading brochure...</p>}
                    
                    {formData.attachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {formData.attachments.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText size={18} className="text-blue-600" />
                              <div>
                                <p className="text-sm font-bold text-slate-900">{file.name}</p>
                                <p className="text-xs text-slate-500">{file.size}</p>
                              </div>
                            </div>
                            <button onClick={() => setFormData(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== idx) }))}>
                              <X size={16} className="text-slate-400 hover:text-rose-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Floor Plans Section */}
                  <div className="pt-6 border-t border-slate-200">
                    <label className="text-sm font-bold text-slate-700 mb-3 block">Floor Plans</label>
                    <p className="text-xs text-slate-500 mb-4">Upload floor plan images with titles (e.g., "Ground Floor Plan", "3BHK Layout")</p>
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                       <div className="flex flex-col gap-3">
                          <Input 
                            placeholder="Floor Plan Title (e.g., Master Plan)" 
                            value={tempInputs.floorPlanTitle}
                            onChange={(e) => setTempInputs({...tempInputs, floorPlanTitle: e.target.value})}
                          />
                          <div className="flex items-center gap-3">
                             <label className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-center w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl hover:border-blue-500 transition-colors">
                                   <ImageIcon size={18} className="text-slate-400 mr-2" />
                                   <span className="text-sm font-medium text-slate-600">Select Image</span>
                                </div>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={async (e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      if (!tempInputs.floorPlanTitle.trim()) {
                                         setAlertConfig({
                                           type: 'warning',
                                           title: 'Title Required',
                                           message: 'Please enter a title for the floor plan first.'
                                         });
                                         setShowAlert(true);
                                         e.target.value = ''; // Reset input
                                         return;
                                      }

                                      // Upload Logic inline here for simplicity or separate handler
                                      setUploadingImages(true);
                                      try {
                                        const file = e.target.files[0];
                                        const formDataUpload = new FormData();
                                        formDataUpload.append('file', file);
                                        formDataUpload.append('upload_preset', 'dream-properties');

                                        const response = await fetch(
                                          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                                          { method: 'POST', body: formDataUpload }
                                        );
                                        const data = await response.json();
                                        
                                        if (data.secure_url) {
                                           setFormData(prev => ({
                                             ...prev,
                                             floorPlans: [...prev.floorPlans, { title: tempInputs.floorPlanTitle, url: data.secure_url }]
                                           }));
                                           setTempInputs(prev => ({ ...prev, floorPlanTitle: '' }));
                                        }
                                      } catch (err) {
                                        console.error('Floor plan upload failed', err);
                                      } finally {
                                        setUploadingImages(false);
                                        e.target.value = '';
                                      }
                                    }
                                  }}
                                  disabled={uploadingImages}
                                />
                             </label>
                             {uploadingImages && <span className="text-xs text-blue-600 font-medium">Uploading...</span>}
                          </div>
                       </div>
                    </div>

                    {/* Display Added Floor Plans */}
                    {formData.floorPlans && formData.floorPlans.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {formData.floorPlans.map((plan, idx) => (
                          <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200">
                            <div className="aspect-[4/3] bg-slate-100">
                              <img src={plan.url} alt={plan.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-2 bg-white border-t border-slate-100">
                              <p className="text-xs font-bold text-slate-900 truncate">{plan.title}</p>
                            </div>
                            <button 
                              onClick={() => setFormData(prev => ({ ...prev, floorPlans: prev.floorPlans.filter((_, i) => i !== idx) }))}
                              className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
                    {isEditing ? 'Update Property' : 'Submit Property'}
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

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          router.push('/dashboard');
        }}
        title={isEditing ? "Property Updated!" : "Property Submitted!"}
        message={
          isEditing
            ? "Your property details have been successfully updated."
            : "Your property has been submitted for approval. Our admin team will review it shortly. Our Executive will contact you soon."
        }
      />

      <SuccessModal
        isOpen={showAiSuccessModal}
        onClose={() => setShowAiSuccessModal(false)}
        title="AI Generation Successful"
        message="Amenities, highlights, and specifications have been extracted and added."
      />
    </div>
  );
}
