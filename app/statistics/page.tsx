import type { Metadata } from "next";
import Link from "next/link";

import { LoadErrorSummary } from "@/components/problems/load-error-summary";
import { ActivityHeatmap } from "@/components/statistics/activity-heatmap";
import { KnowledgeStatisticsTable } from "@/components/statistics/knowledge-statistics-table";
import { ConversionPanel } from "@/components/statistics/conversion-panel";
import { DistributionList } from "@/components/statistics/distribution-list";
import { RatingTrend } from "@/components/statistics/rating-trend";
import { StatsStrip } from "@/components/statistics/stats-strip";
import { knowledgeCatalog } from "@/config/knowledge-taxonomy";
import { statusValues } from "@/config/status";
import { toLocalDateOnly } from "@/lib/date/local-date";
import { getKnowledgeEntry } from "@/lib/knowledge/catalog";
import { getKnowledgeHref } from "@/lib/knowledge/routing";
import { createProblemRepository } from "@/lib/problems/repository";
import { getStatisticsSummary } from "@/lib/statistics/analysis";

export const metadata: Metadata = { title: "Statistics" };
export const dynamic = "force-dynamic";

export default async function StatisticsPage() {
  const { problems, errors } = await createProblemRepository().loadAll();
  const today = toLocalDateOnly(new Date());
  const summary = getStatisticsSummary(problems, today);
  const ratedCount = summary.ratingDistribution.reduce((sum, item) => sum + item.count, 0);
  const ratingItems = summary.ratingDistribution.map((item) => ({
    label: item.label,
    count: item.count,
    percentage: ratedCount === 0 ? 0 : (item.count / ratedCount) * 100,
  }));
  const platformItems = summary.platformDistribution.map((item) => ({
    label: item.platform,
    count: item.count,
    percentage: item.percentage,
    href: `/problems?platform=${encodeURIComponent(item.platform)}`,
  }));
  const statusItems = statusValues.map((status) => ({
    label: `Status ${status}`,
    count: summary.overall.statusCounts[status],
    percentage:
      summary.overall.total === 0
        ? 0
        : (summary.overall.statusCounts[status] / summary.overall.total) * 100,
    href: `/status/${status}`,
  }));
  const dKnowledgeItems = summary.dKnowledgeGaps.knowledge.map((item) => ({
    label: getKnowledgeEntry(knowledgeCatalog, item.id)?.name ?? item.id,
    count: item.count,
    percentage:
      summary.dKnowledgeGaps.total === 0
        ? 0
        : (item.count / summary.dKnowledgeGaps.total) * 100,
    href: getKnowledgeHref(item.id),
  }));
  const dTagItems = summary.dKnowledgeGaps.tags.slice(0, 8).map((item) => ({
    label: item.tag,
    count: item.count,
    percentage:
      summary.dKnowledgeGaps.total === 0
        ? 0
        : (item.count / summary.dKnowledgeGaps.total) * 100,
  }));

  return (
    <div className="space-y-12">
      <header className="border-b border-slate-200 pb-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Training intelligence · {today}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">统计分析</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">从题目、知识分类和 Review History 中观察训练规模、难度变化与掌握转化，而不新增任何统计字段。</p>
          </div>
          <div className="flex gap-6 border-l-4 border-sky-700 pl-5">
            <div>
              <p className="font-mono text-3xl font-semibold text-slate-950">{summary.overall.masteryRate.toFixed(0)}%</p>
              <p className="text-xs text-slate-500">Mastery</p>
            </div>
            <div>
              <p className="font-mono text-3xl font-semibold text-slate-950">{summary.reviewCount}</p>
              <p className="text-xs text-slate-500">Reviews</p>
            </div>
          </div>
        </div>
      </header>

      <LoadErrorSummary errors={errors} />

      {problems.length === 0 ? (
        <section className="border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold text-slate-950">还没有可分析的数据</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">创建题目并完成 Review 后，状态、难度、热力图和转化率会自动出现在这里。</p>
          <Link className="mt-6 inline-flex rounded-md bg-sky-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700" href="/problems/new">新增题目</Link>
        </section>
      ) : (
        <>
          <section aria-labelledby="overview-title">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Overview</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950" id="overview-title">当前题库与训练量</h2>
              <p className="mt-2 text-sm text-slate-600">状态按当前每道题统计；时间窗口按 solvedAt 统计新增题目。</p>
            </div>
            <div className="mt-5"><StatsStrip stats={summary.overall} /></div>
            <div className="mt-6 max-w-2xl">
              <h3 className="text-sm font-semibold text-slate-950">Status 数量与比例</h3>
              <div className="mt-4"><DistributionList emptyMessage="暂无状态数据。" items={statusItems} /></div>
            </div>
            <dl className="mt-5 grid gap-px overflow-hidden rounded-md bg-slate-200 ring-1 ring-slate-200 sm:grid-cols-3">
              {[
                ["Last 7 Days", summary.trainingVolume.last7Days],
                ["Last 30 Days", summary.trainingVolume.last30Days],
                ["This Year", summary.trainingVolume.thisYear],
              ].map(([label, value]) => (
                <div className="bg-white px-5 py-4" key={label}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
                  <dd className="mt-2 font-mono text-3xl font-semibold text-slate-950">{value}</dd>
                  <dd className="mt-1 text-xs text-slate-500">新增题目</dd>
                </div>
              ))}
            </dl>
          </section>

          <ActivityHeatmap days={summary.heatmap} />

          <section aria-labelledby="knowledge-stats-title">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Knowledge mastery</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950" id="knowledge-stats-title">分类掌握度</h2>
              <p className="mt-2 text-sm text-slate-600">Direct 只统计显式选择；Rollup 包含 descendants，并按题目去重。</p>
            </div>
            <div className="mt-5"><KnowledgeStatisticsTable rows={summary.knowledge} /></div>
          </section>

          <section className="grid gap-10 lg:grid-cols-2" aria-label="Problem distributions">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">平台题量分布</h2>
              <p className="mt-2 text-sm text-slate-600">分母为全部有效题目，共 {summary.overall.total} 道。</p>
              <div className="mt-5"><DistributionList emptyMessage="暂无平台数据。" items={platformItems} /></div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Rating 区间</h2>
              <p className="mt-2 text-sm text-slate-600">仅统计已填写 Rating 的 {ratedCount} 道题。</p>
              <div className="mt-5"><DistributionList emptyMessage="暂无带 Rating 的题目。" items={ratingItems} /></div>
            </div>
          </section>

          <section aria-labelledby="rating-trend-title">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Difficulty trend</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950" id="rating-trend-title">Rating 趋势</h2>
              <p className="mt-2 text-sm text-slate-600">按 solvedAt 聚合同日平均 Rating，空 Rating 不参与。</p>
            </div>
            <div className="mt-5"><RatingTrend points={summary.ratingTrend} /></div>
          </section>

          <section aria-labelledby="conversion-title">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Review conversion</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950" id="conversion-title">长期状态转化</h2>
              <p className="mt-2 text-sm text-slate-600">矩阵统计 Review 次数；C/D → A/B 比例统计曾进入该状态、后来至少一次到达 A/B 的题目比例。</p>
            </div>
            <div className="mt-5"><ConversionPanel conversions={summary.journeyConversions} matrix={summary.conversionMatrix} reviewCount={summary.reviewCount} /></div>
          </section>

          <section aria-labelledby="gaps-title">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">Current weaknesses</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950" id="gaps-title">D 类知识缺口</h2>
                <p className="mt-2 text-sm text-slate-600">只聚合当前状态为 D 的题；Knowledge 仅按显式选择计数，不向 ancestors rollup。</p>
              </div>
              <p className="font-mono text-3xl font-semibold text-rose-800">{summary.dKnowledgeGaps.total}</p>
            </div>
            {summary.dKnowledgeGaps.total === 0 ? (
              <div className="mt-5 border border-emerald-200 bg-emerald-50 px-5 py-6 text-sm text-emerald-800">当前没有 D 类题目，知识缺口池为空。</div>
            ) : (
              <div className="mt-5 grid gap-10 lg:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-slate-950">Knowledge</h3>
                  <div className="mt-4"><DistributionList emptyMessage="D 类题目尚未分类。" items={dKnowledgeItems} /></div>
                  {summary.dKnowledgeGaps.unclassified > 0 ? <p className="mt-4 text-xs text-amber-800">另有 {summary.dKnowledgeGaps.unclassified} 道 D 题未分类。</p> : null}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-950">Tags</h3>
                  <div className="mt-4"><DistributionList emptyMessage="D 类题目尚未填写 Tags。" items={dTagItems} /></div>
                </div>
              </div>
            )}
          </section>
        </>
      )}

      <section className="border-t border-slate-200 pt-7" aria-labelledby="definitions-title">
        <h2 className="text-lg font-semibold text-slate-950" id="definitions-title">统计口径</h2>
        <div className="mt-4 grid gap-4 text-sm leading-6 text-slate-600 md:grid-cols-2">
          <p><strong className="text-slate-900">题目数：</strong>状态、平台、Rating、分类和训练量都以 Problem 为单位；A/B 才计入 Mastered。</p>
          <p><strong className="text-slate-900">Review 次数：</strong>热力图中的 Review、转化矩阵都以 History 事件为单位，不等同于题目数。</p>
          <p><strong className="text-slate-900">日期：</strong>最近 7/30 天均包含今天，按本地 YYYY-MM-DD 计算，并排除未来日期。</p>
          <p><strong className="text-slate-900">持久化：</strong>所有分析均从现有字段实时推导，不写入 conversion、mastered 或统计缓存。</p>
        </div>
      </section>
    </div>
  );
}
