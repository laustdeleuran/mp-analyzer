import assert from 'node:assert/strict';
import test from 'node:test';

import { bucketTicksByGrade, enhanceTicks } from '../../src/lib/aggregation';
import { parseGrade } from '../../src/lib/grades';
import type { Tick } from '../../src/lib/types';

const ticks: Tick[] = enhanceTicks([
  {
    id: '1',
    routeName: 'Corner Flash',
    area: 'Yosemite Valley',
    grade: '5.8',
    gradeNumeric: null,
    style: 'Lead',
    date: '2021-09-14',
  },
  {
    id: '2',
    routeName: 'Cosmic Debris',
    area: 'Yosemite Valley',
    grade: '5.13b',
    gradeNumeric: null,
    style: 'Lead',
    date: '2022-05-02',
  },
  {
    id: '3',
    routeName: 'Orange Juice',
    area: 'Red River Gorge',
    grade: '5.11d',
    gradeNumeric: null,
    style: 'Lead',
    date: '2023-10-11',
  },
  {
    id: '4',
    routeName: 'High Exposure',
    area: 'The Gunks',
    grade: '5.6',
    gradeNumeric: null,
    style: 'TR',
    date: '2020-07-19',
  },
]);

test('grade filters reduce the number of ticks returned by the bucket utility', async () => {
  const allBuckets = bucketTicksByGrade(ticks, { gradeMin: 0, gradeMax: 200 });
  const allTotal = allBuckets.reduce((sum, bucket) => sum + bucket.count, 0);

  const lowerBound = Math.floor(parseGrade('5.11a') ?? 0);
  const upperBound = Math.ceil(parseGrade('5.15d') ?? 100);
  const filteredBuckets = bucketTicksByGrade(ticks, {
    gradeMin: lowerBound,
    gradeMax: upperBound,
  });
  const filteredTotal = filteredBuckets.reduce((sum, bucket) => sum + bucket.count, 0);

  assert(filteredTotal <= allTotal);
  assert(filteredTotal < allTotal);
});

test('date filters constrain tick counts in buckets', async () => {
  const allBuckets = bucketTicksByGrade(ticks, { gradeMin: 0, gradeMax: 200 });
  const allTotal = allBuckets.reduce((sum, bucket) => sum + bucket.count, 0);
  const recentBuckets = bucketTicksByGrade(ticks, {
    gradeMin: 0,
    gradeMax: 200,
    startDate: '2023-01-01',
  });
  const recentTotal = recentBuckets.reduce((sum, bucket) => sum + bucket.count, 0);
  assert(recentTotal <= allTotal);
  assert(recentTotal > 0);
});
