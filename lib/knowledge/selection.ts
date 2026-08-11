import {
  getKnowledgeEntry,
  type KnowledgeCatalog,
} from "./catalog";
import type { KnowledgeId } from "./types";

export type KnowledgeSelectionIssue =
  | {
      readonly code: "unknown-id";
      readonly id: string;
      readonly index: number;
    }
  | {
      readonly code: "non-selectable-id";
      readonly id: KnowledgeId;
      readonly index: number;
    }
  | {
      readonly code: "duplicate-id";
      readonly id: KnowledgeId;
      readonly index: number;
      readonly firstIndex: number;
    }
  | {
      readonly code: "ancestor-descendant-conflict";
      readonly ancestorId: KnowledgeId;
      readonly descendantId: KnowledgeId;
    };

export type KnowledgeSelectionResult =
  | {
      readonly success: true;
      readonly data: readonly KnowledgeId[];
    }
  | {
      readonly success: false;
      readonly issues: readonly KnowledgeSelectionIssue[];
    };

export function validateKnowledgeSelection(
  catalog: KnowledgeCatalog,
  values: readonly string[],
): KnowledgeSelectionResult {
  const issues: KnowledgeSelectionIssue[] = [];
  const firstIndexes = new Map<KnowledgeId, number>();
  const knownIds: KnowledgeId[] = [];

  values.forEach((value, index) => {
    const entry = getKnowledgeEntry(catalog, value);
    if (!entry) {
      issues.push({ code: "unknown-id", id: value, index });
      return;
    }

    const firstIndex = firstIndexes.get(entry.id);
    if (firstIndex !== undefined) {
      issues.push({
        code: "duplicate-id",
        id: entry.id,
        index,
        firstIndex,
      });
      return;
    }

    firstIndexes.set(entry.id, index);
    knownIds.push(entry.id);

    if (!entry.selectable) {
      issues.push({ code: "non-selectable-id", id: entry.id, index });
    }
  });

  for (let leftIndex = 0; leftIndex < knownIds.length; leftIndex += 1) {
    const leftId = knownIds[leftIndex];
    const left = getKnowledgeEntry(catalog, leftId)!;

    for (
      let rightIndex = leftIndex + 1;
      rightIndex < knownIds.length;
      rightIndex += 1
    ) {
      const rightId = knownIds[rightIndex];
      const right = getKnowledgeEntry(catalog, rightId)!;

      if (right.ancestorIds.includes(leftId)) {
        issues.push({
          code: "ancestor-descendant-conflict",
          ancestorId: leftId,
          descendantId: rightId,
        });
      } else if (left.ancestorIds.includes(rightId)) {
        issues.push({
          code: "ancestor-descendant-conflict",
          ancestorId: rightId,
          descendantId: leftId,
        });
      }
    }
  }

  return issues.length === 0
    ? { success: true, data: Object.freeze(knownIds) }
    : { success: false, issues: Object.freeze(issues) };
}

