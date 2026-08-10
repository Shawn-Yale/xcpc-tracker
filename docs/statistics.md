# Statistics Definitions

The `/statistics` route derives every result from current Problem Front Matter and append-only Review History. It does not persist counters, mastery flags, or conversion fields.

## Problem-based Metrics

- Status distribution counts each valid problem once using its current status.
- Mastery Rate is `(A + B) / Total`; an empty dataset returns 0%.
- Category statistics count a multi-category problem in every matching category, while global Total remains one.
- Platform percentages use all valid problems as the denominator.
- Rating distribution and trend exclude missing ratings. The trend groups records by `solvedAt` and averages ratings on the same day.
- Last 7 and 30 days include today and use local calendar boundaries. This Year starts on January 1 and excludes future dates.

## Activity and Review Metrics

The 12-week heatmap counts two event types: first solves from `solvedAt` and Review events from `reviews[].date`. Its values are activity counts, not unique problems.

The conversion matrix counts every Review transition. C/D conversion rates are problem-based: the denominator is problems observed in that source status, and a problem converts when a later recorded state reaches A or B. Multiple round trips still count the problem once.

## Knowledge Gaps

D gaps include only problems whose current status is D. Each category and tag is counted independently, so percentages can overlap. Unclassified D problems are reported separately.

All aggregators are pure, deterministic, and accept an explicit local `today` where date windows are required.
