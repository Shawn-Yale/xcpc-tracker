# Review System

The Review queue is derived from each problem's persisted `nextReviewDate`; reading a page never changes that date. A date before today is Overdue, today is Today, and dates from tomorrow through seven calendar days later are Upcoming. Overdue items keep their original date and sort oldest first.

## Interval Suggestions

The completion form proposes a status-based interval:

- `A`: at least 30 days, or twice the previous interval.
- `B`: at least 14 days, or 1.5 times the previous interval.
- `C`: reset to 7 days.
- `D`: reset to 3 days.

Suggestions are capped at 365 days. They are defaults only: the user may enter any positive whole-day interval or disable further scheduling. The next date is always `review date + interval`, using local calendar-day arithmetic.

## Completion Guarantees

`completeReview(problem, input)` is a pure function. It accepts any A/B/C/D transition, sets the current status, and appends a new history item whose `fromStatus` is the status immediately before submission. Existing history is never edited. Disabling scheduling stores both `nextReviewDate` and `reviewIntervalDays` as `null`.

The Server Action re-reads the Markdown file before applying the transition, validates the completed document, and uses the repository's atomic replacement path. Failures leave the original file unchanged and are shown in the form.
