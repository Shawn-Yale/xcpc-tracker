"use client";

import { useState, type PointerEvent, type ReactNode } from "react";

type KnowledgeRevealProps = {
  children: ReactNode;
  variant?: "inline" | "badges";
};

export function KnowledgeReveal({
  children,
  variant = "inline",
}: KnowledgeRevealProps) {
  const [hovered, setHovered] = useState(false);
  const [revealedByActivation, setRevealedByActivation] = useState(false);
  const [suppressHover, setSuppressHover] = useState(false);
  const revealed = revealedByActivation || (hovered && !suppressHover);

  function handlePointerEnter(event: PointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "mouse") {
      setHovered(true);
    }
  }

  function handlePointerLeave(event: PointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "mouse") {
      setHovered(false);
      setRevealedByActivation(false);
      setSuppressHover(false);
    }
  }

  function toggleReveal() {
    if (revealedByActivation) {
      setRevealedByActivation(false);
      setSuppressHover(true);
    } else {
      setRevealedByActivation(true);
      setSuppressHover(false);
    }
  }

  const variantClassName = variant === "badges"
    ? "group min-h-8"
    : "min-h-7 bg-slate-100 px-2 py-1 ring-1 ring-inset ring-slate-200 hover:bg-sky-50 hover:text-sky-900";

  return (
    <button
      aria-expanded={revealed}
      aria-label={revealed ? "隐藏知识点" : "显示知识点"}
      className={`inline-flex max-w-full items-center rounded-md text-left text-sm text-slate-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700 ${variantClassName}`}
      onClick={toggleReveal}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      type="button"
    >
      {revealed ? children : (
        <span
          className={variant === "badges"
            ? "rounded-md bg-slate-100 px-2.5 py-1 ring-1 ring-inset ring-slate-200 transition-colors group-hover:bg-sky-50 group-hover:text-sky-900"
            : "whitespace-nowrap"}
        >
          知识点已隐藏
        </span>
      )}
    </button>
  );
}
