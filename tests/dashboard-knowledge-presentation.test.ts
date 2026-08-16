import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { BacklogList } from "@/components/dashboard/backlog-list";
import { RecentSolvedList } from "@/components/dashboard/recent-solved-list";
import { dateOnlySchema } from "@/lib/date/date-only";
import { getKnowledgeBreadcrumb } from "@/lib/knowledge/presentation";
import { problemFrontmatterSchema } from "@/lib/problems/schema";
import type { ProblemFile } from "@/lib/problems/types";

const problem: ProblemFile = {
  frontmatter: problemFrontmatterSchema.parse({
    id: "dashboard-taxonomy-labels",
    title: "Dashboard taxonomy labels",
    platform: "Codeforces",
    solvedAt: "2026-08-12",
    status: "D",
    knowledge: [
      "data-structure.range-query.fenwick-tree",
      "data-structure.range-query.segment-tree",
    ],
    tags: [],
    reviews: [],
  }),
  content: "",
  fileName: "dashboard-taxonomy-labels.md",
};
const [fenwickTree, segmentTree] = problem.frontmatter.knowledge;

function expectLeafLabelsOnly(markup: string): void {
  expect(markup).toContain("树状数组");
  expect(markup).toContain("线段树");
  expect(markup).not.toContain("数据结构 / 区间查询结构 / 树状数组");
  expect(markup).not.toContain("数据结构 / 区间查询结构 / 线段树");
}

describe("dashboard knowledge presentation", () => {
  it("keeps Backlog problem, proficiency, scheduling, and leaf labels visible", () => {
    const markup = renderToStaticMarkup(
      createElement(BacklogList, {
        problems: [problem],
        today: dateOnlySchema.parse("2026-08-12"),
      }),
    );

    expectLeafLabelsOnly(markup);
    expect(markup).toContain('href="/problems/dashboard-taxonomy-labels"');
    expect(markup).toContain('aria-label="状态 D"');
    expect(markup).toContain("未安排");
  });

  it("keeps Recent Solved metadata, proficiency, href, and leaf labels visible", () => {
    const markup = renderToStaticMarkup(
      createElement(RecentSolvedList, { problems: [problem] }),
    );

    expectLeafLabelsOnly(markup);
    expect(markup).toContain('href="/problems/dashboard-taxonomy-labels"');
    expect(markup).toContain('aria-label="状态 D"');
    expect(markup).toContain('<time class="font-mono" dateTime="2026-08-12">2026-08-12</time>');
    expect(markup).toContain("Codeforces");
  });

  it("keeps the secondary lists' empty states concise", () => {
    const recentMarkup = renderToStaticMarkup(
      createElement(RecentSolvedList, { problems: [] }),
    );
    const backlogMarkup = renderToStaticMarkup(
      createElement(BacklogList, {
        problems: [],
        today: dateOnlySchema.parse("2026-08-12"),
      }),
    );

    expect(recentMarkup).toContain("还没有训练记录。");
    expect(backlogMarkup).toContain("当前没有 C/D 待加强题目");
    expect(backlogMarkup).toContain("所有题目都已进入 A/B 掌握池，保持节奏即可。");
  });

  it("keeps the full taxonomy path available for hierarchical views", () => {
    expect(getKnowledgeBreadcrumb(fenwickTree)).toBe(
      "数据结构 / 区间查询结构 / 树状数组",
    );
    expect(getKnowledgeBreadcrumb(segmentTree)).toBe(
      "数据结构 / 区间查询结构 / 线段树",
    );
  });
});
