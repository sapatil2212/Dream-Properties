import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Block regular users - Dashboard users only
    const dashboardRoles = ['BUILDER', 'ADMIN', 'SUPER_ADMIN', 'SAAS_OWNER', 'TELECALLER', 'SALES_EXECUTIVE'];
    if (!dashboardRoles.includes(session.user.role)) {
      return NextResponse.json({ 
        message: 'Access denied' 
      }, { status: 403 });
    }

    const { email, type } = await request.json();

    if (!email || !type) {
      return NextResponse.json({ 
        message: 'Email and type are required' 
      }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in pending_users table
    await prisma.pendingUser.upsert({
      where: { email: type === 'email' ? email : session.user.email },
      create: {
        email: type === 'email' ? email : session.user.email,
        name: 'DASHBOARD_PROFILE_UPDATE',
        mobile: 'N/A',
        password: 'N/A',
        role: session.user.role,
        otp,
        expiresAt,
      },
      update: {
        otp,
        expiresAt,
      },
    });

    // Send OTP email
    const emailSubject = type === 'email' 
      ? 'Verify Your New Email Address' 
      : 'Password Change Verification';
    
    const emailMessage = type === 'email'
      ? `You requested to change your email address. Use this OTP to verify: ${otp}`
      : `You requested to change your password. Use this OTP to verify: ${otp}`;

    const emailTemplate = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #2563eb;">${emailSubject}</h2>
        <p>Your verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #2563eb; margin: 20px 0;">${otp}</div>
        <p style="font-size: 12px; color: #666;">This code expires in 10 minutes.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Dream Properties" <${process.env.EMAIL_USERNAME}>`,
      to: type === 'email' ? email : session.user.email,
      subject: emailSubject,
      html: emailTemplate,
    });

    return NextResponse.json({ 
      message: 'OTP sent successfully' 
    });
  } catch (error) {
    console.error('OTP request error:', error);
    return NextResponse.json({ 
      message: 'Failed to send OTP' 
    }, { status: 500 });
  }
}
