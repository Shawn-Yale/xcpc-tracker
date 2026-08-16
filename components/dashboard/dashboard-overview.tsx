import Link from "next/link";

import { ReviewTaskList } from "@/components/review/review-task-list";
import type { DateOnly } from "@/lib/date/date-only";
import type { ReviewQueue } from "@/lib/review/queue";

type DashboardHeroProps = {
  focusMessage: string;
  reviewQueue: ReviewQueue;
  today: DateOnly;
};

export function DashboardHero({
  focusMessage,
  reviewQueue,
  today,
}: DashboardHeroProps) {
  return (
    <header className="overflow-hidden rounded-xl border border-slate-200 bg-sky-50/60 text-slate-950">
      <div className="grid gap-6 px-5 py-6 sm:px-8 sm:py-7 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-end lg:gap-8 lg:px-10 lg:py-8">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-sky-700">今日训练 · {today}</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            把每一次重做，<span className="inline-block">变成真正的掌握。</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{focusMessage}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="rounded-md bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-sky-400" href="/review">开始复习</Link>
            <Link className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-sky-500 hover:text-sky-800" href="/problems/new">记录新题</Link>
          </div>
        </div>

        <aside aria-label="今日行动摘要" className="border-l-2 border-sky-500 pl-5">
          <dl className="flex flex-wrap gap-x-4">
            <div className="w-full">
              <dt className="text-xs font-semibold tracking-[0.12em] text-sky-700">今天</dt>
              <dd className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-4xl font-semibold tabular-nums">
                  {reviewQueue.today.length}
                </span>
                <span className="text-sm font-semibold text-slate-800">待复习</span>
              </dd>
            </div>
            <div className="mt-3 flex items-baseline gap-[0.25em] text-xs text-slate-600">
              <dt className="order-2">已逾期</dt>
              <dd className="order-1 font-mono tabular-nums text-rose-700">{reviewQueue.overdue.length}</dd>
            </div>
            <div className="mt-3 flex items-baseline gap-[0.25em] text-xs text-slate-600">
              <dt className="order-2">未来 7 天</dt>
              <dd className="order-1 font-mono tabular-nums text-sky-700">{reviewQueue.upcoming.length}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </header>
  );
}

type DailyFocusProps = {
  reviewQueue: ReviewQueue;
  today: DateOnly;
};

export function DailyFocus({ reviewQueue, today }: DailyFocusProps) {
  const hasOverdue = reviewQueue.overdue.length > 0;

  return (
    <section aria-labelledby="daily-focus-title">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-950" id="daily-focus-title">今日焦点</h2>
        </div>
        <Link className="text-sm font-semibold text-sky-800 hover:underline" href="/review">查看复习队列 →</Link>
      </div>

      {!hasOverdue ? (
        <p className="mt-3 text-xs text-slate-600">
          <span className="font-mono font-semibold text-rose-700">已逾期 0</span>
          <span aria-hidden="true"> · </span>
          当前没有逾期任务
        </p>
      ) : null}

      <div className={`mt-5 grid gap-8 ${hasOverdue ? "xl:grid-cols-2" : ""}`}>
        {hasOverdue ? (
          <section aria-labelledby="overdue-focus-title" className="min-w-0">
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="font-semibold text-rose-800" id="overdue-focus-title">已逾期</h3>
              <span className="font-mono text-xs text-slate-500">{reviewQueue.overdue.length}</span>
            </div>
            <ReviewTaskList problems={reviewQueue.overdue.slice(0, 3)} emptyMessage="没有逾期任务，节奏保持得很好。" protectKnowledge today={today} />
          </section>
        ) : null}

        <section aria-labelledby="today-focus-title" className="w-full min-w-0">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="font-semibold text-slate-950" id="today-focus-title">今天</h3>
            <span className="font-mono text-xs text-slate-500">{reviewQueue.today.length}</span>
          </div>
          <ReviewTaskList emptyMessage="今天没有到期复习。" problems={reviewQueue.today.slice(0, 3)} today={today} />
        </section>
      </div>
    </section>
  );
}
