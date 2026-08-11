import { describe, expect, it } from "vitest";

import { statusValues, type Status } from "@/config/status";
import {
  completeReview,
  getSuggestedReviewInterval,
} from "@/lib/review/completion";
import { problemFrontmatterSchema } from "@/lib/problems/schema";

function makeProblem() {
  return problemFrontmatterSchema.parse({
    id: "review-target",
    title: "Review Target",
    platform: "Codeforces",
    solvedAt: "2026-07-01",
    status: "C",
    knowledge: ["graph.shortest-path.dijkstra"],
    tags: [],
    nextReviewDate: "2026-08-10",
    reviewIntervalDays: 7,
    reviews: [
      {
        date: "2026-08-03",
        fromStatus: "D",
        toStatus: "C",
        note: "First review",
        nextIntervalDays: 7,
      },
    ],
  });
}

describe("Review interval suggestions", () => {
  it("uses status baselines and grows mastered intervals", () => {
    expect(getSuggestedReviewInterval("A")).toBe(30);
    expect(getSuggestedReviewInterval("B")).toBe(14);
    expect(getSuggestedReviewInterval("C", 90)).toBe(7);
    expect(getSuggestedReviewInterval("D", 90)).toBe(3);
    expect(getSuggestedReviewInterval("B", 20)).toBe(30);
    expect(getSuggestedReviewInterval("A", 30)).toBe(60);
    expect(getSuggestedReviewInterval("A", 300)).toBe(365);
  });
});

describe("completeReview", () => {
  it("promotes C to B, appends history, and leaves the input unchanged", () => {
    const problem = makeProblem();
    const before = structuredClone(problem);
    const completed = completeReview(problem, {
      date: "2026-08-10",
      newStatus: "B",
      durationMinutes: 35,
      note: "Solved independently after one hint.",
      scheduleNext: true,
    });

    expect(completed).toMatchObject({
      status: "B",
      reviewIntervalDays: 14,
      nextReviewDate: "2026-08-24",
    });
    expect(completed.reviews.at(-1)).toEqual({
      date: "2026-08-10",
      fromStatus: "C",
      toStatus: "B",
      durationMinutes: 35,
      note: "Solved independently after one hint.",
      nextIntervalDays: 14,
    });
    expect(completed.reviews[0]).toEqual(problem.reviews[0]);
    expect(problem).toEqual(before);
  });

  it.each(
    statusValues.flatMap((fromStatus) =>
      statusValues.map((newStatus) => [fromStatus, newStatus] as const),
    ),
  )("supports a transition from %s to %s", (fromStatus, newStatus) => {
      const problem = problemFrontmatterSchema.parse({
        ...makeProblem(),
        status: fromStatus as Status,
      });
      expect(
        completeReview(problem, {
          date: "2026-08-10",
          newStatus,
          note: `Moved to ${newStatus}`,
          scheduleNext: true,
        }).reviews.at(-1),
      ).toMatchObject({ fromStatus, toStatus: newStatus });
    });

  it("supports consecutive Reviews without rewriting prior entries", () => {
    const first = completeReview(makeProblem(), {
      date: "2026-08-10",
      newStatus: "B",
      note: "First completion",
      scheduleNext: true,
    });
    const second = completeReview(first, {
      date: "2026-08-24",
      newStatus: "A",
      note: "Second completion",
      scheduleNext: true,
    });

    expect(second.reviews).toHaveLength(3);
    expect(second.reviews.slice(0, 2)).toEqual(first.reviews);
    expect(second.reviews.at(-1)).toMatchObject({
      fromStatus: "B",
      toStatus: "A",
      nextIntervalDays: 30,
    });
    expect(second.nextReviewDate).toBe("2026-09-23");
  });

  it("resets a forgotten problem to D and accepts a manual interval", () => {
    const completed = completeReview(makeProblem(), {
      date: "2026-08-10",
      newStatus: "D",
      note: "Forgot the key transition.",
      scheduleNext: true,
      nextIntervalDays: 2,
    });

    expect(completed.nextReviewDate).toBe("2026-08-12");
    expect(completed.reviewIntervalDays).toBe(2);
    expect(completed.reviews.at(-1)?.nextIntervalDays).toBe(2);
  });

  it("clears scheduling without altering earlier history", () => {
    const completed = completeReview(makeProblem(), {
      date: "2026-08-10",
      newStatus: "A",
      note: "No further review needed.",
      scheduleNext: false,
    });

    expect(completed.nextReviewDate).toBeNull();
    expect(completed.reviewIntervalDays).toBeNull();
    expect(completed.reviews).toHaveLength(2);
    expect(completed.reviews.at(-1)?.nextIntervalDays).toBeNull();
  });

  it("rejects invalid chronology and conflicting scheduling input", () => {
    expect(() =>
      completeReview(makeProblem(), {
        date: "2026-06-30",
        newStatus: "D",
        note: "Too early",
        scheduleNext: true,
      }),
    ).toThrow("solved date");
    expect(() =>
      completeReview(makeProblem(), {
        date: "2026-08-02",
        newStatus: "D",
        note: "Before history",
        scheduleNext: true,
      }),
    ).toThrow("Review History");
    expect(() =>
      completeReview(makeProblem(), {
        date: "2026-08-10",
        newStatus: "D",
        note: "Invalid interval",
        scheduleNext: false,
        nextIntervalDays: 3,
      }),
    ).toThrow("interval cannot be set");
  });
});
