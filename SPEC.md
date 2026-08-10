# XCPC Tracker — Product Specification

> Version: 0.1\
> Status: Draft / MVP Specification\
> Product Type: Local-first Personal XCPC Training Management System\
> Primary User: Single user\
> Primary Platform: Desktop Web\
> Data Storage: Markdown + Git\
> Version Control / Backup: GitHub

---

# 1. 项目概述

## 1.1 项目名称

**XCPC Tracker**

XCPC Tracker 是一个面向算法竞赛训练的个人做题管理系统，用于长期记录、整理、复习和分析 XCPC / ICPC / Codeforces / AtCoder / 牛客等平台上的算法题训练情况。

本项目不是单纯的“AC 题目收藏夹”。

其核心目标是回答以下问题：

1. 我做过哪些题？
2. 每道题属于哪些知识类别？
3. 我是否真正掌握了这道题？
4. 哪些题目需要重新做？
5. 哪些知识点是我的薄弱项？
6. 我的 C / D 类题是否经过重做逐渐转化为了 A / B？
7. 一段时间后，我是否真正提高了对应知识点的独立解题能力？

因此系统的核心模型为：

**做题记录 + 知识分类 + 掌握度评估 + 间隔复习 + 训练统计**

---

# 2. 产品目标

## 2.1 核心目标

XCPC Tracker 应帮助用户建立长期、可靠、可回顾的算法训练档案。

系统应重点支持：

- 记录题目信息；
- 记录第一次做题情况；
- 对题目进行知识分类；
- 使用 A/B/C/D 评价掌握程度；
- 安排未来重做；
- 自动显示今天和已经逾期的重做任务；
- 保留完整重做历史；
- 分析不同知识类别的掌握情况；
- 分析 C/D 题向 A/B 题的转化情况；
- 使用 Git 保存所有训练数据的历史版本。

---

# 3. 设计原则

## 3.1 Local-first

第一版本必须采用 **Local-first** 设计。

主要使用场景：

```text
本地浏览器
    ↓
本地 Next.js 应用
    ↓
读取 / 修改 Markdown
    ↓
Git
    ↓
GitHub
```

用户应能够在没有远程数据库的情况下完整使用核心功能。

---

## 3.2 数据优先于网站

网站只是数据的查看、编辑和分析工具。

真正需要长期保存的是：

```text
data/problems/*.md
```

即使未来：

- 更换前端框架；
- Next.js 项目无法运行；
- 网站被重写；
- 用户改用 Obsidian；

做题数据仍然必须可以被普通 Markdown 编辑器直接读取。

---

## 3.3 Git-friendly

所有长期训练数据必须适合 Git 版本控制。

要求：

- 使用文本格式；
- 避免无意义的大规模格式变化；
- 一个题目原则上对应一个 Markdown 文件；
- 文件名稳定；
- 不因为修改状态而重新创建题目；
- Review History 不允许静默删除。

---

## 3.4 简单优先

第一版本不得因为未来可能存在的需求过度设计。

优先级：

```text
可靠性
>
数据可读性
>
可维护性
>
功能完整性
>
视觉效果
>
复杂架构
```

---

# 4. MVP 技术方案

第一版本推荐：

- Next.js
- TypeScript
- Tailwind CSS
- Markdown
- YAML Front Matter
- Git
- GitHub

可以使用适当的 Markdown Parser / Front Matter Parser。

第一版本不使用：

- MySQL
- PostgreSQL
- MongoDB
- Supabase
- Firebase
- Prisma
- 用户认证系统
- OAuth
- 云端数据库

---

# 5. 用户模型

MVP 为：

**Single User**

即系统只服务于仓库所有者本人。

暂不考虑：

- 注册；
- 登录；
- 多用户；
- 权限系统；
- 好友；
- 评论；
- 社交功能。

---

# 6. 题目核心数据模型

每一道题目对应一个独立 Markdown 文件。

例如：

```text
data/problems/codeforces-1996-g.md
```

---

# 7. Problem Schema

每道题至少需要支持以下数据。

## 7.1 唯一标识

```yaml
id:
```

要求：

- 全局唯一；
- 创建后原则上不得修改；
- 用于 URL、关联和内部索引。

推荐格式：

```text
codeforces-1996-g
atcoder-abc381-f
nowcoder-2026-summer-4-c
```

---

# 8. 基本题目信息

```yaml
title:
platform:
contest:
problem:
url:
rating:
```

说明：

### title

题目名称。

### platform

例如：

```text
Codeforces
AtCoder
NowCoder
Luogu
ICPC
CCPC
Other
```

### contest

比赛名称或编号。

例如：

```text
Codeforces Round 1996
ABC381
2026 牛客暑期多校 4
```

### problem

题号。

例如：

```text
A
F
G2
C
```

### url

原题地址。

### rating

题目难度。

优先填写平台 Rating。

如果不存在官方 Rating，可以允许用户填写个人估计值。

允许为空。

---

# 9. 做题时间信息

至少包括：

```yaml
solvedAt:
durationMinutes:
```

### solvedAt

第一次正式训练该题的日期。

格式：

```text
YYYY-MM-DD
```

### durationMinutes

实际独立思考 / 比赛做题耗时。

允许为空。

---

# 10. 掌握状态系统

每道题必须存在：

```yaml
status:
```

仅允许：

```text
A
B
C
D
```

---

# 11. A/B/C/D 定义

## A

在规定训练时间内完全独立完成。

要求：

- 没有查看题解；
- 没有获得关键提示；
- 能独立完成核心建模；
- 能独立推导算法；
- 能独立实现并通过。

解释：

**真正掌握。**

---

## B

以下情况之一：

- 超出预定时间，但最终完全独立完成；
- 只查看了极小、非关键提示后完成；
- 核心算法、建模和实现仍主要由自己完成。

解释：

**基本掌握。**

---

## C

阅读题解或关键提示后：

- 能理解正确思路；
- 能重新推导主要过程；
- 可以关闭题解后独立完成代码；
- 但第一次没有独立解决。

解释：

**理解，但尚未真正掌握。**

必须进入后续重做体系。

---

## D

阅读题解后仍然存在明显困难，例如：

- 无法重新推导；
- 无法解释核心性质；
- 无法独立实现；
- 存在前置知识缺口；
- 对题目抽象方式仍然无法理解。

解释：

**明显未掌握。**

D 类题通常意味着：

- 前置知识不足；
- 模型识别能力不足；
- 某类思维方式存在缺口。

---

# 12. Mastered 定义

系统不得持久化：

```yaml
mastered: true
```

之类的字段。

Mastered 必须根据 status 动态计算。

规则：

```text
A → mastered
B → mastered
C → not mastered
D → not mastered
```

即：

```text
mastered = status === A || status === B
```

只有 A、B 类题算真正掌握。

---

# 13. 知识分类系统

每道题允许属于 **多个知识类别**。

字段：

```yaml
categories:
```

例如：

```yaml
categories:
  - 动态规划
  - 数据结构
```

---

# 14. 一级知识分类

MVP 默认提供以下一级分类：

1. 动态规划
2. 图论
3. 数据结构
4. 数学与数论
5. 贪心、构造与不变量
6. 字符串
7. 位运算与状态压缩
8. 计算几何

系统设计必须允许未来新增一级分类。

不得将一级分类硬编码到大量业务组件中。

应集中维护。

例如：

```text
config/categories.ts
```

---

# 15. Tags 系统

除 categories 外，每道题支持任意数量的细粒度 tags。

例如：

```yaml
tags:
  - 状压 DP
  - SOS DP
  - 子集枚举
```

或者：

```yaml
tags:
  - 网络流
  - 最小割
  - 二分图
```

Tags 用于描述更加具体的知识点。

原则：

```text
categories = 大类

tags = 具体算法 / 思维 / 技巧
```

---

# 16. 复盘内容

Markdown 正文主要用于记录学习内容。

推荐统一采用以下结构：

```markdown
# 题意抽象

# 第一想法

# 正确思路

# 没想到的关键点

# 错误原因

# 做题感想

# 实现注意事项
```

这些 section 可以为空，但 Markdown Parser 不应依赖每个标题一定存在。

---

# 17. Review System

重做系统是整个 XCPC Tracker 的核心功能之一。

每道题可以设置：

```yaml
nextReviewDate:
reviewIntervalDays:
```

---

# 18. nextReviewDate

表示：

**当前计划中的下一次重做日期。**

格式：

```text
YYYY-MM-DD
```

允许为空。

为空表示：

当前没有安排重做。

---

# 19. Review Due 判断

如果：

```text
nextReviewDate <= today
```

且当前这个 Review 尚未完成：

则该题属于：

```text
Due
```

---

# 20. Today Review

如果：

```text
nextReviewDate == today
```

则显示为：

```text
Today
```

---

# 21. Overdue

如果：

```text
nextReviewDate < today
```

则：

```text
Overdue
```

系统应计算：

```text
overdueDays
```

例如：

计划日期：

```text
2026-08-10
```

今天：

```text
2026-08-13
```

显示：

```text
逾期 3 天
```

---

# 22. 严禁自动顺延 nextReviewDate

如果用户当天没有完成重做：

不得将：

```text
2026-08-10
```

自动修改为：

```text
2026-08-11
```

更不得每天不断修改日期。

正确行为：

```text
nextReviewDate 永远保留原定日期
```

直到 Review 真正完成。

然后根据下一次间隔重新计算。

这样可以：

- 知道原本应该什么时候复习；
- 计算逾期天数；
- 分析用户是否长期拖延某类题目。

---

# 23. Review 完成流程

完成一次 Review 时，用户至少填写：

```text
新的 A/B/C/D 状态
本次 Review 日期
本次复盘感想
是否安排下一次 Review
下一次间隔天数
```

完成后：

1. 当前 Review 被视为完成；
2. 新状态成为 Problem 的当前 status；
3. 创建 Review History；
4. 根据用户输入决定新的 nextReviewDate。

---

# 24. Review History

任何一次重做都不得覆盖历史。

建议：

```yaml
reviews:
  - date: 2026-08-14
    fromStatus: C
    toStatus: B
    durationMinutes: 65
    note: "这次已经能够独立想到状态设计。"
    nextIntervalDays: 14
```

后续：

```yaml
  - date: 2026-08-28
    fromStatus: B
    toStatus: A
    durationMinutes: 35
    note: "已经能够快速独立完成。"
    nextIntervalDays: 30
```

---

# 25. Review History 不可变性

Review History 原则上属于学习历史。

系统不得：

- 创建新 Review 时删除旧 Review；
- 更新 status 时同步修改旧记录；
- 修改下一次日期时覆盖旧 Review 内容。

如果以后支持编辑旧 Review，也必须属于用户显式操作。

---

# 26. Review 后状态变化

系统允许任何状态转换，例如：

```text
D → C
D → B
D → A

C → C
C → B
C → A

B → B
B → A
B → C

A → A
A → B
A → C
```

不得假设 status 只能单调变好。

因为长时间没有训练后可能退化。

---

# 27. Problem Markdown 示例

```yaml
---
id: codeforces-1996-g
title: "Example Problem"
platform: Codeforces
contest: "Codeforces Round 1996"
problem: G
url: "https://..."
rating: 2100

solvedAt: 2026-08-10
durationMinutes: 120

status: C

categories:
  - 图论
  - 位运算与状态压缩

tags:
  - XOR
  - 线性基

nextReviewDate: 2026-08-14
reviewIntervalDays: 4

reviews:
  - date: 2026-08-14
    fromStatus: C
    toStatus: B
    durationMinutes: 70
    note: "第二次已经能够独立推导核心性质。"
    nextIntervalDays: 14
---

# 题意抽象

...

# 第一想法

...

# 正确思路

...

# 没想到的关键点

...

# 错误原因

...

# 做题感想

...

# 实现注意事项

...
```

最终具体 Schema 可以在实现阶段稍作调整，但不得违反本 Specification 中的业务语义。

---

# 28. 页面结构

MVP 至少包含：

```text
Dashboard
Problems
Knowledge
Status
Review
Statistics
```

以及：

```text
Problem Detail
Problem Create / Edit
```

---

# 29. Dashboard

Dashboard 是用户每天打开 XCPC Tracker 后的主要入口。

首要目标不是展示装饰性统计，而是回答：

> 我今天最应该做什么？

---

# 30. Dashboard 第一优先级内容

页面顶部应显示：

### Today Reviews

今天到期的题。

### Overdue Reviews

已经逾期但仍未完成的题。

每条至少显示：

- 题目；
- Rating；
- 当前状态；
- Knowledge；
- 原计划 Review 日期；
- 逾期天数。

---

# 31. Dashboard 训练摘要

至少显示：

```text
总题目数
A 数量
B 数量
C 数量
D 数量
Mastered 数量
Mastery Rate
```

其中：

```text
Mastered = A + B
```

掌握率：

```text
(A + B) / Total
```

Total 为 0 时不得除零。

---

# 32. Dashboard 最近训练

显示最近完成或最近修改的若干题目。

例如：

```text
Recent Solved
```

至少显示：

- 题目；
- 日期；
- Rating；
- 当前状态；
- 分类。

---

# 33. Dashboard Backlog

可以展示：

```text
C Backlog
D Backlog
```

帮助用户快速发现尚未掌握的题。

---

# 34. Problems 页面

Problems 页面用于浏览全部题目。

默认使用适合桌面端的信息密度较高的列表或 Table。

至少显示：

- Problem；
- Platform；
- Rating；
- Solved Date；
- Status；
- Categories；
- Tags；
- Next Review。

---

# 35. Problems 搜索

支持按照以下文本搜索：

- title；
- contest；
- problem；
- tags。

搜索应支持部分匹配。

---

# 36. Problems Filters

至少支持：

### Status

```text
A
B
C
D
```

### Category

八大一级分类。

### Platform

例如：

```text
Codeforces
AtCoder
NowCoder
...
```

### Review

例如：

```text
Due
Overdue
Scheduled
No Review
```

---

# 37. Problems Sorting

至少支持：

```text
Solved Date ↑↓
Rating ↑↓
Next Review Date ↑↓
```

未来可以增加：

```text
最近修改
Review 次数
```

---

# 38. Knowledge 页面

Knowledge 页面按照算法知识体系浏览题目。

首页显示所有一级分类。

例如：

```text
动态规划
图论
数据结构
数学与数论
贪心、构造与不变量
字符串
位运算与状态压缩
计算几何
```

---

# 39. Knowledge Category 页面

点击某一个分类后显示：

```text
题目总数
A 数量
B 数量
C 数量
D 数量
Mastered
Mastery Rate
```

以及该分类下全部题目。

---

# 40. Tags

Knowledge 页面应能够进一步查看 Tags。

例如：

```text
动态规划

状压 DP
树形 DP
数位 DP
概率 DP
区间 DP
DP 优化
...
```

Tag 不需要在 MVP 中形成严格树结构。

可以先作为扁平标签存在。

---

# 41. Status 页面

Status 页面用于直接按照：

```text
A
B
C
D
```

浏览题目。

---

# 42. A 页面

主要用于查看已经能够高质量独立完成的题目。

---

# 43. B 页面

表示已经基本掌握，但可能：

- 做题速度偏慢；
- 思路不够自然；
- 曾需要很轻提示。

---

# 44. C 页面

C 页面应该被视为：

**必须进一步训练的问题池。**

应该明显显示：

- 是否安排 Review；
- 下一次 Review；
- 是否逾期。

如果 C 类题没有 nextReviewDate，可以给予明显提示。

但 MVP 不强制自动创建 Review。

---

# 45. D 页面

D 页面被视为：

**知识缺口池。**

D 页面需要重点展示：

- Category；
- Tags；
- 做题感想；
- 错误原因；
- 下一次 Review。

未来可以增加：

```text
Prerequisite
```

前置知识系统，但不属于 MVP。

---

# 46. Review 页面

Review 页面是训练任务管理中心。

至少分为：

```text
Overdue
Today
Upcoming
```

---

# 47. Overdue

条件：

```text
nextReviewDate < today
```

排序优先：

```text
最早逾期
```

或：

```text
逾期天数最大
```

---

# 48. Today

条件：

```text
nextReviewDate == today
```

---

# 49. Upcoming

显示未来已经安排 Review 的题。

至少显示：

```text
未来 7 天
```

可以后续支持更长时间范围。

---

# 50. Review 操作

用户点击：

```text
Complete Review
```

打开 Review 表单。

至少包括：

```text
New Status
Duration
Review Note
Next Review
Next Interval Days
```

---

# 51. Problem Detail

题目详情页展示完整题目数据。

建议布局：

```text
基本信息
训练状态
Knowledge
Review 信息
Markdown 复盘正文
Review History
```

---

# 52. Problem Edit

MVP 必须允许本地编辑题目。

至少支持修改：

- title；
- URL；
- rating；
- solvedAt；
- duration；
- status；
- categories；
- tags；
- Markdown 正文；
- nextReviewDate；
- reviewIntervalDays。

---

# 53. Problem Create

MVP 应支持新增题目。

创建时至少填写：

Required：

```text
Title
Platform
Solved Date
Status
```

其余大部分字段可以 optional。

但系统应尽量鼓励填写：

```text
URL
Rating
Categories
Tags
Review
```

---

# 54. Statistics 页面

Statistics 页面目标：

> 分析训练质量，而不仅仅统计做题数量。

---

# 55. Status Distribution

至少统计：

```text
A
B
C
D
```

数量与比例。

---

# 56. Mastery Rate

整体 Mastery Rate：

```text
(A + B) / Total
```

---

# 57. Knowledge Mastery

每个 Category 统计：

```text
Total
A
B
C
D
Mastered
Mastery Rate
```

---

# 58. Rating Distribution

如果存在 rating，至少支持按区间统计，例如：

```text
< 1600

1600 - 1799

1800 - 1999

2000 - 2199

2200 - 2399

2400+
```

Rating 为空的题不进入 Rating 分布。

---

# 59. Training Volume

至少统计：

```text
Last 7 Days
Last 30 Days
This Year
```

的新增题目数量。

未来可以提供：

```text
Daily / Weekly Heatmap
```

但不属于第一阶段必须功能。

---

# 60. Review Conversion

必须支持从 Review History 推导状态转换。

例如：

```text
C → A
C → B
C → C
C → D
```

特别关注：

```text
C → A/B
D → A/B
```

---

# 61. C Conversion Rate

定义可参考：

```text
第一次进入 C 状态的题目中，
后来至少一次达到 A/B 的比例。
```

MVP 可以先实现基础版本。

但统计逻辑必须从历史数据计算，不允许单独维护一个 conversion 字段。

---

# 62. D Knowledge Gaps

D 状态题应该可以按照：

```text
Category
Tag
```

聚合。

目的是发现例如：

```text
构造              8 道 D
组合数学           7 道 D
概率 DP            5 道 D
```

这样的知识缺口。

---

# 63. Failure Analysis

建议 Schema 未来支持：

```yaml
failureReasons:
```

例如：

```text
不会算法
没有发现性质
不会建模
复杂度分析错误
实现错误
读题错误
前置知识不足
其他
```

该功能推荐加入后续版本。

MVP 暂时允许通过：

```text
# 错误原因
```

自由文本记录。

---

# 64. 日期处理

所有用户可见训练日期统一使用：

```text
YYYY-MM-DD
```

MVP 主要基于本地日期，而不是 UTC 日期进行 Review 判断。

Review 的业务含义是：

```text
用户当地的“今天”
```

而不是服务器 UTC 日界线。

---

# 65. 数据校验

系统读取 Problem 时必须进行基础 validation。

例如：

status 必须属于：

```text
A
B
C
D
```

categories 必须是数组。

日期必须符合预期格式。

reviews 必须是数组。

如果单个 Markdown 数据损坏：

系统不应导致整个网站崩溃。

应该：

- 显示错误；
- 标记文件；
- 尽可能继续加载其他题目。

---

# 66. Empty State

所有主要页面都必须设计 Empty State。

例如：

```text
暂时没有题目。
```

```text
今天没有需要重做的题目。
```

```text
这个知识类别暂无题目。
```

不得因为数组为空导致组件错误。

---

# 67. 响应式设计

主要目标设备：

```text
Desktop
Laptop
```

同时保证：

```text
Tablet
Mobile
```

可以正常浏览核心内容。

优先级：

```text
Desktop > Mobile
```

因为这是个人训练管理工具，不必采用 mobile-first 产品策略。

---

# 68. UI 风格

总体要求：

- 简洁；
- 高信息密度；
- 减少无意义动画；
- 不采用过度卡片化；
- 适合长期每天使用；
- Status 需要拥有明显但不过度刺眼的视觉区分；
- Overdue 必须容易识别；
- Markdown 阅读体验良好。

---

# 69. 性能要求

目标数据量至少：

```text
5000 Problems
```

情况下仍然可以正常浏览。

MVP 不要求针对几十万条记录优化。

但不得为每次简单筛选重复做极其昂贵的文件 IO。

---

# 70. 数据写入安全

修改 Markdown 时应尽量避免：

- 删除未知字段；
- 删除正文；
- 删除 review history；
- 修改 ID；
- 自动重排造成大量无意义 Git diff。

特别是 Review 操作必须确保：

```text
append history
```

而不是覆盖。

---

# 71. Git 工作流

数据写入本地后：

由用户使用 Git 进行版本管理。

例如：

```bash
git add .
git commit -m "add CF1996G training record"
git push
```

MVP 不要求网站自动执行 Git commit。

---

# 72. GitHub

GitHub 在 V1 中承担：

```text
Source Control
Backup
History
```

如果仓库为 private：

数据不公开。

---

# 73. Online Deployment

V1 可以支持后续部署一个：

```text
Read-only
```

版本。

线上版本可以：

- 查看题目；
- 查看分类；
- 查看状态；
- 查看统计。

但是不得在 V1 中实现：

```text
线上编辑 Markdown
GitHub Token 写入
自动 Commit
GitHub OAuth
```

---

# 74. 不属于 MVP 的功能

以下功能明确排除：

- 用户注册；
- 用户登录；
- 多用户；
- 好友；
- 评论；
- 云数据库；
- Supabase；
- Firebase；
- MySQL；
- PostgreSQL；
- 自动 GitHub commit；
- 在线修改 GitHub；
- 手机 App；
- PWA；
- Codeforces API 自动同步；
- AtCoder 自动同步；
- 牛客爬虫；
- 洛谷爬虫；
- AI 自动生成题解；
- AI 自动判断 Status；
- 社交功能；
- 推荐算法；
- Docker；
- 微服务；
- 国际化；
- 多语言 UI。

这些功能只有在核心训练系统稳定后才考虑。

---

# 75. 推荐目录结构

```text
xcpc-tracker/
│
├── app/
│   ├── page.tsx
│   │
│   ├── problems/
│   │   ├── page.tsx
│   │   └── [id]/
│   │
│   ├── knowledge/
│   ├── status/
│   ├── review/
│   └── statistics/
│
├── components/
│   ├── layout/
│   ├── problems/
│   ├── review/
│   ├── statistics/
│   └── ui/
│
├── lib/
│   ├── problems/
│   ├── review/
│   ├── statistics/
│   └── date/
│
├── data/
│   └── problems/
│
├── config/
│   ├── categories.ts
│   ├── platforms.ts
│   └── status.ts
│
├── tests/
│
├── AGENTS.md
├── SPECIFICATION.md
├── PLAN.md
├── README.md
├── package.json
└── .gitignore
```

具体目录可以由 Codex 根据 Next.js 当前最佳实践微调。

但必须保持：

```text
UI
业务逻辑
配置
数据
```

之间具有清晰边界。

---

# 76. Business Logic

业务逻辑不得全部写在 React Component 内。

例如以下逻辑应放置在独立函数中：

```text
isMastered()
isReviewDue()
isOverdue()
getOverdueDays()
getMasteryRate()
getCategoryStats()
getStatusDistribution()
getReviewConversions()
```

原因：

- 方便测试；
- 方便未来迁移；
- 避免 UI 与算法逻辑耦合。

---

# 77. 测试要求

以下功能必须存在自动化单元测试。

## Status

```text
A → mastered
B → mastered
C → not mastered
D → not mastered
```

---

## Review Due

测试：

```text
nextReviewDate < today
nextReviewDate == today
nextReviewDate > today
nextReviewDate == null
```

---

## Overdue Days

测试日期边界。

---

## Review Completion

测试：

- Review history append；
- fromStatus 正确；
- toStatus 正确；
- nextReviewDate 正确更新；
- 原历史没有被删除。

---

## Statistics

测试：

- Total；
- A/B/C/D；
- Mastery Rate；
- 空数据；
- Category statistics。

---

# 78. 开发完成标准

Codex 每完成一个 Feature 后至少：

1. Run lint
2. Run TypeScript type checking
3. Run relevant tests
4. Review git diff
5. 确认没有无关文件变更
6. 汇报修改文件
7. 汇报测试结果

---

# 79. MVP Milestone 1 — Foundation

目标：

建立可以正常运行的项目骨架。

包括：

- Next.js；
- TypeScript；
- Tailwind；
- 基础 Layout；
- Navigation；
- lint；
- typecheck；
- tests framework。

不实现复杂业务。

---

# 80. MVP Milestone 2 — Data Layer

实现：

- Problem Schema；
- Markdown Parser；
- Front Matter；
- TypeScript Types；
- Validation；
- 示例题。

完成后系统应能从：

```text
data/problems/
```

读取所有题目。

---

# 81. MVP Milestone 3 — Problem Library

实现：

- Problems；
- Problem Detail；
- Search；
- Filters；
- Sorting；
- Status；
- Categories；
- Tags。

---

# 82. MVP Milestone 4 — Knowledge & Status

实现：

- Knowledge 页面；
- Category 页面；
- Status 页面；
- Mastery statistics。

---

# 83. MVP Milestone 5 — Review

实现：

- nextReviewDate；
- Today；
- Overdue；
- Upcoming；
- Review Completion；
- Review History；
- tests。

该 Milestone 属于 MVP 的关键里程碑。

---

# 84. MVP Milestone 6 — Create / Edit

实现本地：

- Create Problem；
- Edit Problem；
- Edit Markdown；
- Schedule Review。

确保不会破坏数据。

---

# 85. MVP Milestone 7 — Dashboard

实现：

- Today Review；
- Overdue；
- Recent Problems；
- A/B/C/D；
- Mastery Rate；
- C Backlog；
- D Backlog。

---

# 86. MVP Milestone 8 — Statistics

实现：

- Status Distribution；
- Knowledge Mastery；
- Rating Distribution；
- Training Volume；
- Review Conversion。

---

# 87. MVP Milestone 9 — UX & Browser Testing

使用浏览器测试工具检查：

```text
1440px
1024px
768px
390px
```

重点检查：

- Navigation；
- Problems Table；
- Filters；
- Forms；
- Review；
- Problem Detail；
- Markdown rendering。

---

# 88. MVP 验收场景 1

用户创建：

```text
Problem X
Status = C
Solved = 2026-08-10
Review after 4 days
```

系统保存：

```text
nextReviewDate = 2026-08-14
```

8 月 14 日：

显示：

```text
Today
```

---

# 89. MVP 验收场景 2

8 月 14 日没有完成。

8 月 15 日：

Problem X 仍然显示。

系统不得把：

```text
nextReviewDate
```

修改成：

```text
2026-08-15
```

而应显示：

```text
Overdue 1 day
```

---

# 90. MVP 验收场景 3

8 月 17 日完成 Review：

```text
C → B
```

并设置：

```text
Next Review = 14 days
```

系统：

1. 保留第一次 C；
2. Review History 新增 C → B；
3. 当前 status = B；
4. nextReviewDate = 2026-08-31。

---

# 91. MVP 验收场景 4

统计页面：

如果存在：

```text
A = 20
B = 30
C = 40
D = 10
```

则：

```text
Total = 100
Mastered = 50
Mastery Rate = 50%
```

---

# 92. MVP 验收场景 5

一道题：

```text
categories:
  - 动态规划
  - 数据结构
```

则必须同时：

- 出现在动态规划页面；
- 出现在数据结构页面。

不得限制一道题只能属于一个 Category。

---

# 93. MVP 验收场景 6

如果：

```text
data/problems/problem-a.md
```

数据损坏：

系统应该：

- 提示 problem-a.md 数据异常；
- 其他正常题目仍然能够加载。

不得整站崩溃。

---

# 94. MVP 成功标准

第一版本成功不以：

```text
功能很多
```

为标准。

成功标准是：

用户可以稳定完成下面的训练闭环：

```text
做题
↓
记录
↓
判断 A/B/C/D
↓
分类
↓
复盘
↓
安排重做
↓
到期提醒
↓
重新做
↓
重新评价
↓
保留历史
↓
分析薄弱点
↓
决定下一阶段训练
```

只要这个闭环足够稳定、使用体验良好，MVP 即视为成功。

---

# 95. 产品长期方向

MVP 稳定之后可以考虑：

## V1.1

- Failure Reasons；
- 更细的 Knowledge Taxonomy；
- Calendar；
- Heatmap；
- Advanced Statistics。

## V1.2

- Codeforces Metadata Import；
- AtCoder Metadata Import；
- Duplicate Detection；
- CSV Import / Export。

## V2

- Read-only Online Deployment；
- GitHub Pages / Other Hosting；
- 响应式优化。

## V3

视实际需求决定是否考虑：

- 在线写入；
- GitHub API；
- Authentication；
- Cloud Sync。

不得提前为了 V3 显著增加 V1 的复杂度。

---

# 96. Codex 开发原则

Codex 在处理本仓库时必须遵守：

1. 在修改代码前先理解本 Specification。
2. 如果实现选择与 Specification 冲突，以 Specification 为准。
3. 不得未经要求引入数据库。
4. 不得未经要求改变 Local-first 架构。
5. 不得静默删除训练历史。
6. 不得把 Mastered 保存为独立真值。
7. Review overdue 不得通过自动修改日期实现。
8. 业务逻辑必须可测试。
9. 优先小型、可审查的 commit / task。
10. 不应一次性重构大量无关代码。

---

# 97. 最核心的五条业务规则

如果开发过程中出现任何歧义，优先保证以下五条规则：

### Rule 1

**只有 A / B 才算真正掌握。**

### Rule 2

**一道题可以属于多个 Knowledge Categories 和多个 Tags。**

### Rule 3

**C 类题代表理解但未掌握，应重点进入重做体系。**

### Rule 4

**D 类题代表明显知识或抽象能力缺口。**

### Rule 5

**Review 到期后如果没有完成，必须持续显示为 overdue，绝不能通过每天修改 nextReviewDate 来伪装“顺延”。**

---

# 98. 产品核心理念

XCPC Tracker 最终不是为了证明：

> 我 AC 了多少题。

而是为了帮助用户回答：

> 哪些知识我已经能够独立运用？

> 哪些题只是“看懂了”，但实际上还不会？

> 哪些思维模式是我反复失败的原因？

> 哪些 C / D 类题经过训练已经变成了 A / B？

> 接下来最值得投入训练时间的方向是什么？

因此，XCPC Tracker 的核心价值不是：

```text
Problem Count
```

而是：

```text
真正掌握程度
+
训练反馈质量
+
重做闭环
+
长期能力变化
```

---

# 99. Definition of Done — MVP

当以下条件全部满足时，XCPC Tracker MVP 可以视为完成：

- [ ] 可以创建一道题；
- [ ] 可以编辑一道题；
- [ ] 数据真实写入 Markdown；
- [ ] 可以读取全部 Markdown；
- [ ] 支持 A/B/C/D；
- [ ] 正确计算 Mastered；
- [ ] 支持多个 Categories；
- [ ] 支持多个 Tags；
- [ ] 支持 Problems 搜索；
- [ ] 支持 Problems Filter；
- [ ] 支持排序；
- [ ] 支持 Knowledge 浏览；
- [ ] 支持 Status 浏览；
- [ ] 支持 nextReviewDate；
- [ ] 支持 Today Review；
- [ ] 支持 Overdue；
- [ ] 逾期不会自动修改计划日期；
- [ ] 可以完成 Review；
- [ ] Review History 被永久保留；
- [ ] Review 后可以重新设置下一次日期；
- [ ] Dashboard 可以查看今日任务；
- [ ] Dashboard 可以查看逾期任务；
- [ ] 可以统计 A/B/C/D；
- [ ] 可以统计 Mastery Rate；
- [ ] 可以统计各 Knowledge Category 掌握率；
- [ ] 可以统计基础 Review Conversion；
- [ ] 数据损坏不会导致整站崩溃；
- [ ] 核心业务逻辑具有自动测试；
- [ ] lint 通过；
- [ ] TypeScript typecheck 通过；
- [ ] automated tests 通过；
- [ ] Desktop UI 可正常使用；
- [ ] Mobile 可以正常浏览核心功能；
- [ ] Git diff 保持清晰；
- [ ] 所有训练数据可以脱离网站直接以 Markdown 阅读。

---

# 100. 最终产品定义

**XCPC Tracker 是一个以 Markdown 为长期数据资产、以 Git/GitHub 为版本管理基础、以 A/B/C/D 掌握模型和间隔重做为核心业务逻辑的 Local-first 个人算法竞赛训练管理系统。**

网站负责：

```text
记录
组织
筛选
提醒
复盘
统计
```

Markdown 负责：

```text
长期数据
```

Git 负责：

```text
历史
```

GitHub 负责：

```text
远程备份
```

而整个系统最终服务于唯一一个目标：

**帮助用户把“做过题”逐渐转化为“真正掌握”。**
