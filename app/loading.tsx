export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-6" role="status">
      <span className="sr-only">正在载入页面…</span>
      <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
      <div className="h-10 max-w-md animate-pulse rounded bg-slate-200" />
      <div className="h-28 animate-pulse rounded bg-white ring-1 ring-slate-200" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div className="h-24 animate-pulse rounded bg-white ring-1 ring-slate-200" key={index} />
        ))}
      </div>
    </div>
  );
}
