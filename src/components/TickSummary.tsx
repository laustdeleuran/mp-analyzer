'use client';

import { Card, Flex, Heading, Text } from '@radix-ui/themes';

import type { BucketsResponse, PeriodCount } from '@/hooks/useTickBuckets';

function PeriodList({ periods }: { periods: PeriodCount[] }) {
  if (!periods.length) return null;
  return (
    <div className="summary__periods">
      <Heading as="h3" size="3">
        Yearly ascents
      </Heading>
      <div className="summary__period-grid">
        {periods.map((period) => (
          <div key={period.key} className="summary__period-item">
            <Text size="2" color="gray">
              {period.key}
            </Text>
            <Text size="3" weight="bold">
              {period.count}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}

type TickSummaryProps = {
  data?: BucketsResponse | null;
};

export function TickSummary({ data }: TickSummaryProps) {
  if (!data) {
    return null;
  }
  const { summary, periods } = data;

  return (
    <Card className="panel panel--summary" variant="surface" p={{ initial: '4', md: '5' }}>
      <Flex direction="column" gap="5">
        <div className="summary__header">
          <Heading as="h2" size="4">
            Session snapshot
          </Heading>
          <Text size="2" color="gray">
            A quick look at your climbing history within the active filters.
          </Text>
        </div>
        <div className="summary__grid">
          <div className="summary__stat">
            <Text size="2" color="gray">
              Total climbs
            </Text>
            <Text size="6" weight="bold">
              {summary.total}
            </Text>
          </div>
          <div className="summary__stat">
            <Text size="2" color="gray">
              Hardest grade
            </Text>
            <Text size="6" weight="bold">
              {summary.hardest ?? '–'}
            </Text>
          </div>
          <div className="summary__stat">
            <Text size="2" color="gray">
              Easiest grade
            </Text>
            <Text size="6" weight="bold">
              {summary.easiest ?? '–'}
            </Text>
          </div>
        </div>
        <PeriodList periods={periods} />
      </Flex>
    </Card>
  );
}
