# XCPC Tracker

A local-first personal training tracker for XCPC/ICPC practice. The application is being built around durable Markdown records, A/B/C/D mastery assessment, scheduled reviews, and training statistics.

## Current Status

The repository currently contains the MVP foundation, Problem Front Matter schema, a safe filesystem repository, and responsive Dashboard, Problems, Knowledge, Status, Review, and Statistics views. Problems persist stable IDs from the frozen, hierarchical XCPC Knowledge Taxonomy V1, while tags remain independent free text. Statistics covers direct and ancestor-rollup Knowledge mastery, training volume, a 12-week activity heatmap, platform and Rating distributions, Rating trends, Review conversions, and direct-only D-class knowledge gaps. Problems remain editable through validated local forms and Review history stays append-only. The production Problem directory may be empty; tests and E2E use isolated fixtures.

## Requirements

- Node.js 20.9 or newer (an active LTS release is recommended)
- npm 10 or newer

## Local Development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in a browser.

## Quality Checks

```bash
npm run lint       # Run ESLint
npm run typecheck  # Check TypeScript without emitting files
npm test           # Run the Vitest suite once
npm run build      # Create a production build
npm run test:e2e   # Build and run desktop/mobile Playwright smoke tests
npm run test:performance # Benchmark a 5,000-file repository scan
npm run backup:status # Inspect GitHub/branch/data safety without changing Git
npm run backup:check  # Run backup safety checks and all quality gates
```

## Project Layout

- `app/` — App Router pages and the root layout.
- `components/` — shared layout and UI components.
- `config/` — centralized application configuration.
- `lib/` — framework-independent schema and business rules.
- `data/problems/` — Markdown problem records, one file per stable problem ID.
- `tests/` — cross-module and foundation tests.

See `SPEC.md` for product requirements, `PLAN.md` for the approved implementation sequence, `docs/problem-schema.md` for the Front Matter contract, `docs/data-layer.md` for repository safety guarantees, `docs/review-system.md` for Review scheduling rules, `docs/problem-editor.md` for local create/edit behavior, `docs/dashboard.md` for Dashboard definitions, `docs/statistics.md` for analytical definitions, and `docs/ux-acceptance.md` for the Phase 10 browser and accessibility record.

The frozen taxonomy contract and inventory are documented in `docs/TAXONOMY_V2_CONTRACT.md` and `docs/XCPC_TAXONOMY_V1_PROPOSAL.md`. Runtime taxonomy data has one authored source of truth: `config/knowledge-taxonomy.ts`.

## GitHub Backup

Problem Markdown and source code are backed up through explicit Git commits; the
application never stores a GitHub token or pushes automatically. Run
`npm run backup:status` during a session and `npm run backup:check` before a
commit. Then review, commit, rebase, and push the intended files. Follow
[`docs/github-backup.md`](docs/github-backup.md) for the complete safe workflow,
conflict handling, verification, and recovery steps.
