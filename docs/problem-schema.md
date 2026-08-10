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
categories:
  - 图论
  - 位运算与状态压缩
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

- Required: `id`, `title`, `platform`, `solvedAt`, and `status`.
- `id` is stable kebab-case and must match the filename once persistence is implemented.
- `status` is exactly `A`, `B`, `C`, or `D`; only A/B are mastered.
- `platform` and `categories` come from centralized configuration. Categories and tags are arrays without duplicate values.
- Dates are quoted `YYYY-MM-DD` local calendar dates. They are not timestamps and never use a UTC day boundary.
- Optional text and numeric values may be omitted or set to `null`. Present durations, ratings, and intervals are positive integers.
- `nextReviewDate` and `reviewIntervalDays` are either both present or both empty. A due date is not changed until a Review is completed.
- `reviews` defaults to an empty array. Each entry records a transition and will be append-only in the persistence layer.
- Unknown Front Matter fields pass validation so the later writer can preserve forward-compatible data.

The normalized TypeScript model also defaults `categories`, `tags`, and `reviews` to empty arrays. The data layer validates this model while preserving unknown YAML fields, comments, body content, and existing Review History during general edits.
