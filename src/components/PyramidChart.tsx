'use client';

import { Card, Text } from '@radix-ui/themes';

import type { GradeBucket } from '@/lib/types';

function formatCount(count: number) {
  return `${count} ${count === 1 ? 'tick' : 'ticks'}`;
}

type PyramidChartProps = {
  buckets: GradeBucket[];
  loading: boolean;
};

export function PyramidChart({ buckets, loading }: PyramidChartProps) {
  if (loading) {
    return (
      <Card role="status" aria-live="polite" p="6">
        <Text>Loading tick data…</Text>
      </Card>
    );
  }

  if (!buckets.length) {
    return (
      <Card p="6" role="status" aria-live="polite">
        <Text>No ticks found for the selected filters.</Text>
      </Card>
    );
  }

  const maxCount = Math.max(...buckets.map((bucket) => bucket.count), 1);

  return (
    <div aria-label="Tick pyramid" role="list" style={{ display: 'grid', gap: '12px' }}>
      {buckets.map((bucket) => {
        const widthPercent = (bucket.count / maxCount) * 100;
        return (
          <div
            key={bucket.label}
            role="listitem"
            style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
          >
            <Text size="2" style={{ width: '4.5rem', textAlign: 'right', fontWeight: 500 }}>
              {bucket.label}
            </Text>
            <div style={{ flex: 1 }}>
              <div
                aria-label={`${bucket.label}: ${formatCount(bucket.count)}`}
                style={{
                  position: 'relative',
                  height: '24px',
                  borderRadius: '9999px',
                  background: 'var(--pyramid-track-color, #cfe1ff)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    height: '16px',
                    borderRadius: '9999px',
                    width: `${Math.max(widthPercent, 4)}%`,
                    maxWidth: '100%',
                    background: 'var(--pyramid-fill-color, #2563eb)',
                    transition: 'width 160ms ease',
                  }}
                />
              </div>
            </div>
            <Text size="2" style={{ width: '2.5rem' }}>
              {bucket.count}
            </Text>
          </div>
        );
      })}
    </div>
  );
}
