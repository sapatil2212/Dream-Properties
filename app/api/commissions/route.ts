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
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');

    let whereClause: any = {};

    if (role === 'CHANNEL_PARTNER') {
        const cp = await prisma.channelPartner.findUnique({
            where: { userId: parseInt(session.user.id) }
        });
        if (!cp) return NextResponse.json({ message: 'Partner profile not found' }, { status: 404 });
        whereClause.channelPartnerId = cp.id;
    } else if (['ADMIN', 'SUPER_ADMIN', 'SAAS_OWNER'].includes(role)) {
        if (partnerId) {
            whereClause.channelPartnerId = parseInt(partnerId);
        }
    } else {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const commissions = await prisma.commission.findMany({
      where: whereClause,
      include: {
        lead: {
            select: { name: true, propertyOfInterest: true }
        },
        channelPartner: {
            include: { user: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(commissions);
  } catch (error) {
    console.error('Error fetching commissions:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
