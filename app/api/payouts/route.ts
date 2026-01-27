import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role;
    let whereClause: any = {};

    if (role === 'CHANNEL_PARTNER') {
        const cp = await prisma.channelPartner.findUnique({
            where: { userId: parseInt(session.user.id) }
        });
        if (!cp) return NextResponse.json({ message: 'Partner profile not found' }, { status: 404 });
        whereClause.channelPartnerId = cp.id;
    } else if (!['ADMIN', 'SUPER_ADMIN', 'SAAS_OWNER'].includes(role)) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const payouts = await prisma.payout.findMany({
      where: whereClause,
      include: {
        channelPartner: {
            include: { user: { select: { name: true } } }
        }
        // commissions: {
        //    select: { id: true, commissionAmount: true, lead: { select: { name: true } } }
        // }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(payouts);
  } catch (error) {
    console.error('Error fetching payouts:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'SUPER_ADMIN', 'SAAS_OWNER'].includes(session.user.role)) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { channelPartnerId, commissionIds, transactionRef, paymentMode, notes } = body;

        if (!channelPartnerId || !commissionIds || !Array.isArray(commissionIds) || commissionIds.length === 0) {
            return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
        }

        // Calculate total amount
        const commissions = await prisma.commission.findMany({
            where: {
                id: { in: commissionIds },
                channelPartnerId: channelPartnerId,
                status: { not: 'Paid' } // Prevent double paying
            }
        });

        if (commissions.length !== commissionIds.length) {
             return NextResponse.json({ message: 'Some commissions are invalid or already paid' }, { status: 400 });
        }

        const totalAmount = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);

        // Transaction
        const payout = await prisma.$transaction(async (tx) => {
            // 1. Create Payout
            const p = await tx.payout.create({
                data: {
                    channelPartnerId,
                    amount: totalAmount,
                    transactionId: transactionRef, // Mapped to transactionId
                    // paymentMode, // Not in schema
                    // notes, // Not in schema
                    status: 'Completed',
                    processedAt: new Date() // Mapped to processedAt
                }
            });

            // 2. Update Commissions
            await tx.commission.updateMany({
                where: { id: { in: commissionIds } },
                data: {
                    status: 'Paid',
                    // payoutId: p.id // Not in schema
                }
            });

            return p;
        });

        return NextResponse.json({ message: 'Payout processed successfully', payout });

    } catch (error) {
        console.error('Error processing payout:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
