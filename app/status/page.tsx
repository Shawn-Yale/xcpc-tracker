import type { Metadata } from "next";
import Link from "next/link";

import { LoadErrorSummary } from "@/components/problems/load-error-summary";
import { StatusBadge } from "@/components/problems/status-badge";
import { StatsStrip } from "@/components/statistics/stats-strip";
import { statusMetadata, statusValues } from "@/config/status";
import { createProblemRepository } from "@/lib/problems/repository";
import { isMastered } from "@/lib/review/rules";
import { getProblemStats } from "@/lib/statistics/problem-stats";

export const metadata: Metadata = { title: "状态" };
export const dynamic = "force-dynamic";

export default async function StatusPage() {
  const { problems, errors } = await createProblemRepository().loadAll();
  const stats = getProblemStats(problems);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          掌握状态
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          A/B 代表已经掌握，C/D 则是下一阶段训练与补足知识缺口的重点。
        </p>
      </header>

      <LoadErrorSummary errors={errors} />
      <StatsStrip stats={stats} />

      <section aria-labelledby="status-pools-title">
        <h2 className="text-xl font-semibold text-slate-950" id="status-pools-title">
          状态题池
        </h2>
        <div className="mt-5 divide-y divide-slate-200 border-y border-slate-200 bg-white">
          {statusValues.map((status) => {
            const count = stats.statusCounts[status];
            const percentage = stats.total === 0 ? 0 : (count / stats.total) * 100;

            return (
              <article className="px-4 py-5 sm:px-6" key={status}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <StatusBadge status={status} />
                    <div>
                      <h3 className="font-semibold text-slate-950">
                        <Link
                          className="hover:text-sky-800 hover:underline"
                          href={`/status/${status}`}
                        >
                          状态 {status}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {statusMetadata[status].meaning}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {isMastered(status) ? "计入已掌握" : "尚未计入已掌握"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 sm:w-64">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-sky-600"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-20 text-right">
                      <span className="font-mono text-xl font-semibold text-slate-950">{count}</span>
                      <span className="ml-1 text-xs text-slate-500">{percentage.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
