'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { User, Eye, Share2, Edit2 } from 'lucide-react';
import { Card, Badge, Button, Input, DataTable, Skeleton, Select, Modal } from '@/components/UIComponents';

export default function SiteVisitsPage() {
  const { data: session } = useSession();
  const [visits, setVisits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [staff, setStaff] = useState<any[]>([]);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [detailVisit, setDetailVisit] = useState<any | null>(null);
  const [editLead, setEditLead] = useState<any | null>(null);
  const [editVisitId, setEditVisitId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; email: string; phone: string; notes: string }>({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [isSavingLead, setIsSavingLead] = useState(false);

  const role = session?.user?.role;
  const isAdminView = role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'SAAS_OWNER';

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

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/superadmin/accounts-summary');
      if (response.ok) {
        const data = await response.json();
        setStaff(data.staff || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!isAdminView) return;
    fetchStaff();
  }, [isAdminView]);

  useEffect(() => {
    fetchVisits();
  }, [statusFilter]);

  const salesExecutives = staff.filter((s: any) => s.role === 'SALES_EXECUTIVE');

  const filteredVisits = visits.filter((v: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const leadName = v.lead?.name?.toLowerCase() || '';
    const phone = v.lead?.phone?.toLowerCase() || '';
    const propertyTitle = v.property?.title?.toLowerCase() || '';
    return leadName.includes(term) || phone.includes(term) || propertyTitle.includes(term);
  });

  const handleEditLeadSave = async () => {
    if (!editLead || !editVisitId) return;
    const payload = {
      leadId: editLead.id,
      name: editForm.name,
      email: editForm.email,
      phone: editForm.phone
    };
    setIsSavingLead(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const visitRes = await fetch('/api/site-visits', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitId: editVisitId,
            remark: editForm.notes
          })
        });

        if (visitRes.ok) {
          const visitData = await visitRes.json();
          const updatedVisit = visitData.visit || visitData;
          setVisits(prev =>
            prev.map(visit => (visit.id === updatedVisit.id ? updatedVisit : visit))
          );
          setDetailVisit(prev =>
            prev && prev.id === updatedVisit.id ? updatedVisit : prev
          );
          setEditLead(null);
          setEditVisitId(null);
        } else {
          alert('Failed to update visit notes');
        }
      } else {
        alert('Failed to update lead information');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating lead information');
    } finally {
      setIsSavingLead(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Site Visits</h2>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">
            Assign scheduled visits to your sales executives
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500"
              >
                <User size={14} />
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-600 flex items-center justify-center text-[8px] font-black text-white">
              +{visits.length}
            </div>
          </div>
        </div>
      </div>

      <Card>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-black uppercase tracking-tight text-slate-900">
            Upcoming Site Visits
          </h3>
          <div className="flex items-center gap-4">
            <Select
              options={[
                { label: 'Scheduled', value: 'Scheduled' },
                { label: 'Confirmed', value: 'Confirmed' },
                { label: 'Completed', value: 'Completed' },
                { label: 'All', value: '' }
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
        <DataTable
          headers={
            isAdminView
              ? ['Client', 'Property', 'Scheduled For', 'Sales Executive', 'Status', 'Actions']
              : ['Client', 'Property', 'Scheduled For', 'Status', 'Actions']
          }
        >
          {isLoading ? (
            <tr>
              <td
                colSpan={isAdminView ? 6 : 5}
                className="px-6 py-4 text-center text-slate-400 font-bold"
              >
                <Skeleton className="h-4 w-full" />
              </td>
            </tr>
          ) : filteredVisits.length === 0 ? (
            <tr>
              <td
                colSpan={isAdminView ? 6 : 5}
                className="px-6 py-8 text-center text-slate-400 font-bold"
              >
                {visits.length === 0
                  ? 'No site visits found'
                  : 'No site visits match your search or filter'}
              </td>
            </tr>
          ) : (
            filteredVisits.map((v: any) => {
              const currentAssignee = staff.find((s: any) => s.id === v.staffId);
              const salesExecutiveValue =
                currentAssignee && currentAssignee.role === 'SALES_EXECUTIVE'
                  ? currentAssignee.id.toString()
                  : '';

              return (
                <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{v.lead?.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      {v.lead?.phone}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-black text-slate-700">{v.property?.title}</p>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">
                    {new Date(v.visitDate).toLocaleString()}
                  </td>
                  {isAdminView && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <User size={12} />
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-[10px] font-bold text-slate-600">
                            {currentAssignee ? `${currentAssignee.name} (${currentAssignee.role})` : 'Unassigned'}
                          </p>
                          <Select
                            options={salesExecutives.map((s: any) => ({
                              label: `${s.name} (${s.role})`,
                              value: s.id.toString()
                            }))}
                            value={salesExecutiveValue}
                            onChange={async (value: string) => {
                              if (!value) return;
                              setAssigningId(v.id);
                              try {
                                const visitAssignRes = await fetch('/api/site-visits', {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ visitId: v.id, staffId: value })
                                });

                                if (visitAssignRes.ok) {
                                  const result = await visitAssignRes.json();
                                  const updatedVisit = result.visit || result;
                                  setVisits(prev =>
                                    prev.map(item => (item.id === v.id ? updatedVisit : item))
                                  );
                                } else {
                                  alert('Failed to assign site visit');
                                }
                              } catch (err) {
                                console.error(err);
                                alert('Error assigning site visit');
                              } finally {
                                setAssigningId(null);
                              }
                            }}
                            placeholder={assigningId === v.id ? 'Assigning...' : 'Assign sales executive...'}
                            className="text-[10px]"
                            size="sm"
                          />
                        </div>
                      </div>
                    </td>
                  )}
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
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-amber-600"
                        onClick={() => {
                          if (!v.lead) return;
                          setEditLead(v.lead);
                          setEditVisitId(v.id);
                          setEditForm({
                            name: v.lead.name || '',
                            email: v.lead.email || '',
                            phone: v.lead.phone || '',
                            notes: v.notes || ''
                          });
                        }}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-blue-600"
                        onClick={() => setDetailVisit(v)}
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-slate-400 hover:text-emerald-600"
                        onClick={async () => {
                          const when = new Date(v.visitDate).toLocaleString();
                          const title = v.property?.title || 'Property';
                          const name = v.lead?.name || 'Client';
                          const phone = v.lead?.phone || '';
                          const shareText = `Site Visit\nClient: ${name}\nPhone: ${phone}\nProperty: ${title}\nWhen: ${when}`;

                          try {
                            if (navigator.share) {
                              await navigator.share({
                                title: `Site Visit - ${title}`,
                                text: shareText
                              });
                            } else if (navigator.clipboard) {
                              await navigator.clipboard.writeText(shareText);
                              alert('Visit details copied to clipboard');
                            } else {
                              alert(shareText);
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                      >
                        <Share2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </DataTable>
      </Card>
      <Modal
        isOpen={!!detailVisit}
        onClose={() => setDetailVisit(null)}
        title="Site Visit Details"
      >
        <div className="p-6 space-y-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">
              Client
            </p>
            <p className="text-sm font-bold text-slate-900">
              {detailVisit?.lead?.name}{' '}
              <span className="text-[11px] text-slate-400 font-medium">
                {detailVisit?.lead?.phone}
              </span>
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              {detailVisit?.lead?.email}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">
              Property
            </p>
            <p className="text-xs font-bold text-slate-900">
              {detailVisit?.property?.title || 'Property'}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              {detailVisit?.property?.address ||
                detailVisit?.property?.location ||
                'Address not available'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-[11px]">
            <div>
              <p className="font-black uppercase tracking-widest text-slate-500 mb-1">
                Visit Date &amp; Time
              </p>
              <p className="font-semibold text-slate-900">
                {detailVisit?.visitDate
                  ? new Date(detailVisit.visitDate).toLocaleString()
                  : '-'}
              </p>
            </div>
            <div>
              <p className="font-black uppercase tracking-widest text-slate-500 mb-1">
                Visit Status
              </p>
              <p className="font-semibold text-slate-900">
                {detailVisit?.status}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-[11px]">
            <div>
              <p className="font-black uppercase tracking-widest text-slate-500 mb-1">
                Lead Status
              </p>
              <p className="font-semibold text-slate-900">
                {detailVisit?.lead?.status || '-'}
              </p>
            </div>
            <div>
              <p className="font-black uppercase tracking-widest text-slate-500 mb-1">
                Source
              </p>
              <p className="font-semibold text-slate-900">
                {detailVisit?.lead?.source || '-'}
              </p>
            </div>
            <div>
              <p className="font-black uppercase tracking-widest text-slate-500 mb-1">
                Lead Created
              </p>
              <p className="font-semibold text-slate-900">
                {detailVisit?.lead?.createdAt
                  ? new Date(detailVisit.lead.createdAt).toLocaleString()
                  : '-'}
              </p>
            </div>
            <div>
              <p className="font-black uppercase tracking-widest text-slate-500 mb-1">
                Last Contact
              </p>
              <p className="font-semibold text-slate-900">
                {detailVisit?.lead?.lastContactAt
                  ? new Date(detailVisit.lead.lastContactAt).toLocaleString()
                  : '-'}
              </p>
            </div>
            <div>
              <p className="font-black uppercase tracking-widest text-slate-500 mb-1">
                Follow-up On
              </p>
              <p className="font-semibold text-slate-900">
                {detailVisit?.lead?.followUpAt
                  ? new Date(detailVisit.lead.followUpAt).toLocaleString()
                  : '-'}
              </p>
            </div>
            <div>
              <p className="font-black uppercase tracking-widest text-slate-500 mb-1">
                Lead ID
              </p>
              <p className="font-semibold text-slate-900">
                {detailVisit?.lead?.id ? `#${detailVisit.lead.id}` : '-'}
              </p>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">
              Lead Notes
            </p>
            <p className="text-xs text-slate-600 whitespace-pre-line">
              {detailVisit?.lead?.lastNote || 'No notes added yet'}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">
              Visit Notes
            </p>
            <p className="text-xs text-slate-600 whitespace-pre-line">
              {detailVisit?.notes || 'No notes added yet'}
            </p>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={!!editLead}
        onClose={() => {
          if (isSavingLead) return;
          setEditLead(null);
          setEditVisitId(null);
        }}
        title="Edit Lead"
      >
        <div className="p-6 space-y-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">
              Lead Information
            </p>
            <p className="text-xs text-slate-500">
              Update the client details linked to this site visit.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Name"
              value={editForm.name}
              onChange={e =>
                setEditForm(prev => ({
                  ...prev,
                  name: e.target.value
                }))
              }
            />
            <Input
              label="Phone"
              value={editForm.phone}
              onChange={e =>
                setEditForm(prev => ({
                  ...prev,
                  phone: e.target.value
                }))
              }
            />
            <Input
              label="Email"
              value={editForm.email}
              onChange={e =>
                setEditForm(prev => ({
                  ...prev,
                  email: e.target.value
                }))
              }
            />
            <div className="md:col-span-2">
              <p className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-500 mb-1">
                Notes
              </p>
              <textarea
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-[13px] font-medium resize-y min-h-[80px] focus:border-blue-500 outline-none"
                value={editForm.notes}
                onChange={e =>
                  setEditForm(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (isSavingLead) return;
                setEditLead(null);
              }}
              disabled={isSavingLead}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleEditLeadSave} isLoading={isSavingLead}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
