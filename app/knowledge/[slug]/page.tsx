import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LoadErrorSummary } from "@/components/problems/load-error-summary";
import { ProblemList } from "@/components/problems/problem-list";
import { StatsStrip } from "@/components/statistics/stats-strip";
import { categoryMetadata, getCategoryBySlug } from "@/config/categories";
import { toLocalDateOnly } from "@/lib/date/local-date";
import { parseProblemQuery, queryProblems } from "@/lib/problems/query";
import { createProblemRepository } from "@/lib/problems/repository";
import { getProblemStats, getTagCounts } from "@/lib/statistics/problem-stats";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tag?: string | string[] }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  return { title: category ?? "Knowledge category not found" };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const [{ slug }, queryParameters] = await Promise.all([params, searchParams]);
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const { problems, errors } = await createProblemRepository().loadAll();
  const today = toLocalDateOnly(new Date());
  const categoryProblems = queryProblems(
    problems,
    { ...parseProblemQuery({}), category },
    today,
  );
  const stats = getProblemStats(categoryProblems);
  const tags = getTagCounts(categoryProblems);
  const requestedTag = Array.isArray(queryParameters.tag)
    ? queryParameters.tag[0]
    : queryParameters.tag;
  const visibleProblems = requestedTag
    ? categoryProblems.filter((problem) => problem.frontmatter.tags.includes(requestedTag))
    : categoryProblems;

  return (
    <div className="space-y-7">
      <Link
        className="text-sm font-medium text-slate-600 hover:text-sky-800 hover:underline"
        href="/knowledge"
      >
        ← 返回知识分类
      </Link>

      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
          Knowledge category
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {category}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          {categoryMetadata[category].description}
        </p>
      </header>

      <LoadErrorSummary errors={errors} />
      <StatsStrip stats={stats} />

      <section aria-labelledby="tag-title" className="border-y border-slate-200 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-950" id="tag-title">
              Tags
            </h2>
            <p className="mt-1 text-xs text-slate-500">选择一个具体算法或技巧继续缩小范围。</p>
          </div>
          {requestedTag ? (
            <Link
              className="text-sm font-medium text-sky-800 hover:underline"
              href={`/knowledge/${slug}`}
            >
              清除 Tag 筛选
            </Link>
          ) : null}
        </div>

        {tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map(({ tag, count }) => {
              const active = tag === requestedTag;
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "rounded-md bg-slate-950 px-3 py-1.5 text-sm font-semibold text-white"
                      : "rounded-md bg-white px-3 py-1.5 text-sm text-slate-700 ring-1 ring-inset ring-slate-300 hover:text-sky-800 hover:ring-sky-400"
                  }
                  href={{ pathname: `/knowledge/${slug}`, query: { tag } }}
                  key={tag}
                >
                  {tag} <span className={active ? "text-slate-300" : "text-slate-400"}>{count}</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">这个分类下暂时没有 Tags。</p>
        )}
      </section>

      <section aria-labelledby="category-problems-title">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950" id="category-problems-title">
              {requestedTag ? `Tag：${requestedTag}` : "全部题目"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">共 {visibleProblems.length} 道题</p>
          </div>
        </div>

        {visibleProblems.length > 0 ? (
          <div className="mt-5 overflow-hidden border border-slate-200 shadow-sm">
            <ProblemList problems={visibleProblems} today={today} />
          </div>
        ) : (
          <div className="mt-5 border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <h3 className="font-semibold text-slate-900">这个范围暂无题目</h3>
            <p className="mt-2 text-sm text-slate-600">
              {requestedTag ? "清除 Tag 筛选查看该分类全部题目。" : "记录新题后会显示在这里。"}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
