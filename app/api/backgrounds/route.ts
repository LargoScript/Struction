import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function GET() {
  try {
    const payload = await getPayload({ config });
    const data = await payload.find({ collection: 'backgrounds', limit: 100 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch backgrounds' }, { status: 500 });
  }
}
