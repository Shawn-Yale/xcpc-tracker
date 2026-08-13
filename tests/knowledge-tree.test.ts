import { describe, expect, it } from "vitest";

import { getKnowledgeEntry } from "@/lib/knowledge/catalog";
import type { KnowledgeId } from "@/lib/knowledge/types";
import {
  defaultKnowledgeTreeFilter,
  getRetainedKnowledgeTreeRows,
  getVisibleKnowledgeTreeRows,
  type KnowledgeTreeFilter,
} from "@/lib/statistics/knowledge-tree";
import type {
  KnowledgeStats,
  ProblemStats,
  StatusCounts,
} from "@/lib/statistics/problem-stats";

import { knowledgeCatalogFixture } from "./fixtures/knowledge-taxonomy";

const counts = (
  values: Partial<StatusCounts> = {},
): StatusCounts => ({ A: 0, B: 0, C: 0, D: 0, ...values });

function problemStats(statusCounts: StatusCounts): ProblemStats {
  const total = Object.values(statusCounts).reduce(
    (sum, count) => sum + count,
    0,
  );
  const mastered = statusCounts.A + statusCounts.B;

  return {
    total,
    statusCounts,
    mastered,
    masteryRate: total === 0 ? 0 : (mastered / total) * 100,
  };
}

function fixtureId(value: string): KnowledgeId {
  const entry = getKnowledgeEntry(knowledgeCatalogFixture, value);
  if (!entry) throw new Error(`Missing fixture Knowledge ID: ${value}`);
  return entry.id;
}

function makeStatisticsRows(): KnowledgeStats[] {
  const rollups = new Map<string, StatusCounts>([
    ["graph", counts({ A: 1, C: 1 })],
    ["graph.shortest-path", counts({ A: 1, C: 1 })],
    ["graph.shortest-path.dijkstra", counts({ C: 1 })],
    ["graph.shortest-path.bellman-ford", counts({ A: 1 })],
    ["data-structure", counts()],
    ["data-structure.heap", counts()],
  ]);

  return knowledgeCatalogFixture.entries.map((entry) => ({
    id: entry.id,
    direct: problemStats(counts()),
    rollup: problemStats(rollups.get(entry.id) ?? counts()),
  }));
}

function retained(filter: KnowledgeTreeFilter) {
  return getRetainedKnowledgeTreeRows(
    knowledgeCatalogFixture,
    makeStatisticsRows(),
    filter,
  );
}

function ids(rows: ReturnType<typeof retained>): string[] {
  return rows.map((row) => row.entry.id);
}

describe("Knowledge statistics tree presentation", () => {
  it("defaults future presentation consumers to with-training", () => {
    expect(defaultKnowledgeTreeFilter).toBe("with-training");
  });

  it("retains every taxonomy node for all", () => {
    const rows = retained("all");

    expect(ids(rows)).toEqual(
      knowledgeCatalogFixture.entries.map((entry) => entry.id),
    );
    expect(rows.every((row) => row.matched)).toBe(true);
  });

  it("retains only branches with rollup training", () => {
    expect(ids(retained("with-training"))).toEqual([
      "graph",
      "graph.shortest-path",
      "graph.shortest-path.dijkstra",
      "graph.shortest-path.bellman-ford",
    ]);
  });

  it("matches nodes whose rollup contains C or D", () => {
    const rows = retained("weak");

    expect(rows.filter((row) => row.matched).map((row) => row.entry.id)).toEqual([
      "graph",
      "graph.shortest-path",
      "graph.shortest-path.dijkstra",
    ]);
  });

  it("matches only non-empty fully mastered rollups", () => {
    const rows = retained("mastered");

    expect(rows.filter((row) => row.matched).map((row) => row.entry.id)).toEqual([
      "graph.shortest-path.bellman-ford",
    ]);
    expect(rows.some((row) => row.entry.id === "data-structure")).toBe(false);
  });

  it("retains every ancestor of a matching descendant without promoting it", () => {
    const rows = retained("mastered");

    expect(ids(rows)).toEqual([
      "graph",
      "graph.shortest-path",
      "graph.shortest-path.bellman-ford",
    ]);
    expect(rows.map((row) => row.matched)).toEqual([false, false, true]);
  });

  it("preserves catalog parent relationships and exposes retained children", () => {
    const rows = retained("mastered");

    expect(rows.map((row) => ({
      id: row.entry.id,
      parentId: row.entry.parentId,
      depth: row.entry.depth,
      hasRetainedChildren: row.hasRetainedChildren,
    }))).toEqual([
      { id: "graph", parentId: null, depth: 1, hasRetainedChildren: true },
      {
        id: "graph.shortest-path",
        parentId: "graph",
        depth: 2,
        hasRetainedChildren: true,
      },
      {
        id: "graph.shortest-path.bellman-ford",
        parentId: "graph.shortest-path",
        depth: 3,
        hasRetainedChildren: false,
      },
    ]);
  });

  it("keeps authored traversal order instead of sorting by ID or statistics", () => {
    expect(ids(retained("all"))).toEqual([
      "graph",
      "graph.shortest-path",
      "graph.shortest-path.dijkstra",
      "graph.shortest-path.bellman-ford",
      "data-structure",
      "data-structure.heap",
    ]);
  });

  it("shows only retained root Domains when collapsed", () => {
    expect(ids(getVisibleKnowledgeTreeRows(retained("all"), new Set()))).toEqual([
      "graph",
      "data-structure",
    ]);
  });

  it("shows only retained direct children for one-level expansion", () => {
    expect(ids(getVisibleKnowledgeTreeRows(
      retained("all"),
      new Set([fixtureId("graph")]),
    ))).toEqual([
      "graph",
      "graph.shortest-path",
      "data-structure",
    ]);
  });

  it("shows grandchildren only after nested expansion", () => {
    expect(ids(getVisibleKnowledgeTreeRows(
      retained("all"),
      new Set([
        fixtureId("graph"),
        fixtureId("graph.shortest-path"),
      ]),
    ))).toEqual([
      "graph",
      "graph.shortest-path",
      "graph.shortest-path.dijkstra",
      "graph.shortest-path.bellman-ford",
      "data-structure",
    ]);
  });

  it("does not restore filtered branches named in expandedIds", () => {
    const expandedIds = new Set([
      fixtureId("data-structure"),
      fixtureId("data-structure.heap"),
    ]);

    expect(ids(getVisibleKnowledgeTreeRows(
      retained("with-training"),
      expandedIds,
    ))).toEqual(["graph"]);
  });

  it("keeps filtering independent from expanded state", () => {
    const expandedIds = new Set([fixtureId("graph")]);
    const rows = retained("weak");

    expect(ids(rows)).toEqual([
      "graph",
      "graph.shortest-path",
      "graph.shortest-path.dijkstra",
    ]);
    expect(ids(getVisibleKnowledgeTreeRows(rows, expandedIds))).toEqual([
      "graph",
      "graph.shortest-path",
    ]);
    expect([...expandedIds]).toEqual(["graph"]);
  });

  it("does not mutate or copy the input statistics data", () => {
    const statisticsRows = makeStatisticsRows();
    const snapshot = structuredClone(statisticsRows);
    const rows = getRetainedKnowledgeTreeRows(
      knowledgeCatalogFixture,
      statisticsRows,
      "all",
    );

    getVisibleKnowledgeTreeRows(rows, new Set([fixtureId("graph")]));

    expect(statisticsRows).toEqual(snapshot);
    expect(rows[0].statistics).toBe(statisticsRows[0]);
    expect(rows[0].statistics.direct).toBe(statisticsRows[0].direct);
    expect(rows[0].statistics.rollup).toBe(statisticsRows[0].rollup);
  });
});
