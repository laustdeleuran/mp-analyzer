'use client';

import { Container, Flex, Heading, Text } from '@radix-ui/themes';

import { PyramidChart } from '@/components/PyramidChart';
import { TickFilters } from '@/components/TickFilters';
import { TickSummary } from '@/components/TickSummary';
import { useTickBuckets } from '@/hooks/useTickBuckets';

export default function HomePage() {
  const { data, loading, error, refresh } = useTickBuckets();

  return (
    <Container size="4" py="6">
      <Flex direction="column" gap="4" mb="6">
        <Heading as="h1" size="7">
          Tick Pyramid
        </Heading>
        <Text size="3" color="gray">
          Explore your Mountain Project ticks by grade and timeframe. Adjust the filters to focus on the
          climbs that matter most to you.
        </Text>
        {error ? (
          <Text color="red" role="alert">
            {error}
          </Text>
        ) : null}
      </Flex>
      <Flex direction={{ initial: 'column', md: 'row' }} gap="6">
        <div style={{ flex: '0 0 280px' }}>
          <TickFilters onRefresh={refresh} refreshing={loading} lastUpdated={data?.lastFetched} />
        </div>
        <Flex direction="column" gap="5" style={{ flex: 1 }}>
          <TickSummary data={data} />
          <PyramidChart buckets={data?.buckets ?? []} loading={loading} />
        </Flex>
      </Flex>
    </Container>
  );
}
