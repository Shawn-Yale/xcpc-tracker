import Link from "next/link";

export default function KnowledgeCategoryNotFound() {
  return (
    <div className="mx-auto max-w-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold text-slate-950">找不到这个知识分类</h1>
      <p className="mt-3 text-sm text-slate-600">分类可能已被重命名或移除。</p>
      <Link
        className="mt-6 inline-flex rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"
        href="/knowledge"
      >
        返回知识分类
      </Link>
    </div>
  );
}
