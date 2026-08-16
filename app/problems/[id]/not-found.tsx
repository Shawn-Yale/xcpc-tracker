import Link from "next/link";

export default function ProblemNotFound() {
  return (
    <div className="mx-auto max-w-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold text-slate-950">找不到这道题</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        对应 ID 不存在，或者题目文件已经被移动。
      </p>
      <Link
        className="mt-6 inline-flex rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"
        href="/problems"
      >
        返回题目库
      </Link>
    </div>
  );
}
