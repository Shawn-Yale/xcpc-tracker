import type { KnowledgeCatalog } from "@/lib/knowledge/catalog";
import type {
  KnowledgeCatalogEntry,
  KnowledgeId,
} from "@/lib/knowledge/types";

import type { KnowledgeStats } from "./problem-stats";

export const knowledgeTreeFilterValues = [
  "all",
  "with-training",
  "weak",
  "mastered",
] as const;

export type KnowledgeTreeFilter = (typeof knowledgeTreeFilterValues)[number];

export const defaultKnowledgeTreeFilter: KnowledgeTreeFilter = "with-training";

export type KnowledgeTreeRow = Readonly<{
  entry: KnowledgeCatalogEntry;
  statistics: KnowledgeStats;
  matched: boolean;
  hasRetainedChildren: boolean;
}>;

function matchesKnowledgeTreeFilter(
  statistics: KnowledgeStats,
  filter: KnowledgeTreeFilter,
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "with-training":
      return statistics.rollup.total > 0;
    case "weak":
      return (
        statistics.rollup.statusCounts.C > 0 ||
        statistics.rollup.statusCounts.D > 0
      );
    case "mastered":
      return (
        statistics.rollup.total > 0 &&
        statistics.rollup.mastered === statistics.rollup.total
      );
  }
}

export function getRetainedKnowledgeTreeRows(
  catalog: KnowledgeCatalog,
  statisticsRows: readonly KnowledgeStats[],
  filter: KnowledgeTreeFilter,
): readonly KnowledgeTreeRow[] {
  const statisticsById = new Map(
    statisticsRows.map((statistics) => [statistics.id, statistics]),
  );
  const matchedIds = new Set<KnowledgeId>();
  const retainedIds = new Set<KnowledgeId>();

  for (const entry of catalog.entries) {
    const statistics = statisticsById.get(entry.id);
    if (!statistics) {
      throw new RangeError(`Missing Knowledge statistics for ${entry.id}`);
    }

    if (matchesKnowledgeTreeFilter(statistics, filter)) {
      matchedIds.add(entry.id);
      retainedIds.add(entry.id);
      for (const ancestorId of entry.ancestorIds) {
        retainedIds.add(ancestorId);
      }
    }
  }

  const retainedParentIds = new Set<KnowledgeId>();
  for (const entry of catalog.entries) {
    if (entry.parentId !== null && retainedIds.has(entry.id)) {
      retainedParentIds.add(entry.parentId);
    }
  }

  return catalog.entries
    .filter((entry) => retainedIds.has(entry.id))
    .map((entry) => ({
      entry,
      statistics: statisticsById.get(entry.id)!,
      matched: matchedIds.has(entry.id),
      hasRetainedChildren: retainedParentIds.has(entry.id),
    }));
}

export function getVisibleKnowledgeTreeRows(
  retainedRows: readonly KnowledgeTreeRow[],
  expandedIds: ReadonlySet<KnowledgeId>,
): readonly KnowledgeTreeRow[] {
  const visibleIds = new Set<KnowledgeId>();
  const visibleRows: KnowledgeTreeRow[] = [];

  for (const row of retainedRows) {
    const parentId = row.entry.parentId;
    const isVisible =
      parentId === null ||
      (visibleIds.has(parentId) && expandedIds.has(parentId));

    if (isVisible) {
      visibleIds.add(row.entry.id);
      visibleRows.push(row);
    }
  }

  return visibleRows;
}
