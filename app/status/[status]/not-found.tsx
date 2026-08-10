import Link from "next/link";

export default function StatusPoolNotFound() {
  return (
    <div className="mx-auto max-w-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold text-slate-950">无效的掌握状态</h1>
      <p className="mt-3 text-sm text-slate-600">状态必须是 A、B、C 或 D。</p>
      <Link
        className="mt-6 inline-flex rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"
        href="/status"
      >
        返回掌握状态
      </Link>
    </div>
  );
}
