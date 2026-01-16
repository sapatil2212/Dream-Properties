import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Building2, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '../../components/UIComponents.tsx';
import { Link } from 'react-router-dom';

export const PropertiesInterested: React.FC = () => {
  // Mock data for interested properties
  const interestedProperties = [
    {
      id: 1,
      title: "Luxury Sky Villa",
      location: "Mahatmanagar, Nashik",
      price: "₹ 2.5 Cr",
      image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=800",
      type: "Sale"
    },
    {
      id: 2,
      title: "Modern Office Space",
      location: "Gangapur Road, Nashik",
      price: "₹ 45,000/mo",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800",
      type: "Rent"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Interested Properties</h1>
          <p className="text-slate-500 text-sm font-medium">Properties you've saved or inquired about</p>
        </div>
        <div className="bg-rose-50 px-4 py-2 rounded-2xl flex items-center gap-2 text-rose-600 font-black text-[10px] uppercase tracking-widest border border-rose-100">
          <Heart size={14} fill="currentColor" />
          {interestedProperties.length} Saved
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {interestedProperties.map((property, index) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={property.id}
            className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
          >
            <div className="aspect-[16/10] relative overflow-hidden">
              <img 
                src={property.image} 
                alt={property.title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm border border-white/50">
                  {property.type}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-1 group-hover:text-blue-600 transition-colors">
                    {property.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <MapPin size={14} />
                    <span className="text-[11px] font-bold uppercase tracking-wider">{property.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-blue-600 tracking-tight">{property.price}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link to={`/properties/${property.id}`} className="flex-1">
                  <Button className="w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 bg-slate-900 hover:bg-blue-600 transition-all">
                    View Details
                    <ArrowRight size={14} />
                  </Button>
                </Link>
                <Button variant="outline" className="w-12 h-12 rounded-xl flex items-center justify-center border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-100">
                  <Heart size={18} fill="currentColor" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}

        {interestedProperties.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Building2 size={32} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">No properties yet</h3>
            <p className="text-slate-500 text-sm font-medium mb-8">Start exploring and save properties you love!</p>
            <Link to="/properties">
              <Button className="rounded-2xl font-black uppercase text-[11px] tracking-widest px-8 py-4">
                Browse Properties
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
