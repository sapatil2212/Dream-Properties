import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    const where: any = {
      role: {
        notIn: ['SUPER_ADMIN', 'SAAS_OWNER', 'BUILDER', 'BUYER', 'USER'] // Fetch employees (exclude system/customer roles)
      }
    };

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { mobile: { contains: search } },
      ];
    }

    const employees = await prisma.user.findMany({
      where,
      include: {
        employeeProfile: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { message: 'Error fetching employees' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      mobile, 
      password, 
      role, 
      designation, 
      department,
      joiningDate,
      basicSalary,
      leavesAllotted,
      accountNumber,
      bankName,
      ifscCode,
      shiftStartTime,
      workingHours,
      lateMarkDeduction
    } = body;

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email }
    });

    if (existing) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password || 'Employee@123', 10);

    // Transaction to create User and Profile
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          mobile,
          password: hashedPassword,
          securityKey: password || 'Employee@123',
          role: role || 'SALES_EXECUTIVE',
          status: 'Active',
        }
      });

      await tx.employeeProfile.create({
        data: {
          userId: user.id,
          designation,
          department,
          joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
          basicSalary: parseFloat(basicSalary || '0'),
          leavesAllotted: parseInt(leavesAllotted || '12'),
          accountNumber,
          bankName,
          ifscCode,
          shiftStartTime: shiftStartTime || '09:00',
          workingHours: parseFloat(workingHours || '9'),
          lateMarkDeduction: parseFloat(lateMarkDeduction || '0'),
        }
      });

      return user;
    });

    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { message: 'Error creating employee' },
      { status: 500 }
    );
  }
}
