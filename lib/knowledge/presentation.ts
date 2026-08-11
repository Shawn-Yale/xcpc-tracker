import { knowledgeCatalog } from "@/config/knowledge-taxonomy";

import { getKnowledgeEntry } from "./catalog";
import type { KnowledgeId } from "./types";

export function getKnowledgeBreadcrumb(id: KnowledgeId): string {
  const entry = getKnowledgeEntry(knowledgeCatalog, id);
  if (!entry) {
    throw new RangeError(`Unknown knowledge ID: ${id}`);
  }

  return [...entry.ancestorIds, entry.id]
    .map((entryId) => getKnowledgeEntry(knowledgeCatalog, entryId)?.name)
    .filter((name): name is string => name !== undefined)
    .join(" / ");
}

export function getKnowledgeNames(ids: readonly KnowledgeId[]): string[] {
  return ids.map(getKnowledgeBreadcrumb);
}
