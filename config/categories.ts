export const categoryValues = [
  "动态规划",
  "图论",
  "数据结构",
  "数学与数论",
  "贪心、构造与不变量",
  "字符串",
  "位运算与状态压缩",
  "计算几何",
] as const;

export type Category = (typeof categoryValues)[number];

export const categoryMetadata: Record<
  Category,
  { slug: string; description: string }
> = {
  动态规划: {
    slug: "dynamic-programming",
    description: "状态设计、转移、边界与各类 DP 优化。",
  },
  图论: {
    slug: "graph-theory",
    description: "图的遍历、最短路、连通性、网络流与树结构。",
  },
  数据结构: {
    slug: "data-structures",
    description: "维护、查询和组织数据的结构与离线技巧。",
  },
  数学与数论: {
    slug: "math-number-theory",
    description: "数论、组合、概率与数学推导。",
  },
  "贪心、构造与不变量": {
    slug: "greedy-constructive-invariants",
    description: "局部最优、构造方法和不变量分析。",
  },
  字符串: {
    slug: "strings",
    description: "字符串处理、匹配、哈希和自动机。",
  },
  位运算与状态压缩: {
    slug: "bitwise-state-compression",
    description: "二进制性质、集合表示与状态压缩。",
  },
  计算几何: {
    slug: "computational-geometry",
    description: "点、线、多边形与几何计算。",
  },
};

export function getCategoryBySlug(slug: string): Category | undefined {
  return categoryValues.find((category) => categoryMetadata[category].slug === slug);
}
