import type { Status } from "@/config/status";
import {
  compareDateOnly,
  differenceInCalendarDays,
  type DateOnly,
} from "@/lib/date/date-only";

import type { ReviewState } from "./types";

export function isMastered(status: Status): boolean {
  return status === "A" || status === "B";
}

export function isReviewDue(
  nextReviewDate: DateOnly | null | undefined,
  today: DateOnly,
): boolean {
  return nextReviewDate != null && compareDateOnly(nextReviewDate, today) <= 0;
}

export function isTodayReview(
  nextReviewDate: DateOnly | null | undefined,
  today: DateOnly,
): boolean {
  return nextReviewDate != null && compareDateOnly(nextReviewDate, today) === 0;
}

export function isOverdue(
  nextReviewDate: DateOnly | null | undefined,
  today: DateOnly,
): boolean {
  return nextReviewDate != null && compareDateOnly(nextReviewDate, today) < 0;
}

export function getOverdueDays(
  nextReviewDate: DateOnly | null | undefined,
  today: DateOnly,
): number {
  if (nextReviewDate == null || !isOverdue(nextReviewDate, today)) {
    return 0;
  }

  return differenceInCalendarDays(today, nextReviewDate);
}

export function getReviewState(
  nextReviewDate: DateOnly | null | undefined,
  today: DateOnly,
): ReviewState {
  if (nextReviewDate == null) {
    return "none";
  }

  const comparison = compareDateOnly(nextReviewDate, today);

  if (comparison < 0) {
    return "overdue";
  }

  if (comparison === 0) {
    return "today";
  }

  return "upcoming";
}
