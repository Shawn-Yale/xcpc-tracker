import { describe, expect, it } from "vitest";

import { problemFrontmatterSchema } from "@/lib/problems/schema";

const validProblem = {
  id: "codeforces-1996-g",
  title: "Example Problem",
  platform: "Codeforces",
  solvedAt: "2026-08-10",
  status: "C",
  knowledge: [
    "graph.shortest-path.dijkstra",
    "bitwise.xor.xor-linear-basis",
  ],
  tags: ["XOR", "线性基"],
  nextReviewDate: "2026-08-14",
  reviewIntervalDays: 4,
  reviews: [
    {
      date: "2026-08-14",
      fromStatus: "C",
      toStatus: "B",
      durationMinutes: 70,
      note: "能够独立推导核心性质。",
      nextIntervalDays: 14,
    },
  ],
} as const;

describe("problem Front Matter schema", () => {
  it("accepts a complete record and preserves unknown fields", () => {
    const result = problemFrontmatterSchema.parse({
      ...validProblem,
      futureField: "preserve me",
    });

    expect(result.knowledge).toEqual([
      "graph.shortest-path.dijkstra",
      "bitwise.xor.xor-linear-basis",
    ]);
    expect(result.reviews[0]).toMatchObject({ fromStatus: "C", toStatus: "B" });
    expect(result.futureField).toBe("preserve me");
  });

  it("accepts explicit empty knowledge", () => {
    const result = problemFrontmatterSchema.parse({
      ...validProblem,
      knowledge: [],
    });

    expect(result.knowledge).toEqual([]);
  });

  it("accepts known selectable, sibling, and cross-branch knowledge IDs", () => {
    expect(
      problemFrontmatterSchema.safeParse({
        ...validProblem,
        knowledge: ["graph.shortest-path.dijkstra"],
      }).success,
    ).toBe(true);
    expect(
      problemFrontmatterSchema.safeParse({
        ...validProblem,
        knowledge: [
          "graph.shortest-path.dijkstra",
          "graph.shortest-path.bellman-ford",
        ],
      }).success,
    ).toBe(true);
    expect(
      problemFrontmatterSchema.safeParse({
        ...validProblem,
        knowledge: [
          "graph.shortest-path.dijkstra",
          "data-structure.heap",
        ],
      }).success,
    ).toBe(true);
  });

  it.each([
    ["duplicate ID", ["graph.shortest-path.dijkstra", "graph.shortest-path.dijkstra"]],
    ["unknown ID", ["graph.shortest-path.unknown"]],
    ["non-selectable Domain", ["graph"]],
    ["non-selectable Topic", ["search.traversal"]],
    [
      "ancestor and descendant",
      ["graph.shortest-path", "graph.shortest-path.dijkstra"],
    ],
  ])("rejects %s", (_name, knowledge) => {
    expect(
      problemFrontmatterSchema.safeParse({
        ...validProblem,
        knowledge,
      }).success,
    ).toBe(false);
  });

  it("requires knowledge without defaulting it", () => {
    expect(
      problemFrontmatterSchema.safeParse({
        ...validProblem,
        knowledge: undefined,
      }).success,
    ).toBe(false);
  });

  it.each([
    ["categories only", { categories: ["图论"] }],
    ["categories empty", { knowledge: [], categories: [] }],
    ["categories null", { knowledge: [], categories: null }],
    [
      "categories and knowledge",
      { knowledge: ["graph.shortest-path.dijkstra"], categories: ["图论"] },
    ],
  ])("explicitly rejects legacy %s", (_name, taxonomyFields) => {
    const result = problemFrontmatterSchema.safeParse({
      ...validProblem,
      knowledge: undefined,
      ...taxonomyFields,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(
        expect.objectContaining({
          path: ["categories"],
          message: "Legacy categories is not supported; use knowledge",
        }),
      );
    }
  });

  it("continues to default unrelated collection fields", () => {
    const result = problemFrontmatterSchema.parse({
      id: "atcoder-abc381-f",
      title: "Minimal Problem",
      platform: "AtCoder",
      solvedAt: "2026-08-10",
      status: "A",
      knowledge: [],
    });

    expect(result.knowledge).toEqual([]);
    expect(result.tags).toEqual([]);
    expect(result.reviews).toEqual([]);
  });

  it("accepts old problems without solution fields and explicit empty solution fields", () => {
    const oldProblem = problemFrontmatterSchema.parse(validProblem);
    const emptySolution = problemFrontmatterSchema.parse({
      ...validProblem,
      solutionLanguage: null,
      solutionCode: null,
    });

    expect(oldProblem.solutionLanguage).toBeUndefined();
    expect(oldProblem.solutionCode).toBeUndefined();
    expect(emptySolution.solutionLanguage).toBeNull();
    expect(emptySolution.solutionCode).toBeNull();
  });

  it("trims a free-form solution language while preserving non-empty code exactly", () => {
    const code = "\n\t// 区间最小值\nint main() { return 0; }\n";
    const result = problemFrontmatterSchema.parse({
      ...validProblem,
      solutionLanguage: "  Some Future Compiler 99  ",
      solutionCode: code,
    });

    expect(result.solutionLanguage).toBe("Some Future Compiler 99");
    expect(result.solutionCode).toBe(code);
  });

  it.each([
    ["null language with missing code", null, undefined],
    ["missing language with null code", undefined, null],
    ["language with null code", "C++17", null],
    ["null language with code", null, "int main() {}"],
    ["language with missing code", "C++17", undefined],
    ["missing language with code", undefined, "int main() {}"],
    ["language with whitespace-only code", "C++17", " \t\n "],
    ["whitespace-only language with code", " \t ", "int main() {}"],
  ])("rejects an invalid solution pair: %s", (_name, language, code) => {
    const result = problemFrontmatterSchema.safeParse({
      ...validProblem,
      solutionLanguage: language,
      solutionCode: code,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) =>
          ["solutionLanguage", "solutionCode"].includes(String(issue.path[0])),
        ),
      ).toBe(true);
    }
  });

  it.each([
    ["invalid status", { ...validProblem, status: "E" }],
    ["invalid date", { ...validProblem, solvedAt: "2026-02-30" }],
    ["non-array knowledge", { ...validProblem, knowledge: "graph" }],
    ["duplicate tags", { ...validProblem, tags: ["XOR", "XOR"] }],
    ["zero duration", { ...validProblem, durationMinutes: 0 }],
  ])("rejects %s", (_name, input) => {
    expect(problemFrontmatterSchema.safeParse(input).success).toBe(false);
  });

  it("requires Review date and interval to be scheduled together", () => {
    const withoutInterval = {
      ...validProblem,
      reviewIntervalDays: undefined,
    };
    const withoutDate = {
      ...validProblem,
      nextReviewDate: undefined,
    };

    expect(problemFrontmatterSchema.safeParse(withoutInterval).success).toBe(false);
    expect(problemFrontmatterSchema.safeParse(withoutDate).success).toBe(false);
  });

  it("allows any valid Review status transition", () => {
    const result = problemFrontmatterSchema.parse({
      ...validProblem,
      status: "C",
      reviews: [
        {
          date: "2026-08-14",
          fromStatus: "A",
          toStatus: "C",
          note: "长时间未训练后退化。",
          nextIntervalDays: 4,
        },
      ],
    });

    expect(result.reviews[0].fromStatus).toBe("A");
    expect(result.reviews[0].toStatus).toBe("C");
  });
});
