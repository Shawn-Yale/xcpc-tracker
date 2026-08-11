import type {
  KnowledgeCatalogEntry,
  KnowledgeId,
  KnowledgeNode,
  KnowledgeTaxonomy,
} from "./types";

export type KnowledgeCatalog = Readonly<{
  taxonomy: KnowledgeTaxonomy;
  entries: readonly KnowledgeCatalogEntry[];
}>;

type CatalogState = {
  entriesById: ReadonlyMap<string, KnowledgeCatalogEntry>;
};

const catalogStates = new WeakMap<KnowledgeCatalog, CatalogState>();

function stateFor(catalog: KnowledgeCatalog): CatalogState {
  const state = catalogStates.get(catalog);
  if (!state) {
    throw new TypeError("Invalid knowledge catalog instance");
  }
  return state;
}

export function createKnowledgeCatalog(
  taxonomy: KnowledgeTaxonomy,
): KnowledgeCatalog {
  const entries: KnowledgeCatalogEntry[] = [];
  const entriesById = new Map<string, KnowledgeCatalogEntry>();

  function visit(
    node: KnowledgeNode,
    parentId: KnowledgeId | null,
    ancestorIds: readonly KnowledgeId[],
  ): void {
    if (entriesById.has(node.id)) {
      throw new TypeError(`Duplicate knowledge ID in taxonomy: ${node.id}`);
    }

    const pathSegments = Object.freeze(node.id.split("."));
    const depth = pathSegments.length;
    if (depth < 1 || depth > 3) {
      throw new TypeError(`Invalid knowledge depth for ${node.id}`);
    }

    const entry: KnowledgeCatalogEntry = Object.freeze({
      id: node.id,
      name: node.name,
      ...(node.description === undefined
        ? {}
        : { description: node.description }),
      selectable: node.selectable,
      parentId,
      ancestorIds: Object.freeze([...ancestorIds]),
      depth: depth as 1 | 2 | 3,
      pathSegments,
    });

    entries.push(entry);
    entriesById.set(entry.id, entry);

    const childAncestors = Object.freeze([...ancestorIds, node.id]);
    for (const child of node.children) {
      visit(child, node.id, childAncestors);
    }
  }

  for (const root of taxonomy) {
    visit(root, null, []);
  }

  const catalog: KnowledgeCatalog = Object.freeze({
    taxonomy,
    entries: Object.freeze(entries),
  });
  catalogStates.set(catalog, { entriesById });
  return catalog;
}

export function isKnowledgeId(
  catalog: KnowledgeCatalog,
  value: unknown,
): value is KnowledgeId {
  return typeof value === "string" && stateFor(catalog).entriesById.has(value);
}

export function getKnowledgeEntry(
  catalog: KnowledgeCatalog,
  id: string,
): KnowledgeCatalogEntry | undefined {
  return stateFor(catalog).entriesById.get(id);
}

export function getKnowledgeParent(
  catalog: KnowledgeCatalog,
  id: KnowledgeId,
): KnowledgeCatalogEntry | null {
  const entry = getKnowledgeEntry(catalog, id);
  if (!entry) {
    throw new RangeError(`Unknown knowledge ID: ${id}`);
  }
  return entry.parentId === null
    ? null
    : (getKnowledgeEntry(catalog, entry.parentId) ?? null);
}

export function getKnowledgeAncestors(
  catalog: KnowledgeCatalog,
  id: KnowledgeId,
): readonly KnowledgeCatalogEntry[] {
  const entry = getKnowledgeEntry(catalog, id);
  if (!entry) {
    throw new RangeError(`Unknown knowledge ID: ${id}`);
  }
  return Object.freeze(
    entry.ancestorIds.map((ancestorId) => {
      const ancestor = getKnowledgeEntry(catalog, ancestorId);
      if (!ancestor) {
        throw new TypeError(`Knowledge catalog is missing ancestor ${ancestorId}`);
      }
      return ancestor;
    }),
  );
}

export function getKnowledgeDescendants(
  catalog: KnowledgeCatalog,
  id: KnowledgeId,
): readonly KnowledgeCatalogEntry[] {
  if (!getKnowledgeEntry(catalog, id)) {
    throw new RangeError(`Unknown knowledge ID: ${id}`);
  }
  return Object.freeze(
    catalog.entries.filter((entry) => entry.ancestorIds.includes(id)),
  );
}

export function expandKnowledgeToAncestors(
  catalog: KnowledgeCatalog,
  ids: readonly KnowledgeId[],
): ReadonlySet<KnowledgeId> {
  const expanded = new Set<KnowledgeId>();

  for (const id of ids) {
    const entry = getKnowledgeEntry(catalog, id);
    if (!entry) {
      throw new RangeError(`Unknown knowledge ID: ${id}`);
    }
    for (const ancestorId of entry.ancestorIds) {
      expanded.add(ancestorId);
    }
    expanded.add(entry.id);
  }

  return expanded;
}

