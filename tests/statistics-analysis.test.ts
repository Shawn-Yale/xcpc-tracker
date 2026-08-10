import { describe, expect, it } from "vitest";

import { dateOnlySchema } from "@/lib/date/date-only";
import { problemFrontmatterSchema } from "@/lib/problems/schema";
import type { ProblemFile } from "@/lib/problems/types";
import {
  getActivityHeatmap,
  getConversionMatrix,
  getDKnowledgeGaps,
  getJourneyConversions,
  getPlatformDistribution,
  getRatingDistribution,
  getRatingTrend,
  getStatisticsSummary,
  getTrainingVolume,
} from "@/lib/statistics/analysis";

function makeProblem(
  id: string,
  overrides: Record<string, unknown> = {},
): ProblemFile {
  return {
    fileName: `${id}.md`,
    content: "body",
    frontmatter: problemFrontmatterSchema.parse({
      id,
      title: id,
      platform: "Codeforces",
      solvedAt: "2026-08-10",
      status: "C",
      ...overrides,
    }),
  };
}

const today = dateOnlySchema.parse("2026-08-10");

describe("statistics analysis", () => {
  it("passes the 100-problem mastery acceptance scenario", () => {
    const statuses = [
      ...Array.from({ length: 20 }, () => "A" as const),
      ...Array.from({ length: 30 }, () => "B" as const),
      ...Array.from({ length: 40 }, () => "C" as const),
      ...Array.from({ length: 10 }, () => "D" as const),
    ];
    const problems = statuses.map((status, index) =>
      makeProblem(`problem-${index}`, { status }),
    );
    const summary = getStatisticsSummary(problems, today);

    expect(summary.overall).toMatchObject({
      total: 100,
      statusCounts: { A: 20, B: 30, C: 40, D: 10 },
      mastered: 50,
      masteryRate: 50,
    });
  });

  it("counts multi-category problems in each category but once overall", () => {
    const problems = [
      makeProblem("multi-category", {
        status: "A",
        categories: ["图论", "数据结构"],
      }),
    ];
    const summary = getStatisticsSummary(problems, today);

    expect(summary.overall.total).toBe(1);
    expect(summary.categories.find((item) => item.category === "图论")?.total).toBe(1);
    expect(summary.categories.find((item) => item.category === "数据结构")?.total).toBe(1);
  });

  it("bins only non-null ratings and aggregates a daily Rating trend", () => {
    const problems = [
      makeProblem("low", { rating: 800, solvedAt: "2026-08-08" }),
      makeProblem("mid-a", { rating: 1700, solvedAt: "2026-08-09" }),
      makeProblem("mid-b", { rating: 1900, solvedAt: "2026-08-09" }),
      makeProblem("high", { rating: 2500, solvedAt: "2026-08-10" }),
      makeProblem("missing", { rating: null }),
    ];
    const distribution = getRatingDistribution(problems);

    expect(distribution.map((item) => item.count)).toEqual([1, 1, 1, 0, 0, 1]);
    expect(getRatingTrend(problems)).toEqual([
      { date: "2026-08-08", averageRating: 800, problemCount: 1 },
      { date: "2026-08-09", averageRating: 1800, problemCount: 2 },
      { date: "2026-08-10", averageRating: 2500, problemCount: 1 },
    ]);
    expect(getRatingTrend(problems, 0)).toEqual([]);
  });

  it("uses inclusive local-calendar boundaries for training volume", () => {
    const problems = [
      makeProblem("today", { solvedAt: "2026-08-10" }),
      makeProblem("seven-start", { solvedAt: "2026-08-04" }),
      makeProblem("seven-outside", { solvedAt: "2026-08-03" }),
      makeProblem("thirty-start", { solvedAt: "2026-07-12" }),
      makeProblem("year-start", { solvedAt: "2026-01-01" }),
      makeProblem("last-year", { solvedAt: "2025-12-31" }),
      makeProblem("future", { solvedAt: "2026-08-11" }),
    ];

    expect(getTrainingVolume(problems, today)).toEqual({
      last7Days: 2,
      last30Days: 4,
      thisYear: 5,
    });
  });

  it("derives transition counts and long-term C/D conversion from history", () => {
    const problems = [
      makeProblem("converted-c", {
        status: "A",
        reviews: [
          { date: "2026-07-01", fromStatus: "C", toStatus: "B", note: "up" },
          { date: "2026-07-10", fromStatus: "B", toStatus: "A", note: "up" },
        ],
      }),
      makeProblem("round-trip-d", {
        status: "D",
        reviews: [
          { date: "2026-07-01", fromStatus: "D", toStatus: "B", note: "up" },
          { date: "2026-07-10", fromStatus: "B", toStatus: "D", note: "down" },
        ],
      }),
      makeProblem("stays-c", { status: "C" }),
      makeProblem("stays-d", { status: "D" }),
    ];
    const matrix = getConversionMatrix(problems);
    const conversions = getJourneyConversions(problems);

    expect(matrix.C.B).toBe(1);
    expect(matrix.D.B).toBe(1);
    expect(matrix.B.A).toBe(1);
    expect(matrix.B.D).toBe(1);
    expect(conversions).toEqual([
      { sourceStatus: "C", eligibleProblems: 2, convertedProblems: 1, conversionRate: 50 },
      { sourceStatus: "D", eligibleProblems: 2, convertedProblems: 1, conversionRate: 50 },
    ]);
  });

  it("aggregates current D knowledge gaps by every category and tag", () => {
    const gaps = getDKnowledgeGaps([
      makeProblem("d-one", {
        status: "D",
        categories: ["图论", "数据结构"],
        tags: ["最短路", "优先队列"],
      }),
      makeProblem("d-two", {
        status: "D",
        categories: ["图论"],
        tags: ["最短路"],
      }),
      makeProblem("d-unclassified", { status: "D" }),
      makeProblem("c-ignore", {
        status: "C",
        categories: ["图论"],
        tags: ["最短路"],
      }),
    ]);

    expect(gaps.total).toBe(3);
    expect(gaps.unclassified).toBe(1);
    expect(gaps.categories[0]).toEqual({ category: "图论", count: 2 });
    expect(gaps.tags[0]).toEqual({ tag: "最短路", count: 2 });
  });

  it("builds a solved-plus-Review heatmap without future activity", () => {
    const heatmap = getActivityHeatmap(
      [
        makeProblem("active", {
          solvedAt: "2026-08-09",
          reviews: [
            { date: "2026-08-09", fromStatus: "C", toStatus: "B", note: "same day" },
            { date: "2026-08-10", fromStatus: "B", toStatus: "A", note: "today" },
            { date: "2026-08-11", fromStatus: "A", toStatus: "A", note: "future" },
          ],
        }),
      ],
      today,
      3,
    );

    expect(heatmap).toEqual([
      { date: "2026-08-08", solvedCount: 0, reviewCount: 0, total: 0 },
      { date: "2026-08-09", solvedCount: 1, reviewCount: 1, total: 2 },
      { date: "2026-08-10", solvedCount: 0, reviewCount: 1, total: 1 },
    ]);
  });

  it("reports every configured platform and handles empty input safely", () => {
    const distribution = getPlatformDistribution([
      makeProblem("cf", { platform: "Codeforces" }),
      makeProblem("atcoder", { platform: "AtCoder" }),
      makeProblem("atcoder-two", { platform: "AtCoder" }),
    ]);

    expect(distribution[0]).toMatchObject({ platform: "AtCoder", count: 2 });
    expect(distribution).toHaveLength(7);
    expect(getStatisticsSummary([], today)).toMatchObject({
      overall: { total: 0, mastered: 0, masteryRate: 0 },
      reviewCount: 0,
      dKnowledgeGaps: { total: 0, unclassified: 0 },
    });
  });
});
