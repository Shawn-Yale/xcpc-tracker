import { describe, expect, it } from "vitest";

import { problemFrontmatterSchema } from "@/lib/problems/schema";

const validProblem = {
  id: "codeforces-1996-g",
  title: "Example Problem",
  platform: "Codeforces",
  solvedAt: "2026-08-10",
  status: "C",
  categories: ["图论", "位运算与状态压缩"],
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

    expect(result.categories).toHaveLength(2);
    expect(result.reviews[0]).toMatchObject({ fromStatus: "C", toStatus: "B" });
    expect(result.futureField).toBe("preserve me");
  });

  it("normalizes omitted collection fields to empty arrays", () => {
    const result = problemFrontmatterSchema.parse({
      id: "atcoder-abc381-f",
      title: "Minimal Problem",
      platform: "AtCoder",
      solvedAt: "2026-08-10",
      status: "A",
    });

    expect(result.categories).toEqual([]);
    expect(result.tags).toEqual([]);
    expect(result.reviews).toEqual([]);
  });

  it.each([
    ["invalid status", { ...validProblem, status: "E" }],
    ["invalid date", { ...validProblem, solvedAt: "2026-02-30" }],
    ["non-array categories", { ...validProblem, categories: "图论" }],
    ["duplicate categories", { ...validProblem, categories: ["图论", "图论"] }],
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
