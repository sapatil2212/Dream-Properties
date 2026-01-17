import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'BUILDER') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const properties = await prisma.property.findMany({
      where: { builderId: parseInt(session.user.id) },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(properties)
  } catch (error) {
    console.error('Fetch builder properties error:', error)
    return NextResponse.json({ message: 'Failed to fetch your properties' }, { status: 500 })
  }
}
