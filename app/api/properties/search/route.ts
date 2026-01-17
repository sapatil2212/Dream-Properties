import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const listing_type = searchParams.get('listing_type')
    const property_type = searchParams.get('type') || searchParams.get('property_type')

    const where: any = {
      status: 'Approved',
      propertyFlag: null, // Hide flagged properties (sold/rented/leased)
    }

    if (q.trim()) {
      const searchTerm = q.trim();
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { location: { contains: searchTerm, mode: 'insensitive' } },
        { address: { contains: searchTerm, mode: 'insensitive' } },
        { type: { contains: searchTerm, mode: 'insensitive' } },
        { propertySubtype: { contains: searchTerm, mode: 'insensitive' } },
        { configurations: { contains: searchTerm, mode: 'insensitive' } },
        { reraId: { contains: searchTerm, mode: 'insensitive' } },
        { builder: { name: { contains: searchTerm, mode: 'insensitive' } } },
      ]
    }

    if (listing_type) {
      where.listingType = listing_type
    }

    if (property_type && property_type !== 'all') {
      where.type = property_type
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
    console.error('Search properties error:', error)
    return NextResponse.json(
      { message: 'Failed to search properties' },
      { status: 500 }
    )
  }
}
