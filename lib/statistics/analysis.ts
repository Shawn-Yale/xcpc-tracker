import { categoryValues, type Category } from "@/config/categories";
import { platformValues, type Platform } from "@/config/platforms";
import { statusValues, type Status } from "@/config/status";
import {
  addCalendarDays,
  compareDateOnly,
  dateOnlySchema,
  type DateOnly,
} from "@/lib/date/date-only";
import type { ProblemFile } from "@/lib/problems/types";

import {
  getCategoryStats,
  getProblemStats,
  getTagCounts,
  type StatusCounts,
} from "./problem-stats";

export const ratingBands = [
  { key: "under-1600", label: "< 1600", minimum: 0, maximum: 1599 },
  { key: "1600-1799", label: "1600–1799", minimum: 1600, maximum: 1799 },
  { key: "1800-1999", label: "1800–1999", minimum: 1800, maximum: 1999 },
  { key: "2000-2199", label: "2000–2199", minimum: 2000, maximum: 2199 },
  { key: "2200-2399", label: "2200–2399", minimum: 2200, maximum: 2399 },
  { key: "2400-plus", label: "2400+", minimum: 2400, maximum: Infinity },
] as const;

export type RatingDistributionItem = (typeof ratingBands)[number] & {
  count: number;
};

export type PlatformDistributionItem = {
  platform: Platform;
  count: number;
  percentage: number;
};

export type TrainingVolume = {
  last7Days: number;
  last30Days: number;
  thisYear: number;
};

export type HeatmapDay = {
  date: DateOnly;
  solvedCount: number;
  reviewCount: number;
  total: number;
};

export type RatingTrendPoint = {
  date: DateOnly;
  averageRating: number;
  problemCount: number;
};

export type ConversionMatrix = Record<Status, StatusCounts>;

export type JourneyConversion = {
  sourceStatus: "C" | "D";
  eligibleProblems: number;
  convertedProblems: number;
  conversionRate: number;
};

function emptyStatusCounts(): StatusCounts {
  return { A: 0, B: 0, C: 0, D: 0 };
}

function isInClosedRange(date: DateOnly, start: DateOnly, end: DateOnly): boolean {
  return compareDateOnly(date, start) >= 0 && compareDateOnly(date, end) <= 0;
}

export function getRatingDistribution(
  problems: readonly ProblemFile[],
): RatingDistributionItem[] {
  return ratingBands.map((band) => ({
    ...band,
    count: problems.filter(({ frontmatter }) => {
      const rating = frontmatter.rating;
      return rating != null && rating >= band.minimum && rating <= band.maximum;
    }).length,
  }));
}

export function getPlatformDistribution(
  problems: readonly ProblemFile[],
): PlatformDistributionItem[] {
  return platformValues
    .map((platform) => {
      const count = problems.filter(
        (problem) => problem.frontmatter.platform === platform,
      ).length;
      return {
        platform,
        count,
        percentage: problems.length === 0 ? 0 : (count / problems.length) * 100,
      };
    })
    .sort(
      (left, right) =>
        right.count - left.count || left.platform.localeCompare(right.platform),
    );
}

export function getTrainingVolume(
  problems: readonly ProblemFile[],
  today: DateOnly,
): TrainingVolume {
  const last7Start = addCalendarDays(today, -6);
  const last30Start = addCalendarDays(today, -29);
  const yearStart = dateOnlySchema.parse(`${today.slice(0, 4)}-01-01`);
  const solvedDates = problems.map((problem) => problem.frontmatter.solvedAt);

  return {
    last7Days: solvedDates.filter((date) => isInClosedRange(date, last7Start, today))
      .length,
    last30Days: solvedDates.filter((date) =>
      isInClosedRange(date, last30Start, today),
    ).length,
    thisYear: solvedDates.filter((date) => isInClosedRange(date, yearStart, today))
      .length,
  };
}

export function getActivityHeatmap(
  problems: readonly ProblemFile[],
  today: DateOnly,
  days = 84,
): HeatmapDay[] {
  if (!Number.isInteger(days) || days <= 0) {
    throw new RangeError("Heatmap day count must be a positive integer");
  }

  const start = addCalendarDays(today, 1 - days);
  const activity = new Map<string, { solvedCount: number; reviewCount: number }>();

  for (const problem of problems) {
    const solvedAt = problem.frontmatter.solvedAt;
    if (isInClosedRange(solvedAt, start, today)) {
      const current = activity.get(solvedAt) ?? { solvedCount: 0, reviewCount: 0 };
      current.solvedCount += 1;
      activity.set(solvedAt, current);
    }

    for (const review of problem.frontmatter.reviews) {
      if (isInClosedRange(review.date, start, today)) {
        const current = activity.get(review.date) ?? {
          solvedCount: 0,
          reviewCount: 0,
        };
        current.reviewCount += 1;
        activity.set(review.date, current);
      }
    }
  }

  return Array.from({ length: days }, (_, index) => {
    const date = addCalendarDays(start, index);
    const counts = activity.get(date) ?? { solvedCount: 0, reviewCount: 0 };
    return { date, ...counts, total: counts.solvedCount + counts.reviewCount };
  });
}

export function getRatingTrend(
  problems: readonly ProblemFile[],
  limit = 12,
): RatingTrendPoint[] {
  if (!Number.isInteger(limit) || limit < 0) {
    throw new RangeError("Rating trend limit must be a non-negative integer");
  }

  if (limit === 0) {
    return [];
  }

  const ratingsByDate = new Map<DateOnly, number[]>();

  for (const problem of problems) {
    const rating = problem.frontmatter.rating;
    if (rating == null) {
      continue;
    }

    const date = problem.frontmatter.solvedAt;
    ratingsByDate.set(date, [...(ratingsByDate.get(date) ?? []), rating]);
  }

  return [...ratingsByDate.entries()]
    .sort(([left], [right]) => compareDateOnly(left, right))
    .map(([date, ratings]) => ({
      date,
      averageRating: Math.round(
        ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length,
      ),
      problemCount: ratings.length,
    }))
    .slice(-limit);
}

export function getConversionMatrix(
  problems: readonly ProblemFile[],
): ConversionMatrix {
  const matrix = Object.fromEntries(
    statusValues.map((status) => [status, emptyStatusCounts()]),
  ) as ConversionMatrix;

  for (const problem of problems) {
    for (const review of problem.frontmatter.reviews) {
      matrix[review.fromStatus][review.toStatus] += 1;
    }
  }

  return matrix;
}

function getStatusJourney(problem: ProblemFile): Status[] {
  const reviews = problem.frontmatter.reviews;
  return reviews.length === 0
    ? [problem.frontmatter.status]
    : [reviews[0].fromStatus, ...reviews.map((review) => review.toStatus)];
}

export function getJourneyConversions(
  problems: readonly ProblemFile[],
): JourneyConversion[] {
  return (["C", "D"] as const).map((sourceStatus) => {
    let eligibleProblems = 0;
    let convertedProblems = 0;

    for (const problem of problems) {
      const journey = getStatusJourney(problem);
      const firstSourceIndex = journey.indexOf(sourceStatus);

      if (firstSourceIndex === -1) {
        continue;
      }

      eligibleProblems += 1;
      if (
        journey
          .slice(firstSourceIndex + 1)
          .some((status) => status === "A" || status === "B")
      ) {
        convertedProblems += 1;
      }
    }

    return {
      sourceStatus,
      eligibleProblems,
      convertedProblems,
      conversionRate:
        eligibleProblems === 0 ? 0 : (convertedProblems / eligibleProblems) * 100,
    };
  });
}

export function getDKnowledgeGaps(problems: readonly ProblemFile[]) {
  const dProblems = problems.filter(
    (problem) => problem.frontmatter.status === "D",
  );
  const categoryCounts = categoryValues
    .map((category) => ({
      category,
      count: dProblems.filter((problem) =>
        problem.frontmatter.categories.includes(category),
      ).length,
    }))
    .filter((item) => item.count > 0)
    .sort(
      (left, right) =>
        right.count - left.count || left.category.localeCompare(right.category),
    );

  return {
    total: dProblems.length,
    unclassified: dProblems.filter(
      (problem) => problem.frontmatter.categories.length === 0,
    ).length,
    categories: categoryCounts satisfies Array<{ category: Category; count: number }>,
    tags: getTagCounts(dProblems),
  };
}

export function getStatisticsSummary(
  problems: readonly ProblemFile[],
  today: DateOnly,
) {
  const matrix = getConversionMatrix(problems);
  const reviewCount = statusValues.reduce(
    (total, fromStatus) =>
      total +
      statusValues.reduce(
        (rowTotal, toStatus) => rowTotal + matrix[fromStatus][toStatus],
        0,
      ),
    0,
  );

  return {
    overall: getProblemStats(problems),
    categories: getCategoryStats(problems),
    ratingDistribution: getRatingDistribution(problems),
    platformDistribution: getPlatformDistribution(problems),
    trainingVolume: getTrainingVolume(problems, today),
    heatmap: getActivityHeatmap(problems, today),
    ratingTrend: getRatingTrend(problems),
    conversionMatrix: matrix,
    journeyConversions: getJourneyConversions(problems),
    reviewCount,
    dKnowledgeGaps: getDKnowledgeGaps(problems),
  };
}
