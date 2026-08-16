import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { KnowledgeNavigationCard } from "@/components/knowledge/knowledge-navigation-card";
import { LoadErrorSummary } from "@/components/problems/load-error-summary";
import { ProblemList } from "@/components/problems/problem-list";
import { StatsStrip } from "@/components/statistics/stats-strip";
import { knowledgeCatalog } from "@/config/knowledge-taxonomy";
import { toLocalDateOnly } from "@/lib/date/local-date";
import { getKnowledgeEntry } from "@/lib/knowledge/catalog";
import { getKnowledgeHref, resolveKnowledgePath } from "@/lib/knowledge/routing";
import { queryProblems, type ProblemQuery } from "@/lib/problems/query";
import { createProblemRepository } from "@/lib/problems/repository";
import { getKnowledgeStats } from "@/lib/statistics/problem-stats";

export const dynamic = "force-dynamic";

type KnowledgeNodePageProps = { params: Promise<{ segments: string[] }> };

export async function generateMetadata({ params }: KnowledgeNodePageProps): Promise<Metadata> {
  const entry = resolveKnowledgePath(knowledgeCatalog, (await params).segments);
  return { title: entry?.name ?? "找不到知识点" };
}

export default async function KnowledgeNodePage({ params }: KnowledgeNodePageProps) {
  const entry = resolveKnowledgePath(knowledgeCatalog, (await params).segments);
  if (!entry) notFound();

  const { problems, errors } = await createProblemRepository().loadAll();
  const today = toLocalDateOnly(new Date());
  const query: ProblemQuery = {
    search: "", status: "all", knowledge: { state: "valid", id: entry.id },
    platform: "all", review: "all", sort: "solvedAt", direction: "desc",
  };
  const visibleProblems = queryProblems(problems, query, today);
  const statsByKnowledge = new Map(
    getKnowledgeStats(problems).map((item) => [item.id, item]),
  );
  const stats = statsByKnowledge.get(entry.id)!;
  const children = knowledgeCatalog.entries.filter((item) => item.parentId === entry.id);
  const isParent = children.length > 0;
  const breadcrumbEntries = [...entry.ancestorIds, entry.id]
    .map((id) => getKnowledgeEntry(knowledgeCatalog, id))
    .filter((item) => item !== undefined);

  return (
    <div className="space-y-8">
      <nav aria-label="知识点层级" className="flex flex-wrap gap-2 text-sm text-slate-600">
        <Link className="hover:text-sky-800 hover:underline" href="/knowledge">知识</Link>
        {breadcrumbEntries.map((item) => <span key={item.id}>/ <Link className="hover:text-sky-800 hover:underline" href={getKnowledgeHref(item.id)}>{item.name}</Link></span>)}
      </nav>
      <header>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{entry.name}</h1>
        {entry.description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{entry.description}</p> : null}
      </header>
      <LoadErrorSummary errors={errors} />
      <section aria-labelledby="training-overview-title">
        <h2 className="text-xl font-semibold text-slate-950" id="training-overview-title">训练概览</h2>
        <div className="mt-4"><StatsStrip stats={isParent ? stats.rollup : stats.direct} /></div>
        {isParent ? (
          <p className="mt-3 text-sm text-slate-600">
            直接归类 {stats.direct.total} 题；以上统计包含当前知识点及其下级知识点。
          </p>
        ) : null}
      </section>
      {isParent ? (
        <section aria-labelledby="children-title">
          <h2 className="text-xl font-semibold text-slate-950" id="children-title">
            下级知识点 · {children.length}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => (
              <KnowledgeNavigationCard
                href={getKnowledgeHref(child.id)}
                key={child.id}
                problemCount={statsByKnowledge.get(child.id)!.rollup.total}
                title={child.name}
              />
            ))}
          </div>
        </section>
      ) : null}
      <section aria-labelledby="knowledge-problems-title">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div><h2 className="text-xl font-semibold text-slate-950" id="knowledge-problems-title">题目</h2><p className="mt-1 text-sm text-slate-500">{isParent ? "当前知识点及其下级知识点" : "当前知识点"}，共 {visibleProblems.length} 题</p></div>
          <Link className="text-sm font-semibold text-sky-800 hover:underline" href={`/problems?knowledge=${encodeURIComponent(entry.id)}`}>在题目库中筛选</Link>
        </div>
        {visibleProblems.length > 0 ? <div className="mt-5 overflow-hidden border border-slate-200"><ProblemList problems={visibleProblems} today={today} /></div> : <p className="mt-5 border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-600">这个知识范围暂无题目。</p>}
      </section>
    </div>
  );
}
