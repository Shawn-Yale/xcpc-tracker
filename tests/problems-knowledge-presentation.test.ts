import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProblemList } from "@/components/problems/problem-list";
import { knowledgeCatalog } from "@/config/knowledge-taxonomy";
import { dateOnlySchema } from "@/lib/date/date-only";
import { getKnowledgeEntry } from "@/lib/knowledge/catalog";
import { problemFrontmatterSchema } from "@/lib/problems/schema";
import type { ProblemFile } from "@/lib/problems/types";

const selectableTopicId = "algorithmic-techniques.binary-search";

const problem: ProblemFile = {
  frontmatter: problemFrontmatterSchema.parse({
    id: "problems-knowledge-labels",
    title: "Problems knowledge labels",
    platform: "Codeforces",
    solvedAt: "2026-08-12",
    status: "C",
    knowledge: [
      "data-structure.range-query.segment-tree",
      selectableTopicId,
      "data-structure.range-query.fenwick-tree",
    ],
    tags: [],
    reviews: [],
  }),
  content: "",
  fileName: "problems-knowledge-labels.md",
};

function extractBetween(markup: string, start: string, end: string): string {
  const startIndex = markup.indexOf(start);
  const endIndex = markup.indexOf(end, startIndex);

  expect(startIndex).toBeGreaterThanOrEqual(0);
  expect(endIndex).toBeGreaterThan(startIndex);
  return markup.slice(startIndex, endIndex + end.length);
}

function expectSummaryKnowledgePresentation(markup: string): void {
  const segmentTreeIndex = markup.indexOf(">线段树</span>");
  const binarySearchIndex = markup.indexOf(">二分</span>");
  const fenwickTreeIndex = markup.indexOf(">树状数组</span>");

  expect(segmentTreeIndex).toBeGreaterThanOrEqual(0);
  expect(binarySearchIndex).toBeGreaterThan(segmentTreeIndex);
  expect(fenwickTreeIndex).toBeGreaterThan(binarySearchIndex);
  expect(markup).not.toContain(">数据结构 / 区间查询结构 / 线段树</span>");
  expect(markup).not.toContain(">通用算法技巧 / 二分</span>");
  expect(markup).not.toContain(">数据结构 / 区间查询结构 / 树状数组</span>");
  expect(markup).toContain(
    'title="数据结构 / 区间查询结构 / 线段树">线段树</span>',
  );
  expect(markup).toContain('title="通用算法技巧 / 二分">二分</span>');
  expect(markup).toContain(
    'title="数据结构 / 区间查询结构 / 树状数组">树状数组</span>',
  );
}

describe("Problems knowledge presentation", () => {
  it("uses the shared summary contract in both desktop and mobile layouts", () => {
    const topic = getKnowledgeEntry(knowledgeCatalog, selectableTopicId);
    expect(topic?.selectable).toBe(true);
    expect(
      knowledgeCatalog.entries.some((entry) => entry.parentId === topic?.id),
    ).toBe(true);

    const markup = renderToStaticMarkup(
      createElement(ProblemList, {
        problems: [problem],
        today: dateOnlySchema.parse("2026-08-13"),
      }),
    );
    const desktopMarkup = extractBetween(markup, "<table", "</table>");
    const mobileMarkup = extractBetween(markup, "<ul", "</ul>");

    expectSummaryKnowledgePresentation(desktopMarkup);
    expectSummaryKnowledgePresentation(mobileMarkup);
  });
});
