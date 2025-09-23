import assert from 'node:assert/strict';
import test from 'node:test';

import { aggregateByPeriod, bucketTicksByGrade, enhanceTicks, filterTicks } from '../../src/lib/aggregation';
import type { Tick } from '../../src/lib/types';

const sampleTicks: Tick[] = enhanceTicks([
  {
    id: '1',
    routeName: 'Route 1',
    area: 'Area',
    grade: '5.10a',
    gradeNumeric: null,
    style: 'Lead',
    date: '2023-01-10',
  },
  {
    id: '2',
    routeName: 'Route 2',
    area: 'Area',
    grade: '5.11b',
    gradeNumeric: null,
    style: 'Lead',
    date: '2023-01-15',
  },
  {
    id: '3',
    routeName: 'Route 3',
    area: 'Area',
    grade: '5.7',
    gradeNumeric: null,
    style: 'Lead',
    date: '2022-07-01',
  },
]);

test('bucketTicksByGrade groups values by grade index', () => {
  const buckets = bucketTicksByGrade(sampleTicks, { gradeMin: 0, gradeMax: 200 });
  const nonZero = buckets.filter((bucket) => bucket.count > 0);
  assert.equal(nonZero.length, 3);
});

test('filterTicks respects date range', () => {
  const filtered = filterTicks(sampleTicks, { startDate: '2023-01-01', endDate: '2023-12-31' });
  assert.equal(filtered.length, 2);
});

test('aggregateByPeriod summarises counts per year', () => {
  const aggregates = aggregateByPeriod(sampleTicks, 'year');
  const entry = aggregates.find((item) => item.key === '2023');
  assert(entry);
  assert.equal(entry?.count, 2);
});
