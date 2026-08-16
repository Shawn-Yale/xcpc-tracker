import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <p className="text-xs font-semibold tracking-[0.18em] text-sky-700">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-950">找不到这个页面</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">链接可能已经失效，或者对应的本地题目记录不存在。</p>
      <Link className="mt-6 inline-flex rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800" href="/">返回概览</Link>
    </div>
  );
}
