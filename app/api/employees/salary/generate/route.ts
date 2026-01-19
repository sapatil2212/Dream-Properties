import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { employeeId, month, year } = body;

        const employee = await prisma.user.findUnique({
            where: { id: employeeId },
            include: { employeeProfile: true }
        });

        if (!employee || !employee.employeeProfile) {
             return NextResponse.json({ message: 'Employee profile not found' }, { status: 404 });
        }

        const basic = employee.employeeProfile.basicSalary;
        const hra = employee.employeeProfile.hra || 0;
        const specialAllowance = employee.employeeProfile.specialAllowance || 0;
        const medicalAllowance = employee.employeeProfile.medicalAllowance || 0;
        
        // Handle custom earnings
        const customEarnings = (employee.employeeProfile.customEarnings as any[]) || [];
        const totalCustomEarnings = customEarnings.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);

        const pf = employee.employeeProfile.pf || 0;
        const professionalTax = employee.employeeProfile.professionalTax || 0;
        const healthInsurance = employee.employeeProfile.healthInsurance || 0;

        // Handle custom deductions
        const customDeductions = (employee.employeeProfile.customDeductions as any[]) || [];
        const totalCustomDeductions = customDeductions.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);

        const totalAllowances = specialAllowance + medicalAllowance + totalCustomEarnings; // Group extra allowances
        const gross = basic + hra + totalAllowances;
        
        // Calculate Attendance and Leave Deductions
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0);
        const totalDays = endDate.getDate();

        // Fetch Approved Unpaid Leaves
        const unpaidLeaves = await prisma.leaveRequest.findMany({
            where: {
                userId: employeeId,
                status: 'Approved',
                type: { not: 'Paid' },
                OR: [
                    {
                        startDate: { lte: endDate },
                        endDate: { gte: startDate }
                    }
                ]
            }
        });

        // Calculate total unpaid leave days (handling overlaps)
        let totalUnpaidDays = 0;
        for (const leave of unpaidLeaves) {
            let start = new Date(leave.startDate);
            let end = new Date(leave.endDate);
            
            // Clamp to current month
            if (start < startDate) start = startDate;
            if (end > endDate) end = endDate;
            
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            totalUnpaidDays += days;
        }

        // Fetch Present Days count
        const presentDaysCount = await prisma.attendance.count({
            where: {
                userId: employeeId,
                date: {
                    gte: startDate,
                    lte: endDate
                },
                status: 'Present'
            }
        });

        const perDaySalary = gross / totalDays;
        const lossOfPay = perDaySalary * totalUnpaidDays;
        
        const totalDeductions = pf + professionalTax + healthInsurance + totalCustomDeductions + lossOfPay;
        const net = gross - totalDeductions;

        // Check if slip already exists
        const existing = await prisma.salarySlip.findFirst({
            where: {
                userId: employeeId,
                month: parseInt(month),
                year: parseInt(year)
            }
        });

        if (existing) {
             return NextResponse.json({ message: 'Salary slip already generated for this month' }, { status: 400 });
        }

        const slip = await prisma.salarySlip.create({
            data: {
                userId: employeeId,
                month: parseInt(month),
                year: parseInt(year),
                basicSalary: basic,
                hra,
                allowances: totalAllowances,
                deductions: totalDeductions,
                netSalary: net,
                details: {
                    basic,
                    hra,
                    specialAllowance,
                    medicalAllowance,
                    pf,
                    professionalTax,
                    healthInsurance,
                    customEarnings,
                    customDeductions,
                    totalDays,
                    presentDays: presentDaysCount,
                    unpaidDays: totalUnpaidDays,
                    lossOfPay
                }
            }
        });

        return NextResponse.json(slip);
    } catch (error) {
        console.error('Salary generation error:', error);
        return NextResponse.json({ message: 'Error generating slip' }, { status: 500 });
    }
}
