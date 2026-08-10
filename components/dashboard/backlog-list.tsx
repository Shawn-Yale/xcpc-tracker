import Link from "next/link";

import { ReviewDate } from "@/components/problems/review-date";
import { StatusBadge } from "@/components/problems/status-badge";
import type { DateOnly } from "@/lib/date/date-only";
import type { ProblemFile } from "@/lib/problems/types";

export function BacklogList({ problems, today }: { problems: readonly ProblemFile[]; today: DateOnly }) {
  if (problems.length === 0) {
    return (
      <div className="border border-emerald-200 bg-emerald-50 px-5 py-6">
        <p className="font-semibold text-emerald-900">当前没有 C/D Backlog</p>
        <p className="mt-1 text-sm text-emerald-800">所有题目都已进入 A/B 掌握池，保持节奏即可。</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-200 border-y border-slate-200 bg-white">
      {problems.map(({ frontmatter }) => (
        <li className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_8rem] sm:items-center" key={frontmatter.id}>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <StatusBadge status={frontmatter.status} />
              <Link className="truncate font-semibold text-slate-950 hover:text-sky-800 hover:underline" href={`/problems/${frontmatter.id}`}>{frontmatter.title}</Link>
            </div>
            <p className="mt-2 truncate text-xs text-slate-500">
              {frontmatter.categories.length > 0 ? frontmatter.categories.join(" / ") : "未分类"}
              {frontmatter.tags.length > 0 ? ` · ${frontmatter.tags.join(" / ")}` : ""}
            </p>
          </div>
          <div className="font-mono text-xs">
            <ReviewDate date={frontmatter.nextReviewDate} emphasizeMissing today={today} />
          </div>
        </li>
      ))}
    </ul>
  );
}
