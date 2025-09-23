'use client';

import { Slider, Text } from '@radix-ui/themes';

import { GRADE_SCALE, gradeLabelFromIndex } from '@/lib/grades';
import { useFilters } from '@/store/filterContext';

export function GradeRangeSlider() {
  const { gradeRange, setGradeRange } = useFilters();

  const handleChange = (values: number[]) => {
    if (values.length === 2) {
      setGradeRange([values[0], values[1]]);
    }
  };

  return (
    <div>
      <Text as="label" size="2" weight="bold" htmlFor="grade-range-slider">
        Grade range
      </Text>
      <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
        <span>{gradeLabelFromIndex(gradeRange[0])}</span>
        <span>{gradeLabelFromIndex(gradeRange[1])}</span>
      </div>
      <Slider
        id="grade-range-slider"
        min={0}
        max={GRADE_SCALE.length - 1}
        value={gradeRange}
        onValueChange={handleChange}
        step={1}
        size="2"
        aria-label="Grade range"
        mt="3"
      />
    </div>
  );
}
