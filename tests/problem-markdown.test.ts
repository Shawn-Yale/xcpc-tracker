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
knowledge:
  - math.number-theory
tags: []
reviews: []
futureField: keep-me
---

# 题意抽象

判断一个数能否拆成两个正偶数。
`;

const cppSolution = [
  "",
  "#include <bits/stdc++.h>",
  "using namespace std;",
  "",
  "// 区间最小值",
  "int main() {",
  '\tconst char* symbols = "< > & \\" \' ` { } # \\\\";',
  '\tconst char* markdown = "```not a fence```";',
  '\tconst char* html = "<section data-value=\'&\'>中文</section>";',
  '\tconst char* raw = R"tag({ # \\ < > & })tag";',
  "",
  "\treturn 0;",
  "}",
  "",
].join("\n");

describe("problem Markdown parsing", () => {
  it("parses Front Matter separately from the untouched body", () => {
    const problem = parseProblemMarkdown(source);

    expect(problem.frontmatter.id).toBe("codeforces-4-a");
    expect(problem.frontmatter.knowledge).toEqual(["math.number-theory"]);
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
        "---\nid: invalid\ntitle: Test\nplatform: Codeforces\nsolvedAt: 2026-02-30\nstatus: A\nknowledge: []\n---\nbody",
      ),
    ).toThrow("solvedAt");
  });

  it("rejects legacy categories even when knowledge is also present", () => {
    const legacySource = source.replace(
      "knowledge:\n  - math.number-theory",
      "knowledge: []\ncategories: []",
    );

    expect(() => parseProblemMarkdown(legacySource)).toThrow(
      "Legacy categories is not supported",
    );
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
        knowledge: [],
      },
      "\n# 正确思路\n\n使用一维 DP。\n",
    );
    const parsed = parseProblemMarkdown(serialized);

    expect(parsed.frontmatter.id).toBe("atcoder-dp-a");
    expect(parsed.frontmatter.knowledge).toEqual([]);
    expect(parsed.frontmatter.reviews).toEqual([]);
    expect(parsed.content).toContain("使用一维 DP");
    expect(serialized).toContain("knowledge: []");
    expect(serialized).not.toContain("categories:");
  });

  it("updates knowledge while preserving unrelated unknown fields", () => {
    const updated = updateProblemMarkdown(source, {
      frontmatter: {
        knowledge: ["math.combinatorics.inclusion-exclusion"],
      },
    });
    const parsed = parseProblemMarkdown(updated);

    expect(parsed.frontmatter.knowledge).toEqual([
      "math.combinatorics.inclusion-exclusion",
    ]);
    expect(parsed.frontmatter.futureField).toBe("keep-me");
    expect(updated).toContain("futureField: keep-me");
    expect(updated).not.toContain("categories:");
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
          solutionLanguage: null,
          solutionCode: null,
        },
        content: parseProblemMarkdown(source).content,
      }),
    ).toBe(source);
  });

  it("round-trips solution code without changing whitespace or special content", () => {
    const serialized = serializeProblemMarkdown(
      {
        ...parseProblemMarkdown(source).frontmatter,
        solutionLanguage: "GNU++17",
        solutionCode: cppSolution,
      },
      parseProblemMarkdown(source).content,
    );
    const parsed = parseProblemMarkdown(serialized);
    const updated = updateProblemMarkdown(serialized, {
      frontmatter: {
        solutionLanguage: parsed.frontmatter.solutionLanguage,
        solutionCode: parsed.frontmatter.solutionCode,
      },
    });
    const reloaded = parseProblemMarkdown(updated);

    expect(serialized).toContain("solutionCode: |");
    expect(parsed.frontmatter.solutionCode).toBe(cppSolution);
    expect(reloaded.frontmatter.solutionCode).toBe(cppSolution);
    expect(updated).toBe(serialized);
  });

  it.each([
    ["without a trailing newline", "int main() {\n\treturn 0;\n}"],
    ["with one trailing newline", "int main() {\n\treturn 0;\n}\n"],
    ["with a leading blank line", "\nint main() {}"],
    ["with a blank line between blocks", "int a() {}\n\nint b() {}"],
  ])("preserves solution code %s", (_name, code) => {
    const serialized = serializeProblemMarkdown(
      {
        ...parseProblemMarkdown(source).frontmatter,
        solutionLanguage: "C++20",
        solutionCode: code,
      },
      parseProblemMarkdown(source).content,
    );

    expect(parseProblemMarkdown(serialized).frontmatter.solutionCode).toBe(code);
  });

  it("does not fold a very long solution line", () => {
    const longLine = `const char* data = "${"abc<&>#{}".repeat(80)}";`;
    const serialized = serializeProblemMarkdown(
      {
        ...parseProblemMarkdown(source).frontmatter,
        solutionLanguage: "Some Future Compiler 99",
        solutionCode: longLine,
      },
      parseProblemMarkdown(source).content,
    );

    expect(serialized).toContain(longLine);
    expect(parseProblemMarkdown(serialized).frontmatter.solutionCode).toBe(longLine);
  });

  it("preserves CRLF inside solution code under the current serializer behavior", () => {
    const code = "int main() {\r\n\treturn 0;\r\n}\r\n";
    const serialized = serializeProblemMarkdown(
      {
        ...parseProblemMarkdown(source).frontmatter,
        solutionLanguage: "C++17",
        solutionCode: code,
      },
      parseProblemMarkdown(source).content,
    );

    expect(parseProblemMarkdown(serialized).frontmatter.solutionCode).toBe(code);
  });

  it("updates and clears solution fields while preserving all unrelated document data", () => {
    const withSolution = updateProblemMarkdown(source, {
      frontmatter: {
        solutionLanguage: " C++17 ",
        solutionCode: cppSolution,
      },
    });
    const parsed = parseProblemMarkdown(withSolution);

    expect(parsed.frontmatter.solutionLanguage).toBe("C++17");
    expect(parsed.frontmatter.solutionCode).toBe(cppSolution);
    expect(parsed.frontmatter.title).toBe("Watermelon");
    expect(parsed.frontmatter.knowledge).toEqual(["math.number-theory"]);
    expect(parsed.frontmatter.tags).toEqual([]);
    expect(parsed.frontmatter.reviews).toEqual([]);
    expect(parsed.frontmatter.futureField).toBe("keep-me");
    expect(parsed.content).toBe(parseProblemMarkdown(source).content);
    expect(withSolution).toContain("# Keep this identity comment.");

    const cleared = updateProblemMarkdown(withSolution, {
      frontmatter: { solutionLanguage: null, solutionCode: null },
    });
    const clearedProblem = parseProblemMarkdown(cleared);

    expect(clearedProblem.frontmatter.solutionLanguage).toBeNull();
    expect(clearedProblem.frontmatter.solutionCode).toBeNull();
    expect(cleared).toContain("solutionLanguage: null");
    expect(cleared).toContain("solutionCode: null");
    expect(clearedProblem.content).toBe(parseProblemMarkdown(source).content);
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
