import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create a test notification
    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'test',
        title: 'Test Notification',
        message: 'This is a test notification to verify the system is working.',
        link: '/dashboard',
      },
    });

    return NextResponse.json({ 
      success: true, 
      notification,
      message: 'Test notification created successfully'
    });
  } catch (error: any) {
    console.error('Error creating test notification:', error);
    return NextResponse.json({ 
      error: 'Failed to create test notification',
      details: error.message 
    }, { status: 500 });
  }
}
