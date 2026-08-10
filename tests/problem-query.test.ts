import path from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import { dateOnlySchema } from "@/lib/date/date-only";
import {
  parseProblemQuery,
  queryProblems,
  type ProblemQuery,
} from "@/lib/problems/query";
import { ProblemRepository } from "@/lib/problems/repository";
import type { ProblemFile } from "@/lib/problems/types";

const today = dateOnlySchema.parse("2026-08-10");
const defaults: ProblemQuery = {
  search: "",
  status: "all",
  category: "all",
  platform: "all",
  review: "all",
  sort: "solvedAt",
  direction: "desc",
};

let problems: ProblemFile[];

beforeAll(async () => {
  const repository = new ProblemRepository(
    path.join(process.cwd(), "data", "problems"),
  );
  const result = await repository.loadAll();
  expect(result.errors).toEqual([]);
  problems = result.problems;
});

describe("problem query parsing", () => {
  it("normalizes valid URL parameters", () => {
    expect(
      parseProblemQuery({
        search: "  DP  ",
        status: "C",
        category: "动态规划",
        platform: "Codeforces",
        review: "scheduled",
        sort: "rating",
        direction: "asc",
      }),
    ).toEqual({
      search: "DP",
      status: "C",
      category: "动态规划",
      platform: "Codeforces",
      review: "scheduled",
      sort: "rating",
      direction: "asc",
    });
  });

  it("falls back safely for unsupported values", () => {
    expect(
      parseProblemQuery({
        status: "E",
        category: "unknown",
        platform: "unknown",
        review: "later",
        sort: "title",
        direction: "sideways",
      }),
    ).toEqual(defaults);
  });
});

describe("problem search and filters", () => {
  it.each([
    ["frog", ["atcoder-dp-a"]],
    ["round 260", ["codeforces-455-a"]],
    ["最短路", ["atcoder-abc168-d", "codeforces-20-c"]],
  ])("partially searches title, contest, problem, and tags with %s", (search, ids) => {
    const result = queryProblems(problems, { ...defaults, search }, today);
    expect(result.map((problem) => problem.frontmatter.id)).toEqual(ids);
  });

  it("combines status, category, and platform filters", () => {
    const result = queryProblems(
      problems,
      {
        ...defaults,
        status: "C",
        category: "贪心、构造与不变量",
        platform: "AtCoder",
      },
      today,
    );

    expect(result.map((problem) => problem.frontmatter.id)).toEqual([
      "atcoder-abc088-b",
    ]);
  });

  it("includes a multi-category problem in every matching category", () => {
    const graphIds = queryProblems(
      problems,
      { ...defaults, category: "图论" },
      today,
    ).map((problem) => problem.frontmatter.id);
    const dataStructureIds = queryProblems(
      problems,
      { ...defaults, category: "数据结构" },
      today,
    ).map((problem) => problem.frontmatter.id);

    expect(graphIds).toContain("codeforces-20-c");
    expect(dataStructureIds).toContain("codeforces-20-c");
  });

  it.each([
    ["due", ["codeforces-20-c"]],
    ["overdue", ["codeforces-20-c"]],
    ["scheduled", ["atcoder-abc168-d", "codeforces-455-a"]],
    ["none", [
      "atcoder-abc088-b",
      "atcoder-abc081-b",
      "atcoder-dp-a",
      "codeforces-71-a",
      "codeforces-4-a",
    ]],
  ] as const)("filters %s Review records", (review, expectedIds) => {
    const result = queryProblems(
      problems,
      { ...defaults, review },
      today,
    );
    expect(result.map((problem) => problem.frontmatter.id)).toEqual(expectedIds);
  });
});

describe("problem sorting", () => {
  it("sorts rating descending while keeping missing values last", () => {
    const result = queryProblems(
      problems,
      { ...defaults, sort: "rating", direction: "desc" },
      today,
    );
    const ratings = result.map((problem) => problem.frontmatter.rating ?? null);

    expect(ratings.slice(0, 4)).toEqual([1900, 1500, 800, 800]);
    expect(ratings.slice(-4)).toEqual([null, null, null, null]);
  });

  it("sorts Review dates ascending while keeping unscheduled records last", () => {
    const result = queryProblems(
      problems,
      { ...defaults, sort: "nextReviewDate", direction: "asc" },
      today,
    );

    expect(
      result.slice(0, 3).map((problem) => problem.frontmatter.nextReviewDate),
    ).toEqual(["2026-08-08", "2026-08-11", "2026-08-12"]);
    expect(result.at(-1)?.frontmatter.nextReviewDate).toBeUndefined();
  });
});
