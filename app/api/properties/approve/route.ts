import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id, action } = await request.json()
    const propertyId = parseInt(id)

    if (action === 'approve') {
      await prisma.property.update({
        where: { id: propertyId },
        data: { status: 'Approved' },
      })
      return NextResponse.json({ message: 'Property approved successfully' })
    } else if (action === 'reject') {
      await prisma.property.update({
        where: { id: propertyId },
        data: { status: 'Rejected' },
      })
      return NextResponse.json({ message: 'Property rejected successfully' })
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Approve property error:', error)
    return NextResponse.json({ message: 'Failed to update property status' }, { status: 500 })
  }
}
