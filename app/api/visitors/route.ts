import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Helper to get device info from user agent (simple detection)
function getDeviceInfo(userAgent: string) {
  const ua = userAgent.toLowerCase()
  
  // Detect device type
  let deviceType = 'desktop'
  if (/mobile|android|iphone|ipad|ipod/.test(ua)) {
    deviceType = /ipad|tablet/.test(ua) ? 'tablet' : 'mobile'
  }
  
  // Detect browser
  let browser = 'Unknown'
  if (/chrome/.test(ua)) browser = 'Chrome'
  else if (/firefox/.test(ua)) browser = 'Firefox'
  else if (/safari/.test(ua)) browser = 'Safari'
  else if (/edge/.test(ua)) browser = 'Edge'
  else if (/opera/.test(ua)) browser = 'Opera'
  
  // Detect OS
  let os = 'Unknown'
  if (/windows/.test(ua)) os = 'Windows'
  else if (/macintosh|mac os/.test(ua)) os = 'MacOS'
  else if (/linux/.test(ua)) os = 'Linux'
  else if (/android/.test(ua)) os = 'Android'
  else if (/ios|iphone|ipad/.test(ua)) os = 'iOS'
  
  return { deviceType, browser, os }
}

// POST - Track a new visitor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const userAgent = request.headers.get('user-agent') || ''
    const referrer = request.headers.get('referer') || body.referrer || ''
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                      request.headers.get('x-real-ip') || 
                      'unknown'
    
    const { deviceType, browser, os } = getDeviceInfo(userAgent)
    
    // Create visitor record
    const visitor = await prisma.visitor.create({
      data: {
        ipAddress,
        userAgent,
        referrer,
        page: body.page || '/',
        sessionId: body.sessionId || null,
        country: body.country || null,
        city: body.city || null,
        deviceType,
        browser,
        os,
      },
    })

    return NextResponse.json({ success: true, id: visitor.id })
  } catch (error) {
    console.error('Error tracking visitor:', error)
    return NextResponse.json({ message: 'Failed to track visitor' }, { status: 500 })
  }
}
