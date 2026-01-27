'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Card, Button } from '@/components/UIComponents';
import { FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function PartnerAgreementPage() {
  const [agreementContent, setAgreementContent] = useState('');
  const [signatureUrl, setSignatureUrl] = useState('');
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const agreementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const profileRes = await fetch('/api/profile/me');
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setPartnerProfile(profile);
        }
        const termsRes = await fetch('/api/settings?key=channel_partner_agreement_terms');
        if (termsRes.ok) {
          const data = await termsRes.json();
          setAgreementContent(data.value || getDefaultAgreement());
        } else {
          setAgreementContent(getDefaultAgreement());
        }
        const sigRes = await fetch('/api/settings?key=authorized_signatory_signature');
        if (sigRes.ok) {
          const data = await sigRes.json();
          if (data.value) setSignatureUrl(data.value);
        }
      } catch (e) {
        setAgreementContent(getDefaultAgreement());
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDownload = async () => {
    if (!agreementRef.current) return;
    if (typeof window !== 'undefined' && !(window as any).html2canvas) {
      (window as any).html2canvas = html2canvas;
    }
    const doc = new jsPDF('p', 'pt', 'a4');
    await doc.html(agreementRef.current, {
      callback: function (pdf) {
        const totalPages = pdf.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.5);
          pdf.line(40, 800, 555, 800);
          pdf.setFontSize(8);
          pdf.setTextColor(100);
          pdf.text('Dream Properties | +91 9876543210 | support@dreamproperties.com | www.dreamproperties.com', 297, 825, { align: 'center' });
        }
        pdf.save('Channel_Partner_Agreement.pdf');
      },
      x: 40,
      y: 40,
      width: 515,
      windowWidth: 800
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
          <FileText size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Partner Agreement</h1>
          <p className="text-slate-500 text-sm">View and download your agreement</p>
        </div>
      </div>

      <Card className="p-6 border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800">Preview</h2>
          <Button onClick={handleDownload} disabled={loading}>
            <Download size={16} className="mr-2" /> Download PDF
          </Button>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <div className="max-w-3xl mx-auto bg-white rounded-lg p-6">
            <div className="flex items-center justify-center mb-4">
              <img src="/assets/dp-logo.png" alt="Logo" className="h-10" />
            </div>
            <div className="text-center font-bold text-slate-900 mb-4">Channel Partner Agreement</div>
            <div className="text-sm text-slate-600 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div><span className="font-semibold">Date:</span> {new Date().toLocaleDateString()}</div>
                <div><span className="font-semibold">Partner:</span> {partnerProfile?.name || ''}</div>
                <div><span className="font-semibold">Email:</span> {partnerProfile?.email || ''}</div>
              </div>
            </div>
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: agreementContent }} />
            <div className="mt-12">
              <div className="flex flex-col items-start">
                {signatureUrl && (
                  <img src={signatureUrl} alt="Authorized Signature" className="h-16 object-contain mb-2" />
                )}
                <div className="w-48 border-t border-slate-700 mb-1"></div>
                <div className="text-xs font-bold">Authorized Signatory</div>
                <div className="text-xs text-slate-600">Dream Properties</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div style={{ position: 'absolute', top: -10000, left: -10000 }}>
        <div ref={agreementRef} style={{ width: '800px', padding: '40px', fontFamily: 'Arial, sans-serif', color: '#333', background: 'white' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <img src="/assets/dp-logo.png" alt="Logo" style={{ height: '60px', marginBottom: '20px' }} />
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>Channel Partner Agreement</h1>
          </div>
          <div style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
            <p style={{ margin: '5px 0' }}><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
            <p style={{ margin: '5px 0' }}><strong>Partner Name:</strong> {partnerProfile?.name || ''}</p>
            <p style={{ margin: '5px 0' }}><strong>Email:</strong> {partnerProfile?.email || ''}</p>
          </div>
          <div dangerouslySetInnerHTML={{ __html: agreementContent }} style={{ lineHeight: '1.6', fontSize: '14px', marginBottom: '50px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '80px', alignItems: 'flex-end' }}>
            <div>
              {signatureUrl ? (
                <div style={{ marginBottom: '10px' }}>
                  <img src={signatureUrl} alt="Authorized Signature" style={{ height: '60px', objectFit: 'contain' }} />
                </div>
              ) : (
                <div style={{ height: '60px' }}></div>
              )}
              <div style={{ width: '200px', borderTop: '1px solid #333', marginBottom: '5px' }}></div>
              <p style={{ fontSize: '12px', fontWeight: 'bold' }}>Authorized Signatory<br/><span style={{fontWeight: 'normal'}}>Dream Properties</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getDefaultAgreement() {
  return `<h3>1. APPOINTMENT</h3>
<p>The Company hereby appoints the Channel Partner as its non-exclusive marketing partner for the promotion and sale of the Company's real estate projects. The Channel Partner accepts such appointment and agrees to perform the services in accordance with the terms and conditions of this Agreement.</p>

<h3>2. COMMISSION AND PAYMENT</h3>
<p>The Company shall pay the Channel Partner a commission as agreed upon for each successful sale concluded through the Channel Partner's efforts. Commission shall be payable only after the Company receives the full booking amount and the Agreement for Sale is registered.</p>

<h3>3. OBLIGATIONS OF CHANNEL PARTNER</h3>
<p>The Channel Partner shall:</p>
<ul>
  <li>Promote the Company's projects in a professional manner.</li>
  <li>Not misrepresent the Company or its projects to any prospective buyer.</li>
  <li>Comply with all applicable laws, including RERA regulations.</li>
</ul>

<h3>4. TERM AND TERMINATION</h3>
<p>This Agreement shall remain in force until terminated by either party with 30 days' written notice. The Company reserves the right to terminate this Agreement immediately in case of breach of any terms by the Channel Partner.</p>

<h3>5. CONFIDENTIALITY</h3>
<p>The Channel Partner agrees to keep confidential all proprietary information regarding the Company's business and projects.</p>`;
}
