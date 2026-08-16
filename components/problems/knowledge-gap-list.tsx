import Link from "next/link";

import type { DateOnly } from "@/lib/date/date-only";
import { getKnowledgeBreadcrumb } from "@/lib/knowledge/presentation";
import { getMarkdownExcerpt } from "@/lib/problems/markdown-sections";
import type { ProblemFile } from "@/lib/problems/types";

import { ReviewDate } from "./review-date";
import { StatusBadge } from "./status-badge";

export function KnowledgeGapList({
  problems,
  today,
}: {
  problems: ProblemFile[];
  today: DateOnly;
}) {
  return (
    <ul className="divide-y divide-slate-200 border-y border-slate-200 bg-white">
      {problems.map((problem) => {
        const errorReason = getMarkdownExcerpt(problem.content, "错误原因");
        const reflection = getMarkdownExcerpt(problem.content, "做题感想");

        return (
          <li className="px-4 py-6 sm:px-6" key={problem.frontmatter.id}>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={problem.frontmatter.status} />
                  <Link
                    className="text-lg font-semibold text-slate-950 hover:text-sky-800 hover:underline"
                    href={`/problems/${problem.frontmatter.id}`}
                  >
                    {problem.frontmatter.title}
                  </Link>
                  <span className="text-sm text-slate-500">
                    {problem.frontmatter.platform}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {problem.frontmatter.knowledge.map((id) => (
                    <span
                      className="rounded bg-sky-50 px-2 py-1 text-xs font-medium text-sky-800"
                      key={id}
                    >
                      {getKnowledgeBreadcrumb(id)}
                    </span>
                  ))}
                  {problem.frontmatter.tags.map((tag) => (
                    <span
                      className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600"
                      key={tag}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-rose-700">
                      错误原因
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-700">
                      {errorReason ?? "未记录错误原因。"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      做题感想
                    </h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-700">
                      {reflection ?? "未记录做题感想。"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="shrink-0 border-l-2 border-rose-200 pl-4 font-mono text-xs lg:w-36">
                <p className="mb-1 font-sans text-xs font-semibold uppercase tracking-wide text-slate-500">
                  下次复习
                </p>
                <ReviewDate
                  date={problem.frontmatter.nextReviewDate}
                  emphasizeMissing
                  today={today}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
