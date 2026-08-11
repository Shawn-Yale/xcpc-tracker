import { describe, expect, it } from "vitest";

import { knowledgeCatalog } from "@/config/knowledge-taxonomy";
import { getKnowledgeEntry } from "@/lib/knowledge/catalog";
import { getKnowledgeFilterOptions } from "@/components/problems/knowledge-filter-combobox";

describe("Knowledge filter combobox search", () => {
  it("shows only all Knowledge and the ten Domains for an empty search", () => {
    const options = getKnowledgeFilterOptions("");
    expect(options).toHaveLength(11);
    expect(options[0]).toEqual({ id: "", label: "全部知识点" });
    expect(options.slice(1).every((option) =>
      getKnowledgeEntry(knowledgeCatalog, option.id)?.depth === 1,
    )).toBe(true);
  });

  it.each([
    ["最短", "graph.shortest-path.dijkstra"],
    ["GRAPH.SHORTEST-PATH.DIJKSTRA", "graph.shortest-path.dijkstra"],
    ["图论 dijkstra", "graph.shortest-path.dijkstra"],
  ])("matches name, ID, and breadcrumb tokens for %s", (search, expectedId) => {
    expect(getKnowledgeFilterOptions(search).map((option) => option.id))
      .toContain(expectedId);
  });

  it("includes a non-selectable parent as a valid filter option", () => {
    const parent = getKnowledgeEntry(knowledgeCatalog, "data-structure.range-query");
    expect(parent?.selectable).toBe(false);
    expect(getKnowledgeFilterOptions("区间查询结构")).toContainEqual({
      id: parent?.id,
      label: "数据结构 / 区间查询结构",
    });
  });

  it("returns an empty result for an unmatched search", () => {
    expect(getKnowledgeFilterOptions("definitely-no-such-knowledge-node")).toEqual([]);
  });
});
