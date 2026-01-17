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

    // Handle Super Admin virtual user if needed (though NextAuth should handle this now)
    if (session.user.id === 'superadmin') {
      return NextResponse.json({
        id: 'superadmin',
        name: 'Super Admin',
        email: process.env.SUPER_ADMIN_EMAIL,
        role: 'SUPER_ADMIN',
        mobile: 'N/A'
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        status: true,
      },
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Fetch profile error:', error)
    return NextResponse.json({ message: 'Failed to fetch profile' }, { status: 500 })
  }
}
