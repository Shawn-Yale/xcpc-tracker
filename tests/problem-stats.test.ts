import { describe, expect, it } from "vitest";

import { knowledgeCatalog } from "@/config/knowledge-taxonomy";
import { getKnowledgeEntry } from "@/lib/knowledge/catalog";

import {
  getKnowledgeStats,
  getProblemStats,
  getStatusStats,
  getTagCounts,
} from "@/lib/statistics/problem-stats";

import { createProblemFileFixtures } from "./fixtures/problem-files";

function knowledgeId(value: string) {
  const entry = getKnowledgeEntry(knowledgeCatalog, value);
  if (!entry) throw new Error(`Invalid test knowledge ID: ${value}`);
  return entry.id;
}

describe("problem mastery statistics", () => {
  it("calculates global counts without duplicating multi-knowledge problems", () => {
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
  it("provides direct and Problem-deduplicated ancestor rollup statistics", () => {
    const stats = new Map(
      getKnowledgeStats(createProblemFileFixtures()).map((knowledgeStats) => [
        knowledgeStats.id,
        knowledgeStats,
      ]),
    );

    expect(stats.get(knowledgeId("graph"))?.direct.total).toBe(0);
    expect(stats.get(knowledgeId("graph"))?.rollup.total).toBe(2);
    expect(stats.get(knowledgeId("graph.shortest-path"))?.direct.total).toBe(1);
    expect(stats.get(knowledgeId("graph.shortest-path"))?.rollup.total).toBe(2);
    expect(stats.get(knowledgeId("data-structure"))?.rollup.total).toBe(1);
    expect(stats.get(knowledgeId("dynamic-programming.linear"))?.direct).toMatchObject({
      total: 2,
      statusCounts: { A: 1, B: 0, C: 1, D: 0 },
      mastered: 1,
      masteryRate: 50,
    });
    expect(stats.get(knowledgeId("computational-geometry"))?.rollup).toMatchObject({ total: 0, masteryRate: 0 });
  });

  it("aggregates flat tags in count and name order", () => {
    const tags = getTagCounts(createProblemFileFixtures());

    expect(tags).toContainEqual({ tag: "Dijkstra", count: 1 });
    expect(tags).toContainEqual({ tag: "线性 DP", count: 2 });
    expect(tags[0]).toEqual({ tag: "线性 DP", count: 2 });
  });
});
