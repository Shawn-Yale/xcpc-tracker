---
id: codeforces-71-a
title: Way Too Long Words
platform: Codeforces
contest: "Codeforces Beta Round 65 (Div. 2)"
problem: A
url: "https://codeforces.com/problemset/problem/71/A"
rating: 800
solvedAt: "2026-07-03"
durationMinutes: 14
status: B
categories:
  - 字符串
tags:
  - 字符串模拟
  - 边界处理
reviews: []
---

# 题意抽象

将长度超过 10 的单词压缩为首字符、内部字符数量和尾字符。

# 第一想法

直接按长度分类输出。

# 正确思路

长度不超过 10 时保持原样，否则拼接三个部分。

# 没想到的关键点

无。

# 错误原因

第一次实现时把长度等于 10 也进行了缩写。

# 做题感想

题目简单，但条件中的“严格超过”不能忽略。

# 实现注意事项

内部字符数量为 `length - 2`。
