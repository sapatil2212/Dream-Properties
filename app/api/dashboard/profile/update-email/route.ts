import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Block regular users - Dashboard users only
    const dashboardRoles = ['BUILDER', 'ADMIN', 'SUPER_ADMIN', 'SAAS_OWNER', 'TELECALLER', 'SALES_EXECUTIVE'];
    if (!dashboardRoles.includes(session.user.role)) {
      return NextResponse.json({ 
        message: 'Access denied' 
      }, { status: 403 });
    }

    const { newEmail, otp } = await request.json();

    if (!newEmail || !otp) {
      return NextResponse.json({ 
        message: 'New email and OTP are required' 
      }, { status: 400 });
    }

    // Check if new email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser) {
      return NextResponse.json({ 
        message: 'Email already in use' 
      }, { status: 400 });
    }

    // Verify OTP from pending_users table
    const otpRecord = await prisma.pendingUser.findFirst({
      where: {
        email: newEmail,
        otp,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otpRecord) {
      return NextResponse.json({ 
        message: 'Invalid or expired OTP' 
      }, { status: 400 });
    }

    // Mark OTP as used by deleting the record
    await prisma.pendingUser.delete({
      where: { email: newEmail },
    });

    // Update user email
    await prisma.user.update({
      where: { email: session.user.email },
      data: { email: newEmail },
    });

    return NextResponse.json({ 
      message: 'Email updated successfully',
      newEmail 
    });
  } catch (error) {
    console.error('Email update error:', error);
    return NextResponse.json({ 
      message: 'Failed to update email' 
    }, { status: 500 });
  }
}
