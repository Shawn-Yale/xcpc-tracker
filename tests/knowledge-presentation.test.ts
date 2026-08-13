import { describe, expect, it } from "vitest";

import { knowledgeCatalog } from "@/config/knowledge-taxonomy";
import { getKnowledgeEntry } from "@/lib/knowledge/catalog";
import {
  getKnowledgeBreadcrumb,
  getKnowledgeLabel,
} from "@/lib/knowledge/presentation";
import type { KnowledgeId } from "@/lib/knowledge/types";

function knowledgeId(value: string): KnowledgeId {
  const entry = getKnowledgeEntry(knowledgeCatalog, value);
  if (!entry) {
    throw new TypeError(`Missing test Knowledge ID: ${value}`);
  }
  return entry.id;
}

describe("knowledge presentation", () => {
  it("returns a Technique's own name without changing its breadcrumb", () => {
    const fenwickTree = knowledgeId(
      "data-structure.range-query.fenwick-tree",
    );

    expect(getKnowledgeLabel(fenwickTree)).toBe("树状数组");
    expect(getKnowledgeBreadcrumb(fenwickTree)).toBe(
      "数据结构 / 区间查询结构 / 树状数组",
    );
  });

  it("returns a selectable non-leaf Topic's own name without changing its breadcrumb", () => {
    const binarySearch = knowledgeId("algorithmic-techniques.binary-search");
    const entry = getKnowledgeEntry(knowledgeCatalog, binarySearch);

    expect(entry?.selectable).toBe(true);
    expect(
      knowledgeCatalog.entries.some((candidate) => candidate.parentId === binarySearch),
    ).toBe(true);
    expect(getKnowledgeLabel(binarySearch)).toBe("二分");
    expect(getKnowledgeBreadcrumb(binarySearch)).toBe(
      "通用算法技巧 / 二分",
    );
  });

  it("rejects unknown IDs consistently with breadcrumb presentation", () => {
    const unknownId = "unknown.knowledge" as KnowledgeId;

    expect(() => getKnowledgeLabel(unknownId)).toThrow(
      new RangeError("Unknown knowledge ID: unknown.knowledge"),
    );
    expect(() => getKnowledgeBreadcrumb(unknownId)).toThrow(
      new RangeError("Unknown knowledge ID: unknown.knowledge"),
    );
  });
});
