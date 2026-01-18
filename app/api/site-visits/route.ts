import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { transporter } from '@/lib/mailer';

import { UserRole } from '@prisma/client';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const staffId = searchParams.get('staffId');

  const where: any = {};
  if (status) where.status = status;
  if (staffId) where.staffId = parseInt(staffId);
  
  // Role based filtering
  const userRole = (session.user as any).role;
  if (userRole === 'SALES_EXECUTIVE' || userRole === 'TELECALLER') {
    where.staffId = parseInt(session.user.id);
  }

  try {
    const visits = await (prisma as any).siteVisit.findMany({
      where,
      include: {
        lead: true,
        property: true,
        staff: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        visitDate: 'asc'
      }
    });

    return NextResponse.json(visits);
  } catch (error) {
    console.error('Get site visits error:', error);
    return NextResponse.json({ message: 'Error fetching site visits' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { leadId, propertyId, staffId, visitDate, notes } = body;

    const parsedLeadId = parseInt(leadId);
    const parsedPropertyId = parseInt(propertyId);
    let parsedStaffId = parseInt(staffId);
    const parsedVisitDate = new Date(visitDate);

    const userRole = (session.user as any).role;

    if (userRole === 'TELECALLER') {
      const rows: { sales_executive_id: number | null }[] =
        await (prisma as any).$queryRawUnsafe(
          'SELECT sales_executive_id FROM leads WHERE id = ? LIMIT 1',
          parsedLeadId
        );

      const salesExecId = rows[0]?.sales_executive_id ?? null;

      if (salesExecId && Number.isInteger(salesExecId)) {
        parsedStaffId = salesExecId;
      } else {
        parsedStaffId = parseInt((session.user as any).id);
      }
    }

    const existingVisit = await (prisma as any).siteVisit.findFirst({
      where: {
        leadId: parsedLeadId,
        propertyId: parsedPropertyId,
        staffId: parsedStaffId,
        status: 'Scheduled'
      },
      orderBy: {
        visitDate: 'desc'
      },
      include: {
        lead: true,
        property: true,
        staff: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    });

    const visit = existingVisit
      ? await (prisma as any).siteVisit.update({
          where: { id: existingVisit.id },
          data: {
            visitDate: parsedVisitDate,
            notes
          },
          include: {
            lead: true,
            property: true,
            staff: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        })
      : await (prisma as any).siteVisit.create({
          data: {
            leadId: parsedLeadId,
            propertyId: parsedPropertyId,
            staffId: parsedStaffId,
            visitDate: parsedVisitDate,
            notes,
            status: 'Scheduled'
          },
          include: {
            lead: true,
            property: true,
            staff: {
              select: {
                name: true,
                email: true,
              }
            }
          }
        });

    if (existingVisit) {
      await (prisma as any).siteVisit.updateMany({
        where: {
          leadId: parsedLeadId,
          propertyId: parsedPropertyId,
          staffId: parsedStaffId,
          status: 'Scheduled',
          NOT: { id: visit.id }
        },
        data: {
          status: 'Cancelled'
        }
      });
    }

    await (prisma as any).lead.update({
      where: { id: parsedLeadId },
      data: { status: 'Site Visit Scheduled' }
    });

    try {
      const when = new Date(visit.visitDate).toLocaleString();

      if (visit.staff?.email) {
        const staffHtml = `
          <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; color: #0f172a;">
            <h2 style="color:#2563eb; margin-bottom: 10px;">New Site Visit Assigned</h2>
            <p style="margin:4px 0 10px 0;">A new site visit has been scheduled and assigned to you.</p>
            <div style="background:#f9fafb; padding:14px; border-radius:10px; border:1px solid #e5e7eb; margin-bottom:12px;">
              <p style="margin:2px 0;"><strong>Client:</strong> ${visit.lead?.name}</p>
              <p style="margin:2px 0;"><strong>Property:</strong> ${visit.property?.title}</p>
              <p style="margin:2px 0;"><strong>Date & Time:</strong> ${when}</p>
              <p style="margin:2px 0;"><strong>Contact:</strong> ${visit.lead?.phone} • ${visit.lead?.email}</p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"Dream Properties" <${process.env.EMAIL_USERNAME}>`,
          to: visit.staff.email,
          subject: `New Site Visit Scheduled - ${visit.property?.title || 'Property'}`,
          html: staffHtml
        });
      }

      if (visit.lead?.email) {
        const buyerHtml = `
          <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 20px; color: #0f172a;">
            <h2 style="color:#16a34a; margin-bottom: 10px;">Your Site Visit is Scheduled</h2>
            <p style="margin:4px 0 10px 0;">Hi ${visit.lead.name},</p>
            <p style="margin:4px 0 10px 0;">Your visit for <strong>${visit.property?.title}</strong> has been scheduled.</p>
            <p style="margin:4px 0 10px 0;"><strong>Date & Time:</strong> ${when}</p>
            <p style="margin-top:16px; font-size:12px; color:#64748b;">Our team may contact you on ${visit.lead.phone} for confirmation.</p>
          </div>
        `;

        await transporter.sendMail({
          from: `"Dream Properties" <${process.env.EMAIL_USERNAME}>`,
          to: visit.lead.email,
          subject: 'Site Visit Confirmation - Dream Properties',
          html: buyerHtml
        });
      }
    } catch (emailError) {
      console.error('Site visit email notification error:', emailError);
    }

    try {
      const userRole = (session.user as any).role;
      if (userRole === 'TELECALLER') {
        const admins = await prisma.user.findMany({
          where: {
            role: {
              in: ['ADMIN', 'SUPER_ADMIN']
            }
          },
          select: {
            id: true
          }
        });

        const when = new Date(visit.visitDate).toLocaleString();
        const propertyTitle = visit.property?.title || 'Property';
        const leadName = visit.lead?.name || 'Client';
        const message = `New site visit scheduled for ${leadName} - ${propertyTitle} on ${when}. Assign a sales executive to manage this visit.`;

        for (const admin of admins) {
          await prisma.notification.create({
            data: {
              userId: admin.id,
              type: 'site_visit_scheduled',
              title: 'New Site Visit Scheduled',
              message,
              link: '/dashboard/site-visits'
            }
          });
        }
      }
    } catch (notificationError) {
      console.error('Site visit notification error:', notificationError);
    }

    return NextResponse.json(visit);
  } catch (error) {
    console.error('Create site visit error:', error);
    return NextResponse.json({ message: 'Error creating site visit' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { visitId, visitStatus, leadStatus, remark, staffId } = body;

    if (!visitId) {
      return NextResponse.json({ message: 'visitId is required' }, { status: 400 });
    }

    const parsedVisitId = parseInt(visitId);
    if (!Number.isInteger(parsedVisitId)) {
      return NextResponse.json({ message: 'Invalid visitId' }, { status: 400 });
    }

    const userRole = (session.user as any).role;
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

    const visitUpdateData: any = {};

    if (visitStatus) {
      visitUpdateData.status = visitStatus;
    }

    if (remark !== undefined) {
      visitUpdateData.notes = remark;
    }

    let parsedStaffId: number | null = null;

    if (staffId) {
      if (!isAdmin) {
        return NextResponse.json({ message: 'Only admins can reassign site visits' }, { status: 403 });
      }
      parsedStaffId = parseInt(staffId);
      if (!Number.isInteger(parsedStaffId)) {
        return NextResponse.json({ message: 'Invalid staffId' }, { status: 400 });
      }
      visitUpdateData.staffId = parsedStaffId;
    }

    if (Object.keys(visitUpdateData).length === 0 && !leadStatus) {
      return NextResponse.json({ message: 'No changes provided' }, { status: 400 });
    }

    const updatedVisit = await (prisma as any).siteVisit.update({
      where: { id: parsedVisitId },
      data: visitUpdateData,
      include: {
        lead: true,
        property: true,
        staff: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (leadStatus || remark) {
      const leadUpdateData: any = {};
      if (leadStatus) {
        leadUpdateData.status = leadStatus;
      }
      if (remark && typeof remark === 'string' && remark.trim().length > 0) {
        leadUpdateData.lastNote = remark.trim();
      }
      leadUpdateData.lastContactAt = new Date();

      await (prisma as any).lead.update({
        where: { id: updatedVisit.leadId },
        data: leadUpdateData
      });
    }

    if (parsedStaffId && isAdmin) {
      const staffUser = await prisma.user.findUnique({
        where: { id: parsedStaffId },
        select: {
          id: true
        }
      });

      if (staffUser) {
        const when = new Date(updatedVisit.visitDate).toLocaleString();
        const propertyTitle = updatedVisit.property?.title || 'Property';
        const leadName = updatedVisit.lead?.name || 'Client';

        await prisma.notification.create({
          data: {
            userId: staffUser.id,
            type: 'site_visit_assigned',
            title: 'New Site Visit Assigned',
            message: `You have been assigned a site visit for ${leadName} - ${propertyTitle} on ${when}.`,
            link: '/dashboard'
          }
        });
      }
    }

    return NextResponse.json({ visit: updatedVisit });
  } catch (error) {
    console.error('Update site visit error:', error);
    return NextResponse.json({ message: 'Error updating site visit' }, { status: 500 });
  }
}
