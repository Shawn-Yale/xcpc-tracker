"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navigationItems } from "@/config/navigation";

function isCurrentRoute(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function PrimaryNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className="overflow-x-auto pb-1">
      <ul className="flex min-w-max gap-1">
        {navigationItems.map((item) => {
          const current = isCurrentRoute(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                aria-current={current ? "page" : undefined}
                className={`block rounded-md px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${
                  current
                    ? "bg-sky-50 text-sky-900"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
                href={item.href}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
