---
id: codeforces-455-a
title: Boredom
platform: Codeforces
contest: "Codeforces Round 260 (Div. 1)"
problem: A
url: "https://codeforces.com/problemset/problem/455/A"
rating: 1500
solvedAt: "2026-08-05"
durationMinutes: 75
status: C
categories:
  - 动态规划
tags:
  - 线性 DP
  - 值域 DP
  - 计数
nextReviewDate: "2026-08-12"
reviewIntervalDays: 7
reviews: []
---

# 题意抽象

选择某个数值会获得该值的贡献，同时不能再选择相邻数值。

# 第一想法

尝试按照原数组位置做选择，状态很难表达。

# 正确思路

先统计每个数值出现次数，再在值域上做类似打家劫舍的线性 DP。

# 没想到的关键点

冲突关系发生在数值之间，而不是原数组下标之间。

# 错误原因

没有及时把重复元素合并为同一个总贡献。

# 做题感想

需要练习从原始序列转换到值域模型。

# 实现注意事项

贡献为 `value * count[value]`，并使用 64 位整数。
