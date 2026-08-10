import Link from "next/link";
import type { ReactNode } from "react";

import { PrimaryNavigation } from "./primary-navigation";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <a
        className="fixed top-3 left-3 z-50 -translate-y-20 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition-transform focus:translate-y-0"
        href="#main-content"
      >
        跳到主要内容
      </a>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <Link className="w-fit" href="/">
            <span className="block text-lg font-semibold tracking-tight">
              XCPC Tracker
            </span>
            <span className="block text-xs text-slate-500">
              Practice with intention
            </span>
          </Link>

          <PrimaryNavigation />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8" id="main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
