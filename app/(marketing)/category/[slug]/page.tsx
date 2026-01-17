'use client';

import React, { useEffect, use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PropertyCard } from '@/components/Home/FeaturedProperties';
import { PropertyCategory } from '@/types';
import { ChevronLeft, LayoutGrid, Filter, Search } from 'lucide-react';
import { Button } from '@/components/UIComponents';

const slugToCategory: Record<string, PropertyCategory> = {
  'flats': 'Flats',
  'villas': 'Villa',
  'shops': 'Shop',
  'offices': 'Office',
  'plots': 'Plot',
  'agricultural-lands': 'Agricultural',
  'industrial-lands': 'Industrial',
  'warehouses': 'Warehouse'
};

const categoryDetails: Record<PropertyCategory, { title: string; desc: string; banner: string }> = {
  'Flats': { 
    title: 'Modern Apartments', 
    desc: 'Luxurious flats in prime urban locations with world-class amenities.',
    banner: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1920'
  },
  'Villa': { 
    title: 'Exclusive Villas', 
    desc: 'Find your peace in our collection of row houses and standalone luxury villas.',
    banner: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1920'
  },
  'Shop': { 
    title: 'Retail Spaces', 
    desc: 'High-visibility shops and commercial outlets for your business growth.',
    banner: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&q=80&w=1920'
  },
  'Office': { 
    title: 'Corporate Offices', 
    desc: 'State-of-the-art office spaces in tech parks and corporate hubs.',
    banner: 'https://images.unsplash.com/photo-1497366216548-375260702097c?auto=format&fit=crop&q=80&w=1920'
  },
  'Plot': { 
    title: 'Residential Plots', 
    desc: 'Investment-ready land parcels and residential plots with infrastructure.',
    banner: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1920'
  },
  'Agricultural': { 
    title: 'Agricultural Lands', 
    desc: 'Fertile farm lands and agricultural estates for sustainable investment.',
    banner: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1920'
  },
  'Industrial': { 
    title: 'Industrial Units', 
    desc: 'MIDC sheds and industrial lands equipped for heavy manufacturing.',
    banner: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1920'
  },
  'Warehouse': { 
    title: 'Warehousing & Logistics', 
    desc: 'Large scale storage and logistics centers in strategic distribution hubs.',
    banner: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1920'
  }
};

export default function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const category = slug ? slugToCategory[slug] : null;
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (category) {
      fetchCategoryProperties();
    }
  }, [category]);

  const fetchCategoryProperties = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/properties?type=${category}`);
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (err) {
      console.error('Error fetching category properties:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!category || !categoryDetails[category]) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
        <Button onClick={() => router.push('/')}>Go Home</Button>
      </div>
    );
  }

  const details = categoryDetails[category];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative h-[300px] md:h-[400px] overflow-hidden">
        <img 
          src={details.banner} 
          className="w-full h-full object-cover" 
          alt={details.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end container mx-auto px-4 pb-12 md:pb-16">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white/70 hover:text-white text-xs font-black uppercase tracking-widest mb-6 transition-colors group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Categories
          </button>
          
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded mb-4">
              Premium Collection
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
              {details.title}
            </h1>
            <p className="text-white/80 text-lg font-medium leading-relaxed max-w-xl italic">
              {details.desc}
            </p>
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-30 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                <LayoutGrid size={18} />
             </div>
             <p className="text-sm font-bold text-slate-700">
               Showing <span className="text-blue-600">{properties.length}</span> Verified Listings
             </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl text-xs font-bold border-slate-200">
              <Filter size={14} /> Filters
            </Button>
            <div className="relative hidden sm:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder={`Search in ${category}...`} 
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/10 w-48 md:w-64"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
             <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <LayoutGrid className="text-slate-300" size={32} />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">No Properties Listed</h3>
             <p className="text-slate-500 font-medium mb-8">We're currently updating our catalog for this category.</p>
             <Button onClick={() => router.push('/properties')} variant="outline">Browse All Properties</Button>
          </div>
        )}
      </div>

      <section className="bg-blue-600 py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">Looking for something specific?</h2>
          <p className="text-blue-100 mb-8 text-lg font-medium italic">Our real estate consultants can help you find exactly what you're looking for at the best price.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 w-full sm:w-auto font-black uppercase tracking-widest text-xs">
              Talk to Expert
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 w-full sm:w-auto font-black uppercase tracking-widest text-xs">
              Enquire Via WhatsApp
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
