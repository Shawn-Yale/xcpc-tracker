export type SolutionHighlightLanguage = "c" | "cpp" | "python" | "text";

type SolutionLanguageOption = {
  readonly value: string;
  readonly highlightLanguage: Exclude<SolutionHighlightLanguage, "text">;
};

export const solutionLanguageOptions = [
  { value: "C", highlightLanguage: "c" },
  { value: "C++11", highlightLanguage: "cpp" },
  { value: "C++14", highlightLanguage: "cpp" },
  { value: "C++17", highlightLanguage: "cpp" },
  { value: "C++20", highlightLanguage: "cpp" },
  { value: "Python 3", highlightLanguage: "python" },
] as const satisfies readonly SolutionLanguageOption[];

export function getSolutionHighlightLanguage(
  value: string,
): SolutionHighlightLanguage {
  return (
    solutionLanguageOptions.find((option) => option.value === value)
      ?.highlightLanguage ?? "text"
  );
}
