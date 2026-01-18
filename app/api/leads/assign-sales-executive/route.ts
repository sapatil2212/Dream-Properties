import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { leadId, staffId } = await request.json()

    if (!leadId || !staffId) {
      return NextResponse.json({ message: 'leadId and staffId are required' }, { status: 400 })
    }

    const parsedLeadId = parseInt(leadId)
    const parsedStaffId = parseInt(staffId)

    if (!Number.isInteger(parsedLeadId) || !Number.isInteger(parsedStaffId)) {
      return NextResponse.json({ message: 'Invalid leadId or staffId' }, { status: 400 })
    }

    await prisma.$executeRawUnsafe(
      'UPDATE leads SET sales_executive_id = ? WHERE id = ?',
      parsedStaffId,
      parsedLeadId
    )

    await prisma.siteVisit.updateMany({
      where: {
        leadId: parsedLeadId,
        status: 'Scheduled'
      },
      data: {
        staffId: parsedStaffId
      }
    })

    const salesExecutive = await prisma.user.findUnique({
      where: { id: parsedStaffId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    return NextResponse.json({
      message: 'Sales executive assigned successfully',
      lead: {
        id: parsedLeadId,
        salesExecutive
      }
    })
  } catch (error) {
    console.error('Assign sales executive error:', error)
    return NextResponse.json({ message: 'Failed to assign sales executive' }, { status: 500 })
  }
}
