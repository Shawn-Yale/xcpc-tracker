import { describe, expect, it } from "vitest";

import { dateOnlySchema } from "@/lib/date/date-only";
import {
  parseProblemQuery,
  queryProblems,
  type ProblemQuery,
} from "@/lib/problems/query";

import { createProblemFileFixtures } from "./fixtures/problem-files";

function validKnowledgeFilter(id: string): ProblemQuery["knowledge"] {
  const filter = parseProblemQuery({ knowledge: id }).knowledge;
  if (filter.state !== "valid") throw new Error(`Invalid test knowledge ID: ${id}`);
  return filter;
}

const today = dateOnlySchema.parse("2026-08-10");
const defaults: ProblemQuery = {
  search: "",
  status: "all",
  knowledge: { state: "none" },
  platform: "all",
  review: "all",
  sort: "solvedAt",
  direction: "desc",
};

describe("problem query parsing", () => {
  it("normalizes valid URL parameters", () => {
    expect(
      parseProblemQuery({
        search: "  DP  ",
        status: "C",
        knowledge: "dynamic-programming.linear",
        platform: "Codeforces",
        review: "scheduled",
        sort: "rating",
        direction: "asc",
      }),
    ).toEqual({
      search: "DP",
      status: "C",
      knowledge: { state: "valid", id: "dynamic-programming.linear" },
      platform: "Codeforces",
      review: "scheduled",
      sort: "rating",
      direction: "asc",
    });
  });

  it("keeps unrelated unsupported values safe while exposing an invalid knowledge filter", () => {
    expect(
      parseProblemQuery({
        status: "E",
        knowledge: "unknown",
        platform: "unknown",
        review: "later",
        sort: "title",
        direction: "sideways",
      }),
    ).toEqual({
      ...defaults,
      knowledge: { state: "invalid", rawValue: "unknown", reason: "unknown-id" },
    });
  });

  it("accepts selectable and non-selectable knowledge nodes", () => {
    expect(parseProblemQuery({ knowledge: "graph.shortest-path.dijkstra" }).knowledge)
      .toEqual({ state: "valid", id: "graph.shortest-path.dijkstra" });
    expect(parseProblemQuery({ knowledge: "graph" }).knowledge)
      .toEqual({ state: "valid", id: "graph" });
  });

  it.each([
    [{ knowledge: "Graph!" }, "malformed-id"],
    [{ knowledge: ["graph", "math"] as string[] }, "multiple-values"],
    [{ category: "图论" }, "legacy-category"],
    [{ category: "图论", knowledge: "graph" }, "legacy-category"],
  ] as const)("marks invalid taxonomy parameters", (parameters, reason) => {
    expect(parseProblemQuery(parameters).knowledge).toMatchObject({ state: "invalid", reason });
  });
});

describe("problem search and filters", () => {
  it.each([
    ["frog", ["fixture-frog-dp"]],
    ["round 260", ["fixture-boredom-dp"]],
    ["最短路", ["fixture-graph-gap", "fixture-shortest-path"]],
  ])("partially searches title, contest, problem, and tags with %s", (search, ids) => {
    const result = queryProblems(
      createProblemFileFixtures(),
      { ...defaults, search },
      today,
    );
    expect(result.map((problem) => problem.frontmatter.id)).toEqual(ids);
  });

  it("combines status, knowledge, and platform filters", () => {
    const result = queryProblems(
      createProblemFileFixtures(),
      {
        ...defaults,
        status: "C",
        knowledge: validKnowledgeFilter("greedy-constructive.greedy"),
        platform: "AtCoder",
      },
      today,
    );

    expect(result.map((problem) => problem.frontmatter.id)).toEqual([
      "fixture-greedy-game",
    ]);
  });

  it("matches direct selections and descendants for parent filters without duplicates", () => {
    const graphIds = queryProblems(
      createProblemFileFixtures(),
      { ...defaults, knowledge: validKnowledgeFilter("graph") },
      today,
    ).map((problem) => problem.frontmatter.id);
    const dataStructureIds = queryProblems(
      createProblemFileFixtures(),
      { ...defaults, knowledge: validKnowledgeFilter("data-structure") },
      today,
    ).map((problem) => problem.frontmatter.id);

    expect(graphIds).toContain("fixture-shortest-path");
    expect(dataStructureIds).toContain("fixture-shortest-path");
    expect(new Set(graphIds).size).toBe(graphIds.length);
  });

  it("returns no Problems for an invalid filter", () => {
    expect(queryProblems(createProblemFileFixtures(), {
      ...defaults,
      knowledge: { state: "invalid", rawValue: "unknown", reason: "unknown-id" },
    }, today)).toEqual([]);
  });

  it.each([
    ["due", ["fixture-shortest-path"]],
    ["overdue", ["fixture-shortest-path"]],
    ["scheduled", ["fixture-graph-gap", "fixture-boredom-dp"]],
    ["none", [
      "fixture-greedy-game",
      "fixture-math-bitwise",
      "fixture-frog-dp",
      "fixture-string-basic",
      "fixture-math-basic",
    ]],
  ] as const)("filters %s Review records", (review, expectedIds) => {
    const result = queryProblems(
      createProblemFileFixtures(),
      { ...defaults, review },
      today,
    );
    expect(result.map((problem) => problem.frontmatter.id)).toEqual(expectedIds);
  });
});

describe("problem sorting", () => {
  it("sorts rating descending while keeping missing values last", () => {
    const result = queryProblems(
      createProblemFileFixtures(),
      { ...defaults, sort: "rating", direction: "desc" },
      today,
    );
    const ratings = result.map((problem) => problem.frontmatter.rating ?? null);

    expect(ratings.slice(0, 4)).toEqual([1900, 1500, 800, 800]);
    expect(ratings.slice(-4)).toEqual([null, null, null, null]);
  });

  it("sorts Review dates ascending while keeping unscheduled records last", () => {
    const result = queryProblems(
      createProblemFileFixtures(),
      { ...defaults, sort: "nextReviewDate", direction: "asc" },
      today,
    );

    expect(
      result.slice(0, 3).map((problem) => problem.frontmatter.nextReviewDate),
    ).toEqual(["2026-08-08", "2026-08-11", "2026-08-12"]);
    expect(result.at(-1)?.frontmatter.nextReviewDate).toBeUndefined();
  });
});
