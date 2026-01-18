import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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
        mobile: true,
        role: true,
        status: true,
        securityKey: true,
        propertyType: true,
        lookingTo: true,
        projectName: true,
        propertyAddress: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const [propertiesCount, favoritesCount, leadsCount, siteVisitsCount] = await Promise.all([
      prisma.property.count({ where: { builderId: userId } }),
      prisma.favorite.count({ where: { userId: userId } }),
      prisma.lead.count({ where: { assignedTo: userId } }),
      prisma.siteVisit.count({ where: { staffId: userId } }),
    ]);

    return NextResponse.json({
      ...user,
      propertiesCount,
      favoritesCount,
      leadsCount,
      siteVisitsCount,
    });
  } catch (error) {
    console.error('Fetch user details error:', error);
    return NextResponse.json({ message: 'Failed to fetch user details' }, { status: 500 });
  }
}

export async function PUT(
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

    const body = await request.json();
    const {
      name,
      email,
      mobile,
      password,
      propertyType,
      lookingTo,
      projectName,
      propertyAddress,
      status,
      role,
      securityKey,
    } = body;

    const data: any = {};

    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (mobile !== undefined) data.mobile = mobile;
    if (propertyType !== undefined) data.propertyType = propertyType || null;
    if (lookingTo !== undefined) data.lookingTo = lookingTo || null;
    if (projectName !== undefined) data.projectName = projectName || null;
    if (propertyAddress !== undefined) data.propertyAddress = propertyAddress || null;
    if (status !== undefined) data.status = status;
    if (role !== undefined) data.role = role;
    if (securityKey !== undefined) data.securityKey = securityKey || null;

    if (password) {
      if (typeof password !== 'string' || password.length < 6) {
        return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      data.password = hashedPassword;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        status: true,
        securityKey: true,
        propertyType: true,
        lookingTo: true,
        projectName: true,
        propertyAddress: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ message: 'Failed to update user' }, { status: 500 });
  }
}
