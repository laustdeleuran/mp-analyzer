'use client';

import { Badge, Button, Card, Flex, Heading, Separator, Text } from '@radix-ui/themes';

import { DateRangePicker } from './DateRangePicker';
import { GradeRangeSlider } from './GradeRangeSlider';
import { useFilters } from '@/store/filterContext';

type TickFiltersProps = {
  onRefresh: () => void;
  refreshing: boolean;
  lastUpdated?: string;
};

export function TickFilters({ onRefresh, refreshing, lastUpdated }: TickFiltersProps) {
  const { reset } = useFilters();
  return (
    <Card className="panel panel--filters" variant="surface" p={{ initial: '4', md: '5' }}>
      <Flex direction="column" gap="5">
        <Flex direction="column" gap="2">
          <Heading as="h2" size="4">
            Filters
          </Heading>
          <Text size="2" color="gray">
            Dial in the grades and timeframe you want to explore.
          </Text>
          {lastUpdated ? (
            <Badge color="blue" variant="soft" size="2" className="w-max">
              Updated {new Date(lastUpdated).toLocaleString()}
            </Badge>
          ) : null}
        </Flex>
        <Separator size="4" className="panel__separator" />
        <Flex direction="column" gap="4">
          <GradeRangeSlider />
          <div className="flex flex-col gap-2">
            <Text size="2" weight="bold">
              Date range
            </Text>
            <DateRangePicker />
          </div>
        </Flex>
        <Flex gap="3" wrap="wrap">
          <Button variant="ghost" onClick={reset} type="button">
            Reset filters
          </Button>
          <Button onClick={onRefresh} disabled={refreshing} type="button">
            {refreshing ? 'Refreshing…' : 'Refresh data'}
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}
