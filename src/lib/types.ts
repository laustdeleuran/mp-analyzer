export type Tick = {
  id: string;
  routeName: string;
  area: string;
  grade: string;
  gradeNumeric: number | null;
  style: string;
  date: string;
  link?: string;
};

export type TickCache = {
  lastFetched: string;
  ticks: Tick[];
};

export type GradeBucket = {
  label: string;
  startIndex: number;
  endIndex: number;
  count: number;
};

export type BucketRequest = {
  gradeMin?: number;
  gradeMax?: number;
  startDate?: string;
  endDate?: string;
};
