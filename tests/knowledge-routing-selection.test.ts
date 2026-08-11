import { describe, expect, it } from "vitest";

import { getKnowledgeEntry } from "@/lib/knowledge/catalog";
import {
  getKnowledgeHref,
  resolveKnowledgePath,
} from "@/lib/knowledge/routing";
import { validateKnowledgeSelection } from "@/lib/knowledge/selection";

import { knowledgeCatalogFixture } from "./fixtures/knowledge-taxonomy";

describe("knowledge routing primitives", () => {
  it("round-trips a KnowledgeId through URL segments", () => {
    const dijkstra = getKnowledgeEntry(
      knowledgeCatalogFixture,
      "graph.shortest-path.dijkstra",
    );
    expect(dijkstra).toBeDefined();
    expect(getKnowledgeHref(dijkstra!.id)).toBe(
      "/knowledge/graph/shortest-path/dijkstra",
    );
    expect(
      resolveKnowledgePath(knowledgeCatalogFixture, [
        "graph",
        "shortest-path",
        "dijkstra",
      ])?.id,
    ).toBe(dijkstra!.id);
  });

  it("returns undefined for empty, malformed, too-deep, and unknown paths", () => {
    expect(resolveKnowledgePath(knowledgeCatalogFixture, [])).toBeUndefined();
    expect(
      resolveKnowledgePath(knowledgeCatalogFixture, ["graph.shortest-path"]),
    ).toBeUndefined();
    expect(
      resolveKnowledgePath(knowledgeCatalogFixture, ["a", "b", "c", "d"]),
    ).toBeUndefined();
    expect(
      resolveKnowledgePath(knowledgeCatalogFixture, ["graph", "unknown"]),
    ).toBeUndefined();
  });
});

describe("knowledge selection primitives", () => {
  it("accepts empty, sibling, cross-branch, and selectable non-leaf selections", () => {
    expect(validateKnowledgeSelection(knowledgeCatalogFixture, [])).toEqual({
      success: true,
      data: [],
    });
    expect(
      validateKnowledgeSelection(knowledgeCatalogFixture, [
        "graph.shortest-path.dijkstra",
        "graph.shortest-path.bellman-ford",
      ]).success,
    ).toBe(true);
    expect(
      validateKnowledgeSelection(knowledgeCatalogFixture, [
        "graph.shortest-path.dijkstra",
        "data-structure.heap",
      ]).success,
    ).toBe(true);
    expect(
      validateKnowledgeSelection(knowledgeCatalogFixture, [
        "graph.shortest-path",
      ]),
    ).toEqual({ success: true, data: ["graph.shortest-path"] });
  });

  it("reports duplicate, unknown, and non-selectable IDs", () => {
    const result = validateKnowledgeSelection(knowledgeCatalogFixture, [
      "graph.shortest-path.dijkstra",
      "graph.shortest-path.dijkstra",
      "graph.unknown",
      "graph",
    ]);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "duplicate-id",
            id: "graph.shortest-path.dijkstra",
            firstIndex: 0,
            index: 1,
          }),
          { code: "unknown-id", id: "graph.unknown", index: 2 },
          expect.objectContaining({
            code: "non-selectable-id",
            id: "graph",
            index: 3,
          }),
        ]),
      );
    }
  });

  it("rejects ancestor and descendant selections in either input order", () => {
    for (const values of [
      ["graph.shortest-path", "graph.shortest-path.dijkstra"],
      ["graph.shortest-path.dijkstra", "graph.shortest-path"],
    ]) {
      const result = validateKnowledgeSelection(knowledgeCatalogFixture, values);
      expect(result).toEqual({
        success: false,
        issues: [
          {
            code: "ancestor-descendant-conflict",
            ancestorId: "graph.shortest-path",
            descendantId: "graph.shortest-path.dijkstra",
          },
        ],
      });
    }
  });
});

