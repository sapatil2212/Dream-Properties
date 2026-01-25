import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ isFavorite: false })
    }

    let userId = parseInt(session.user.id);

    // Handle Super Admin or non-numeric ID
    if (isNaN(userId)) {
      if (session.user.role === 'SUPER_ADMIN') {
         const user = await prisma.user.findUnique({
           where: { email: session.user.email }
         });
         if (user) {
           userId = user.id;
         } else {
           // If user record doesn't exist, they can't have favorites
           return NextResponse.json({ isFavorite: false });
         }
      } else {
        return NextResponse.json({ isFavorite: false });
      }
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId: parseInt(id),
        },
      },
    })

    return NextResponse.json({ isFavorite: !!favorite })
  } catch (error) {
    console.error('Check favorite error:', error)
    return NextResponse.json({ isFavorite: false })
  }
}
