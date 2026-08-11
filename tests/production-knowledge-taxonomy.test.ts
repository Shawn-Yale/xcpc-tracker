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
  it("matches the frozen V1 inventory counts and selectability", () => {
    const domains = knowledgeCatalog.entries.filter((entry) => entry.depth === 1);
    const topics = knowledgeCatalog.entries.filter((entry) => entry.depth === 2);
    const techniques = knowledgeCatalog.entries.filter((entry) => entry.depth === 3);
    const selectable = knowledgeCatalog.entries.filter((entry) => entry.selectable);
    const nonSelectable = knowledgeCatalog.entries.filter(
      (entry) => !entry.selectable,
    );

    expect(knowledgeTaxonomy).toHaveLength(10);
    expect(domains).toHaveLength(10);
    expect(topics).toHaveLength(68);
    expect(techniques).toHaveLength(117);
    expect(knowledgeCatalog.entries).toHaveLength(195);
    expect(selectable).toHaveLength(177);
    expect(nonSelectable).toHaveLength(18);

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
});
