'use client';

import { Card, Flex, Heading, Text } from '@radix-ui/themes';

import type { BucketsResponse, PeriodCount } from '@/hooks/useTickBuckets';

function PeriodList({ periods }: { periods: PeriodCount[] }) {
  if (!periods.length) return null;
  return (
    <div>
      <Heading as="h3" size="3" mb="2">
        Yearly ascents
      </Heading>
      <Flex direction="column" gap="1">
        {periods.map((period) => (
          <Flex key={period.key} justify="between" align="center">
            <Text size="2">{period.key}</Text>
            <Text size="2" weight="bold">
              {period.count}
            </Text>
          </Flex>
        ))}
      </Flex>
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
    <Card p="4">
      <Heading as="h2" size="4" mb="3">
        Summary
      </Heading>
      <Flex direction="column" gap="3">
        <Flex justify="between" align="center">
          <Text size="2">Total climbs</Text>
          <Text size="2" weight="bold">
            {summary.total}
          </Text>
        </Flex>
        <Flex justify="between" align="center">
          <Text size="2">Hardest grade</Text>
          <Text size="2" weight="bold">
            {summary.hardest ?? '–'}
          </Text>
        </Flex>
        <Flex justify="between" align="center">
          <Text size="2">Easiest grade</Text>
          <Text size="2" weight="bold">
            {summary.easiest ?? '–'}
          </Text>
        </Flex>
        <PeriodList periods={periods} />
      </Flex>
    </Card>
  );
}
