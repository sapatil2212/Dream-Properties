import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
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

// Helper to generate random security key
const generateSecurityKey = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp } = body

    // Find pending user with valid OTP
    const pendingUser = await prisma.pendingUser.findFirst({
      where: {
        email,
        otp,
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    if (!pendingUser) {
      return NextResponse.json(
        { message: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    const securityKey = generateSecurityKey();

    // Create user
    const user = await prisma.user.create({
      data: {
        name: pendingUser.name,
        email: pendingUser.email,
        mobile: pendingUser.mobile,
        password: pendingUser.password,
        role: pendingUser.role,
        securityKey,
      },
    })

    // Delete pending user
    await prisma.pendingUser.delete({
      where: { email },
    })

    // Send emails based on role
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    
    // Email content for the user
    await transporter.sendMail({
      from: `"Dream Properties" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: 'Registration Successful - Dream Properties',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Registration Successful!</h2>
          <p>Hello ${user.name}, your registration as <b>${user.role}</b> is successful.</p>
          <p>Your login details (including the required Security Key) will be received via email shortly after admin approval if required, or you can use the key sent to your admin.</p>
        </div>
      `
    });

    // Email content for Security Key
    const keyEmailHtml = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
        <h3 style="color: #2563eb;">New ${user.role} Registered</h3>
        <p><b>Name:</b> ${user.name}</p>
        <p><b>Email:</b> ${user.email}</p>
        <p><b>Mobile:</b> ${user.mobile}</p>
        <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px;">
          <p style="margin: 0; color: #64748b;">Security Key for Login:</p>
          <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #1e293b;">${securityKey}</p>
        </div>
      </div>
    `;

    // Send to Super Admin
    if (superAdminEmail) {
      await transporter.sendMail({
        from: `"Dream Properties Alert" <${process.env.EMAIL_USERNAME}>`,
        to: superAdminEmail,
        subject: `Security Key Generated for ${user.role}: ${user.name}`,
        html: keyEmailHtml
      });
    }

    return NextResponse.json({ message: 'Registration successful login details will be received via email' })
  } catch (error) {
    console.error('SaaS Verification error:', error)
    return NextResponse.json(
      { message: 'Verification failed' },
      { status: 500 }
    )
  }
}
