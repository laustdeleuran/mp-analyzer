import { NextRequest, NextResponse } from 'next/server';

import { aggregateByPeriod, bucketTicksByGrade, summarizeTickCache } from '@/lib/aggregation';
import { ensureFetcher, getCachedTicks } from '@/lib/tickFetcher';

export async function GET(request: NextRequest) {
  ensureFetcher();
  const { searchParams } = new URL(request.url);

  const gradeMin = searchParams.get('gradeMin');
  const gradeMax = searchParams.get('gradeMax');
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  const period = (searchParams.get('period') as 'year' | 'month' | null) ?? null;

  const filters = {
    gradeMin: gradeMin !== null ? Number.parseFloat(gradeMin) : undefined,
    gradeMax: gradeMax !== null ? Number.parseFloat(gradeMax) : undefined,
    startDate,
    endDate,
  };

  const cache = await getCachedTicks();
  const buckets = bucketTicksByGrade(cache.ticks, filters);
  const summary = summarizeTickCache(cache, filters);
  const periods = period ? aggregateByPeriod(cache.ticks, period, filters) : [];

  return NextResponse.json({
    buckets,
    summary,
    periods,
    lastFetched: cache.lastFetched,
  });
}
