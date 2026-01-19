import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    // Skip if superadmin string id
    if (isNaN(userId)) {
         return NextResponse.json({ message: 'Not an employee' }, { status: 400 });
    }

    const today = new Date();
    // Reset time to 00:00:00 for the date field
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Check if already checked in
    const existing = await prisma.attendance.findUnique({
        where: {
            userId_date: {
                userId,
                date: dateOnly
            }
        }
    });

    if (existing) {
        return NextResponse.json({ message: 'Already checked in', attendance: existing });
    }

    const attendance = await prisma.attendance.create({
        data: {
            userId,
            date: dateOnly,
            checkIn: new Date(),
            status: 'Present'
        }
    });

    return NextResponse.json({ message: 'Checked in successfully', attendance });
  } catch (error) {
    console.error('Attendance error:', error);
    return NextResponse.json({ message: 'Error marking attendance' }, { status: 500 });
  }
}
