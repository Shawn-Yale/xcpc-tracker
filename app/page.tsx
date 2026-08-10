import Link from "next/link";

import { BacklogList } from "@/components/dashboard/backlog-list";
import { MasteryPanel } from "@/components/dashboard/mastery-panel";
import { RecentReviewList } from "@/components/dashboard/recent-review-list";
import { RecentSolvedList } from "@/components/dashboard/recent-solved-list";
import { LoadErrorSummary } from "@/components/problems/load-error-summary";
import { ReviewTaskList } from "@/components/review/review-task-list";
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
      <header className="overflow-hidden bg-slate-950 text-white shadow-sm">
        <div className="grid gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-end lg:px-10 lg:py-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Daily training desk · {today}</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">把每一次重做，变成真正的掌握。</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">{focusMessage}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="rounded-md bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400" href="/review">开始 Review</Link>
              <Link className="rounded-md border border-slate-600 px-4 py-2.5 text-sm font-semibold text-white hover:border-sky-400 hover:text-sky-200" href="/problems/new">记录新题</Link>
            </div>
          </div>
          <div className="border-l-4 border-sky-400 pl-5">
            <p className="font-mono text-5xl font-semibold tabular-nums">{stats.masteryRate.toFixed(0)}%</p>
            <p className="mt-2 text-sm font-semibold text-white">Mastery Rate</p>
            <p className="mt-1 text-xs text-slate-400">{stats.mastered} / {stats.total} 道题已进入 A/B</p>
          </div>
        </div>
        <dl className="grid grid-cols-3 border-t border-slate-800">
          <div className="border-r border-slate-800 px-4 py-4 sm:px-6">
            <dt className="text-xs font-semibold uppercase tracking-wide text-rose-300"><Link className="hover:underline" href="/review">Overdue</Link></dt>
            <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums">{reviewQueue.overdue.length}</dd>
          </div>
          <div className="border-r border-slate-800 px-4 py-4 sm:px-6">
            <dt className="text-xs font-semibold uppercase tracking-wide text-amber-300"><Link className="hover:underline" href="/review">Today</Link></dt>
            <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums">{reviewQueue.today.length}</dd>
          </div>
          <div className="px-4 py-4 sm:px-6">
            <dt className="text-xs font-semibold uppercase tracking-wide text-sky-300"><Link className="hover:underline" href="/review">Next 7 days</Link></dt>
            <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums">{reviewQueue.upcoming.length}</dd>
          </div>
        </dl>
      </header>

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
          <section aria-labelledby="daily-focus-title">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Priority queue</p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950" id="daily-focus-title">今日焦点</h2>
              </div>
              <Link className="text-sm font-semibold text-sky-800 hover:underline" href="/review">查看完整队列 →</Link>
            </div>
            <div className="mt-5 grid gap-8 xl:grid-cols-2">
              <div>
                <div className="mb-3 flex items-baseline justify-between">
                  <h3 className="font-semibold text-rose-800">Overdue</h3>
                  <span className="font-mono text-xs text-slate-500">{reviewQueue.overdue.length}</span>
                </div>
                <ReviewTaskList emptyMessage="没有逾期任务，节奏保持得很好。" problems={reviewQueue.overdue.slice(0, 3)} today={today} />
              </div>
              <div>
                <div className="mb-3 flex items-baseline justify-between">
                  <h3 className="font-semibold text-slate-950">Today</h3>
                  <span className="font-mono text-xs text-slate-500">{reviewQueue.today.length}</span>
                </div>
                <ReviewTaskList emptyMessage="今天没有到期 Review。" problems={reviewQueue.today.slice(0, 3)} today={today} />
              </div>
            </div>
          </section>

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
