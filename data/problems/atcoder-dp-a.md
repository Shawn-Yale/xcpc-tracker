---
id: atcoder-dp-a
title: Frog 1
platform: AtCoder
contest: "Educational DP Contest"
problem: A
url: "https://atcoder.jp/contests/dp/tasks/dp_a"
solvedAt: "2026-07-06"
durationMinutes: 22
status: A
categories:
  - 动态规划
tags:
  - 线性 DP
  - 最小代价
reviews: []
---

# 题意抽象

从第一个位置走到最后一个位置，每次前进一格或两格并支付高度差。

# 第一想法

枚举到达每个位置的两种来源。

# 正确思路

令 `dp[i]` 为到达位置 i 的最小代价，从 i-1 与 i-2 转移。

# 没想到的关键点

无。

# 错误原因

无。

# 做题感想

适合作为线性 DP 状态定义和边界初始化的基础题。

# 实现注意事项

单独初始化前两个状态，避免访问负下标。
