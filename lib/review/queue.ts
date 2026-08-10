import {
  addCalendarDays,
  compareDateOnly,
  type DateOnly,
} from "@/lib/date/date-only";
import type { ProblemFile } from "@/lib/problems/types";

export type ReviewQueue = {
  overdue: ProblemFile[];
  today: ProblemFile[];
  upcoming: ProblemFile[];
};

function sortByReviewDate(problems: ProblemFile[]): ProblemFile[] {
  return [...problems].sort((left, right) => {
    const leftDate = left.frontmatter.nextReviewDate;
    const rightDate = right.frontmatter.nextReviewDate;

    if (leftDate == null || rightDate == null) {
      return left.frontmatter.id.localeCompare(right.frontmatter.id);
    }

    return (
      compareDateOnly(leftDate, rightDate) ||
      left.frontmatter.id.localeCompare(right.frontmatter.id)
    );
  });
}

export function getReviewQueue(
  problems: readonly ProblemFile[],
  today: DateOnly,
  upcomingDays = 7,
): ReviewQueue {
  if (!Number.isInteger(upcomingDays) || upcomingDays < 0) {
    throw new RangeError("Upcoming Review range must be a non-negative integer");
  }

  const upcomingEnd = addCalendarDays(today, upcomingDays);
  const scheduled = problems.filter(
    (problem) => problem.frontmatter.nextReviewDate != null,
  );

  return {
    overdue: sortByReviewDate(
      scheduled.filter(
        (problem) =>
          compareDateOnly(problem.frontmatter.nextReviewDate!, today) < 0,
      ),
    ),
    today: sortByReviewDate(
      scheduled.filter(
        (problem) =>
          compareDateOnly(problem.frontmatter.nextReviewDate!, today) === 0,
      ),
    ),
    upcoming: sortByReviewDate(
      scheduled.filter((problem) => {
        const date = problem.frontmatter.nextReviewDate!;
        return compareDateOnly(date, today) > 0 && compareDateOnly(date, upcomingEnd) <= 0;
      }),
    ),
  };
}
