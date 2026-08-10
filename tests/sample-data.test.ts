import path from "node:path";

import { describe, expect, it } from "vitest";

import { ProblemRepository } from "@/lib/problems/repository";

describe("repository sample data", () => {
  it("loads all real problem examples without data errors", async () => {
    const repository = new ProblemRepository(
      path.join(process.cwd(), "data", "problems"),
    );
    const result = await repository.loadAll();

    expect(result.errors).toEqual([]);
    expect(result.problems.length).toBeGreaterThanOrEqual(8);
    expect(new Set(result.problems.map((problem) => problem.frontmatter.status))).toEqual(
      new Set(["A", "B", "C", "D"]),
    );
    expect(
      result.problems.some((problem) => problem.frontmatter.categories.length > 1),
    ).toBe(true);
    expect(
      result.problems.some((problem) => problem.frontmatter.rating == null),
    ).toBe(true);
    expect(
      result.problems.some((problem) => problem.frontmatter.reviews.length > 0),
    ).toBe(true);
  });
});
