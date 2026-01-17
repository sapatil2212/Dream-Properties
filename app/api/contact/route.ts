import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST: Handle contact form submissions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { message: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    const inquiry = await prisma.contactInquiry.create({
      data: {
        name,
        email,
        phone: phone || '',
        subject: subject || 'General Inquiry',
        message
      }
    })

    return NextResponse.json({
      message: 'Thank you for contacting us. We will get back to you soon!',
      inquiry
    })
  } catch (error) {
    console.error('Contact inquiry error:', error)
    return NextResponse.json(
      { message: 'Failed to submit inquiry' },
      { status: 500 }
    )
  }
}
