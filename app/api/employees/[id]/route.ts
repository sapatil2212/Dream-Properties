import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const id = parseInt(params.id);
    const employee = await prisma.user.findUnique({
      where: { id },
      include: {
        employeeProfile: true,
        attendance: {
          orderBy: { date: 'desc' },
          take: 30
        },
        salarySlips: {
          orderBy: [
            { year: 'desc' },
            { month: 'desc' }
          ],
          take: 12
        },
        leaveRequests: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        salesExecLeads: {
            select: {
                id: true,
                createdAt: true,
                status: true
            },
            orderBy: { createdAt: 'desc' },
            take: 100 // Limit for performance
        }
      }
    });

    if (!employee) {
      return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error fetching employee details:', error);
    return NextResponse.json({ message: 'Error fetching employee details' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { 
      name, 
      mobile, 
      role, 
      designation, 
      department,
      basicSalary,
      leavesAllotted,
      accountNumber,
      bankName,
      ifscCode,
      status,
      joiningDate,
      specialAllowance,
      medicalAllowance,
      pf,
      professionalTax,
      healthInsurance,
      customEarnings,
      customDeductions,
      workingHours,
      shiftStartTime,
      lateMarkDeduction
    } = body;

    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id },
        data: {
          name,
          mobile,
          role,
          status, // Allow disabling user
        }
      });

      // Update or Create profile
      const profileData = {
          designation,
          department,
          joiningDate: joiningDate ? new Date(joiningDate) : undefined,
          basicSalary: parseFloat(basicSalary || '0'),
          specialAllowance: parseFloat(specialAllowance || '0'),
          medicalAllowance: parseFloat(medicalAllowance || '0'),
          pf: parseFloat(pf || '0'),
          professionalTax: parseFloat(professionalTax || '0'),
          healthInsurance: parseFloat(healthInsurance || '0'),
          leavesAllotted: parseInt(leavesAllotted || '12'),
          accountNumber,
          bankName,
          ifscCode,
          workingHours: parseFloat(workingHours || '9'),
          shiftStartTime: shiftStartTime || '09:00',
          lateMarkDeduction: parseFloat(lateMarkDeduction || '0'),
          customEarnings: customEarnings || [],
          customDeductions: customDeductions || []
      };

      const profile = await tx.employeeProfile.upsert({
        where: { userId: id },
        create: {
          userId: id,
          ...profileData
        },
        update: profileData
      });

      return user;
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ message: 'Error updating employee' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const id = parseInt(params.id);

    // Soft delete: Set status to 'Deleted'
    const deletedUser = await prisma.user.update({
      where: { id },
      data: { status: 'Deleted' }
    });

    return NextResponse.json(deletedUser);
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ message: 'Error deleting employee' }, { status: 500 });
  }
}
