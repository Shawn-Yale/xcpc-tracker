import { describe, expect, it } from "vitest";

import { dateOnlySchema } from "@/lib/date/date-only";
import {
  getBacklogProblems,
  getDashboardSummary,
  getRecentReviewActivity,
  getRecentSolved,
} from "@/lib/dashboard/summary";
import { problemFrontmatterSchema } from "@/lib/problems/schema";
import type { ProblemFile } from "@/lib/problems/types";

function problem(input: {
  id: string;
  solvedAt: string;
  status: "A" | "B" | "C" | "D";
  nextReviewDate?: string | null;
  reviews?: Array<Record<string, unknown>>;
}): ProblemFile {
  return {
    fileName: `${input.id}.md`,
    content: "body",
    frontmatter: problemFrontmatterSchema.parse({
      id: input.id,
      title: input.id,
      platform: "Codeforces",
      solvedAt: input.solvedAt,
      status: input.status,
      nextReviewDate: input.nextReviewDate,
      reviewIntervalDays: input.nextReviewDate == null ? null : 7,
      reviews: input.reviews ?? [],
    }),
  };
}

const fixtures = [
  problem({
    id: "mastered",
    solvedAt: "2026-08-08",
    status: "A",
    reviews: [
      {
        date: "2026-08-09",
        fromStatus: "B",
        toStatus: "A",
        note: "Mastered",
      },
    ],
  }),
  problem({
    id: "d-unscheduled",
    solvedAt: "2026-08-06",
    status: "D",
  }),
  problem({
    id: "d-scheduled",
    solvedAt: "2026-08-10",
    status: "D",
    nextReviewDate: "2026-08-10",
    reviews: [
      {
        date: "2026-08-10",
        fromStatus: "C",
        toStatus: "D",
        note: "Forgotten",
      },
    ],
  }),
  problem({
    id: "c-unscheduled",
    solvedAt: "2026-08-07",
    status: "C",
  }),
  problem({
    id: "c-overdue",
    solvedAt: "2026-08-09",
    status: "C",
    nextReviewDate: "2026-08-08",
  }),
];

describe("dashboard summary", () => {
  it("sorts recent solved records by solvedAt without mutating input", () => {
    const before = [...fixtures];
    expect(getRecentSolved(fixtures, 3).map((item) => item.frontmatter.id)).toEqual([
      "d-scheduled",
      "c-overdue",
      "mastered",
    ]);
    expect(fixtures).toEqual(before);
  });

  it("flattens Review History into newest-first activity", () => {
    const activity = getRecentReviewActivity(fixtures);
    expect(activity.map((item) => item.problem.frontmatter.id)).toEqual([
      "d-scheduled",
      "mastered",
    ]);
    expect(activity[0].review).toMatchObject({ fromStatus: "C", toStatus: "D" });
  });

  it("prioritizes D, then C, with unscheduled work first within each pool", () => {
    expect(getBacklogProblems(fixtures).map((item) => item.frontmatter.id)).toEqual([
      "d-unscheduled",
      "d-scheduled",
      "c-unscheduled",
      "c-overdue",
    ]);
  });

  it("reuses shared Review and mastery aggregation", () => {
    const summary = getDashboardSummary(
      fixtures,
      dateOnlySchema.parse("2026-08-10"),
    );
    expect(summary.stats).toMatchObject({ total: 5, mastered: 1, masteryRate: 20 });
    expect(summary.reviewQueue.overdue.map((item) => item.frontmatter.id)).toEqual([
      "c-overdue",
    ]);
    expect(summary.reviewQueue.today.map((item) => item.frontmatter.id)).toEqual([
      "d-scheduled",
    ]);
  });

  it("returns safe empty states and validates list limits", () => {
    const summary = getDashboardSummary([], dateOnlySchema.parse("2026-08-10"));
    expect(summary.stats.masteryRate).toBe(0);
    expect(summary.backlog).toEqual([]);
    expect(summary.recentReviews).toEqual([]);
    expect(() => getRecentSolved([], -1)).toThrow(RangeError);
  });
});
