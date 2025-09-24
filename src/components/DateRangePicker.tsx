'use client';

import { useEffect, useState } from 'react';

import { Button, Flex, Popover, Text } from '@radix-ui/themes';

import type { DateRange } from '@/store/filterContext';
import { useFilters } from '@/store/filterContext';

function formatLabel(range: DateRange): string {
  const [start, end] = range;
  if (!start && !end) return 'All time';
  if (start && end) return `${start} – ${end}`;
  if (start) return `From ${start}`;
  return `Until ${end}`;
}

export function DateRangePicker() {
  const { dateRange, setDateRange } = useFilters();
  const [localRange, setLocalRange] = useState<DateRange>(dateRange);

  useEffect(() => {
    setLocalRange(dateRange);
  }, [dateRange]);

  const apply = () => {
    setDateRange(localRange);
  };

  const clear = () => {
    setLocalRange([null, null]);
    setDateRange([null, null]);
  };

  return (
    <Popover.Root>
      <Popover.Trigger>
        <Button variant="soft" aria-label="Select date range" className="w-full justify-between">
          {formatLabel(dateRange)}
        </Button>
      </Popover.Trigger>
      <Popover.Content size="2" style={{ maxWidth: 280 }} side="bottom" align="start">
        <Flex direction="column" gap="3">
          <Text size="2" weight="bold">
            Date range
          </Text>
          <label className="flex flex-col gap-1 text-sm">
            <span>Start</span>
            <input
              type="date"
              value={localRange[0] ?? ''}
              onChange={(event) => setLocalRange([event.target.value || null, localRange[1]])}
              className="date-input"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span>End</span>
            <input
              type="date"
              value={localRange[1] ?? ''}
              onChange={(event) => setLocalRange([localRange[0], event.target.value || null])}
              className="date-input"
            />
          </label>
          <Flex gap="2" justify="between">
            <Button variant="ghost" onClick={clear} type="button">
              Clear
            </Button>
            <Popover.Close>
              <Button onClick={apply} type="button">
                Apply
              </Button>
            </Popover.Close>
          </Flex>
        </Flex>
      </Popover.Content>
    </Popover.Root>
  );
}
