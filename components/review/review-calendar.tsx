import { addCalendarDays, type DateOnly } from "@/lib/date/date-only";
import type { ProblemFile } from "@/lib/problems/types";

type ReviewCalendarProps = {
  problems: readonly ProblemFile[];
  today: DateOnly;
};

const weekdayFormatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "UTC",
  weekday: "short",
});

function weekday(date: DateOnly): string {
  return weekdayFormatter.format(new Date(`${date}T00:00:00Z`));
}

export function ReviewCalendar({ problems, today }: ReviewCalendarProps) {
  const dates = Array.from({ length: 8 }, (_, index) => addCalendarDays(today, index));

  return (
    <section aria-labelledby="review-calendar-title">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
            Schedule
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950" id="review-calendar-title">
            8 日复习日历
          </h2>
        </div>
        <p className="text-xs text-slate-500">今天 + 未来 7 天</p>
      </div>

      <div className="mt-4 grid min-w-[680px] grid-cols-8 overflow-hidden border border-slate-200 bg-white">
        {dates.map((date, index) => {
          const count = problems.filter(
            (problem) => problem.frontmatter.nextReviewDate === date,
          ).length;

          return (
            <div
              className={`min-h-28 border-r border-slate-200 p-3 last:border-r-0 ${
                index === 0 ? "bg-sky-50" : ""
              }`}
              key={date}
            >
              <p className="text-xs font-semibold text-slate-600">
                {index === 0 ? "今天" : weekday(date)}
              </p>
              <time className="mt-1 block font-mono text-xs text-slate-700" dateTime={date}>
                {date.slice(5)}
              </time>
              <p
                className={`mt-5 text-2xl font-semibold ${
                  count > 0 ? "text-sky-800" : "text-slate-500"
                }`}
              >
                {count}
              </p>
              <p className="text-[11px] text-slate-600">tasks</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
