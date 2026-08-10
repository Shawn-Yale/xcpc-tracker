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
    page.locator('a:visible[href="/problems/codeforces-455-a"]'),
  ).toHaveText("Boredom");

  await page.goto("/problems/codeforces-20-c");
  await expect(page.getByRole("heading", { level: 1, name: "Dijkstra?" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "题意抽象" })).toBeVisible();
  await page.getByRole("link", { name: "编辑题目" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "编辑题目" })).toBeVisible();
  await expect(page.getByLabel("稳定 ID *")).toHaveValue("codeforces-20-c");
  await expect(page.getByLabel("稳定 ID *")).toHaveAttribute("readonly", "");
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
});

test("Review form updates its interval suggestion", async ({ page }) => {
  await page.goto("/review/codeforces-20-c");
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
