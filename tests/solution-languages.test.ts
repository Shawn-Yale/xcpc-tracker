import { describe, expect, it } from "vitest";

import {
  getSolutionHighlightLanguage,
  solutionLanguageOptions,
} from "@/config/solution-languages";

describe("solution language presentation catalog", () => {
  it("contains the exact flat language vocabulary in display order", () => {
    expect(solutionLanguageOptions.map((option) => option.value)).toEqual([
      "C",
      "C++11",
      "C++14",
      "C++17",
      "C++20",
      "Python 3",
    ]);
  });

  it.each([
    ["C", "c"],
    ["C++11", "cpp"],
    ["C++14", "cpp"],
    ["C++17", "cpp"],
    ["C++20", "cpp"],
    ["Python 3", "python"],
    ["C++23", "text"],
    ["Some Future Compiler", "text"],
  ] as const)("maps %s to %s", (language, expected) => {
    expect(getSolutionHighlightLanguage(language)).toBe(expected);
  });
});
