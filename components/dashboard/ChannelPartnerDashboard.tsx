'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Button } from '@/components/UIComponents';
import { Users, DollarSign, CheckCircle, Clock, Plus, FileText, Eye, Download } from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function ChannelPartnerDashboard() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    closedDeals: 0,
    pendingCommission: 0,
    totalPaid: 0
  });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  const [agreementContent, setAgreementContent] = useState('');
  const [signatureUrl, setSignatureUrl] = useState('');
  const [logoBase64, setLogoBase64] = useState('');
  const agreementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Preload logo for PDF
    const img = new Image();
    img.src = '/assets/dp-logo.png';
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(img, 0, 0);
            setLogoBase64(canvas.toDataURL('image/png'));
        }
    };

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // We will need a specific endpoint for dashboard stats or reuse existing ones
        // For now, let's fetch leads to count them
        const leadsRes = await fetch('/api/leads');
        const leadsData = await leadsRes.json();

        // Fetch profile to get commission rate and details
        try {
            const profileRes = await fetch('/api/profile/me');
            if (profileRes.ok) {
                const profile = await profileRes.json();
                setPartnerProfile(profile);
            }
        } catch (e) {
            console.error('Error fetching profile', e);
        }

        // Fetch Agreement Terms
        try {
            const termsRes = await fetch('/api/settings?key=channel_partner_agreement_terms');
            if (termsRes.ok) {
                const data = await termsRes.json();
                setAgreementContent(data.value || getDefaultAgreement());
            } else {
                setAgreementContent(getDefaultAgreement());
            }
        } catch (e) {
            console.error('Error fetching terms', e);
            setAgreementContent(getDefaultAgreement());
        }

        // Fetch Authorized Signature
        try {
            const sigRes = await fetch('/api/settings?key=authorized_signatory_signature');
            if (sigRes.ok) {
                const data = await sigRes.json();
                if (data.value) setSignatureUrl(data.value);
            }
        } catch (e) {
            console.error('Error fetching signature', e);
        }

        // Mocking commission data for now as we haven't built the commission API fully yet
        // In a real scenario, we would fetch from /api/commissions/summary
        
        const myLeads = Array.isArray(leadsData) ? leadsData : [];
        const closed = myLeads.filter((l: any) => l.status === 'Closed').length;

        // Fetch commissions if endpoint exists, else use 0
        let commissions = { pending: 0, paid: 0 };
        try {
            const commRes = await fetch('/api/commissions/summary');
            if (commRes.ok) {
                const commData = await commRes.json();
                commissions = commData;
            }
        } catch (e) {
            // endpoint might not exist yet
        }

        setStats({
          totalLeads: myLeads.length,
          closedDeals: closed,
          pendingCommission: commissions.pending,
          totalPaid: commissions.paid
        });

        setRecentLeads(myLeads.slice(0, 5));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const processedAgreementContent = React.useMemo(() => {
    let content = agreementContent;
    
    // Auto-convert plain text newlines to <br/> if no HTML tags are detected
    if (content && !/<[a-z][\s\S]*>/i.test(content)) {
        content = content.replace(/\n/g, '<br/>');
    }

    const effectiveDate = partnerProfile?.createdAt 
        ? new Date(partnerProfile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
        : new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    
    content = content.replace(/{{EFFECTIVE_DATE}}/g, effectiveDate);
    content = content.replace(/{{PARTNER_NAME}}/g, partnerProfile?.name || 'Partner');
    content = content.replace(/{{COMPANY_NAME}}/g, 'Dream Properties');
    
    return content;
  }, [agreementContent, partnerProfile]);

  const handleDownloadAgreement = async () => {
    if (!agreementRef.current) return;

    // Ensure html2canvas is available for jsPDF
    if (typeof window !== 'undefined' && !(window as any).html2canvas) {
        (window as any).html2canvas = html2canvas;
    }
    
    const doc = new jsPDF('p', 'pt', 'a4');
    
    // Calculate margins and usable height
    const margin = 40;
    const pageHeight = doc.internal.pageSize.getHeight();
    const footerHeight = 60; // Space reserved for footer
    
    await doc.html(agreementRef.current, {
        callback: function (pdf) {
            const totalPages = pdf.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                
                // Footer Line (Faint)
                pdf.setDrawColor(200, 200, 200);
                pdf.setLineWidth(0.5);
                pdf.line(margin, pageHeight - 40, 555, pageHeight - 40);
                
                // Add Logo to Footer (if possible)
                if (logoBase64) {
                    try {
                        pdf.addImage(logoBase64, 'PNG', margin, pageHeight - 35, 30, 10); // x, y, w, h
                    } catch (e) {
                        // fallback
                    }
                }

                // Footer Contact Info
                pdf.setFontSize(8);
                pdf.setTextColor(100);
                const pageWidth = pdf.internal.pageSize.getWidth();
                pdf.text('Dream Properties | +91 9876543210 | support@dreamproperties.com | www.dreamproperties.com', pageWidth / 2, pageHeight - 15, { align: 'center' });
            }
            pdf.save('Channel_Partner_Agreement.pdf');
        },
        x: margin,
        y: margin,
        width: 515, // A4 width 595 - 80 margin
        windowWidth: 800,
        margin: [margin, margin, footerHeight, margin], // Top, Right, Bottom, Left
        autoPaging: 'text'
    });
  };

  const statCards = [
    { label: 'Total Leads', value: stats.totalLeads, icon: <Users className="text-blue-600" size={24} />, bg: 'bg-blue-50' },
    { label: 'Closed Deals', value: stats.closedDeals, icon: <CheckCircle className="text-green-600" size={24} />, bg: 'bg-green-50' },
    { label: 'Pending Commission', value: `₹${stats.pendingCommission.toLocaleString()}`, icon: <Clock className="text-orange-600" size={24} />, bg: 'bg-orange-50' },
    { label: 'Total Paid', value: `₹${stats.totalPaid.toLocaleString()}`, icon: <DollarSign className="text-emerald-600" size={24} />, bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Partner Overview</h2>
          <p className="text-slate-500 text-sm">Welcome back! Here's your performance summary.</p>
        </div>
        <Link href="/dashboard/leads">
            <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus size={16} className="mr-2" /> Submit New Lead
            </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-4 border border-slate-100 hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-xl font-bold text-slate-900">{loading ? '...' : stat.value}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card className="border border-slate-100 h-full">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900">Recent Leads</h3>
                    <Link href="/dashboard/leads" className="text-xs text-blue-600 font-medium hover:underline">View All</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Property</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={4} className="p-4 text-center text-slate-500">Loading...</td></tr>
                            ) : recentLeads.length === 0 ? (
                                <tr><td colSpan={4} className="p-4 text-center text-slate-500">No leads found. Submit your first lead!</td></tr>
                            ) : (
                                recentLeads.map((lead: any) => (
                                    <tr key={lead.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-900">{lead.name}</td>
                                        <td className="px-4 py-3 text-slate-600">{lead.propertyOfInterest}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                                ${lead.status === 'Closed' ? 'bg-green-100 text-green-700' : 
                                                  lead.status === 'New' ? 'bg-blue-100 text-blue-700' : 
                                                  'bg-slate-100 text-slate-600'}`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 text-xs">
                                            {new Date(lead.createdAt || lead.date).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
        <div>
            <Card className="border border-slate-100 h-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>

                <div className="relative z-10">
                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                        <FileText size={20} className="text-blue-200" />
                        Partner Agreement
                    </h3>
                    <p className="text-blue-100 text-xs mb-6 opacity-90">
                        Ensure you are familiar with our commission structure and policies.
                    </p>

                    {/* PDF Preview Card */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20 hover:bg-white/20 transition-colors group cursor-pointer">
                        <div className="flex items-start gap-3">
                            <div className="bg-red-500 rounded-lg p-2 text-white shadow-lg group-hover:scale-105 transition-transform">
                                <FileText size={24} />
                                <span className="text-[8px] font-bold block text-center mt-1">PDF</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-white truncate">Channel_Partner_Agreement.pdf</p>
                                <p className="text-xs text-blue-200 mt-1">2.4 MB • Updated Jan 15, 2024</p>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button size="sm" variant="secondary" className="h-8 text-xs w-full bg-white/90 text-blue-700 hover:bg-white border-none">
                                <Eye size={12} className="mr-1.5" /> View
                            </Button>
                            <Button size="sm" variant="secondary" className="h-8 text-xs w-full bg-blue-500/30 text-white hover:bg-blue-500/50 border-none backdrop-blur-md" onClick={handleDownloadAgreement}>
                                <Download size={12} className="mr-1.5" /> Download
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-3 bg-black/20 rounded-xl p-4 border border-white/10">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-blue-200 text-xs uppercase tracking-wider font-semibold">Commission Rate</span>
                            <span className="font-bold text-xl text-emerald-300">
                                {partnerProfile?.channelPartner?.commissionRate 
                                    ? `${partnerProfile.channelPartner.commissionRate}%` 
                                    : '2.0%'}
                            </span>
                        </div>
                        <div className="w-full h-px bg-white/10"></div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-blue-200 text-xs uppercase tracking-wider font-semibold">Payout Cycle</span>
                            <span className="font-bold">Weekly</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-blue-200 text-xs uppercase tracking-wider font-semibold">Support</span>
                            <span className="font-bold text-xs">partners@dream.com</span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
      </div>

      {/* Hidden PDF Template */}
      <div style={{ position: 'absolute', top: -10000, left: -10000 }}>
        <div ref={agreementRef} style={{ width: '800px', padding: '40px', fontFamily: 'Arial, sans-serif', color: '#333', background: 'white' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/dp-logo.png" alt="Logo" style={{ height: '60px', marginBottom: '20px' }} />
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>Channel Partner Agreement</h1>
            </div>
            
            <div dangerouslySetInnerHTML={{ __html: processedAgreementContent }} style={{ lineHeight: '1.6', fontSize: '14px', marginBottom: '50px', textAlign: 'justify' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '80px', alignItems: 'flex-end' }}>
                <div>
                    {signatureUrl ? (
                        <div style={{ marginBottom: '10px' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={signatureUrl} alt="Authorized Signature" style={{ height: '60px', objectFit: 'contain' }} />
                        </div>
                    ) : (
                        <div style={{ height: '60px' }}></div>
                    )}
                    <div style={{ width: '200px', borderTop: '1px solid #333', marginBottom: '5px' }}></div>
                    <p style={{ fontSize: '12px', fontWeight: 'bold' }}>Authorized Signatory<br/><span style={{fontWeight: 'normal'}}>Dream Properties</span></p>
                </div>
                {/* Channel Partner Signature Removed as per request */}
            </div>
        </div>
      </div>
    </div>
  );
}

function getDefaultAgreement() {
    return `This Agreement is entered on <strong>{{EFFECTIVE_DATE}}</strong> between <strong>Dream Properties</strong>, owner of a real estate SaaS platform, and <strong>{{PARTNER_NAME}}</strong> (“Partner”).

<br/><br/>

<h3>1. APPOINTMENT</h3>
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
