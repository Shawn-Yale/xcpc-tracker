import type { Metadata } from "next";
import Link from "next/link";

import { LoadErrorSummary } from "@/components/problems/load-error-summary";
import { ProblemFilters } from "@/components/problems/problem-filters";
import { ProblemList } from "@/components/problems/problem-list";
import { toLocalDateOnly } from "@/lib/date/local-date";
import { parseProblemQuery, queryProblems } from "@/lib/problems/query";
import { createProblemRepository } from "@/lib/problems/repository";

export const metadata: Metadata = { title: "Problems" };
export const dynamic = "force-dynamic";

type ProblemsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProblemsPage({ searchParams }: ProblemsPageProps) {
  const repository = createProblemRepository();
  const [{ problems, errors }, parameters] = await Promise.all([
    repository.loadAll(),
    searchParams,
  ]);
  const today = toLocalDateOnly(new Date());
  const query = parseProblemQuery(parameters);
  const visibleProblems = queryProblems(problems, query, today);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
            Problem library
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            题目库
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            集中浏览训练记录，快速定位尚未掌握、需要重做或属于特定知识点的题目。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-baseline gap-2 text-slate-600">
            <span className="font-mono text-2xl font-semibold text-slate-950 tabular-nums">
              {visibleProblems.length}
            </span>
            <span className="text-sm">当前结果 / 共 {problems.length} 题</span>
          </div>
          <Link
            className="inline-flex rounded-md bg-sky-800 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
            href="/problems/new"
          >
            新增题目
          </Link>
        </div>
      </header>

      <LoadErrorSummary errors={errors} />

      {query.knowledge.state === "invalid" ? (
        <section className="border border-rose-200 bg-rose-50 px-5 py-4" role="alert">
          <h2 className="font-semibold text-rose-900">Invalid / unknown knowledge filter</h2>
          <p className="mt-1 text-sm text-rose-800">
            无法识别筛选值：<code>{query.knowledge.rawValue || "(empty)"}</code>
          </p>
          <Link className="mt-3 inline-flex text-sm font-semibold text-rose-900 underline" href="/problems">
            清除筛选
          </Link>
        </section>
      ) : null}

      {query.knowledge.state === "invalid" ? null : problems.length === 0 ? (
        <section className="border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-slate-900">暂时没有题目</h2>
          <p className="mt-2 text-sm text-slate-600">
            创建第一道题目后，符合 Schema 的 Markdown 文件会出现在 data/problems。
          </p>
          <Link className="mt-5 inline-flex rounded-md bg-sky-800 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700" href="/problems/new">新增题目</Link>
        </section>
      ) : (
        <section aria-labelledby="problem-results" className="overflow-hidden border border-slate-200 shadow-sm">
          <h2 className="sr-only" id="problem-results">
            题目筛选结果
          </h2>
          <ProblemFilters query={query} />

          {visibleProblems.length > 0 ? (
            <ProblemList problems={visibleProblems} today={today} />
          ) : (
            <div className="bg-white px-6 py-16 text-center">
              <h3 className="text-lg font-semibold text-slate-900">没有匹配的题目</h3>
              <p className="mt-2 text-sm text-slate-600">
                尝试缩短搜索词，或清除部分筛选条件。
              </p>
              <Link
                className="mt-5 inline-flex rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
                href="/problems"
              >
                清除全部条件
              </Link>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
