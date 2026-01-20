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

    // Try to create attendance record
    // We rely on the database unique constraint to handle duplicate check-ins
    // This handles race conditions better than a separate findUnique + create
    try {
        const attendance = await prisma.attendance.create({
            data: {
                userId,
                date: dateOnly,
                checkIn: new Date(),
                status: 'Present'
            }
        });
        return NextResponse.json({ message: 'Checked in successfully', attendance });
    } catch (error: any) {
        if (error.code === 'P2002') {
            const existing = await prisma.attendance.findUnique({
                where: {
                    userId_date: {
                        userId,
                        date: dateOnly
                    }
                }
            });
            return NextResponse.json({ message: 'Already checked in', attendance: existing });
        }
        throw error;
    }
  } catch (error) {
    console.error('Attendance error:', error);
    return NextResponse.json({ message: 'Error marking attendance' }, { status: 500 });
  }
}
