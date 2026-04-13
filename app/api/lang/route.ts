import { NextRequest, NextResponse } from 'next/server';

// Vercel sets x-vercel-ip-country on all requests in production.
// Returns detected language ('uk' for Ukraine, 'en' otherwise).
export async function GET(request: NextRequest) {
  const country = request.headers.get('x-vercel-ip-country') ?? '';
  return NextResponse.json({ lang: country === 'UA' ? 'uk' : 'en' });
}
