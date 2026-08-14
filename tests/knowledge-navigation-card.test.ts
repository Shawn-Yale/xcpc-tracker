import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { KnowledgeNavigationCard } from "@/components/knowledge/knowledge-navigation-card";
import { knowledgeCatalog } from "@/config/knowledge-taxonomy";
import { getKnowledgeEntry } from "@/lib/knowledge/catalog";
import { getKnowledgeHref } from "@/lib/knowledge/routing";

function renderCard(id: string, problemCount: number): string {
  const entry = getKnowledgeEntry(knowledgeCatalog, id);
  if (!entry) throw new Error(`Unknown test Knowledge ID: ${id}`);

  return renderToStaticMarkup(
    createElement(KnowledgeNavigationCard, {
      href: getKnowledgeHref(entry.id),
      title: entry.name,
      problemCount,
    }),
  );
}

describe("KnowledgeNavigationCard", () => {
  it("renders one whole-card link with a count and decorative arrow", () => {
    const markup = renderCard("graph", 12);

    expect(markup).toContain('href="/knowledge/graph"');
    expect(markup).toContain("12 题");
    expect(markup.match(/<a\b/g)).toHaveLength(1);
    expect(markup).not.toMatch(/<(?:button|input|select|textarea)\b/);
    expect(markup).toMatch(/aria-hidden="true"[^>]*>→<\/span>/);
  });

  it("keeps canonical child hrefs and renders a zero count", () => {
    const markup = renderCard("graph.shortest-path", 0);

    expect(markup).toContain('href="/knowledge/graph/shortest-path"');
    expect(markup).toContain("0 题");
  });
});
