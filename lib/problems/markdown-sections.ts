export function extractMarkdownSection(
  content: string,
  sectionTitle: string,
): string | null {
  const lines = content.split(/\r?\n/);
  let sectionLevel: number | null = null;
  const collected: string[] = [];

  for (const line of lines) {
    const heading = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);

    if (heading) {
      const level = heading[1].length;
      const title = heading[2].trim();

      if (sectionLevel === null && title === sectionTitle) {
        sectionLevel = level;
        continue;
      }

      if (sectionLevel !== null && level <= sectionLevel) {
        break;
      }
    }

    if (sectionLevel !== null) {
      collected.push(line);
    }
  }

  const result = collected.join("\n").trim();
  return result === "" ? null : result;
}

export function getMarkdownExcerpt(
  content: string,
  sectionTitle: string,
  maximumLength = 180,
): string | null {
  const section = extractMarkdownSection(content, sectionTitle);

  if (!section) {
    return null;
  }

  const plainText = section
    .replace(/```[\s\S]*?```/g, " [代码] ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[*_>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return plainText.length <= maximumLength
    ? plainText
    : `${plainText.slice(0, maximumLength).trimEnd()}…`;
}
