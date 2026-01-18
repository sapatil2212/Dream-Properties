'use client';

import React, { useState } from 'react';
import { Button, Input } from '@/components/UIComponents';

interface PropertyInquiryFormProps {
  propertyId: number | string;
  propertyTitle: string;
  source: string;
  onSubmitted?: () => void;
}

export function PropertyInquiryForm({ propertyId, propertyTitle, source, onSubmitted }: PropertyInquiryFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [reasonToBuy, setReasonToBuy] = useState<'Investment' | 'Self Use' | ''>('');
  const [isDealer, setIsDealer] = useState<'yes' | 'no' | ''>('');
  const [dealerName, setDealerName] = useState('');
  const [planningTimeline, setPlanningTimeline] = useState<'now' | '3m' | '6m' | '6m_plus' | ''>('');
  const [interestedHomeLoan, setInterestedHomeLoan] = useState(false);
  const [interestedSiteVisit, setInterestedSiteVisit] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [otherMessage, setOtherMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !phone) {
      setError('Name, email and phone are required');
      return;
    }

    if (!reasonToBuy) {
      setError('Please select your reason to buy');
      return;
    }

    if (!isDealer) {
      setError('Please specify if you are a property dealer');
      return;
    }

    if (isDealer === 'yes' && !dealerName.trim()) {
      setError('Please enter dealer or firm name');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the Terms & Conditions and Privacy Policy');
      return;
    }

    setIsSubmitting(true);

    try {
      const basicLines = [
        `Reason to buy: ${reasonToBuy}`,
        `Property dealer: ${isDealer === 'yes' ? 'Yes' : 'No'}`,
        isDealer === 'yes' ? `Dealer / Firm Name: ${dealerName}` : null,
      ].filter(Boolean) as string[];

      const optionalLines: string[] = [];

      if (planningTimeline) {
        const label =
          planningTimeline === 'now'
            ? 'Now'
            : planningTimeline === '3m'
            ? 'Within 3 months'
            : planningTimeline === '6m'
            ? 'Within 6 months'
            : 'More than 6 months';
        optionalLines.push(`Planned purchase timeline: ${label}`);
      }

      if (interestedHomeLoan) {
        optionalLines.push('Interested in home loan: Yes');
      }

      if (interestedSiteVisit) {
        optionalLines.push('Interested in site visits: Yes');
      }

      if (otherMessage.trim()) {
        optionalLines.push(`Additional notes: ${otherMessage.trim()}`);
      }

      const messageParts: string[] = [];
      if (basicLines.length) {
        messageParts.push('BASIC INFORMATION', ...basicLines);
      }
      if (optionalLines.length) {
        messageParts.push('', 'OPTIONAL INFORMATION', ...optionalLines);
      }

      const payload = {
        name,
        email,
        phone,
        propertyId,
        propertyTitle,
        source,
        message: messageParts.join('\n'),
      };

      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess('Inquiry submitted successfully. Our team will contact you shortly.');
        setName('');
        setEmail('');
        setPhone('');
        setReasonToBuy('');
        setIsDealer('');
        setDealerName('');
        setPlanningTimeline('');
        setInterestedHomeLoan(false);
        setInterestedSiteVisit(false);
        setAgreeTerms(false);
        setOtherMessage('');
        if (onSubmitted) {
          onSubmitted();
        }
      } else {
        setError('Failed to submit inquiry. Please try again.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-3">
            <Input
              label="Name"
              placeholder="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Email"
              placeholder="your@email.com"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Phone No"
              placeholder="+91 988XX XXXXX"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Basic Information</p>
            <div className="space-y-3 rounded-xl border border-slate-200 p-3 bg-slate-50/40">
              <div>
                <p className="text-[10px] font-bold text-slate-700 mb-1">
                  Your reason to buy is
                </p>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-600">
                    <input
                      type="radio"
                      name="reasonToBuy"
                      className="h-3 w-3"
                      checked={reasonToBuy === 'Investment'}
                      onChange={() => setReasonToBuy('Investment')}
                    />
                    Investment
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-600">
                    <input
                      type="radio"
                      name="reasonToBuy"
                      className="h-3 w-3"
                      checked={reasonToBuy === 'Self Use'}
                      onChange={() => setReasonToBuy('Self Use')}
                    />
                    Self Use
                  </label>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-700 mb-1">
                  Are you a property dealer
                </p>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-600">
                    <input
                      type="radio"
                      name="isDealer"
                      className="h-3 w-3"
                      checked={isDealer === 'yes'}
                      onChange={() => setIsDealer('yes')}
                    />
                    Yes
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-600">
                    <input
                      type="radio"
                      name="isDealer"
                      className="h-3 w-3"
                      checked={isDealer === 'no'}
                      onChange={() => setIsDealer('no')}
                    />
                    No
                  </label>
                </div>
              </div>

              {isDealer === 'yes' && (
                <Input
                  label="Dealer / Firm Name"
                  placeholder="Name"
                  value={dealerName}
                  onChange={(e) => setDealerName(e.target.value)}
                />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Optional Information</p>
            <div className="space-y-3 rounded-xl border border-slate-200 p-3 bg-slate-50/40">
              <div>
                <p className="text-[10px] font-bold text-slate-700 mb-1">
                  By when you are planning to buy the property?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <label className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-600">
                    <input
                      type="checkbox"
                      className="h-3 w-3"
                      checked={planningTimeline === 'now'}
                      onChange={() => setPlanningTimeline(planningTimeline === 'now' ? '' : 'now')}
                    />
                    Now
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-600">
                    <input
                      type="checkbox"
                      className="h-3 w-3"
                      checked={planningTimeline === '3m'}
                      onChange={() => setPlanningTimeline(planningTimeline === '3m' ? '' : '3m')}
                    />
                    3 months
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-600">
                    <input
                      type="checkbox"
                      className="h-3 w-3"
                      checked={planningTimeline === '6m'}
                      onChange={() => setPlanningTimeline(planningTimeline === '6m' ? '' : '6m')}
                    />
                    6 months
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-600">
                    <input
                      type="checkbox"
                      className="h-3 w-3"
                      checked={planningTimeline === '6m_plus'}
                      onChange={() => setPlanningTimeline(planningTimeline === '6m_plus' ? '' : '6m_plus')}
                    />
                    More than 6 months
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-600">
                  <input
                    type="checkbox"
                    className="h-3 w-3"
                    checked={interestedHomeLoan}
                    onChange={(e) => setInterestedHomeLoan(e.target.checked)}
                  />
                  I am interested in home loan
                </label>
                <label className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-600">
                  <input
                    type="checkbox"
                    className="h-3 w-3"
                    checked={interestedSiteVisit}
                    onChange={(e) => setInterestedSiteVisit(e.target.checked)}
                  />
                  I am interested in site visits.
                </label>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Basic Information / Notes
                </label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 outline-none text-xs font-medium min-h-[70px]"
                  placeholder="Any additional details you would like to share..."
                  value={otherMessage}
                  onChange={(e) => setOtherMessage(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="inline-flex items-start gap-2 text-[9px] font-medium text-slate-600">
          <input
            type="checkbox"
            className="mt-[3px] h-3 w-3"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
          />
          <span>
            I agree to the Terms & Conditions and Privacy Policy
          </span>
        </label>
      </div>

      {error && (
        <p className="text-[10px] font-bold text-rose-600">
          {error}
        </p>
      )}
      {success && (
        <p className="text-[10px] font-bold text-emerald-600">
          {success}
        </p>
      )}

      <Button
        type="submit"
        className="w-full py-2.5 rounded-lg font-black uppercase tracking-widest text-xs"
        isLoading={isSubmitting}
      >
        Submit Inquiry
      </Button>
    </form>
  );
}
