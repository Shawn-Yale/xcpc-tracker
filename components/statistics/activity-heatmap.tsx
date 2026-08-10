import type { HeatmapDay } from "@/lib/statistics/analysis";

const intensityStyles = [
  "bg-slate-100 ring-slate-200",
  "bg-sky-200 ring-sky-300",
  "bg-sky-400 ring-sky-500",
  "bg-sky-600 ring-sky-700",
  "bg-sky-900 ring-sky-950",
] as const;

function intensity(total: number): number {
  if (total === 0) return 0;
  if (total === 1) return 1;
  if (total === 2) return 2;
  if (total <= 4) return 3;
  return 4;
}

export function ActivityHeatmap({ days }: { days: readonly HeatmapDay[] }) {
  const totalActivity = days.reduce((sum, day) => sum + day.total, 0);
  const activeDays = days.filter((day) => day.total > 0).length;

  return (
    <section aria-labelledby="heatmap-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Consistency</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950" id="heatmap-title">12 周训练热力图</h2>
          <p className="mt-2 text-sm text-slate-600">每格合计首次训练与 Review 次数，不代表不同题目数。</p>
        </div>
        <p className="text-sm text-slate-600"><span className="font-mono font-semibold text-slate-950">{totalActivity}</span> 次活动 · <span className="font-mono font-semibold text-slate-950">{activeDays}</span> 个活跃日</p>
      </div>

      <div
        aria-labelledby="heatmap-title"
        className="mt-5 overflow-x-auto border border-slate-200 bg-white p-4 sm:p-5"
        role="region"
        tabIndex={0}
      >
        <div
          className="grid w-max gap-1.5"
          style={{ gridAutoFlow: "column", gridTemplateRows: "repeat(7, minmax(0, 1fr))" }}
        >
          {days.map((day) => (
            <time
              className={`size-3.5 rounded-[3px] ring-1 ring-inset sm:size-4 ${intensityStyles[intensity(day.total)]}`}
              dateTime={day.date}
              key={day.date}
              title={`${day.date} · Solved ${day.solvedCount} · Reviews ${day.reviewCount}`}
            >
              <span className="sr-only">
                {day.date}：{day.solvedCount} 道首次训练，{day.reviewCount} 次 Review
              </span>
            </time>
          ))}
        </div>
        <div className="mt-3 flex min-w-max items-center justify-between gap-8 text-[11px] text-slate-500">
          <span>{days[0]?.date ?? "—"}</span>
          <div className="flex items-center gap-1.5">
            <span>少</span>
            {intensityStyles.map((style) => <span aria-hidden="true" className={`size-3 rounded-[2px] ring-1 ring-inset ${style}`} key={style} />)}
            <span>多</span>
          </div>
          <span>{days.at(-1)?.date ?? "—"}</span>
        </div>
      </div>
    </section>
  );
}
