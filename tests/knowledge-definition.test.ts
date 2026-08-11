import { describe, expect, it } from "vitest";

import {
  defineKnowledgeTaxonomy,
  KnowledgeTaxonomyDefinitionError,
} from "@/lib/knowledge/definition";
import type { KnowledgeNodeDefinition } from "@/lib/knowledge/types";

import {
  knowledgeTaxonomyFixture,
  knowledgeTaxonomyFixtureDefinition,
} from "./fixtures/knowledge-taxonomy";

function defineUnknown(value: unknown) {
  return defineKnowledgeTaxonomy(
    value as readonly KnowledgeNodeDefinition[],
  );
}

describe("knowledge taxonomy definition", () => {
  it("normalizes and deeply freezes a valid tree without deriving selectable", () => {
    expect(knowledgeTaxonomyFixture).toHaveLength(2);
    expect(Object.isFrozen(knowledgeTaxonomyFixture)).toBe(true);
    expect(Object.isFrozen(knowledgeTaxonomyFixture[0])).toBe(true);
    expect(Object.isFrozen(knowledgeTaxonomyFixture[0].children)).toBe(true);
    expect(knowledgeTaxonomyFixture[0].selectable).toBe(false);
    expect(knowledgeTaxonomyFixture[0].children[0].selectable).toBe(true);
    expect(knowledgeTaxonomyFixtureDefinition[0].children[0].children).toHaveLength(2);
  });

  it.each([
    ["uppercase", "Graph"],
    ["underscore", "data_structure"],
    ["empty segment", "graph..shortest-path"],
    ["too deep", "graph.shortest-path.dijkstra.heap"],
  ])("rejects invalid ID format: %s", (_case, id) => {
    expect(() =>
      defineUnknown([{ id, name: "Invalid", selectable: true }]),
    ).toThrow(KnowledgeTaxonomyDefinitionError);
  });

  it("rejects duplicate IDs globally", () => {
    expect(() =>
      defineUnknown([
        { id: "graph", name: "Graph", selectable: false },
        { id: "graph", name: "Duplicate", selectable: true },
      ]),
    ).toThrow("Duplicate knowledge ID: graph");
  });

  it.each([
    {
      id: "graph",
      name: "Graph",
      selectable: false,
      children: [
        { id: "tree.path", name: "Wrong parent", selectable: true },
      ],
    },
    {
      id: "graph",
      name: "Graph",
      selectable: false,
      children: [
        {
          id: "graph.shortest-path.dijkstra",
          name: "Skipped level",
          selectable: true,
        },
      ],
    },
  ])("rejects child IDs that do not extend their parent by one segment", (root) => {
    expect(() => defineUnknown([root])).toThrow(
      "Child ID must extend parent graph by exactly one segment",
    );
  });

  it("rejects missing and non-boolean selectable values", () => {
    expect(() =>
      defineUnknown([{ id: "graph", name: "Graph" }]),
    ).toThrow("selectable must be an explicit boolean");
    expect(() =>
      defineUnknown([
        { id: "graph", name: "Graph", selectable: "yes" },
      ]),
    ).toThrow("selectable must be an explicit boolean");
  });

  it("rejects empty names, invalid children, unknown fields, and cycles", () => {
    expect(() =>
      defineUnknown([{ id: "graph", name: "  ", selectable: false }]),
    ).toThrow("name must be a non-empty string");
    expect(() =>
      defineUnknown([
        { id: "graph", name: "Graph", selectable: false, children: {} },
      ]),
    ).toThrow("children must be an array");
    expect(() =>
      defineUnknown([
        { id: "graph", name: "Graph", selectable: false, parentId: null },
      ]),
    ).toThrow("Unknown node field");

    const cyclic: Record<string, unknown> = {
      id: "graph",
      name: "Graph",
      selectable: false,
    };
    cyclic.children = [cyclic];
    expect(() => defineUnknown([cyclic])).toThrow("contains a cycle");
  });
});

