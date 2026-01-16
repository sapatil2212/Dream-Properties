import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PropertyCard } from './Home/PropertyCards.tsx';
import { ArrowLeft, Search } from 'lucide-react';

export const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const searchQuery = searchParams.get('q') || '';
  const listingType = searchParams.get('listing_type');
  const propertyType = searchParams.get('type');

  useEffect(() => {
    fetchSearchResults();
  }, [searchQuery, listingType, propertyType]);

  const fetchSearchResults = async () => {
    setIsLoading(true);
    setNotFound(false);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (listingType) params.set('listing_type', listingType);
      if (propertyType) params.set('property_type', propertyType);

      const response = await fetch(`http://localhost:5000/api/superadmin/search-properties?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        // Parse JSON fields
        const parsed = data.map((p: any) => ({
          ...p,
          images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : (p.images || []),
          amenities: typeof p.amenities === 'string' ? JSON.parse(p.amenities || '[]') : (p.amenities || []),
          highlights: typeof p.highlights === 'string' ? JSON.parse(p.highlights || '[]') : (p.highlights || []),
          specifications: typeof p.specifications === 'string' ? JSON.parse(p.specifications || '[]') : (p.specifications || [])
        }));
        setProperties(parsed);
        if (parsed.length === 0) {
          setNotFound(true);
        }
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

  const getSearchDescription = () => {
    const parts = [];
    if (searchQuery) parts.push(`"${searchQuery}"`);
    if (listingType) parts.push(`for ${listingType}`);
    if (propertyType && propertyType !== 'all') parts.push(`in ${propertyType}`);
    return parts.join(' ');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Search size={20} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Search Results
              </h1>
              {getSearchDescription() && (
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  Showing properties {getSearchDescription()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && notFound && (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="text-slate-400" size={28} />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tight">No Properties Found</h3>
            <p className="text-slate-500 text-sm font-medium mb-6">
              We couldn't find any properties matching your search.
            </p>
            <Link 
              to="/properties" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-colors"
            >
              View All Properties
            </Link>
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && properties.length > 0 && (
          <>
            <div className="mb-4">
              <p className="text-sm font-bold text-slate-600">
                Found {properties.length} {properties.length === 1 ? 'property' : 'properties'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
