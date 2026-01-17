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
    }

    if (q.trim()) {
      where.OR = [
        { title: { contains: q.trim() } },
        { description: { contains: q.trim() } },
        { location: { contains: q.trim() } },
        { address: { contains: q.trim() } },
        { type: { contains: q.trim() } },
        { propertySubtype: { contains: q.trim() } },
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
