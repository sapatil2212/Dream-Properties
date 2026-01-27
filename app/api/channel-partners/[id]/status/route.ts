import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN', 'SAAS_OWNER'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id, 10);
    if (!Number.isInteger(userId)) {
      return NextResponse.json({ message: 'Invalid partner id' }, { status: 400 });
    }

    const { status, commissionRate } = await request.json(); // status: 'Approved' | 'Rejected'

    if (!['Approved', 'Rejected'].includes(status)) {
       return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    const updateData: any = {
      approvalStatus: status
    };
    if (commissionRate !== undefined && commissionRate !== '') {
      updateData.commissionRate = parseFloat(commissionRate);
    }

    const userStatus = status === 'Approved' ? 'Active' : 'Disabled';

    await prisma.$transaction([
      prisma.channelPartner.update({
        where: { userId: userId },
        data: updateData
      }),
      prisma.user.update({
        where: { id: userId },
        data: { status: userStatus }
      })
    ]);

    return NextResponse.json({ message: `Partner ${status} successfully` });
  } catch (error) {
    console.error('Error updating partner status:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
