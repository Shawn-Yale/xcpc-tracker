import Link from "next/link";

export type DistributionItem = {
  count: number;
  href?: string;
  label: string;
  percentage: number;
};

export function DistributionList({
  emptyMessage,
  items,
}: {
  emptyMessage: string;
  items: readonly DistributionItem[];
}) {
  if (items.every((item) => item.count === 0)) {
    return <p className="border-l-4 border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.label}>
          <div className="flex items-baseline justify-between gap-4 text-sm">
            {item.href ? (
              <Link className="font-medium text-slate-800 hover:text-sky-800 hover:underline" href={item.href}>{item.label}</Link>
            ) : (
              <span className="font-medium text-slate-800">{item.label}</span>
            )}
            <span className="font-mono text-xs text-slate-500">{item.count} · {item.percentage.toFixed(0)}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-sky-600" style={{ width: `${item.percentage}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
