"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { knowledgeCatalog } from "@/config/knowledge-taxonomy";
import { getKnowledgeHref } from "@/lib/knowledge/routing";
import type { KnowledgeId } from "@/lib/knowledge/types";
import {
  defaultKnowledgeTreeFilter,
  getRetainedKnowledgeTreeRows,
  getVisibleKnowledgeTreeRows,
  knowledgeTreeFilterValues,
  type KnowledgeTreeFilter,
} from "@/lib/statistics/knowledge-tree";
import type { KnowledgeStats } from "@/lib/statistics/problem-stats";

const filterLabels: Record<KnowledgeTreeFilter, string> = {
  all: "全部",
  "with-training": "有训练记录",
  weak: "C-D 薄弱",
  mastered: "已掌握",
};

export function formatKnowledgeMastery(statistics: KnowledgeStats): string {
  return statistics.rollup.total === 0
    ? "—"
    : `${statistics.rollup.masteryRate.toFixed(0)}%`;
}

function ColumnExplanation({
  label,
  children,
}: {
  label: string;
  children: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const explanationId = `knowledge-${label.toLowerCase()}-explanation`;

  return (
    <span className="relative inline-block align-middle">
      <button
        aria-controls={explanationId}
        aria-expanded={isOpen}
        aria-label={`说明 ${label}`}
        className="ml-1 inline-flex size-5 items-center justify-center rounded-full text-[0.65rem] font-bold normal-case tracking-normal text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-white hover:text-sky-800 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-700"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span aria-hidden="true">?</span>
      </button>
      {isOpen ? (
        <span
          className="absolute right-0 top-7 z-20 w-64 rounded-md bg-slate-950 px-3 py-2 text-left text-xs font-normal normal-case leading-5 tracking-normal text-white shadow-lg"
          id={explanationId}
          role="note"
        >
          {children}
        </span>
      ) : null}
    </span>
  );
}

export function KnowledgeStatisticsTable({ rows }: { rows: readonly KnowledgeStats[] }) {
  const [filter, setFilter] = useState<KnowledgeTreeFilter>(
    defaultKnowledgeTreeFilter,
  );
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<KnowledgeId>>(
    () => new Set(),
  );
  const retainedRows = useMemo(
    () => getRetainedKnowledgeTreeRows(knowledgeCatalog, rows, filter),
    [filter, rows],
  );
  const visibleRows = useMemo(
    () => getVisibleKnowledgeTreeRows(retainedRows, expandedIds),
    [expandedIds, retainedRows],
  );

  function toggleExpanded(id: KnowledgeId) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <div
        aria-label="分类掌握度筛选"
        className="inline-flex max-w-full flex-wrap gap-1 rounded-md bg-slate-100 p-1 ring-1 ring-slate-200"
        role="group"
      >
        {knowledgeTreeFilterValues.map((value) => (
          <button
            aria-pressed={filter === value}
            className={`rounded px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${
              filter === value
                ? "bg-white text-sky-800 shadow-sm ring-1 ring-slate-200"
                : "text-slate-600 hover:bg-white/70 hover:text-slate-950"
            }`}
            key={value}
            onClick={() => setFilter(value)}
            type="button"
          >
            {filterLabels[value]}
          </button>
        ))}
      </div>

      {visibleRows.length === 0 ? (
        <p className="border border-dashed border-slate-300 bg-slate-50/60 px-4 py-5 text-center text-sm text-slate-500">
          当前筛选下暂无分类记录。
        </p>
      ) : (
        <div aria-label="知识统计，可横向滚动" className="overflow-x-auto border border-slate-200 bg-white" role="region" tabIndex={0}>
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead className="bg-slate-100/80 text-xs uppercase tracking-wide text-slate-600"><tr>
              <th className="min-w-72 px-4 py-3 font-semibold" scope="col">知识点</th>
              <th className="px-3 py-3 text-right font-semibold" scope="col">
                直接统计
                <ColumnExplanation label="直接统计">
                  仅统计直接归类到当前知识节点的题目。
                </ColumnExplanation>
              </th>
              <th className="px-3 py-3 text-right font-semibold" scope="col">
                汇总统计
                <ColumnExplanation label="汇总统计">
                  统计当前节点及其所有下级知识节点中的题目；同一道题在当前节点下只计一次。
                </ColumnExplanation>
              </th>
              {(["A", "B", "C", "D"] as const).map((status) => <th className="px-3 py-3 text-right font-semibold" key={status} scope="col">{status}</th>)}
              <th className="px-4 py-3 text-right font-semibold" scope="col">掌握率</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-200">
              {visibleRows.map(({ entry, statistics, matched, hasRetainedChildren }) => {
                const isExpanded = expandedIds.has(entry.id);
                return <tr className="hover:bg-sky-50/40" key={entry.id}>
                  <th className="px-4 py-3 font-semibold text-slate-950" scope="row">
                    <div className="flex min-w-max items-center gap-2" style={{ paddingInlineStart: `${entry.depth - 1}rem` }}>
                      {hasRetainedChildren ? (
                        <button
                          aria-expanded={isExpanded}
                          aria-label={`${isExpanded ? "收起" : "展开"} ${entry.name}`}
                          className="inline-flex size-6 shrink-0 items-center justify-center rounded text-slate-500 hover:bg-slate-100 hover:text-sky-800 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-sky-700"
                          onClick={() => toggleExpanded(entry.id)}
                          type="button"
                        >
                          <span aria-hidden="true">{isExpanded ? "▾" : "▸"}</span>
                        </button>
                      ) : (
                        <span aria-hidden="true" className="size-6 shrink-0" />
                      )}
                      <Link className="hover:text-sky-800 hover:underline" href={getKnowledgeHref(entry.id)}>{entry.name}</Link>
                      {!matched ? (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.65rem] font-medium text-slate-500">
                          含匹配子项
                        </span>
                      ) : null}
                    </div>
                  </th>
                  <td className="px-3 py-3 text-right font-mono">{statistics.direct.total}</td>
                  <td className="px-3 py-3 text-right font-mono font-semibold">{statistics.rollup.total}</td>
                  <td className="px-3 py-3 text-right font-mono">{statistics.rollup.statusCounts.A}</td>
                  <td className="px-3 py-3 text-right font-mono">{statistics.rollup.statusCounts.B}</td>
                  <td className="px-3 py-3 text-right font-mono">{statistics.rollup.statusCounts.C}</td>
                  <td className="px-3 py-3 text-right font-mono">{statistics.rollup.statusCounts.D}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">{formatKnowledgeMastery(statistics)}</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
