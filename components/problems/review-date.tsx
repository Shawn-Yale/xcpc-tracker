import type { DateOnly } from "@/lib/date/date-only";
import { getOverdueDays, isOverdue, isTodayReview } from "@/lib/review/rules";

type ReviewDateProps = {
  date: DateOnly | null | undefined;
  emphasizeMissing?: boolean;
  today: DateOnly;
};

export function ReviewDate({ date, emphasizeMissing = false, today }: ReviewDateProps) {
  if (date == null) {
    return emphasizeMissing ? (
      <span className="font-semibold text-amber-800">
        未安排
        <span className="mt-0.5 block text-xs">需要排期</span>
      </span>
    ) : (
      <span className="text-slate-600">未安排</span>
    );
  }

  if (isOverdue(date, today)) {
    return (
      <span className="font-medium text-rose-700">
        {date}
        <span className="mt-0.5 block text-xs">逾期 {getOverdueDays(date, today)} 天</span>
      </span>
    );
  }

  if (isTodayReview(date, today)) {
    return (
      <span className="font-semibold text-amber-800">
        {date}
        <span className="mt-0.5 block text-xs">今天</span>
      </span>
    );
  }

  return <span className="text-slate-700">{date}</span>;
}
