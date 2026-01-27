import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { transporter } from '@/lib/mailer'

// GET: Fetch leads (role-based)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const assignedTo = searchParams.get('assignedTo')

    const role = session.user.role

    if (role === 'SALES_EXECUTIVE') {
      const userId = parseInt(session.user.id)

      if (!Number.isInteger(userId)) {
        return NextResponse.json({ message: 'Invalid user id' }, { status: 400 })
      }

      let sql = 'SELECT id, sales_executive_id FROM leads WHERE sales_executive_id = ?'
      const params: any[] = [userId]

      if (status) {
        sql += ' AND status = ?'
        params.push(status)
      }

      const idRows: { id: number; sales_executive_id: number | null }[] =
        await prisma.$queryRawUnsafe(sql, ...params)

      if (idRows.length === 0) {
        return NextResponse.json([])
      }

      const ids = idRows.map(r => r.id)
      const execIdMap = new Map<number, number | null>()
      for (const row of idRows) {
        execIdMap.set(row.id, row.sales_executive_id)
      }

      const leads = await prisma.lead.findMany({
        where: {
          id: {
            in: ids
          }
        },
        include: {
          property: {
            select: {
              title: true,
              location: true
            }
          },
          assignedStaff: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          channelPartner: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  mobile: true
                }
              }
            }
          },
          siteVisits: {
            select: {
              id: true,
              visitDate: true,
              status: true,
              staff: {
                select: {
                  id: true,
                  name: true,
                  role: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      let leadsWithSalesExec = leads

      if (leads.length > 0) {
        const execIds = Array.from(
          new Set(
            idRows
              .map(r => r.sales_executive_id)
              .filter((v): v is number => v !== null)
          )
        )

        const execUsers =
          execIds.length > 0
            ? await prisma.user.findMany({
                where: {
                  id: {
                    in: execIds
                  }
                },
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true
                }
              })
            : []

        const execUserMap = new Map<number, any>()
        for (const u of execUsers) {
          execUserMap.set(u.id, u)
        }

        leadsWithSalesExec = leads.map(l => {
          const execId = execIdMap.get(l.id) ?? null
          return {
            ...l,
            salesExecutiveId: execId,
            salesExecutive: execId ? execUserMap.get(execId) ?? null : null
          }
        })
      }

      return NextResponse.json(leadsWithSalesExec)
    }

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'SAAS_OWNER') {
      if (assignedTo) {
        where.assignedTo = parseInt(assignedTo)
      }
    } else if (role === 'TELECALLER') {
      where.assignedTo = parseInt(session.user.id)
    } else if (role === 'CHANNEL_PARTNER') {
        const cp = await prisma.channelPartner.findUnique({
            where: { userId: parseInt(session.user.id) }
        });
        if (cp) {
            where.channelPartnerId = cp.id;
        } else {
            return NextResponse.json([]); // No partner profile
        }
    }

    if (role === 'BUILDER') {
      where.property = {
        builderId: parseInt(session.user.id)
      }
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        property: {
          select: {
            title: true,
            location: true
          }
        },
        assignedStaff: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        channelPartner: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  mobile: true
                }
              }
            }
        },
        siteVisits: {
          select: {
            id: true,
            visitDate: true,
            status: true,
            staff: {
              select: {
                id: true,
                name: true,
                role: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    let leadsWithSalesExec = leads

    if (leads.length > 0) {
      const ids = leads.map(l => l.id)
      const placeholders = ids.map(() => '?').join(',')
      const rows: { id: number; sales_executive_id: number | null }[] =
        await prisma.$queryRawUnsafe(
          `SELECT id, sales_executive_id FROM leads WHERE id IN (${placeholders})`,
          ...ids
        )

      const execIdMap = new Map<number, number | null>()
      for (const row of rows) {
        execIdMap.set(row.id, row.sales_executive_id)
      }

      const execIds = Array.from(
        new Set(
          rows
            .map(r => r.sales_executive_id)
            .filter((v): v is number => v !== null)
        )
      )

      const execUsers =
        execIds.length > 0
          ? await prisma.user.findMany({
              where: {
                id: {
                  in: execIds
                }
              },
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            })
          : []

      const execUserMap = new Map<number, any>()
      for (const u of execUsers) {
        execUserMap.set(u.id, u)
      }

      leadsWithSalesExec = leads.map(l => {
        const execId = execIdMap.get(l.id) ?? null
        return {
          ...l,
          salesExecutiveId: execId,
          salesExecutive: execId ? execUserMap.get(execId) ?? null : null
        }
      })
    }

    return NextResponse.json(leadsWithSalesExec)
  } catch (error) {
    console.error('Fetch leads error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// POST: Create a new lead (public - e.g. from inquiry form)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { name, email, phone, propertyId, propertyTitle, source, message } = body

    if (!name || !email || !phone || !propertyId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    let channelPartnerId: number | null = null;
    let leadSource = source || 'Website';

    if (session?.user?.role === 'CHANNEL_PARTNER') {
        const cp = await prisma.channelPartner.findUnique({
            where: { userId: parseInt(session.user.id) }
        });

        if (!cp || cp.approvalStatus !== 'Approved') {
            return NextResponse.json({ message: 'Channel Partner account not active' }, { status: 403 });
        }

        channelPartnerId = cp.id;
        leadSource = 'Channel Partner';
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        propertyId: parseInt(propertyId),
        propertyOfInterest: propertyTitle || 'Property #' + propertyId,
        source: leadSource,
        lastNote: message || null,
        status: 'New',
        channelPartnerId: channelPartnerId
      }
    })

    try {
      const buyerSubject = 'We received your inquiry - Dream Properties'
      const buyerBody = `
        <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; color: #0f172a;">
          <h2 style="color:#2563eb; margin-bottom: 8px;">Thank you for your inquiry</h2>
          <p style="margin:4px 0 12px 0;">Hi ${name},</p>
          <p style="margin:4px 0 12px 0;">We have received your interest for:</p>
          <p style="font-weight:600; margin:4px 0;">${propertyTitle || 'Property #' + propertyId}</p>
          <p style="margin:12px 0;">Our team will review your requirements and contact you shortly on <strong>${phone}</strong> or <strong>${email}</strong>.</p>
          ${message ? `<pre style="background:#f8fafc; padding:12px; border-radius:8px; font-size:13px; white-space:pre-wrap;">${message}</pre>` : ''}
          <p style="margin-top:20px; font-size:12px; color:#64748b;">Dream Properties • Nashik's Premier Real Estate Platform</p>
        </div>
      `

      await transporter.sendMail({
        from: `"Dream Properties" <${process.env.EMAIL_USERNAME}>`,
        to: email,
        subject: buyerSubject,
        html: buyerBody
      })

      const superAdminEmail = process.env.SUPER_ADMIN_EMAIL
      const internalRecipients: string[] = []
      if (superAdminEmail) internalRecipients.push(superAdminEmail)

      const staffUsers = await prisma.user.findMany({
        where: {
          role: { in: ['ADMIN', 'SAAS_OWNER'] },
          status: 'Active'
        },
        select: { email: true }
      })

      for (const u of staffUsers) {
        if (u.email) internalRecipients.push(u.email)
      }

      let cpDetailsHtml = '';
      if (leadSource === 'Channel Partner' && channelPartnerId) {
          const cp = await prisma.channelPartner.findUnique({
              where: { id: channelPartnerId },
              include: { user: true }
          });
          if (cp && cp.user) {
               cpDetailsHtml = `
                <div style="background:#eff6ff; padding:14px; border-radius:10px; border:1px solid #bfdbfe; margin-bottom:12px;">
                   <h3 style="margin:0 0 8px 0; font-size:14px; color:#1e40af;">Channel Partner Details</h3>
                   <p style="margin:2px 0;"><strong>Name:</strong> ${cp.user.name}</p>
                   <p style="margin:2px 0;"><strong>Email:</strong> ${cp.user.email}</p>
                   <p style="margin:2px 0;"><strong>Phone:</strong> ${cp.user.mobile || 'N/A'}</p>
                </div>
               `;
          }
      }

      if (internalRecipients.length > 0) {
        const internalBody = `
          <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; color: #0f172a;">
            <h2 style="color:#111827; margin-bottom: 10px;">New Website Property Inquiry</h2>
            <p style="margin:4px 0 12px 0;">A new lead has been captured from <strong>${source || 'Website'}</strong>.</p>
            ${cpDetailsHtml}
            <div style="background:#f9fafb; padding:14px; border-radius:10px; border:1px solid #e5e7eb; margin-bottom:12px;">
              <p style="margin:2px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin:2px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin:2px 0;"><strong>Phone:</strong> ${phone}</p>
              <p style="margin:2px 0;"><strong>Property:</strong> ${propertyTitle || 'Property #' + propertyId}</p>
              <p style="margin:2px 0;"><strong>Lead ID:</strong> ${lead.id}</p>
            </div>
            ${message ? `<pre style="background:#f8fafc; padding:12px; border-radius:8px; font-size:13px; white-space:pre-wrap;">${message}</pre>` : ''}
          </div>
        `

        await transporter.sendMail({
          from: `"Dream Properties" <${process.env.EMAIL_USERNAME}>`,
          to: internalRecipients,
          subject: `New Property Inquiry: ${propertyTitle || 'Property #' + propertyId}`,
          html: internalBody
        })
      }
    } catch (emailError) {
      console.error('Lead email notification error:', emailError)
    }

    return NextResponse.json({ message: 'Inquiry submitted successfully', lead })
  } catch (error) {
    console.error('Create lead error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

// PATCH: Update basic lead information (staff only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const role = session.user.role
    if (role === 'USER' || role === 'BUYER') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { leadId, name, email, phone } = body

    if (!leadId) {
      return NextResponse.json({ message: 'leadId is required' }, { status: 400 })
    }

    const parsedLeadId = parseInt(leadId)
    if (!Number.isInteger(parsedLeadId)) {
      return NextResponse.json({ message: 'Invalid leadId' }, { status: 400 })
    }

    const data: any = {}

    if (typeof name === 'string' && name.trim()) {
      data.name = name.trim()
    }
    if (typeof email === 'string' && email.trim()) {
      data.email = email.trim()
    }
    if (typeof phone === 'string' && phone.trim()) {
      data.phone = phone.trim()
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 })
    }

    const lead = await prisma.lead.update({
      where: { id: parsedLeadId },
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

    return NextResponse.json({ message: 'Lead updated successfully', lead })
  } catch (error) {
    console.error('Update lead error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
