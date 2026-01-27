import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN', 'SAAS_OWNER'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const partners = await prisma.user.findMany({
      where: { 
        role: 'CHANNEL_PARTNER',
        status: { not: 'Deleted' }
      },
      include: {
        channelPartner: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(partners);
  } catch (error) {
    console.error('Error fetching channel partners:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
