import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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

    const { currentEmail, newPassword, otp } = await request.json();

    if (!newPassword || !otp) {
      return NextResponse.json({ 
        message: 'New password and OTP are required' 
      }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ 
        message: 'Password must be at least 6 characters' 
      }, { status: 400 });
    }

    // Verify OTP from pending_users table
    const otpRecord = await prisma.pendingUser.findFirst({
      where: {
        email: session.user.email,
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
      where: { email: session.user.email },
    });

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ 
      message: 'Password updated successfully' 
    });
  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json({ 
      message: 'Failed to update password' 
    }, { status: 500 });
  }
}
