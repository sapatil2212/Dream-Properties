'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button } from '@/components/UIComponents';
import { Save, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SystemSettingsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [agreementTerms, setAgreementTerms] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (session && !['ADMIN', 'SUPER_ADMIN', 'SAAS_OWNER'].includes(session.user.role)) {
            // Redirect will happen in layout or middleware usually, but good to have check here
            return;
        }

        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings?key=channel_partner_agreement_terms');
                if (res.ok) {
                    const data = await res.json();
                    setAgreementTerms(data.value || getDefaultAgreement());
                }
            } catch (error) {
                console.error('Failed to fetch settings', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (session) {
            fetchSettings();
        }
    }, [session]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: 'channel_partner_agreement_terms',
                    value: agreementTerms
                })
            });

            if (res.ok) {
                // simple alert for now, could use toast
                alert('Settings saved successfully!');
            } else {
                alert('Failed to save settings.');
            }
        } catch (error) {
            console.error(error);
            alert('Error saving settings.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading settings...</div>;

    if (!session || !['ADMIN', 'SUPER_ADMIN', 'SAAS_OWNER'].includes(session.user.role)) {
        return <div className="p-8 text-center text-red-500">Unauthorized access</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
                <p className="text-slate-500">Manage global system configurations and legal documents.</p>
            </div>

            <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800">Channel Partner Agreement Terms</h2>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                        Save Changes
                    </Button>
                </div>
                <p className="text-sm text-slate-500 mb-4">
                    Enter the legal terms and conditions for Channel Partners. This content will be used when generating the PDF agreement.
                    You can use HTML tags for formatting (e.g., &lt;b&gt;, &lt;br&gt;, &lt;ul&gt;, &lt;h3&gt;).
                </p>
                <textarea
                    className="w-full h-96 p-4 border border-slate-200 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    value={agreementTerms}
                    onChange={(e) => setAgreementTerms(e.target.value)}
                    placeholder="Enter terms and conditions..."
                />
            </Card>
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
