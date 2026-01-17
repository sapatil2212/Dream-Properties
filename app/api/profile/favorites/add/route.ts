import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { propertyId } = await request.json()
    if (!propertyId) {
      return NextResponse.json({ message: 'Property ID required' }, { status: 400 })
    }

    await prisma.favorite.upsert({
      where: {
        userId_propertyId: {
          userId: parseInt(session.user.id),
          propertyId: parseInt(propertyId),
        },
      },
      create: {
        userId: parseInt(session.user.id),
        propertyId: parseInt(propertyId),
      },
      update: {},
    })

    return NextResponse.json({ message: 'Added to favorites' })
  } catch (error) {
    console.error('Add favorite error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
