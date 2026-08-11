# Markdown Data Layer

`ProblemRepository` is the single filesystem boundary for `data/problems/*.md`. Create a repository per request with `createProblemRepository()` or inject a temporary directory in tests with `new ProblemRepository(directory)`.

## Read API

- `loadAll()` scans the directory once per repository instance and returns `{ problems, errors }`. Repeated calls reuse the same promise until a successful write invalidates it.
- `findById(id)` returns one valid problem, `null` when absent, or throws `ProblemDataError` when its file exists but is damaged.
- Each loaded `ProblemFile` contains normalized `frontmatter`, untouched Markdown `content`, and a relative `fileName`. Absolute paths are not exposed.

Invalid YAML, invalid Schema fields, filename/ID mismatches, and duplicate IDs are reported per file. They do not prevent unrelated valid records from loading.

The Problem schema requires an explicit `knowledge: KnowledgeId[]`. IDs are validated against the production taxonomy and its selection rules. `knowledge: []` is valid, while any legacy `categories` key is a per-file validation error. An absent or empty `data/problems/` directory is a valid production state and returns an empty Problem collection.

## Write API

- `create(problem)` validates the complete document and refuses to replace an existing ID.
- `update(id, update)` accepts only editable Front Matter fields and/or Markdown content. It cannot change `id` or `reviews`.
- Writes are prepared in a same-directory temporary file, flushed, and then installed atomically. A failed validation occurs before replacement.
- Existing YAML nodes are reused during update, preserving unknown fields, comments, field order, Review History, and unchanged Markdown content.

Review completion uses the repository's dedicated append workflow; Review History remains deliberately unavailable through the general update API.

## Performance Check

The opt-in benchmark creates and loads 5000 temporary Markdown records:

```bash
XCPC_RUN_PERF=1 npm test -- tests/problem-repository.performance.test.ts
```

Normal `npm test` skips this filesystem-heavy benchmark. Record the latest local result here whenever the repository implementation changes materially.

Latest result (2026-08-10, local workspace): **5000 files loaded in 332.0 ms**, with zero load errors.
