import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    if (activeOnly) {
      const promotions = await prisma.promotion.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(promotions);
    }

    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      // If not admin, return only active
      const promotions = await prisma.promotion.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(promotions);
    }

    // Admin sees all
    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(promotions);
  } catch (error) {
    console.error('Fetch promotions error:', error);
    return NextResponse.json({ message: 'Failed to fetch promotions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ message: 'Image URL is required' }, { status: 400 });
    }

    const promotion = await prisma.promotion.create({
      data: {
        imageUrl,
        isActive: true, // Default to active
      },
    });

    return NextResponse.json(promotion);
  } catch (error) {
    console.error('Create promotion error:', error);
    return NextResponse.json({ message: 'Failed to create promotion' }, { status: 500 });
  }
}
