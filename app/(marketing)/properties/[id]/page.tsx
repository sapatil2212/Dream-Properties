'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  MapPin,
  MessageCircle,
  Bed,
  Bath,
  Square,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Check,
  Building2,
  Calendar,
  IndianRupee,
  ArrowLeft,
  ExternalLink,
  School,
  Bus,
  ShoppingCart,
  Hospital,
  Coffee,
  Map,
} from 'lucide-react';
import { Badge, Button, Card, Input } from '@/components/UIComponents';

export default function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [contactData, setContactData] = useState({ name: '', phone: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPropertyDetails();
    checkFavoriteStatus();
    trackPropertyView();
  }, [id]);

  const trackPropertyView = async () => {
    try {
      await fetch(`/api/properties/${id}/track-view`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`/api/profile/favorites/check/${id}`);
      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (err) {
      console.error('Error checking favorite status:', err);
    }
  };

  const toggleFavorite = async () => {
    try {
      const endpoint = isFavorite ? 'remove' : 'add';
      const response = await fetch(`/api/profile/favorites/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: id })
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      } else if (response.status === 401) {
        setShowLoginPrompt(true);
        setTimeout(() => setShowLoginPrompt(false), 3000);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this property: ${property.title}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const fetchPropertyDetails = async () => {
    try {
      const response = await fetch(`/api/properties/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProperty(data);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error(err);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (notFound || !property) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-black text-slate-900 mb-4">Property Not Found</h2>
        <Button onClick={() => router.push('/properties')} className="rounded-xl">Back to Properties</Button>
      </div>
    );
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contactData,
          propertyId: id,
          propertyTitle: property.title,
          source: 'Website Property Page'
        })
      });

      if (response.ok) {
        alert("Inquiry Sent! Our team will contact you shortly.");
        setContactData({ name: '', phone: '', email: '', message: '' });
      } else {
        alert("Failed to send inquiry. Please try again.");
      }
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Redesigned Header Area with Back Button */}
      <div className="bg-white border-b border-slate-200 sticky top-0 md:top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all group"
              title="Go Back"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <nav className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <span>/</span>
              <Link href="/properties" className="hover:text-blue-600">Properties</Link>
              <span>/</span>
              <span className="text-slate-900 truncate max-w-[150px]">{property.title}</span>
            </nav>
          </div>
          <div className="flex items-center gap-2 relative">
            {showLoginPrompt && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full right-0 mt-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest p-2 rounded-lg shadow-xl z-50 whitespace-nowrap"
              >
                Please login to add to favorites
              </motion.div>
            )}
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleFavorite}
              className={`rounded-lg border-slate-200 transition-all ${isFavorite ? 'bg-rose-50 text-rose-500 border-rose-100' : 'text-slate-400 hover:text-rose-500'}`}
            >
              <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleShare}
              className="rounded-lg border-slate-200 text-slate-400 hover:text-blue-600"
            >
              <Share2 size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Left Column: Media & Details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-slate-200">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={property.images[currentImageIndex]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                
                {/* Nav Buttons */}
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                  <button onClick={prevImage} className="w-9 h-9 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-slate-900 pointer-events-auto hover:bg-blue-600 hover:text-white transition-all">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={nextImage} className="w-9 h-9 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-slate-900 pointer-events-auto hover:bg-blue-600 hover:text-white transition-all">
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant="info" className="px-3 py-1 rounded-md">{property.propertySubtype || property.type || 'Residential'}</Badge>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {property.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`shrink-0 w-20 aspect-video rounded-lg overflow-hidden border transition-all ${
                      currentImageIndex === idx ? 'border-blue-600 ring-2 ring-blue-50' : 'border-slate-200'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Property Intro Card */}
            <Card className="p-5 rounded-xl border-slate-100">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">{property.title}</h1>
                  <div className="flex items-center text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                    <MapPin size={12} className="mr-1.5 text-blue-500" />
                    {property.address || property.location}
                  </div>
                </div>
                <div className="text-left md:text-right bg-slate-50 p-3 px-5 rounded-lg border border-slate-100">
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-0.5">
                    {property.listingType === 'Rent' ? 'Monthly Rent' : 'Price'}
                  </p>
                  <p className="text-xl font-black text-blue-600">{property.price}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-3 border-y border-slate-50">
                {property.bedrooms && (
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Bed size={14} />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Beds</span>
                    </div>
                    <p className="text-sm font-black text-slate-900">{property.bedrooms}</p>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Bath size={14} />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Baths</span>
                    </div>
                    <p className="text-sm font-black text-slate-900">{property.bathrooms}</p>
                  </div>
                )}
                {property.area && (
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Square size={14} />
                      <span className="text-[9px] font-bold uppercase tracking-wider">Area</span>
                    </div>
                    <p className="text-sm font-black text-slate-900">{property.area}</p>
                  </div>
                )}
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Building2 size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Builder</span>
                  </div>
                  <p className="text-sm font-black text-slate-900 truncate">
                    {typeof property.builder === 'string' ? property.builder : property.builder?.name || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Project Details Section */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-3">
                  {property.listingType === 'Rent' ? 'Rental Details' : 'Project Details'}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {/* Rental-specific fields */}
                  {property.listingType === 'Rent' && (
                    <>
                      {property.furnishing && (
                        <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Furnishing</span>
                          <p className="text-sm font-black text-slate-900">{property.furnishing}</p>
                        </div>
                      )}
                      {property.listedBy && (
                        <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Listed By</span>
                          <p className="text-sm font-black text-slate-900">{property.listedBy}</p>
                        </div>
                      )}
                      {property.bachelorsAllowed && (
                        <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Bachelors Allowed</span>
                          <p className="text-sm font-black text-slate-900">{property.bachelorsAllowed}</p>
                        </div>
                      )}
                      {property.carpetArea && (
                        <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Carpet Area</span>
                          <p className="text-sm font-black text-slate-900">{property.carpetArea}</p>
                        </div>
                      )}
                      {property.maintenance && (
                        <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Maintenance (Monthly)</span>
                          <p className="text-sm font-black text-slate-900">{property.maintenance}</p>
                        </div>
                      )}
                      {property.totalFloors && (
                        <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Floors</span>
                          <p className="text-sm font-black text-slate-900">{property.totalFloors}</p>
                        </div>
                      )}
                      {property.carParking && (
                        <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Car Parking</span>
                          <p className="text-sm font-black text-slate-900">{property.carParking}</p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Project Details (for non-rental properties) */}
                  {/* Project Units */}
                  {property.projectUnits && (
                    <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Project Units</span>
                      <p className="text-lg font-black text-slate-900">{property.projectUnits}</p>
                    </div>
                  )}

                  {/* Area Unit */}
                  {property.areaUnit && (
                    <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Area Unit</span>
                      <p className="text-lg font-black text-slate-900">{property.areaUnit}</p>
                    </div>
                  )}

                  {/* Project Area */}
                  {property.projectArea && (
                    <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Project Area</span>
                      <p className="text-lg font-black text-slate-900">{property.projectArea}</p>
                    </div>
                  )}

                  {/* Sizes */}
                  {property.sizes && (
                    <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Sizes</span>
                      <p className="text-sm font-black text-slate-900">{property.sizes}</p>
                    </div>
                  )}

                  {/* Project Size */}
                  {property.projectSize && (
                    <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Project Size</span>
                      <p className="text-sm font-black text-slate-900">{property.projectSize}</p>
                    </div>
                  )}

                  {/* Launch Date */}
                  {property.launchDate && (
                    <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Launch Date</span>
                      <p className="text-lg font-black text-slate-900">{property.launchDate}</p>
                    </div>
                  )}

                  {/* Avg. Price */}
                  {property.avgPrice && (
                    <div className="flex flex-col gap-1 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">Avg. Price</span>
                      <p className="text-lg font-black text-blue-600">{property.avgPrice}</p>
                    </div>
                  )}

                  {/* Possession Starts / Available From */}
                  {property.possessionDate && (
                    <div className="flex flex-col gap-1 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                      <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">
                        {property.listingType === 'Rent' ? 'Available From' : 'Possession Starts'}
                      </span>
                      <p className="text-lg font-black text-emerald-600">{property.possessionDate}</p>
                    </div>
                  )}

                  {/* Configurations */}
                  {property.configurations && (
                    <div className="flex flex-col gap-1 p-3 bg-slate-50 rounded-lg border border-slate-100 sm:col-span-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Configurations</span>
                      <p className="text-sm font-black text-slate-900">{property.configurations}</p>
                    </div>
                  )}

                  {/* RERA ID */}
                  {property.reraId && (
                    <div className="flex flex-col gap-1 p-3 bg-amber-50 rounded-lg border border-amber-100 sm:col-span-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-amber-600">RERA ID</span>
                      <p className="text-sm font-black text-amber-900">{property.reraId}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Content Tabs */}
            <div className="space-y-3">
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 overflow-x-auto no-scrollbar">
                {['overview', 'amenities', 'specifications'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                      activeTab === tab 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="bg-white p-5 rounded-xl border border-slate-200"
                >
                  {activeTab === 'overview' && (
                    <div className="space-y-3">
                      <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">About Property</h3>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium">{property.description}</p>
                      <div className="grid sm:grid-cols-2 gap-2 pt-1">
                        {(property.highlights || ['Premium Construction', 'Vastu Compliant']).map((h: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                            <Check className="text-emerald-500" size={14} />
                            <span className="text-[10px] font-bold text-slate-700">{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'amenities' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {property.amenities.map((item: string, idx: number) => (
                        <div key={idx} className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                          <Building2 size={18} className="text-blue-600 mb-2" />
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-700 text-center">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'specifications' && (
                    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1">
                      {property.specifications.map((spec: any, i: number) => (
                        <div key={i} className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{spec.label}</span>
                          <span className="text-[10px] font-bold text-slate-900">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Property Location Section - Only show if data exists */}
            {(property.nearbyLocations?.length > 0 || (property.mapLink && property.mapLink.startsWith('http'))) && (
              <Card className="p-5 rounded-xl border-slate-200">
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <MapPin size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Property Location</h3>
                    <p className="text-[10px] font-medium text-slate-500">{property.address || property.location}</p>
                  </div>
                </div>

                <div className="mt-4">
                  {property.nearbyLocations && property.nearbyLocations.length > 0 && (
                    <>
                      <h4 className="text-sm font-black text-slate-900 mb-3">Around This Project</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {property.nearbyLocations.map((item: any, i: number) => {
                          const iconMap: any = {
                            'School': <School size={18} className="text-purple-600" />,
                            'Bus Stand': <Bus size={18} className="text-orange-600" />,
                            'Shopping': <ShoppingCart size={18} className="text-blue-600" />,
                            'Hospital': <Hospital size={18} className="text-red-600" />,
                            'Coffee': <Coffee size={18} className="text-amber-600" />
                          };
                          return (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-all group">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200 group-hover:border-blue-300 transition-all">
                                  {iconMap[item.type] || <MapPin size={18} className="text-blue-600" />}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-900">{item.name}</p>
                                  <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">{item.type}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-black text-slate-900">{item.time}</p>
                                <p className="text-[9px] text-slate-400 font-medium">({item.distance})</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {property.mapLink && property.mapLink.startsWith('http') && (
                    <>
                      <div className={`rounded-xl overflow-hidden border border-slate-200 aspect-video ${property.nearbyLocations?.length > 0 ? 'mt-4' : ''}`}>
                        <iframe 
                          src={property.mapLink}
                          className="w-full h-full border-0"
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                      <div className="mt-4 text-center">
                        <button 
                          onClick={() => window.open(property.mapLink, '_blank')}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors inline-flex items-center gap-1.5"
                        >
                          <Map size={12} />
                          View on Google Maps
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            )}
          </div>
          
          {/* Right Column: Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-3">
              {/* Contact Card */}
              <Card className="p-5 rounded-xl border-slate-200">
                <h3 className="text-lg font-black text-slate-900 mb-0.5">Inquire Now</h3>
                <p className="text-slate-500 text-[10px] font-medium mb-4">Our experts will call you shortly.</p>
                
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <Input 
                    label="Name" 
                    placeholder="Full Name" 
                    required 
                    className="text-xs" 
                    value={contactData.name}
                    onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                  />
                  <Input 
                    label="Phone" 
                    placeholder="+91 988XX XXXXX" 
                    required 
                    className="text-xs" 
                    value={contactData.phone}
                    onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                  />
                  <Input 
                    label="Email" 
                    placeholder="your@email.com" 
                    type="email"
                    required 
                    className="text-xs" 
                    value={contactData.email}
                    onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                  />
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Message</label>
                    <textarea 
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-xs font-medium min-h-[70px]"
                      placeholder="I'm interested in this project..."
                      value={contactData.message}
                      onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full py-2.5 rounded-lg font-black uppercase tracking-widest text-xs" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Connect Now'}
                  </Button>
                </form>

                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <a href="tel:+919881159245" className="flex flex-col items-center gap-1.5 p-2 bg-slate-50 rounded-lg hover:bg-blue-50 transition-colors">
                    <Phone size={14} className="text-blue-600" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-900">Call</span>
                  </a>
                  <a href="#" className="flex flex-col items-center gap-1.5 p-2 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                    <MessageCircle size={14} className="text-emerald-600" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-900">Chat</span>
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
