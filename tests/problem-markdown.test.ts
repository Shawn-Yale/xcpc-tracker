import { describe, expect, it } from "vitest";

import {
  completeProblemReviewMarkdown,
  parseProblemMarkdown,
  serializeProblemMarkdown,
  updateProblemMarkdown,
} from "@/lib/problems/markdown";

const source = `---
# Keep this identity comment.
id: codeforces-4-a
title: Watermelon
platform: Codeforces
solvedAt: "2026-07-01"
status: A
categories:
  - 数学与数论
tags: []
reviews: []
futureField: keep-me
---

# 题意抽象

判断一个数能否拆成两个正偶数。
`;

describe("problem Markdown parsing", () => {
  it("parses Front Matter separately from the untouched body", () => {
    const problem = parseProblemMarkdown(source);

    expect(problem.frontmatter.id).toBe("codeforces-4-a");
    expect(problem.frontmatter.categories).toEqual(["数学与数论"]);
    expect(problem.frontmatter.futureField).toBe("keep-me");
    expect(problem.content).toContain("# 题意抽象");
  });

  it("rejects missing delimiters, malformed YAML, and invalid schema data", () => {
    expect(() => parseProblemMarkdown("# no frontmatter")).toThrow(
      "must begin with a complete YAML Front Matter block",
    );
    expect(() =>
      parseProblemMarkdown("---\nid: [broken\n---\nbody"),
    ).toThrow(SyntaxError);
    expect(() =>
      parseProblemMarkdown(
        "---\nid: invalid\ntitle: Test\nplatform: Codeforces\nsolvedAt: 2026-02-30\nstatus: A\n---\nbody",
      ),
    ).toThrow("solvedAt");
  });
});

describe("problem Markdown serialization", () => {
  it("round-trips a new valid problem", () => {
    const serialized = serializeProblemMarkdown(
      {
        id: "atcoder-dp-a",
        title: "Frog 1",
        platform: "AtCoder",
        solvedAt: "2026-07-02",
        status: "A",
      },
      "\n# 正确思路\n\n使用一维 DP。\n",
    );
    const parsed = parseProblemMarkdown(serialized);

    expect(parsed.frontmatter.id).toBe("atcoder-dp-a");
    expect(parsed.frontmatter.reviews).toEqual([]);
    expect(parsed.content).toContain("使用一维 DP");
  });

  it("updates only requested fields and retains history, unknown data, comments, and body", () => {
    const updated = updateProblemMarkdown(source, {
      frontmatter: { rating: 800 },
    });
    const parsed = parseProblemMarkdown(updated);

    expect(parsed.frontmatter.rating).toBe(800);
    expect(parsed.frontmatter.reviews).toEqual([]);
    expect(parsed.frontmatter.futureField).toBe("keep-me");
    expect(updated).toContain("# Keep this identity comment.");
    expect(parsed.content).toBe(parseProblemMarkdown(source).content);
  });

  it("returns byte-identical content when a patch makes no change", () => {
    expect(
      updateProblemMarkdown(source, { frontmatter: { title: "Watermelon" } }),
    ).toBe(source);
  });

  it("does not add null fields when optional values were already omitted", () => {
    expect(
      updateProblemMarkdown(source, {
        frontmatter: {
          contest: null,
          problem: null,
          url: null,
          durationMinutes: null,
          nextReviewDate: null,
          reviewIntervalDays: null,
        },
        content: parseProblemMarkdown(source).content,
      }),
    ).toBe(source);
  });

  it("can replace the Markdown body without reformatting Front Matter", () => {
    const newBody = "\n# 做题感想\n\n新的正文。\n";
    const updated = updateProblemMarkdown(source, { content: newBody });
    const originalHeader = source.slice(0, source.indexOf("\n\n# 题意抽象") + 1);

    expect(updated.startsWith(originalHeader)).toBe(true);
    expect(parseProblemMarkdown(updated).content).toBe(newBody);
  });

  it("blocks ID and Review History changes through the general update path", () => {
    expect(() =>
      updateProblemMarkdown(source, {
        frontmatter: { id: "other-id" } as never,
      }),
    ).toThrow("cannot be updated");
    expect(() =>
      updateProblemMarkdown(source, {
        frontmatter: { reviews: [] } as never,
      }),
    ).toThrow("cannot be updated");
  });

  it("appends a Review while preserving comments, unknown fields, and body", () => {
    const completed = completeProblemReviewMarkdown(source, {
      date: "2026-08-10",
      newStatus: "B",
      durationMinutes: 18,
      note: "The proof is now clear.",
      scheduleNext: true,
    });
    const parsed = parseProblemMarkdown(completed);

    expect(parsed.frontmatter.status).toBe("B");
    expect(parsed.frontmatter.nextReviewDate).toBe("2026-08-24");
    expect(parsed.frontmatter.reviews).toEqual([
      expect.objectContaining({
        fromStatus: "A",
        toStatus: "B",
        nextIntervalDays: 14,
      }),
    ]);
    expect(parsed.frontmatter.futureField).toBe("keep-me");
    expect(completed).toContain("# Keep this identity comment.");
    expect(parsed.content).toBe(parseProblemMarkdown(source).content);
  });
});
