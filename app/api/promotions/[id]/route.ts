import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { isActive } = await request.json();
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    const promotion = await prisma.promotion.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json(promotion);
  } catch (error) {
    console.error('Update promotion error:', error);
    return NextResponse.json({ message: 'Failed to update promotion' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id: idParam } = await params;
    const id = parseInt(idParam);

    await prisma.promotion.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    console.error('Delete promotion error:', error);
    return NextResponse.json({ message: 'Failed to delete promotion' }, { status: 500 });
  }
}
