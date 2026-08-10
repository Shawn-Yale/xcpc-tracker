import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const statusOnly = process.argv.includes("--status");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    ...options,
  });

  if (result.error) throw result.error;
  return result;
}

function requireSuccess(command, args, label, options = {}) {
  const result = run(command, args, options);
  if (result.status !== 0) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(`${label}${detail ? `\n${detail}` : ""}`);
  }
  return typeof result.stdout === "string" ? result.stdout.trim() : "";
}

function git(...args) {
  return requireSuccess("git", args, `Git command failed: git ${args.join(" ")}`);
}

function candidateFiles() {
  return git("ls-files", "--cached", "--others", "--exclude-standard", "-z")
    .split("\0")
    .filter(Boolean);
}

function assertNoSensitiveFiles(files) {
  const sensitiveName = /(^|\/)(?:\.env(?:\..+)?|id_(?:rsa|ed25519)|[^/]+\.(?:pem|key|p12))$/i;
  const secretPatterns = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
    /\bgithub_pat_[A-Za-z0-9_]{20,}\b/,
    /\bAKIA[0-9A-Z]{16}\b/,
  ];

  for (const relativePath of files) {
    if (sensitiveName.test(relativePath) && path.basename(relativePath) !== ".env.example") {
      throw new Error(`Sensitive file must not be committed: ${relativePath}`);
    }

    try {
      const buffer = readFileSync(path.join(repositoryRoot, relativePath));
      if (buffer.length > 2_000_000 || buffer.includes(0)) continue;
      if (secretPatterns.some((pattern) => pattern.test(buffer.toString("utf8")))) {
        throw new Error(`Possible credential detected in: ${relativePath}`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("Possible credential")) {
        throw error;
      }
    }
  }
}

function assertProblemFilesAreTrackable() {
  const files = readdirSync(path.join(repositoryRoot, "data", "problems")).filter(
    (name) => name.endsWith(".md"),
  );
  const invalidName = files.find(
    (name) => !/^[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(name),
  );
  if (invalidName) {
    throw new Error(`Problem filename must match its kebab-case ID: ${invalidName}`);
  }

  for (const file of files) {
    const relativePath = path.posix.join("data", "problems", file);
    const ignored = run("git", ["check-ignore", "--no-index", "--quiet", relativePath]);
    if (ignored.status === 0) {
      throw new Error(`Problem data is ignored by Git: ${relativePath}`);
    }
  }
  return files.length;
}

function inspectRepository() {
  const actualRoot = git("rev-parse", "--show-toplevel");
  if (path.resolve(actualRoot) !== repositoryRoot) {
    throw new Error(`Unexpected repository root: ${actualRoot}`);
  }

  const remote = git("remote", "get-url", "origin");
  if (!/(?:^git@|^https:\/\/)github\.com[:/]/.test(remote)) {
    throw new Error(`origin is not a GitHub remote: ${remote}`);
  }

  const branch = git("branch", "--show-current");
  if (!branch) throw new Error("Detached HEAD is not safe for the backup workflow");
  const upstream = git("rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}");
  const [ahead, behind] = git("rev-list", "--left-right", "--count", `HEAD...${upstream}`)
    .split(/\s+/)
    .map(Number);
  const files = candidateFiles();

  assertNoSensitiveFiles(files);
  const problemCount = assertProblemFilesAreTrackable();
  requireSuccess("git", ["diff", "--check"], "Unstaged diff contains whitespace errors");
  requireSuccess("git", ["diff", "--cached", "--check"], "Staged diff contains whitespace errors");

  console.log(`GitHub remote: ${remote}`);
  console.log(`Branch: ${branch} -> ${upstream} (ahead ${ahead}, behind ${behind})`);
  console.log(`Trackable problem records: ${problemCount}`);
  console.log(`Tracked or unignored candidate files scanned: ${files.length}`);

  if (behind > 0) {
    throw new Error(
      `Local ${branch} is behind ${upstream}. Reconcile it before pushing; never force-push problem data.`,
    );
  }
}

function runQualityGates() {
  for (const [script, label] of [
    ["lint", "ESLint"],
    ["typecheck", "TypeScript"],
    ["test", "Vitest"],
    ["build", "production build"],
  ]) {
    console.log(`\n== ${label} ==`);
    requireSuccess("npm", ["run", script], `${label} failed`, { stdio: "inherit" });
  }
}

try {
  inspectRepository();
  if (!statusOnly) runQualityGates();
  console.log(
    statusOnly
      ? "\nBackup status check passed. Run npm run backup:check before committing."
      : "\nBackup preflight passed. Review and stage the intended files before committing.",
  );
} catch (error) {
  console.error(`\nBackup preflight failed: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
}
