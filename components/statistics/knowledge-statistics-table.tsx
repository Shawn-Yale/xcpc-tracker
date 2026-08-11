import Link from "next/link";

import { knowledgeCatalog } from "@/config/knowledge-taxonomy";
import { getKnowledgeEntry } from "@/lib/knowledge/catalog";
import { getKnowledgeHref } from "@/lib/knowledge/routing";
import type { KnowledgeStats } from "@/lib/statistics/problem-stats";

export function KnowledgeStatisticsTable({ rows }: { rows: readonly KnowledgeStats[] }) {
  return (
    <div aria-label="知识统计，可横向滚动" className="overflow-x-auto border border-slate-200 bg-white" role="region" tabIndex={0}>
      <table className="w-full min-w-[860px] border-collapse text-left text-sm">
        <thead className="bg-slate-100/80 text-xs uppercase tracking-wide text-slate-600"><tr>
          <th className="px-4 py-3 font-semibold" scope="col">Knowledge</th>
          <th className="px-3 py-3 text-right font-semibold" scope="col">Direct</th>
          <th className="px-3 py-3 text-right font-semibold" scope="col">Rollup</th>
          {(["A", "B", "C", "D"] as const).map((status) => <th className="px-3 py-3 text-right font-semibold" key={status} scope="col">{status}</th>)}
          <th className="px-4 py-3 text-right font-semibold" scope="col">Mastery</th>
        </tr></thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map((row) => {
            const entry = getKnowledgeEntry(knowledgeCatalog, row.id)!;
            return <tr className="hover:bg-sky-50/40" key={row.id}>
              <th className="px-4 py-3 font-semibold text-slate-950" scope="row"><Link className="hover:text-sky-800 hover:underline" href={getKnowledgeHref(row.id)}>{entry.name}</Link></th>
              <td className="px-3 py-3 text-right font-mono">{row.direct.total}</td>
              <td className="px-3 py-3 text-right font-mono font-semibold">{row.rollup.total}</td>
              <td className="px-3 py-3 text-right font-mono">{row.rollup.statusCounts.A}</td>
              <td className="px-3 py-3 text-right font-mono">{row.rollup.statusCounts.B}</td>
              <td className="px-3 py-3 text-right font-mono">{row.rollup.statusCounts.C}</td>
              <td className="px-3 py-3 text-right font-mono">{row.rollup.statusCounts.D}</td>
              <td className="px-4 py-3 text-right font-mono font-semibold">{row.rollup.masteryRate.toFixed(0)}%</td>
            </tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}
