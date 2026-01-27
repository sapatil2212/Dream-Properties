'use client';

import React from 'react';
import { Card, Skeleton } from '@/components/UIComponents';
import { Eye, MapPin } from 'lucide-react';

interface MostViewedPropertyCardProps {
  property: {
    title: string;
    views: number;
    location: string;
    price: number;
  } | null;
  isLoading: boolean;
}

export function MostViewedPropertyCard({ property, isLoading }: MostViewedPropertyCardProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-32 w-full" />
      </Card>
    );
  }

  if (!property) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-white to-amber-50/30 border-slate-100 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-amber-50 rounded-lg">
          <Eye size={20} className="text-amber-600" />
        </div>
        <div>
          <h3 className="font-black text-slate-900 uppercase tracking-tight">Most Viewed Property</h3>
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">High Engagement Listing</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-bold text-slate-900 line-clamp-1">{property.title}</h4>
          <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
            <Eye size={12} />
            {property.views}
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-500 text-xs mb-3">
          <MapPin size={12} />
          <span className="truncate">{property.location}</span>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
          <p className="text-xs text-slate-400 font-medium">Current Price</p>
          <p className="text-sm font-black text-slate-900">
            ₹ {new Intl.NumberFormat('en-IN').format(property.price)}
          </p>
        </div>
      </div>
    </Card>
  );
}
