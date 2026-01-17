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

    const allUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        status: true,
        securityKey: true,
        propertyType: true,
        lookingTo: true,
        projectName: true,
        propertyAddress: true,
        createdAt: true,
      }
    })

    const summary = {
      total: allUsers.length,
      buyers: allUsers.filter(u => (u.role as string) === 'BUYER' || (u.role as string) === 'USER'),
      builders: allUsers.filter(u => (u.role as string) === 'BUILDER'),
      staff: allUsers.filter(u => ['ADMIN', 'TELECALLER', 'SALES_EXECUTIVE', 'SAAS_OWNER'].includes(u.role as string)),
      others: allUsers.filter(u => !['BUYER', 'USER', 'BUILDER', 'ADMIN', 'TELECALLER', 'SALES_EXECUTIVE', 'SAAS_OWNER'].includes(u.role as string))
    }

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Fetch accounts summary error:', error)
    return NextResponse.json({ message: 'Failed to fetch accounts summary' }, { status: 500 })
  }
}
