---
id: atcoder-abc168-d
title: ".. (Double Dots)"
platform: AtCoder
contest: "AtCoder Beginner Contest 168"
problem: D
url: "https://atcoder.jp/contests/abc168/tasks/abc168_d"
solvedAt: "2026-08-08"
durationMinutes: 95
status: D
categories:
  - 图论
tags:
  - BFS
  - 最短路树
  - 前驱记录
nextReviewDate: "2026-08-11"
reviewIntervalDays: 3
reviews: []
---

# 题意抽象

为无权连通图中的每个节点记录一个前驱，使其能够沿最短路径回到节点 1。

# 第一想法

尝试为每个节点单独寻找一条到 1 的路径，复杂度过高。

# 正确思路

从节点 1 做一次 BFS，首次访问节点时记录来源节点，即得到一棵最短路树。

# 没想到的关键点

一次 BFS 的访问树已经同时给出了所有节点的最短路径前驱。

# 错误原因

对 BFS 树与最短路性质的关系理解不牢，无法独立完成证明和实现。

# 做题感想

需要回到无权图 BFS、层次结构和前驱恢复的基础知识。

# 实现注意事项

节点入队时立即标记访问并写入前驱，避免重复入队。
