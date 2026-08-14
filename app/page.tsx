import Link from "next/link";

import { BacklogList } from "@/components/dashboard/backlog-list";
import { DailyFocus, DashboardHero } from "@/components/dashboard/dashboard-overview";
import { MasteryPanel } from "@/components/dashboard/mastery-panel";
import { RecentReviewList } from "@/components/dashboard/recent-review-list";
import { RecentSolvedList } from "@/components/dashboard/recent-solved-list";
import { LoadErrorSummary } from "@/components/problems/load-error-summary";
import { getDashboardSummary } from "@/lib/dashboard/summary";
import { toLocalDateOnly } from "@/lib/date/local-date";
import { createProblemRepository } from "@/lib/problems/repository";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { problems, errors } = await createProblemRepository().loadAll();
  const today = toLocalDateOnly(new Date());
  const summary = getDashboardSummary(problems, today);
  const { stats, reviewQueue } = summary;
  const backlogCount = stats.statusCounts.C + stats.statusCounts.D;
  const focusMessage = reviewQueue.overdue.length > 0
    ? `先完成最早逾期的任务，把 ${reviewQueue.overdue.length} 道欠账逐步清零。`
    : reviewQueue.today.length > 0
      ? `今天有 ${reviewQueue.today.length} 道题等待复习，专注完成即可。`
      : "今天没有到期任务，可以巩固 Backlog 或开始一道新题。";

  return (
    <div className="space-y-10">
      <DashboardHero focusMessage={focusMessage} reviewQueue={reviewQueue} today={today} />

      <LoadErrorSummary errors={errors} />

      {problems.length === 0 ? (
        <section className="border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Start here</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">建立第一条训练记录</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">新增题目后，这里会自动汇总 Review 任务、掌握率、训练动态和 C/D Backlog。</p>
          <Link className="mt-6 inline-flex rounded-md bg-sky-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700" href="/problems/new">新增第一道题</Link>
        </section>
      ) : (
        <>
          <DailyFocus reviewQueue={reviewQueue} today={today} />

          <MasteryPanel stats={stats} />

          <section aria-labelledby="backlog-title">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Next gains</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950" id="backlog-title">C/D Backlog</h2>
                <p className="mt-2 text-sm text-slate-600">优先显示 D 与未排期题目，把薄弱点变成下一步行动。</p>
              </div>
              <div className="flex gap-3 text-sm font-semibold">
                <Link className="text-amber-800 hover:underline" href="/problems?status=C">C · {stats.statusCounts.C}</Link>
                <Link className="text-rose-800 hover:underline" href="/problems?status=D">D · {stats.statusCounts.D}</Link>
                <span className="text-slate-600">共 {backlogCount}</span>
              </div>
            </div>
            <div className="mt-5"><BacklogList problems={summary.backlog} today={today} /></div>
          </section>

          <section aria-labelledby="activity-title">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Momentum</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950" id="activity-title">最近训练动态</h2>
              <p className="mt-2 text-sm text-slate-600">新增以 solvedAt 为准；复习动态直接来自不可变 Review History。</p>
            </div>
            <div className="mt-5 grid gap-8 lg:grid-cols-2">
              <div>
                <div className="mb-3 flex items-baseline justify-between">
                  <h3 className="font-semibold text-slate-950">Recent Solved</h3>
                  <Link className="text-xs font-semibold text-sky-800 hover:underline" href="/problems?sort=solvedAt&direction=desc">全部题目 →</Link>
                </div>
                <RecentSolvedList problems={summary.recentSolved} />
              </div>
              <div>
                <div className="mb-3 flex items-baseline justify-between">
                  <h3 className="font-semibold text-slate-950">Recent Reviews</h3>
                  <Link className="text-xs font-semibold text-sky-800 hover:underline" href="/review">Review 队列 →</Link>
                </div>
                <RecentReviewList activity={summary.recentReviews} />
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
