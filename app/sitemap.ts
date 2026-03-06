import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://dreamproperties.co.in';

  // Static routes
  const staticRoutes = [
    // Marketing pages
    { url: `${baseUrl}/`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly' as const, priority: 0.5 },
    
    // Property listing pages
    { url: `${baseUrl}/properties`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/properties/sell`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/properties/rent`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/properties/lease`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    
    // Category pages
    { url: `${baseUrl}/category/residential-apartments`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/category/villas-rowhouses`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/category/commercial-spaces`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/category/plots`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/category/industrial-spaces`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    
    // Auth pages
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/partner-register`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/saas`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    
    // Dashboard main
    { url: `${baseUrl}/dashboard`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.7 },
    { url: `${baseUrl}/saas/dashboard`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.7 },
  ];

  // Dynamic property pages
  let propertyRoutes: MetadataRoute.Sitemap = [];
  try {
    const properties = await prisma.property.findMany({
      where: { status: 'Approved', propertyFlag: null },
      select: { id: true, updatedAt: true },
      take: 1000, // Limit to most recent 1000 properties
    });
    
    propertyRoutes = properties.map((property) => ({
      url: `${baseUrl}/properties/${property.id}`,
      lastModified: property.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error fetching properties for sitemap:', error);
  }

  // Dashboard routes (for authenticated users - lower priority for SEO)
  const dashboardRoutes = [
    { url: `${baseUrl}/dashboard/properties`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.5 },
    { url: `${baseUrl}/dashboard/leads`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.5 },
    { url: `${baseUrl}/dashboard/inquiries`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.5 },
    { url: `${baseUrl}/dashboard/users`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.5 },
    { url: `${baseUrl}/dashboard/builders`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.5 },
    { url: `${baseUrl}/dashboard/employees`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.5 },
    { url: `${baseUrl}/dashboard/channel-partners`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.5 },
    { url: `${baseUrl}/dashboard/commissions`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.5 },
    { url: `${baseUrl}/dashboard/payouts`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.5 },
    { url: `${baseUrl}/dashboard/calendar`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.5 },
    { url: `${baseUrl}/dashboard/site-visits`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.5 },
    { url: `${baseUrl}/dashboard/follow-ups`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.5 },
    { url: `${baseUrl}/dashboard/reports`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.5 },
    { url: `${baseUrl}/dashboard/billing`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.5 },
    { url: `${baseUrl}/dashboard/finance`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.5 },
    { url: `${baseUrl}/dashboard/promotions`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.5 },
    { url: `${baseUrl}/dashboard/settings`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${baseUrl}/dashboard/system-settings`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${baseUrl}/dashboard/partner-agreement`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${baseUrl}/dashboard/post-property`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.5 },
    { url: `${baseUrl}/dashboard/profile/settings`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${baseUrl}/dashboard/profile/favorites`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.5 },
  ];

  return [...staticRoutes, ...propertyRoutes, ...dashboardRoutes];
}
