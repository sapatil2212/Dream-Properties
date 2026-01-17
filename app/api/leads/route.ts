import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: Fetch leads (for staff/admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const assignedTo = searchParams.get('assignedTo')

    const where: any = {}
    if (status) where.status = status
    if (assignedTo) where.assignedTo = parseInt(assignedTo)

    // Builders should only see leads for their own properties
    if (session.user.role === 'BUILDER') {
      where.property = {
        builderId: parseInt(session.user.id)
      }
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        property: {
          select: {
            title: true,
            location: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(leads)
  } catch (error) {
    console.error('Fetch leads error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// POST: Create a new lead (public - e.g. from inquiry form)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, propertyId, propertyTitle, source, message } = body

    if (!name || !email || !phone || !propertyId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        propertyId: parseInt(propertyId),
        propertyOfInterest: propertyTitle || 'Property #' + propertyId,
        source: source || 'Website',
        lastNote: message || null,
        status: 'New'
      }
    })

    return NextResponse.json({ message: 'Inquiry submitted successfully', lead })
  } catch (error) {
    console.error('Create lead error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
