import type { Metadata } from "next";
import Link from "next/link";

import { ProblemEditorForm } from "@/components/problems/problem-editor-form";
import { toLocalDateOnly } from "@/lib/date/local-date";
import {
  generateProblemId,
  retrospectiveTemplate,
  type ProblemEditorInput,
} from "@/lib/problems/editor";

export const metadata: Metadata = { title: "New Problem" };
export const dynamic = "force-dynamic";

export default function NewProblemPage() {
  const initial: ProblemEditorInput = {
    id: generateProblemId({ platform: "Codeforces" }),
    title: "",
    platform: "Codeforces",
    contest: null,
    problem: null,
    url: null,
    rating: null,
    solvedAt: toLocalDateOnly(new Date()),
    durationMinutes: null,
    status: "C",
    knowledge: [],
    tags: [],
    scheduleReview: false,
    nextReviewDate: null,
    reviewIntervalDays: null,
    content: retrospectiveTemplate,
  };

  return (
    <div className="mx-auto max-w-5xl">
      <Link className="text-sm font-medium text-slate-600 hover:text-sky-800 hover:underline" href="/problems">
        ← 返回题目库
      </Link>
      <header className="mt-6 border-b border-slate-200 pb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">New record</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">新增题目</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">记录首次训练结果、知识标签、Review 排期与 Markdown 复盘。保存前请确认稳定 ID。</p>
      </header>
      <div className="py-8">
        <ProblemEditorForm initial={initial} mode="create" />
      </div>
    </div>
  );
}
