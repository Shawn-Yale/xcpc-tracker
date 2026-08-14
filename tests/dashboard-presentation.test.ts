import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DailyFocus, DashboardHero } from "@/components/dashboard/dashboard-overview";
import { MasteryPanel } from "@/components/dashboard/mastery-panel";
import { dateOnlySchema } from "@/lib/date/date-only";
import { problemFrontmatterSchema } from "@/lib/problems/schema";
import type { ProblemFile } from "@/lib/problems/types";
import type { ReviewQueue } from "@/lib/review/queue";

const today = dateOnlySchema.parse("2026-08-14");

function problem(id: string, nextReviewDate: string): ProblemFile {
  return {
    fileName: `${id}.md`,
    content: "",
    frontmatter: problemFrontmatterSchema.parse({
      id,
      title: `${id} title`,
      platform: "Codeforces",
      solvedAt: "2026-08-01",
      status: "C",
      knowledge: [],
      tags: [],
      nextReviewDate,
      reviewIntervalDays: 7,
      reviews: [],
    }),
  };
}

function queue(input: Partial<ReviewQueue> = {}): ReviewQueue {
  return {
    overdue: [],
    today: [],
    upcoming: [],
    ...input,
  };
}

function renderHero(reviewQueue: ReviewQueue): string {
  return renderToStaticMarkup(
    createElement(DashboardHero, {
      focusMessage: "Focus on the next review.",
      reviewQueue,
      today,
    }),
  );
}

function renderDailyFocus(reviewQueue: ReviewQueue): string {
  return renderToStaticMarkup(
    createElement(DailyFocus, { reviewQueue, today }),
  );
}

describe("Dashboard hero presentation", () => {
  it("uses Review queue counts for the Today action summary without repeating mastery", () => {
    const markup = renderHero(queue({
      overdue: [problem("overdue-one", "2026-08-13")],
      today: [
        problem("today-one", "2026-08-14"),
        problem("today-two", "2026-08-14"),
      ],
      upcoming: [
        problem("upcoming-one", "2026-08-15"),
        problem("upcoming-two", "2026-08-16"),
        problem("upcoming-three", "2026-08-17"),
      ],
    }));

    expect(markup).toMatch(
      /<dt[^>]*>Today<\/dt><dd[^>]*>[\s\S]*?<span[^>]*>2<\/span>[\s\S]*?待复习<\/span><\/dd>/,
    );
    expect(markup).toMatch(
      /<dt[^>]*>overdue<\/dt><dd[^>]*>1<\/dd>/,
    );
    expect(markup).toMatch(
      /<dt[^>]*>next 7 days<\/dt><dd[^>]*>3<\/dd>/,
    );
    expect(markup).toContain('aria-label="今日行动摘要"');
    expect(markup).not.toContain('aria-label="Today Review');
    expect(markup).not.toContain('aria-label="Overdue');
    expect(markup).not.toContain('aria-label="Next 7 Days');
    expect(markup).not.toContain("Mastery Rate");
    expect(markup).not.toContain("已掌握");
  });

  it("leaves overall mastery in the Progress section", () => {
    const markup = renderToStaticMarkup(
      createElement(MasteryPanel, {
        stats: {
          total: 4,
          statusCounts: { A: 1, B: 1, C: 1, D: 1 },
          mastered: 2,
          masteryRate: 50,
        },
      }),
    );

    expect(markup).toContain("总体掌握进度");
    expect(markup).toContain("50%");
    expect(markup).toContain("2 / 4 已掌握");
  });
});

describe("Dashboard daily focus presentation", () => {
  it("renders separate Overdue and Today columns when overdue work exists", () => {
    const markup = renderDailyFocus(queue({
      overdue: [problem("overdue-task", "2026-08-13")],
      today: [problem("today-task", "2026-08-14")],
    }));

    expect(markup).toContain('id="overdue-focus-title"');
    expect(markup).toContain('id="today-focus-title"');
    expect(markup).toContain("xl:grid-cols-2");
    expect(markup).toContain('href="/review/overdue-task"');
    expect(markup).toContain('href="/review/today-task"');
  });

  it("uses the full focus width for Today when there is no overdue work", () => {
    const markup = renderDailyFocus(queue({
      today: [problem("today-task", "2026-08-14")],
    }));

    expect(markup).toContain("Overdue 0");
    expect(markup).toContain("当前没有逾期任务");
    expect(markup).not.toContain('id="overdue-focus-title"');
    expect(markup).not.toContain("没有逾期任务，节奏保持得很好。");
    expect(markup).not.toContain("xl:grid-cols-2");
    expect(markup).toContain(
      'aria-labelledby="today-focus-title" class="w-full min-w-0"',
    );
    expect(markup).toContain('href="/review/today-task"');
    expect(markup).toContain('href="/review"');
  });

  it("keeps both empty states lightweight and clear", () => {
    const markup = renderDailyFocus(queue());

    expect(markup).toContain("Overdue 0");
    expect(markup).toContain("当前没有逾期任务");
    expect(markup).toContain("Today");
    expect(markup).toContain("今天没有到期 Review。");
    expect(markup).not.toContain('id="overdue-focus-title"');
    expect(markup).not.toContain("xl:grid-cols-2");
  });
});
