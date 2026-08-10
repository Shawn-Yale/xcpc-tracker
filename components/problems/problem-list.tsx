import Link from "next/link";

import type { DateOnly } from "@/lib/date/date-only";
import type { ProblemFile } from "@/lib/problems/types";

import { ReviewDate } from "./review-date";
import { StatusBadge } from "./status-badge";

type ProblemListProps = {
  emphasizeMissingReview?: boolean;
  problems: ProblemFile[];
  today: DateOnly;
};

function ProblemLink({ problem }: { problem: ProblemFile }) {
  return (
    <Link
      className="font-semibold text-slate-950 decoration-sky-500 decoration-2 hover:text-sky-800 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
      href={`/problems/${problem.frontmatter.id}`}
    >
      {problem.frontmatter.title}
    </Link>
  );
}

function TagList({ values, muted = false }: { values: string[]; muted?: boolean }) {
  if (values.length === 0) {
    return <span className="text-slate-400">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((value) => (
        <span
          className={
            muted
              ? "rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600"
              : "rounded bg-sky-50 px-1.5 py-0.5 text-xs font-medium text-sky-800"
          }
          key={value}
        >
          {value}
        </span>
      ))}
    </div>
  );
}

export function ProblemList({
  emphasizeMissingReview = false,
  problems,
  today,
}: ProblemListProps) {
  return (
    <>
      <div className="hidden overflow-hidden border-b border-slate-200 bg-white lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
            <thead className="bg-slate-100/80 text-xs uppercase tracking-wide text-slate-600">
              <tr>
                <th className="px-5 py-3 font-semibold" scope="col">
                  Problem
                </th>
                <th className="px-3 py-3 font-semibold" scope="col">
                  Platform
                </th>
                <th className="px-3 py-3 text-right font-semibold" scope="col">
                  Rating
                </th>
                <th className="px-3 py-3 font-semibold" scope="col">
                  Solved
                </th>
                <th className="px-3 py-3 text-center font-semibold" scope="col">
                  Status
                </th>
                <th className="px-3 py-3 font-semibold" scope="col">
                  Categories
                </th>
                <th className="px-3 py-3 font-semibold" scope="col">
                  Tags
                </th>
                <th className="px-5 py-3 font-semibold" scope="col">
                  Next Review
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {problems.map((problem) => (
                <tr className="align-top transition-colors hover:bg-sky-50/40" key={problem.frontmatter.id}>
                  <td className="max-w-64 px-5 py-4">
                    <ProblemLink problem={problem} />
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {[problem.frontmatter.contest, problem.frontmatter.problem]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </td>
                  <td className="px-3 py-4 font-medium text-slate-700">
                    {problem.frontmatter.platform}
                  </td>
                  <td className="px-3 py-4 text-right font-mono text-slate-700 tabular-nums">
                    {problem.frontmatter.rating ?? "—"}
                  </td>
                  <td className="px-3 py-4 font-mono text-xs text-slate-600 tabular-nums">
                    {problem.frontmatter.solvedAt}
                  </td>
                  <td className="px-3 py-4 text-center">
                    <StatusBadge status={problem.frontmatter.status} />
                  </td>
                  <td className="max-w-52 px-3 py-4">
                    <TagList values={problem.frontmatter.categories} />
                  </td>
                  <td className="max-w-56 px-3 py-4">
                    <TagList muted values={problem.frontmatter.tags} />
                  </td>
                  <td className="px-5 py-4 font-mono text-xs tabular-nums">
                    <ReviewDate
                      date={problem.frontmatter.nextReviewDate}
                      emphasizeMissing={emphasizeMissingReview}
                      today={today}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ul className="divide-y divide-slate-200 border-b border-slate-200 bg-white lg:hidden">
        {problems.map((problem) => (
          <li className="px-4 py-5 sm:px-5" key={problem.frontmatter.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <ProblemLink problem={problem} />
                <p className="mt-1 truncate text-xs text-slate-500">
                  {problem.frontmatter.platform}
                  {problem.frontmatter.contest
                    ? ` · ${problem.frontmatter.contest}`
                    : ""}
                </p>
              </div>
              <StatusBadge status={problem.frontmatter.status} />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-slate-500">Rating</dt>
                <dd className="mt-0.5 font-mono text-slate-800">
                  {problem.frontmatter.rating ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">首次训练</dt>
                <dd className="mt-0.5 font-mono text-xs text-slate-800">
                  {problem.frontmatter.solvedAt}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">下次 Review</dt>
                <dd className="mt-0.5 font-mono text-xs">
                  <ReviewDate
                    date={problem.frontmatter.nextReviewDate}
                    emphasizeMissing={emphasizeMissingReview}
                    today={today}
                  />
                </dd>
              </div>
            </dl>

            <div className="mt-4 space-y-2">
              <TagList values={problem.frontmatter.categories} />
              <TagList muted values={problem.frontmatter.tags} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
