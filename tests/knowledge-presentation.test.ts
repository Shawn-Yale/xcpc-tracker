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
  it("returns leaf labels without changing breadcrumbs", () => {
    const fenwickTree = knowledgeId(
      "data-structure.range-query.fenwick-tree",
    );
    const segmentTree = knowledgeId(
      "data-structure.range-query.segment-tree",
    );

    expect(getKnowledgeLabel(fenwickTree)).toBe("树状数组");
    expect(getKnowledgeBreadcrumb(fenwickTree)).toBe(
      "数据结构 / 区间查询结构 / 树状数组",
    );
    expect(getKnowledgeLabel(segmentTree)).toBe("线段树");
    expect(getKnowledgeBreadcrumb(segmentTree)).toBe(
      "数据结构 / 区间查询结构 / 线段树",
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
