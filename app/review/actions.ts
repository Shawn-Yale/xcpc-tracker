"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ProblemDataError } from "@/lib/problems/errors";
import { createProblemRepository } from "@/lib/problems/repository";
import { reviewCompletionInputSchema } from "@/lib/review/completion";

export type ReviewActionState = {
  error?: string;
};

function optionalPositiveInteger(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  return Number(value);
}

export async function completeReviewAction(
  _previousState: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const id = formData.get("id");

  if (typeof id !== "string" || id.length === 0) {
    return { error: "缺少有效的题目 ID。" };
  }

  const scheduleNext = formData.get("scheduleNext") === "on";
  const parsed = reviewCompletionInputSchema.safeParse({
    date: formData.get("date"),
    newStatus: formData.get("newStatus"),
    durationMinutes: optionalPositiveInteger(formData.get("durationMinutes")),
    note: formData.get("note"),
    scheduleNext,
    nextIntervalDays: scheduleNext
      ? optionalPositiveInteger(formData.get("nextIntervalDays"))
      : null,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues.map((issue) => issue.message).join("；"),
    };
  }

  try {
    await createProblemRepository().completeReview(id, parsed.data);
  } catch (error) {
    return {
      error:
        error instanceof ProblemDataError || error instanceof RangeError
          ? `保存失败：${error.message}`
          : "保存失败，请检查文件权限或数据格式后重试。",
    };
  }

  revalidatePath("/review");
  revalidatePath(`/review/${id}`);
  revalidatePath("/problems");
  revalidatePath(`/problems/${id}`);
  revalidatePath("/status");
  revalidatePath("/knowledge");
  redirect(`/review?completed=${encodeURIComponent(id)}`);
}
