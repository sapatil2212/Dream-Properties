import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET: Single property details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const property = await prisma.property.findUnique({
      where: { id: parseInt(id) },
      include: {
        builder: {
          select: {
            name: true,
            email: true,
            mobile: true,
          },
        },
      },
    })

    if (!property) {
      return NextResponse.json(
        { message: 'Property not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(property)
  } catch (error) {
    console.error('Get property error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch property' },
      { status: 500 }
    )
  }
}

// PUT: Update property (Builder only, must be owner)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated and has appropriate role
    if (!session || !['BUILDER', 'SUPER_ADMIN', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const propertyId = parseInt(id)

    // Check ownership
    const existing = await prisma.property.findUnique({
      where: { id: propertyId },
    })

    if (!existing) {
      return NextResponse.json({ message: 'Property not found' }, { status: 404 })
    }

    // Only restrict Builders to their own properties. Admins can edit any property.
    if (session.user.role === 'BUILDER' && existing.builderId !== parseInt(session.user.id)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const normalizedPrice =
      typeof body.price === 'string' && body.price.trim() !== ''
        ? body.price
        : 'NA'

    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN';

    const updateData: any = {
        title: body.title,
        description: body.description,
        price: normalizedPrice,
        area: body.area,
        location: body.location,
        address: body.address,
        type: body.type,
        isFeatured: body.isFeatured,
        bedrooms: body.bedrooms ? parseInt(body.bedrooms) : null,
        bathrooms: body.bathrooms ? parseInt(body.bathrooms) : null,
        possessionDate: body.possessionDate,
        reraId: body.reraId,
        amenities: body.amenities,
        images: body.images,
        highlights: body.highlights,
        specifications: body.specifications,
        projectUnits: body.projectUnits ? parseInt(body.projectUnits) : null,
        projectArea: body.projectArea,
        configurations: body.configurations,
        avgPrice: body.avgPrice,
        launchDate: body.launchDate,
        sizes: body.sizes,
        projectSize: body.projectSize,
        areaUnit: body.areaUnit,
        propertySubtype: body.propertySubtype,
        mapLink: body.mapLink,
        videoUrl: body.videoUrl,
        nearbyLocations: body.nearbyLocations,
        attachments: body.attachments,
        listingType: body.listingType,
        // Rental-specific fields
        furnishing: body.furnishing,
        listedBy: body.listedBy,
        bachelorsAllowed: body.bachelorsAllowed,
        carpetArea: body.carpetArea,
        maintenance: body.maintenance,
        totalFloors: body.totalFloors,
        carParking: body.carParking,
    };

    // Only reset status if not Admin/Super Admin
    if (!isAdmin) {
        updateData.status = 'Pending_Approval';
    } else if (body.status) {
        updateData.status = body.status;
    }

    const updated = await prisma.property.update({
      where: { id: propertyId },
      data: updateData,
    })

    return NextResponse.json({ message: 'Property updated and pending approval', property: updated })
  } catch (error) {
    console.error('Update property error:', error)
    return NextResponse.json({ message: 'Failed to update property' }, { status: 500 })
  }
}

// DELETE: Delete property (Admin or Owner)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const propertyId = parseInt(id)
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    })

    if (!property) {
      return NextResponse.json({ message: 'Property not found' }, { status: 404 })
    }

    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUPER_ADMIN'
    const isOwner = property.builderId === parseInt(session.user.id)

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    await prisma.property.delete({
      where: { id: propertyId },
    })

    return NextResponse.json({ message: 'Property deleted successfully' })
  } catch (error) {
    console.error('Delete property error:', error)
    return NextResponse.json({ message: 'Failed to delete property' }, { status: 500 })
  }
}
