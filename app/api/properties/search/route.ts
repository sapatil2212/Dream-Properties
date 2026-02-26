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
      const trimmedQuery = q.trim();
      
      // Split query into words and filter out common stop words
      const stopWords = ['in', 'at', 'near', 'on', 'the', 'a', 'an', 'for', 'of', 'with', 'and', 'or'];
      const terms = trimmedQuery.split(/\s+/).filter(term => !stopWords.includes(term.toLowerCase()) && term.length >= 1);
      
      // Build search conditions
      // Note: MySQL is case-insensitive by default for contains queries
      const searchConditions: any[] = [];
      
      // Helper to add field search conditions
      const addFieldConditions = (value: string) => ({
        OR: [
          { title: { contains: value } },
          { description: { contains: value } },
          { location: { contains: value } },
          { address: { contains: value } },
          { type: { contains: value } },
          { propertySubtype: { contains: value } },
          { configurations: { contains: value } },
          { reraId: { contains: value } },
          { builder: { name: { contains: value } } }
        ]
      });
      
      // 1. First priority: Match the full phrase (for exact matches like "White Lily")
      if (trimmedQuery.length >= 1) {
        searchConditions.push(addFieldConditions(trimmedQuery));
      }
      
      // 2. Second priority: Match individual terms (for broader matches)
      terms.forEach(term => {
        searchConditions.push(addFieldConditions(term));
      });
      
      // Use AND logic so properties matching more terms rank higher
      // But wrap in OR so any match works
      if (searchConditions.length > 0) {
        where.OR = searchConditions;
      }
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
