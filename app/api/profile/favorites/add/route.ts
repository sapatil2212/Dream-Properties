import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { propertyId } = await request.json()
    if (!propertyId) {
      return NextResponse.json({ message: 'Property ID required' }, { status: 400 })
    }

    const result = await prisma.favorite.upsert({
      where: {
        userId_propertyId: {
          userId: parseInt(session.user.id),
          propertyId: parseInt(propertyId),
        },
      },
      create: {
        userId: parseInt(session.user.id),
        propertyId: parseInt(propertyId),
      },
      update: {},
      include: {
        property: {
          select: {
            title: true
          }
        }
      }
    })

    // Create Notifications
    try {
      const propertyTitle = result.property.title;
      const buyerId = parseInt(session.user.id);
      const buyerName = session.user.name || 'A buyer';

      // 1. Notify Buyer
      await prisma.notification.create({
        data: {
          userId: buyerId,
          type: 'favorite',
          title: 'Property Added to Favorites',
          message: `You have added "${propertyTitle}" to your favorites.`,
          link: `/dashboard/profile/favorites`,
          isRead: false,
        }
      });

      // 2. Notify Admins and Super Admins
      const admins = await prisma.user.findMany({
        where: {
          role: { in: ['ADMIN', 'SUPER_ADMIN'] },
          status: 'Active'
        },
        select: { id: true }
      });

      if (admins.length > 0) {
        await prisma.notification.createMany({
          data: admins.map(admin => ({
            userId: admin.id,
            type: 'info',
            title: 'New Property Interest',
            message: `${buyerName} added "${propertyTitle}" to their favorites.`,
            link: `/dashboard/users/${buyerId}`,
            isRead: false
          }))
        });
      }
    } catch (notifyError) {
      console.error('Notification creation failed:', notifyError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({ message: 'Added to favorites' })
  } catch (error) {
    console.error('Add favorite error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
