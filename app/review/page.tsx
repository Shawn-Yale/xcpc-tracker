import type { Metadata } from "next";

import { LoadErrorSummary } from "@/components/problems/load-error-summary";
import { ReviewCalendar } from "@/components/review/review-calendar";
import { ReviewTaskList } from "@/components/review/review-task-list";
import { toLocalDateOnly } from "@/lib/date/local-date";
import { createProblemRepository } from "@/lib/problems/repository";
import { getReviewQueue } from "@/lib/review/queue";

export const metadata: Metadata = { title: "复习" };
export const dynamic = "force-dynamic";

type ReviewPageProps = {
  searchParams: Promise<{ completed?: string }>;
};

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const [{ problems, errors }, query] = await Promise.all([
    createProblemRepository().loadAll(),
    searchParams,
  ]);
  const today = toLocalDateOnly(new Date());
  const queue = getReviewQueue(problems, today);
  const scheduled = [...queue.today, ...queue.upcoming];
  const total = queue.overdue.length + scheduled.length;

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            复习队列
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            到期日期不会随页面访问自动移动；只有完成复习后才会追加记录并重新排期。
          </p>
        </div>
        <div className="border-l-4 border-sky-700 pl-4">
          <p className="font-mono text-3xl font-semibold text-slate-950">{total}</p>
          <p className="text-xs text-slate-500">当前 8 日窗口任务</p>
        </div>
      </header>

      {query.completed ? (
        <div aria-live="polite" className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800" role="status">
          复习已保存，状态与下一次排期已经更新。
        </div>
      ) : null}

      <LoadErrorSummary errors={errors} />

      <div
        aria-label="8 日复习日历，可横向滚动"
        className="overflow-x-auto pb-1"
        role="region"
        tabIndex={0}
      >
        <ReviewCalendar problems={scheduled} today={today} />
      </div>

      <section aria-labelledby="overdue-title">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="text-xl font-semibold text-rose-800" id="overdue-title">已逾期</h2>
          <span className="font-mono text-sm text-slate-500">{queue.overdue.length}</span>
        </div>
        <ReviewTaskList emptyMessage="没有逾期任务。" problems={queue.overdue} protectKnowledge today={today} />
      </section>

      <section aria-labelledby="today-title">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-950" id="today-title">今天</h2>
          <span className="font-mono text-sm text-slate-500">{queue.today.length}</span>
        </div>
        <ReviewTaskList emptyMessage="今天没有计划中的复习。" problems={queue.today} protectKnowledge today={today} />
      </section>

      <section aria-labelledby="upcoming-title">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-950" id="upcoming-title">未来 7 天</h2>
          <span className="font-mono text-sm text-slate-500">{queue.upcoming.length}</span>
        </div>
        <ReviewTaskList emptyMessage="未来 7 天没有已安排的复习。" problems={queue.upcoming} protectKnowledge today={today} />
      </section>
    </div>
  );
}
