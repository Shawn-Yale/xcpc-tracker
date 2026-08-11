import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { ProblemDataError } from "@/lib/problems/errors";
import { serializeProblemMarkdown } from "@/lib/problems/markdown";
import {
  createProblemRepository,
  ProblemRepository,
} from "@/lib/problems/repository";
import {
  problemFrontmatterSchema,
  type ProblemDocument,
} from "@/lib/problems/schema";

const temporaryDirectories: string[] = [];

async function makeDirectory(): Promise<string> {
  const directory = await mkdtemp(path.join(tmpdir(), "xcpc-tracker-test-"));
  temporaryDirectories.push(directory);
  return directory;
}

function makeProblem(id: string, title = "Test Problem"): ProblemDocument {
  return {
    frontmatter: problemFrontmatterSchema.parse({
      id,
      title,
      platform: "Codeforces",
      solvedAt: "2026-08-01",
      status: "C",
      categories: ["图论"],
      tags: ["最短路"],
      nextReviewDate: "2026-08-08",
      reviewIntervalDays: 7,
      reviews: [
        {
          date: "2026-08-04",
          fromStatus: "D",
          toStatus: "C",
          note: "已经能够复现算法。",
          nextIntervalDays: 4,
        },
      ],
      futureField: "keep-me",
    }),
    content: "\n# 正确思路\n\n测试正文。\n",
  };
}

afterEach(async () => {
  vi.unstubAllEnvs();
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("ProblemRepository directory selection", () => {
  it("uses an explicit environment directory without changing the production default", async () => {
    const directory = await makeDirectory();
    vi.stubEnv("XCPC_PROBLEMS_DIRECTORY", directory);
    const repository = createProblemRepository();

    expect(repository.directory).toBe(path.resolve(directory));
    await expect(repository.loadAll()).resolves.toEqual({
      problems: [],
      errors: [],
    });
  });

  it("keeps the repository data/problems directory as the default", () => {
    vi.stubEnv("XCPC_PROBLEMS_DIRECTORY", "");

    expect(createProblemRepository().directory).toBe(
      path.join(process.cwd(), "data", "problems"),
    );
  });
});

describe("ProblemRepository loading", () => {
  it("loads valid files with one cached directory scan", async () => {
    const directory = await makeDirectory();
    const repository = new ProblemRepository(directory);
    await repository.create(makeProblem("codeforces-20-c", "Dijkstra?"));

    const firstLoad = repository.loadAll();
    const secondLoad = repository.loadAll();

    expect(secondLoad).toBe(firstLoad);
    await expect(firstLoad).resolves.toMatchObject({
      problems: [{ fileName: "codeforces-20-c.md" }],
      errors: [],
    });
    await expect(repository.findById("codeforces-20-c")).resolves.toMatchObject({
      frontmatter: { title: "Dijkstra?" },
    });
  });

  it("isolates malformed files while retaining valid problems", async () => {
    const directory = await makeDirectory();
    const repository = new ProblemRepository(directory);
    await repository.create(makeProblem("valid-problem"));
    await writeFile(
      path.join(directory, "broken-problem.md"),
      "---\nid: broken-problem\nstatus: Z\n---\nbody",
      "utf8",
    );

    const result = await new ProblemRepository(directory).loadAll();

    expect(result.problems.map((problem) => problem.frontmatter.id)).toEqual([
      "valid-problem",
    ]);
    expect(result.errors).toEqual([
      expect.objectContaining({
        fileName: "broken-problem.md",
        code: "validation-error",
      }),
    ]);
  });

  it("reports filename mismatches and every member of a duplicate-ID group", async () => {
    const directory = await makeDirectory();
    const duplicate = serializeProblemMarkdown(
      makeProblem("same-id").frontmatter,
      "body",
    );
    const mismatch = serializeProblemMarkdown(
      makeProblem("expected-name").frontmatter,
      "body",
    );

    await Promise.all([
      writeFile(path.join(directory, "first.md"), duplicate, "utf8"),
      writeFile(path.join(directory, "second.md"), duplicate, "utf8"),
      writeFile(path.join(directory, "wrong-name.md"), mismatch, "utf8"),
    ]);

    const result = await new ProblemRepository(directory).loadAll();

    expect(result.problems).toEqual([]);
    expect(result.errors.filter((error) => error.code === "duplicate-id")).toHaveLength(
      2,
    );
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        fileName: "wrong-name.md",
        code: "id-mismatch",
      }),
    );
  });
});

describe("ProblemRepository writes", () => {
  it("creates, updates, and reloads a problem without losing durable data", async () => {
    const directory = await makeDirectory();
    const repository = new ProblemRepository(directory);
    const created = await repository.create(makeProblem("safe-update"));

    expect(created.fileName).toBe("safe-update.md");

    const updated = await repository.update("safe-update", {
      frontmatter: { status: "B", rating: 1900 },
    });
    const source = await readFile(path.join(directory, "safe-update.md"), "utf8");

    expect(updated.frontmatter.status).toBe("B");
    expect(updated.frontmatter.reviews).toHaveLength(1);
    expect(updated.frontmatter.futureField).toBe("keep-me");
    expect(updated.content).toContain("测试正文");
    expect(source).not.toContain(".tmp");
    await expect(repository.findById("safe-update")).resolves.toMatchObject({
      frontmatter: { rating: 1900 },
    });
  });

  it("refuses duplicate creation and path traversal", async () => {
    const directory = await makeDirectory();
    const repository = new ProblemRepository(directory);
    await repository.create(makeProblem("unique-id"));

    await expect(repository.create(makeProblem("unique-id"))).rejects.toMatchObject({
      code: "already-exists",
    });
    await expect(repository.findById("../outside")).rejects.toBeInstanceOf(
      ProblemDataError,
    );
  });

  it("does not alter the original file when an update fails validation", async () => {
    const directory = await makeDirectory();
    const repository = new ProblemRepository(directory);
    await repository.create(makeProblem("unchanged-on-error"));
    const filePath = path.join(directory, "unchanged-on-error.md");
    const before = await readFile(filePath, "utf8");

    await expect(
      repository.update("unchanged-on-error", {
        frontmatter: { status: "Z" } as never,
      }),
    ).rejects.toThrow();

    await expect(readFile(filePath, "utf8")).resolves.toBe(before);
  });

  it("completes a Review from freshly read data and preserves old history", async () => {
    const directory = await makeDirectory();
    const repository = new ProblemRepository(directory);
    await repository.create(makeProblem("review-write"));

    const completed = await repository.completeReview("review-write", {
      date: "2026-08-10",
      newStatus: "B",
      durationMinutes: 21,
      note: "Completed without looking at the solution.",
      scheduleNext: true,
    });

    expect(completed.frontmatter).toMatchObject({
      status: "B",
      nextReviewDate: "2026-08-24",
      reviewIntervalDays: 14,
    });
    expect(completed.frontmatter.reviews).toHaveLength(2);
    expect(completed.frontmatter.reviews[0].note).toBe("已经能够复现算法。");
    expect(completed.frontmatter.reviews[1]).toMatchObject({
      fromStatus: "C",
      toStatus: "B",
    });
  });

  it("matches the C to B Review acceptance flow with a 14-day interval", async () => {
    const directory = await makeDirectory();
    const repository = new ProblemRepository(directory);
    const problem = makeProblem("acceptance-flow");
    problem.frontmatter = problemFrontmatterSchema.parse({
      ...problem.frontmatter,
      solvedAt: "2026-08-10",
      nextReviewDate: "2026-08-14",
      reviewIntervalDays: 4,
      reviews: [],
    });
    await repository.create(problem);

    const completed = await repository.completeReview("acceptance-flow", {
      date: "2026-08-17",
      newStatus: "B",
      note: "Now solved independently.",
      scheduleNext: true,
      nextIntervalDays: 14,
    });

    expect(completed.frontmatter.status).toBe("B");
    expect(completed.frontmatter.nextReviewDate).toBe("2026-08-31");
    expect(completed.frontmatter.reviews).toEqual([
      expect.objectContaining({
        date: "2026-08-17",
        fromStatus: "C",
        toStatus: "B",
        nextIntervalDays: 14,
      }),
    ]);
  });

  it("leaves the file unchanged when Review completion fails", async () => {
    const directory = await makeDirectory();
    const repository = new ProblemRepository(directory);
    await repository.create(makeProblem("failed-review"));
    const filePath = path.join(directory, "failed-review.md");
    const before = await readFile(filePath, "utf8");

    await expect(
      repository.completeReview("failed-review", {
        date: "2026-08-10",
        newStatus: "D",
        note: "Invalid scheduling fields",
        scheduleNext: false,
        nextIntervalDays: 3,
      }),
    ).rejects.toThrow();
    await expect(readFile(filePath, "utf8")).resolves.toBe(before);
  });
});
