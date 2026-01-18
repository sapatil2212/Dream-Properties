'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { PhoneCall, CalendarCheck, Filter, MessageSquare, ArrowUpRight, Users } from 'lucide-react';
import { Card, Badge, Button, Input, StatCard, Skeleton, Select, EmptyState, Modal, DataTable, Alert } from '@/components/UIComponents';

export function TelecallerDashboard({ compact = false }: { compact?: boolean }) {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateTimeModal, setDateTimeModal] = useState<{
    type: 'followUp' | 'visit' | null;
    lead: any | null;
    date: string;
    time: string;
  }>({
    type: null,
    lead: null,
    date: '',
    time: '',
  });
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: session } = useSession();
  const userId = session?.user?.id;

  const fetchLeads = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      params.append('assignedTo', String(userId));
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`/api/leads${query}`);
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
    fetchLeads();
  }, [statusFilter, userId]);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'New').length;
  const visitLeads = leads.filter(l => l.status === 'Site Visit Scheduled').length;
  const interestedLeads = leads.filter(l => l.status === 'Interested').length;
  const followUpLeads = leads.filter(l => l.status === 'Follow-up').length;
  const calledLeads = leads.filter(l => l.status === 'Called').length;
  const notInterestedLeads = leads.filter(l => l.status === 'Not Interested').length;
  const closedLeads = leads.filter(l => l.status === 'Closed').length;

  const todayLeads = leads.filter(l => {
    const created = new Date(l.createdAt || l.created_at || l.date);
    return created >= startOfToday && created <= endOfToday;
  }).length;

  const queueLeads = leads.filter(l => !['Closed', 'Not Interested', 'Site Visit Scheduled'].includes(l.status));
  const myQueueCount = queueLeads.length;

  const callsDoneToday = leads.filter(l => {
    const timestampSource =
      l.lastContactAt ||
      l.updatedAt ||
      l.updated_at ||
      l.createdAt ||
      l.created_at ||
      l.date;
    if (!timestampSource) return false;
    const contact = new Date(timestampSource);
    return contact >= startOfToday && contact <= endOfToday && l.status !== 'New';
  }).length;

  const filteredLeads = leads.filter(l => {
    if (statusFilter && l.status !== statusFilter) {
      return false;
    }
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const nameMatch = l.name?.toLowerCase().includes(term);
    const phoneMatch = l.phone?.toLowerCase().includes(term);
    const propertyMatch = (l.propertyOfInterest || l.property?.title || '').toLowerCase().includes(term);
    return nameMatch || phoneMatch || propertyMatch;
  });

  const handleStatusChange = async (leadId: number, newStatus: string, note?: string, followUpAt?: string | null) => {
    setUpdatingId(leadId);
    try {
      const res = await fetch('/api/leads/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status: newStatus, lastNote: note })
      });
      if (res.ok) {
        const data = await res.json();
        const updated = data.lead || null;
        setLeads(prev =>
          prev.map(l =>
            l.id === leadId
              ? {
                  ...l,
                  status: updated?.status ?? newStatus,
                  lastNote: typeof updated?.lastNote === 'string' ? updated.lastNote : l.lastNote,
                  lastContactAt: updated?.lastContactAt ?? l.lastContactAt,
                  followUpAt: followUpAt ?? updated?.followUpAt ?? l.followUpAt
                }
              : l
          )
        );
        setStatusMessage({
          type: 'success',
          text: newStatus === 'Follow-up'
            ? 'Follow-up scheduled successfully'
            : newStatus === 'Closed'
            ? 'Lead closed successfully'
            : 'Lead status updated successfully'
        });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: 'Failed to update lead status. Please try again.'
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const openFollowUpModal = (lead: any) => {
    setDateTimeModal({
      type: 'followUp',
      lead,
      date: '',
      time: '',
    });
  };

  const openVisitModal = (lead: any) => {
    setDateTimeModal({
      type: 'visit',
      lead,
      date: '',
      time: '',
    });
  };

  const closeDateTimeModal = () => {
    setDateTimeModal({
      type: null,
      lead: null,
      date: '',
      time: '',
    });
  };

  const handleScheduleVisit = async (lead: any, visitDateIso: string) => {
    if (!userId) {
      alert('User session not available');
      return;
    }
    const parsed = new Date(visitDateIso);
    if (Number.isNaN(parsed.getTime())) {
      alert('Invalid date');
      return;
    }
    const targetStaffId = lead.salesExecutiveId || userId;
    setUpdatingId(lead.id);
    try {
      const res = await fetch('/api/site-visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          propertyId: lead.propertyId,
          staffId: targetStaffId,
          visitDate: parsed.toISOString(),
          notes: 'Scheduled from Telecaller Dashboard'
        })
      });
      if (res.ok) {
        setLeads(prev =>
          prev.map(l =>
            l.id === lead.id
              ? {
                  ...l,
                  status: 'Site Visit Scheduled'
                }
              : l
          )
        );
        setStatusMessage({
          type: 'success',
          text: 'Site visit scheduled successfully'
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: 'Failed to schedule site visit. Please try again.'
        });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: 'Failed to schedule site visit. Please try again.'
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const statusBreakdown = totalLeads > 0
    ? [
        { label: 'New', count: newLeads, color: 'bg-blue-500' },
        { label: 'Interested', count: interestedLeads, color: 'bg-emerald-500' },
        { label: 'Called', count: calledLeads, color: 'bg-sky-500' },
        { label: 'Follow-up', count: followUpLeads, color: 'bg-amber-500' },
        { label: 'Not Interested', count: notInterestedLeads, color: 'bg-slate-400' },
        { label: 'Site Visit', count: visitLeads, color: 'bg-indigo-500' },
        { label: 'Closed', count: closedLeads, color: 'bg-rose-500' },
      ].filter(item => item.count > 0)
    : [];

  const totalInBreakdown = statusBreakdown.reduce((sum, item) => sum + item.count, 0) || 1;

  return (
    <div className="space-y-8">
      {!compact && (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            label="My Queue"
            value={myQueueCount.toString()}
            trend={`${totalLeads} total leads`}
            icon={<PhoneCall size={20} className="text-blue-600" />}
            color="bg-blue-50"
          />
          <StatCard
            label="Calls Done"
            value={callsDoneToday.toString()}
            trend="Calls completed today"
            icon={<MessageSquare size={20} className="text-emerald-600" />}
            color="bg-emerald-50"
          />
          <StatCard
            label="Site Visits"
            value={visitLeads.toString()}
            trend="Scheduled"
            icon={<CalendarCheck size={20} className="text-amber-600" />}
            color="bg-amber-50"
          />
          <StatCard
            label="New Today"
            value={todayLeads.toString()}
            trend="Fresh leads captured"
            icon={<ArrowUpRight size={20} className="text-rose-600" />}
            color="bg-rose-50"
          />
        </div>
      )}

      {statusMessage && (
        <Alert
          isOpen={!!statusMessage}
          onClose={() => setStatusMessage(null)}
          type={statusMessage.type}
          title={statusMessage.type === 'success' ? 'Success' : 'Error'}
          message={statusMessage.text}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={`${compact ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-4`}>
          <Card>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-black uppercase tracking-tight text-slate-900">Work Through the Leads Assigned to You</h3>
              </div>
              <div className="flex gap-2 items-center">
                <Select
                  options={[
                    { label: 'All', value: '' },
                    { label: 'New', value: 'New' },
                    { label: 'Interested', value: 'Interested' },
                    { label: 'Called', value: 'Called' },
                    { label: 'Follow-up', value: 'Follow-up' },
                    { label: 'Not Interested', value: 'Not Interested' },
                    { label: 'Site Visit Scheduled', value: 'Site Visit Scheduled' },
                    { label: 'Closed', value: 'Closed' },
                  ]}
                  value={statusFilter}
                  onChange={(value: string) => setStatusFilter(value)}
                  className="w-40"
                  size="sm"
                />
                <Input
                  placeholder="Search name, phone or property..."
                  className="w-56"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="ghost" size="icon" className="border border-slate-100"><Filter size={16} /></Button>
              </div>
            </div>
            <div className="p-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : filteredLeads.length === 0 ? (
                <EmptyState
                  title={totalLeads === 0 ? 'No leads assigned yet' : 'No leads match filters'}
                  message={totalLeads === 0 ? 'Leads assigned to you will appear here in real time.' : 'Change status or search filters to see more leads.'}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredLeads.map(l => (
                    <div key={l.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{l.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{l.phone}</p>
                        </div>
                        <Badge variant={l.status === 'Closed' ? 'success' : l.status === 'New' ? 'info' : 'warning'}>
                          {l.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-tight text-slate-400 mb-1">Property</p>
                        <p className="text-xs font-black text-slate-700">
                          {l.propertyOfInterest || l.property?.title}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-tight text-slate-400 mb-1">Notes</p>
                        <p className="text-[11px] text-slate-500 line-clamp-3">
                          {l.lastNote ? l.lastNote : 'No notes added yet'}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        <Button
                          size="sm"
                          className="text-[10px] px-3 py-1 rounded-lg"
                          variant="outline"
                          onClick={() => handleStatusChange(l.id, 'Called')}
                          isLoading={updatingId === l.id}
                        >
                          Called
                        </Button>
                        <Button
                          size="sm"
                          className="text-[10px] px-3 py-1 rounded-lg"
                          variant="outline"
                          onClick={() => handleStatusChange(l.id, 'Interested')}
                          isLoading={updatingId === l.id}
                        >
                          Mark Interested
                        </Button>
                        <Button
                          size="sm"
                          className="text-[10px] px-3 py-1 rounded-lg"
                          variant="outline"
                          onClick={() => openFollowUpModal(l)}
                          disabled={updatingId === l.id}
                        >
                          Next Follow-up
                        </Button>
                        <Button
                          size="sm"
                          className="text-[10px] px-3 py-1 rounded-lg"
                          variant="outline"
                          onClick={() => openVisitModal(l)}
                          disabled={updatingId === l.id}
                        >
                          Site Visit
                        </Button>
                        <Button
                          size="sm"
                          className="text-[10px] px-3 py-1 rounded-lg"
                          variant="outline"
                          onClick={() => handleStatusChange(l.id, 'Not Interested')}
                          isLoading={updatingId === l.id}
                        >
                          Not Interested
                        </Button>
                        <Button
                          size="sm"
                          className="text-[10px] px-3 py-1 rounded-lg"
                          variant="outline"
                          onClick={() => handleStatusChange(l.id, 'Closed')}
                          isLoading={updatingId === l.id}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
          {!compact && (
          <Card>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-black uppercase tracking-tight text-slate-900">Follow-ups</h3>
                <p className="text-[11px] text-slate-500 font-medium mt-1">Leads marked for next follow-up</p>
              </div>
              <Badge variant="warning" className="text-[10px]">
                {followUpLeads} Pending
              </Badge>
            </div>
            <div className="p-6 space-y-3">
              {isLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : followUpLeads === 0 ? (
                <p className="text-[11px] text-slate-400 font-medium">
                  Leads you set for follow-up will appear here with their notes.
                </p>
              ) : (
                leads
                  .filter(l => l.status === 'Follow-up')
                  .map(l => {
                    const followUpLabel = (() => {
                      if (l.followUpAt) {
                        const d = new Date(l.followUpAt);
                        return Number.isNaN(d.getTime()) ? null : d.toLocaleString();
                      }
                      if (l.lastNote && typeof l.lastNote === 'string') {
                        const marker = 'Next follow-up on ';
                        const idx = l.lastNote.indexOf(marker);
                        if (idx !== -1) {
                          const raw = l.lastNote.slice(idx + marker.length).trim();
                          const d = new Date(raw);
                          if (!Number.isNaN(d.getTime())) {
                            return d.toLocaleString();
                          }
                        }
                      }
                      return null;
                    })();

                    return (
                      <div key={l.id} className="border border-amber-100 bg-amber-50/40 rounded-2xl p-3 flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900">{l.name}</p>
                          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-tight">
                            Follow-up
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500">{l.propertyOfInterest || l.property?.title}</p>
                        <p className="text-[10px] text-slate-400">{l.phone}</p>
                        {followUpLabel && (
                          <p className="text-[10px] text-amber-700 font-semibold">
                            Next: {followUpLabel}
                          </p>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          </Card>
          )}
        </div>

        {!compact && (
          <div className="lg:col-span-4 space-y-4">
            <Card className="p-6">
              <h3 className="font-black uppercase tracking-tight text-slate-900 mb-4">Today’s Snapshot</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-tight">
                  <span className="text-slate-500">New Leads Today</span>
                  <span className="text-slate-900">{todayLeads}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-tight">
                  <span className="text-slate-500">Pending Follow-ups</span>
                  <span className="text-slate-900">{followUpLeads}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-tight">
                  <span className="text-slate-500">Interested Leads</span>
                  <span className="text-slate-900">{interestedLeads}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-tight">
                  <span className="text-slate-500">Site Visits Scheduled</span>
                  <span className="text-slate-900">{visitLeads}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-black uppercase tracking-tight text-slate-900 mb-4">Lead Status Distribution</h3>
              <div className="space-y-4">
                {statusBreakdown.length === 0 ? (
                  <p className="text-[11px] text-slate-400 font-medium">
                    Leads assigned to you will appear here with their current status mix.
                  </p>
                ) : (
                  statusBreakdown.map(item => {
                    const percentage = Math.round((item.count / totalInBreakdown) * 100);
                    return (
                      <div key={item.label} className="space-y-2">
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-tight">
                          <span className="text-slate-500">{item.label}</span>
                          <span className="text-slate-900">
                            {item.count} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.color}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!dateTimeModal.type && !!dateTimeModal.lead}
        onClose={closeDateTimeModal}
        title={dateTimeModal.type === 'followUp' ? 'Schedule Next Follow-up' : 'Schedule Site Visit'}
      >
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-tight text-slate-400 mb-1">Lead</p>
            <p className="text-sm font-bold text-slate-900">
              {dateTimeModal.lead?.name}{' '}
              <span className="text-[11px] text-slate-400 font-medium">
                {dateTimeModal.lead?.phone}
              </span>
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              value={dateTimeModal.date}
              onChange={(e) =>
                setDateTimeModal(prev => ({ ...prev, date: e.target.value }))
              }
            />
            <Input
              label="Time"
              type="time"
              value={dateTimeModal.time}
              onChange={(e) =>
                setDateTimeModal(prev => ({ ...prev, time: e.target.value }))
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={closeDateTimeModal}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!dateTimeModal.type || !dateTimeModal.lead || !dateTimeModal.date || !dateTimeModal.time}
              isLoading={!!dateTimeModal.lead && updatingId === dateTimeModal.lead.id}
              onClick={async () => {
                const [year, month, day] = dateTimeModal.date.split('-').map(Number);
                const [hours, minutes] = dateTimeModal.time.split(':').map(Number);
                const scheduled = new Date(year, month - 1, day, hours || 0, minutes || 0, 0, 0);
                const iso = scheduled.toISOString();

                if (dateTimeModal.type === 'followUp') {
                  const formatted = scheduled.toLocaleString();
                  const note = `Next follow-up on ${formatted}`;
                  await handleStatusChange(dateTimeModal.lead.id, 'Follow-up', note, iso);
                } else if (dateTimeModal.type === 'visit') {
                  await handleScheduleVisit(dateTimeModal.lead, iso);
                }

                closeDateTimeModal();
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function SalesExecutiveDashboard() {
  const [visits, setVisits] = useState<any[]>([]);
  const [allVisits, setAllVisits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('Scheduled');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [updateModal, setUpdateModal] = useState<{ visit: any | null; leadStatus: string; remark: string }>({
    visit: null,
    leadStatus: 'Interested',
    remark: ''
  });
  const [updatingVisitId, setUpdatingVisitId] = useState<number | null>(null);

  const fetchAllVisits = async () => {
    try {
      const response = await fetch('/api/site-visits');
      if (response.ok) {
        const data = await response.json();
        setAllVisits(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVisits = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`/api/site-visits${query}`);
      if (response.ok) {
        const data = await response.json();
        setVisits(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllVisits();
  }, []);

  useEffect(() => {
    fetchVisits();
  }, [statusFilter]);

  const groupedByDate = visits.reduce((acc: any, visit: any) => {
    const dateKey = new Date(visit.visitDate).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(visit);
    return acc;
  }, {});

  const filteredVisits = visits.filter((visit: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const clientMatch = visit.lead?.name?.toLowerCase().includes(term);
    const phoneMatch = visit.lead?.phone?.toLowerCase().includes(term);
    const propertyMatch = visit.property?.title?.toLowerCase().includes(term);
    return clientMatch || phoneMatch || propertyMatch;
  });

  const calendarDays = Object.keys(groupedByDate);

  const totalVisitsAll = allVisits.length;

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const thisWeekVisitsCount = allVisits.filter((visit: any) => {
    const date = new Date(visit.visitDate);
    if (Number.isNaN(date.getTime())) return false;
    return date >= startOfWeek && date <= endOfWeek;
  }).length;

  const hotLeadsCount = allVisits.filter((visit: any) => {
    const status = visit.lead?.status;
    return status === 'Interested' || status === 'Follow-up';
  }).length;

  const openUpdateModal = (visit: any) => {
    const initialStatus =
      visit.lead?.status === 'Interested' ||
      visit.lead?.status === 'Not Interested' ||
      visit.lead?.status === 'Closed'
        ? visit.lead.status
        : 'Interested';
    setUpdateModal({
      visit,
      leadStatus: initialStatus,
      remark: ''
    });
  };

  const closeUpdateModal = () => {
    setUpdateModal({
      visit: null,
      leadStatus: 'Interested',
      remark: ''
    });
  };

  const handleUpdateOutcome = async () => {
    if (!updateModal.visit) return;
    setUpdatingVisitId(updateModal.visit.id);
    try {
      const res = await fetch('/api/site-visits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitId: updateModal.visit.id,
          visitStatus: 'Completed',
          leadStatus: updateModal.leadStatus,
          remark: updateModal.remark
        })
      });

      if (res.ok) {
        const data = await res.json();
        const updatedVisit = data.visit || data;
        setVisits(prev => prev.map(v => (v.id === updatedVisit.id ? updatedVisit : v)));
        setAllVisits(prev => prev.map(v => (v.id === updatedVisit.id ? updatedVisit : v)));
        setStatusMessage({
          type: 'success',
          text: 'Visit outcome updated successfully'
        });
        closeUpdateModal();
      } else {
        setStatusMessage({
          type: 'error',
          text: 'Failed to update visit outcome. Please try again.'
        });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: 'Failed to update visit outcome. Please try again.'
      });
    } finally {
      setUpdatingVisitId(null);
    }
  };

  return (
    <div className="space-y-8">
      {statusMessage && (
        <Alert
          isOpen={!!statusMessage}
          onClose={() => setStatusMessage(null)}
          type={statusMessage.type}
          title={statusMessage.type === 'success' ? 'Success' : 'Error'}
          message={statusMessage.text}
        />
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Site Visits" value={totalVisitsAll.toString()} trend="All Time" icon={<CalendarCheck size={20} className="text-blue-600" />} color="bg-blue-50" />
        <StatCard label="Site Visits" value={thisWeekVisitsCount.toString()} trend="This Week" icon={<CalendarCheck size={20} className="text-emerald-600" />} color="bg-emerald-50" />
        <StatCard label="Hot Leads" value={hotLeadsCount.toString()} trend="To Follow-up" icon={<Users size={20} className="text-rose-600" />} color="bg-rose-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <Card>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black uppercase tracking-tight text-slate-900">Upcoming Site Visits</h3>
              <div className="flex gap-2 items-center">
                <Select
                  options={[
                    { label: 'Scheduled', value: 'Scheduled' },
                    { label: 'Confirmed', value: 'Confirmed' },
                    { label: 'Completed', value: 'Completed' },
                    { label: 'All', value: '' },
                  ]}
                  value={statusFilter}
                  onChange={(value: string) => setStatusFilter(value)}
                  className="w-40"
                  size="sm"
                />
                <Input
                  placeholder="Search client, phone or property..."
                  className="w-56"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <DataTable headers={['Client', 'Property', 'Date & Time', 'Status', 'Outcome']}>
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center"><Skeleton className="h-4 w-full" /></td></tr>
              ) : filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400 font-bold">
                    {visits.length === 0
                      ? 'No visits scheduled yet - Your assigned visits will appear here'
                      : 'No visits match your search or filter'}
                  </td>
                </tr>
              ) : (
                filteredVisits.map((v, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-900">{v.lead?.name}</td>
                    <td className="px-6 py-4 text-xs font-black text-blue-600 uppercase">{v.property?.title}</td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600">{new Date(v.visitDate).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          v.status === 'Completed'
                            ? 'success'
                            : v.status === 'Confirmed'
                            ? 'info'
                            : 'warning'
                        }
                      >
                        {v.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        className="text-[10px] px-3 py-1 rounded-lg"
                        variant="outline"
                        onClick={() => openUpdateModal(v)}
                      >
                        Update Outcome
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </DataTable>
          </Card>

          <Card>
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-black uppercase tracking-tight text-slate-900">Visit Calendar</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Grouped view of all scheduled visits by day</p>
            </div>
            <div className="p-6 grid md:grid-cols-3 gap-4">
              {calendarDays.length === 0 ? (
                <p className="text-xs text-slate-400 font-bold">No visits scheduled on calendar</p>
              ) : (
                calendarDays.map((day) => (
                  <div key={day} className="border border-slate-100 rounded-lg p-3 bg-slate-50">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">{day}</p>
                    <div className="space-y-2">
                      {groupedByDate[day].map((v: any, idx: number) => (
                        <div key={idx} className="p-2 rounded-lg bg-white border border-slate-100">
                          <p className="text-xs font-bold text-slate-900">{v.lead?.name}</p>
                          <p className="text-[10px] text-slate-500">{new Date(v.visitDate).toLocaleTimeString()}</p>
                          <p className="text-[10px] text-blue-600 font-semibold truncate">{v.property?.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <Card className="p-6">
            <h3 className="font-black uppercase tracking-tight text-slate-900 mb-4">Visits Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-tight">
                <span className="text-slate-500">Total Visits</span>
                <span className="text-slate-900">{totalVisitsAll}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-tight">
                <span className="text-slate-500">Scheduled</span>
                <span className="text-slate-900">{allVisits.filter(v => v.status === 'Scheduled').length}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-tight">
                <span className="text-slate-500">Confirmed</span>
                <span className="text-slate-900">{allVisits.filter(v => v.status === 'Confirmed').length}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-tight">
                <span className="text-slate-500">Completed</span>
                <span className="text-slate-900">{allVisits.filter(v => v.status === 'Completed').length}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <Modal
        isOpen={!!updateModal.visit}
        onClose={closeUpdateModal}
        title="Update Visit Outcome"
      >
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-tight text-slate-400 mb-1">Visit</p>
            <p className="text-sm font-bold text-slate-900">
              {updateModal.visit?.lead?.name}{' '}
              <span className="text-[11px] text-slate-400 font-medium">
                {updateModal.visit?.lead?.phone}
              </span>
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {updateModal.visit?.property?.title}
            </p>
            {updateModal.visit && (
              <p className="text-[11px] text-slate-400 font-medium">
                {new Date(updateModal.visit.visitDate).toLocaleString()}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              options={[
                { label: 'Interested', value: 'Interested' },
                { label: 'Not Interested', value: 'Not Interested' },
                { label: 'Closed', value: 'Closed' }
              ]}
              value={updateModal.leadStatus}
              onChange={(value: string) =>
                setUpdateModal(prev => ({
                  ...prev,
                  leadStatus: value
                }))
              }
              className="w-full"
              size="sm"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">
              Remarks
            </label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-xs font-medium min-h-[80px]"
              placeholder="Add visit outcome and customer feedback"
              value={updateModal.remark}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setUpdateModal(prev => ({
                  ...prev,
                  remark: e.target.value
                }))
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={closeUpdateModal}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              isLoading={!!updateModal.visit && updatingVisitId === updateModal.visit.id}
              onClick={handleUpdateOutcome}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
