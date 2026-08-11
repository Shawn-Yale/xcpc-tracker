import { getKnowledgeEntry, type KnowledgeCatalog } from "./catalog";
import type { KnowledgeCatalogEntry, KnowledgeId } from "./types";

export function getKnowledgeHref(id: KnowledgeId): string {
  return `/knowledge/${id.replaceAll(".", "/")}`;
}

export function resolveKnowledgePath(
  catalog: KnowledgeCatalog,
  segments: readonly string[],
): KnowledgeCatalogEntry | undefined {
  if (
    segments.length < 1 ||
    segments.length > 3 ||
    segments.some((segment) => segment === "" || segment.includes("."))
  ) {
    return undefined;
  }

  return getKnowledgeEntry(catalog, segments.join("."));
}

