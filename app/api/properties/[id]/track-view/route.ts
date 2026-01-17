import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const propertyId = parseInt(id);

    if (isNaN(propertyId)) {
      return NextResponse.json({ error: 'Invalid property ID' }, { status: 400 });
    }

    // Increment the view count
    await prisma.property.update({
      where: { id: propertyId },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking property view:', error);
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 });
  }
}
