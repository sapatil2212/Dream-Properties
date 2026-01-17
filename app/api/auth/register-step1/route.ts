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
    const { name, email, mobile, password, role, propertyType, lookingTo, projectName, propertyAddress } = body

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
        propertyType,
        lookingTo,
        projectName,
        propertyAddress,
        otp,
        expiresAt,
      },
      update: {
        name,
        mobile,
        password: hashedPassword,
        role: role || 'USER',
        propertyType,
        lookingTo,
        projectName,
        propertyAddress,
        otp,
        expiresAt,
      },
    })

    // Send email
    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: sans-serif; color: #334155; }
          .container { max-width: 600px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
          .otp { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px; text-align: center; margin: 20px 0; }
          .footer { font-size: 12px; color: #64748b; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Verify your email</h2>
          <p>Hello ${name}, use the code below to finish setting up your Dream Properties account:</p>
          <div class="otp">${otp}</div>
          <p style="font-size: 13px; color: #64748b;">This code will expire in 5 minutes.</p>
          <div class="footer">© 2026 Dream Properties</div>
        </div>
      </body>
      </html>
    `

    await transporter.sendMail({
      from: `"Dream Properties" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: 'Verify your email - Dream Properties',
      html: emailTemplate,
    })

    return NextResponse.json({ message: 'OTP sent successfully' })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Server error during registration' },
      { status: 500 }
    )
  }
}
