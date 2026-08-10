import { StatusBadge } from "@/components/problems/status-badge";
import { statusValues } from "@/config/status";
import type {
  ConversionMatrix,
  JourneyConversion,
} from "@/lib/statistics/analysis";

export function ConversionPanel({
  conversions,
  matrix,
  reviewCount,
}: {
  conversions: readonly JourneyConversion[];
  matrix: ConversionMatrix;
  reviewCount: number;
}) {
  if (reviewCount === 0) {
    return <p className="border-l-4 border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">暂无 Review History，完成复习后才能计算长期转化。</p>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <div className="space-y-4">
        {conversions.map((conversion) => (
          <article className="border-l-4 border-sky-600 bg-white px-5 py-4" key={conversion.sourceStatus}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{conversion.sourceStatus} → A/B</p>
            <p className="mt-2 font-mono text-3xl font-semibold text-slate-950">{conversion.conversionRate.toFixed(0)}%</p>
            <p className="mt-1 text-xs text-slate-500">{conversion.convertedProblems} / {conversion.eligibleProblems} 道曾进入 {conversion.sourceStatus} 的题</p>
          </article>
        ))}
      </div>

      <div
        aria-label="状态转换矩阵，可横向滚动"
        className="overflow-x-auto border border-slate-200 bg-white"
        role="region"
        tabIndex={0}
      >
        <table className="w-full min-w-[480px] border-collapse text-center text-sm">
          <caption className="px-4 py-3 text-left text-xs text-slate-500">状态转换矩阵 · {reviewCount} 次 Review 事件</caption>
          <thead className="bg-slate-100/80">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-semibold uppercase text-slate-600" scope="col">From \ To</th>
              {statusValues.map((status) => <th className="px-3 py-3" key={status} scope="col"><StatusBadge status={status} /></th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {statusValues.map((fromStatus) => (
              <tr key={fromStatus}>
                <th className="px-3 py-3 text-left" scope="row"><StatusBadge status={fromStatus} /></th>
                {statusValues.map((toStatus) => (
                  <td className={`px-3 py-3 font-mono ${matrix[fromStatus][toStatus] > 0 ? "font-semibold text-slate-950" : "text-slate-300"}`} key={toStatus}>{matrix[fromStatus][toStatus]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
