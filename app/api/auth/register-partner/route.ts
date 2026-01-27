import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { sendMobileOtp } from '@/lib/twilio';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, email, mobile, password,
      city, state, partnerType, gstNumber,
      bankName, accountNumber, ifscCode, agreementAccepted
    } = body;

    if (!name || !email || !mobile || !password || !partnerType) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Map RERA/Registration number based on type
    let finalReraNumber = null;
    if (partnerType === 'Individual Broker') finalReraNumber = body.brokerLicense;
    else if (partnerType === 'Channel Partner Firm') finalReraNumber = body.firmRegistrationNumber;
    else if (partnerType === 'Corporate Channel Partner') finalReraNumber = body.corporateRegistrationNumber;

    // Construct metadata for ChannelPartner specific fields
    const cpMetadata = {
        yearsOfExperience: body.yearsOfExperience,
        primaryOperatingArea: body.primaryOperatingArea,
        preferredPropertyType: body.preferredPropertyType,
        
        firmName: body.firmName,
        firmAddress: body.firmAddress,
        authorizedPersonName: body.authorizedPersonName,
        authorizedPersonMobile: body.authorizedPersonMobile,
        authorizedPersonEmail: body.authorizedPersonEmail,
        numberOfAgents: body.numberOfAgents,
        
        profession: body.profession,
        organizationName: body.organizationName,
        relationshipType: body.relationshipType,
        
        companyName: body.companyName,
        websiteUrl: body.websiteUrl,
        leadSourceType: body.leadSourceType,
        monthlyLeadCapacity: body.monthlyLeadCapacity,
        technicalContactPerson: body.technicalContactPerson,
        technicalContactEmail: body.technicalContactEmail,
        billingType: body.billingType,
        
        authorizedSignatoryName: body.authorizedSignatoryName,
        authorizedSignatoryEmail: body.authorizedSignatoryEmail,
        authorizedSignatoryPhone: body.authorizedSignatoryPhone,
        contractValidityPeriod: body.contractValidityPeriod,
    };

    // Store all Channel Partner details in PendingUser metadata
    // We store the data required to create the ChannelPartner record later
    const pendingMetadata = {
        city,
        state,
        partnerType,
        gstNumber,
        reraNumber: finalReraNumber,
        bankName,
        accountNumber,
        ifscCode,
        agreementAccepted: agreementAccepted || false,
        cpMetadata // Nested metadata for the ChannelPartner.metadata field
    };

    // Generate OTPs
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Email OTP
    const mobileOtp = Math.floor(100000 + Math.random() * 900000).toString(); // Mobile OTP
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in pending_users table
    await prisma.pendingUser.upsert({
      where: { email },
      create: {
        email,
        name,
        mobile,
        password: hashedPassword,
        role: 'CHANNEL_PARTNER',
        otp,
        mobileOtp,
        expiresAt,
        metadata: pendingMetadata as any // Cast to any to avoid strict typing issues if schema types aren't regenerated yet
      },
      update: {
        name,
        mobile,
        password: hashedPassword,
        role: 'CHANNEL_PARTNER',
        otp,
        mobileOtp,
        expiresAt,
        metadata: pendingMetadata as any
      },
    });

    // Send Email OTP
    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: sans-serif; color: #334155; }
          .container { max-width: 600px; margin: 20px auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
          .otp { font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px; text-align: center; margin: 20px 0; }
          .footer { font-size: 12px; color: #64748b; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Verify your Channel Partner Account</h2>
          <p>Hello ${name},</p>
          <p>Use the code below to verify your email address:</p>
          <div class="otp">${otp}</div>
          <p>You will also receive a separate code on your mobile number: ${mobile}</p>
          <p style="font-size: 13px; color: #64748b;">This code will expire in 10 minutes.</p>
          <div class="footer">© 2026 Dream Properties</div>
        </div>
      </body>
      </html>
    `;

    try {
        await transporter.sendMail({
            from: `"Dream Properties" <${process.env.EMAIL_USERNAME}>`,
            to: email,
            subject: 'Verify your Channel Partner Registration - Dream Properties',
            html: emailTemplate,
        });
    } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Continue to try sending mobile OTP? Or fail?
        // Better to fail if email is critical, but maybe user provided wrong email?
    }

    // Send Mobile OTP
    try {
        await sendMobileOtp(mobile, mobileOtp);
    } catch (smsError: any) {
        console.error('Error sending SMS:', smsError);
        // Return specific error message if available (e.g. from Twilio)
        const errorMessage = smsError?.message || 'Failed to send Mobile OTP';
        return NextResponse.json({ 
            message: `SMS Verification Failed: ${errorMessage}. Please check the number and try again.` 
        }, { status: 500 });
    }

    return NextResponse.json({ 
        message: 'OTPs sent successfully. Please check your Email and Mobile.',
        email,
        mobile
    });

  } catch (error) {
    console.error('Partner registration error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
