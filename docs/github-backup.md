# GitHub Backup Workflow

GitHub is the off-machine backup for both application code and the durable
records in `data/problems/*.md`. The web application never stores credentials or
runs Git commands. Commits and pushes remain an explicit user action, as required
by the local-first specification.

## One-time setup

The repository uses the SSH remote
`git@github.com:Shawn-Yale/xcpc-tracker.git`, and `main` tracks `origin/main`.
Keep the GitHub repository private if retrospectives contain personal notes.
Confirm SSH access with `ssh -T git@github.com` when setting up a new computer.

## End-of-session backup

Run these commands from the repository root:

```bash
git fetch origin
npm run backup:status
npm run backup:check
git status --short
```

Stage only the intended scope. For a normal training session:

```bash
git add -- data/problems
git diff --cached --check
git diff --cached -- data/problems
git commit -m "Update problem training records"
git pull --rebase origin main
git push origin main
```

For code changes, add the reviewed source and configuration files explicitly, or
use `git add -A` only after checking every entry in `git status --short`. Never
commit `.env*`, private keys, tokens, `.next/`, test reports, or local logs.
Use a separate imperative commit subject such as `Add GitHub backup preflight`.

After pushing, verify that no local commit is waiting for backup:

```bash
git fetch origin
git status --branch --short
git log --oneline origin/main..HEAD
```

The final command should print nothing. Do not use `git push --force`; if rebase
conflicts occur, preserve both sides of affected Markdown history, run the full
preflight again, and continue the rebase. Use `git rebase --abort` to return to
the pre-rebase state when unsure.

## Recovery

On a replacement computer, clone the private repository, run `npm ci`, then run
`npm run backup:check`. To recover one record, inspect its history with
`git log -- data/problems/<id>.md` and its old content with
`git show <commit>:data/problems/<id>.md`. Copy the desired version into a new
file first; only replace the current record after reviewing the diff, then commit
the recovery normally so the correction remains auditable.

Push after every data-entry or Review session. GitHub is the remote backup, but a
second periodic backup of the private repository or `data/problems/` on another
trusted device is recommended for protection against account loss.
