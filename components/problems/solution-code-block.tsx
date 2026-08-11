import { Fragment, type CSSProperties } from "react";
import { codeToTokens } from "shiki";

import { getSolutionHighlightLanguage } from "@/config/solution-languages";

const codeBlockClassName =
  "mt-3 max-w-full overflow-x-auto whitespace-pre rounded-md border border-slate-200 bg-white px-4 py-3 font-mono text-sm leading-6 text-slate-900";

type ShikiTokensResult = Awaited<ReturnType<typeof codeToTokens>>;

export type SolutionTokenLine = {
  readonly tokens: ShikiTokensResult["tokens"][number];
  readonly lineEnding: "" | "\n" | "\r\n";
};

export function pairSolutionTokenLines(
  code: string,
  tokenLines: ShikiTokensResult["tokens"],
): SolutionTokenLine[] {
  const lineEndings = [...code.matchAll(/\r\n|\n/g)].map(
    (match) => match[0] as "\n" | "\r\n",
  );

  if (tokenLines.length !== lineEndings.length + 1) {
    throw new Error("Shiki token lines do not match the original solution code");
  }

  return tokenLines.map((tokens, index) => ({
    tokens,
    lineEnding: lineEndings[index] ?? "",
  }));
}

export function solutionTokenLinesText(lines: readonly SolutionTokenLine[]): string {
  return lines
    .map(
      (line) =>
        `${line.tokens.map((token) => token.content).join("")}${line.lineEnding}`,
    )
    .join("");
}

export async function tokenizeSolutionCode(language: string, code: string) {
  const result = await codeToTokens(code, {
    lang: getSolutionHighlightLanguage(language),
    theme: "github-light-default",
  });

  return {
    ...result,
    lines: pairSolutionTokenLines(code, result.tokens),
  };
}

function tokenStyle(token: ShikiTokensResult["tokens"][number][number]) {
  return {
    color: token.color,
    backgroundColor: token.bgColor,
    ...token.htmlStyle,
  } satisfies CSSProperties;
}

function RawSolutionCode({ code }: { code: string }) {
  return (
    <pre className={codeBlockClassName}>
      <code>{code}</code>
    </pre>
  );
}

export async function SolutionCodeBlock({
  language,
  code,
}: {
  language: string;
  code: string;
}) {
  let highlighted: Awaited<ReturnType<typeof tokenizeSolutionCode>>;

  try {
    highlighted = await tokenizeSolutionCode(language, code);
  } catch {
    return <RawSolutionCode code={code} />;
  }

  return (
    <pre
      className={codeBlockClassName}
      style={{ color: highlighted.fg, backgroundColor: highlighted.bg }}
    >
      <code>
        {highlighted.lines.map((line, lineIndex) => (
          <Fragment key={lineIndex}>
            {line.tokens.map((token, tokenIndex) => (
              <span
                key={`${token.offset}-${tokenIndex}`}
                style={tokenStyle(token)}
              >
                {token.content}
              </span>
            ))}
            {line.lineEnding}
          </Fragment>
        ))}
      </code>
    </pre>
  );
}
