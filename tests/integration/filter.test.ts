import assert from 'node:assert/strict';
import test from 'node:test';

import { bucketTicksByGrade } from '../../src/lib/aggregation';
import { parseGrade } from '../../src/lib/grades';
import { refreshTicks } from '../../src/lib/tickFetcher';

test('grade filters reduce the number of ticks returned by the bucket utility', async () => {
  const cache = await refreshTicks(true);
  const allBuckets = bucketTicksByGrade(cache.ticks, { gradeMin: 0, gradeMax: 200 });
  const allTotal = allBuckets.reduce((sum, bucket) => sum + bucket.count, 0);

  const lowerBound = Math.floor(parseGrade('5.11a') ?? 0);
  const upperBound = Math.ceil(parseGrade('5.15d') ?? 100);
  const filteredBuckets = bucketTicksByGrade(cache.ticks, {
    gradeMin: lowerBound,
    gradeMax: upperBound,
  });
  const filteredTotal = filteredBuckets.reduce((sum, bucket) => sum + bucket.count, 0);

  assert(filteredTotal <= allTotal);
  assert(filteredTotal < allTotal);
});

test('date filters constrain tick counts in buckets', async () => {
  const cache = await refreshTicks(true);
  const allBuckets = bucketTicksByGrade(cache.ticks, { gradeMin: 0, gradeMax: 200 });
  const allTotal = allBuckets.reduce((sum, bucket) => sum + bucket.count, 0);
  const recentBuckets = bucketTicksByGrade(cache.ticks, {
    gradeMin: 0,
    gradeMax: 200,
    startDate: '2023-01-01',
  });
  const recentTotal = recentBuckets.reduce((sum, bucket) => sum + bucket.count, 0);
  assert(recentTotal <= allTotal);
  assert(recentTotal > 0);
});
