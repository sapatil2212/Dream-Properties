import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { transporter } from '@/lib/mailer'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { leadId, status, lastNote } = body

    if (!leadId || !status) {
      return NextResponse.json({ message: 'leadId and status are required' }, { status: 400 })
    }

    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'SAAS_OWNER', 'TELECALLER', 'SALES_EXECUTIVE']
    const role = (session.user as any).role

    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const data: any = {
      status,
      lastNote: typeof lastNote === 'string' && lastNote.trim().length > 0 ? lastNote.trim() : undefined
    }

    const lead = await prisma.lead.update({
      where: { id: parseInt(leadId) },
      data,
      include: {
        property: {
          select: {
            title: true,
            location: true
          }
        }
      }
    })

    // Commission Calculation Logic
    if (status === 'Closed' && lead.channelPartnerId) {
        const dealValue = body.dealValue ? parseFloat(body.dealValue) : 0;
        if (dealValue > 0) {
            const cp = await prisma.channelPartner.findUnique({
                where: { id: lead.channelPartnerId }
            });
            
            if (cp) {
                const rate = cp.commissionRate || 2.0; // Default 2% if not set
                const commissionAmount = (dealValue * rate) / 100;
                
                // Check if commission already exists
                const existingComm = await prisma.commission.findFirst({
                    where: { leadId: lead.id }
                });

                if (!existingComm) {
                    await prisma.commission.create({
                        data: {
                            channelPartnerId: cp.id,
                            leadId: lead.id,
                            dealValue: dealValue,
                            commissionRate: rate,
                            commissionAmount: commissionAmount,
                            status: 'Pending'
                        }
                    });
                }
            }
        }
    }

    try {
      const superAdminEmail = process.env.SUPER_ADMIN_EMAIL
      const recipients: string[] = []

      if (lead.email) {
        recipients.push(lead.email)
      }

      if (superAdminEmail) {
        recipients.push(superAdminEmail)
      }

      const adminUsers = await prisma.user.findMany({
        where: {
          role: { in: ['ADMIN', 'SAAS_OWNER'] },
          status: 'Active'
        },
        select: { email: true }
      })

      for (const u of adminUsers) {
        if (u.email) {
          recipients.push(u.email)
        }
      }

      const uniqueRecipients = Array.from(new Set(recipients)).filter(Boolean)

      if (uniqueRecipients.length > 0) {
        const propertyTitle = lead.property?.title || lead.propertyOfInterest || `Property #${lead.propertyId}`
        const updatedBy = session.user?.name || session.user?.email || 'Staff User'

        const html = `
          <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; color: #0f172a;">
            <h2 style="color:#2563eb; margin-bottom: 10px;">Lead Status Updated</h2>
            <p style="margin:4px 0 10px 0;">The status of a lead has been updated by <strong>${updatedBy}</strong>.</p>
            <div style="background:#f9fafb; padding:14px; border-radius:10px; border:1px solid #e5e7eb; margin-bottom:12px;">
              <p style="margin:2px 0;"><strong>Lead:</strong> ${lead.name}</p>
              <p style="margin:2px 0;"><strong>Contact:</strong> ${lead.phone} • ${lead.email}</p>
              <p style="margin:2px 0;"><strong>Property:</strong> ${propertyTitle}</p>
              <p style="margin:2px 0;"><strong>New Status:</strong> ${status}</p>
              ${lead.lastNote ? `<p style="margin:8px 0 2px 0;"><strong>Notes:</strong></p><pre style="background:#e5e7eb; padding:10px; border-radius:8px; font-size:13px; white-space:pre-wrap;">${lead.lastNote}</pre>` : ''}
            </div>
            <p style="margin-top:16px; font-size:12px; color:#64748b;">Dream Properties • Lead Management Update</p>
          </div>
        `

        await transporter.sendMail({
          from: `"Dream Properties" <${process.env.EMAIL_USERNAME}>`,
          to: uniqueRecipients,
          subject: `Lead Status Updated - ${propertyTitle}`,
          html
        })
      }
    } catch (emailError) {
      console.error('Lead status email notification error:', emailError)
    }

    return NextResponse.json({ message: 'Lead status updated', lead })
  } catch (error) {
    console.error('Update lead status error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
