import Link from "next/link";

import { StatsStrip } from "@/components/statistics/stats-strip";
import { statusValues, type Status } from "@/config/status";
import type { ProblemStats } from "@/lib/statistics/problem-stats";

const segmentStyles: Record<Status, string> = {
  A: "bg-emerald-500",
  B: "bg-sky-500",
  C: "bg-amber-400",
  D: "bg-rose-500",
};

export function MasteryPanel({ stats }: { stats: ProblemStats }) {
  return (
    <section aria-labelledby="mastery-title">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Progress</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950" id="mastery-title">总体掌握进度</h2>
          <p className="mt-2 text-sm text-slate-600">A/B 计入 Mastered，进度来自全部有效题目。</p>
        </div>
        <div className="sm:text-right">
          <p className="font-mono text-4xl font-semibold tracking-tight text-slate-950 tabular-nums">{stats.masteryRate.toFixed(0)}%</p>
          <p className="mt-1 text-xs text-slate-500">{stats.mastered} / {stats.total} 已掌握</p>
        </div>
      </div>

      <div aria-label={`Mastery rate ${stats.masteryRate.toFixed(0)}%`} className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200" role="img">
        <div className="h-full bg-gradient-to-r from-sky-600 to-emerald-500" style={{ width: `${stats.masteryRate}%` }} />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
        {statusValues.map((status) => (
          <Link className="inline-flex items-center gap-1.5 hover:text-sky-800 hover:underline" href={`/status/${status}`} key={status}>
            <span aria-hidden="true" className={`size-2 rounded-full ${segmentStyles[status]}`} />
            {status} · {stats.statusCounts[status]}
          </Link>
        ))}
      </div>

      <div className="mt-5">
        <StatsStrip stats={stats} />
      </div>
    </section>
  );
}
