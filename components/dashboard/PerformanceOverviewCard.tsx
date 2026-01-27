'use client';

import React from 'react';
import { Card, Skeleton } from '@/components/UIComponents';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface PerformanceOverviewCardProps {
  data: { date: string; count: number }[];
  isLoading: boolean;
}

export function PerformanceOverviewCard({ data, isLoading }: PerformanceOverviewCardProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-64 w-full" />
      </Card>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <Card className="p-6 bg-gradient-to-br from-white to-slate-50 border-slate-100 shadow-sm">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Graph Section */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 uppercase tracking-tight">Performance of the Month</h3>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Leads Generated Overview</p>
            </div>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  );
}
