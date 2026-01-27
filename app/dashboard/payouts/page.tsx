'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '@/components/UIComponents';
import { Search, Plus, CheckCircle, ExternalLink } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function PayoutsPage() {
  const { data: session } = useSession();
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal States
  const [partners, setPartners] = useState<any[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [pendingCommissions, setPendingCommissions] = useState<any[]>([]);
  const [selectedCommissionIds, setSelectedCommissionIds] = useState<number[]>([]);
  const [payoutDetails, setPayoutDetails] = useState({
      transactionRef: '',
      paymentMode: 'Bank Transfer',
      notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'SAAS_OWNER'].includes(session?.user?.role || '');

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payouts');
      if (res.ok) {
        const data = await res.json();
        setPayouts(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  // Fetch partners when modal opens
  useEffect(() => {
      if (isModalOpen && isAdmin) {
          fetch('/api/channel-partners')
            .then(res => res.json())
            .then(data => setPartners(data))
            .catch(err => console.error(err));
      }
  }, [isModalOpen, isAdmin]);

  // Fetch commissions when partner selected
  useEffect(() => {
      if (selectedPartnerId) {
          fetch(`/api/commissions?partnerId=${selectedPartnerId}`)
            .then(res => res.json())
            .then(data => {
                // Filter only pending/approved commissions
                const pending = data.filter((c: any) => c.status !== 'Paid');
                setPendingCommissions(pending);
                setSelectedCommissionIds([]); // Reset selection
            })
            .catch(err => console.error(err));
      } else {
          setPendingCommissions([]);
      }
  }, [selectedPartnerId]);

  const handleCommissionToggle = (id: number) => {
      if (selectedCommissionIds.includes(id)) {
          setSelectedCommissionIds(selectedCommissionIds.filter(cid => cid !== id));
      } else {
          setSelectedCommissionIds([...selectedCommissionIds, id]);
      }
  };

  const calculateTotal = () => {
      return pendingCommissions
        .filter(c => selectedCommissionIds.includes(c.id))
        .reduce((sum, c) => sum + c.commissionAmount, 0);
  };

  const handleCreatePayout = async () => {
      if (!selectedPartnerId || selectedCommissionIds.length === 0 || !payoutDetails.transactionRef) {
          alert('Please fill all required fields');
          return;
      }

      setSubmitting(true);
      try {
          const res = await fetch('/api/payouts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  channelPartnerId: parseInt(selectedPartnerId),
                  commissionIds: selectedCommissionIds,
                  ...payoutDetails
              })
          });

          if (res.ok) {
              setIsModalOpen(false);
              fetchPayouts();
              // Reset form
              setSelectedPartnerId('');
              setSelectedCommissionIds([]);
              setPayoutDetails({ transactionRef: '', paymentMode: 'Bank Transfer', notes: '' });
          } else {
              const err = await res.json();
              alert(err.message || 'Failed to create payout');
          }
      } catch (error) {
          console.error(error);
          alert('Error creating payout');
      } finally {
          setSubmitting(false);
      }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payouts</h1>
          <p className="text-slate-500 text-sm">Manage partner payments</p>
        </div>
        {isAdmin && (
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsModalOpen(true)}>
                <Plus size={16} className="mr-2" /> New Payout
            </Button>
        )}
      </div>

      <Card className="overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">Date</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Partner</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Amount</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Mode / Ref</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Commissions</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading payouts...</td></tr>
              ) : payouts.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No payouts record found</td></tr>
              ) : (
                payouts.map(payout => (
                  <tr key={payout.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">
                        {new Date(payout.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                        {payout.channelPartner?.user?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                        ₹{payout.amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                        <div className="text-slate-900">{payout.paymentMode}</div>
                        <div className="text-xs text-slate-500 font-mono">{payout.transactionRef}</div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-600">
                            {payout.commissions?.length || 0} Deals
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1 justify-end w-fit ml-auto">
                            <CheckCircle size={12}/> {payout.status}
                        </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Payout Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
                  <h3 className="text-lg font-bold mb-4">Process New Payout</h3>
                  
                  <div className="space-y-4 overflow-y-auto flex-1 p-1">
                      {/* Step 1: Select Partner */}
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Select Partner</label>
                          <select 
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedPartnerId}
                            onChange={(e) => setSelectedPartnerId(e.target.value)}
                          >
                              <option value="">-- Choose Partner --</option>
                              {partners.map(p => (
                                  <option key={p.channelPartner?.id} value={p.channelPartner?.id}>
                                      {p.name} ({p.channelPartner?.city})
                                  </option>
                              ))}
                          </select>
                      </div>

                      {/* Step 2: Select Commissions */}
                      {selectedPartnerId && (
                          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                              <h4 className="text-sm font-semibold mb-2">Select Pending Commissions</h4>
                              {pendingCommissions.length === 0 ? (
                                  <p className="text-sm text-slate-500 italic">No pending commissions found for this partner.</p>
                              ) : (
                                  <div className="space-y-2 max-h-48 overflow-y-auto">
                                      {pendingCommissions.map(comm => (
                                          <div key={comm.id} className="flex items-center justify-between bg-white p-2 rounded border border-slate-200">
                                              <div className="flex items-center gap-3">
                                                  <input 
                                                    type="checkbox" 
                                                    className="h-4 w-4 text-blue-600 rounded"
                                                    checked={selectedCommissionIds.includes(comm.id)}
                                                    onChange={() => handleCommissionToggle(comm.id)}
                                                  />
                                                  <div>
                                                      <p className="text-sm font-medium">{comm.lead?.name}</p>
                                                      <p className="text-xs text-slate-500">{comm.lead?.propertyOfInterest}</p>
                                                  </div>
                                              </div>
                                              <div className="text-right">
                                                  <p className="text-sm font-bold">₹{comm.commissionAmount?.toLocaleString()}</p>
                                                  <p className="text-[10px] text-slate-400">{new Date(comm.createdAt).toLocaleDateString()}</p>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              )}
                              
                              {selectedCommissionIds.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
                                      <span className="text-sm font-medium">Selected Total:</span>
                                      <span className="text-lg font-bold text-blue-600">₹{calculateTotal().toLocaleString()}</span>
                                  </div>
                              )}
                          </div>
                      )}

                      {/* Step 3: Payment Details */}
                      {selectedCommissionIds.length > 0 && (
                          <div className="grid grid-cols-2 gap-4">
                              <Input 
                                label="Transaction Reference / ID"
                                placeholder="e.g. UPI-123456789"
                                value={payoutDetails.transactionRef}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPayoutDetails({...payoutDetails, transactionRef: e.target.value})}
                              />
                              <div>
                                  <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode</label>
                                  <select 
                                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={payoutDetails.paymentMode}
                                    onChange={(e) => setPayoutDetails({...payoutDetails, paymentMode: e.target.value})}
                                  >
                                      <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                                      <option value="UPI">UPI</option>
                                      <option value="Cheque">Cheque</option>
                                      <option value="Cash">Cash</option>
                                  </select>
                              </div>
                              <div className="col-span-2">
                                  <Input 
                                    label="Notes (Optional)"
                                    placeholder="Any remarks..."
                                    value={payoutDetails.notes}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPayoutDetails({...payoutDetails, notes: e.target.value})}
                                  />
                              </div>
                          </div>
                      )}
                  </div>

                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                      <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                      <Button 
                        className="bg-green-600 hover:bg-green-700" 
                        disabled={selectedCommissionIds.length === 0 || !payoutDetails.transactionRef || submitting}
                        onClick={handleCreatePayout}
                      >
                          {submitting ? 'Processing...' : 'Confirm Payout'}
                      </Button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
