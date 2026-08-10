import { describe, expect, it } from "vitest";

import type { Status } from "@/config/status";
import { dateOnlySchema } from "@/lib/date/date-only";
import {
  getOverdueDays,
  getReviewState,
  isMastered,
  isOverdue,
  isReviewDue,
  isTodayReview,
} from "@/lib/review/rules";

const date = (value: string) => dateOnlySchema.parse(value);

describe("mastery rules", () => {
  it.each<[Status, boolean]>([
    ["A", true],
    ["B", true],
    ["C", false],
    ["D", false],
  ])("maps %s to mastered=%s", (status, expected) => {
    expect(isMastered(status)).toBe(expected);
  });
});

describe("Review date rules", () => {
  const today = date("2026-08-10");

  it.each([
    [null, false, false, false, "none"],
    ["2026-08-09", true, false, true, "overdue"],
    ["2026-08-10", true, true, false, "today"],
    ["2026-08-11", false, false, false, "upcoming"],
  ] as const)(
    "classifies %s without changing the scheduled date",
    (value, due, isToday, overdue, state) => {
      const nextReviewDate = value === null ? null : date(value);

      expect(isReviewDue(nextReviewDate, today)).toBe(due);
      expect(isTodayReview(nextReviewDate, today)).toBe(isToday);
      expect(isOverdue(nextReviewDate, today)).toBe(overdue);
      expect(getReviewState(nextReviewDate, today)).toBe(state);
      expect(nextReviewDate).toBe(value);
    },
  );

  it("calculates overdue days across month boundaries", () => {
    expect(getOverdueDays(date("2026-07-30"), date("2026-08-02"))).toBe(3);
  });

  it("returns zero when a Review is not overdue", () => {
    expect(getOverdueDays(null, today)).toBe(0);
    expect(getOverdueDays(today, today)).toBe(0);
    expect(getOverdueDays(date("2026-08-11"), today)).toBe(0);
  });
});
