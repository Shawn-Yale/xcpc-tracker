# Problem Markdown Schema

Each problem is stored as one `data/problems/<id>.md` file. YAML Front Matter contains structured training facts; the Markdown body contains the long-form retrospective. `mastered` is never stored and is derived from the current status.

```yaml
---
id: codeforces-1996-g
title: "Example Problem"
platform: Codeforces
contest: "Codeforces Round 1996"
problem: G
url: "https://codeforces.com/contest/1996/problem/G"
rating: 2100
solvedAt: "2026-08-10"
durationMinutes: 120
status: C
knowledge:
  - graph.shortest-path.dijkstra
  - data-structure.heap
tags:
  - XOR
  - 线性基
nextReviewDate: "2026-08-14"
reviewIntervalDays: 4
reviews:
  - date: "2026-08-14"
    fromStatus: C
    toStatus: B
    durationMinutes: 70
    note: "第二次已经能够独立推导核心性质。"
    nextIntervalDays: 14
---

# 题意抽象

...
```

## Field Rules

- Required: `id`, `title`, `platform`, `solvedAt`, `status`, and `knowledge`.
- `id` is stable kebab-case and must match the filename once persistence is implemented.
- `status` is exactly `A`, `B`, `C`, or `D`; only A/B are mastered.
- `platform` comes from centralized configuration. Every `knowledge` value is a stable `KnowledgeId` from the frozen production taxonomy in `config/knowledge-taxonomy.ts`.
- `knowledge` must be present. `knowledge: []` explicitly means “not yet classified”; there is no default. Selected IDs must exist, be explicitly `selectable: true`, contain no duplicates, and contain no ancestor/descendant pair. Sibling and cross-branch selections are allowed.
- Legacy `categories` is a reserved invalid key, including `categories: []`, `categories: null`, or a document containing both fields. There is no migration, fallback, or dual read.
- Tags are an independent free-text array. They are not taxonomy IDs and are not inferred from or converted into Knowledge.
- Dates are quoted `YYYY-MM-DD` local calendar dates. They are not timestamps and never use a UTC day boundary.
- Optional text and numeric values may be omitted or set to `null`. Present durations, ratings, and intervals are positive integers.
- `nextReviewDate` and `reviewIntervalDays` are either both present or both empty. A due date is not changed until a Review is completed.
- `reviews` defaults to an empty array. Each entry records a transition and will be append-only in the persistence layer.
- Unrelated unknown Front Matter fields pass validation so the writer can preserve forward-compatible data; this does not weaken the explicit `categories` rejection.

The normalized TypeScript model requires explicit `knowledge` and defaults only `tags` and `reviews` to empty arrays. The data layer validates this model while preserving unrelated unknown YAML fields, comments, body content, and existing Review History during general edits.
