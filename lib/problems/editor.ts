import { z } from "zod";

import { categoryValues } from "@/config/categories";
import { platformValues, type Platform } from "@/config/platforms";
import { statusValues } from "@/config/status";
import { dateOnlySchema } from "@/lib/date/date-only";

const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const positiveIntegerSchema = z.number().int().positive();
const optionalTextSchema = z.string().trim().min(1).nullable();

export const retrospectiveTemplate = `# 题意抽象



# 第一想法



# 正确思路



# 没想到的关键点



# 实现注意事项



# 做题感想

`;

export const problemEditorSchema = z
  .object({
    id: z.string().trim().regex(idPattern, "ID 只能包含小写字母、数字和单个连字符"),
    title: z.string().trim().min(1, "请填写题目标题"),
    platform: z.enum(platformValues, { error: "请选择有效平台" }),
    contest: optionalTextSchema,
    problem: optionalTextSchema,
    url: z.string().trim().url("请输入完整、有效的 URL").nullable(),
    rating: positiveIntegerSchema.nullable(),
    solvedAt: dateOnlySchema,
    durationMinutes: positiveIntegerSchema.nullable(),
    status: z.enum(statusValues, { error: "请选择有效状态" }),
    categories: z.array(z.enum(categoryValues)),
    tags: z.array(z.string().trim().min(1)),
    scheduleReview: z.boolean(),
    nextReviewDate: dateOnlySchema.nullable(),
    reviewIntervalDays: positiveIntegerSchema.nullable(),
    content: z.string(),
  })
  .superRefine((input, context) => {
    if (
      input.scheduleReview &&
      (input.nextReviewDate == null || input.reviewIntervalDays == null)
    ) {
      if (input.nextReviewDate == null) {
        context.addIssue({
          code: "custom",
          message: "安排 Review 时必须填写下次日期",
          path: ["nextReviewDate"],
        });
      }

      if (input.reviewIntervalDays == null) {
        context.addIssue({
          code: "custom",
          message: "安排 Review 时必须填写间隔天数",
          path: ["reviewIntervalDays"],
        });
      }
    }
  });

export type ProblemEditorInput = z.output<typeof problemEditorSchema>;

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateProblemId(input: {
  platform: Platform;
  contest?: string | null;
  problem?: string | null;
  title?: string | null;
}): string {
  const platform = slugify(input.platform);
  const identity = [input.contest, input.problem]
    .map((value) => slugify(value ?? ""))
    .map((value, index) =>
      index === 0 && value.startsWith(`${platform}-`)
        ? value.slice(platform.length + 1)
        : value,
    )
    .filter(Boolean);

  if (identity.length === 0) {
    const title = slugify(input.title ?? "");
    identity.push(title || "problem");
  }

  return [platform, ...identity].filter(Boolean).join("-");
}

export function normalizeTags(value: string): string[] {
  return [
    ...new Set(
      value
        .split(/[，,\n]/)
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  ];
}

function optionalText(value: FormDataEntryValue | null): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function optionalNumber(value: FormDataEntryValue | null): number | null {
  const text = optionalText(value);
  return text == null ? null : Number(text);
}

function stringValue(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

export function parseProblemEditorFormData(formData: FormData) {
  const scheduleReview = formData.get("scheduleReview") === "on";
  const tagsValue = stringValue(formData.get("tags"));

  return problemEditorSchema.safeParse({
    id: stringValue(formData.get("id")),
    title: stringValue(formData.get("title")),
    platform: formData.get("platform"),
    contest: optionalText(formData.get("contest")),
    problem: optionalText(formData.get("problem")),
    url: optionalText(formData.get("url")),
    rating: optionalNumber(formData.get("rating")),
    solvedAt: formData.get("solvedAt"),
    durationMinutes: optionalNumber(formData.get("durationMinutes")),
    status: formData.get("status"),
    categories: [...new Set(formData.getAll("categories"))],
    tags: normalizeTags(tagsValue),
    scheduleReview,
    nextReviewDate: scheduleReview
      ? optionalText(formData.get("nextReviewDate"))
      : null,
    reviewIntervalDays: scheduleReview
      ? optionalNumber(formData.get("reviewIntervalDays"))
      : null,
    content: stringValue(formData.get("content")),
  });
}
