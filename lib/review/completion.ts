import { z } from "zod";

import {
  baseReviewIntervals,
  maximumReviewIntervalDays,
} from "@/config/review";
import type { Status } from "@/config/status";
import {
  addCalendarDays,
  compareDateOnly,
  dateOnlySchema,
} from "@/lib/date/date-only";
import {
  problemFrontmatterSchema,
  statusSchema,
  type ProblemFrontmatter,
} from "@/lib/problems/schema";

const positiveIntegerSchema = z.number().int().positive();

export const reviewCompletionInputSchema = z
  .object({
    date: dateOnlySchema,
    newStatus: statusSchema,
    durationMinutes: positiveIntegerSchema.nullable().optional(),
    note: z.string().trim().min(1, "请填写复习记录"),
    scheduleNext: z.boolean(),
    nextIntervalDays: positiveIntegerSchema.nullable().optional(),
  })
  .superRefine((input, context) => {
    if (!input.scheduleNext && input.nextIntervalDays != null) {
      context.addIssue({
        code: "custom",
        message: "未安排下一次复习时不能设置间隔",
        path: ["nextIntervalDays"],
      });
    }
  });

export type ReviewCompletionInput = z.input<typeof reviewCompletionInputSchema>;

export function getSuggestedReviewInterval(
  newStatus: Status,
  previousIntervalDays?: number | null,
): number {
  const baseInterval = baseReviewIntervals[newStatus];

  if (newStatus === "C" || newStatus === "D" || previousIntervalDays == null) {
    return baseInterval;
  }

  const growthFactor = newStatus === "A" ? 2 : 1.5;
  return Math.min(
    maximumReviewIntervalDays,
    Math.max(baseInterval, Math.ceil(previousIntervalDays * growthFactor)),
  );
}

export function completeReview(
  problem: ProblemFrontmatter,
  input: ReviewCompletionInput,
): ProblemFrontmatter {
  const validated = reviewCompletionInputSchema.parse(input);
  const lastReview = problem.reviews.at(-1);

  if (compareDateOnly(validated.date, problem.solvedAt) < 0) {
    throw new RangeError("复习日期不能早于完成日期");
  }

  if (lastReview && compareDateOnly(validated.date, lastReview.date) < 0) {
    throw new RangeError("复习日期不能早于已有复习记录");
  }

  const nextIntervalDays = validated.scheduleNext
    ? (validated.nextIntervalDays ??
      getSuggestedReviewInterval(
        validated.newStatus,
        problem.reviewIntervalDays,
      ))
    : null;
  const nextReviewDate =
    nextIntervalDays == null
      ? null
      : addCalendarDays(validated.date, nextIntervalDays);

  return problemFrontmatterSchema.parse({
    ...problem,
    status: validated.newStatus,
    nextReviewDate,
    reviewIntervalDays: nextIntervalDays,
    reviews: [
      ...problem.reviews,
      {
        date: validated.date,
        fromStatus: problem.status,
        toStatus: validated.newStatus,
        durationMinutes: validated.durationMinutes ?? null,
        note: validated.note,
        nextIntervalDays,
      },
    ],
  });
}
