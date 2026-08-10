---
id: atcoder-abc081-b
title: Shift only
platform: AtCoder
contest: "AtCoder Beginner Contest 081"
problem: B
url: "https://atcoder.jp/contests/abc081/tasks/abc081_b"
solvedAt: "2026-07-08"
durationMinutes: 18
status: B
categories:
  - 数学与数论
  - 位运算与状态压缩
tags:
  - 因子分解
  - 二进制最低位
reviews: []
---

# 题意抽象

求所有整数能够同时除以 2 的最大次数。

# 第一想法

反复扫描数组，只要全部为偶数就整体除以 2。

# 正确思路

答案等于每个数中因子 2 的指数的最小值；直接模拟也足够通过。

# 没想到的关键点

整体操作次数由最早变成奇数的元素决定。

# 错误原因

最初多做了一轮除法后才检查奇偶性。

# 做题感想

可以用这道题联系因子分解和二进制末尾零。

# 实现注意事项

每轮必须先确认所有数都是偶数。
