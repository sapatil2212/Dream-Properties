import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Update lastActiveAt for the logged-in user
    await prisma.user.update({
      where: { email: session.user.email },
      data: { lastActiveAt: new Date() }
    });

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Heartbeat error:', error);
    return NextResponse.json({ message: 'Error updating activity' }, { status: 500 });
  }
}
