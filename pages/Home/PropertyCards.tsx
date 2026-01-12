import React from 'react';
import { ArrowRight, MapPin, Bed, Maximize, Heart, Info, Send } from 'lucide-react';
import { MOCK_PROPERTIES } from '../../constants.tsx';
import { Card, Badge, Button } from '../../components/UIComponents.tsx';
import { Property } from '../../types.ts';
import { useNavigate } from 'react-router-dom';

export const PropertyCard: React.FC<{ property: Property }> = ({ property }) => {
  const navigate = useNavigate();

  return (
    <Card className="group flex flex-col h-full bg-white hover:shadow-xl transition-all duration-500 border border-slate-100 rounded-2xl overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden cursor-pointer" onClick={() => navigate(`/properties/${property.id}`)}>
        <img
          src={property.images[0]}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          alt={property.title}
          loading="lazy"
        />
        
        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <Badge 
            variant={
              property.status === 'Sold Out' ? 'error' : 
              property.status === 'Fast Filling' ? 'warning' : 'success'
            }
          >
            {property.status}
          </Badge>
          {(property.type === 'Flats' || property.type === 'Villa') && (
             <Badge variant="info">Verified Project</Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button className="absolute top-3 right-3 p-1.5 bg-white/90 backdrop-blur-sm rounded-full text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm transition-all duration-300">
          <Heart size={16} className="group-hover:scale-110 transition-transform" />
        </button>

        {/* Builder Badge Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-white/90 text-[9px] font-bold uppercase tracking-widest">{property.builder}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-3">
          <h3 
            className="font-bold text-base text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors cursor-pointer mb-1"
            onClick={() => navigate(`/properties/${property.id}`)}
          >
            {property.title}
          </h3>
          <div className="flex items-center text-slate-500 text-[11px] font-medium">
            <MapPin size={12} className="mr-1 text-blue-500 shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 pt-3 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-blue-50 rounded-lg text-blue-600">
              <Bed size={12} />
            </div>
            <span className="text-[11px] font-bold text-slate-700">{property.bedrooms || 0} BHK</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-1 bg-blue-50 rounded-lg text-blue-600">
              <Maximize size={12} />
            </div>
            <span className="text-[11px] font-bold text-slate-700">{property.area}</span>
          </div>
        </div>

        {/* Pricing and Action Buttons */}
        <div className="mt-auto pt-3 border-t border-slate-50">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Starting From</span>
            <p className="text-blue-600 font-black text-base">{property.price.split(' ')[0]}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={() => navigate(`/properties/${property.id}`)}
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
            >
              <Send size={12} />
              Inquire
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export const FeaturedProperties: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-white px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] mb-2 block">Premium Selection</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Featured Projects</h2>
            <div className="w-10 h-1 bg-blue-600 mt-2 rounded-full" />
          </div>
          <Button 
            onClick={() => navigate('/properties')}
            className="group flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs shadow-none transition-all duration-300"
          >
            Explore All Listings 
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {MOCK_PROPERTIES.slice(0, 3).map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
};