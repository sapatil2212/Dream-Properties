import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { transporter } from '@/lib/mailer';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    console.log(`Password reset requested for: ${email}`);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { name: true }
    });

    if (!user) {
      console.log(`User not found: ${email}`);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Reuse pending_users for OTP storage
    await prisma.pendingUser.upsert({
      where: { email },
      update: {
        otp,
        expiresAt,
        name: 'RESET_PASSWORD',
        mobile: 'N/A',
        password: 'N/A',
        role: 'USER',
      },
      create: {
        email,
        name: 'RESET_PASSWORD',
        mobile: 'N/A',
        password: 'N/A',
        role: 'USER',
        otp,
        expiresAt,
      },
    });

    console.log(`OTP generated for ${email}: ${otp}. Sending email...`);

    await transporter.sendMail({
      from: `"Dream Properties" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: 'Reset your password - Dream Properties',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb;">Reset Password</h2>
          <p>Use the code below to reset your Dream Properties account password:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #2563eb; margin: 20px 0;">${otp}</div>
          <p style="font-size: 12px; color: #666;">This code expires in 5 minutes.</p>
        </div>
      `
    });

    console.log(`OTP email sent successfully to ${email}`);
    return NextResponse.json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Forgot password OTP error:', error);
    return NextResponse.json({ message: 'Failed to send OTP' }, { status: 500 });
  }
}
