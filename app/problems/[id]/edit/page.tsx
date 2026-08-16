import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProblemEditorForm } from "@/components/problems/problem-editor-form";
import { problemEditorSchema } from "@/lib/problems/editor";
import { createProblemRepository } from "@/lib/problems/repository";

export const metadata: Metadata = { title: "编辑题目" };
export const dynamic = "force-dynamic";

type EditProblemPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProblemPage({ params }: EditProblemPageProps) {
  const { id } = await params;
  const problem = await createProblemRepository().findById(id);

  if (!problem) {
    notFound();
  }

  const { frontmatter } = problem;
  const initial = problemEditorSchema.parse({
    id: frontmatter.id,
    title: frontmatter.title,
    platform: frontmatter.platform,
    contest: frontmatter.contest ?? null,
    problem: frontmatter.problem ?? null,
    url: frontmatter.url ?? null,
    rating: frontmatter.rating ?? null,
    solvedAt: frontmatter.solvedAt,
    durationMinutes: frontmatter.durationMinutes ?? null,
    solutionLanguage: frontmatter.solutionLanguage,
    solutionCode: frontmatter.solutionCode,
    status: frontmatter.status,
    knowledge: frontmatter.knowledge,
    tags: frontmatter.tags,
    scheduleReview:
      frontmatter.nextReviewDate != null && frontmatter.reviewIntervalDays != null,
    nextReviewDate: frontmatter.nextReviewDate ?? null,
    reviewIntervalDays: frontmatter.reviewIntervalDays ?? null,
    content: problem.content,
  });

  return (
    <div className="mx-auto max-w-5xl">
      <Link className="text-sm font-medium text-slate-600 hover:text-sky-800 hover:underline" href={`/problems/${frontmatter.id}`}>
        ← 返回题目详情
      </Link>
      <header className="mt-6 border-b border-slate-200 pb-7">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">编辑题目</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">更新结构化字段或 Markdown 正文。稳定 ID 与既有复习记录不可通过此表单修改。</p>
      </header>
      <div className="py-8">
        <ProblemEditorForm initial={initial} mode="edit" />
      </div>
    </div>
  );
}
