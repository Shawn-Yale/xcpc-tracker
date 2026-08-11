import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { dateOnlySchema } from "@/lib/date/date-only";
import {
  parseProblemQuery,
  queryProblems,
} from "@/lib/problems/query";
import { ProblemRepository } from "@/lib/problems/repository";
import { getStatisticsSummary } from "@/lib/statistics/analysis";

const temporaryDirectories: string[] = [];
const today = dateOnlySchema.parse("2026-08-10");

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("empty Problem data", () => {
  it("loads an empty repository without errors", async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "xcpc-empty-"));
    temporaryDirectories.push(directory);

    await expect(new ProblemRepository(directory).loadAll()).resolves.toEqual({
      problems: [],
      errors: [],
    });
  });

  it("returns no query results for an empty Problem collection", () => {
    expect(queryProblems([], parseProblemQuery({}), today)).toEqual([]);
  });

  it("returns zero-valued statistics for an empty Problem collection", () => {
    expect(getStatisticsSummary([], today)).toMatchObject({
      overall: {
        total: 0,
        statusCounts: { A: 0, B: 0, C: 0, D: 0 },
        mastered: 0,
        masteryRate: 0,
      },
      reviewCount: 0,
      dKnowledgeGaps: {
        total: 0,
        unclassified: 0,
        categories: [],
        tags: [],
      },
    });
  });
});
