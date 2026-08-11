"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { knowledgeCatalog } from "@/config/knowledge-taxonomy";
import { getKnowledgeBreadcrumb } from "@/lib/knowledge/presentation";
import type { KnowledgeId } from "@/lib/knowledge/types";

export type KnowledgeFilterOption = {
  readonly id: KnowledgeId | "";
  readonly label: string;
};

const allKnowledgeOption: KnowledgeFilterOption = {
  id: "",
  label: "全部知识点",
};

const knowledgeOptions = knowledgeCatalog.entries.map((entry) => ({
  id: entry.id,
  label: getKnowledgeBreadcrumb(entry.id),
  name: entry.name,
  depth: entry.depth,
}));

function normalizeSearch(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase().trim();
}

export function getKnowledgeFilterOptions(
  search: string,
): readonly KnowledgeFilterOption[] {
  const normalizedSearch = normalizeSearch(search);
  if (normalizedSearch === "") {
    return [
      allKnowledgeOption,
      ...knowledgeOptions
        .filter((option) => option.depth === 1)
        .map(({ id, label }) => ({ id, label })),
    ];
  }

  const tokens = normalizedSearch.split(/\s+/);
  return knowledgeOptions
    .filter((option) => {
      const searchable = normalizeSearch(
        `${option.name} ${option.id} ${option.label}`,
      );
      return tokens.every((token) => searchable.includes(token));
    })
    .map(({ id, label }) => ({ id, label }));
}

function labelForValue(value: KnowledgeId | ""): string {
  return value === "" ? allKnowledgeOption.label : getKnowledgeBreadcrumb(value);
}

export function KnowledgeFilterCombobox({
  value,
  onChange,
}: {
  value: KnowledgeId | "";
  onChange: (value: KnowledgeId | "") => void;
}) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const options = useMemo(() => getKnowledgeFilterOptions(search), [search]);
  const activeOption = activeIndex < 0 ? undefined : options[activeIndex];

  useEffect(() => {
    if (!open) return;

    function closeOnOutsidePointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [open]);

  function openCombobox() {
    if (open) return;
    setOpen(true);
    setSearch("");
    setActiveIndex(-1);
  }

  function closeCombobox() {
    setOpen(false);
    setSearch("");
    setActiveIndex(-1);
  }

  function selectOption(option: KnowledgeFilterOption) {
    onChange(option.id);
    closeCombobox();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      closeCombobox();
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openCombobox();
        setActiveIndex(event.key === "ArrowDown" ? 0 : options.length - 1);
        return;
      }
      if (options.length === 0) return;
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) => {
        if (index < 0) return direction === 1 ? 0 : options.length - 1;
        return (index + direction + options.length) % options.length;
      });
      return;
    }

    if (event.key === "Enter" && open && activeOption) {
      event.preventDefault();
      selectOption(activeOption);
    }
  }

  return (
    <div className="relative mt-1.5" ref={rootRef}>
      {value === "" ? null : <input name="knowledge" type="hidden" value={value} />}
      <input
        aria-activedescendant={
          open && activeOption ? `${listboxId}-option-${activeIndex}` : undefined
        }
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-label="知识点"
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15"
        onBlur={(event) => {
          if (!rootRef.current?.contains(event.relatedTarget)) closeCombobox();
        }}
        onChange={(event) => {
          setSearch(event.target.value);
          setActiveIndex(-1);
        }}
        onClick={openCombobox}
        onFocus={openCombobox}
        onKeyDown={handleKeyDown}
        placeholder="搜索知识点..."
        readOnly={!open}
        role="combobox"
        value={open ? search : labelForValue(value)}
      />

      {open ? (
        <div className="absolute z-30 mt-1 w-full min-w-72 rounded-md border border-slate-200 bg-white p-2 shadow-xl">
          <p className="px-2 pb-2 text-xs text-slate-500">搜索知识点...</p>
          {options.length > 0 ? (
            <div className="max-h-72 overflow-y-auto" id={listboxId} role="listbox">
              {options.map((option, index) => (
                <button
                  aria-selected={option.id === value}
                  className={
                    index === activeIndex
                      ? "block w-full rounded px-3 py-2 text-left text-sm font-medium text-sky-900 bg-sky-50"
                      : "block w-full rounded px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  }
                  id={`${listboxId}-option-${index}`}
                  key={option.id || "all"}
                  onClick={() => selectOption(option)}
                  onMouseEnter={() => setActiveIndex(index)}
                  role="option"
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : (
            <p className="px-3 py-5 text-center text-sm text-slate-500" role="status">
              没有匹配的知识点
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
