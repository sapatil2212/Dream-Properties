import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const propertyId = parseInt(id);
    const userId = parseInt(session.user.id);
    const userRole = session.user.role;

    // Get property details to check ownership
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { builderId: true }
    });
    
    if (!property) {
      return NextResponse.json({ message: 'Property not found' }, { status: 404 });
    }

    // Check authorization:
    // 1. Super Admin or Admin can delete any property
    // 2. Builder can only delete their own properties
    const isSuperAdminOrAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';
    const isOwner = property.builderId === userId;

    if (!isSuperAdminOrAdmin && !isOwner) {
      return NextResponse.json({ message: 'Access denied. You can only delete your own properties.' }, { status: 403 });
    }

    // Delete the property
    await prisma.property.delete({
      where: { id: propertyId },
    });
    
    return NextResponse.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    return NextResponse.json({ message: 'Failed to delete property' }, { status: 500 });
  }
}
