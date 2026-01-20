import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { transporter } from '@/lib/mailer'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// POST: Handle contact form submissions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, subject, message, interestedIn, city, state } = body

    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { message: 'First name, last name, email, and message are required' },
        { status: 400 }
      )
    }

    const inquiry = await prisma.contactInquiry.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || '',
        subject: subject || 'Contact Form Inquiry',
        message: message,
        interestedIn: interestedIn || null,
        city: city || null,
        state: state || null,
      }
    })

    // Email Logic
    const logoUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://dreamproperties.com'}/assets/dp-logo.png`;
    const fullName = `${firstName} ${lastName}`;
    
    // 1. Admin Notification Template
    const adminTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { height: 40px; display: inline-block; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
          .field { margin-bottom: 12px; }
          .label { font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
          .value { font-size: 16px; font-weight: 600; color: #0f172a; }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 40px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="Dream Properties" class="logo" />
            <h2>New Contact Inquiry</h2>
          </div>
          
          <div class="card">
            <div class="field">
              <div class="label">Name</div>
              <div class="value">${fullName}</div>
            </div>
            <div class="field">
              <div class="label">Email</div>
              <div class="value">${email}</div>
            </div>
            <div class="field">
              <div class="label">Phone</div>
              <div class="value">${phone || '-'}</div>
            </div>
            <div class="field">
              <div class="label">Interested In</div>
              <div class="value">${interestedIn || '-'}</div>
            </div>
            <div class="field">
              <div class="label">Location</div>
              <div class="value">${city || '-'}, ${state || '-'}</div>
            </div>
          </div>

          <div class="card">
            <div class="label">Message</div>
            <p style="margin-top: 8px;">${message}</p>
          </div>

          <div class="footer">
            &copy; ${new Date().getFullYear()} Dream Properties. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    // 2. User Confirmation Template
    const userTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { height: 40px; display: inline-block; }
          .content { text-align: center; padding: 20px 0; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px; }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="Dream Properties" class="logo" />
          </div>
          
          <div class="content">
            <h1 style="color: #0f172a; margin-bottom: 16px;">Thank you for contacting us!</h1>
            <p>Hi ${firstName},</p>
            <p>We have received your inquiry regarding <strong>${interestedIn || 'property services'}</strong>.</p>
            <p>Our team will review your message and get back to you shortly.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || '#'}" class="button">Visit Website</a>
          </div>

          <div class="footer">
            <p><strong>Dream Properties</strong></p>
            <p>Office No 957, Roongtha Future-X, RD circle, Nashik 422 009</p>
            <p>+91 98811 59245 | dreampropertiesnsk@gmail.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send Admin Email (with BCC)
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || process.env.EMAIL_USERNAME;
    const bccEmail = process.env.EMAIL_BCC;

    // Send to Admin
    if (superAdminEmail) {
       await transporter.sendMail({
        from: `"Dream Properties Website" <${process.env.EMAIL_USERNAME}>`,
        to: superAdminEmail,
        bcc: bccEmail,
        subject: `New Inquiry: ${fullName} - ${interestedIn || 'General'}`,
        html: adminTemplate
      });
    }

    // Send to User
    await transporter.sendMail({
      from: `"Dream Properties" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: 'We received your inquiry - Dream Properties',
      html: userTemplate
    });

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

// GET: Fetch inquiries based on role
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;
    // Handle 'superadmin' id which is string vs number id for users
    const userId = session.user.id === 'superadmin' ? 0 : parseInt(session.user.id);

    let whereClause: any = {};

    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      // Admins see all
    } else if (['TELECALLER', 'SALES_EXECUTIVE'].includes(userRole)) {
      // Staff see only assigned
      whereClause = { assignedTo: userId };
    } else {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const inquiries = await prisma.contactInquiry.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedStaff: {
          select: { name: true, email: true }
        }
      }
    });
    return NextResponse.json(inquiries);
  } catch (error) {
    console.error('Fetch inquiries error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}
