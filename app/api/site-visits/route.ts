import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { UserRole } from '@prisma/client';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const staffId = searchParams.get('staffId');

  const where: any = {};
  if (status) where.status = status;
  if (staffId) where.staffId = parseInt(staffId);
  
  // Role based filtering
  const userRole = (session.user as any).role;
  if (userRole === 'SALES_EXECUTIVE' || userRole === 'TELECALLER') {
    where.staffId = parseInt(session.user.id);
  }

  try {
    const visits = await (prisma as any).siteVisit.findMany({
      where,
      include: {
        lead: true,
        property: true,
        staff: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        visitDate: 'asc'
      }
    });

    return NextResponse.json(visits);
  } catch (error) {
    console.error('Get site visits error:', error);
    return NextResponse.json({ message: 'Error fetching site visits' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { leadId, propertyId, staffId, visitDate, notes } = body;

    const visit = await (prisma as any).siteVisit.create({
      data: {
        leadId: parseInt(leadId),
        propertyId: parseInt(propertyId),
        staffId: parseInt(staffId),
        visitDate: new Date(visitDate),
        notes,
        status: 'Scheduled'
      }
    });

    // Also update lead status to 'Site Visit Scheduled'
    await (prisma as any).lead.update({
      where: { id: parseInt(leadId) },
      data: { status: 'Site Visit Scheduled' }
    });

    return NextResponse.json(visit);
  } catch (error) {
    console.error('Create site visit error:', error);
    return NextResponse.json({ message: 'Error creating site visit' }, { status: 500 });
  }
}
