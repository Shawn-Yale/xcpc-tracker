---
id: codeforces-4-a
title: Watermelon
platform: Codeforces
contest: "Codeforces Beta Round 4 (Div. 2 Only)"
problem: A
url: "https://codeforces.com/problemset/problem/4/A"
rating: 800
solvedAt: "2026-07-01"
durationMinutes: 8
status: A
categories:
  - 数学与数论
tags:
  - 奇偶性
  - 分类讨论
reviews: []
---

# 题意抽象

判断给定重量能否拆成两个正偶数之和。

# 第一想法

检查总重量是否为偶数。

# 正确思路

除偶数条件外，还要排除重量为 2 的边界情况。

# 没想到的关键点

无。

# 错误原因

无。

# 做题感想

简单条件题也需要检查正数约束。

# 实现注意事项

判断 `w > 2 && w % 2 == 0`。
