import Link from "next/link";

import { StatusBadge } from "@/components/problems/status-badge";
import type { RecentReviewActivity } from "@/lib/dashboard/summary";

export function RecentReviewList({ activity }: { activity: readonly RecentReviewActivity[] }) {
  if (activity.length === 0) {
    return <p className="border-l-4 border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">完成第一次复习后，状态变化会显示在这里。</p>;
  }

  return (
    <ol className="divide-y divide-slate-200 border-y border-slate-200 bg-white">
      {activity.map(({ problem, review, reviewIndex }) => (
        <li className="px-4 py-4" key={`${problem.frontmatter.id}-${review.date}-${reviewIndex}`}>
          <div className="flex flex-wrap items-center gap-2">
            <time className="font-mono text-xs text-slate-500" dateTime={review.date}>{review.date}</time>
            <StatusBadge status={review.fromStatus} />
            <span aria-hidden="true" className="text-slate-400">→</span>
            <StatusBadge status={review.toStatus} />
          </div>
          <Link className="mt-2 block font-semibold text-slate-950 hover:text-sky-800 hover:underline" href={`/problems/${problem.frontmatter.id}`}>{problem.frontmatter.title}</Link>
          <p className="mt-1 text-sm leading-6 text-slate-600">{review.note}</p>
        </li>
      ))}
    </ol>
  );
}
