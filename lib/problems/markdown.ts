import { isSeq, parseDocument, stringify, type Document } from "yaml";
import { ZodError } from "zod";

import {
  completeReview,
  type ReviewCompletionInput,
} from "@/lib/review/completion";

import {
  problemFrontmatterSchema,
  type ProblemDocument,
  type ProblemFrontmatter,
  type ProblemFrontmatterInput,
} from "./schema";
import type { ProblemFrontmatterPatch, ProblemUpdate } from "./types";

const frontmatterPattern =
  /^(?:\uFEFF)?---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;

const editableFields = new Set<string>([
  "title",
  "platform",
  "contest",
  "problem",
  "url",
  "rating",
  "solvedAt",
  "durationMinutes",
  "status",
  "knowledge",
  "tags",
  "nextReviewDate",
  "reviewIntervalDays",
]);

type ParsedMarkdownSource = {
  document: Document;
  data: Record<string, unknown>;
  content: string;
  header: string;
  lineEnding: "\n" | "\r\n";
};

function formatValidationError(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const field = issue.path.length > 0 ? issue.path.join(".") : "frontmatter";
      return `${field}: ${issue.message}`;
    })
    .join("; ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseMarkdownSource(source: string): ParsedMarkdownSource {
  const match = frontmatterPattern.exec(source);

  if (!match) {
    throw new Error("Markdown file must begin with a complete YAML Front Matter block");
  }

  const yamlSource = match[1];
  const document = parseDocument(yamlSource, {
    prettyErrors: false,
    strict: true,
    uniqueKeys: true,
  });

  if (document.errors.length > 0) {
    throw new SyntaxError(document.errors.map((error) => error.message).join("; "));
  }

  const data: unknown = document.toJS({ maxAliasCount: 50 });

  if (!isRecord(data)) {
    throw new TypeError("YAML Front Matter must be a mapping object");
  }

  return {
    document,
    data,
    content: source.slice(match[0].length),
    header: source.slice(0, match[0].length),
    lineEnding: source.includes("\r\n") ? "\r\n" : "\n",
  };
}

function parseFrontmatter(data: Record<string, unknown>): ProblemFrontmatter {
  try {
    return problemFrontmatterSchema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new TypeError(formatValidationError(error), { cause: error });
    }

    throw error;
  }
}

function renderDocument(
  document: Document,
  content: string,
  lineEnding: "\n" | "\r\n" = "\n",
): string {
  const yamlSource = document.toString({ lineWidth: 0 }).replaceAll("\n", lineEnding);
  return `---${lineEnding}${yamlSource}---${lineEnding}${content}`;
}

function valuesEqual(left: unknown, right: unknown): boolean {
  if (left == null && right == null) {
    return true;
  }

  return JSON.stringify(left) === JSON.stringify(right);
}

export function parseProblemMarkdown(source: string): ProblemDocument {
  const parsed = parseMarkdownSource(source);

  return {
    frontmatter: parseFrontmatter(parsed.data),
    content: parsed.content,
  };
}

export function serializeProblemMarkdown(
  frontmatter: ProblemFrontmatterInput,
  content: string,
): string {
  const validated = problemFrontmatterSchema.parse(frontmatter);
  const yamlSource = stringify(validated, { lineWidth: 0 });
  const document = parseDocument(yamlSource, {
    prettyErrors: false,
    strict: true,
    uniqueKeys: true,
  });

  return renderDocument(document, content);
}

export function updateProblemMarkdown(
  source: string,
  update: ProblemUpdate,
): string {
  const parsed = parseMarkdownSource(source);
  const current = parseFrontmatter(parsed.data);
  const patch = update.frontmatter ?? {};

  for (const field of Object.keys(patch)) {
    if (!editableFields.has(field)) {
      throw new TypeError(`Front Matter field cannot be updated here: ${field}`);
    }
  }

  const mergedData: Record<string, unknown> = { ...parsed.data };

  for (const [field, value] of Object.entries(patch)) {
    if (value !== undefined) {
      mergedData[field] = value;
    }
  }

  const validated = parseFrontmatter(mergedData);

  if (validated.id !== current.id) {
    throw new TypeError("Problem ID is immutable");
  }

  const nextDocument = parsed.document.clone();
  let frontmatterChanged = false;

  for (const [field, value] of Object.entries(patch)) {
    if (value === undefined) {
      continue;
    }

    const normalizedValue = validated[field];

    if (!valuesEqual(parsed.data[field], normalizedValue)) {
      nextDocument.set(field, normalizedValue);
      frontmatterChanged = true;
    }
  }

  if (!frontmatterChanged) {
    return update.content === undefined
      ? source
      : `${parsed.header}${update.content}`;
  }

  return renderDocument(
    nextDocument,
    update.content ?? parsed.content,
    parsed.lineEnding,
  );
}

export function completeProblemReviewMarkdown(
  source: string,
  input: ReviewCompletionInput,
): string {
  const parsed = parseMarkdownSource(source);
  const current = parseFrontmatter(parsed.data);
  const completed = completeReview(current, input);
  const nextDocument = parsed.document.clone();
  const appendedReview = completed.reviews.at(-1);

  nextDocument.set("status", completed.status);
  nextDocument.set("nextReviewDate", completed.nextReviewDate ?? null);
  nextDocument.set("reviewIntervalDays", completed.reviewIntervalDays ?? null);

  const reviewsNode = nextDocument.get("reviews", true);

  if (isSeq(reviewsNode) && appendedReview) {
    reviewsNode.add(appendedReview);
  } else {
    nextDocument.set("reviews", completed.reviews);
  }

  return renderDocument(nextDocument, parsed.content, parsed.lineEnding);
}

export type { ProblemFrontmatterPatch };
