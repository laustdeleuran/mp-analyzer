'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { GradeBucket } from '@/lib/types';
import { useFilters } from '@/store/filterContext';

export type PeriodCount = { key: string; count: number };

export type BucketsResponse = {
  buckets: GradeBucket[];
  summary: {
    total: number;
    hardest?: string;
    easiest?: string;
  };
  periods: PeriodCount[];
  lastFetched: string;
};

export function useTickBuckets() {
  const { gradeRange, dateRange } = useFilters();
  const [data, setData] = useState<BucketsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const params = useMemo(() => {
    const search = new URLSearchParams();
    search.set('gradeMin', String(gradeRange[0]));
    search.set('gradeMax', String(gradeRange[1]));
    if (dateRange[0]) search.set('startDate', dateRange[0]);
    if (dateRange[1]) search.set('endDate', dateRange[1]);
    search.set('period', 'year');
    return search.toString();
  }, [gradeRange, dateRange]);

  useEffect(() => {
    let isActive = true;
    setLoading(true);
    setError(null);
    fetch(`/api/ticks/buckets?${params}`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to load tick data');
        }
        const payload = (await response.json()) as BucketsResponse;
        if (!isActive) return;
        setData(payload);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (!isActive) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [params, refreshCounter]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ticks/refresh', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Unable to refresh ticks');
      }
      setRefreshCounter((counter) => counter + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    refresh,
  };
}
