import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    startsWithMysql: process.env.DATABASE_URL?.startsWith('mysql://'),
    // Don't log the actual value for security
  });
}
