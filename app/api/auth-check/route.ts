import { NextResponse } from 'next/server';

export async function GET() {
  const envCheck = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    checks: {
      NEXTAUTH_URL: {
        exists: !!process.env.NEXTAUTH_URL,
        value: process.env.NEXTAUTH_URL ? 'SET' : 'MISSING',
        actual: process.env.NEXTAUTH_URL || 'NOT SET'
      },
      NEXTAUTH_SECRET: {
        exists: !!process.env.NEXTAUTH_SECRET,
        value: process.env.NEXTAUTH_SECRET ? `SET (${process.env.NEXTAUTH_SECRET.length} chars)` : 'MISSING'
      },
      GOOGLE_CLIENT_ID: {
        exists: !!process.env.GOOGLE_CLIENT_ID,
        value: process.env.GOOGLE_CLIENT_ID ? `SET (starts with ${process.env.GOOGLE_CLIENT_ID.substring(0, 20)}...)` : 'MISSING'
      },
      GOOGLE_CLIENT_SECRET: {
        exists: !!process.env.GOOGLE_CLIENT_SECRET,
        value: process.env.GOOGLE_CLIENT_SECRET ? `SET (${process.env.GOOGLE_CLIENT_SECRET.length} chars)` : 'MISSING'
      }
    },
    allConfigured: !!(
      process.env.NEXTAUTH_URL &&
      process.env.NEXTAUTH_SECRET &&
      process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET
    )
  };

  console.info('[Auth Check] Environment check requested');
  console.info('[Auth Check] Results:', envCheck);

  return NextResponse.json(envCheck);
}
