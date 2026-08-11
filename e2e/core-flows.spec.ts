import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const readOnlyRoutes = [
  ["/", "把每一次重做，变成真正的掌握。"],
  ["/problems", "题目库"],
  ["/knowledge", "知识分类"],
  ["/status", "掌握状态"],
  ["/review", "Review 队列"],
  ["/statistics", "统计分析"],
] as const;

const expectedSolutionCode = [
  "#include <bits/stdc++.h>",
  "",
  "// 中文注释：安全显示 HTML-like text 与 Markdown fence",
  "int main() {",
  '  const char* symbols = R"(<script> & </div> ``` { } # \\\\)";',
  `  const char* longLine = "${"x".repeat(240)}";`,
  "  return 0;",
  "}",
].join("\n");

test("top-level routes render without page-level overflow", async ({ page }) => {
  for (const [route, heading] of readOnlyRoutes) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBe(dimensions.clientWidth);
  }
});

test("primary navigation and skip link work with the keyboard", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "跳到主要内容" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();

  await page.getByRole("link", { name: "Problems" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/problems$/);
  await expect(page.getByRole("link", { name: "Problems" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("problem browsing, filtering, and Markdown detail are usable", async ({ page }) => {
  await page.goto("/problems");
  await page.locator('select[name="status"]').selectOption("C");
  await page.getByRole("button", { name: "应用筛选" }).click();
  await expect(page).toHaveURL(/status=C/);
  await expect(
    page.locator('a:visible[href="/problems/e2e-boredom"]'),
  ).toHaveText("Boredom E2E Fixture");

  await page.goto("/problems");
  const knowledgeCombobox = page.getByRole("combobox", { name: "知识点" });
  await knowledgeCombobox.click();
  await expect(page.getByRole("listbox").getByRole("option")).toHaveCount(11);
  await knowledgeCombobox.fill("没有这个知识点");
  await expect(page.getByText("没有匹配的知识点")).toBeVisible();
  await knowledgeCombobox.press("Escape");
  await expect(knowledgeCombobox).toHaveAttribute("aria-expanded", "false");

  await knowledgeCombobox.click();
  await knowledgeCombobox.fill("区间查询结构");
  await page.getByRole("option", { name: "数据结构 / 区间查询结构", exact: true }).click();
  await expect(page.locator('input[name="knowledge"]')).toHaveValue("data-structure.range-query");
  await expect(page).toHaveURL(/\/problems$/);
  await page.getByRole("button", { name: "应用筛选" }).click();
  await expect(page).toHaveURL(/knowledge=data-structure.range-query/);
  await page.getByRole("link", { name: "重置" }).click();
  await expect(page).toHaveURL(/\/problems$/);

  await knowledgeCombobox.click();
  await knowledgeCombobox.fill("graph.shortest-path.dijkstra");
  await knowledgeCombobox.press("ArrowDown");
  await knowledgeCombobox.press("Enter");
  await expect(knowledgeCombobox).toHaveValue("图论 / 最短路 / Dijkstra");
  await page.getByRole("button", { name: "应用筛选" }).click();
  await expect(page).toHaveURL(/knowledge=graph.shortest-path.dijkstra/);
  const dijkstraLink = page.getByRole("link", {
    name: "Dijkstra E2E Fixture",
  });
  await expect(dijkstraLink).toBeVisible();
  const problemItem = dijkstraLink.locator(
    "xpath=ancestor::*[self::tr or self::li][1]",
  );
  await expect(problemItem.getByTitle("图论 / 最短路 / Dijkstra")).toHaveText(
    "Dijkstra",
  );
  await expect(
    problemItem.getByText("图论 / 最短路 / Dijkstra", { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByText("Boredom E2E Fixture")).toHaveCount(0);

  await page.goto("/problems/e2e-dijkstra");
  await expect(page.getByRole("heading", { level: 1, name: "Dijkstra E2E Fixture" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "题意抽象" })).toBeVisible();
  const knowledgeSection = page.locator(
    'section[aria-labelledby="knowledge-title"]',
  );
  await expect(
    knowledgeSection.getByTitle("图论 / 最短路 / Dijkstra"),
  ).toHaveText("Dijkstra");
  await expect(
    knowledgeSection.getByText("图论 / 最短路 / Dijkstra", { exact: true }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "编辑题目" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "编辑题目" })).toBeVisible();
  await expect(page.getByLabel("稳定 ID *")).toHaveValue("e2e-dijkstra");
  await expect(page.getByLabel("稳定 ID *")).toHaveAttribute("readonly", "");
  await expect(page.getByLabel("Dijkstra", { exact: true })).toBeChecked();
});

test("AC solution disclosure is safe, collapsible, and contained", async ({
  page,
}) => {
  await page.goto("/problems/e2e-dijkstra");
  const solutionSection = page.locator(
    'section[aria-labelledby="ac-solution-title"]',
  );
  const disclosure = solutionSection.locator("details");
  const summary = solutionSection.locator("summary");
  const language = solutionSection.getByText("C++17", { exact: true });
  const codeBlock = solutionSection.locator("pre");

  await expect(solutionSection.getByRole("heading", { name: "AC 代码" })).toBeVisible();
  await expect(summary).toHaveText("查看 AC 代码");
  await expect(disclosure).not.toHaveAttribute("open", "");
  await expect(language).toBeHidden();
  await expect(codeBlock).toBeHidden();

  await summary.click();
  await expect(disclosure).toHaveAttribute("open", "");
  await expect(language).toBeVisible();
  await expect(codeBlock).toBeVisible();
  expect(await codeBlock.textContent()).toBe(expectedSolutionCode);

  const overflow = await page.evaluate(() => {
    const code = document.querySelector<HTMLElement>(
      'section[aria-labelledby="ac-solution-title"] pre',
    );

    if (!code) {
      throw new Error("AC solution code block was not rendered");
    }

    return {
      codeClientWidth: code.clientWidth,
      codeScrollWidth: code.scrollWidth,
      documentClientWidth: document.documentElement.clientWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
    };
  });

  expect(overflow.codeScrollWidth).toBeGreaterThan(overflow.codeClientWidth);
  expect(overflow.documentScrollWidth).toBeLessThanOrEqual(
    overflow.documentClientWidth,
  );

  await summary.click();
  await expect(disclosure).not.toHaveAttribute("open", "");
  await expect(codeBlock).toBeHidden();

  await page.goto("/problems/e2e-boredom");
  await expect(
    page.locator('section[aria-labelledby="ac-solution-title"]'),
  ).toHaveCount(0);
});

test("create form exposes safe client-side interactions", async ({ page }) => {
  await page.goto("/problems/new");
  await expect(page.getByRole("heading", { level: 1, name: "新增题目" })).toBeVisible();
  await page.getByLabel("标题 *").fill("Smoke Test Problem");
  await page.getByLabel("Contest").fill("Round 100");
  await page.getByLabel("题号").fill("A");
  await expect(page.getByLabel("稳定 ID *")).toHaveValue(
    "codeforces-round-100-a",
  );
  await page.getByLabel("安排下一次 Review").check();
  await expect(page.getByLabel("下次 Review 日期")).toBeEnabled();
  await expect(page.getByLabel("间隔天数")).toBeEnabled();
  await page.getByLabel("搜索知识点").fill("Bellman");
  await page.getByLabel("Bellman–Ford", { exact: true }).check();
  await expect(page.getByText("图论 / 最短路 / Bellman–Ford")).toBeVisible();
});

test("hierarchical Knowledge navigation resolves canonical paths", async ({ page }) => {
  await page.goto("/knowledge/graph/shortest-path/dijkstra");
  await expect(page.getByRole("heading", { level: 1, name: "Dijkstra" })).toBeVisible();
  await expect(page.getByRole("link", { name: "最短路" })).toHaveAttribute("href", "/knowledge/graph/shortest-path");
  await expect(page.locator('a:visible[href="/problems/e2e-dijkstra"]')).toBeVisible();

  await page.goto("/knowledge/not/a/real/node");
  await expect(page.getByRole("heading", { name: "Knowledge node not found" })).toBeVisible();
});

test("Review form updates its interval suggestion", async ({ page }) => {
  await page.goto("/review/e2e-dijkstra");
  await page.getByLabel("新状态").selectOption("D");
  await expect(page.getByLabel("下次间隔（天）")).toHaveValue("3");
});

test("core pages have no serious automated accessibility violations", async ({ page }) => {
  for (const route of ["/", "/problems", "/problems/new", "/review", "/statistics"] as const) {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    const seriousViolations = results.violations.filter(
      (violation) => violation.impact === "serious" || violation.impact === "critical",
    );
    expect(seriousViolations, `${route}: ${seriousViolations.map((item) => item.id).join(", ")}`).toEqual([]);
  }
});
