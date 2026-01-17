import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: parseInt(session.user.id) },
      include: {
        property: {
          include: {
            builder: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formatted = favorites.map(f => ({
      ...f.property,
      builder: f.property.builder.name,
      builderEmail: f.property.builder.email,
      favorited_at: f.createdAt,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Fetch favorites error:', error)
    return NextResponse.json({ message: 'Failed to fetch favorites' }, { status: 500 })
  }
}
