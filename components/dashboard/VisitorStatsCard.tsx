'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Calendar, Monitor, Smartphone, Tablet, Globe, Clock } from 'lucide-react';
import { Card, Skeleton } from '@/components/UIComponents';

type TimeRange = 'day' | 'week' | 'month' | 'year';

interface VisitorStats {
  summary: {
    total: number;
    today: number;
    yesterday: number;
    week: number;
    month: number;
    year: number;
    uniqueToday: number;
  };
  deviceStats: { type: string; count: number }[];
  browserStats: { name: string; count: number }[];
  hourlyDistribution: number[];
  dailyStats: { date: string; count: number }[];
}

export function VisitorStatsCard() {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/visitors/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError('Failed to load visitor stats');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentValue = () => {
    if (!stats) return 0;
    switch (timeRange) {
      case 'day': return stats.summary.today;
      case 'week': return stats.summary.week;
      case 'month': return stats.summary.month;
      case 'year': return stats.summary.year;
      default: return stats.summary.today;
    }
  };

  const getPreviousValue = () => {
    if (!stats) return 0;
    switch (timeRange) {
      case 'day': return stats.summary.yesterday;
      case 'week': return Math.round(stats.summary.week / 7);
      case 'month': return Math.round(stats.summary.month / 30);
      case 'year': return Math.round(stats.summary.year / 365);
      default: return stats.summary.yesterday;
    }
  };

  const calculateTrend = () => {
    const current = getCurrentValue();
    const previous = getPreviousValue();
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'day': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      default: return 'Today';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="p-6">
        <div className="text-center text-slate-500">
          <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Unable to load visitor stats</p>
        </div>
      </Card>
    );
  }

  const trend = calculateTrend();
  const currentValue = getCurrentValue();
  const totalVisitors = stats.summary.total;

  // Get device icon
  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mobile': return <Smartphone size={14} className="text-blue-500" />;
      case 'tablet': return <Tablet size={14} className="text-purple-500" />;
      default: return <Monitor size={14} className="text-emerald-500" />;
    }
  };

  // Get top device
  const topDevice = stats.deviceStats.length > 0 
    ? stats.deviceStats.reduce((a, b) => a.count > b.count ? a : b)
    : null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-black uppercase tracking-tight text-slate-900">Website Visitors</h3>
            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
              {totalVisitors.toLocaleString()} total visits
            </p>
          </div>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {(['day', 'week', 'month', 'year'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-tight rounded-md transition-all ${
                timeRange === range
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-50 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={14} className="text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              {getTimeRangeLabel()}
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900">{currentValue.toLocaleString()}</p>
          <div className={`flex items-center gap-1 mt-1 text-[10px] font-bold ${
            trend >= 0 ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            <TrendingUp size={12} className={trend < 0 ? 'rotate-180' : ''} />
            <span>{trend >= 0 ? '+' : ''}{trend}%</span>
            <span className="text-slate-400 font-medium ml-1">vs previous</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-50 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
              Unique Today
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.summary.uniqueToday.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 font-medium mt-1">
            Distinct IP addresses
          </p>
        </motion.div>
      </div>

      {/* Device Stats */}
      {topDevice && (
        <div className="border-t border-slate-100 pt-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">
            Device Distribution (Last 30 Days)
          </p>
          <div className="space-y-2">
            {stats.deviceStats.slice(0, 3).map((device) => (
              <div key={device.type} className="flex items-center gap-3">
                {getDeviceIcon(device.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700 capitalize">{device.type}</span>
                    <span className="text-[10px] font-bold text-slate-500">
                      {device.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(device.count / stats.summary.month) * 100}%` }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className={`h-full rounded-full ${
                        device.type === 'mobile' ? 'bg-blue-500' :
                        device.type === 'tablet' ? 'bg-purple-500' : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={fetchStats}
        className="w-full mt-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
      >
        Refresh Stats
      </button>
    </Card>
  );
}
