import { compareDateOnly, type DateOnly } from "@/lib/date/date-only";
import type { ProblemFile } from "@/lib/problems/types";
import { getReviewQueue } from "@/lib/review/queue";
import type { Review } from "@/lib/problems/schema";
import { getProblemStats } from "@/lib/statistics/problem-stats";

export type RecentReviewActivity = {
  problem: ProblemFile;
  review: Review;
  reviewIndex: number;
};

function assertLimit(limit: number): void {
  if (!Number.isInteger(limit) || limit < 0) {
    throw new RangeError("Dashboard list limit must be a non-negative integer");
  }
}

export function getRecentSolved(
  problems: readonly ProblemFile[],
  limit = 5,
): ProblemFile[] {
  assertLimit(limit);
  return [...problems]
    .sort(
      (left, right) =>
        compareDateOnly(right.frontmatter.solvedAt, left.frontmatter.solvedAt) ||
        left.frontmatter.id.localeCompare(right.frontmatter.id),
    )
    .slice(0, limit);
}

export function getRecentReviewActivity(
  problems: readonly ProblemFile[],
  limit = 5,
): RecentReviewActivity[] {
  assertLimit(limit);
  return problems
    .flatMap((problem) =>
      problem.frontmatter.reviews.map((review, reviewIndex) => ({
        problem,
        review,
        reviewIndex,
      })),
    )
    .sort(
      (left, right) =>
        compareDateOnly(right.review.date, left.review.date) ||
        left.problem.frontmatter.id.localeCompare(right.problem.frontmatter.id) ||
        right.reviewIndex - left.reviewIndex,
    )
    .slice(0, limit);
}

export function getBacklogProblems(
  problems: readonly ProblemFile[],
  limit = 5,
): ProblemFile[] {
  assertLimit(limit);
  return problems
    .filter(({ frontmatter }) =>
      frontmatter.status === "C" || frontmatter.status === "D",
    )
    .sort((left, right) => {
      const leftStatus = left.frontmatter.status === "D" ? 0 : 1;
      const rightStatus = right.frontmatter.status === "D" ? 0 : 1;

      if (leftStatus !== rightStatus) {
        return leftStatus - rightStatus;
      }

      const leftDate = left.frontmatter.nextReviewDate;
      const rightDate = right.frontmatter.nextReviewDate;

      if (leftDate == null && rightDate != null) {
        return -1;
      }

      if (leftDate != null && rightDate == null) {
        return 1;
      }

      if (leftDate != null && rightDate != null) {
        const dateOrder = compareDateOnly(leftDate, rightDate);
        if (dateOrder !== 0) {
          return dateOrder;
        }
      }

      return (
        compareDateOnly(left.frontmatter.solvedAt, right.frontmatter.solvedAt) ||
        left.frontmatter.id.localeCompare(right.frontmatter.id)
      );
    })
    .slice(0, limit);
}

export function getDashboardSummary(
  problems: readonly ProblemFile[],
  today: DateOnly,
) {
  return {
    stats: getProblemStats(problems),
    reviewQueue: getReviewQueue(problems, today),
    recentSolved: getRecentSolved(problems),
    recentReviews: getRecentReviewActivity(problems),
    backlog: getBacklogProblems(problems),
  };
}
