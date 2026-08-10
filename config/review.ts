import type { Status } from "./status";

export const baseReviewIntervals: Record<Status, number> = {
  A: 30,
  B: 14,
  C: 7,
  D: 3,
};

export const maximumReviewIntervalDays = 365;
