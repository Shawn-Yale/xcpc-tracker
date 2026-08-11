import { describe, expect, it } from "vitest";

import { categoryMetadata, categoryValues, getCategoryBySlug } from "@/config/categories";
import {
  getCategoryStats,
  getProblemStats,
  getStatusStats,
  getTagCounts,
} from "@/lib/statistics/problem-stats";

import { createProblemFileFixtures } from "./fixtures/problem-files";

describe("problem mastery statistics", () => {
  it("calculates global counts without duplicating multi-category problems", () => {
    expect(getProblemStats(createProblemFileFixtures())).toEqual({
      total: 8,
      statusCounts: { A: 2, B: 3, C: 2, D: 1 },
      mastered: 5,
      masteryRate: 62.5,
    });
  });

  it("returns a safe zero rate for empty input", () => {
    expect(getProblemStats([])).toEqual({
      total: 0,
      statusCounts: { A: 0, B: 0, C: 0, D: 0 },
      mastered: 0,
      masteryRate: 0,
    });
  });

  it("produces direct A/B/C/D pool counts", () => {
    expect(getStatusStats(createProblemFileFixtures())).toEqual([
      { status: "A", count: 2 },
      { status: "B", count: 3 },
      { status: "C", count: 2 },
      { status: "D", count: 1 },
    ]);
  });
});

describe("knowledge aggregation", () => {
  it("counts one problem in every category it belongs to", () => {
    const stats = new Map(
      getCategoryStats(createProblemFileFixtures()).map((categoryStats) => [
        categoryStats.category,
        categoryStats,
      ]),
    );

    expect(stats.get("图论")?.total).toBe(2);
    expect(stats.get("数据结构")?.total).toBe(1);
    expect(stats.get("动态规划")).toMatchObject({
      total: 2,
      statusCounts: { A: 1, B: 0, C: 1, D: 0 },
      mastered: 1,
      masteryRate: 50,
    });
    expect(stats.get("计算几何")).toMatchObject({ total: 0, masteryRate: 0 });
  });

  it("aggregates flat tags in count and name order", () => {
    const tags = getTagCounts(createProblemFileFixtures());

    expect(tags).toContainEqual({ tag: "Dijkstra", count: 1 });
    expect(tags).toContainEqual({ tag: "线性 DP", count: 2 });
    expect(tags[0]).toEqual({ tag: "线性 DP", count: 2 });
  });

  it("keeps every category slug unique and reversible", () => {
    const slugs = categoryValues.map((category) => categoryMetadata[category].slug);

    expect(new Set(slugs).size).toBe(categoryValues.length);
    for (const category of categoryValues) {
      expect(getCategoryBySlug(categoryMetadata[category].slug)).toBe(category);
    }
    expect(getCategoryBySlug("not-a-category")).toBeUndefined();
  });
});
