import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ReviewTaskList } from "@/components/review/review-task-list";
import { dateOnlySchema } from "@/lib/date/date-only";
import { problemFrontmatterSchema } from "@/lib/problems/schema";
import type { ProblemFile } from "@/lib/problems/types";

function reviewProblem(knowledge: readonly string[]): ProblemFile {
  return {
    frontmatter: problemFrontmatterSchema.parse({
      id: "review-knowledge-labels",
      title: "Review knowledge labels",
      platform: "Codeforces",
      solvedAt: "2026-08-12",
      status: "C",
      knowledge,
      tags: [],
      reviews: [],
      nextReviewDate: "2026-08-13",
      reviewIntervalDays: 1,
    }),
    content: "",
    fileName: "review-knowledge-labels.md",
  };
}

function renderReviewTaskList(knowledge: readonly string[]): string {
  return renderToStaticMarkup(
    createElement(ReviewTaskList, {
      emptyMessage: "No review tasks.",
      problems: [reviewProblem(knowledge)],
      today: dateOnlySchema.parse("2026-08-13"),
    }),
  );
}

describe("review knowledge presentation", () => {
  it("shows selected Knowledge names in selection order without breadcrumbs", () => {
    const markup = renderReviewTaskList([
      "data-structure.range-query.segment-tree",
      "data-structure.range-query.fenwick-tree",
    ]);

    expect(markup).toContain("线段树 · 树状数组");
    expect(markup).not.toContain("数据结构 / 区间查询结构 / 线段树");
    expect(markup).not.toContain("数据结构 / 区间查询结构 / 树状数组");
  });

  it("shows the own name of a selectable non-leaf Topic", () => {
    const markup = renderReviewTaskList([
      "algorithmic-techniques.binary-search",
    ]);

    expect(markup).toContain("二分");
    expect(markup).not.toContain("通用算法技巧 / 二分");
  });

  it("keeps the Problem detail and Review action link targets", () => {
    const markup = renderReviewTaskList([
      "data-structure.range-query.fenwick-tree",
    ]);

    expect(markup).toContain('href="/problems/review-knowledge-labels"');
    expect(markup).toContain('href="/review/review-knowledge-labels"');
  });
});
