import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'SAAS_OWNER'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id, 10);
    if (!Number.isInteger(userId)) {
      return NextResponse.json({ message: 'Invalid partner id' }, { status: 400 });
    }

    const partner = await prisma.user.findUnique({
      where: { id: userId, role: 'CHANNEL_PARTNER' },
      include: { channelPartner: true }
    });

    if (!partner) {
      return NextResponse.json({ message: 'Channel Partner not found' }, { status: 404 });
    }

    return NextResponse.json(partner);
  } catch (error) {
    console.error('Error fetching channel partner:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id, 10);
    if (!Number.isInteger(userId)) {
      return NextResponse.json({ message: 'Invalid partner id' }, { status: 400 });
    }

    const body = await request.json();

    const userData: any = {};
    if (typeof body.name === 'string') userData.name = body.name;
    if (typeof body.email === 'string') userData.email = body.email;
    if (typeof body.mobile === 'string') userData.mobile = body.mobile;

    const cpData: any = {};
    if (typeof body.city === 'string') cpData.city = body.city;
    if (typeof body.state === 'string') cpData.state = body.state;
    if (typeof body.partnerType === 'string') cpData.partnerType = body.partnerType;
    if (typeof body.gstNumber === 'string') cpData.gstNumber = body.gstNumber;
    if (typeof body.reraNumber === 'string') cpData.reraNumber = body.reraNumber;
    if (typeof body.bankName === 'string') cpData.bankName = body.bankName;
    if (typeof body.accountNumber === 'string') cpData.accountNumber = body.accountNumber;
    if (typeof body.ifscCode === 'string') cpData.ifscCode = body.ifscCode;
    if (typeof body.commissionRate === 'number') cpData.commissionRate = body.commissionRate;

    if (Object.keys(userData).length === 0 && Object.keys(cpData).length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const [updatedUser] = await prisma.$transaction([
      Object.keys(userData).length
        ? prisma.user.update({
            where: { id: userId, role: 'CHANNEL_PARTNER' },
            data: userData
          })
        : prisma.user.findUnique({
            where: { id: userId, role: 'CHANNEL_PARTNER' }
          }),
      Object.keys(cpData).length
        ? prisma.channelPartner.update({
            where: { userId },
            data: cpData
          })
        : prisma.channelPartner.findUnique({
            where: { userId }
          })
    ]);

    return NextResponse.json({ message: 'Channel Partner updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating channel partner:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id, 10);
    if (!Number.isInteger(userId)) {
      return NextResponse.json({ message: 'Invalid partner id' }, { status: 400 });
    }

    const deletedUser = await prisma.user.update({
      where: { id: userId, role: 'CHANNEL_PARTNER' },
      data: { status: 'Deleted' }
    });

    return NextResponse.json({ message: 'Channel Partner deleted successfully', user: deletedUser });
  } catch (error) {
    console.error('Error deleting channel partner:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

