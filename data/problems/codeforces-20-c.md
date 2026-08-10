---
id: codeforces-20-c
title: Dijkstra?
platform: Codeforces
contest: "Codeforces Alpha Round 20"
problem: C
url: "https://codeforces.com/problemset/problem/20/C"
rating: 1900
solvedAt: "2026-07-11"
durationMinutes: 110
status: B
categories:
  - 图论
  - 数据结构
tags:
  - Dijkstra
  - 最短路
  - 路径恢复
  - 优先队列
nextReviewDate: "2026-08-08"
reviewIntervalDays: 14
reviews:
  - date: "2026-07-25"
    fromStatus: C
    toStatus: B
    durationMinutes: 62
    note: "第二次能够独立写出最短路，并使用 predecessor 数组恢复路径。"
    nextIntervalDays: 14
---

# 题意抽象

求无向非负权图中从 1 到 n 的一条最短路径，并输出路径节点。

# 第一想法

使用 Dijkstra 求距离，但最初只关注最短距离值。

# 正确思路

每次松弛成功时记录前驱，算法结束后从 n 反向恢复到 1。

# 没想到的关键点

输出要求是路径本身，因此前驱信息必须在松弛时同步维护。

# 错误原因

第一次没有正确处理终点不可达的情况。

# 做题感想

最短路模板需要同时掌握距离计算与路径恢复。

# 实现注意事项

距离使用 64 位整数；弹出过期的优先队列条目时跳过。
