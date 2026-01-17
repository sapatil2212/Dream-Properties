import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { transporter } from '@/lib/mailer';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { propertyId, status } = await request.json();

    if (!['Approved', 'Rejected'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    const property = await prisma.property.update({
      where: { id: parseInt(propertyId) },
      data: { status: status as any },
      include: {
        builder: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create notification for the builder
    await prisma.notification.create({
      data: {
        userId: property.builderId,
        type: status === 'Approved' ? 'property_approved' : 'property_rejected',
        title: `Property ${status}`,
        message: `Your property "${property.title}" has been ${status.toLowerCase()} by the admin.`,
        link: status === 'Approved' ? `/properties/${property.id}` : `/dashboard/properties`,
      },
    });

    // Send email notification to builder
    const emailSubject = status === 'Approved' 
      ? '✅ Property Listing Approved - Dream Properties'
      : '❌ Property Listing Rejected - Dream Properties';

    const emailBody = status === 'Approved' ? `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; }
            .content { padding: 40px 30px; }
            .property-box { background: #fafafa; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e0e0e0; }
            .button { display: inline-block; background: #333; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 30px; background: #fafafa; border-top: 1px solid #e0e0e0; }
            .logo { color: #333; font-size: 20px; font-weight: bold; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h2 style="color: #333; margin-top: 0;">Property Listing Approved</h2>
              
              <p>Dear ${property.builder.name},</p>
              
              <p>Your property listing has been approved and is now live on Dream Properties.</p>
              
              <div class="property-box">
                <h3 style="margin-top: 0; color: #333; font-size: 18px;">${property.title}</h3>
                <p style="color: #666; margin: 8px 0; font-size: 14px;"><strong>Location:</strong> ${property.location || 'N/A'}</p>
                <p style="color: #666; margin: 8px 0; font-size: 14px;"><strong>Price:</strong> ${property.price || 'N/A'}</p>
                <p style="color: #666; margin: 8px 0; font-size: 14px;"><strong>Type:</strong> ${property.type || 'N/A'}</p>
              </div>

              <p>Your property is now visible to potential buyers and will start receiving inquiries.</p>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/properties/${property.id}" class="button">
                  View Property Listing
                </a>
              </div>

              <p style="margin-top: 30px; font-size: 14px;"><strong>Next Steps:</strong></p>
              <ul style="color: #666; font-size: 14px;">
                <li>Monitor leads and inquiries from your dashboard</li>
                <li>Respond promptly to potential buyers</li>
                <li>Keep your property details updated</li>
              </ul>

              <p style="color: #666; font-size: 14px; margin-top: 30px;">If you have any questions, feel free to contact our support team.</p>
            </div>

            <div class="footer">
              <p style="color: #666; font-size: 13px; margin: 0;">Thank you for choosing</p>
              <div class="logo">DREAM PROPERTIES</div>
              <p style="color: #999; font-size: 12px; margin-top: 5px;">Nashik's Premier Real Estate Platform</p>
            </div>
          </div>
        </body>
      </html>
    ` : `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; }
            .content { padding: 40px 30px; }
            .property-box { background: #fafafa; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e0e0e0; }
            .button { display: inline-block; background: #333; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; padding: 30px; background: #fafafa; border-top: 1px solid #e0e0e0; }
            .logo { color: #333; font-size: 20px; font-weight: bold; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h2 style="color: #333; margin-top: 0;">Property Listing Update</h2>
              
              <p>Dear ${property.builder.name},</p>
              
              <p>Your property listing has been reviewed and requires attention.</p>
              
              <div class="property-box">
                <h3 style="margin-top: 0; color: #333; font-size: 18px;">${property.title}</h3>
                <p style="color: #666; margin: 8px 0; font-size: 14px;"><strong>Location:</strong> ${property.location || 'N/A'}</p>
              </div>

              <p style="font-size: 14px;"><strong>Common reasons for review:</strong></p>
              <ul style="color: #666; font-size: 14px;">
                <li>Incomplete property information</li>
                <li>Missing or low-quality images</li>
                <li>Incorrect pricing or details</li>
                <li>Violation of listing guidelines</li>
              </ul>

              <p>Please review your property details and resubmit with the necessary corrections.</p>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/properties" class="button">
                  Go to Dashboard
                </a>
              </div>

              <p style="color: #666; font-size: 14px; margin-top: 30px;">If you need assistance or have questions, please contact our support team.</p>
            </div>

            <div class="footer">
              <p style="color: #666; font-size: 13px; margin: 0;">Thank you for choosing</p>
              <div class="logo">DREAM PROPERTIES</div>
              <p style="color: #999; font-size: 12px; margin-top: 5px;">Nashik's Premier Real Estate Platform</p>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await transporter.sendMail({
        from: `"Dream Properties" <${process.env.EMAIL_USERNAME}>`,
        to: property.builder.email,
        subject: emailSubject,
        html: emailBody,
      });
      console.log(`Email sent to ${property.builder.email} for property ${status.toLowerCase()}`);
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({ message: `Property ${status.toLowerCase()} successfully` });
  } catch (error) {
    console.error('Approve property error:', error);
    return NextResponse.json({ message: 'Failed to update property status' }, { status: 500 });
  }
}
