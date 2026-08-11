# Taxonomy V2 Contract Proposal

Status: **Frozen for taxonomy foundation**, except for the explicitly deferred items in section 17.

This document defines the clean-cutover contract from `categories` to a hierarchical `knowledge` taxonomy. It does not authorize compatibility code, migration, dual writes, or changes to `data/problems`.

## 1. Final core decisions

| Area | Frozen decision |
| --- | --- |
| Problem field | `knowledge: KnowledgeId[]` |
| Persisted value | Stable, full knowledge IDs only; never localized names |
| Taxonomy depth | At most Domain → Topic → Technique; shorter branches are valid |
| Source of truth | One typed taxonomy tree; indexes and relationships are derived |
| `selectable` | Required explicit boolean on every node; never inferred from `children` |
| Parent relationship | Declared only by tree nesting; no authored `parentId` |
| ID hierarchy | Dotted ID path must match tree ancestry |
| Empty knowledge | `knowledge: []` is valid, but the field is required |
| Duplicate/unknown ID | Reject the Problem; never silently repair it |
| Non-leaf selection | Allowed only when the node explicitly has `selectable: true` |
| Parent + descendant | Reject within the same Problem |
| Knowledge URL | `/knowledge/graph/shortest-path/dijkstra` |
| Problems filter | `/problems?knowledge=graph.shortest-path.dijkstra` |
| Invalid filter | Preserve an explicit invalid state; never show all Problems silently |
| Statistics | Direct and ancestor-rollup statistics, deduplicated by Problem |
| D Knowledge Gaps | Ranking/presentation policy is deferred to its statistics consumer |
| Tags | Independent free text; no taxonomy semantics or automatic conversion |
| Legacy `categories` | Explicitly reject while unrelated unknown fields may pass through |

## 2. TypeScript contract

The authoring and validated runtime models are separate. `selectable` is required in both.

```ts
declare const knowledgeIdBrand: unique symbol;

export type KnowledgeId = string & {
  readonly [knowledgeIdBrand]: true;
};

export type KnowledgeNodeDefinition = {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly selectable: boolean;
  readonly children?: readonly KnowledgeNodeDefinition[];
};

export type KnowledgeNode = {
  readonly id: KnowledgeId;
  readonly name: string;
  readonly description?: string;
  readonly selectable: boolean;
  readonly children: readonly KnowledgeNode[];
};

export type KnowledgeCatalogEntry = {
  readonly id: KnowledgeId;
  readonly name: string;
  readonly description?: string;
  readonly selectable: boolean;
  readonly parentId: KnowledgeId | null;
  readonly ancestorIds: readonly KnowledgeId[];
  readonly depth: 1 | 2 | 3;
  readonly pathSegments: readonly string[];
};
```

There is no `selectable` default:

- every node must declare it;
- adding or removing `children` must not alter it;
- a leaf can gain children and remain selectable;
- a parent can lose all children and remain non-selectable;
- changing a used node from selectable to non-selectable is a breaking taxonomy change.

## 3. Source-of-truth structure

```text
config/
└── knowledge-taxonomy.ts        # only authored taxonomy data

lib/knowledge/
├── types.ts                     # ID and node/catalog types
├── definition.ts                # definition and tree validation
├── catalog.ts                   # derived immutable indexes
├── selection.ts                 # selection validation and expansion
├── routing.ts                   # KnowledgeId ↔ URL segments
└── statistics.ts                # generic direct/rollup aggregation
```

Example definition:

```ts
export const knowledgeTaxonomy = defineKnowledgeTaxonomy([
  {
    id: "graph",
    name: "图论",
    selectable: false,
    children: [
      {
        id: "graph.shortest-path",
        name: "最短路",
        selectable: true,
        children: [
          {
            id: "graph.shortest-path.dijkstra",
            name: "Dijkstra",
            selectable: true,
          },
        ],
      },
    ],
  },
] as const);
```

A second flat ID list, parent IDs, ancestor arrays, depth, and URL slugs must not be separately authored. They are derived from the validated tree.

## 4. Stable hierarchical ID rules

A `KnowledgeId` has one to three dot-separated kebab-case ASCII segments:

```text
domain
domain.topic
domain.topic.technique
```

Recommended pattern:

```regex
^[a-z0-9]+(?:-[a-z0-9]+)*(?:\.[a-z0-9]+(?:-[a-z0-9]+)*){0,2}$
```

Examples:

```text
graph
graph.shortest-path
graph.shortest-path.dijkstra
data-structure.heap
dynamic-programming.tree-dp
```

Hierarchy alignment is mandatory:

- a child has exactly one more segment than its parent;
- its ID equals the full parent ID plus `.` and one segment;
- depth never exceeds three;
- full IDs are globally unique.

### 4.1 Stability boundary

Hierarchical IDs are stable within a stable hierarchy; they are not independent of hierarchy.

Non-breaking maintenance:

- changing `name` or `description`;
- adding new siblings or descendants without changing existing IDs;
- adding children while keeping the existing node's explicit `selectable` value.

Breaking taxonomy changes:

- reparenting an existing node;
- changing an ID's semantic meaning;
- renaming an ID segment;
- changing a used selectable node to non-selectable;
- deleting an ID still referenced by Problem Markdown.

Once formally used, a KnowledgeId should not be casually reparented. Reparenting or semantic renaming changes the hierarchical ID and requires an explicitly planned future data operation. V2 does not introduce an opaque ID or separate slug system. A removed ID remains reserved and must never be reused for another concept.

## 5. Parent, children, and ancestor derivation

Only `children` defines authored relationships. One catalog traversal derives `parentId`, `ancestorIds`, `depth`, and `pathSegments`.

Definition validation rejects:

- duplicate or malformed IDs;
- depth over three;
- parent/path misalignment;
- empty names;
- missing `selectable` values;
- cyclic or invalid structures.

Recommended APIs:

```ts
isKnowledgeId(value: string): value is KnowledgeId
getKnowledgeNode(id: KnowledgeId): KnowledgeNode | undefined
getKnowledgeEntry(id: KnowledgeId): KnowledgeCatalogEntry | undefined
getKnowledgeParent(id: KnowledgeId): KnowledgeCatalogEntry | null
getKnowledgeAncestors(id: KnowledgeId): readonly KnowledgeCatalogEntry[]
getKnowledgeDescendants(id: KnowledgeId): readonly KnowledgeCatalogEntry[]
expandKnowledgeToAncestors(ids: readonly KnowledgeId[]): ReadonlySet<KnowledgeId>
```

Business components use the catalog rather than ad hoc `split(".")` ancestry logic.

## 6. Problem Front Matter contract

```yaml
knowledge:
  - graph.shortest-path.dijkstra
  - data-structure.heap
tags:
  - 优先队列
  - 松弛
```

The normalized model contains `knowledge: KnowledgeId[]` and `tags: string[]`.

The Zod schema validates:

- array shape;
- ID syntax;
- catalog existence;
- `selectable: true` for every stored node;
- no duplicates;
- no ancestor/descendant pair.

Conceptually:

```ts
const knowledgeIdSchema = z
  .string()
  .regex(knowledgeIdPattern)
  .refine(isKnownKnowledgeId, "Unknown knowledge ID")
  .refine(isSelectableKnowledgeId, "Knowledge node is not selectable");

const problemKnowledgeSchema = z
  .array(knowledgeIdSchema)
  .superRefine(validateKnowledgeSelection);
```

`knowledge: []` is valid and means “not yet classified”. Omitting `knowledge` is invalid, the parser must not default it, and writers must emit `knowledge: []` for an unclassified new Problem.

Duplicate IDs are rejected, not silently deduplicated. This redundant pair is also rejected:

```yaml
knowledge:
  - graph.shortest-path
  - graph.shortest-path.dijkstra
```

Sibling and cross-branch selections are valid.

## 7. Selecting non-leaf nodes

Leaf status never determines selectability:

- any node with `selectable: true` may be stored;
- any node with `selectable: false` is navigation/grouping only;
- a non-leaf Topic can remain selectable after Techniques are added;
- a leaf can intentionally be non-selectable;
- changing children never changes the selection contract automatically.

## 8. Knowledge URL contract

Canonical URLs derive directly from the ID:

```text
/knowledge
/knowledge/graph
/knowledge/graph/shortest-path
/knowledge/graph/shortest-path/dijkstra
```

`graph.shortest-path.dijkstra` maps reversibly to `graph/shortest-path/dijkstra`.

Recommended detail route:

```text
app/knowledge/[...segments]/page.tsx
```

Contract:

- `/knowledge` is the overview;
- any known node path can be viewed, including non-selectable grouping nodes;
- unknown or malformed paths return 404;
- names and separate slugs do not define identity;
- path resolution goes through the catalog.

Recommended APIs:

```ts
getKnowledgeHref(id: KnowledgeId): string
resolveKnowledgePath(segments: readonly string[]): KnowledgeCatalogEntry | undefined
```

## 9. Problems knowledge filter contract

Canonical forms:

```text
/problems
/problems?knowledge=graph
/problems?knowledge=graph.shortest-path.dijkstra
```

Filter state is explicit:

```ts
export type KnowledgeFilter =
  | { readonly state: "none" }
  | { readonly state: "valid"; readonly id: KnowledgeId }
  | {
      readonly state: "invalid";
      readonly rawValue: string;
      readonly reason:
        | "malformed-id"
        | "unknown-id"
        | "multiple-values"
        | "legacy-category";
    };
```

Behavior:

- no `knowledge` parameter means `none`;
- a known node, selectable or not, is a valid filter;
- malformed, unknown, or repeated `knowledge` parameters are invalid;
- any presence of `?category=` is invalid legacy input, including when a valid `knowledge` parameter is also present;
- `?category=` is never translated or accepted as `knowledge`;
- invalid input never becomes an unfiltered query.

For an invalid filter, the Problems page must show “Invalid / unknown knowledge filter”, safely show the rejected value, provide a clear-filter link that removes both current and legacy taxonomy parameters, and not render the full Problem list as if filtering succeeded. It may return an empty result or skip query execution while displaying that state.

A valid parent filter matches Problems directly selecting that node or any descendant. A leaf filter matches direct selection of that leaf. Initial V2 supports one knowledge filter; multi-filter `any`/`all` semantics are deferred.

## 10. Generic Knowledge statistics

```ts
export type KnowledgeStats = {
  readonly id: KnowledgeId;
  readonly direct: ProblemStats;
  readonly rollup: ProblemStats;
};
```

`direct` includes only Problems explicitly storing that ID. `rollup` includes Problems storing the node or any descendant.

For rollup, each Problem is processed independently:

1. validate its selected IDs;
2. expand every selected ID to include ancestors;
3. union the expanded IDs into a per-Problem set;
4. contribute the Problem at most once to each node;
5. aggregate Total and A/B/C/D from the deduplicated sets.

Rollup must never sum child totals because one Problem can select multiple descendants under the same parent. A multi-knowledge Problem counts once in every applicable branch, while global Total still counts it once. Branch percentages can overlap.

Knowledge overview/detail and general mastery statistics use `rollup` by default and may show `direct` as supplementary information.

## 11. D Knowledge Gap policy boundary

D Knowledge Gaps are a separate consumer, not an automatic alias for generic rollup statistics.

The foundation provides validated selections, ancestor expansion, Problem-level deduplication, and generic direct/rollup statistics. It does not decide:

- which levels a D-gap ranking displays;
- whether ranking uses direct or rolled-up nodes;
- how broad parents compete with Techniques;
- how overlapping branches are presented.

Required marker:

> Knowledge Gap presentation policy requires an explicit rule at the statistics consumer stage.

Until that policy is approved:

- do not rank gaps by summing child counts;
- do not silently replace current product behavior with rollup ranking;
- do not infer a display level only from depth;
- keep generic aggregation separate from D-gap presentation.

This deferral does not block taxonomy foundation, Problem schema, Knowledge pages, Problems filtering, or generic mastery statistics. It blocks the final redesign of the D Knowledge Gap ranking UI.

## 12. Selector UI contract

Replace the flat checkbox list with a searchable tree selector that:

- shows hierarchy and breadcrumb names;
- searches display names, IDs, and breadcrumb text;
- shows selection controls only for `selectable: true` nodes;
- lets non-selectable grouping nodes expand;
- displays selections as breadcrumb chips;
- submits stable IDs, never names;
- supports sibling and cross-branch selections;
- prevents duplicates and ancestor/descendant combinations.

Conflict handling is conservative: disable a conflicting ancestor or descendant and explain why. Do not silently remove an existing selection.

## 13. Knowledge and tags boundary

Knowledge is controlled, ID-based, hierarchical, validated, and used for browsing, filtering, and statistics. Tags remain free text without hierarchy, catalog validation, ancestor inference, or automatic migration. A tag remains a tag even if its text equals a knowledge name or ID.

## 14. Strict legacy rejection with `.passthrough()`

The Problem schema may preserve unrelated unknown fields, but `categories` is a reserved forbidden key:

```ts
const problemFrontmatterSchema = z
  .object({
    knowledge: problemKnowledgeSchema,
    tags: tagsSchema,
    // other current fields
  })
  .passthrough()
  .superRefine((value, context) => {
    if (Object.prototype.hasOwnProperty.call(value, "categories")) {
      context.addIssue({
        code: "custom",
        path: ["categories"],
        message: "Legacy categories is not supported; use knowledge",
      });
    }
  });
```

Any own `categories` key is invalid, including `[]` or `null`. Files containing both fields and categories-only files are invalid. There is no migration, fallback, alias, or dual write. Tests must prove these cases.

## 15. Final naming

Recommended names:

```text
config/knowledge-taxonomy.ts

KnowledgeId
KnowledgeNodeDefinition
KnowledgeNode
KnowledgeCatalogEntry
KnowledgeFilter
KnowledgeStats

knowledgeTaxonomy
knowledgeCatalog
knowledgeIdSchema
problemKnowledgeSchema

defineKnowledgeTaxonomy()
isKnowledgeId()
getKnowledgeEntry()
getKnowledgeAncestors()
getKnowledgeDescendants()
expandKnowledgeToAncestors()
validateKnowledgeSelection()
getKnowledgeHref()
resolveKnowledgePath()
getKnowledgeStats()
```

Remove old public language during cutover:

```text
Category
CategoryStats
categorySchema
categoryValues
categoryMetadata
getCategoryBySlug()
getCategoryStats()
ProblemQuery.category
frontmatter.categories
summary.categories
dKnowledgeGaps.categories
```

UI names use `KnowledgeNode`, `KnowledgeStatistics`, or `KnowledgeTaxonomy`, not `KnowledgeCategory`.

## 16. Changes from the previous proposal

1. `selectable` is now required and never derived from leaf/non-leaf state.
2. Adding children cannot invalidate an existing selection by itself.
3. Changing a used node to non-selectable is explicitly breaking.
4. Dotted IDs are stable within a stable hierarchy, not hierarchy-independent.
5. Reparenting, semantic rename, and ID segment changes are explicitly breaking.
6. Removed IDs cannot be reused, and V2 adds no opaque ID/slug layer.
7. Problems filters now have `none`, `valid`, and `invalid` states.
8. Unknown, malformed, repeated, and legacy filter inputs have explicit reasons and UI behavior.
9. Invalid filters cannot expose the full unfiltered list.
10. Generic `KnowledgeStats.direct` and `.rollup` remain unchanged.
11. D Knowledge Gap ranking/display semantics are explicitly deferred.
12. D-gap consumers may not silently adopt child-sum or generic rollup ranking.

## 17. Frozen and deferred areas

### 17.1 Frozen for implementation

- hierarchical dotted IDs with one to three aligned segments;
- explicit `selectable: boolean` on every node;
- required `knowledge: KnowledgeId[]`, with `[]` valid;
- rejection of duplicate, unknown, non-selectable, and ancestor/descendant selections;
- explicit rejection of legacy `categories`;
- one authored taxonomy tree with derived indexes, relationships, and URLs;
- ID-path Knowledge URLs;
- explicit invalid Problems filter state;
- parent filters including descendants;
- generic direct and Problem-deduplicated rollup statistics;
- separation between controlled knowledge and free tags;
- the stability/breaking boundaries defined above.

### 17.2 Explicitly deferred

- the complete initial XCPC taxonomy node inventory;
- final names and descriptions for all nodes;
- D Knowledge Gap ranking/display policy;
- multi-knowledge filter `any`/`all` semantics;
- tooling for a future breaking reparent/data rewrite;
- retirement metadata beyond non-reuse of removed IDs.

## 18. Internal consistency review

The revised contract contains no known contradiction within its frozen scope:

- explicit `selectable` removes the child-addition stability problem;
- readable dotted IDs and URL derivation remain compatible with declaring reparenting breaking;
- invalid filters are distinct from no filter and cannot silently show all Problems;
- generic ancestor rollup remains well-defined without imposing a D-gap presentation policy;
- selectable non-leaf nodes remain consistent with ancestor/descendant pair rejection;
- non-selectable parents may still be valid navigation and filter nodes because selection validity and filter validity are separate;
- required `knowledge` and explicit legacy rejection coexist with passthrough of unrelated fields.

## 19. Minimum safe next implementation task

The smallest safe next phase is **taxonomy foundation only**, without cutting over Problem schema or UI:

1. add the knowledge types and definition validator;
2. add immutable catalog construction and lookup APIs;
3. add routing conversion and selection-validation primitives;
4. add focused tests for syntax, uniqueness, depth, parent alignment, explicit selectable behavior, ancestors, URL reversibility, duplicates, and ancestor/descendant conflicts;
5. use test-local taxonomy fixtures until the production node inventory is approved;
6. do not yet modify Problem Front Matter, parser/writer, forms, pages, existing tests, or `data/problems` in this minimum task.

This isolates foundational invariants before the one-way Schema cutover. A later task can add the approved production taxonomy and switch Problem validation against the tested catalog.
