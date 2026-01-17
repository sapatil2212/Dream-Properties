'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PropertyCard } from '@/components/Home/FeaturedProperties';
import { Filter, Search } from 'lucide-react';

function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const query = searchParams?.get('q') || '';
  const listingType = searchParams?.get('listing_type');
  const propType = searchParams?.get('type');

  const fetchSearchResults = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams(searchParams?.toString() || '');
      const response = await fetch(`/api/properties/search?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProperties(data);
      }
    } catch (err) {
      console.error('Error fetching search results:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [searchParams]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
      <div className="mb-10">
        <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.3em] block mb-2">Search Results</span>
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
          {query ? `Results for "${query}"` : 'All Properties'}
        </h1>
        <div className="flex items-center gap-2 mt-2 text-slate-500 font-medium text-sm">
          <Search size={14} className="text-blue-500" />
          <span>Found {properties.length} properties matching your criteria</span>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
             <Search className="text-slate-300" size={24} />
           </div>
           <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">No Properties Found</h3>
           <p className="text-slate-400 font-medium text-sm mb-6 max-w-xs mx-auto">We couldn't find any properties matching your search. Try adjusting your filters.</p>
           <button 
             onClick={() => router.push('/properties')} 
             className="bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest px-8 py-3 rounded-xl hover:bg-blue-700 transition-all"
           >
             View All Listings
           </button>
        </div>
      )}
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Searching properties...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
