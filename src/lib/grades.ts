import { Tick } from './types';

const ydsGrades: string[] = [];
for (let i = 0; i <= 9; i += 1) {
  ydsGrades.push(`5.${i}`);
}
const letters = ['A', 'B', 'C', 'D'];
for (let number = 10; number <= 15; number += 1) {
  for (const letter of letters) {
    ydsGrades.push(`5.${number}${letter}`);
  }
}

const boulderGrades: string[] = [];
for (let i = 0; i <= 16; i += 1) {
  boulderGrades.push(`V${i}`);
}

export const GRADE_SCALE: string[] = [...ydsGrades, ...boulderGrades];

const gradeIndexMap = new Map<string, number>();
GRADE_SCALE.forEach((grade, index) => {
  gradeIndexMap.set(grade.toUpperCase(), index);
});

for (let number = 10; number <= 15; number += 1) {
  const defaultIndex = gradeIndexMap.get(`5.${number}B`);
  if (defaultIndex !== undefined) {
    gradeIndexMap.set(`5.${number}`, defaultIndex);
  }
}

function cleanupRawGrade(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .replace(/[–—]/g, '-')
    .replace(/\([^)]*\)/g, '')
    .replace(/(R|X|PG13|PG-13|A\d|C\d|WI\d+|AI\d+|M\d+|\bTR\b|\bSPORT\b|\bMIXED\b|\bBOULDER\b)/gi, '')
    .trim();
}

function parseSingleGrade(raw: string): number | null {
  let grade = cleanupRawGrade(raw).toUpperCase();
  if (!grade) {
    return null;
  }

  if (grade.includes('-') && grade.includes('.')) {
    const parts = grade.split('-');
    if (parts.length === 2 && /5\.\d+/.test(parts[0])) {
      return parseMixedGrade(parts);
    }
  }

  if (grade.includes('/')) {
    return parseMixedGrade(grade.split('/'));
  }

  let adjustment = 0;
  if (grade.endsWith('+')) {
    adjustment = 0.3;
    grade = grade.slice(0, -1);
  } else if (grade.endsWith('-')) {
    adjustment = -0.3;
    grade = grade.slice(0, -1);
  }
  grade = grade.trim();

  const boulderMatch = grade.match(/^V(\d{1,2})$/);
  if (boulderMatch) {
    const value = Number.parseInt(boulderMatch[1], 10);
    const baseIndex = gradeIndexMap.get(`V${value}`);
    if (baseIndex === undefined) return null;
    return baseIndex + adjustment;
  }

  const ydsMatch = grade.match(/^5\.(\d{1,2})([ABCD])?$/);
  if (ydsMatch) {
    const number = Number.parseInt(ydsMatch[1], 10);
    let letter = ydsMatch[2];
    if (!letter && number >= 10) {
      letter = 'B';
    }
    const canonical = letter ? `5.${number}${letter}` : `5.${number}`;
    const baseIndex = gradeIndexMap.get(canonical);
    if (baseIndex === undefined) {
      return null;
    }
    return baseIndex + adjustment;
  }

  return null;
}

function parseMixedGrade(parts: string[] | string): number | null {
  const pieces = Array.isArray(parts) ? parts : parts.split(/[\/]/);
  const values = pieces
    .map((piece) => parseSingleGrade(piece))
    .filter((value): value is number => value !== null);
  if (!values.length) {
    return null;
  }
  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

export function parseGrade(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const grade = raw.trim();
  if (!grade) return null;
  return parseSingleGrade(grade);
}

export function gradeLabelFromIndex(index: number): string {
  if (!Number.isFinite(index)) {
    return '';
  }
  const clamped = Math.min(Math.max(Math.round(index), 0), GRADE_SCALE.length - 1);
  return GRADE_SCALE[clamped];
}

export function summarizeGrades(ticks: Tick[]): {
  hardest?: string;
  easiest?: string;
} {
  const numeric = ticks
    .map((tick) => tick.gradeNumeric)
    .filter((value): value is number => value !== null)
    .sort((a, b) => a - b);
  if (!numeric.length) {
    return {};
  }
  return {
    easiest: gradeLabelFromIndex(numeric[0]),
    hardest: gradeLabelFromIndex(numeric[numeric.length - 1]),
  };
}

export function clampGradeRange(range: [number, number]): [number, number] {
  const [min, max] = range;
  const clampedMin = Math.max(0, Math.min(min, GRADE_SCALE.length - 1));
  const clampedMax = Math.max(clampedMin, Math.min(max, GRADE_SCALE.length - 1));
  return [clampedMin, clampedMax];
}

export function ticksWithinGradeRange(ticks: Tick[], range: [number, number]): Tick[] {
  const [min, max] = clampGradeRange(range);
  return ticks.filter((tick) => {
    if (tick.gradeNumeric === null || tick.gradeNumeric === undefined) return false;
    return tick.gradeNumeric >= min && tick.gradeNumeric <= max;
  });
}
