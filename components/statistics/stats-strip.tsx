import type { ProblemStats } from "@/lib/statistics/problem-stats";

export function StatsStrip({ stats }: { stats: ProblemStats }) {
  const metrics = [
    ["总题数", stats.total],
    ["A", stats.statusCounts.A],
    ["B", stats.statusCounts.B],
    ["C", stats.statusCounts.C],
    ["D", stats.statusCounts.D],
    ["已掌握", stats.mastered],
    ["掌握率", `${stats.masteryRate.toFixed(0)}%`],
  ] as const;

  return (
    <dl className="grid grid-cols-4 gap-px overflow-hidden rounded-md bg-slate-200 ring-1 ring-slate-200 sm:grid-cols-7">
      {metrics.map(([label, value]) => (
        <div className="bg-white px-3 py-3" key={label}>
          <dt className="text-[0.68rem] font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </dt>
          <dd className="mt-1 font-mono text-lg font-semibold text-slate-950 tabular-nums">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
