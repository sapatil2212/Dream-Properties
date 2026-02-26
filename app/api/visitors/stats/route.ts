import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check authentication for admin only
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Get date ranges
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const monthAgo = new Date(today)
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    
    const yearAgo = new Date(today)
    yearAgo.setFullYear(yearAgo.getFullYear() - 1)

    // Get counts for different time periods
    const [
      totalVisitors,
      todayVisitors,
      yesterdayVisitors,
      weekVisitors,
      monthVisitors,
      yearVisitors,
      uniqueVisitorsToday,
      deviceStats,
      browserStats,
      hourlyStats,
    ] = await Promise.all([
      // Total visitors
      prisma.visitor.count(),
      
      // Today
      prisma.visitor.count({
        where: { visitedAt: { gte: today } },
      }),
      
      // Yesterday
      prisma.visitor.count({
        where: { 
          visitedAt: { 
            gte: yesterday,
            lt: today,
          },
        },
      }),
      
      // Last 7 days
      prisma.visitor.count({
        where: { visitedAt: { gte: weekAgo } },
      }),
      
      // Last 30 days
      prisma.visitor.count({
        where: { visitedAt: { gte: monthAgo } },
      }),
      
      // Last 365 days
      prisma.visitor.count({
        where: { visitedAt: { gte: yearAgo } },
      }),
      
      // Unique visitors today (by IP)
      prisma.visitor.groupBy({
        by: ['ipAddress'],
        where: { visitedAt: { gte: today } },
        _count: { ipAddress: true },
      }).then(results => results.length),
      
      // Device type distribution (last 30 days)
      prisma.visitor.groupBy({
        by: ['deviceType'],
        where: { visitedAt: { gte: monthAgo } },
        _count: { deviceType: true },
      }),
      
      // Browser distribution (last 30 days)
      prisma.visitor.groupBy({
        by: ['browser'],
        where: { visitedAt: { gte: monthAgo } },
        _count: { browser: true },
      }),
      
      // Hourly stats for today
      prisma.visitor.findMany({
        where: { visitedAt: { gte: today } },
        select: { visitedAt: true },
      }),
    ])

    // Calculate hourly distribution
    const hourlyDistribution = Array(24).fill(0)
    hourlyStats.forEach((visit: { visitedAt: Date }) => {
      const hour = new Date(visit.visitedAt).getHours()
      hourlyDistribution[hour]++
    })

    // Get daily stats for the last 30 days
    const dailyStats = await prisma.visitor.groupBy({
      by: ['visitedAt'],
      where: { visitedAt: { gte: monthAgo } },
      _count: { id: true },
    })

    // Format daily stats
    const dailyStatsFormatted = dailyStats.map((stat: { visitedAt: Date; _count: { id: number } }) => ({
      date: stat.visitedAt.toISOString().split('T')[0],
      count: stat._count.id,
    })).sort((a: { date: string }, b: { date: string }) => a.date.localeCompare(b.date))

    return NextResponse.json({
      summary: {
        total: totalVisitors,
        today: todayVisitors,
        yesterday: yesterdayVisitors,
        week: weekVisitors,
        month: monthVisitors,
        year: yearVisitors,
        uniqueToday: uniqueVisitorsToday,
      },
      deviceStats: deviceStats.map((s: { deviceType: string; _count: { deviceType: number } }) => ({
        type: s.deviceType,
        count: s._count.deviceType,
      })),
      browserStats: browserStats.map((s: { browser: string; _count: { browser: number } }) => ({
        name: s.browser,
        count: s._count.browser,
      })),
      hourlyDistribution,
      dailyStats: dailyStatsFormatted,
    })
  } catch (error) {
    console.error('Error fetching visitor stats:', error)
    return NextResponse.json({ message: 'Failed to fetch stats' }, { status: 500 })
  }
}
