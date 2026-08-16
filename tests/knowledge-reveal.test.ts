import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { KnowledgeReveal } from "@/components/knowledge/knowledge-reveal";

describe("KnowledgeReveal", () => {
  it("conditionally omits knowledge text until the control is revealed", () => {
    const markup = renderToStaticMarkup(
      createElement(KnowledgeReveal, null, "树状数组 · 线段树"),
    );

    expect(markup).toContain("知识点已隐藏");
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain('aria-label="显示知识点"');
    expect(markup).toContain('type="button"');
    expect(markup).not.toContain("树状数组");
    expect(markup).not.toContain("线段树");
  });
});
