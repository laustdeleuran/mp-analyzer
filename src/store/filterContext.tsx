'use client';

import { createContext, useContext, useMemo, useState } from 'react';

import { GRADE_SCALE, clampGradeRange } from '@/lib/grades';

export type DateRange = [string | null, string | null];
export type GradeRange = [number, number];

export type FilterContextValue = {
  gradeRange: GradeRange;
  dateRange: DateRange;
  setGradeRange: (range: GradeRange) => void;
  setDateRange: (range: DateRange) => void;
  reset: () => void;
};

const FilterContext = createContext<FilterContextValue | null>(null);

const DEFAULT_GRADE_RANGE: GradeRange = [0, GRADE_SCALE.length - 1];
const DEFAULT_DATE_RANGE: DateRange = [null, null];

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [gradeRange, updateGradeRange] = useState<GradeRange>(() => [...DEFAULT_GRADE_RANGE]);
  const [dateRange, updateDateRange] = useState<DateRange>(() => [...DEFAULT_DATE_RANGE]);

  const value = useMemo<FilterContextValue>(
    () => ({
      gradeRange,
      dateRange,
      setGradeRange: (range: GradeRange) => updateGradeRange(clampGradeRange(range)),
      setDateRange: (range: DateRange) => updateDateRange([...range]),
      reset: () => {
        updateGradeRange([...DEFAULT_GRADE_RANGE]);
        updateDateRange([...DEFAULT_DATE_RANGE]);
      },
    }),
    [gradeRange, dateRange],
  );

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters(): FilterContextValue {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}
