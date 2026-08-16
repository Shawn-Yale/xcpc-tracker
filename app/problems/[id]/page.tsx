import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { KnowledgeReveal } from "@/components/knowledge/knowledge-reveal";
import { MarkdownContent } from "@/components/problems/markdown-content";
import { ReviewDate } from "@/components/problems/review-date";
import { SolutionCodeBlock } from "@/components/problems/solution-code-block";
import { StatusBadge } from "@/components/problems/status-badge";
import { toLocalDateOnly } from "@/lib/date/local-date";
import {
  getKnowledgeBreadcrumb,
  getKnowledgeLabel,
} from "@/lib/knowledge/presentation";
import type { KnowledgeId } from "@/lib/knowledge/types";
import { ProblemDataError } from "@/lib/problems/errors";
import { createProblemRepository } from "@/lib/problems/repository";
import type { ProblemFile } from "@/lib/problems/types";

export const dynamic = "force-dynamic";

type ProblemDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ saved?: string }>;
};

async function loadProblem(id: string): Promise<ProblemFile | null> {
  return createProblemRepository().findById(id);
}

export async function generateMetadata({
  params,
}: ProblemDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const problem = await loadProblem(id);
    return { title: problem?.frontmatter.title ?? "找不到题目" };
  } catch {
    return { title: "题目数据错误" };
  }
}

function DataError({ error }: { error: ProblemDataError }) {
  return (
    <div className="mx-auto max-w-2xl border border-rose-200 bg-rose-50 px-6 py-8">
      <h1 className="text-2xl font-semibold text-rose-950">题目数据无法载入</h1>
      <p className="mt-3 text-sm leading-6 text-rose-800">{error.message}</p>
      {error.fileName ? (
        <p className="mt-3 text-sm text-rose-800">
          文件：<code className="font-semibold">{error.fileName}</code>
        </p>
      ) : null}
      <Link
        className="mt-6 inline-flex rounded-md bg-rose-900 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800"
        href="/problems"
      >
        返回题目库
      </Link>
    </div>
  );
}

function DetailTags({ values }: { values: string[] }) {
  if (values.length === 0) {
    return <span className="text-sm text-slate-400">未填写</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <span
          className="rounded-md bg-slate-100 px-2.5 py-1 text-sm text-slate-700 ring-1 ring-inset ring-slate-200"
          key={value}
        >
          {value}
        </span>
      ))}
    </div>
  );
}

function KnowledgeDetailTags({ ids }: { ids: readonly KnowledgeId[] }) {
  if (ids.length === 0) {
    return <span className="text-sm text-slate-400">未填写</span>;
  }

  return (
    <KnowledgeReveal variant="badges">
      <span className="flex flex-wrap gap-2">
        {ids.map((id) => (
          <span
            className="rounded-md bg-white px-2.5 py-1 text-sm text-slate-700 ring-1 ring-inset ring-slate-200"
            key={id}
            title={getKnowledgeBreadcrumb(id)}
          >
            {getKnowledgeLabel(id)}
          </span>
        ))}
      </span>
    </KnowledgeReveal>
  );
}

export default async function ProblemDetailPage({ params, searchParams }: ProblemDetailPageProps) {
  const [{ id }, query] = await Promise.all([
    params,
    searchParams ?? Promise.resolve<{ saved?: string }>({}),
  ]);
  let problem: ProblemFile | null;

  try {
    problem = await loadProblem(id);
  } catch (error) {
    if (error instanceof ProblemDataError) {
      return <DataError error={error} />;
    }

    throw error;
  }

  if (!problem) {
    notFound();
  }

  const { frontmatter, content } = problem;
  const today = toLocalDateOnly(new Date());

  return (
    <article className="mx-auto max-w-5xl">
      <Link
        className="text-sm font-medium text-slate-600 hover:text-sky-800 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
        href="/problems"
      >
        ← 返回题目库
      </Link>

      {query.saved === "created" || query.saved === "updated" ? (
        <div aria-live="polite" className="mt-5 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800" role="status">
          {query.saved === "created" ? "题目已创建并写入 Markdown。" : "题目修改已保存。"}
        </div>
      ) : null}

      <header className="mt-6 border-b border-slate-200 pb-8">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={frontmatter.status} />
          <span className="text-sm font-medium text-slate-500">
            {frontmatter.platform}
          </span>
          {frontmatter.rating != null ? (
            <span className="font-mono text-sm text-slate-500">
              难度 {frontmatter.rating}
            </span>
          ) : null}
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
          {frontmatter.title}
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          {[frontmatter.contest, frontmatter.problem].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {frontmatter.url ? (
            <a
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:border-sky-400 hover:text-sky-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
              href={frontmatter.url}
              rel="noreferrer"
              target="_blank"
            >
              打开原题 <span aria-hidden="true">↗</span>
            </a>
          ) : null}
          <Link className="inline-flex rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-800" href={`/problems/${frontmatter.id}/edit`}>
            编辑题目
          </Link>
        </div>
      </header>

      <div className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 space-y-10">
          <section aria-labelledby="retrospective-title">
            <h2 className="sr-only" id="retrospective-title">
              题目复盘
            </h2>
            <div>
              <MarkdownContent content={content} />
            </div>
            {frontmatter.solutionLanguage != null &&
            frontmatter.solutionCode != null ? (
              <section
                aria-labelledby="ac-solution-title"
                className="mt-8 min-w-0 max-w-full border-t border-slate-200 pt-6"
              >
                <h3
                  className="text-lg font-semibold text-slate-950"
                  id="ac-solution-title"
                >
                  AC 代码
                </h3>
                <details className="mt-4 min-w-0 max-w-full">
                  <summary className="cursor-pointer text-sm font-semibold text-sky-800 hover:text-sky-700 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700">
                    查看 AC 代码
                  </summary>
                  <div className="mt-4 min-w-0 max-w-full">
                    <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
                      {frontmatter.solutionLanguage}
                    </span>
                    <SolutionCodeBlock
                      code={frontmatter.solutionCode}
                      language={frontmatter.solutionLanguage}
                    />
                  </div>
                </details>
              </section>
            ) : null}
          </section>

          <section aria-labelledby="review-history-title" className="border-t border-slate-200 pt-8">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-xl font-semibold text-slate-950" id="review-history-title">
                复习记录
              </h2>
              <span className="text-sm text-slate-500">
                {frontmatter.reviews.length} 次记录
              </span>
            </div>

            {frontmatter.reviews.length === 0 ? (
              <p className="mt-4 border-l-4 border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                暂无复习记录。
              </p>
            ) : (
              <ol className="mt-5 space-y-4">
                {frontmatter.reviews.map((review, index) => (
                  <li className="border-l-2 border-sky-200 pl-4" key={`${review.date}-${index}`}>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <time className="font-mono text-xs text-slate-500">{review.date}</time>
                      <StatusBadge status={review.fromStatus} />
                      <span aria-hidden="true" className="text-slate-400">
                        →
                      </span>
                      <StatusBadge status={review.toStatus} />
                      {review.durationMinutes != null ? (
                        <span className="text-slate-500">{review.durationMinutes} 分钟</span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{review.note}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      下一间隔：
                      {review.nextIntervalDays != null
                        ? `${review.nextIntervalDays} 天`
                        : "不再安排"}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="space-y-7 lg:border-l lg:border-slate-200 lg:pl-7">
          <section aria-labelledby="training-title">
            <h2 className="text-sm font-semibold text-slate-950" id="training-title">
              训练信息
            </h2>
            <dl className="mt-3 divide-y divide-slate-200 border-y border-slate-200 text-sm">
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-slate-500">首次训练</dt>
                <dd className="font-mono text-xs text-slate-800">{frontmatter.solvedAt}</dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-slate-500">首次用时</dt>
                <dd className="text-slate-800">
                  {frontmatter.durationMinutes != null
                    ? `${frontmatter.durationMinutes} 分钟`
                    : "未填写"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-3">
                <dt className="text-slate-500">当前状态</dt>
                <dd>
                  <StatusBadge status={frontmatter.status} />
                </dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="knowledge-title">
            <h2 className="text-sm font-semibold text-slate-950" id="knowledge-title">
              知识点
            </h2>
            <div className="mt-3">
              <KnowledgeDetailTags ids={frontmatter.knowledge} />
            </div>
            <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              标签
            </h3>
            <div className="mt-2">
              <DetailTags values={frontmatter.tags} />
            </div>
          </section>

          <section aria-labelledby="review-title">
            <h2 className="text-sm font-semibold text-slate-950" id="review-title">
              复习
            </h2>
            <div className="mt-3 border-y border-slate-200 py-3 text-sm">
              <ReviewDate date={frontmatter.nextReviewDate} today={today} />
              {frontmatter.reviewIntervalDays != null ? (
                <p className="mt-2 text-xs text-slate-500">
                  当前间隔 {frontmatter.reviewIntervalDays} 天
                </p>
              ) : null}
            </div>
            <Link
              className="mt-3 inline-flex rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-800"
              href={`/review/${frontmatter.id}`}
            >
              完成复习
            </Link>
          </section>
        </aside>
      </div>
    </article>
  );
}
