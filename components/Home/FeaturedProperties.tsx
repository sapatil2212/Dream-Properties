'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, MapPin, Bed, Bath, Maximize, Heart, Info, Send, Building2, Calendar, Star } from 'lucide-react';
import { Card, Badge, Button, Modal } from '@/components/UIComponents';
import { Property } from '@/types';
import { useRouter } from 'next/navigation';
import { PropertyInquiryForm } from '@/components/PropertyInquiryForm';

export const PropertyCard: React.FC<{ property: Property }> = ({ property }) => {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [favoriteChecked, setFavoriteChecked] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);

  // Only check favorite status when user interacts, not on mount
  const checkFavoriteStatus = async () => {
    if (favoriteChecked) return;
    try {
      const response = await fetch(`/api/profile/favorites/check/${property.id}`);
      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
        setFavoriteChecked(true);
      }
    } catch (err) {
      // Ignore
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check favorite status first if not already checked
    if (!favoriteChecked) {
      await checkFavoriteStatus();
    }
    
    try {
      const endpoint = isFavorite ? 'remove' : 'add';
      const response = await fetch(`/api/profile/favorites/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: property.id })
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

  const handleInquirySubmitted = () => {
    setShowInquiry(false);
  };

  const isResidential = (type: string | undefined, subtype: string | undefined) => {
    const t = (type || '').toLowerCase();
    const st = (subtype || '').toLowerCase();
    const residentialTypes = ['residential', 'apartment', 'villa', 'penthouse', 'flat', 'house'];
    return residentialTypes.some(rt => t.includes(rt) || st.includes(rt));
  };

  const isResidentialProperty = isResidential(property.type, property.property_subtype);

  return (
    <Card className="group flex flex-col h-full bg-white hover:shadow-xl transition-all duration-500 border border-slate-100 rounded-2xl overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden cursor-pointer" onClick={() => router.push(`/properties/${property.id}`)}>
        <img
          src={Array.isArray(property.images) ? property.images[0] : JSON.parse(property.images as unknown as string)[0]}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          alt={property.title}
          loading="lazy"
        />
        
        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <Badge variant="info">{property.property_subtype || property.type || 'Residential'}</Badge>
          {property.isFeatured && (
            <Badge className="!bg-orange-100 !text-orange-600 !border-none shadow-sm flex items-center gap-1">
              <Star size={10} className="fill-orange-600" />
              Featured
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
          {showLoginPrompt && (
            <div className="bg-slate-900 text-white text-[7px] font-black uppercase tracking-widest p-1.5 rounded shadow-lg whitespace-nowrap">
              Login Required
            </div>
          )}
          <button 
            onClick={toggleFavorite}
            className={`p-1.5 bg-white/90 backdrop-blur-sm rounded-full transition-all duration-300 shadow-sm ${isFavorite ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500 hover:bg-white'}`}
          >
            <Heart size={16} fill={isFavorite ? "currentColor" : "none"} className={isFavorite ? "" : "group-hover:scale-110 transition-transform"} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-3">
          <div className="flex items-center text-slate-500 text-[11px] font-medium">
            <MapPin size={12} className="mr-1 text-blue-500 shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>
        </div>

        {/* Specs Grid - Show BHK/Bath only for properties without occupancy types */}
        {(!((property as any).occupancies && (property as any).occupancies.length > 0)) ? (
          <div className="grid grid-cols-3 gap-2 mb-4 pt-3 border-t border-slate-50">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-blue-50 rounded-lg text-blue-600">
                {isResidentialProperty ? <Bed size={12} /> : <Building2 size={12} />}
              </div>
              <span className="text-[11px] font-bold text-slate-700">
                {isResidentialProperty 
                  ? `${property.bedrooms || 0} BHK` 
                  : ((property as any).projectUnits || (property as any).project_units 
                      ? `${(property as any).projectUnits || (property as any).project_units} Units` 
                      : ((property as any).projectSize || (property as any).project_size || 'N/A'))}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1 bg-blue-50 rounded-lg text-blue-600">
                {isResidentialProperty ? <Bath size={12} /> : <Calendar size={12} />}
              </div>
              <span className="text-[11px] font-bold text-slate-700">
                {isResidentialProperty 
                  ? `${property.bathrooms || 0} Bath` 
                  : ((property as any).possessionDate || (property as any).possession_date || 'Ready')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1 bg-blue-50 rounded-lg text-blue-600">
                <Maximize size={12} />
              </div>
              <span className="text-[11px] font-bold text-slate-700">{property.area}</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 mb-4 pt-3 border-t border-slate-50">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-blue-50 rounded-lg text-blue-600">
                <Maximize size={12} />
              </div>
              <span className="text-[11px] font-bold text-slate-700">{property.area}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1 bg-blue-50 rounded-lg text-blue-600">
                <Building2 size={12} />
              </div>
              <span className="text-[11px] font-bold text-slate-700">
                {(property as any).occupancies.reduce((sum: number, o: any) => sum + o.numberOfUnits, 0)} Units
              </span>
            </div>
          </div>
        )}

        {/* Occupancy Types Preview */}
        {(property as any).occupancies && (property as any).occupancies.length > 0 && (
          <div className="mb-4 pt-3 border-t border-slate-50">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Available Units</p>
            <div className="flex flex-wrap gap-1.5">
              {(property as any).occupancies.slice(0, 4).map((occ: any, idx: number) => (
                <span 
                  key={idx} 
                  className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-[9px] font-bold border border-blue-100"
                >
                  {occ.occupancyType}
                </span>
              ))}
              {(property as any).occupancies.length > 4 && (
                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[9px] font-bold">
                  +{(property as any).occupancies.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Pricing and Action Buttons */}
        <div className="mt-auto pt-3 border-t border-slate-50">
          {property.price && property.price !== 'NA' && (
            <div className="flex justify-between items-center mb-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                {property.listingType === 'Rent' ? 'Monthly Rent' : 'Starting From'}
              </span>
              <p className="text-blue-600 font-black text-base">{property.price}</p>
            </div>
          )}
            
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={() => router.push(`/properties/${property.id}`)}
              variant="outline" 
              size="sm" 
              className="w-full py-2 rounded-xl border-slate-200 hover:border-blue-600 hover:bg-blue-50 text-slate-700 font-bold text-[10px] gap-1.5 shadow-none"
            >
              <Info size={12} />
              Details
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              className="w-full py-2 rounded-xl font-bold text-[10px] gap-1.5 shadow-none"
              onClick={() => setShowInquiry(true)}
            >
              <Send size={12} />
              Inquire
            </Button>
          </div>
        </div>
      </div>
      <Modal
        isOpen={showInquiry}
        onClose={() => setShowInquiry(false)}
        title="Inquire About This Property"
      >
        <div className="space-y-2">
          <p className="text-[11px] text-slate-500 font-medium -mt-4 mb-2">
            Share a few details and our team will connect with you shortly.
          </p>
          <PropertyInquiryForm
            propertyId={property.id}
            propertyTitle={property.title}
            source="Website Property Card"
            onSubmitted={handleInquirySubmitted}
            twoColumn={true}
          />
        </div>
      </Modal>
    </Card>
  );
};

export const FeaturedProperties: React.FC = () => {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApprovedProperties = async () => {
      try {
        const res = await fetch('/api/properties'); 
        if (res.ok) {
          const data = await res.json();
          setProperties(data);
        }
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    };
    
    fetchApprovedProperties();
    
    // Auto-refresh when window gains focus
    const handleFocus = () => {
      fetchApprovedProperties();
    };
    
    // Listen for property updates from admin approval
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'propertyUpdated') {
        fetchApprovedProperties();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <section className="py-16 bg-white px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-row justify-between items-center md:items-end mb-10 gap-4">
          <div>
            <span className="text-blue-600 font-black text-[10px] md:text-xs uppercase tracking-[0.3em] mb-2 block">Premium Selection</span>
            <h2 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight uppercase">Featured Projects</h2>
            <div className="w-10 h-1 bg-blue-600 mt-2 rounded-full" />
          </div>
          <Button 
            onClick={() => router.push('/properties')}
            className="group flex items-center gap-1 md:gap-2 px-3 py-2 md:px-6 md:py-3 rounded-xl font-bold text-[10px] md:text-xs shadow-none transition-all duration-300 shrink-0"
          >
            Explore All
            <ArrowRight size={14} className="md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-2xl">
            <p className="text-slate-400 font-bold text-sm">No properties available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
