'use client';

import { Button, Flex, Heading, Text } from '@radix-ui/themes';

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
    <Flex direction="column" gap="5">
      <div>
        <Heading as="h2" size="4" mb="3">
          Filters
        </Heading>
        <Flex direction="column" gap="4">
          <GradeRangeSlider />
          <div className="flex flex-col gap-2">
            <Text size="2" weight="bold">
              Date range
            </Text>
            <DateRangePicker />
          </div>
        </Flex>
      </div>
      <Flex gap="2">
        <Button variant="ghost" onClick={reset} type="button">
          Reset filters
        </Button>
        <Button onClick={onRefresh} disabled={refreshing} type="button">
          {refreshing ? 'Refreshing…' : 'Refresh data'}
        </Button>
      </Flex>
      {lastUpdated ? (
        <Text size="2" color="gray">
          Last updated {new Date(lastUpdated).toLocaleString()}
        </Text>
      ) : null}
    </Flex>
  );
}
