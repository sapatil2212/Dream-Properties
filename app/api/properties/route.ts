import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: Get all approved properties (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const listingType = searchParams.get('listing_type')

    const where: any = {
      status: 'Approved',
    }

    if (type && type !== 'All') {
      where.type = type
    }

    if (listingType && listingType !== 'All') {
      where.listingType = listingType
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        builder: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const formattedProperties = properties.map(p => ({
      ...p,
      builder: p.builder.name,
      builderEmail: p.builder.email,
    }))

    return NextResponse.json(formattedProperties)
  } catch (error) {
    console.error('Get properties error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}

// POST: Create new property (requires authentication)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'BUILDER') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    const property = await prisma.property.create({
      data: {
        builderId: parseInt(session.user.id),
        title: body.title,
        description: body.description,
        price: body.price,
        area: body.area,
        location: body.location,
        address: body.address,
        type: body.type,
        bedrooms: body.bedrooms ? parseInt(body.bedrooms) : null,
        bathrooms: body.bathrooms ? parseInt(body.bathrooms) : null,
        possessionDate: body.possessionDate,
        reraId: body.reraId,
        amenities: body.amenities || [],
        images: body.images || [],
        highlights: body.highlights || [],
        specifications: body.specifications || [],
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
        nearbyLocations: body.nearbyLocations || [],
        attachments: body.attachments || [],
        listingType: body.listingType || 'Sell',
      },
    })

    return NextResponse.json({
      message: 'Property submitted for approval',
      property,
    })
  } catch (error) {
    console.error('Create property error:', error)
    return NextResponse.json(
      { message: 'Failed to create property' },
      { status: 500 }
    )
  }
}
