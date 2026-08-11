import { describe, expect, it } from "vitest";

import {
  generateProblemId,
  normalizeTags,
  parseProblemEditorFormData,
} from "@/lib/problems/editor";

function validFormData(): FormData {
  const formData = new FormData();
  formData.set("id", "codeforces-1996-g");
  formData.set("title", "Example Problem");
  formData.set("platform", "Codeforces");
  formData.set("solvedAt", "2026-08-10");
  formData.set("status", "C");
  formData.set("content", "# 做题感想\n");
  return formData;
}

describe("problem ID generation", () => {
  it("builds a stable kebab-case ID from platform, contest, and problem", () => {
    expect(
      generateProblemId({
        platform: "Codeforces",
        contest: "Codeforces Round #1996",
        problem: "G. Path Prefixes",
      }),
    ).toBe("codeforces-round-1996-g-path-prefixes");
  });

  it("falls back to the title when contest identity is absent", () => {
    expect(
      generateProblemId({ platform: "AtCoder", title: "Frog 1" }),
    ).toBe("atcoder-frog-1");
    expect(generateProblemId({ platform: "Other", title: "中文题目" })).toBe(
      "other-problem",
    );
  });
});

describe("problem editor normalization", () => {
  it("trims, removes empty tags, and preserves first-occurrence order", () => {
    expect(normalizeTags(" DP, shortest path，DP\n graph ")).toEqual([
      "DP",
      "shortest path",
      "graph",
    ]);
  });

  it("parses optional fields and a paired Review schedule", () => {
    const formData = validFormData();
    formData.set("rating", "2100");
    formData.set("scheduleReview", "on");
    formData.set("nextReviewDate", "2026-08-14");
    formData.set("reviewIntervalDays", "4");
    formData.append("knowledge", "graph.shortest-path.dijkstra");
    formData.set("tags", "最短路, 图论, 最短路");
    const result = parseProblemEditorFormData(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toMatchObject({
        rating: 2100,
        knowledge: ["graph.shortest-path.dijkstra"],
        tags: ["最短路", "图论"],
        nextReviewDate: "2026-08-14",
        reviewIntervalDays: 4,
      });
    }
  });

  it("validates unknown, duplicate, and ancestor-conflicting knowledge FormData", () => {
    for (const values of [
      ["unknown"],
      ["graph.shortest-path.dijkstra", "graph.shortest-path.dijkstra"],
      ["graph.shortest-path", "graph.shortest-path.dijkstra"],
    ]) {
      const formData = validFormData();
      for (const value of values) formData.append("knowledge", value);
      const result = parseProblemEditorFormData(formData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.path[0] === "knowledge")).toBe(true);
      }
    }
  });

  it("accepts empty and multiple sibling knowledge selections", () => {
    expect(parseProblemEditorFormData(validFormData()).success).toBe(true);
    const formData = validFormData();
    formData.append("knowledge", "graph.shortest-path.dijkstra");
    formData.append("knowledge", "graph.shortest-path.bellman-ford");
    expect(parseProblemEditorFormData(formData)).toMatchObject({ success: true });
  });

  it("reports invalid dates, numbers, URLs, IDs, and partial schedules", () => {
    const formData = validFormData();
    formData.set("id", "Unsafe ID");
    formData.set("url", "not-a-url");
    formData.set("rating", "0");
    formData.set("solvedAt", "2026-02-30");
    formData.set("scheduleReview", "on");
    formData.set("nextReviewDate", "2026-08-14");
    const result = parseProblemEditorFormData(formData);

    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((issue) => issue.path[0]);
      expect(fields).toEqual(
        expect.arrayContaining([
          "id",
          "url",
          "rating",
          "solvedAt",
          "reviewIntervalDays",
        ]),
      );
    }
  });

  it("clears schedule values when scheduling is disabled", () => {
    const formData = validFormData();
    formData.set("nextReviewDate", "2026-08-14");
    formData.set("reviewIntervalDays", "4");
    const result = parseProblemEditorFormData(formData);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nextReviewDate).toBeNull();
      expect(result.data.reviewIntervalDays).toBeNull();
    }
  });
});
