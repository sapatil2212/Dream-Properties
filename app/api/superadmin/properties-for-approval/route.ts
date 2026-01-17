import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const properties = await prisma.property.findMany({
      include: {
        builder: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    console.log('Properties fetched for approval:', properties.length)
    console.log('Properties statuses:', properties.map(p => ({ id: p.id, status: p.status })))

    const formatted = properties.map(p => ({
      ...p,
      builder_name: p.builder.name,
      builder_email: p.builder.email,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('Fetch properties for approval error:', error)
    return NextResponse.json({ message: 'Failed to fetch properties' }, { status: 500 })
  }
}
