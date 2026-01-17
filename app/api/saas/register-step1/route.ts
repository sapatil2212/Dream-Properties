import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
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
    const body = await request.json()
    const { name, email, mobile, password, role } = body

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email }
    })

    if (existing) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      )
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    const hashedPassword = await bcrypt.hash(password, 10)

    // Store in pending_users table
    await prisma.pendingUser.upsert({
      where: { email },
      create: {
        email,
        name,
        mobile,
        password: hashedPassword,
        role: role || 'USER',
        otp,
        expiresAt,
      },
      update: {
        name,
        mobile,
        password: hashedPassword,
        role: role || 'USER',
        otp,
        expiresAt,
      },
    })

    // Send email
    const emailTemplate = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2563eb;">Verify Your Email</h2>
        <p>Hello ${name},</p>
        <p>Your OTP for registration as ${role} is:</p>
        <div style="font-size: 32px; font-weight: bold; text-align: center; margin: 30px 0; color: #2563eb; letter-spacing: 5px;">${otp}</div>
        <p>This OTP will expire in 5 minutes.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">Dream Properties SaaS Portal</p>
      </div>
    `

    await transporter.sendMail({
      from: `"Dream Properties" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: 'OTP for SaaS Portal Registration',
      html: emailTemplate,
    })

    return NextResponse.json({ message: 'OTP sent successfully' })
  } catch (error) {
    console.error('SaaS Registration error:', error)
    return NextResponse.json(
      { message: 'Server error during registration' },
      { status: 500 }
    )
  }
}
