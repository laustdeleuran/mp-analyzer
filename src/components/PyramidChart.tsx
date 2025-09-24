'use client';

import { Card, Flex, Heading, Text } from '@radix-ui/themes';

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
      <Card className="panel panel--chart" role="status" aria-live="polite" p={{ initial: '4', md: '5' }}>
        <Text>Loading tick data…</Text>
      </Card>
    );
  }

  if (!buckets.length) {
    return (
      <Card className="panel panel--chart" p={{ initial: '4', md: '5' }} role="status" aria-live="polite">
        <Text>No ticks found for the selected filters.</Text>
      </Card>
    );
  }

  const maxCount = Math.max(...buckets.map((bucket) => bucket.count), 1);

  return (
    <Card className="panel panel--chart" variant="surface" p={{ initial: '4', md: '5' }}>
      <Flex direction="column" gap="5">
        <Flex direction="column" gap="2">
          <Heading as="h2" size="4">
            Grade pyramid
          </Heading>
          <Text size="2" color="gray">
            Each band shows the total number of ticks for the corresponding grade bucket.
          </Text>
        </Flex>
        <div aria-label="Tick pyramid" role="list" className="pyramid">
          {buckets.map((bucket) => {
            const widthPercent = (bucket.count / maxCount) * 100;
            return (
              <div key={bucket.label} role="listitem" className="pyramid__row">
                <Text size="2" className="pyramid__label">
                  {bucket.label}
                </Text>
                <div className="pyramid__bar-wrapper">
                  <div
                    aria-label={`${bucket.label}: ${formatCount(bucket.count)}`}
                    className="pyramid__bar"
                    style={{ width: `${Math.max(widthPercent, 6)}%` }}
                  />
                </div>
                <Text size="2" className="pyramid__value">
                  {bucket.count}
                </Text>
              </div>
            );
          })}
        </div>
      </Flex>
    </Card>
  );
}
