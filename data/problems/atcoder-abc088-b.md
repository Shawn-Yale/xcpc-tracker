---
id: atcoder-abc088-b
title: Card Game for Two
platform: AtCoder
contest: "AtCoder Beginner Contest 088"
problem: B
url: "https://atcoder.jp/contests/abc088/tasks/abc088_b"
solvedAt: "2026-08-02"
durationMinutes: 36
status: C
categories:
  - 贪心、构造与不变量
tags:
  - 贪心
  - 排序
  - 博弈
reviews: []
---

# 题意抽象

两人轮流选取卡片并最大化自己的总分，求最终分差。

# 第一想法

尝试用博弈 DP 描述每一轮的选择。

# 正确思路

双方都应选择当前最大值，降序排序后将偶数下标加给 Alice、奇数下标加给 Bob。

# 没想到的关键点

没有额外状态，当前取最大值就是双方共同的最优策略。

# 错误原因

把简单贪心问题过度建模成了区间博弈。

# 做题感想

先判断局部最优是否直接成立，再考虑更复杂的 DP。

# 实现注意事项

排序后直接交替累加即可。
