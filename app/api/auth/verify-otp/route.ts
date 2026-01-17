import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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

    // Create user (convert OWNER to BUILDER for database)
    const finalRole = (pendingUser.role as string) === 'OWNER' ? 'BUILDER' : pendingUser.role;
    const user = await prisma.user.create({
      data: {
        name: pendingUser.name,
        email: pendingUser.email,
        mobile: pendingUser.mobile,
        password: pendingUser.password,
        role: finalRole,
        propertyType: pendingUser.propertyType,
        lookingTo: pendingUser.lookingTo,
        projectName: pendingUser.projectName,
        propertyAddress: pendingUser.propertyAddress,
      },
    })

    // Delete pending user
    await prisma.pendingUser.delete({
      where: { email },
    })

    // Send confirmation email for builders
    if (user.role === 'BUILDER') {
      const builderEmailTemplate = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: sans-serif; color: #334155;">
          <div style="max-width: 600px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
            <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 20px; border-radius: 8px; text-align: center;">
              <h2 style="margin:0;">Welcome to Dream Properties!</h2>
            </div>
            <div style="padding: 20px 0;">
              <p>Dear ${user.name},</p>
              <p>Congratulations! Your builder account has been successfully created.</p>
              <p><strong>Account Details:</strong></p>
              <ul>
                <li>Email: ${user.email}</li>
                <li>Mobile: ${user.mobile}</li>
                <li>Firm: ${user.projectName || 'N/A'}</li>
              </ul>
              <p>You can now log in to your dashboard and start managing your properties.</p>
            </div>
            <div style="font-size: 12px; color: #64748b; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
              © 2026 Dream Properties
            </div>
          </div>
        </body>
        </html>
      `

      await transporter.sendMail({
        from: `"Dream Properties" <${process.env.EMAIL_USERNAME}>`,
        to: user.email,
        subject: 'Welcome to Dream Properties - Account Activated',
        html: builderEmailTemplate,
      })

      // Notify admins
      const adminNotificationTemplate = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: sans-serif; color: #334155;">
          <div style="max-width: 600px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
            <h2>New Builder Registration</h2>
            <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p><strong>New builder has signed up:</strong></p>
              <ul>
                <li><strong>Name:</strong> ${user.name}</li>
                <li><strong>Email:</strong> ${user.email}</li>
                <li><strong>Mobile:</strong> ${user.mobile}</li>
                <li><strong>Firm:</strong> ${user.projectName || 'N/A'}</li>
              </ul>
            </div>
          </div>
        </body>
        </html>
      `

      // Send to super admin
      if (process.env.SUPER_ADMIN_EMAIL) {
        await transporter.sendMail({
          from: `"Dream Properties" <${process.env.EMAIL_USERNAME}>`,
          to: process.env.SUPER_ADMIN_EMAIL,
          subject: `New Builder Registration: ${user.name}`,
          html: adminNotificationTemplate,
        })
      }

      // Send to all active admins
      const admins = await prisma.user.findMany({
        where: {
          role: 'ADMIN',
          status: 'Active',
        },
        select: { email: true },
      })

      for (const admin of admins) {
        await transporter.sendMail({
          from: `"Dream Properties" <${process.env.EMAIL_USERNAME}>`,
          to: admin.email,
          subject: `New Builder Registration: ${user.name}`,
          html: adminNotificationTemplate,
        })
      }
    }

    return NextResponse.json({ message: 'Account verified and created successfully' })
  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json(
      { message: 'Verification failed' },
      { status: 500 }
    )
  }
}
