import Link from "next/link";

import { StatusBadge } from "@/components/problems/status-badge";
import type { ProblemFile } from "@/lib/problems/types";

export function RecentSolvedList({ problems }: { problems: readonly ProblemFile[] }) {
  if (problems.length === 0) {
    return <p className="border-l-4 border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">还没有训练记录。</p>;
  }

  return (
    <ol className="divide-y divide-slate-200 border-y border-slate-200 bg-white">
      {problems.map(({ frontmatter }) => (
        <li className="px-4 py-4" key={frontmatter.id}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Link className="font-semibold text-slate-950 hover:text-sky-800 hover:underline" href={`/problems/${frontmatter.id}`}>{frontmatter.title}</Link>
              <p className="mt-1 truncate text-xs text-slate-500">
                {frontmatter.platform}{frontmatter.rating != null ? ` · Rating ${frontmatter.rating}` : ""}
              </p>
            </div>
            <StatusBadge status={frontmatter.status} />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <time className="font-mono text-xs text-slate-500" dateTime={frontmatter.solvedAt}>{frontmatter.solvedAt}</time>
            {frontmatter.categories.slice(0, 2).map((category) => (
              <span className="rounded bg-sky-50 px-2 py-0.5 text-xs text-sky-800" key={category}>{category}</span>
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}
