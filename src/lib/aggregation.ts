import { GRADE_SCALE, clampGradeRange, parseGrade } from './grades';
import type { BucketRequest, GradeBucket, Tick, TickCache } from './types';

export function enhanceTicks(rawTicks: Tick[]): Tick[] {
  return rawTicks
    .map((tick) => {
      const gradeNumeric = parseGrade(tick.grade);
      return {
        ...tick,
        gradeNumeric,
      };
    })
    .sort((a, b) => {
      const dateA = Date.parse(a.date);
      const dateB = Date.parse(b.date);
      if (Number.isNaN(dateA) || Number.isNaN(dateB)) return 0;
      return dateB - dateA;
    });
}

export function filterTicks(ticks: Tick[], filters: BucketRequest): Tick[] {
  const { gradeMin, gradeMax, startDate, endDate } = filters;
  let result = [...ticks];

  if (gradeMin !== undefined || gradeMax !== undefined) {
    const [min, max] = clampGradeRange([
      gradeMin ?? 0,
      gradeMax ?? GRADE_SCALE.length - 1,
    ]);
    result = result.filter((tick) => {
      if (tick.gradeNumeric === null || tick.gradeNumeric === undefined) {
        return false;
      }
      return tick.gradeNumeric >= min && tick.gradeNumeric <= max;
    });
  }

  if (startDate) {
    const start = Date.parse(startDate);
    if (!Number.isNaN(start)) {
      result = result.filter((tick) => Date.parse(tick.date) >= start);
    }
  }

  if (endDate) {
    const end = Date.parse(endDate);
    if (!Number.isNaN(end)) {
      result = result.filter((tick) => Date.parse(tick.date) <= end);
    }
  }

  return result;
}

export function bucketTicksByGrade(ticks: Tick[], filters: BucketRequest): GradeBucket[] {
  const filtered = filterTicks(ticks, filters);
  if (!filtered.length) {
    return [];
  }

  const [min, max] = clampGradeRange([
    filters.gradeMin ?? 0,
    filters.gradeMax ?? GRADE_SCALE.length - 1,
  ]);

  const counts = new Map<number, number>();
  for (const tick of filtered) {
    if (tick.gradeNumeric === null || tick.gradeNumeric === undefined) continue;
    const bucketIndex = Math.round(tick.gradeNumeric);
    if (bucketIndex < min || bucketIndex > max) continue;
    counts.set(bucketIndex, (counts.get(bucketIndex) ?? 0) + 1);
  }

  const buckets: GradeBucket[] = [];
  for (let index = min; index <= max; index += 1) {
    const count = counts.get(index) ?? 0;
    buckets.push({
      label: GRADE_SCALE[index],
      startIndex: index,
      endIndex: index,
      count,
    });
  }

  return buckets;
}

export type AggregationPeriod = 'year' | 'month';

export function aggregateByPeriod(ticks: Tick[], period: AggregationPeriod, filters: BucketRequest = {}) {
  const filtered = filterTicks(ticks, filters);
  const counts = new Map<string, number>();

  for (const tick of filtered) {
    const time = Date.parse(tick.date);
    if (Number.isNaN(time)) continue;
    const date = new Date(time);
    const key =
      period === 'year'
        ? `${date.getUTCFullYear()}`
        : `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
}

export function summarizeTickCache(cache: TickCache, filters: BucketRequest = {}) {
  const filtered = filterTicks(cache.ticks, filters);
  const total = filtered.length;
  const hardest = filtered
    .map((tick) => tick.gradeNumeric ?? -Infinity)
    .reduce((prev, value) => (value > prev ? value : prev), -Infinity);
  const easiest = filtered
    .map((tick) => tick.gradeNumeric ?? Infinity)
    .reduce((prev, value) => (value < prev ? value : prev), Infinity);
  return {
    total,
    hardest: Number.isFinite(hardest) ? GRADE_SCALE[Math.round(hardest)] : undefined,
    easiest: Number.isFinite(easiest) ? GRADE_SCALE[Math.round(easiest)] : undefined,
  };
}
