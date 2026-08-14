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
  await expect(page.getByLabel("编程语言", { exact: true })).toHaveValue(
    "C++17",
  );
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
  await expect(codeBlock).toHaveCSS("background-color", "rgb(255, 255, 255)");
  expect(await codeBlock.locator("code > span").count()).toBeGreaterThan(1);
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

test("unknown durable solution languages remain editable and readable", async ({
  page,
}) => {
  await page.goto("/problems/e2e-legacy-solution");
  const solutionSection = page.locator(
    'section[aria-labelledby="ac-solution-title"]',
  );
  await solutionSection.locator("summary").click();
  await expect(
    solutionSection.getByText("C++23", { exact: true }),
  ).toBeVisible();
  await expect(solutionSection.locator("pre")).toHaveText(
    "legacy <script> & </div> ``` code",
  );
  await expect(solutionSection.locator("pre")).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );

  await page.goto("/problems/e2e-legacy-solution/edit");
  const languageSelect = page.getByLabel("编程语言", { exact: true });
  await expect(languageSelect).toHaveValue("C++23");
  await expect(
    languageSelect.locator('option[value="C++23"]'),
  ).toHaveText("C++23（当前记录）");
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

  const languageSelect = page.getByLabel("编程语言", { exact: true });
  await expect(languageSelect).toHaveAttribute("name", "solutionLanguage");
  await expect(languageSelect).toHaveValue("");
  await expect(languageSelect.locator("option")).toHaveText([
    "未选择",
    "C",
    "C++11",
    "C++14",
    "C++17",
    "C++20",
    "Python 3",
  ]);
});

test("hierarchical Knowledge navigation resolves canonical paths", async ({ page }) => {
  await page.goto("/knowledge");
  await expect(page.getByRole("heading", { name: "知识领域" })).toBeVisible();
  await expect(
    page.getByText("统计包含每个领域及其下级知识点，每题在同一领域下只计一次。"),
  ).toBeVisible();
  await expect(page.getByText("10 个领域")).toBeVisible();
  await expect(
    page.getByText(/Knowledge Domains|descendants rollup|个 Domain/),
  ).toHaveCount(0);
  const domainCards = page.locator('section[aria-labelledby="knowledge-list-title"] article a');
  await expect(domainCards.first()).toContainText("通用算法技巧");
  await expect(domainCards.first()).toHaveAttribute(
    "href",
    "/knowledge/algorithmic-techniques",
  );
  const graphDomainCard = page.getByRole("link", { name: /图论.*1 题/ });
  await expect(graphDomainCard).toHaveAttribute("href", "/knowledge/graph");
  const graphDomainBox = await graphDomainCard.boundingBox();
  expect(graphDomainBox).not.toBeNull();
  await graphDomainCard.click({
    position: { x: graphDomainBox!.width - 8, y: graphDomainBox!.height - 8 },
  });
  await expect(page).toHaveURL(/\/knowledge\/graph$/);
  await expect(page.getByRole("heading", { name: "训练概览" })).toBeVisible();
  await expect(page.getByText("直接归类 0 题")).toBeVisible();
  await expect(
    page.getByText("以上统计包含当前知识点及其下级知识点。"),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "下级知识点 · 9" }),
  ).toBeVisible();
  await expect(
    page.getByText("当前知识点及其下级知识点，共 1 题"),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "在题目库中筛选" })).toHaveAttribute(
    "href",
    "/problems?knowledge=graph",
  );

  const childCards = page.locator('section[aria-labelledby="children-title"] a');
  await expect(childCards.first()).toContainText("连通性");
  const shortestPathCard = page.getByRole("link", { name: /最短路.*1 题/ });
  await expect(shortestPathCard).toHaveAttribute(
    "href",
    "/knowledge/graph/shortest-path",
  );
  const shortestPathBox = await shortestPathCard.boundingBox();
  expect(shortestPathBox).not.toBeNull();
  await shortestPathCard.click({
    position: { x: shortestPathBox!.width - 8, y: shortestPathBox!.height - 8 },
  });
  await expect(page).toHaveURL(/\/knowledge\/graph\/shortest-path$/);

  await page.goto("/knowledge/graph/shortest-path/dijkstra");
  await expect(page.getByRole("heading", { level: 1, name: "Dijkstra" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "训练概览" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /下级知识点/ })).toHaveCount(0);
  await expect(page.getByText("当前知识点，共 1 题")).toBeVisible();
  await expect(page.getByText(/直接归类|Rollup|Direct|descendants/)).toHaveCount(0);
  await expect(page.getByRole("link", { name: "在题目库中筛选" })).toHaveAttribute(
    "href",
    "/problems?knowledge=graph.shortest-path.dijkstra",
  );
  await expect(page.getByRole("link", { name: "最短路" })).toHaveAttribute("href", "/knowledge/graph/shortest-path");
  await expect(page.locator('a:visible[href="/problems/e2e-dijkstra"]')).toBeVisible();

  await page.goto("/knowledge/not/a/real/node");
  await expect(page.getByRole("heading", { name: "Knowledge node not found" })).toBeVisible();
});

test("Statistics Knowledge mastery filters and expands one taxonomy level at a time", async ({
  page,
}) => {
  await page.goto("/statistics");

  const filters = page.getByRole("group", { name: "分类掌握度筛选" });
  const withTraining = filters.getByRole("button", { name: "有训练记录" });
  await expect(withTraining).toHaveAttribute("aria-pressed", "true");
  await expect(filters.getByRole("button", { name: "全部" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );

  const directHelp = page.getByRole("button", { name: "说明 Direct" });
  const rollupHelp = page.getByRole("button", { name: "说明 Rollup" });
  const directExplanation = page.getByRole("note").filter({
    hasText: "仅统计直接归类到当前知识节点的题目。",
  });
  const rollupExplanation = page.getByRole("note").filter({
    hasText: "统计当前节点及其所有下级知识节点中的题目；同一道题在当前节点下只计一次。",
  });
  await expect(directHelp).toBeVisible();
  await expect(rollupHelp).toBeVisible();
  await expect(directExplanation).toBeHidden();
  await directHelp.focus();
  await directHelp.press("Enter");
  await expect(directExplanation).toBeVisible();
  await rollupHelp.click();
  await expect(rollupExplanation).toBeVisible();

  await expect(page.getByRole("link", { name: "图论", exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "动态规划", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "最短路", exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Dijkstra", exact: true })).toHaveCount(0);

  const graphToggle = page.getByRole("button", { name: "展开 图论" });
  await expect(graphToggle).toHaveAttribute("aria-expanded", "false");
  await graphToggle.click();
  await expect(page.getByRole("button", { name: "收起 图论" })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await expect(
    page.getByRole("link", { name: "最短路", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Dijkstra", exact: true })).toHaveCount(0);

  const shortestPathToggle = page.getByRole("button", { name: "展开 最短路" });
  await shortestPathToggle.click();
  await expect(
    page.getByRole("button", { name: "收起 最短路" }),
  ).toHaveAttribute("aria-expanded", "true");
  const dijkstraLink = page.getByRole("link", { name: "Dijkstra", exact: true });
  await expect(dijkstraLink).toBeVisible();
  await expect(
    dijkstraLink.locator("xpath=preceding-sibling::button[1]"),
  ).toHaveCount(0);

  await page.getByRole("button", { name: "收起 图论" }).click();
  await expect(page.getByRole("button", { name: "展开 图论" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  await expect(
    page.getByRole("link", { name: "最短路", exact: true }),
  ).toHaveCount(0);

  for (const name of ["全部", "C-D 薄弱", "已掌握", "有训练记录"] as const) {
    const filter = filters.getByRole("button", { name });
    await filter.click();
    await expect(filter).toHaveAttribute("aria-pressed", "true");
  }

  await filters.getByRole("button", { name: "已掌握" }).click();
  const masteredGraphToggle = page.getByRole("button", { name: "展开 图论" });
  await masteredGraphToggle.click();
  await expect(
    page.getByRole("button", { name: "收起 最短路" }),
  ).toHaveAttribute("aria-expanded", "true");
  await expect(dijkstraLink).toBeVisible();
  await dijkstraLink.click();
  await expect(page).toHaveURL(/\/knowledge\/graph\/shortest-path\/dijkstra$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Dijkstra" }),
  ).toBeVisible();
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
