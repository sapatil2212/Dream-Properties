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
      // Split query into words and filter out common stop words
      const stopWords = ['in', 'at', 'near', 'on', 'the', 'a', 'an', 'for', 'of', 'with', 'and', 'or', 'property', 'properties', 'real', 'estate'];
      const terms = q.trim().split(/\s+/).filter(term => !stopWords.includes(term.toLowerCase()) && term.length > 2);
      
      // If filtering leaves nothing (or short words only), use the original query
      const searchTerms = terms.length > 0 ? terms : [q.trim()];

      // Build OR conditions: Any field containing Any of the search terms
      where.OR = [];
      searchTerms.forEach(term => {
        where.OR.push(
          { title: { contains: term } },
          { description: { contains: term } },
          { location: { contains: term } },
          { address: { contains: term } },
          { type: { contains: term } },
          { propertySubtype: { contains: term } },
          { configurations: { contains: term } },
          { reraId: { contains: term } },
          { builder: { name: { contains: term } } }
        );
      });
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
    console.error('Search properties error:', error)
    return NextResponse.json(
      { message: 'Failed to search properties' },
      { status: 500 }
    )
  }
}
