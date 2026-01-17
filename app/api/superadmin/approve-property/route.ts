import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { propertyId, status } = await request.json();

    if (!['Approved', 'Rejected'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    await prisma.property.update({
      where: { id: parseInt(propertyId) },
      data: { status: status as any },
    });

    return NextResponse.json({ message: `Property ${status.toLowerCase()} successfully` });
  } catch (error) {
    console.error('Approve property error:', error);
    return NextResponse.json({ message: 'Failed to update property status' }, { status: 500 });
  }
}
