import { serializeProblemMarkdown } from "@/lib/problems/markdown";
import {
  problemFrontmatterSchema,
  type ProblemFrontmatterInput,
} from "@/lib/problems/schema";
import type { ProblemFile } from "@/lib/problems/types";
import { writeFile } from "node:fs/promises";
import path from "node:path";

function problemFixture(
  input: ProblemFrontmatterInput,
  content = "\n# 正确思路\n\n测试专用正文。\n",
): ProblemFile {
  const frontmatter = problemFrontmatterSchema.parse(input);
  return {
    frontmatter,
    content,
    fileName: `${frontmatter.id}.md`,
  };
}

export function createProblemFileFixtures(): ProblemFile[] {
  return [
    problemFixture({
      id: "fixture-math-bitwise",
      title: "Shift fixture",
      platform: "AtCoder",
      contest: "Fixture Contest 081",
      problem: "B",
      solvedAt: "2026-07-08",
      status: "B",
      categories: ["数学与数论", "位运算与状态压缩"],
      tags: ["因子分解", "二进制最低位"],
      reviews: [],
    }),
    problemFixture({
      id: "fixture-greedy-game",
      title: "Card Game fixture",
      platform: "AtCoder",
      contest: "Fixture Contest 088",
      problem: "B",
      solvedAt: "2026-08-02",
      status: "C",
      categories: ["贪心、构造与不变量"],
      tags: ["贪心", "排序", "博弈"],
      reviews: [],
    }),
    problemFixture({
      id: "fixture-graph-gap",
      title: "Graph Gap fixture",
      platform: "AtCoder",
      contest: "Fixture Contest 168",
      problem: "D",
      solvedAt: "2026-08-08",
      status: "D",
      categories: ["图论"],
      tags: ["BFS", "最短路树", "前驱记录"],
      nextReviewDate: "2026-08-11",
      reviewIntervalDays: 3,
      reviews: [],
    }),
    problemFixture({
      id: "fixture-frog-dp",
      title: "Frog fixture",
      platform: "AtCoder",
      contest: "Educational Fixture Contest",
      problem: "A",
      solvedAt: "2026-07-06",
      status: "A",
      categories: ["动态规划"],
      tags: ["线性 DP", "最小代价"],
      reviews: [],
    }),
    problemFixture({
      id: "fixture-shortest-path",
      title: "Shortest Path fixture",
      platform: "Codeforces",
      contest: "Fixture Alpha Round 20",
      problem: "C",
      rating: 1900,
      solvedAt: "2026-07-11",
      status: "B",
      categories: ["图论", "数据结构"],
      tags: ["Dijkstra", "最短路", "路径恢复", "优先队列"],
      nextReviewDate: "2026-08-08",
      reviewIntervalDays: 14,
      reviews: [
        {
          date: "2026-07-25",
          fromStatus: "C",
          toStatus: "B",
          note: "Fixture review history.",
          nextIntervalDays: 14,
        },
      ],
    }),
    problemFixture({
      id: "fixture-math-basic",
      title: "Parity fixture",
      platform: "Codeforces",
      contest: "Fixture Beta Round 4",
      problem: "A",
      rating: 800,
      solvedAt: "2026-07-01",
      status: "A",
      categories: ["数学与数论"],
      tags: ["奇偶性", "分类讨论"],
      reviews: [],
    }),
    problemFixture({
      id: "fixture-boredom-dp",
      title: "Boredom fixture",
      platform: "Codeforces",
      contest: "Fixture Round 260",
      problem: "A",
      rating: 1500,
      solvedAt: "2026-08-05",
      status: "C",
      categories: ["动态规划"],
      tags: ["线性 DP", "值域 DP", "计数"],
      nextReviewDate: "2026-08-12",
      reviewIntervalDays: 7,
      reviews: [],
    }),
    problemFixture({
      id: "fixture-string-basic",
      title: "String fixture",
      platform: "Codeforces",
      contest: "Fixture Beta Round 65",
      problem: "A",
      rating: 800,
      solvedAt: "2026-07-03",
      status: "B",
      categories: ["字符串"],
      tags: ["字符串模拟", "边界处理"],
      reviews: [],
    }),
  ];
}

export async function writeProblemFileFixtures(
  directory: string,
  problems = createProblemFileFixtures(),
): Promise<void> {
  await Promise.all(
    problems.map((problem) =>
      writeFile(
        path.join(directory, problem.fileName),
        serializeProblemMarkdown(problem.frontmatter, problem.content),
        "utf8",
      ),
    ),
  );
}

