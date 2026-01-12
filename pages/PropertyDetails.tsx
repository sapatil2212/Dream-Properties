import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  FileDown,
} from 'lucide-react';
import { MOCK_PROPERTIES } from '../constants.tsx';
import { Badge, Button, Card, Input } from '../components/UIComponents.tsx';

export const PropertyDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Property finding logic
  const property = MOCK_PROPERTIES.find(p => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!property) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-black text-slate-900 mb-4">Property Not Found</h2>
        <Button onClick={() => navigate('/properties')} className="rounded-xl">Back to Properties</Button>
      </div>
    );
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert("Inquiry Sent! Our team will contact you shortly.");
    setIsSubmitting(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Redesigned Header Area with Back Button */}
      <div className="bg-white border-b border-slate-200 sticky top-0 md:top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 rounded-lg bg-slate-50 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all group"
              title="Go Back"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <nav className="hidden sm:flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <Link to="/" className="hover:text-blue-600">Home</Link>
              <span>/</span>
              <Link to="/properties" className="hover:text-blue-600">Properties</Link>
              <span>/</span>
              <span className="text-slate-900 truncate max-w-[150px]">{property.title}</span>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-lg border-slate-200 text-slate-400 hover:text-rose-500">
              <Heart size={16} />
            </Button>
            <Button variant="outline" size="icon" className="rounded-lg border-slate-200 text-slate-400 hover:text-blue-600">
              <Share2 size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Media & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
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
                  <Badge variant="success" className="px-3 py-1 rounded-md">{property.status}</Badge>
                  <Badge variant="info" className="px-3 py-1 rounded-md">{property.type}</Badge>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {property.images.map((img, idx) => (
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
            <Card className="p-6 rounded-xl border-slate-100">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">{property.title}</h1>
                  <div className="flex items-center text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                    <MapPin size={12} className="mr-1.5 text-blue-500" />
                    {property.address || property.location}
                  </div>
                </div>
                <div className="text-left md:text-right bg-slate-50 p-3 px-5 rounded-lg border border-slate-100">
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-0.5">Price</p>
                  <p className="text-xl font-black text-blue-600">{property.price}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-slate-50">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Bed size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Beds</span>
                  </div>
                  <p className="text-sm font-black text-slate-900">{property.bedrooms || 'N/A'}</p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Bath size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Baths</span>
                  </div>
                  <p className="text-sm font-black text-slate-900">{property.bathrooms || 'N/A'}</p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Square size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Area</span>
                  </div>
                  <p className="text-sm font-black text-slate-900">{property.area}</p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Building2 size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Builder</span>
                  </div>
                  <p className="text-sm font-black text-slate-900 truncate">{property.builder}</p>
                </div>
              </div>
            </Card>

            {/* Content Tabs */}
            <div className="space-y-4">
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 overflow-x-auto no-scrollbar">
                {['overview', 'amenities', 'specifications', 'brochure'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                      activeTab === tab 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {tab === 'brochure' && <FileDown size={12} />}
                    {tab === 'brochure' ? 'Download Brochure' : tab}
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
                  className="bg-white p-6 rounded-xl border border-slate-200"
                >
                  {activeTab === 'overview' && (
                    <div className="space-y-5">
                      <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">About Property</h3>
                      <p className="text-slate-600 text-sm leading-relaxed font-medium">{property.description}</p>
                      <div className="grid sm:grid-cols-2 gap-3 pt-2">
                        {(property.highlights || ['Premium Construction', 'Vastu Compliant']).map((h, i) => (
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
                      {property.amenities.map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center justify-center p-5 bg-slate-50 rounded-lg border border-slate-100">
                          <Building2 size={18} className="text-blue-600 mb-2" />
                          <span className="text-[9px] font-black uppercase tracking-wider text-slate-700 text-center">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'specifications' && (
                    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1">
                      {property.specifications.map((spec, i) => (
                        <div key={i} className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{spec.label}</span>
                          <span className="text-[10px] font-bold text-slate-900">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'brochure' && (
                    <div className="text-center py-8 space-y-5">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto">
                        <FileDown size={24} />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-slate-900">Project Brochure</h4>
                        <p className="text-slate-500 text-xs font-medium mt-1">Full floor plans and pricing details.</p>
                      </div>
                      <Button className="rounded-lg px-8 py-2.5 gap-2 text-xs">
                        <FileDown size={14} />
                        Download PDF
                      </Button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32 space-y-4">
              {/* Contact Card */}
              <Card className="p-5 rounded-xl border-slate-200">
                <h3 className="text-lg font-black text-slate-900 mb-0.5">Inquire Now</h3>
                <p className="text-slate-500 text-[10px] font-medium mb-5">Our experts will call you shortly.</p>
                
                <form onSubmit={handleContactSubmit} className="space-y-3.5">
                  <Input label="Name" placeholder="Full Name" required className="text-xs" />
                  <Input label="Phone" placeholder="+91 988XX XXXXX" required className="text-xs" />
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Message</label>
                    <textarea 
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-xs font-medium min-h-[70px]"
                      placeholder="I'm interested in this project..."
                    />
                  </div>
                  <Button type="submit" className="w-full py-2.5 rounded-lg font-black uppercase tracking-widest text-xs" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Connect Now'}
                  </Button>
                </form>

                <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-2 gap-2">
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

              {/* Price Tag & Details Card */}
              <div className="bg-slate-900 p-5 rounded-xl text-white">
                <div className="flex items-center gap-2 mb-1 opacity-60 uppercase tracking-widest text-[8px] font-black">
                  <IndianRupee size={10} />
                  Starting Price
                </div>
                <p className="text-xl font-black mb-3">{property.price}</p>
                <div className="h-px bg-slate-800 mb-3" />
                <div className="flex items-center gap-2.5">
                   <div className="w-7 h-7 rounded-md bg-slate-800 flex items-center justify-center">
                     <Calendar size={12} className="text-blue-400" />
                   </div>
                   <div>
                     <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Possession</p>
                     <p className="text-[10px] font-bold">Dec 2025</p>
                   </div>
                </div>
              </div>

              {/* Map Container Moved Here - Below Inquiry Form */}
              <Card className="p-4 rounded-xl border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={12} className="text-rose-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">Project Location</span>
                </div>
                <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 overflow-hidden relative">
                  <div className="text-center p-2">
                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-rose-500 mx-auto mb-1 shadow-sm">
                      <MapPin size={16} />
                    </div>
                    <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Map View</p>
                  </div>
                  <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
                </div>
                <div className="mt-3">
                   <p className="text-[9px] text-slate-500 font-medium line-clamp-1">{property.address || property.location}</p>
                   <button className="text-[9px] text-blue-600 font-bold hover:underline mt-1">Get Directions</button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};