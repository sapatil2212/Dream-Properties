import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { userId, status } = await request.json()

    if (!['Active', 'Disabled'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { status: status as any },
    })

    return NextResponse.json({ message: `User account ${status === 'Active' ? 'enabled' : 'disabled'} successfully` })
  } catch (error) {
    console.error('Toggle status error:', error)
    return NextResponse.json({ message: 'Failed to update account status' }, { status: 500 })
  }
}
