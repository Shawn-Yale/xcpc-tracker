import Link from "next/link";

import { categoryMetadata } from "@/config/categories";
import type { CategoryStats } from "@/lib/statistics/problem-stats";

export function CategoryStatisticsTable({ rows }: { rows: readonly CategoryStats[] }) {
  return (
    <div
      aria-label="知识分类统计，可横向滚动"
      className="overflow-x-auto border border-slate-200 bg-white"
      role="region"
      tabIndex={0}
    >
      <table className="w-full min-w-[780px] border-collapse text-left text-sm">
        <thead className="bg-slate-100/80 text-xs uppercase tracking-wide text-slate-600">
          <tr>
            <th className="px-4 py-3 font-semibold" scope="col">Category</th>
            <th className="px-3 py-3 text-right font-semibold" scope="col">Total</th>
            {(["A", "B", "C", "D"] as const).map((status) => <th className="px-3 py-3 text-right font-semibold" key={status} scope="col">{status}</th>)}
            <th className="px-3 py-3 text-right font-semibold" scope="col">Mastered</th>
            <th className="px-4 py-3 text-right font-semibold" scope="col">Rate</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map((row) => (
            <tr className="hover:bg-sky-50/40" key={row.category}>
              <th className="px-4 py-3 font-semibold text-slate-950" scope="row">
                <Link className="hover:text-sky-800 hover:underline" href={`/knowledge/${categoryMetadata[row.category].slug}`}>{row.category}</Link>
              </th>
              <td className="px-3 py-3 text-right font-mono">{row.total}</td>
              <td className="px-3 py-3 text-right font-mono">{row.statusCounts.A}</td>
              <td className="px-3 py-3 text-right font-mono">{row.statusCounts.B}</td>
              <td className="px-3 py-3 text-right font-mono">{row.statusCounts.C}</td>
              <td className="px-3 py-3 text-right font-mono">{row.statusCounts.D}</td>
              <td className="px-3 py-3 text-right font-mono font-semibold">{row.mastered}</td>
              <td className="px-4 py-3 text-right">
                <span className="font-mono font-semibold">{row.masteryRate.toFixed(0)}%</span>
                <span className="ml-2 inline-block h-1.5 w-14 overflow-hidden rounded-full bg-slate-100 align-middle">
                  <span className="block h-full bg-emerald-500" style={{ width: `${row.masteryRate}%` }} />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
