# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js App Router project. Route pages and the root layout live in `app/`; shared code is grouped by responsibility in `components/`, `config/`, and `lib/`. Put cross-module tests in `tests/` and durable problem records in `data/problems/`, with one Markdown file per problem. Group components and business logic by feature, such as `components/review/` and `lib/review/`. Keep the root limited to project-wide configuration and documentation.

## Build, Test, and Development Commands

Use npm and run commands from the repository root:

- `npm run dev` — start the Next.js development server.
- `npm run lint` — check Next.js, React, and TypeScript lint rules.
- `npm run typecheck` — run TypeScript without emitting files.
- `npm test` — run the Vitest suite once.
- `npm run build` — verify and create the production build.
- `npm run backup:status` — inspect GitHub backup state without changing Git.
- `npm run backup:check` — scan backup candidates and run all quality gates.

Commit `package-lock.json` whenever dependencies change. Use an active Node.js LTS release compatible with the versions declared in `package.json`.

## Coding Style & Naming Conventions

Follow ESLint and TypeScript strict-mode rules. Use two-space indentation and trailing commas in multiline TypeScript. Prefer `camelCase` for variables/functions, `PascalCase` for types/components, and `kebab-case` filenames such as `section-placeholder.tsx`. Use the `@/` alias for application imports. Keep business logic outside React components and avoid generic dumping grounds such as `helpers` or `misc`.

## Testing Guidelines

Vitest is the unit-test framework. Name files `*.test.ts` and organize them around observable behavior, for example `tests/navigation.test.ts`. Every business-rule change must test normal paths, boundaries, empty input, and failures where applicable. Bug fixes require a regression test. Run targeted tests during development and `npm test` before handoff.

## Commit & Pull Request Guidelines

The history currently contains only `first commit`, so no mature convention exists. Use short, imperative subjects such as `Add contest status filter`; keep unrelated changes in separate commits. Pull requests should include a concise summary, validation steps, and links to relevant issues. Add screenshots or recordings for visible UI changes, and call out configuration changes or follow-up work. Keep PRs small enough to review independently and ensure all configured checks pass before requesting review.

## Data Backup Safety

Treat `data/problems/*.md` as durable user data. Before committing or pushing,
run `npm run backup:check`, inspect `git diff --cached`, and keep data changes in
an explicit commit. Never force-push, rewrite Review History, commit credentials,
or automate Git operations from the web application. Follow
`docs/github-backup.md` for rebase, verification, and recovery procedures.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
