'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, Badge, Button, Input, Skeleton } from '@/components/UIComponents';

type LeadStatus =
  | 'New'
  | 'Interested'
  | 'Called'
  | 'Follow-up'
  | 'Not Interested'
  | 'Site Visit Scheduled'
  | 'Closed';

const STATUS_META: { key: LeadStatus; label: string; colorClass: string }[] = [
  { key: 'New', label: 'New', colorClass: 'bg-blue-100 text-blue-700 border-blue-200' },
  { key: 'Interested', label: 'Interested', colorClass: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { key: 'Called', label: 'Called', colorClass: 'bg-sky-100 text-sky-700 border-sky-200' },
  { key: 'Follow-up', label: 'Follow-up', colorClass: 'bg-amber-100 text-amber-700 border-amber-200' },
  { key: 'Not Interested', label: 'Not Interested', colorClass: 'bg-slate-100 text-slate-700 border-slate-200' },
  { key: 'Site Visit Scheduled', label: 'Site Visit', colorClass: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { key: 'Closed', label: 'Closed', colorClass: 'bg-rose-100 text-rose-700 border-rose-200' },
];

export default function LeadsCalendarPage() {
  const { data: session } = useSession();
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [statusFilters, setStatusFilters] = useState<Record<LeadStatus, boolean>>(() => {
    const initial: Record<LeadStatus, boolean> = {
      New: true,
      Interested: true,
      Called: true,
      'Follow-up': true,
      'Not Interested': true,
      'Site Visit Scheduled': true,
      Closed: true,
    };
    return initial;
  });

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/leads');
      if (response.ok) {
        const data = await response.json();
        setLeads(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchLeads();
    }
  }, [session]);

  const visibleLeads = leads.filter(l => {
    const status: LeadStatus | undefined = l.status;
    if (!status || statusFilters[status] === false) {
      return false;
    }
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const nameMatch = l.name?.toLowerCase().includes(term);
    const phoneMatch = l.phone?.toLowerCase().includes(term);
    const propertyMatch = (l.propertyOfInterest || l.property?.title || '').toLowerCase().includes(term);
    return nameMatch || phoneMatch || propertyMatch;
  });

  const toDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const mm = month < 10 ? `0${month}` : `${month}`;
    const dd = day < 10 ? `0${day}` : `${day}`;
    return `${year}-${mm}-${dd}`;
  };

  const calendarCells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const firstWeekday = firstOfMonth.getDay();
    const startDate = new Date(year, month, 1 - firstWeekday);
    const cells: { date: Date; inCurrentMonth: boolean; key: string }[] = [];

    for (let i = 0; i < 42; i += 1) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const inCurrentMonth = d.getMonth() === month;
      const key = toDateKey(d);
      cells.push({ date: d, inCurrentMonth, key });
    }

    return cells;
  }, [currentMonth]);

  const leadsByDate = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const lead of visibleLeads) {
      let referenceDate: Date | null = null;

      if (lead.followUpAt) {
        const d = new Date(lead.followUpAt);
        if (!Number.isNaN(d.getTime())) {
          referenceDate = d;
        }
      }

      if (!referenceDate && lead.status === 'Follow-up' && lead.lastNote && typeof lead.lastNote === 'string') {
        const marker = 'Next follow-up on ';
        const idx = lead.lastNote.indexOf(marker);
        if (idx !== -1) {
          const raw = lead.lastNote.slice(idx + marker.length).trim();
          const d = new Date(raw);
          if (!Number.isNaN(d.getTime())) {
            referenceDate = d;
          }
        }
      }

      if (!referenceDate && lead.siteVisits && Array.isArray(lead.siteVisits) && lead.siteVisits.length > 0) {
        const scheduledVisits = lead.siteVisits.filter((v: any) => v.status === 'Scheduled');
        const visits = scheduledVisits.length > 0 ? scheduledVisits : lead.siteVisits;
        const nextVisit = visits.reduce((earliest: any, current: any) => {
          const currentDate = new Date(current.visitDate);
          if (!earliest) return current;
          const earliestDate = new Date(earliest.visitDate);
          return currentDate < earliestDate ? current : earliest;
        }, null as any);
        if (nextVisit) {
          const d = new Date(nextVisit.visitDate);
          if (!Number.isNaN(d.getTime())) {
            referenceDate = d;
          }
        }
      }

      if (!referenceDate) {
        referenceDate = new Date(lead.createdAt || lead.created_at || lead.date);
      }

      const key = toDateKey(referenceDate);
      if (!map[key]) map[key] = [];
      map[key].push(lead);
    }
    return map;
  }, [visibleLeads]);

  const monthLabel = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight">Calendar</h2>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Visual view of your leads by day and status</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-[10px] font-black uppercase tracking-widest px-3"
          >
            Default
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-[10px] font-black uppercase tracking-widest px-3 text-slate-400"
          >
            Heat map
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <div className="p-4 border-b border-slate-100">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Month</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Button type="button" size="icon" variant="ghost" onClick={handlePrevMonth}>
                  ‹
                </Button>
                <p className="text-sm font-semibold text-slate-900">{monthLabel}</p>
                <Button type="button" size="icon" variant="ghost" onClick={handleNextMonth}>
                  ›
                </Button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-semibold text-slate-400">
                {weekdays.map(d => (
                  <span key={d}>{d[0]}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {calendarCells.map(cell => {
                  const day = cell.date.getDate();
                  const isToday = (() => {
                    const now = new Date();
                    return (
                      cell.date.getFullYear() === now.getFullYear() &&
                      cell.date.getMonth() === now.getMonth() &&
                      cell.date.getDate() === now.getDate()
                    );
                  })();
                  return (
                    <div
                      key={cell.key}
                      className={`flex items-center justify-center h-7 rounded-md text-[10px] font-medium ${
                        cell.inCurrentMonth ? 'text-slate-700' : 'text-slate-300'
                      } ${isToday ? 'bg-blue-50 text-blue-600 border border-blue-200' : ''}`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4 border-b border-slate-100">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-500">Status</p>
            </div>
            <div className="p-4 space-y-2">
              {STATUS_META.map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() =>
                    setStatusFilters(prev => ({
                      ...prev,
                      [item.key]: !prev[item.key],
                    }))
                  }
                  className="w-full flex items-center justify-between text-left text-[11px] mb-1"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={statusFilters[item.key]}
                      onChange={() =>
                        setStatusFilters(prev => ({
                          ...prev,
                          [item.key]: !prev[item.key],
                        }))
                      }
                      className="h-3 w-3 rounded border-slate-300"
                    />
                    <span
                      className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${item.colorClass}`}
                    >
                      {item.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-9">
          <Card>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={handlePrevMonth}
                  className="rounded-full"
                >
                  ‹
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={handleNextMonth}
                  className="rounded-full"
                >
                  ›
                </Button>
                <p className="text-sm font-semibold text-slate-900 ml-2">{monthLabel}</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search name, phone or property..."
                  className="w-56"
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-[10px] font-black uppercase tracking-widest px-3"
                >
                  Month
                </Button>
              </div>
            </div>
            <div className="p-4">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-lg overflow-hidden text-[11px]">
                  {weekdays.map(d => (
                    <div
                      key={d}
                      className="bg-white px-2 py-1 font-semibold text-slate-400 uppercase tracking-widest"
                    >
                      {d}
                    </div>
                  ))}
                  {calendarCells.map(cell => {
                    const dayKey = cell.key;
                    const dayLeads = leadsByDate[dayKey] || [];
                    const dayNumber = cell.date.getDate();
                    const inCurrentMonth = cell.inCurrentMonth;
                    const isToday = (() => {
                      const now = new Date();
                      return (
                        cell.date.getFullYear() === now.getFullYear() &&
                        cell.date.getMonth() === now.getMonth() &&
                        cell.date.getDate() === now.getDate()
                      );
                    })();

                    return (
                      <div
                        key={dayKey}
                        className={`min-h-[90px] bg-white p-1.5 border-t border-l border-slate-100 ${
                          !inCurrentMonth ? 'bg-slate-50 text-slate-300' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-[10px] font-semibold ${
                              inCurrentMonth ? 'text-slate-600' : 'text-slate-300'
                            }`}
                          >
                            {dayNumber}
                          </span>
                          {isToday && (
                            <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-[9px] font-semibold text-blue-600">
                              Today
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          {dayLeads.slice(0, 3).map((lead: any) => {
                            const statusMeta = STATUS_META.find(s => s.key === lead.status);
                            return (
                              <div
                                key={lead.id}
                                className="rounded-md border border-slate-100 bg-slate-50 px-1.5 py-1"
                              >
                                <p className="text-[10px] font-semibold text-slate-900 truncate">
                                  {lead.name}
                                </p>
                                <p className="text-[9px] text-slate-400 truncate">
                                  {lead.propertyOfInterest || lead.property?.title}
                                </p>
                                {statusMeta && (
                                  <span
                                    className={`inline-block mt-0.5 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold ${statusMeta.colorClass}`}
                                  >
                                    {statusMeta.label}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                          {dayLeads.length > 3 && (
                            <p className="text-[9px] text-slate-400 font-medium">
                              +{dayLeads.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
