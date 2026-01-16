import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, PlusCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const QuickBookingForm: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("buy");
  const [searchQuery, setSearchQuery] = useState('');
  const [propType, setPropType] = useState('all');

  const tabs = [
    { id: "buy", label: "Buy" },
    { id: "rent", label: "Rent" },
    { id: "lease", label: "Lease" },
  ];

  const propertyTypeOptions = [
    { label: 'All Residential', value: 'all' },
    { label: 'Apartment', value: 'apartment' },
    { label: 'Villa', value: 'villa' },
    { label: 'Plot', value: 'plot' },
    { label: 'Builder Floor', value: 'builder-floor' },
  ];

  // Map tab to listing_type
  const getListingType = () => {
    if (activeTab === 'buy') return 'Sell';
    if (activeTab === 'rent') return 'Rent';
    if (activeTab === 'lease') return 'Lease';
    return null;
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    
    const listingType = getListingType();
    if (listingType) {
      params.set('listing_type', listingType);
    }
    
    if (propType && propType !== 'all') {
      params.set('type', propType);
    }
    
    navigate(`/properties/search?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative z-20 px-4 pb-8 md:pb-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-5xl mx-auto"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/60 relative overflow-hidden">
          {/* Subtle gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-blue-50/20 pointer-events-none"></div>
          
          {/* Tabs Header */}
          <div className="relative flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-6 md:px-8 py-3 text-[10px] md:text-[11px] font-bold uppercase tracking-wide transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-blue-600"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <span className="relative z-10">{tab.label}</span>
                  {activeTab === tab.id && (
                    <>
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500"
                      />
                      <motion.div
                        layoutId="activeTabBg"
                        className="absolute inset-0 bg-blue-50/40"
                      />
                    </>
                  )}
                </button>
              ))}
            </div>
            
            {/* Post Property Link - Desktop */}
            <Link 
              to="/login" 
              className="hidden md:flex items-center gap-2 px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-700 hover:text-emerald-600 transition-all border-l border-slate-100 group relative z-10"
            >
              <PlusCircle size={14} className="group-hover:rotate-90 transition-transform duration-300" />
              <span>Post Property</span>
              <span className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
                FREE
                <span className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              </span>
            </Link>
          </div>

          {/* Search Form */}
          <div className="relative p-4 md:p-5">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
              {/* Mobile: Dropdown and Search side by side */}
              <div className="flex gap-2 md:hidden">
                <div className="w-[140px] relative z-50">
                  <Select value={propType} onValueChange={setPropType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
                    <Search size={16} />
                  </div>
                  <Input
                    placeholder='Search properties...'
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>
              </div>

              {/* Desktop: Original layout */}
              <div className="hidden md:flex md:w-[180px] relative z-50">
                <Select value={propType} onValueChange={setPropType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="hidden md:flex flex-1 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
                  <Search size={16} />
                </div>
                <Input
                  placeholder='Search "Flats in Nashik Road"'
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>

              {/* Search Button */}
              <Button
                size="lg"
                onClick={handleSearch}
                className="hidden md:flex md:w-auto"
              >
                Search
              </Button>
            </div>

            {/* Mobile: Search and Post Property side by side */}
            <div className="flex md:hidden gap-2 mt-3">
              <Button
                size="lg"
                onClick={handleSearch}
                className="flex-1"
              >
                Search
              </Button>
              
              <Link 
                to="/login" 
                className="flex flex-1 items-center justify-center gap-1.5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-700 hover:text-emerald-600 transition-all border border-slate-200 rounded-lg group bg-white shadow-sm whitespace-nowrap"
              >
                <PlusCircle size={14} className="group-hover:rotate-90 transition-transform duration-300" />
                <span>Post</span>
                <span className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
                  FREE
                  <span className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
