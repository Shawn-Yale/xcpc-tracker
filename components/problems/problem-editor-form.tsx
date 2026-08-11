"use client";

import { useActionState, useEffect, useState } from "react";

import {
  createProblemAction,
  updateProblemAction,
  type ProblemFormActionState,
} from "@/app/problems/actions";
import { KnowledgeSelector } from "@/components/knowledge/knowledge-selector";
import { platformValues, type Platform } from "@/config/platforms";
import { statusMetadata, statusValues } from "@/config/status";
import {
  generateProblemId,
  type ProblemEditorInput,
} from "@/lib/problems/editor";

type ProblemEditorFormProps = {
  initial: ProblemEditorInput;
  mode: "create" | "edit";
};

const initialActionState: ProblemFormActionState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return (
    <span className="mt-1 block text-xs font-medium text-rose-700">
      {errors.join("；")}
    </span>
  );
}

function useUnsavedChanges(active: boolean) {
  useEffect(() => {
    if (!active) {
      return;
    }

    const message = "表单还有未保存的修改，确定离开吗？";
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = message;
    };
    const linkClick = (event: MouseEvent) => {
      const target = event.target;
      const anchor = target instanceof Element ? target.closest("a") : null;

      if (anchor && anchor.href && !window.confirm(message)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", linkClick, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", linkClick, true);
    };
  }, [active]);
}

export function ProblemEditorForm({ initial, mode }: ProblemEditorFormProps) {
  const action = mode === "create"
    ? createProblemAction
    : updateProblemAction.bind(null, initial.id);
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const [dirty, setDirty] = useState(false);
  const [scheduleReview, setScheduleReview] = useState(initial.scheduleReview);
  const [idCustomized, setIdCustomized] = useState(mode === "edit");
  const [id, setId] = useState(initial.id);
  const [identity, setIdentity] = useState({
    platform: initial.platform,
    contest: initial.contest ?? "",
    problem: initial.problem ?? "",
    title: initial.title,
  });

  useUnsavedChanges(dirty && !pending);

  function updateIdentity(
    field: "platform" | "contest" | "problem" | "title",
    value: string,
  ) {
    const next = { ...identity, [field]: value };
    setIdentity(next);

    if (mode === "create" && !idCustomized) {
      setId(
        generateProblemId({
          ...next,
          platform: next.platform as Platform,
        }),
      );
    }
  }

  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form
      action={formAction}
      className="space-y-10"
      onChange={() => setDirty(true)}
    >
      {state.error ? (
        <div aria-live="polite" className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          {state.error}
        </div>
      ) : null}

      <section aria-labelledby="identity-heading">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-lg font-semibold text-slate-950" id="identity-heading">题目标识</h2>
          <p className="mt-1 text-sm text-slate-600">标题和平台为必填；Contest 与题号会用于生成建议 ID。</p>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-800 sm:col-span-2">
            标题 <span className="text-rose-700">*</span>
            <input
              className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
              name="title"
              onChange={(event) => updateIdentity("title", event.target.value)}
              required
              value={identity.title}
            />
            <FieldError errors={fieldErrors.title} />
          </label>

          <label className="block text-sm font-semibold text-slate-800">
            平台 <span className="text-rose-700">*</span>
            <select
              className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
              name="platform"
              onChange={(event) => updateIdentity("platform", event.target.value)}
              value={identity.platform}
            >
              {platformValues.map((platform) => <option key={platform}>{platform}</option>)}
            </select>
            <FieldError errors={fieldErrors.platform} />
          </label>

          <label className="block text-sm font-semibold text-slate-800">
            题目 URL
            <input className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200" defaultValue={initial.url ?? ""} name="url" placeholder="https://…" type="url" />
            <FieldError errors={fieldErrors.url} />
          </label>

          <label className="block text-sm font-semibold text-slate-800">
            Contest
            <input className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200" name="contest" onChange={(event) => updateIdentity("contest", event.target.value)} value={identity.contest} />
          </label>

          <label className="block text-sm font-semibold text-slate-800">
            题号
            <input className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200" name="problem" onChange={(event) => updateIdentity("problem", event.target.value)} value={identity.problem} />
          </label>

          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-slate-800" htmlFor="problem-id">
              稳定 ID <span className="text-rose-700">*</span>
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                aria-describedby="problem-id-hint"
                className="min-w-0 flex-1 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm read-only:text-slate-500 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
                id="problem-id"
                name="id"
                onChange={(event) => {
                  setId(event.target.value);
                  setIdCustomized(true);
                }}
                readOnly={mode === "edit"}
                required
                value={id}
              />
              {mode === "create" ? (
                <button
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-sky-500 hover:text-sky-800"
                  onClick={() => {
                    setId(generateProblemId({ ...identity, platform: identity.platform as Platform }));
                    setIdCustomized(false);
                  }}
                  type="button"
                >
                  恢复建议 ID
                </button>
              ) : null}
            </div>
            <span className="mt-1 block text-xs font-normal text-slate-500" id="problem-id-hint">创建后将成为文件名与 URL 的一部分，不能修改。</span>
            <FieldError errors={fieldErrors.id} />
          </div>

          {mode === "create" ? (
            <label className="flex items-start gap-3 text-sm text-slate-700 sm:col-span-2">
              <input className="mt-0.5 size-4 accent-sky-700" name="confirmId" required type="checkbox" />
              <span>我已确认此 ID；保存后不再修改。</span>
            </label>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="training-heading">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-lg font-semibold text-slate-950" id="training-heading">训练结果</h2>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-sm font-semibold text-slate-800">
            完成日期 <span className="text-rose-700">*</span>
            <input className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200" defaultValue={initial.solvedAt} name="solvedAt" required type="date" />
            <FieldError errors={fieldErrors.solvedAt} />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            初始状态 <span className="text-rose-700">*</span>
            <select className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200" defaultValue={initial.status} name="status">
              {statusValues.map((status) => <option key={status} value={status}>{status} — {statusMetadata[status].meaning}</option>)}
            </select>
            <FieldError errors={fieldErrors.status} />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            Rating
            <input className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200" defaultValue={initial.rating ?? ""} min="1" name="rating" step="1" type="number" />
            <FieldError errors={fieldErrors.rating} />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            首次用时（分钟）
            <input className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200" defaultValue={initial.durationMinutes ?? ""} min="1" name="durationMinutes" step="1" type="number" />
            <FieldError errors={fieldErrors.durationMinutes} />
          </label>
        </div>
      </section>

      <section aria-labelledby="knowledge-heading">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-lg font-semibold text-slate-950" id="knowledge-heading">知识分类</h2>
          <p className="mt-1 text-sm text-slate-600">按层级选择解题所需的最小充分知识点；标签用逗号或换行分隔。</p>
        </div>
        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-slate-800">Knowledge</legend>
          <div className="mt-3"><KnowledgeSelector initial={initial.knowledge} /></div>
          <FieldError errors={fieldErrors.knowledge} />
        </fieldset>
        <label className="mt-5 block text-sm font-semibold text-slate-800">
          Tags
          <textarea className="mt-2 block min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200" defaultValue={initial.tags.join(", ")} name="tags" placeholder="例如：状压 DP, 子集枚举, XOR" />
          <FieldError errors={fieldErrors.tags} />
        </label>
      </section>

      <section aria-labelledby="schedule-heading">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-lg font-semibold text-slate-950" id="schedule-heading">Review 排期</h2>
          <p className="mt-1 text-sm text-slate-600">这里只调整当前排期，不会生成虚假的 Review History。</p>
        </div>
        <label className="mt-5 flex items-start gap-3 border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <input checked={scheduleReview} className="mt-0.5 size-4 accent-sky-700" name="scheduleReview" onChange={(event) => setScheduleReview(event.target.checked)} type="checkbox" />
          <span><span className="block font-semibold text-slate-900">安排下一次 Review</span>日期和间隔必须同时填写。</span>
        </label>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-800">
            下次 Review 日期
            <input className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm disabled:bg-slate-100 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200" defaultValue={initial.nextReviewDate ?? ""} disabled={!scheduleReview} name="nextReviewDate" required={scheduleReview} type="date" />
            <FieldError errors={fieldErrors.nextReviewDate} />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            间隔天数
            <input className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 disabled:bg-slate-100 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200" defaultValue={initial.reviewIntervalDays ?? ""} disabled={!scheduleReview} min="1" name="reviewIntervalDays" required={scheduleReview} step="1" type="number" />
            <FieldError errors={fieldErrors.reviewIntervalDays} />
          </label>
        </div>
      </section>

      <section aria-labelledby="retrospective-heading">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-lg font-semibold text-slate-950" id="retrospective-heading">Markdown 复盘正文</h2>
          <p className="mt-1 text-sm text-slate-600">支持普通 Markdown；新增题目已预置复盘结构。</p>
        </div>
        <textarea aria-labelledby="retrospective-heading" className="mt-5 block min-h-96 w-full rounded-md border border-slate-300 bg-slate-950 px-4 py-3 font-mono text-sm leading-6 text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200" defaultValue={initial.content} name="content" spellCheck={false} />
        <FieldError errors={fieldErrors.content} />
      </section>

      <section aria-labelledby="solution-heading">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-lg font-semibold text-slate-950" id="solution-heading">AC 代码（可选）</h2>
          <p className="mt-1 text-sm text-slate-600">记录最终通过的编程语言与完整实现；两项需要同时填写或同时清空。</p>
        </div>
        <div className="mt-5 space-y-5">
          <label className="block text-sm font-semibold text-slate-800">
            编程语言
            <input
              className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
              defaultValue={initial.solutionLanguage ?? ""}
              name="solutionLanguage"
              placeholder="例如：C++17"
            />
            <FieldError errors={fieldErrors.solutionLanguage} />
          </label>
          <label className="block text-sm font-semibold text-slate-800">
            代码
            <textarea
              className="mt-2 block min-h-80 w-full resize-y rounded-md border border-slate-300 bg-slate-950 px-4 py-3 font-mono text-sm leading-6 text-slate-100 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              defaultValue={initial.solutionCode ?? ""}
              name="solutionCode"
              spellCheck={false}
            />
            <FieldError errors={fieldErrors.solutionCode} />
          </label>
        </div>
      </section>

      <div className="sticky bottom-0 flex items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/95 py-4 backdrop-blur">
        <p className="text-xs text-slate-500">保存后将直接写入本地 Markdown。</p>
        <button className="rounded-md bg-sky-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-wait disabled:opacity-60" disabled={pending} type="submit">
          {pending ? "正在保存…" : mode === "create" ? "创建题目" : "保存修改"}
        </button>
      </div>
    </form>
  );
}
