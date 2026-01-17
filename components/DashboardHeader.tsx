'use client';

import React, { useState } from 'react';
import { LayoutGrid, Search, Bell, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

interface DashboardHeaderProps {
  title: string;
  user: {
    name: string;
    role: string;
  };
}

export function DashboardHeader({ title, user }: DashboardHeaderProps) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      // Search properties
      const response = await fetch(`/api/properties/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-slate-50 rounded-lg text-slate-400 hidden lg:block">
           <LayoutGrid size={18} />
        </div>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </div>

      <div className="flex items-center gap-6">
        {/* Search Bar with Results */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
            onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 w-64 transition-all"
          />
          
          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-lg border border-slate-200 max-h-96 overflow-y-auto z-50">
              {isSearching ? (
                <div className="p-4 text-center text-sm text-slate-500">Searching...</div>
              ) : searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((result: any) => (
                    <Link
                      key={result.id}
                      href={`/properties/${result.id}`}
                      className="block px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                    >
                      <p className="font-semibold text-sm text-slate-900">{result.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{result.location} • {result.price}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-slate-500">
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl relative transition-all">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
          </button>
          
          <div className="h-6 w-px bg-slate-100 mx-2"></div>
          
          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-3 pl-2 group cursor-pointer"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900 leading-tight">{user.name}</p>
                <p className="text-xs text-slate-500">{user.role.replace('_', ' ')}</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 group-hover:border-blue-400 group-hover:bg-blue-50 transition-all overflow-hidden">
                <User size={20} className="text-slate-400 group-hover:text-blue-600" />
              </div>
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-[100]">
                <Link
                  href={user.role === 'USER' || user.role === 'BUYER' ? '/dashboard/profile/settings' : '/dashboard/settings'}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                  onClick={() => setShowProfileDropdown(false)}
                >
                  <Settings size={18} className="text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">Profile Settings</span>
                </Link>
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    signOut({ callbackUrl: '/' });
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-rose-50 transition-colors w-full text-left"
                >
                  <LogOut size={18} className="text-rose-500" />
                  <span className="text-sm font-medium text-rose-600">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
