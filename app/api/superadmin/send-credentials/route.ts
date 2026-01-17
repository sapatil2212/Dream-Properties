import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { transporter } from '@/lib/mailer'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { email } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const emailTemplate = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #2563eb;">Your Login Credentials</h2>
        <p>Hello <b>${user.name}</b>,</p>
        <p>Your account access details are provided below:</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><b>Name:</b> ${user.name}</p>
          <p style="margin: 5px 0;"><b>Email ID:</b> ${user.email}</p>
          <p style="margin: 5px 0; font-size: 18px; color: #1e293b;"><b>Security Key for Login:</b> <span style="font-family: monospace; font-weight: bold; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${user.securityKey || 'N/A'}</span></p>
        </div>

        <p>Please use these details to access your dashboard.</p>
        <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #64748b;">
          <p>© 2026 Dream Properties SaaS</p>
        </div>
      </div>
    `

    await transporter.sendMail({
      from: `"Dream Properties Admin" <${process.env.EMAIL_USERNAME}>`,
      to: user.email,
      subject: 'Access Credentials - Dream Properties',
      html: emailTemplate
    })

    return NextResponse.json({ message: 'Credentials sent to ' + user.email })
  } catch (error) {
    console.error('Send credentials error:', error)
    return NextResponse.json({ message: 'Failed to send email' }, { status: 500 })
  }
}
