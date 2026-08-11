"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ZodError } from "zod";

import { ProblemDataError } from "@/lib/problems/errors";
import {
  parseProblemEditorFormData,
  type ProblemEditorInput,
} from "@/lib/problems/editor";
import { createProblemRepository } from "@/lib/problems/repository";
import { problemFrontmatterSchema } from "@/lib/problems/schema";

export type ProblemFormActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function validationState(error: ZodError): ProblemFormActionState {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    fieldErrors[field] = [...(fieldErrors[field] ?? []), issue.message];
  }

  return { error: "请检查标出的字段后重试。", fieldErrors };
}

function frontmatterFromEditor(input: ProblemEditorInput) {
  return problemFrontmatterSchema.parse({
    id: input.id,
    title: input.title,
    platform: input.platform,
    contest: input.contest,
    problem: input.problem,
    url: input.url,
    rating: input.rating,
    solvedAt: input.solvedAt,
    durationMinutes: input.durationMinutes,
    status: input.status,
    knowledge: input.knowledge,
    tags: input.tags,
    nextReviewDate: input.nextReviewDate,
    reviewIntervalDays: input.reviewIntervalDays,
    reviews: [],
  });
}

function editableFrontmatter(input: ProblemEditorInput) {
  return {
    title: input.title,
    platform: input.platform,
    contest: input.contest,
    problem: input.problem,
    url: input.url,
    rating: input.rating,
    solvedAt: input.solvedAt,
    durationMinutes: input.durationMinutes,
    status: input.status,
    knowledge: input.knowledge,
    tags: input.tags,
    nextReviewDate: input.nextReviewDate,
    reviewIntervalDays: input.reviewIntervalDays,
  };
}

function writeErrorState(error: unknown, operation: "新增" | "更新") {
  if (error instanceof ProblemDataError && error.code === "already-exists") {
    return {
      error: "该 ID 已存在，请确认现有题目或修改新题目的 ID。",
      fieldErrors: { id: ["ID 必须在题库中唯一"] },
    } satisfies ProblemFormActionState;
  }

  return {
    error:
      error instanceof ProblemDataError
        ? `${operation}失败：${error.message}`
        : `${operation}失败，请检查文件权限或数据格式后重试。`,
  } satisfies ProblemFormActionState;
}

function refreshProblemViews(id: string): void {
  revalidatePath("/");
  revalidatePath("/problems");
  revalidatePath(`/problems/${id}`);
  revalidatePath("/knowledge", "layout");
  revalidatePath("/statistics");
  revalidatePath("/status", "layout");
  revalidatePath("/review");
}

export async function createProblemAction(
  _previousState: ProblemFormActionState,
  formData: FormData,
): Promise<ProblemFormActionState> {
  const parsed = parseProblemEditorFormData(formData);

  if (!parsed.success) {
    return validationState(parsed.error);
  }

  if (formData.get("confirmId") !== "on") {
    return {
      error: "保存前请确认稳定 ID。",
      fieldErrors: { id: ["请勾选 ID 确认项"] },
    };
  }

  try {
    await createProblemRepository().create({
      frontmatter: frontmatterFromEditor(parsed.data),
      content: parsed.data.content,
    });
  } catch (error) {
    return writeErrorState(error, "新增");
  }

  refreshProblemViews(parsed.data.id);
  redirect(`/problems/${parsed.data.id}?saved=created`);
}

export async function updateProblemAction(
  immutableId: string,
  _previousState: ProblemFormActionState,
  formData: FormData,
): Promise<ProblemFormActionState> {
  const parsed = parseProblemEditorFormData(formData);

  if (!parsed.success) {
    return validationState(parsed.error);
  }

  if (parsed.data.id !== immutableId) {
    return {
      error: "题目 ID 创建后不可修改。",
      fieldErrors: { id: ["提交的 ID 与当前题目不一致"] },
    };
  }

  try {
    await createProblemRepository().update(immutableId, {
      frontmatter: editableFrontmatter(parsed.data),
      content: parsed.data.content,
    });
  } catch (error) {
    return writeErrorState(error, "更新");
  }

  refreshProblemViews(immutableId);
  redirect(`/problems/${immutableId}?saved=updated`);
}
