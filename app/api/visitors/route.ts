import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const KEY = 'total_visitors'

export async function GET() {
  try {
    const setting = await prisma.systemSettings.findUnique({
      where: { key: KEY },
    })
    const total = setting ? parseInt(setting.value || '0', 10) || 0 : 0
    return NextResponse.json({ total })
  } catch (error) {
    return NextResponse.json({ total: 0 }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const existing = await prisma.systemSettings.findUnique({ where: { key: KEY } })
    const current = existing ? parseInt(existing.value || '0', 10) || 0 : 0
    const updated = await prisma.systemSettings.upsert({
      where: { key: KEY },
      create: { key: KEY, value: String(current + 1) },
      update: { value: String(current + 1) },
    })
    return NextResponse.json({ total: parseInt(updated.value, 10) || 0 })
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update visitors' }, { status: 500 })
  }
}
