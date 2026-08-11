import { randomUUID } from "node:crypto";
import {
  link,
  mkdir,
  open,
  readFile,
  readdir,
  rename,
  unlink,
} from "node:fs/promises";
import path from "node:path";

import type { ReviewCompletionInput } from "@/lib/review/completion";

import {
  completeProblemReviewMarkdown,
  parseProblemMarkdown,
  serializeProblemMarkdown,
  updateProblemMarkdown,
} from "./markdown";
import { problemFrontmatterSchema, type ProblemDocument } from "./schema";
import { ProblemDataError } from "./errors";
import type {
  ProblemFile,
  ProblemLoadError,
  ProblemLoadErrorCode,
  ProblemLoadResult,
  ProblemUpdate,
} from "./types";

const problemIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type ParsedCandidate = ProblemFile;
type CandidateResult =
  | { problem: ParsedCandidate }
  | { error: ProblemLoadError };

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown problem data error";
}

function classifyParseError(error: unknown): ProblemLoadErrorCode {
  if (error instanceof SyntaxError) {
    return "yaml-error";
  }

  if (error instanceof TypeError) {
    return "validation-error";
  }

  return "frontmatter-error";
}

function assertValidId(id: string): void {
  if (!problemIdPattern.test(id)) {
    throw new ProblemDataError(
      "invalid-id",
      "Problem ID must use lowercase letters, numbers, and single hyphens",
    );
  }
}

async function removeTemporaryFile(filePath: string): Promise<void> {
  try {
    await unlink(filePath);
  } catch (error) {
    if (!isNodeError(error) || error.code !== "ENOENT") {
      throw error;
    }
  }
}

async function writeAtomically(
  targetPath: string,
  content: string,
  mode: "create" | "replace",
): Promise<void> {
  const directory = path.dirname(targetPath);
  const temporaryPath = path.join(
    directory,
    `.${path.basename(targetPath)}.${process.pid}.${randomUUID()}.tmp`,
  );
  const handle = await open(temporaryPath, "wx");

  try {
    try {
      await handle.writeFile(content, "utf8");
      await handle.sync();
    } finally {
      await handle.close();
    }

    if (mode === "create") {
      await link(temporaryPath, targetPath);
      await unlink(temporaryPath);
    } else {
      await rename(temporaryPath, targetPath);
    }
  } catch (error) {
    await removeTemporaryFile(temporaryPath);
    throw error;
  }
}

export class ProblemRepository {
  readonly directory: string;
  private loadPromise?: Promise<ProblemLoadResult>;

  constructor(directory: string) {
    this.directory = path.resolve(directory);
  }

  private problemPath(id: string): string {
    assertValidId(id);
    const filePath = path.resolve(this.directory, `${id}.md`);

    if (path.dirname(filePath) !== this.directory) {
      throw new ProblemDataError("invalid-id", "Problem path leaves the data directory");
    }

    return filePath;
  }

  private invalidate(): void {
    this.loadPromise = undefined;
  }

  loadAll(): Promise<ProblemLoadResult> {
    this.loadPromise ??= this.readAll();
    return this.loadPromise;
  }

  async findById(id: string): Promise<ProblemFile | null> {
    assertValidId(id);
    const result = await this.loadAll();
    const problem = result.problems.find((candidate) => candidate.frontmatter.id === id);

    if (problem) {
      return problem;
    }

    const fileName = `${id}.md`;
    const loadError = result.errors.find((error) => error.fileName === fileName);

    if (loadError) {
      throw new ProblemDataError(
        loadError.code,
        loadError.message,
        loadError.fileName,
      );
    }

    return null;
  }

  async create(problem: ProblemDocument): Promise<ProblemFile> {
    const validated = problemFrontmatterSchema.parse(problem.frontmatter);
    const fileName = `${validated.id}.md`;
    const filePath = this.problemPath(validated.id);
    const source = serializeProblemMarkdown(validated, problem.content);

    await mkdir(this.directory, { recursive: true });

    try {
      await writeAtomically(filePath, source, "create");
    } catch (error) {
      if (isNodeError(error) && error.code === "EEXIST") {
        throw new ProblemDataError(
          "already-exists",
          `Problem already exists: ${validated.id}`,
          fileName,
          { cause: error },
        );
      }

      throw error;
    }

    this.invalidate();
    return { frontmatter: validated, content: problem.content, fileName };
  }

  async update(id: string, update: ProblemUpdate): Promise<ProblemFile> {
    const filePath = this.problemPath(id);
    const fileName = path.basename(filePath);
    let source: string;

    try {
      source = await readFile(filePath, "utf8");
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") {
        throw new ProblemDataError(
          "read-error",
          `Problem not found: ${id}`,
          fileName,
          { cause: error },
        );
      }

      throw error;
    }

    const current = parseProblemMarkdown(source);

    if (current.frontmatter.id !== id) {
      throw new ProblemDataError(
        "id-mismatch",
        `Filename ${fileName} does not match Front Matter ID ${current.frontmatter.id}`,
        fileName,
      );
    }

    const nextSource = updateProblemMarkdown(source, update);
    const next = parseProblemMarkdown(nextSource);
    await writeAtomically(filePath, nextSource, "replace");
    this.invalidate();

    return { ...next, fileName };
  }

  async completeReview(
    id: string,
    input: ReviewCompletionInput,
  ): Promise<ProblemFile> {
    const filePath = this.problemPath(id);
    const fileName = path.basename(filePath);
    let source: string;

    try {
      source = await readFile(filePath, "utf8");
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") {
        throw new ProblemDataError(
          "read-error",
          `Problem not found: ${id}`,
          fileName,
          { cause: error },
        );
      }

      throw error;
    }

    const current = parseProblemMarkdown(source);

    if (current.frontmatter.id !== id) {
      throw new ProblemDataError(
        "id-mismatch",
        `Filename ${fileName} does not match Front Matter ID ${current.frontmatter.id}`,
        fileName,
      );
    }

    const nextSource = completeProblemReviewMarkdown(source, input);
    const next = parseProblemMarkdown(nextSource);
    await writeAtomically(filePath, nextSource, "replace");
    this.invalidate();

    return { ...next, fileName };
  }

  private async readAll(): Promise<ProblemLoadResult> {
    let entries;

    try {
      entries = await readdir(this.directory, { withFileTypes: true });
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") {
        return { problems: [], errors: [] };
      }

      throw error;
    }

    const fileNames = entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right));

    const settled = await Promise.all(
      fileNames.map(async (fileName): Promise<CandidateResult> => {
        let source: string;

        try {
          source = await readFile(path.join(this.directory, fileName), "utf8");
        } catch {
          return {
            error: {
              fileName,
              code: "read-error",
              message: "Unable to read this Markdown file",
            },
          };
        }

        try {
          const problem = parseProblemMarkdown(source);
          return {
            problem: { ...problem, fileName } satisfies ParsedCandidate,
          };
        } catch (error) {
          return {
            error: {
              fileName,
              code: classifyParseError(error),
              message: errorMessage(error),
            } satisfies ProblemLoadError,
          };
        }
      }),
    );

    const errors: ProblemLoadError[] = [];
    const candidates: ParsedCandidate[] = [];

    for (const item of settled) {
      if ("error" in item) {
        errors.push(item.error);
      } else {
        candidates.push(item.problem);
      }
    }
    const filesById = new Map<string, string[]>();

    for (const candidate of candidates) {
      const id = candidate.frontmatter.id;
      filesById.set(id, [...(filesById.get(id) ?? []), candidate.fileName]);
    }

    const duplicateIds = new Set(
      [...filesById.entries()]
        .filter(([, names]) => names.length > 1)
        .map(([id]) => id),
    );
    const problems: ProblemFile[] = [];

    for (const candidate of candidates) {
      const id = candidate.frontmatter.id;

      if (duplicateIds.has(id)) {
        errors.push({
          fileName: candidate.fileName,
          code: "duplicate-id",
          message: `Duplicate problem ID ${id} appears in: ${filesById.get(id)?.join(", ")}`,
        });
        continue;
      }

      const expectedFileName = `${id}.md`;

      if (candidate.fileName !== expectedFileName) {
        errors.push({
          fileName: candidate.fileName,
          code: "id-mismatch",
          message: `Filename must be ${expectedFileName} for problem ID ${id}`,
        });
        continue;
      }

      problems.push(candidate);
    }

    errors.sort((left, right) => left.fileName.localeCompare(right.fileName));
    return { problems, errors };
  }
}

export function createProblemRepository(
  directory = defaultProblemDirectory(),
): ProblemRepository {
  return new ProblemRepository(directory);
}

function defaultProblemDirectory(): string {
  const configuredDirectory = process.env.XCPC_PROBLEMS_DIRECTORY?.trim();
  return configuredDirectory
    ? path.resolve(configuredDirectory)
    : path.join(process.cwd(), "data", "problems");
}
