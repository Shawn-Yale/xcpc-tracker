# Statistics Definitions

The `/statistics` route derives every result from current Problem Front Matter and append-only Review History. It does not persist counters, mastery flags, or conversion fields.

## Problem-based Metrics

- Status distribution counts each valid problem once using its current status.
- Mastery Rate is `(A + B) / Total`; an empty dataset returns 0%.
- Every taxonomy node has `direct` statistics for Problems explicitly selecting that ID and `rollup` statistics for the node plus all descendants. Rollup expands each Problem to a unique ancestor set, so sibling selections under one parent never double-count that Problem. Global Total also counts each Problem once.
- Platform percentages use all valid problems as the denominator.
- Rating distribution and trend exclude missing ratings. The trend groups records by `solvedAt` and averages ratings on the same day.
- Last 7 and 30 days include today and use local calendar boundaries. This Year starts on January 1 and excludes future dates.

## Activity and Review Metrics

The 12-week heatmap counts two event types: first solves from `solvedAt` and Review events from `reviews[].date`. Its values are activity counts, not unique problems.

The conversion matrix counts every Review transition. C/D conversion rates are problem-based: the denominator is problems observed in that source status, and a problem converts when a later recorded state reaches A or B. Multiple round trips still count the problem once.

## Knowledge Gaps

D gaps include only problems whose current status is D. Knowledge ranking is direct-only: each explicitly selected `KnowledgeId` contributes at most once per Problem and does not increment ancestors. Tags are counted independently, so percentages can overlap. D Problems with `knowledge: []` are reported separately as unclassified.

All aggregators are pure, deterministic, and accept an explicit local `today` where date windows are required.
