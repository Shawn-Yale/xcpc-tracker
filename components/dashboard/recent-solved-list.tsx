import Link from "next/link";

import { StatusBadge } from "@/components/problems/status-badge";
import { getKnowledgeLabel } from "@/lib/knowledge/presentation";
import type { ProblemFile } from "@/lib/problems/types";

export function RecentSolvedList({ problems }: { problems: readonly ProblemFile[] }) {
  if (problems.length === 0) {
    return <p className="border-l-4 border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">还没有训练记录。</p>;
  }

  return (
    <ol className="divide-y divide-slate-200 border-y border-slate-200 bg-white">
      {problems.map(({ frontmatter }) => (
        <li className="px-4 py-3" key={frontmatter.id}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link className="font-semibold leading-5 break-words text-slate-950 hover:text-sky-800 hover:underline" href={`/problems/${frontmatter.id}`}>{frontmatter.title}</Link>
            </div>
            <StatusBadge status={frontmatter.status} />
          </div>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs leading-5 text-slate-500">
            <span>{frontmatter.platform}{frontmatter.rating != null ? ` · 难度 ${frontmatter.rating}` : ""}</span>
            <time className="font-mono" dateTime={frontmatter.solvedAt}>{frontmatter.solvedAt}</time>
            {frontmatter.knowledge.slice(0, 2).map((id) => <span className="text-slate-600" key={id}>{getKnowledgeLabel(id)}</span>)}
          </div>
        </li>
      ))}
    </ol>
  );
}
