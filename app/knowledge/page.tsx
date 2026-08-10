import type { Metadata } from "next";
import Link from "next/link";

import { LoadErrorSummary } from "@/components/problems/load-error-summary";
import { StatsStrip } from "@/components/statistics/stats-strip";
import { categoryMetadata, categoryValues } from "@/config/categories";
import { createProblemRepository } from "@/lib/problems/repository";
import { getCategoryStats, getProblemStats } from "@/lib/statistics/problem-stats";

export const metadata: Metadata = { title: "Knowledge" };
export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const { problems, errors } = await createProblemRepository().loadAll();
  const overallStats = getProblemStats(problems);
  const statsByCategory = new Map(
    getCategoryStats(problems).map((stats) => [stats.category, stats]),
  );

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
          Knowledge map
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          知识分类
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          从知识体系而不是题目来源出发，检查每个方向的训练量、掌握度和未解决问题。
        </p>
      </header>

      <LoadErrorSummary errors={errors} />
      <StatsStrip stats={overallStats} />

      <section aria-labelledby="category-list-title">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950" id="category-list-title">
              一级分类
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              多分类题会分别计入每个相关方向。
            </p>
          </div>
          <span className="text-sm text-slate-500">{categoryValues.length} 个方向</span>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {categoryValues.map((category) => {
            const stats = statsByCategory.get(category);

            if (!stats) {
              return null;
            }

            return (
              <article
                className="group border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:shadow-md"
                key={category}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950 group-hover:text-sky-800">
                      <Link
                        className="focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
                        href={`/knowledge/${categoryMetadata[category].slug}`}
                      >
                        {category}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {categoryMetadata[category].description}
                    </p>
                  </div>
                  <span className="font-mono text-2xl font-semibold text-slate-950 tabular-nums">
                    {stats.total}
                  </span>
                </div>

                <dl className="mt-5 grid grid-cols-6 gap-px overflow-hidden rounded bg-slate-200 text-center ring-1 ring-slate-200">
                  {(["A", "B", "C", "D"] as const).map((status) => (
                    <div className="bg-slate-50 px-2 py-2" key={status}>
                      <dt className="text-[0.65rem] font-semibold text-slate-500">{status}</dt>
                      <dd className="mt-0.5 font-mono font-semibold text-slate-900">
                        {stats.statusCounts[status]}
                      </dd>
                    </div>
                  ))}
                  <div className="bg-slate-50 px-2 py-2">
                    <dt className="text-[0.65rem] font-semibold text-slate-500">掌握</dt>
                    <dd className="mt-0.5 font-mono font-semibold text-slate-900">
                      {stats.mastered}
                    </dd>
                  </div>
                  <div className="bg-sky-50 px-2 py-2">
                    <dt className="text-[0.65rem] font-semibold text-sky-700">掌握率</dt>
                    <dd className="mt-0.5 font-mono font-semibold text-sky-900">
                      {stats.masteryRate.toFixed(0)}%
                    </dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
