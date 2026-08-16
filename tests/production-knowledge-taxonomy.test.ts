import { describe, expect, it } from "vitest";

import {
  knowledgeCatalog,
  knowledgeTaxonomy,
} from "@/config/knowledge-taxonomy";
import {
  getKnowledgeAncestors,
  getKnowledgeEntry,
  getKnowledgeParent,
} from "@/lib/knowledge/catalog";
import {
  getKnowledgeHref,
  resolveKnowledgePath,
} from "@/lib/knowledge/routing";

function requireProductionEntry(id: string) {
  const entry = getKnowledgeEntry(knowledgeCatalog, id);
  if (!entry) {
    throw new Error(`Missing production knowledge ID: ${id}`);
  }
  return entry;
}

describe("production knowledge taxonomy", () => {
  it("preserves domain and selectability invariants", () => {
    const domains = knowledgeCatalog.entries.filter((entry) => entry.depth === 1);
    const topics = knowledgeCatalog.entries.filter((entry) => entry.depth === 2);
    const techniques = knowledgeCatalog.entries.filter((entry) => entry.depth === 3);

    expect(knowledgeTaxonomy).toHaveLength(10);
    expect(domains).toHaveLength(10);

    expect(domains.every((entry) => !entry.selectable)).toBe(true);
    expect(topics.filter((entry) => !entry.selectable)).toHaveLength(8);
    expect(techniques.every((entry) => entry.selectable)).toBe(true);
  });

  it("looks up and routing-round-trips every frozen ID", () => {
    for (const entry of knowledgeCatalog.entries) {
      expect(entry.depth).toBeLessThanOrEqual(3);
      expect(getKnowledgeEntry(knowledgeCatalog, entry.id)).toBe(entry);
      expect(getKnowledgeHref(entry.id)).toBe(
        `/knowledge/${entry.pathSegments.join("/")}`,
      );
      expect(resolveKnowledgePath(knowledgeCatalog, entry.pathSegments)).toBe(
        entry,
      );
    }
  });

  it("contains the frozen key IDs", () => {
    const requiredIds = [
      "graph.tree.dsu-on-tree",
      "algorithmic-techniques.offline-processing.mo-algorithm",
      "bitwise.transform.subset-zeta-mobius-transform",
      "data-structure.disjoint-set-union.potential-dsu",
      "algorithmic-techniques.coordinate-compression",
      "algorithmic-techniques.meet-in-the-middle",
    ];

    for (const id of requiredIds) {
      expect(requireProductionEntry(id).selectable).toBe(true);
    }
  });

  it("does not contain obsolete proposal IDs", () => {
    const obsoleteIds = [
      "data-structure.range-query.mo-algorithm",
      "bitwise.transform.fast-zeta-transform",
      "data-structure.disjoint-set-union.weighted-dsu",
      "algorithmic-techniques.offline-processing.coordinate-compression",
      "search.state-space.meet-in-the-middle",
      "algorithmic-techniques.binary-search.ordered-search",
      "algorithmic-techniques.doubling.binary-lifting",
      "search.backtracking.pruning",
      "data-structure.trie.prefix-trie",
    ];

    for (const id of obsoleteIds) {
      expect(getKnowledgeEntry(knowledgeCatalog, id)).toBeUndefined();
    }
  });

  it("derives the frozen key hierarchy from the authored tree", () => {
    const moAlgorithm = requireProductionEntry(
      "algorithmic-techniques.offline-processing.mo-algorithm",
    );
    const zetaMobius = requireProductionEntry(
      "bitwise.transform.subset-zeta-mobius-transform",
    );
    const dsuOnTree = requireProductionEntry("graph.tree.dsu-on-tree");

    expect(
      getKnowledgeAncestors(knowledgeCatalog, moAlgorithm.id).map(
        (entry) => entry.id,
      ),
    ).toEqual([
      "algorithmic-techniques",
      "algorithmic-techniques.offline-processing",
    ]);
    expect(getKnowledgeParent(knowledgeCatalog, zetaMobius.id)?.id).toBe(
      "bitwise.transform",
    );
    expect(getKnowledgeParent(knowledgeCatalog, dsuOnTree.id)?.id).toBe(
      "graph.tree",
    );
  });

  it.each([
    [
      "algorithmic-techniques.ternary-search",
      "三分",
      "algorithmic-techniques",
    ],
    [
      "algorithmic-techniques.heuristic-merging",
      "启发式合并",
      "algorithmic-techniques",
    ],
    [
      "algorithmic-techniques.offline-processing.parallel-binary-search",
      "整体二分 / 并行二分",
      "algorithmic-techniques.offline-processing",
    ],
    ["data-structure.cartesian-tree", "笛卡尔树", "data-structure"],
    ["graph.two-sat", "2-SAT", "graph"],
    ["graph.shortest-path.johnson", "Johnson", "graph.shortest-path"],
    ["graph.network-flow.minimum-cut", "最小割", "graph.network-flow"],
    ["dynamic-programming.state-machine", "状态机 DP", "dynamic-programming"],
    ["dynamic-programming.probability", "概率 DP", "dynamic-programming"],
    ["dynamic-programming.expected-value", "期望 DP", "dynamic-programming"],
    ["dynamic-programming.tree.rerooting", "换根 DP", "dynamic-programming.tree"],
    ["math.number-theory.mobius-inversion", "Möbius 反演", "math.number-theory"],
  ])("places %s under its required parent", (id, name, parentId) => {
    const entry = requireProductionEntry(id);

    expect(entry.name).toBe(name);
    expect(entry.selectable).toBe(true);
    expect(getKnowledgeParent(knowledgeCatalog, entry.id)?.id).toBe(parentId);
    expect(resolveKnowledgePath(knowledgeCatalog, entry.pathSegments)).toBe(entry);
  });

  it("keeps production IDs and canonical paths unique", () => {
    const ids = knowledgeCatalog.entries.map((entry) => entry.id);
    const paths = knowledgeCatalog.entries.map((entry) =>
      entry.pathSegments.join("/"),
    );

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(paths).size).toBe(paths.length);
  });
});
