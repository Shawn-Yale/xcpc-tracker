import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { ProblemRepository } from "@/lib/problems/repository";

import {
  createProblemFileFixtures,
  writeProblemFileFixtures,
} from "./fixtures/problem-files";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("test-owned Problem fixtures", () => {
  it("loads diverse test-local Markdown fixtures without data errors", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "xcpc-fixtures-"));
    temporaryDirectories.push(directory);
    const fixtures = createProblemFileFixtures();
    await writeProblemFileFixtures(directory, fixtures);

    const repository = new ProblemRepository(directory);
    const result = await repository.loadAll();

    expect(result.errors).toEqual([]);
    expect(result.problems).toHaveLength(fixtures.length);
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
