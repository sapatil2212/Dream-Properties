import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET: Get all approved properties (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const subtypes = searchParams.get('subtypes')
    const listingType = searchParams.get('listing_type')

    const where: any = {
      status: 'Approved',
      propertyFlag: null, // Hide flagged properties (sold/rented/leased)
    }

    if (subtypes) {
      const subtypeList = subtypes.split(',')
      where.propertySubtype = { in: subtypeList }
    } else if (type && type !== 'All') {
      if (type === 'Villa') {
        where.OR = [
          { type: 'Villa' },
          { propertySubtype: { contains: 'Villa' } },
          { propertySubtype: { contains: 'Rowhouse' } }
        ]
      } else {
        where.OR = [
          { type: type },
          { propertySubtype: { contains: type } }
        ]
      }
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
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
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
    
    if (
      !session || 
      !['BUILDER', 'SUPER_ADMIN', 'ADMIN'].includes(session.user.role as string)
    ) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const normalizedPrice =
      typeof body.price === 'string' && body.price.trim() !== ''
        ? body.price
        : 'NA'
    
    let builderId = parseInt(session.user.id)

    // Handle Super Admin case where ID might be "superadmin" or NaN
    if (isNaN(builderId)) {
      if (session.user.role === 'SUPER_ADMIN') {
        // Try to find the Super Admin user in the database by email
        const user = await prisma.user.findUnique({
          where: { email: session.user.email }
        })
        
        if (user) {
          builderId = user.id
        } else {
          return NextResponse.json(
            { message: 'Super Admin user record not found in database. Please create a user account for the Super Admin email to create properties.' },
            { status: 400 }
          )
        }
      } else {
        return NextResponse.json(
          { message: 'Invalid User ID' },
          { status: 400 }
        )
      }
    }

    const property = await prisma.property.create({
      data: {
        builderId,
        title: body.title,
        description: body.description,
        price: normalizedPrice,
        area: body.area,
        location: body.location,
        address: body.address,
        type: body.type,
        status: 'Pending_Approval',
        isFeatured: body.isFeatured || false,
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
        videoUrl: body.videoUrl,
        nearbyLocations: body.nearbyLocations || [],
        attachments: body.attachments || [],
        listingType: body.listingType || 'Sell',
        // Rental-specific fields
        furnishing: body.furnishing,
        listedBy: body.listedBy,
        bachelorsAllowed: body.bachelorsAllowed,
        carpetArea: body.carpetArea,
        maintenance: body.maintenance,
        totalFloors: body.totalFloors,
        carParking: body.carParking,
      },
    })

    console.log('Property created with ID:', property.id, 'Status:', property.status)

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
