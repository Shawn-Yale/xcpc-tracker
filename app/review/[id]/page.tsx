import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ReviewDate } from "@/components/problems/review-date";
import { StatusBadge } from "@/components/problems/status-badge";
import { ReviewCompletionForm } from "@/components/review/review-completion-form";
import { toLocalDateOnly } from "@/lib/date/local-date";
import { createProblemRepository } from "@/lib/problems/repository";

export const metadata: Metadata = { title: "完成复习" };
export const dynamic = "force-dynamic";

type CompleteReviewPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CompleteReviewPage({ params }: CompleteReviewPageProps) {
  const { id } = await params;
  const problem = await createProblemRepository().findById(id);

  if (!problem) {
    notFound();
  }

  const { frontmatter } = problem;
  const today = toLocalDateOnly(new Date());

  return (
    <div className="mx-auto max-w-4xl">
      <Link className="text-sm font-medium text-slate-600 hover:text-sky-800 hover:underline" href="/review">
        ← 返回复习队列
      </Link>

      <header className="mt-6 border-b border-slate-200 pb-7">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {frontmatter.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <StatusBadge status={frontmatter.status} />
          <span>{frontmatter.platform}</span>
          <span className="font-mono text-xs">
            计划：<ReviewDate date={frontmatter.nextReviewDate} today={today} />
          </span>
          <span>{frontmatter.reviews.length} 次历史记录</span>
        </div>
      </header>

      <section className="py-8" aria-labelledby="review-form-title">
        <h2 className="text-xl font-semibold text-slate-950" id="review-form-title">
          本次结果
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          顺利掌握可流转到 B/A；遗忘或仍有缺口可退回 D。保存时会从磁盘重新读取当前状态并追加历史。
        </p>
        <div className="mt-6">
          <ReviewCompletionForm
            currentStatus={frontmatter.status}
            defaultDate={today}
            previousIntervalDays={frontmatter.reviewIntervalDays}
            problemId={frontmatter.id}
          />
        </div>
      </section>
    </div>
  );
}
