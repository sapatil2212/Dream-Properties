import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { propertyId, flag } = await request.json();

    if (!propertyId) {
      return NextResponse.json({ message: 'Property ID is required' }, { status: 400 });
    }

    // Validate flag values
    const validFlags = ['Sold', 'Rented', 'Leased'];
    if (flag && !validFlags.includes(flag)) {
      return NextResponse.json({ message: 'Invalid flag value' }, { status: 400 });
    }

    // Get property to validate flag against listing type
    const property = await prisma.property.findUnique({
      where: { id: parseInt(propertyId) },
      select: { listingType: true, id: true }
    });

    if (!property) {
      return NextResponse.json({ message: 'Property not found' }, { status: 404 });
    }

    // Validate flag matches listing type
    if (flag) {
      if (property.listingType === 'Sell' && flag !== 'Sold') {
        return NextResponse.json({ 
          message: 'Properties for sale can only be flagged as "Sold"' 
        }, { status: 400 });
      }
      if (property.listingType === 'Rent' && flag !== 'Rented') {
        return NextResponse.json({ 
          message: 'Properties for rent can only be flagged as "Rented"' 
        }, { status: 400 });
      }
      if (property.listingType === 'Lease' && flag !== 'Leased') {
        return NextResponse.json({ 
          message: 'Properties for lease can only be flagged as "Leased"' 
        }, { status: 400 });
      }
    }

    // Get admin user ID
    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    // Update property with flag
    await prisma.property.update({
      where: { id: parseInt(propertyId) },
      data: {
        propertyFlag: flag || null,
        flaggedAt: flag ? new Date() : null,
        flaggedBy: flag ? admin?.id : null,
      },
    });

    return NextResponse.json({ 
      message: flag ? `Property flagged as ${flag}` : 'Property flag removed',
      success: true 
    });
  } catch (error) {
    console.error('Flag property error:', error);
    return NextResponse.json({ message: 'Failed to flag property' }, { status: 500 });
  }
}
