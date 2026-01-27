import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, emailOtp, mobileOtp } = await request.json();

    if (!email || !emailOtp || !mobileOtp) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const pendingUser = await prisma.pendingUser.findUnique({ where: { email } });

    if (!pendingUser) {
      return NextResponse.json({ message: 'Registration request not found or expired' }, { status: 400 });
    }

    if (new Date() > pendingUser.expiresAt) {
        return NextResponse.json({ message: 'OTP expired' }, { status: 400 });
    }

    if (pendingUser.otp !== emailOtp) {
        return NextResponse.json({ message: 'Invalid Email OTP' }, { status: 400 });
    }

    // Check mobile OTP (handle potential null from schema)
    if (!pendingUser.mobileOtp || pendingUser.mobileOtp !== mobileOtp) {
        return NextResponse.json({ message: 'Invalid Mobile OTP' }, { status: 400 });
    }

    // All good, create user
    // Cast metadata to any to access properties since it's stored as Json
    const metadata = pendingUser.metadata as any;

    if (!metadata) {
         return NextResponse.json({ message: 'Missing registration data' }, { status: 500 });
    }

    await prisma.$transaction(async (tx) => {
        await tx.user.create({
            data: {
                name: pendingUser.name,
                email: pendingUser.email,
                mobile: pendingUser.mobile,
                password: pendingUser.password,
                role: 'CHANNEL_PARTNER',
                status: 'Disabled', // Pending Approval
                channelPartner: {
                    create: {
                        city: metadata.city,
                        state: metadata.state,
                        partnerType: metadata.partnerType,
                        gstNumber: metadata.gstNumber,
                        reraNumber: metadata.reraNumber,
                        bankName: metadata.bankName,
                        accountNumber: metadata.accountNumber,
                        ifscCode: metadata.ifscCode,
                        agreementAccepted: metadata.agreementAccepted,
                        approvalStatus: 'Pending',
                        metadata: metadata.cpMetadata
                    }
                }
            }
        });

        await tx.pendingUser.delete({ where: { email } });
    });

    return NextResponse.json({ message: 'Verification successful. Account is pending approval.' });

  } catch (error) {
    console.error('Partner verification error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
