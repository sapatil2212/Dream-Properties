import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = Number(id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ message: 'Invalid user id' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const startOfWeek = new Date(now);
    const weekDay = startOfWeek.getDay();
    const diff = (weekDay === 0 ? -6 : 1) - weekDay;
    startOfWeek.setDate(startOfWeek.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    let payload: any = { user };

    if (user.role === 'TELECALLER') {
      const baseWhere = { assignedTo: user.id };

      const [todayCalls, weekCalls, monthCalls, totalCalls] = await Promise.all([
        prisma.lead.count({
          where: {
            ...baseWhere,
            createdAt: { gte: startOfToday },
          },
        }),
        prisma.lead.count({
          where: {
            ...baseWhere,
            createdAt: { gte: startOfWeek },
          },
        }),
        prisma.lead.count({
          where: {
            ...baseWhere,
            createdAt: { gte: startOfMonth },
          },
        }),
        prisma.lead.count({
          where: baseWhere,
        }),
      ]);

      payload = {
        ...payload,
        type: 'telecaller',
        calls: {
          today: todayCalls,
          thisWeek: weekCalls,
          thisMonth: monthCalls,
          lifetime: totalCalls,
        },
      };
    } else if (user.role === 'USER' || user.role === 'BUYER') {
      const [favoritesTotal, enquiriesTotal] = await Promise.all([
        prisma.favorite.count({
          where: {
            userId: user.id,
          },
        }),
        prisma.lead.count({
          where: {
            email: user.email,
          },
        }),
      ]);

      payload = {
        ...payload,
        type: 'buyer',
        favorites: {
          total: favoritesTotal,
        },
        enquiries: {
          total: enquiriesTotal,
        },
      };
    } else if (user.role === 'BUILDER' || user.role === 'SAAS_OWNER') {
      const [totalProperties, approvedProperties, pendingProperties, rejectedProperties, flaggedProperties, viewsAgg] =
        await Promise.all([
          prisma.property.count({
            where: { builderId: user.id },
          }),
          prisma.property.count({
            where: { builderId: user.id, status: 'Approved' },
          }),
          prisma.property.count({
            where: { builderId: user.id, status: 'Pending_Approval' },
          }),
          prisma.property.count({
            where: { builderId: user.id, status: 'Rejected' },
          }),
          prisma.property.count({
            where: { builderId: user.id, propertyFlag: { not: null } },
          }),
          prisma.property.aggregate({
            _sum: { views: true },
            where: { builderId: user.id },
          }),
        ]);

      payload = {
        ...payload,
        type: 'builder',
        properties: {
          total: totalProperties,
          approved: approvedProperties,
          pending: pendingProperties,
          rejected: rejectedProperties,
          flagged: flaggedProperties,
        },
        views: {
          total: viewsAgg._sum.views || 0,
        },
      };
    } else {
      payload = {
        ...payload,
        type: 'other',
      };
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Fetch account performance error:', error);
    return NextResponse.json({ message: 'Failed to fetch account performance' }, { status: 500 });
  }
}
