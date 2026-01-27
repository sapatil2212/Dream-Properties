import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // 1. Get Most Viewed Property
    const mostViewedProperty = await prisma.property.findFirst({
      orderBy: {
        views: 'desc',
      },
      select: {
        title: true,
        views: true,
        location: true,
        price: true
      },
    });

    // 2. Get Performance Data (Leads over the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const leads = await prisma.lead.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Group leads by date
    const leadsByDate: Record<string, number> = {};
    
    // Initialize last 30 days with 0
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      leadsByDate[dateStr] = 0;
    }

    leads.forEach(lead => {
      const dateStr = lead.createdAt.toISOString().split('T')[0];
      if (leadsByDate[dateStr] !== undefined) {
        leadsByDate[dateStr]++;
      }
    });

    const graphData = Object.entries(leadsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      mostViewedProperty,
      graphData
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
