import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { currentEmail, newPassword, otp } = await request.json()

    const pending = await prisma.pendingUser.findFirst({
      where: {
        email: currentEmail,
        otp,
        expiresAt: { gt: new Date() },
      },
    })

    if (!pending) {
      return NextResponse.json({ message: 'Invalid or expired OTP' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: parseInt(session.user.id) },
      data: { password: hashedPassword },
    })

    await prisma.pendingUser.delete({
      where: { email: currentEmail },
    })

    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Update password error:', error)
    return NextResponse.json({ message: 'Failed to update password' }, { status: 500 })
  }
}
