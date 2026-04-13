import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const payload = await getPayload({ config });
    const doc = await payload.update({ collection: 'backgrounds', id, data: body });
    return NextResponse.json(doc);
  } catch {
    return NextResponse.json({ error: 'Failed to update background' }, { status: 500 });
  }
}
