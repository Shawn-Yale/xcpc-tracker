import { describe, expect, it } from "vitest";

import {
  solutionTokenLinesText,
  tokenizeSolutionCode,
} from "@/components/problems/solution-code-block";

describe("solution code highlighting", () => {
  it.each([
    ["C", "int main(void) { return 0; }"],
    ["C++17", "#include <vector>\nint main() { return 0; }"],
    ["Python 3", "def main():\n    return 0"],
  ])("produces syntax-colored tokens for %s", async (language, code) => {
    const highlighted = await tokenizeSolutionCode(language, code);
    const colors = new Set(
      highlighted.tokens.flat().map((token) => token.color).filter(Boolean),
    );

    expect(highlighted.tokens.flat()).not.toHaveLength(0);
    expect(colors.size).toBeGreaterThan(1);
    expect(solutionTokenLinesText(highlighted.lines)).toBe(code);
  });

  it("uses a plain presentation for unknown durable languages", async () => {
    const code = "keyword <script> ``` 中文";
    const highlighted = await tokenizeSolutionCode("C++23", code);
    const colors = new Set(
      highlighted.tokens.flat().map((token) => token.color).filter(Boolean),
    );

    expect(solutionTokenLinesText(highlighted.lines)).toBe(code);
    expect(highlighted.tokens.flat()).not.toHaveLength(0);
    expect(colors.size).toBeLessThanOrEqual(1);
  });

  it.each([
    ["ordinary multiline", "int main() {\n  return 0;\n}"],
    ["leading blank line", "\nint main() {}"],
    ["without trailing newline", "int main() {}"],
    ["with one trailing newline", "int main() {}\n"],
    ["multiple blank lines", "int a() {}\n\n\nint b() {}"],
    ["tabs", "int main() {\n\treturn 0;\n}"],
    ["spaces and indentation", "int main() {\n    return 0;\n}"],
    ["Unicode", "// 区间最小值\nint main() {}"],
    ["HTML-like text", "<script>\n</div>\n&"],
    ["three backticks", "const char* fence = \"```\";"],
    ["very long line", `const char* data = "${"x".repeat(1200)}";`],
    ["CRLF", "int main() {\r\n\treturn 0;\r\n}\r\n"],
  ])("preserves %s exactly", async (_name, code) => {
    const highlighted = await tokenizeSolutionCode("C++17", code);

    expect(solutionTokenLinesText(highlighted.lines)).toBe(code);
  });
});
