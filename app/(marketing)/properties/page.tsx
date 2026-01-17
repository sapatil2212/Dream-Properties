'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PropertyCard } from '@/components/Home/FeaturedProperties';
import { PropertyCategory } from '@/types';
import { Select } from '@/components/UIComponents';
import { Filter } from 'lucide-react';

function PropertiesContent() {
  const searchParams = useSearchParams();
  const initialFilter = (searchParams?.get('type') as PropertyCategory) || 'All';
  const listingType = (searchParams?.get('listing_type') || 'All') as 'Sell' | 'Rent' | 'Lease' | 'All';
  
  const [filter, setFilter] = useState<PropertyCategory | 'All'>(initialFilter);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApprovedProperties = async () => {
    try {
      let url = '/api/properties';
      const params = new URLSearchParams();
      if (listingType !== 'All') {
        params.set('listing_type', listingType);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchApprovedProperties();
  }, [listingType]);

  // Sync state if URL changes
  useEffect(() => {
    const type = searchParams?.get('type');
    if (type) setFilter(type as PropertyCategory);
    else setFilter('All');
  }, [searchParams]);

  const handleFilterChange = (newFilter: string) => {
    const val = newFilter as PropertyCategory | 'All';
    setFilter(val);
    
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (val === 'All') {
      params.delete('type');
    } else {
      params.set('type', val);
    }
    window.history.pushState(null, '', `?${params.toString()}`);
  };

  const filteredProperties = filter === 'All' 
    ? properties 
    : properties.filter(p => p.type === filter);

  const categories: (PropertyCategory | 'All')[] = [
    'All', 'Flats', 'Villa', 'Shop', 'Office', 'Plot', 'Agricultural', 'Industrial', 'Warehouse'
  ];

  const selectOptions = categories.map(cat => ({ label: cat, value: cat }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-20">
      {/* Header Section with Filters in One Line */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 md:mb-12">
        <div className="flex-shrink-0">
          <span className="text-blue-600 font-black text-[7px] md:text-[10px] uppercase tracking-[0.3em] block mb-0.5">Catalog</span>
          <h1 className="text-xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-0.5">
            {listingType === 'All' ? 'Exclusive Properties' : `Properties for ${listingType}`}
          </h1>
          <p className="text-slate-500 font-medium text-[9px] md:text-base opacity-75">
            {filter === 'All' ? 'Browse all' : `Browse ${filter}`} verified {listingType !== 'All' ? listingType.toLowerCase() : ''} listings in Nashik.
          </p>
        </div>
        
        {/* Desktop Filters */}
        <div className="hidden md:flex bg-slate-100 p-1 rounded-xl items-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleFilterChange(cat)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all whitespace-nowrap ${
                filter === cat 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Filters (Sticky) */}
      <div className="md:hidden sticky top-[64px] z-[40] -mx-4 px-4 bg-white/95 backdrop-blur-md border-b border-slate-200 py-2.5 mb-8 shadow-sm">
        <div className="flex items-center justify-between w-full gap-3">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
              <Filter size={12} className="text-blue-600" />
            </div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">
              Category
            </label>
          </div>
          <div className="flex-1 max-w-[150px]">
            <Select
              options={selectOptions}
              value={filter}
              onChange={handleFilterChange}
              size="sm"
              className="bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {filteredProperties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 md:py-32 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
           <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
             <Filter className="text-slate-300" size={20} />
           </div>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] md:text-xs px-4">No properties found in this category.</p>
           <button onClick={() => handleFilterChange('All')} className="text-blue-600 font-black text-[10px] uppercase tracking-widest mt-4 hover:underline transition-all">
             View All Listings
           </button>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && filteredProperties.length > 0 && (
        <div className="mt-12 md:mt-20 flex justify-center items-center gap-2 md:gap-3">
           <button className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-slate-200 text-slate-400 font-bold text-[9px] md:text-xs hover:bg-gray-50 disabled:opacity-50 transition-colors" disabled>
             Prev
           </button>
           {[1, 2, 3].map(n => (
             <button 
               key={n} 
               className={`w-8 h-8 md:w-11 md:h-11 rounded-lg border text-[9px] md:text-xs font-black transition-all ${
                 n === 1 
                   ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' 
                   : 'bg-white text-slate-600 border-slate-200 hover:border-blue-600 hover:text-blue-600'
               }`}
             >
                {n}
             </button>
           ))}
           <button className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg border border-slate-200 text-slate-600 font-bold text-[9px] md:text-xs hover:bg-gray-50 transition-colors">
             Next
           </button>
        </div>
      )}
    </div>
  );
}

export default function PropertiesListingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading properties...</div>}>
      <PropertiesContent />
    </Suspense>
  );
}
