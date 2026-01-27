import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role;
    let channelPartnerId: number | null = null;

    if (role === 'CHANNEL_PARTNER') {
        const cp = await prisma.channelPartner.findUnique({
            where: { userId: parseInt(session.user.id) }
        });
        if (!cp) return NextResponse.json({ message: 'Partner profile not found' }, { status: 404 });
        channelPartnerId = cp.id;
    } else {
         // For admins, this might need to aggregate all or specific partner
         // For simplicity, let's keep this endpoint for partner dashboard mainly
         // Or if admin calls it, return global stats?
         // Let's stick to partner specific for now or return 0s
         return NextResponse.json({ pending: 0, paid: 0 });
    }

    const commissions = await prisma.commission.groupBy({
        by: ['status'],
        where: { channelPartnerId: channelPartnerId },
        _sum: {
            commissionAmount: true
        }
    });

    let pending = 0;
    let paid = 0;

    commissions.forEach(c => {
        if (c.status === 'Pending' || c.status === 'Approved') {
            pending += c._sum.commissionAmount || 0;
        } else if (c.status === 'Paid') {
            paid += c._sum.commissionAmount || 0;
        }
    });

    return NextResponse.json({ pending, paid });

  } catch (error) {
    console.error('Error fetching commission summary:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
