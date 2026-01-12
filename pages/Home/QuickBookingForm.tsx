import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, PlusCircle } from 'lucide-react';
import { Button, Select } from '../../components/UIComponents.tsx';
import { Link } from 'react-router-dom';

export const QuickBookingForm: React.FC = () => {
  const [activeTab, setActiveTab] = useState("buy");

  const tabs = [
    { id: "buy", label: "Buy" },
    { id: "rent", label: "Rent" },
    { id: "new-launch", label: "New Launch", badge: true },
    { id: "commercial", label: "Commercial" },
    { id: "plots", label: "Plots/Land" },
    { id: "projects", label: "Projects" },
  ];

  const propertyTypeOptions = [
    { label: 'All Residential', value: 'all' },
    { label: 'Apartment', value: 'apartment' },
    { label: 'Villa', value: 'villa' },
    { label: 'Plot', value: 'plot' },
    { label: 'Builder Floor', value: 'builder-floor' },
  ];

  const [propType, setPropType] = useState('all');

  return (
    <div className="absolute left-0 right-0 bottom-0 translate-y-1/2 z-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white rounded-2xl border border-gray-100 relative overflow-hidden">
          {/* Tabs Header */}
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 md:px-5 py-4 text-[10px] md:text-[11px] font-black uppercase transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-blue-600"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {tab.label}
                    {tab.badge && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    )}
                  </span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabUnderline"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"
                    />
                  )}
                </button>
              ))}
            </div>
            
            {/* Post Property Link */}
            <Link 
              to="/login" 
              className="hidden md:flex items-center gap-1.5 px-5 py-4 text-[11px] font-black uppercase tracking-[0.15em] text-slate-700 hover:text-emerald-600 transition-colors whitespace-nowrap border-l border-gray-100"
            >
              <PlusCircle size={14} />
              <span>Post Property</span>
              <span className="relative overflow-hidden bg-emerald-500 text-white text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                FREE
                <span className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              </span>
            </Link>
          </div>

          {/* Search Form */}
          <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-3 items-center">
              <div className="w-full md:w-[200px]">
                <Select
                  options={propertyTypeOptions}
                  value={propType}
                  onChange={setPropType}
                  className="h-12 border border-gray-100 bg-gray-50/50 rounded-xl shadow-none"
                />
              </div>

              <div className="flex-1 w-full relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                  <Search size={18} />
                </div>
                <input
                  placeholder='Search "Flats in Nashik Road"'
                  className="w-full pl-11 pr-4 h-12 text-xs font-bold border-none bg-gray-50/50 rounded-xl focus:ring-0 transition-all outline-none"
                />
              </div>

              <Button size="lg" className="h-12 px-10 font-black uppercase tracking-widest text-[10px] w-full md:w-auto shadow-none">
                Search
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
