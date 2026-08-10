import { z } from "zod";

import { categoryValues } from "@/config/categories";
import { platformValues } from "@/config/platforms";
import { statusValues } from "@/config/status";
import { dateOnlySchema } from "@/lib/date/date-only";

const positiveIntegerSchema = z.number().int().positive();
const optionalTextSchema = z.string().trim().min(1).nullable().optional();

export const statusSchema = z.enum(statusValues);
export const categorySchema = z.enum(categoryValues);
export const platformSchema = z.enum(platformValues);

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
    status: statusSchema,
    categories: z
      .array(categorySchema)
      .default([])
      .refine(
        (categories) => new Set(categories).size === categories.length,
        "Categories must not contain duplicates",
      ),
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
  .superRefine((problem, context) => {
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
