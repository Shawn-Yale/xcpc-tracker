import { categoryValues, type Category } from "@/config/categories";
import { statusValues, type Status } from "@/config/status";
import { isMastered } from "@/lib/review/rules";
import type { ProblemFile } from "@/lib/problems/types";

export type StatusCounts = Record<Status, number>;

export type ProblemStats = {
  total: number;
  statusCounts: StatusCounts;
  mastered: number;
  masteryRate: number;
};

export type CategoryStats = ProblemStats & {
  category: Category;
};

export type TagCount = {
  tag: string;
  count: number;
};

function emptyStatusCounts(): StatusCounts {
  return { A: 0, B: 0, C: 0, D: 0 };
}

export function getProblemStats(problems: readonly ProblemFile[]): ProblemStats {
  const statusCounts = emptyStatusCounts();

  for (const problem of problems) {
    statusCounts[problem.frontmatter.status] += 1;
  }

  const total = problems.length;
  const mastered = problems.filter((problem) =>
    isMastered(problem.frontmatter.status),
  ).length;

  return {
    total,
    statusCounts,
    mastered,
    masteryRate: total === 0 ? 0 : (mastered / total) * 100,
  };
}

export function getCategoryStats(
  problems: readonly ProblemFile[],
): CategoryStats[] {
  return categoryValues.map((category) => ({
    category,
    ...getProblemStats(
      problems.filter((problem) =>
        problem.frontmatter.categories.includes(category),
      ),
    ),
  }));
}

export function getTagCounts(problems: readonly ProblemFile[]): TagCount[] {
  const counts = new Map<string, number>();

  for (const problem of problems) {
    for (const tag of problem.frontmatter.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((left, right) => right.count - left.count || left.tag.localeCompare(right.tag));
}

export function getStatusStats(
  problems: readonly ProblemFile[],
): Array<{ status: Status; count: number }> {
  const stats = getProblemStats(problems);
  return statusValues.map((status) => ({
    status,
    count: stats.statusCounts[status],
  }));
}
