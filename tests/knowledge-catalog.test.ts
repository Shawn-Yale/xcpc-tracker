import { describe, expect, it } from "vitest";

import {
  expandKnowledgeToAncestors,
  getKnowledgeAncestors,
  getKnowledgeDescendants,
  getKnowledgeEntry,
  getKnowledgeParent,
  isKnowledgeId,
} from "@/lib/knowledge/catalog";

import { knowledgeCatalogFixture } from "./fixtures/knowledge-taxonomy";

function fixtureId(value: string) {
  const entry = getKnowledgeEntry(knowledgeCatalogFixture, value);
  if (!entry) {
    throw new Error(`Missing fixture knowledge ID: ${value}`);
  }
  return entry.id;
}

describe("knowledge catalog", () => {
  it("creates immutable entries with derived structural metadata", () => {
    const dijkstra = getKnowledgeEntry(
      knowledgeCatalogFixture,
      "graph.shortest-path.dijkstra",
    );

    expect(dijkstra).toEqual({
      id: "graph.shortest-path.dijkstra",
      name: "Dijkstra",
      selectable: true,
      parentId: "graph.shortest-path",
      ancestorIds: ["graph", "graph.shortest-path"],
      depth: 3,
      pathSegments: ["graph", "shortest-path", "dijkstra"],
    });
    expect(Object.isFrozen(knowledgeCatalogFixture)).toBe(true);
    expect(Object.isFrozen(knowledgeCatalogFixture.entries)).toBe(true);
    expect(Object.isFrozen(dijkstra)).toBe(true);
    expect(Object.isFrozen(dijkstra?.ancestorIds)).toBe(true);
  });

  it("recognizes only IDs present in the catalog", () => {
    expect(isKnowledgeId(knowledgeCatalogFixture, "data-structure.heap")).toBe(true);
    expect(isKnowledgeId(knowledgeCatalogFixture, "data-structure.queue")).toBe(false);
    expect(isKnowledgeId(knowledgeCatalogFixture, 42)).toBe(false);
  });

  it("looks up parents and root-to-parent ancestors", () => {
    const graph = fixtureId("graph");
    const dijkstra = fixtureId("graph.shortest-path.dijkstra");

    expect(getKnowledgeParent(knowledgeCatalogFixture, graph)).toBeNull();
    expect(getKnowledgeParent(knowledgeCatalogFixture, dijkstra)?.id).toBe(
      "graph.shortest-path",
    );
    expect(
      getKnowledgeAncestors(knowledgeCatalogFixture, dijkstra).map(
        (entry) => entry.id,
      ),
    ).toEqual(["graph", "graph.shortest-path"]);
  });

  it("returns all descendants in taxonomy traversal order", () => {
    expect(
      getKnowledgeDescendants(
        knowledgeCatalogFixture,
        fixtureId("graph"),
      ).map((entry) => entry.id),
    ).toEqual([
      "graph.shortest-path",
      "graph.shortest-path.dijkstra",
      "graph.shortest-path.bellman-ford",
    ]);
  });

  it("expands selections to a deduplicated set of ancestors and selves", () => {
    expect(
      [...expandKnowledgeToAncestors(knowledgeCatalogFixture, [
        fixtureId("graph.shortest-path.dijkstra"),
        fixtureId("graph.shortest-path.bellman-ford"),
        fixtureId("data-structure.heap"),
      ])],
    ).toEqual([
      "graph",
      "graph.shortest-path",
      "graph.shortest-path.dijkstra",
      "graph.shortest-path.bellman-ford",
      "data-structure",
      "data-structure.heap",
    ]);
  });
});

