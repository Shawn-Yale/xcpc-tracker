# Dashboard

The root route is the daily entry point for local training. It reads the same repository snapshot used by the rest of the application and performs no writes.

## Priority Queue

The first viewport shows Overdue, Today, and the next seven calendar days. Overdue and Today lists reuse the shared Review queue, including original planned dates, overdue-day calculations, status, rating, and knowledge categories. Visiting the Dashboard never advances a Review date.

## Progress and Backlog

Mastery uses the shared definition: only A and B are mastered. Total, A/B/C/D counts, Mastered, and Mastery Rate therefore match the Status and Knowledge views. The C/D Backlog prioritizes D problems, then C problems, and places unscheduled work first within each status so missing follow-up plans stay visible.

## Recent Activity

Recent Solved is ordered exclusively by the durable `solvedAt` field; filesystem modification time is intentionally ignored. Recent Reviews are flattened from append-only Review History and sorted newest first. This lets the page show both new training and status transitions without introducing another persisted activity model.

All dashboard selectors are pure and non-mutating. Empty datasets, empty daily queues, missing Review history, and an empty C/D Backlog each have a dedicated state.
