import { NextRequest, NextResponse } from 'next/server';

import { ensureFetcher, getCachedTicks, refreshTicks } from '@/lib/tickFetcher';

export async function GET(request: NextRequest) {
  ensureFetcher();
  const { searchParams } = new URL(request.url);
  const force = searchParams.get('force') === 'true';
  if (force) {
    const data = await refreshTicks(true);
    return NextResponse.json(data, { status: 200 });
  }
  const data = await getCachedTicks();
  return NextResponse.json(data, { status: 200 });
}
