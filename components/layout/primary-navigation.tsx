"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

import { navigationItems } from "@/config/navigation";

function isCurrentRoute(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function keepCurrentLinkVisible(
  navigation: HTMLElement,
  currentLink: HTMLAnchorElement,
) {
  const navigationBounds = navigation.getBoundingClientRect();
  const currentLinkBounds = currentLink.getBoundingClientRect();
  const visibleLeft = navigationBounds.left;
  const visibleRight = visibleLeft + navigation.clientWidth;

  if (currentLinkBounds.left < visibleLeft) {
    navigation.scrollLeft += currentLinkBounds.left - visibleLeft;
  } else if (currentLinkBounds.right > visibleRight) {
    navigation.scrollLeft += currentLinkBounds.right - visibleRight;
  }
}

export function PrimaryNavigation() {
  const pathname = usePathname();
  const navigationRef = useRef<HTMLElement>(null);
  const currentLinkRef = useRef<HTMLAnchorElement>(null);

  useLayoutEffect(() => {
    const navigation = navigationRef.current;
    const currentLink = currentLinkRef.current;

    if (!navigation || !currentLink) {
      return;
    }

    keepCurrentLinkVisible(navigation, currentLink);

    const resizeObserver = new ResizeObserver(() =>
      keepCurrentLinkVisible(navigation, currentLink),
    );
    resizeObserver.observe(navigation);
    resizeObserver.observe(currentLink);

    return () => resizeObserver.disconnect();
  }, [pathname]);

  return (
    <nav
      aria-label="主导航"
      className="overflow-x-auto pb-1"
      ref={navigationRef}
    >
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
                ref={current ? currentLinkRef : undefined}
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
