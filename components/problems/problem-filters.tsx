"use client";

import Link from "next/link";
import { useState } from "react";

import { knowledgeCatalog } from "@/config/knowledge-taxonomy";
import { platformValues } from "@/config/platforms";
import { statusValues } from "@/config/status";
import type { ProblemQuery } from "@/lib/problems/query";
import { getKnowledgeBreadcrumb } from "@/lib/knowledge/presentation";

const fieldClassName =
  "mt-1.5 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15";

export function ProblemFilters({ query }: { query: ProblemQuery }) {
  const [knowledge, setKnowledge] = useState(
    query.knowledge.state === "valid" ? query.knowledge.id : "",
  );
  return (
    <form
      action="/problems"
      className="border-y border-slate-200 bg-white px-4 py-5 sm:px-5"
      method="get"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
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

        <label>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            知识点
          </span>
          <select
            className={fieldClassName}
            name={knowledge === "" ? undefined : "knowledge"}
            onChange={(event) => setKnowledge(event.target.value)}
            value={knowledge}
          >
            <option value="">全部知识点</option>
            {knowledgeCatalog.entries.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {getKnowledgeBreadcrumb(entry.id)}
              </option>
            ))}
          </select>
        </label>

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
            Review
          </span>
          <select className={fieldClassName} defaultValue={query.review} name="review">
            <option value="all">全部 Review</option>
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
            <option value="rating">Rating</option>
            <option value="nextReviewDate">下次 Review</option>
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
