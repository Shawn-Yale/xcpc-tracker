import type { ProblemLoadError } from "@/lib/problems/types";

export function LoadErrorSummary({ errors }: { errors: ProblemLoadError[] }) {
  if (errors.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="problem-load-errors"
      className="border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-950 sm:px-5"
      role="alert"
    >
      <h2 className="font-semibold" id="problem-load-errors">
        {errors.length} 个数据文件未能载入
      </h2>
      <p className="mt-1 text-rose-800">
        其余有效题目仍可正常使用。请直接检查下面列出的 Markdown 文件。
      </p>
      <ul className="mt-3 space-y-1.5">
        {errors.map((error) => (
          <li key={`${error.fileName}-${error.code}`}>
            <code className="font-semibold">{error.fileName}</code>
            <span className="text-rose-700"> — {error.message}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
