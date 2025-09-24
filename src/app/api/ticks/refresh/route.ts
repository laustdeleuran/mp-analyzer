import { NextResponse } from 'next/server';

import { refreshTicks } from '@/lib/tickFetcher';

export async function POST() {
  const data = await refreshTicks(true);
  return NextResponse.json(data, { status: 200 });
}
