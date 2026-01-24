'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, Plus, Heart, User, MapPin, Building2, IndianRupee } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/UIComponents';

export const MobileBottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const isActive = (path: string) => pathname === path;

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const response = await fetch(`/api/properties/search?q=${encodeURIComponent(searchQuery.trim())}`);
          if (response.ok) {
            const data = await response.json();
            setSearchResults(data);
          }
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handlePlusClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (session) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  const handleFavoritesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (session) {
      router.push('/dashboard/profile/favorites');
    } else {
      router.push('/login');
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/properties/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const handleResultClick = (propertyId: number | string) => {
    router.push(`/properties/${propertyId}`);
    setIsSearchOpen(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-200 md:hidden pb-safe rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex justify-between items-center px-6 h-16 relative">
        {/* Home */}
        <Link href="/" className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-blue-600' : 'text-slate-400'}`}>
          <Home size={20} strokeWidth={isActive('/') ? 2.5 : 2} />
          <span className="text-[10px] font-bold">Home</span>
        </Link>

        {/* Search (formerly Insights) */}
        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <DialogTrigger asChild>
            <button className={`flex flex-col items-center gap-1 ${isSearchOpen ? 'text-blue-600' : 'text-slate-400'}`}>
              <Search size={20} strokeWidth={isSearchOpen ? 2.5 : 2} />
              <span className="text-[10px] font-bold">Search</span>
            </button>
          </DialogTrigger>
          <DialogContent className="w-[90%] rounded-2xl top-[20%] translate-y-0">
            <DialogHeader>
              <DialogTitle>Search Properties</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-2 h-full overflow-hidden">
              <Input
                placeholder="Search by name, location, type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                autoFocus
              />
              
              {/* Search Results Area */}
              <div className="flex-1 overflow-y-auto max-h-[60vh] -mx-2 px-2">
                {isSearching ? (
                  <div className="flex justify-center py-8 text-slate-400">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : searchQuery.trim() && searchResults.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.map((property) => (
                      <div 
                        key={property.id}
                        onClick={() => handleResultClick(property.id)}
                        className="flex gap-3 p-2 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-100"
                      >
                        {/* Property Image Thumbnail */}
                        <div className="w-16 h-16 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden relative">
                          {property.images && property.images.length > 0 ? (
                            <img 
                              src={property.images[0]} 
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Building2 size={20} />
                            </div>
                          )}
                          <div className="absolute top-0 left-0 bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-br-md">
                            {property.listingType}
                          </div>
                        </div>

                        {/* Property Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate mb-0.5">{property.title}</h4>
                          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                            <MapPin size={10} />
                            <span className="truncate">{property.location}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                              {property.type}
                            </span>
                            <div className="flex items-center text-blue-600 font-bold text-sm">
                              <IndianRupee size={12} strokeWidth={2.5} />
                              <span>{property.price}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button 
                      onClick={handleSearch}
                      className="w-full py-3 text-center text-sm font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors mt-2"
                    >
                      View All Results
                    </button>
                  </div>
                ) : searchQuery.trim() && searchResults.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    No properties found matching "{searchQuery}"
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Start typing to search properties...
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Center Button (Sell/Rent) */}
        <div className="relative -top-6">
            <button 
              onClick={handlePlusClick}
              className="flex flex-col items-center justify-center w-14 h-14 bg-blue-600 rounded-full shadow-lg shadow-blue-600/30 text-white mb-1 transition-transform active:scale-95"
            >
              <Plus size={28} strokeWidth={2.5} />
            </button>
            <span className="text-[10px] font-bold text-slate-900 w-full text-center block absolute -bottom-4 whitespace-nowrap">Sell/Rent</span>
        </div>

        {/* Favorites (formerly Shortlisted) */}
        <button 
          onClick={handleFavoritesClick}
          className={`flex flex-col items-center gap-1 ${isActive('/dashboard/profile/favorites') ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <Heart size={20} strokeWidth={isActive('/dashboard/profile/favorites') ? 2.5 : 2} />
          <span className="text-[10px] font-bold">Favorites</span>
        </button>

        {/* Profile */}
        <Link href="/dashboard/profile/settings" className={`flex flex-col items-center gap-1 ${isActive('/dashboard/profile/settings') ? 'text-blue-600' : 'text-slate-400'}`}>
          <User size={20} strokeWidth={isActive('/dashboard/profile/settings') ? 2.5 : 2} />
          <span className="text-[10px] font-bold">Profile</span>
        </Link>
      </div>
    </div>
  );
};
