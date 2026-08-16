"use client";

import { useMemo, useState } from "react";

import { knowledgeCatalog, knowledgeTaxonomy } from "@/config/knowledge-taxonomy";
import { getKnowledgeEntry } from "@/lib/knowledge/catalog";
import { getKnowledgeBreadcrumb } from "@/lib/knowledge/presentation";
import type { KnowledgeId, KnowledgeNode } from "@/lib/knowledge/types";

function conflictsWithSelection(id: KnowledgeId, selected: ReadonlySet<KnowledgeId>) {
  const entry = getKnowledgeEntry(knowledgeCatalog, id);
  if (!entry) return false;
  return [...selected].some((selectedId) => {
    const selectedEntry = getKnowledgeEntry(knowledgeCatalog, selectedId);
    return entry.ancestorIds.includes(selectedId) || selectedEntry?.ancestorIds.includes(id);
  });
}

function NodeOption({
  node,
  selected,
  search,
  onToggle,
}: {
  node: KnowledgeNode;
  selected: ReadonlySet<KnowledgeId>;
  search: string;
  onToggle: (id: KnowledgeId, checked: boolean) => void;
}) {
  const matches = search === "" || getKnowledgeBreadcrumb(node.id).toLocaleLowerCase().includes(search);
  const visibleChildren = node.children.filter((child) =>
    search === "" || getKnowledgeBreadcrumb(child.id).toLocaleLowerCase().includes(search) ||
      child.children.some((grandchild) => getKnowledgeBreadcrumb(grandchild.id).toLocaleLowerCase().includes(search)),
  );
  if (!matches && visibleChildren.length === 0) return null;

  const checked = selected.has(node.id);
  const disabled = !checked && conflictsWithSelection(node.id, selected);
  return (
    <li className="space-y-2">
      <div className={node.selectable ? "flex items-start gap-2" : "font-semibold text-slate-900"}>
        {node.selectable ? (
          <input
            aria-label={node.name}
            checked={checked}
            className="mt-0.5 size-4 accent-sky-700"
            disabled={disabled}
            name="knowledge"
            onChange={(event) => onToggle(node.id, event.target.checked)}
            type="checkbox"
            value={node.id}
          />
        ) : null}
        <span className={disabled ? "text-slate-400" : "text-slate-700"}>{node.name}</span>
      </div>
      {visibleChildren.length > 0 ? (
        <ul className="ml-4 space-y-2 border-l border-slate-200 pl-4">
          {visibleChildren.map((child) => (
            <NodeOption key={child.id} node={child} onToggle={onToggle} search={search} selected={selected} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function KnowledgeSelector({ initial }: { initial: readonly KnowledgeId[] }) {
  const [selected, setSelected] = useState<ReadonlySet<KnowledgeId>>(() => new Set(initial));
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const selectedIds = useMemo(() => [...selected], [selected]);

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-slate-800">
        搜索知识点
        <input
          className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2 font-normal focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="输入名称或层级路径"
          type="search"
          value={search}
        />
      </label>
      {selectedIds.length > 0 ? (
        <div aria-label="已选知识点" className="flex flex-wrap gap-2">
          {selectedIds.map((id) => (
            <span className="rounded bg-sky-50 px-2 py-1 text-xs font-medium text-sky-800" key={id}>
              {getKnowledgeBreadcrumb(id)}
            </span>
          ))}
        </div>
      ) : <p className="text-sm text-slate-500">尚未选择知识点。</p>}
      <div className="max-h-[32rem] overflow-y-auto rounded-md border border-slate-200 bg-white p-4">
        <ul className="space-y-5">
          {knowledgeTaxonomy.map((node) => (
            <NodeOption
              key={node.id}
              node={node}
              onToggle={(id, checked) => setSelected((current) => {
                const next = new Set(current);
                if (checked) next.add(id); else next.delete(id);
                return next;
              })}
              search={normalizedSearch}
              selected={selected}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
