import { describe, expect, it } from "vitest";

import { dateOnlySchema } from "@/lib/date/date-only";
import { problemFrontmatterSchema } from "@/lib/problems/schema";
import type { ProblemFile } from "@/lib/problems/types";
import { getReviewQueue } from "@/lib/review/queue";
import { getOverdueDays } from "@/lib/review/rules";

function scheduled(id: string, date: string | null): ProblemFile {
  return {
    fileName: `${id}.md`,
    content: "body",
    frontmatter: problemFrontmatterSchema.parse({
      id,
      title: id,
      platform: "AtCoder",
      solvedAt: "2026-01-01",
      status: "C",
      knowledge: [],
      nextReviewDate: date,
      reviewIntervalDays: date == null ? null : 7,
    }),
  };
}

describe("getReviewQueue", () => {
  it("groups scheduled problems and orders them by their unchanged date", () => {
    const queue = getReviewQueue(
      [
        scheduled("late", "2026-08-09"),
        scheduled("oldest", "2026-08-01"),
        scheduled("today", "2026-08-10"),
        scheduled("tomorrow", "2026-08-11"),
        scheduled("boundary", "2026-08-17"),
        scheduled("outside", "2026-08-18"),
        scheduled("unscheduled", null),
      ],
      dateOnlySchema.parse("2026-08-10"),
    );

    expect(queue.overdue.map((problem) => problem.frontmatter.id)).toEqual([
      "oldest",
      "late",
    ]);
    expect(queue.today.map((problem) => problem.frontmatter.id)).toEqual(["today"]);
    expect(queue.upcoming.map((problem) => problem.frontmatter.id)).toEqual([
      "tomorrow",
      "boundary",
    ]);
  });

  it("rejects an invalid upcoming range", () => {
    const today = dateOnlySchema.parse("2026-08-10");
    expect(() => getReviewQueue([], today, -1)).toThrow(RangeError);
    expect(() => getReviewQueue([], today, 1.5)).toThrow(RangeError);
  });

  it("keeps the original date across the Today and one-day Overdue scenarios", () => {
    const problem = scheduled("problem-x", "2026-08-14");

    expect(
      getReviewQueue([problem], dateOnlySchema.parse("2026-08-14")).today,
    ).toEqual([problem]);
    expect(
      getReviewQueue([problem], dateOnlySchema.parse("2026-08-15")).overdue,
    ).toEqual([problem]);
    expect(
      getOverdueDays(
        problem.frontmatter.nextReviewDate,
        dateOnlySchema.parse("2026-08-15"),
      ),
    ).toBe(1);
    expect(problem.frontmatter.nextReviewDate).toBe("2026-08-14");
  });
});
