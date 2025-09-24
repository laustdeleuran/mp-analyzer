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
    <div className="grade-range">
      <Text as="label" size="2" weight="bold" htmlFor="grade-range-slider">
        Grade range
      </Text>
      <div className="grade-range__labels">
        <span className="grade-range__chip">{gradeLabelFromIndex(gradeRange[0])}</span>
        <span className="grade-range__chip">{gradeLabelFromIndex(gradeRange[1])}</span>
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
        className="grade-range__slider"
      />
    </div>
  );
}
