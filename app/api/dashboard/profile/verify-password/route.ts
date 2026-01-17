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

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ 
        message: 'Password is required' 
      }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { password: true },
    });

    if (!user || !user.password) {
      return NextResponse.json({ 
        message: 'User not found' 
      }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ 
        message: 'Incorrect password' 
      }, { status: 401 });
    }

    return NextResponse.json({ 
      message: 'Password verified successfully' 
    });
  } catch (error) {
    console.error('Password verification error:', error);
    return NextResponse.json({ 
      message: 'Verification failed' 
    }, { status: 500 });
  }
}
