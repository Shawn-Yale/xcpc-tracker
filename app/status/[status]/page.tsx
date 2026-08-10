import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { KnowledgeGapList } from "@/components/problems/knowledge-gap-list";
import { LoadErrorSummary } from "@/components/problems/load-error-summary";
import { ProblemList } from "@/components/problems/problem-list";
import { StatusBadge } from "@/components/problems/status-badge";
import { StatsStrip } from "@/components/statistics/stats-strip";
import { statusMetadata, statusValues, type Status } from "@/config/status";
import { toLocalDateOnly } from "@/lib/date/local-date";
import { parseProblemQuery, queryProblems } from "@/lib/problems/query";
import { createProblemRepository } from "@/lib/problems/repository";
import { isOverdue } from "@/lib/review/rules";
import { getProblemStats } from "@/lib/statistics/problem-stats";

export const dynamic = "force-dynamic";

type StatusPoolPageProps = {
  params: Promise<{ status: string }>;
};

function parseStatus(value: string): Status | undefined {
  return statusValues.find((status) => status === value);
}

export async function generateMetadata({ params }: StatusPoolPageProps): Promise<Metadata> {
  const { status: value } = await params;
  const status = parseStatus(value);
  return { title: status ? `Status ${status}` : "Status not found" };
}

export default async function StatusPoolPage({ params }: StatusPoolPageProps) {
  const { status: value } = await params;
  const status = parseStatus(value);

  if (!status) {
    notFound();
  }

  const { problems, errors } = await createProblemRepository().loadAll();
  const today = toLocalDateOnly(new Date());
  const statusProblems = queryProblems(
    problems,
    { ...parseProblemQuery({}), status },
    today,
  );
  const stats = getProblemStats(statusProblems);
  const unscheduledCount = statusProblems.filter(
    (problem) => problem.frontmatter.nextReviewDate == null,
  ).length;
  const overdueCount = statusProblems.filter((problem) =>
    isOverdue(problem.frontmatter.nextReviewDate, today),
  ).length;

  return (
    <div className="space-y-7">
      <Link
        className="text-sm font-medium text-slate-600 hover:text-sky-800 hover:underline"
        href="/status"
      >
        ← 返回掌握状态
      </Link>

      <header>
        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
            Status pool
          </p>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Status {status}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          {statusMetadata[status].meaning}
        </p>
      </header>

      <LoadErrorSummary errors={errors} />
      <StatsStrip stats={stats} />

      {status === "C" ? (
        <section className="grid gap-3 sm:grid-cols-2" aria-label="C 状态 Review 提示">
          <div className="border-l-4 border-amber-400 bg-amber-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
              未安排 Review
            </p>
            <p className="mt-1 font-mono text-2xl font-semibold text-amber-950">
              {unscheduledCount}
            </p>
          </div>
          <div className="border-l-4 border-rose-400 bg-rose-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-800">
              已逾期
            </p>
            <p className="mt-1 font-mono text-2xl font-semibold text-rose-950">
              {overdueCount}
            </p>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="status-problems-title">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-950" id="status-problems-title">
            题目列表
          </h2>
          <span className="text-sm text-slate-500">{statusProblems.length} 道题</span>
        </div>

        {statusProblems.length === 0 ? (
          <div className="mt-5 border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <h3 className="font-semibold text-slate-900">这个状态暂无题目</h3>
            <p className="mt-2 text-sm text-slate-600">后续训练记录会自动汇总到这里。</p>
          </div>
        ) : status === "D" ? (
          <div className="mt-5">
            <KnowledgeGapList problems={statusProblems} today={today} />
          </div>
        ) : (
          <div className="mt-5 overflow-hidden border border-slate-200 shadow-sm">
            <ProblemList
              emphasizeMissingReview={status === "C"}
              problems={statusProblems}
              today={today}
            />
          </div>
        )}
      </section>
    </div>
  );
}
