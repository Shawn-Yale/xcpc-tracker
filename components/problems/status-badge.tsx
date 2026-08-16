import type { Status } from "@/config/status";

const statusStyles: Record<Status, string> = {
  A: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  B: "bg-sky-50 text-sky-800 ring-sky-600/20",
  C: "bg-amber-50 text-amber-900 ring-amber-600/25",
  D: "bg-rose-50 text-rose-800 ring-rose-600/20",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      aria-label={`状态 ${status}`}
      className={`inline-flex min-w-7 items-center justify-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
