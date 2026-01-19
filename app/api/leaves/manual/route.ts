
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, startDate, endDate, reason, type, days } = body;

    if (!userId || !startDate || !endDate || !days) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Create the leave request (marked as Approved since it's manual entry by admin)
    const leave = await prisma.leaveRequest.create({
      data: {
        userId: parseInt(userId),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason: reason || 'Manual Entry by Admin',
        status: 'Approved',
        type: type || 'Paid',
      }
    });

    // Update employee profile leaves taken
    await prisma.employeeProfile.update({
        where: { userId: parseInt(userId) },
        data: {
            leavesTaken: { increment: parseInt(days) }
        }
    });

    return NextResponse.json(leave);
  } catch (error) {
    console.error('Error creating manual leave:', error);
    return NextResponse.json({ message: 'Error creating leave record' }, { status: 500 });
  }
}
