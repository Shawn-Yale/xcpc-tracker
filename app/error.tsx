"use client";

import Link from "next/link";

export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <div className="mx-auto max-w-xl border border-rose-200 bg-rose-50 px-6 py-12 text-center" role="alert">
      <h1 className="text-2xl font-semibold text-rose-950">页面暂时无法载入</h1>
      <p className="mt-3 text-sm leading-6 text-rose-800">本地数据没有被修改。可以重试，或返回概览后检查数据文件。</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button className="rounded-md bg-rose-900 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800" onClick={() => retry()} type="button">重试</button>
        <Link className="rounded-md border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-900 hover:border-rose-500" href="/">返回概览</Link>
      </div>
    </div>
  );
}
