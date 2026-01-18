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

    const lead = await prisma.lead.update({
      where: { id: parseInt(leadId) },
      data: { assignedTo: parseInt(staffId) },
      include: {
        assignedStaff: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    })

    return NextResponse.json({ message: 'Lead assigned successfully', lead })
  } catch (error) {
    console.error('Assign lead error:', error)
    return NextResponse.json({ message: 'Failed to assign lead' }, { status: 500 })
  }
}

