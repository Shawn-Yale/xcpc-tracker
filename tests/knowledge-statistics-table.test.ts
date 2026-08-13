import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { KnowledgeStatisticsTable } from "@/components/statistics/knowledge-statistics-table";
import { knowledgeCatalog } from "@/config/knowledge-taxonomy";
import type {
  KnowledgeStats,
  ProblemStats,
} from "@/lib/statistics/problem-stats";

const emptyStats: ProblemStats = {
  total: 0,
  statusCounts: { A: 0, B: 0, C: 0, D: 0 },
  mastered: 0,
  masteryRate: 0,
};

function makeRows(
  overrides: ReadonlyMap<string, ProblemStats> = new Map(),
): KnowledgeStats[] {
  return knowledgeCatalog.entries.map((entry) => ({
    id: entry.id,
    direct: emptyStats,
    rollup: overrides.get(entry.id) ?? emptyStats,
  }));
}

describe("KnowledgeStatisticsTable initial presentation", () => {
  it("shows an empty state instead of an empty table for the default filter", () => {
    const markup = renderToStaticMarkup(
      createElement(KnowledgeStatisticsTable, { rows: makeRows() }),
    );

    expect(markup).toContain("当前筛选下暂无分类记录。");
    expect(markup).not.toContain("<table");
  });

  it("marks a retained ancestor without presenting it as a filter match", () => {
    const masteredStats: ProblemStats = {
      total: 1,
      statusCounts: { A: 1, B: 0, C: 0, D: 0 },
      mastered: 1,
      masteryRate: 100,
    };
    const markup = renderToStaticMarkup(
      createElement(KnowledgeStatisticsTable, {
        rows: makeRows(new Map([
          ["graph.shortest-path.dijkstra", masteredStats],
        ])),
      }),
    );

    expect(markup).toContain("图论");
    expect(markup).toContain("含匹配子项");
  });

  it("renders accessible Direct and Rollup explanation triggers", () => {
    const trainedStats: ProblemStats = {
      total: 1,
      statusCounts: { A: 1, B: 0, C: 0, D: 0 },
      mastered: 1,
      masteryRate: 100,
    };
    const markup = renderToStaticMarkup(
      createElement(KnowledgeStatisticsTable, {
        rows: makeRows(new Map([["graph", trainedStats]])),
      }),
    );

    expect(markup).toContain('aria-label="说明 Direct"');
    expect(markup).toContain('aria-label="说明 Rollup"');
    expect(markup.match(/aria-expanded="false"/g)).toHaveLength(2);
  });
});
