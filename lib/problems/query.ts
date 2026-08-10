import { categoryValues, type Category } from "@/config/categories";
import { platformValues, type Platform } from "@/config/platforms";
import { statusValues, type Status } from "@/config/status";
import { compareDateOnly, type DateOnly } from "@/lib/date/date-only";
import { isOverdue, isReviewDue } from "@/lib/review/rules";

import type { ProblemFile } from "./types";

export const reviewFilterValues = [
  "all",
  "due",
  "overdue",
  "scheduled",
  "none",
] as const;
export const problemSortValues = [
  "solvedAt",
  "rating",
  "nextReviewDate",
] as const;
export const sortDirectionValues = ["asc", "desc"] as const;

export type ReviewFilter = (typeof reviewFilterValues)[number];
export type ProblemSort = (typeof problemSortValues)[number];
export type SortDirection = (typeof sortDirectionValues)[number];

export type ProblemQuery = {
  search: string;
  status: Status | "all";
  category: Category | "all";
  platform: Platform | "all";
  review: ReviewFilter;
  sort: ProblemSort;
  direction: SortDirection;
};

export type QueryParameterValue = string | string[] | undefined;
export type ProblemQueryParameters = Record<string, QueryParameterValue>;

function firstValue(value: QueryParameterValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function includesValue<const T extends readonly string[]>(
  values: T,
  candidate: string | undefined,
): candidate is T[number] {
  return candidate !== undefined && values.some((value) => value === candidate);
}

export function parseProblemQuery(parameters: ProblemQueryParameters): ProblemQuery {
  const status = firstValue(parameters.status);
  const category = firstValue(parameters.category);
  const platform = firstValue(parameters.platform);
  const review = firstValue(parameters.review);
  const sort = firstValue(parameters.sort);
  const direction = firstValue(parameters.direction);

  return {
    search: (firstValue(parameters.search) ?? "").trim(),
    status: includesValue(statusValues, status) ? status : "all",
    category: includesValue(categoryValues, category) ? category : "all",
    platform: includesValue(platformValues, platform) ? platform : "all",
    review: includesValue(reviewFilterValues, review) ? review : "all",
    sort: includesValue(problemSortValues, sort) ? sort : "solvedAt",
    direction: includesValue(sortDirectionValues, direction) ? direction : "desc",
  };
}

function matchesSearch(problem: ProblemFile, search: string): boolean {
  if (search === "") {
    return true;
  }

  const normalizedSearch = search.toLocaleLowerCase();
  const searchableValues = [
    problem.frontmatter.title,
    problem.frontmatter.contest,
    problem.frontmatter.problem,
    ...problem.frontmatter.tags,
  ];

  return searchableValues.some(
    (value) =>
      value != null && value.toLocaleLowerCase().includes(normalizedSearch),
  );
}

function matchesReviewFilter(
  problem: ProblemFile,
  review: ReviewFilter,
  today: DateOnly,
): boolean {
  const date = problem.frontmatter.nextReviewDate;

  switch (review) {
    case "due":
      return isReviewDue(date, today);
    case "overdue":
      return isOverdue(date, today);
    case "scheduled":
      return date != null && compareDateOnly(date, today) > 0;
    case "none":
      return date == null;
    case "all":
      return true;
  }
}

function valueForSort(problem: ProblemFile, sort: ProblemSort): number | string | null {
  switch (sort) {
    case "solvedAt":
      return problem.frontmatter.solvedAt;
    case "rating":
      return problem.frontmatter.rating ?? null;
    case "nextReviewDate":
      return problem.frontmatter.nextReviewDate ?? null;
  }
}

function compareSortValues(
  left: number | string | null,
  right: number | string | null,
  direction: SortDirection,
): number {
  if (left === null && right === null) {
    return 0;
  }

  if (left === null) {
    return 1;
  }

  if (right === null) {
    return -1;
  }

  const comparison =
    typeof left === "number" && typeof right === "number"
      ? left - right
      : String(left).localeCompare(String(right));

  return direction === "asc" ? comparison : -comparison;
}

export function queryProblems(
  problems: readonly ProblemFile[],
  query: ProblemQuery,
  today: DateOnly,
): ProblemFile[] {
  return problems
    .filter((problem) => matchesSearch(problem, query.search))
    .filter(
      (problem) =>
        query.status === "all" || problem.frontmatter.status === query.status,
    )
    .filter(
      (problem) =>
        query.category === "all" ||
        problem.frontmatter.categories.includes(query.category),
    )
    .filter(
      (problem) =>
        query.platform === "all" || problem.frontmatter.platform === query.platform,
    )
    .filter((problem) => matchesReviewFilter(problem, query.review, today))
    .sort((left, right) => {
      const comparison = compareSortValues(
        valueForSort(left, query.sort),
        valueForSort(right, query.sort),
        query.direction,
      );

      if (comparison !== 0) {
        return comparison;
      }

      return left.frontmatter.id.localeCompare(right.frontmatter.id);
    });
}
