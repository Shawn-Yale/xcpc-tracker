import Link from "next/link";

import { KnowledgeReveal } from "@/components/knowledge/knowledge-reveal";
import { ReviewDate } from "@/components/problems/review-date";
import { StatusBadge } from "@/components/problems/status-badge";
import type { DateOnly } from "@/lib/date/date-only";
import { getKnowledgeLabel } from "@/lib/knowledge/presentation";
import type { ProblemFile } from "@/lib/problems/types";

type ReviewTaskListProps = {
  emptyMessage: string;
  protectKnowledge?: boolean;
  problems: readonly ProblemFile[];
  today: DateOnly;
};

export function ReviewTaskList({
  emptyMessage,
  protectKnowledge = false,
  problems,
  today,
}: ReviewTaskListProps) {
  if (problems.length === 0) {
    return (
      <p className="border-l-4 border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-200 border-y border-slate-200 bg-white">
      {problems.map((problem) => {
        const { frontmatter } = problem;

        return (
          <li className="grid gap-4 px-4 py-5 sm:px-5 lg:grid-cols-[minmax(0,1fr)_9rem_8rem] lg:items-center" key={frontmatter.id}>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={frontmatter.status} />
                <Link
                  className="font-semibold text-slate-950 hover:text-sky-800 hover:underline"
                  href={`/problems/${frontmatter.id}`}
                >
                  {frontmatter.title}
                </Link>
              </div>
              {protectKnowledge && frontmatter.knowledge.length > 0 ? (
                <div className="mt-2 flex flex-wrap items-center gap-x-1 gap-y-1 text-xs text-slate-500">
                  <span>
                    {frontmatter.platform}
                    {frontmatter.rating != null ? ` · Rating ${frontmatter.rating}` : ""}
                  </span>
                  <span aria-hidden="true"> · </span>
                  <KnowledgeReveal>
                    {frontmatter.knowledge.map(getKnowledgeLabel).join(" · ")}
                  </KnowledgeReveal>
                </div>
              ) : (
                <p className="mt-2 truncate text-xs text-slate-500">
                  {frontmatter.platform}
                  {frontmatter.rating != null ? ` · Rating ${frontmatter.rating}` : ""}
                  {frontmatter.knowledge.length > 0
                    ? ` · ${frontmatter.knowledge.map(getKnowledgeLabel).join(" · ")}`
                    : ""}
                </p>
              )}
            </div>

            <div className="font-mono text-xs tabular-nums">
              <ReviewDate date={frontmatter.nextReviewDate} today={today} />
            </div>

            <Link
              className="inline-flex w-fit justify-center rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
              href={`/review/${frontmatter.id}`}
            >
              完成 Review
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
