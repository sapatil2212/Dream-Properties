import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      status, 
      designation, 
      department, 
      joiningDate, 
      basicSalary, 
      leavesAllotted, 
      bankName, 
      accountNumber, 
      ifscCode, 
      workingHours, 
      shiftStartTime,
      lateMarkDeduction 
    } = body;

    // Transaction to update User status and create EmployeeProfile
    const result = await prisma.$transaction(async (tx) => {
      // Update User Status
      await tx.user.update({
        where: { id: userId },
        data: { status: status || 'Active' }
      });

      // Create or Update Employee Profile
      const profile = await tx.employeeProfile.upsert({
        where: { userId },
        create: {
          userId,
          designation,
          department,
          joiningDate: new Date(joiningDate),
          basicSalary,
          leavesAllotted,
          bankName,
          accountNumber,
          ifscCode,
          workingHours,
          shiftStartTime: shiftStartTime || '09:00',
          lateMarkDeduction
        },
        update: {
          designation,
          department,
          joiningDate: new Date(joiningDate),
          basicSalary,
          leavesAllotted,
          bankName,
          accountNumber,
          ifscCode,
          workingHours,
          shiftStartTime: shiftStartTime || '09:00',
          lateMarkDeduction
        }
      });
      return profile;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ message: 'Failed to onboard employee' }, { status: 500 });
  }
}
