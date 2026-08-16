"use client";

import Link from "next/link";
import { useState } from "react";

import { platformValues } from "@/config/platforms";
import { statusValues } from "@/config/status";
import type { KnowledgeId } from "@/lib/knowledge/types";
import type { ProblemQuery } from "@/lib/problems/query";

import { KnowledgeFilterCombobox } from "./knowledge-filter-combobox";

const fieldClassName =
  "mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15";

export function ProblemFilters({ query }: { query: ProblemQuery }) {
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [knowledge, setKnowledge] = useState<KnowledgeId | "">(
    query.knowledge.state === "valid" ? query.knowledge.id : "",
  );
  const adjustedConditionCount = [
    query.search !== "",
    query.status !== "all",
    query.knowledge.state === "valid",
    query.platform !== "all",
    query.review !== "all",
    query.sort !== "solvedAt",
    query.direction !== "desc",
  ].filter(Boolean).length;

  return (
    <form
      action="/problems"
      className="border-y border-slate-200 bg-white"
      method="get"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 lg:hidden">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">筛选与排序</p>
          <p className="mt-0.5 text-xs leading-5 text-slate-500">
            {adjustedConditionCount > 0
              ? `已调整 ${adjustedConditionCount} 项条件`
              : "按状态、知识点等缩小结果"}
          </p>
        </div>
        <button
          aria-controls="problem-filter-controls"
          aria-expanded={filtersExpanded}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          onClick={() => setFiltersExpanded((expanded) => !expanded)}
          type="button"
        >
          {filtersExpanded ? "收起筛选" : "展开筛选"}
        </button>
      </div>

      <div
        className={`${filtersExpanded ? "grid" : "hidden"} gap-4 border-t border-slate-200 px-4 py-5 sm:grid-cols-2 sm:px-5 lg:grid lg:grid-cols-4 lg:border-t-0 xl:grid-cols-6`}
        id="problem-filter-controls"
      >
        <label className="sm:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            搜索
          </span>
          <input
            className={fieldClassName}
            defaultValue={query.search}
            name="search"
            placeholder="题名、比赛、题号或标签"
            type="search"
          />
        </label>

        <label>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            状态
          </span>
          <select className={fieldClassName} defaultValue={query.status} name="status">
            <option value="all">全部状态</option>
            {statusValues.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            知识点
          </span>
          <KnowledgeFilterCombobox onChange={setKnowledge} value={knowledge} />
        </div>

        <label>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            平台
          </span>
          <select
            className={fieldClassName}
            defaultValue={query.platform}
            name="platform"
          >
            <option value="all">全部平台</option>
            {platformValues.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            复习
          </span>
          <select className={fieldClassName} defaultValue={query.review} name="review">
            <option value="all">全部复习</option>
            <option value="due">已到期</option>
            <option value="overdue">已逾期</option>
            <option value="scheduled">未来已安排</option>
            <option value="none">未安排</option>
          </select>
        </label>

        <label>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            排序字段
          </span>
          <select className={fieldClassName} defaultValue={query.sort} name="sort">
            <option value="solvedAt">首次训练日期</option>
            <option value="rating">难度</option>
            <option value="nextReviewDate">下次复习</option>
          </select>
        </label>

        <label>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            排序方向
          </span>
          <select
            className={fieldClassName}
            defaultValue={query.direction}
            name="direction"
          >
            <option value="desc">降序</option>
            <option value="asc">升序</option>
          </select>
        </label>

        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1 xl:col-span-2">
          <button
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
            type="submit"
          >
            应用筛选
          </button>
          <Link
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700"
            href="/problems"
          >
            重置
          </Link>
        </div>
      </div>
    </form>
  );
}
