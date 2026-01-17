import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { email, type } = await request.json()
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    await prisma.pendingUser.upsert({
      where: { email },
      create: {
        email,
        name: 'PROFILE_UPDATE',
        mobile: 'N/A',
        password: 'N/A',
        role: 'USER',
        otp,
        expiresAt,
      },
      update: {
        otp,
        expiresAt,
      },
    })

    const subject = type === 'email' ? 'Verify your new email' : 'Verify your identity'
    const emailTemplate = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2563eb;">${subject}</h2>
        <p>Your verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #2563eb; margin: 20px 0;">${otp}</div>
        <p style="font-size: 12px; color: #666;">This code expires in 5 minutes.</p>
      </div>
    `

    await transporter.sendMail({
      from: `"Dream Properties" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject,
      html: emailTemplate,
    })

    return NextResponse.json({ message: 'OTP sent successfully' })
  } catch (error) {
    console.error('Request profile OTP error:', error)
    return NextResponse.json({ message: 'Failed to send OTP' }, { status: 500 })
  }
}
