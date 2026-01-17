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

    const { newEmail, otp } = await request.json()

    const pending = await prisma.pendingUser.findFirst({
      where: {
        email: newEmail,
        otp,
        expiresAt: { gt: new Date() },
      },
    })

    if (!pending) {
      return NextResponse.json({ message: 'Invalid or expired OTP' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: parseInt(session.user.id) },
      data: { email: newEmail },
    })

    await prisma.pendingUser.delete({
      where: { email: newEmail },
    })

    return NextResponse.json({ message: 'Email updated successfully' })
  } catch (error) {
    console.error('Update email error:', error)
    return NextResponse.json({ message: 'Failed to update email' }, { status: 500 })
  }
}
