import type { ReactNode } from "react";
import Link from "next/link";

type KnowledgeNavigationCardProps = {
  href: string;
  title: string;
  problemCount: number;
  children?: ReactNode;
  className?: string;
};

export function KnowledgeNavigationCard({
  href,
  title,
  problemCount,
  children,
  className = "",
}: KnowledgeNavigationCardProps) {
  return (
    <Link
      className={`group block border border-slate-200 bg-white p-4 text-slate-900 shadow-sm transition hover:border-sky-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${className}`}
      href={href}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-semibold group-hover:text-sky-800">{title}</h3>
        <span className="flex shrink-0 items-center gap-3">
          <span className="font-mono font-semibold tabular-nums">
            {problemCount} 题
          </span>
          <span aria-hidden="true" className="text-slate-400 group-hover:text-sky-700">
            →
          </span>
        </span>
      </div>
      {children}
    </Link>
  );
}
