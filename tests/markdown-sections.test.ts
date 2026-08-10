import { describe, expect, it } from "vitest";

import {
  extractMarkdownSection,
  getMarkdownExcerpt,
} from "@/lib/problems/markdown-sections";

const markdown = `# 正确思路

先进行 BFS。

# 错误原因

没有理解 **BFS 树** 与最短路的关系。

## 补充

需要记录 \`parent\`。

# 做题感想

回到基础知识重新练习。
`;

describe("Markdown section extraction", () => {
  it("extracts a section including nested headings and stops at its next peer", () => {
    expect(extractMarkdownSection(markdown, "错误原因")).toBe(
      "没有理解 **BFS 树** 与最短路的关系。\n\n## 补充\n\n需要记录 `parent`。",
    );
  });

  it("returns null for missing or empty sections", () => {
    expect(extractMarkdownSection(markdown, "第一想法")).toBeNull();
    expect(extractMarkdownSection("# 错误原因\n\n# 做题感想\n内容", "错误原因")).toBeNull();
  });

  it("creates a plain, bounded excerpt for the D status view", () => {
    expect(getMarkdownExcerpt(markdown, "错误原因", 40)).toBe(
      "没有理解 BFS 树 与最短路的关系。 补充 需要记录 parent。",
    );
    expect(getMarkdownExcerpt(markdown, "做题感想", 8)).toBe("回到基础知识重新…");
  });
});
