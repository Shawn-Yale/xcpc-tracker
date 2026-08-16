"use client";

import { useActionState, useState } from "react";

import {
  completeReviewAction,
  type ReviewActionState,
} from "@/app/review/actions";
import { statusMetadata, statusValues, type Status } from "@/config/status";
import type { DateOnly } from "@/lib/date/date-only";
import { getSuggestedReviewInterval } from "@/lib/review/completion";

type ReviewCompletionFormProps = {
  currentStatus: Status;
  defaultDate: DateOnly;
  previousIntervalDays: number | null | undefined;
  problemId: string;
};

const initialState: ReviewActionState = {};

export function ReviewCompletionForm({
  currentStatus,
  defaultDate,
  previousIntervalDays,
  problemId,
}: ReviewCompletionFormProps) {
  const [state, formAction, pending] = useActionState(completeReviewAction, initialState);
  const [newStatus, setNewStatus] = useState<Status>(currentStatus);
  const [scheduleNext, setScheduleNext] = useState(true);
  const [interval, setInterval] = useState(
    getSuggestedReviewInterval(currentStatus, previousIntervalDays),
  );

  function handleStatusChange(status: Status) {
    setNewStatus(status);
    setInterval(getSuggestedReviewInterval(status, previousIntervalDays));
  }

  return (
    <form action={formAction} className="space-y-6">
      <input name="id" type="hidden" value={problemId} />

      {state.error ? (
        <div aria-live="polite" className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          {state.error}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-800">
          复习日期
          <input
            className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
            defaultValue={defaultDate}
            max="9999-12-31"
            name="date"
            required
            type="date"
          />
        </label>

        <label className="block text-sm font-semibold text-slate-800">
          新状态
          <select
            className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
            name="newStatus"
            onChange={(event) => handleStatusChange(event.target.value as Status)}
            value={newStatus}
          >
            {statusValues.map((status) => (
              <option key={status} value={status}>
                {status} — {statusMetadata[status].meaning}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-semibold text-slate-800">
          用时（分钟，可选）
          <input
            className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
            min="1"
            name="durationMinutes"
            placeholder="例如 25"
            step="1"
            type="number"
          />
        </label>

        <label className="block text-sm font-semibold text-slate-800">
          下次间隔（天）
          <input
            className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
            disabled={!scheduleNext}
            min="1"
            name="nextIntervalDays"
            onChange={(event) => setInterval(Number(event.target.value))}
            required={scheduleNext}
            step="1"
            type="number"
            value={interval}
          />
          <span className="mt-1 block text-xs font-normal text-slate-500">
            已按状态自动建议，可手动修改。
          </span>
        </label>
      </div>

      <label className="flex items-start gap-3 border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <input
          checked={scheduleNext}
          className="mt-0.5 size-4 accent-sky-700"
          name="scheduleNext"
          onChange={(event) => setScheduleNext(event.target.checked)}
          type="checkbox"
        />
        <span>
          <span className="block font-semibold text-slate-900">继续安排下一次复习</span>
          取消后会清空下一日期和间隔，但仍保留本次及全部历史记录。
        </span>
      </label>

      <label className="block text-sm font-semibold text-slate-800">
        复习记录
        <textarea
          className="mt-2 block min-h-32 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
          name="note"
          placeholder="记录是否独立完成、遗忘点以及下一次要关注的内容……"
          required
        />
      </label>

      <button
        className="inline-flex rounded-md bg-sky-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-wait disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "正在保存…" : "保存复习"}
      </button>
    </form>
  );
}
