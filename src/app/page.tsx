'use client';

import { Container, Flex, Heading, Text } from '@radix-ui/themes';

import { PyramidChart } from '@/components/PyramidChart';
import { TickFilters } from '@/components/TickFilters';
import { TickSummary } from '@/components/TickSummary';
import { useTickBuckets } from '@/hooks/useTickBuckets';

export default function HomePage() {
  const { data, loading, error, refresh } = useTickBuckets();

  return (
    <div className="dashboard">
      <div className="dashboard__glow" aria-hidden />
      <Container
        size="4"
        className="dashboard__container"
        px={{ initial: '4', sm: '6', lg: '8' }}
        py={{ initial: '6', md: '8' }}
      >
        <Flex direction="column" gap="7">
          <Flex direction="column" gap="3" className="dashboard__header">
            <Heading as="h1" size="8">
              Tick Pyramid
            </Heading>
            <Text size="4" color="gray">
              Track how your climbing volume shifts across grades over time. Use the controls to surface the
              sends you care about most.
            </Text>
            {error ? (
              <Text color="tomato" role="alert">
                {error}
              </Text>
            ) : null}
          </Flex>
          <div className="dashboard__content">
            <TickFilters onRefresh={refresh} refreshing={loading} lastUpdated={data?.lastFetched} />
            <div className="dashboard__main">
              <TickSummary data={data} />
              <PyramidChart buckets={data?.buckets ?? []} loading={loading} />
            </div>
          </div>
        </Flex>
      </Container>
    </div>
  );
}
