import type { RatingTrendPoint } from "@/lib/statistics/analysis";

export function RatingTrend({ points }: { points: readonly RatingTrendPoint[] }) {
  if (points.length === 0) {
    return <p className="border-l-4 border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">暂无带难度的训练记录。</p>;
  }

  const maximum = Math.max(...points.map((point) => point.averageRating));
  const first = points[0];
  const last = points.at(-1) ?? first;
  const change = last.averageRating - first.averageRating;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3 text-sm text-slate-600">
        <p>最近 {points.length} 个有难度的训练日</p>
        <p>首尾变化 <span className={`font-mono font-semibold ${change >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{change >= 0 ? "+" : ""}{change}</span></p>
      </div>
      <div
        aria-label="难度趋势图，可横向滚动"
        className="mt-5 overflow-x-auto border border-slate-200 bg-white px-4 pt-6 pb-4"
        role="region"
        tabIndex={0}
      >
        <div className="flex h-52 min-w-max items-end gap-3 border-b border-slate-300 px-1">
          {points.map((point) => (
            <div className="flex w-14 shrink-0 flex-col items-center justify-end" key={point.date}>
              <span className="mb-2 font-mono text-[11px] font-semibold text-slate-700">{point.averageRating}</span>
              <div
                aria-label={`${point.date} 平均难度 ${point.averageRating}，${point.problemCount} 道题`}
                className="w-8 rounded-t bg-gradient-to-t from-sky-700 to-sky-400"
                role="img"
                style={{ height: `${Math.max(12, (point.averageRating / maximum) * 150)}px` }}
                title={`${point.problemCount} 道题`}
              />
              <time className="mt-2 font-mono text-[10px] text-slate-500" dateTime={point.date}>{point.date.slice(5)}</time>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
