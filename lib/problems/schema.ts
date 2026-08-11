import { z } from "zod";

import { knowledgeCatalog } from "@/config/knowledge-taxonomy";
import { platformValues } from "@/config/platforms";
import { statusValues } from "@/config/status";
import { dateOnlySchema } from "@/lib/date/date-only";
import { validateKnowledgeSelection } from "@/lib/knowledge/selection";
import type { KnowledgeId } from "@/lib/knowledge/types";

const positiveIntegerSchema = z.number().int().positive();
const optionalTextSchema = z.string().trim().min(1).nullable().optional();
const optionalSolutionCodeSchema = z
  .string()
  .transform((value) => (value.trim().length === 0 ? null : value))
  .nullable()
  .optional();

export const statusSchema = z.enum(statusValues);
export const platformSchema = z.enum(platformValues);

export const problemKnowledgeSchema = z
  .array(z.string())
  .transform((values, context): KnowledgeId[] | typeof z.NEVER => {
    const result = validateKnowledgeSelection(knowledgeCatalog, values);

    if (result.success) {
      return [...result.data];
    }

    for (const issue of result.issues) {
      switch (issue.code) {
        case "unknown-id":
          context.addIssue({
            code: "custom",
            message: `Unknown knowledge ID: ${issue.id}`,
            path: [issue.index],
          });
          break;
        case "non-selectable-id":
          context.addIssue({
            code: "custom",
            message: `Knowledge node is not selectable: ${issue.id}`,
            path: [issue.index],
          });
          break;
        case "duplicate-id":
          context.addIssue({
            code: "custom",
            message: `Knowledge IDs must not contain duplicates: ${issue.id}`,
            path: [issue.index],
          });
          break;
        case "ancestor-descendant-conflict":
          context.addIssue({
            code: "custom",
            message: `Knowledge selection must not contain both ancestor ${issue.ancestorId} and descendant ${issue.descendantId}`,
          });
          break;
      }
    }

    return z.NEVER;
  });

export const reviewSchema = z
  .object({
    date: dateOnlySchema,
    fromStatus: statusSchema,
    toStatus: statusSchema,
    durationMinutes: positiveIntegerSchema.nullable().optional(),
    note: z.string().trim().min(1),
    nextIntervalDays: positiveIntegerSchema.nullable().optional(),
  })
  .passthrough();

export const problemFrontmatterSchema = z
  .object({
    id: z
      .string()
      .trim()
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "ID must use lowercase letters, numbers, and single hyphens",
      ),
    title: z.string().trim().min(1),
    platform: platformSchema,
    contest: optionalTextSchema,
    problem: optionalTextSchema,
    url: z.string().trim().url().nullable().optional(),
    rating: positiveIntegerSchema.nullable().optional(),
    solvedAt: dateOnlySchema,
    durationMinutes: positiveIntegerSchema.nullable().optional(),
    solutionLanguage: optionalTextSchema,
    solutionCode: optionalSolutionCodeSchema,
    status: statusSchema,
    knowledge: problemKnowledgeSchema,
    tags: z
      .array(z.string().trim().min(1))
      .default([])
      .refine(
        (tags) => new Set(tags).size === tags.length,
        "Tags must not contain duplicates",
      ),
    nextReviewDate: dateOnlySchema.nullable().optional(),
    reviewIntervalDays: positiveIntegerSchema.nullable().optional(),
    reviews: z.array(reviewSchema).default([]),
  })
  .passthrough()
  .refine(
    (problem) => !Object.prototype.hasOwnProperty.call(problem, "categories"),
    {
      message: "Legacy categories is not supported; use knowledge",
      path: ["categories"],
      when: ({ value }) => typeof value === "object" && value !== null,
    },
  )
  .superRefine((problem, context) => {
    const solutionLanguageState =
      problem.solutionLanguage === undefined
        ? "undefined"
        : problem.solutionLanguage === null
          ? "null"
          : "value";
    const solutionCodeState =
      problem.solutionCode === undefined
        ? "undefined"
        : problem.solutionCode === null
          ? "null"
          : "value";

    if (solutionLanguageState !== solutionCodeState) {
      context.addIssue({
        code: "custom",
        message:
          "solutionLanguage and solutionCode must both be absent, both be null, or both have values",
        path:
          solutionLanguageState === "undefined"
            ? ["solutionLanguage"]
            : solutionCodeState === "undefined" ||
                solutionLanguageState === "value"
              ? ["solutionCode"]
              : ["solutionLanguage"],
      });
    }

    const hasReviewDate = problem.nextReviewDate != null;
    const hasReviewInterval = problem.reviewIntervalDays != null;

    if (hasReviewDate !== hasReviewInterval) {
      context.addIssue({
        code: "custom",
        message:
          "nextReviewDate and reviewIntervalDays must both be set or both be empty",
        path: hasReviewDate ? ["reviewIntervalDays"] : ["nextReviewDate"],
      });
    }
  });

export type Review = z.output<typeof reviewSchema>;
export type ReviewInput = z.input<typeof reviewSchema>;
export type ProblemFrontmatter = z.output<typeof problemFrontmatterSchema>;
export type ProblemFrontmatterInput = z.input<typeof problemFrontmatterSchema>;

export type ProblemDocument = {
  frontmatter: ProblemFrontmatter;
  content: string;
};
