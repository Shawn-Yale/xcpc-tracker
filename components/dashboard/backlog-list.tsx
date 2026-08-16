import Link from "next/link";

import { ReviewDate } from "@/components/problems/review-date";
import { StatusBadge } from "@/components/problems/status-badge";
import type { DateOnly } from "@/lib/date/date-only";
import { getKnowledgeLabel } from "@/lib/knowledge/presentation";
import type { ProblemFile } from "@/lib/problems/types";

export function BacklogList({ problems, today }: { problems: readonly ProblemFile[]; today: DateOnly }) {
  if (problems.length === 0) {
    return (
      <div className="border-l-4 border-emerald-200 bg-emerald-50 px-4 py-3">
        <p className="font-semibold text-emerald-900">当前没有 C/D 待加强题目</p>
        <p className="mt-1 text-sm text-emerald-800">所有题目都已进入 A/B 掌握池，保持节奏即可。</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-200 border-y border-slate-200 bg-white">
      {problems.map(({ frontmatter }) => (
        <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 px-4 py-3" key={frontmatter.id}>
          <div className="min-w-0">
            <Link className="font-semibold leading-5 break-words text-slate-950 hover:text-sky-800 hover:underline" href={`/problems/${frontmatter.id}`}>{frontmatter.title}</Link>
          </div>
          <StatusBadge status={frontmatter.status} />
          <div className="min-w-0 text-xs leading-5 text-slate-500">
            <span className="break-words text-slate-600">
              {frontmatter.knowledge.length > 0 ? frontmatter.knowledge.map(getKnowledgeLabel).join(" · ") : "未分类"}
            </span>
            {frontmatter.tags.length > 0 ? <span className="break-words"> · {frontmatter.tags.join(" / ")}</span> : null}
          </div>
          <div className="font-mono text-xs leading-5 sm:text-right">
            <ReviewDate date={frontmatter.nextReviewDate} emphasizeMissing today={today} />
          </div>
        </li>
      ))}
    </ul>
  );
}
