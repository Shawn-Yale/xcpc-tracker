# XCPC Tracker 开发计划

## 1. 目标与范围

本计划交付 `SPEC.md` 定义的 Local-first、Single User MVP：Next.js 应用直接读取和修改 `data/problems/*.md`，Git/GitHub 仅承担版本管理与备份。MVP 不引入数据库、认证、平台 API 同步、自动 Git 操作或线上写入。

开发必须始终保证以下不变量：

- 只有 `A`、`B` 视为 mastered，且不持久化 `mastered` 字段。
- 一题可拥有多个受控 `KnowledgeId` 和多个独立自由文本 tags；`knowledge: []` 表示尚未分类。
- `nextReviewDate` 到期后保持原值，只有完成 Review 时才更新或清空。
- Review 只能追加历史，不能隐式删除或改写旧记录。
- 单个 Markdown 损坏不得阻断其他题目的读取。
- `id` 与文件名创建后保持稳定，写入时保留正文、未知 Front Matter 字段和既有历史。

## 2. 技术基线与目标结构

采用 Next.js App Router、TypeScript、Tailwind CSS、Zod、`gray-matter`、Markdown 渲染器和 Vitest。页面以 Server Component 读取文件；搜索、筛选、排序等交互使用 Client Component；创建、编辑和完成 Review 通过仅在服务端运行的 Server Action 写文件。

```text
app/                  # 页面、路由、Server Actions
components/           # layout、problem、review、statistics、ui
config/               # production knowledge taxonomy、platforms、status 的集中配置
lib/knowledge/         # taxonomy definition、catalog、routing、selection primitives
lib/problems/         # schema、读取、写入、查询
lib/review/           # 到期判断和完成 Review
lib/statistics/       # 纯统计函数
lib/date/             # 本地 date-only 运算
data/problems/        # 一题一个 Markdown 文件
tests/                # 跨模块与验收测试
```

所有业务规则实现为无 UI 依赖的纯函数；文件系统代码集中在 `lib/problems/` 并标记 `server-only`。预计建立以下根命令：`npm run dev`、`npm run build`、`npm run lint`、`npm run typecheck`、`npm test`。工具链落地后同步更新 `README.md` 与 `AGENTS.md`，不提前把未实现命令描述为可用。

## 3. 分阶段实施

### 阶段 0：需求基线与工程决策

- [ ] 把 Problem、Review、Status、ReviewState 定义整理为 TypeScript 领域模型。
- [ ] 明确 optional/null 字段、日期格式、rating/duration 的数值边界以及空数组语义。
- [ ] 记录关键决定：日期按本地 `YYYY-MM-DD` 计算；初始 Review 可由显式日期或 `solvedAt + interval` 产生；完成 Review 时以 Review 日期加间隔计算下一日期。
- [ ] 建立需求追踪表，将 Definition of Done 和六个验收场景映射到后续测试。

**验收：** 数据语义不存在依赖 UI 临时状态的字段，所有五条核心业务规则均有对应测试项。

### 阶段 1：项目骨架与质量门禁

- [x] 初始化 Next.js、TypeScript、Tailwind、ESLint 和 Vitest，提交锁文件。
- [x] 建立全局样式、桌面优先的 App Shell、主导航和六个页面占位路由。
- [x] 配置路径别名、测试环境和 `typecheck` 脚本。
- [x] 创建 `data/problems/`，加入不会污染正式统计的说明文件或最小样例 fixture。
- [x] 更新 README：安装、开发、检查和数据目录说明。

**验收：** `lint`、`typecheck`、测试和生产构建全部通过；Dashboard、Problems、Knowledge、Status、Review、Statistics 路由可访问。

### 阶段 2：Schema、配置与日期核心

- [x] 在 `config/` 维护唯一 production Knowledge Taxonomy tree、platforms 和 A/B/C/D 展示元数据；flat catalog 从 tree 自动派生。
- [x] 用 Zod 校验 Problem 与 Review；日期使用严格的日历日期校验，而非只匹配正则。
- [x] 实现 `isMastered`、`isReviewDue`、`isTodayReview`、`isOverdue`、`getOverdueDays`、`addCalendarDays`。
- [x] 所有日期函数显式接收 `today`，禁止在纯函数内部隐式读取 UTC 时间，确保测试可重复。
- [x] 覆盖闰年、月末、年末、空日期、过去/今天/未来等边界。

**验收：** A/B/C/D 掌握规则与全部 Review 日期边界测试通过；任何查询函数都不会修改输入对象或日期。

### 阶段 3：Markdown 数据层

- [x] 实现 Front Matter + Markdown 正文解析，并返回 `valid problems` 与逐文件 `load errors`。
- [x] 检查全局重复 `id`、文件名/ID 不一致、非法状态、非法日期和错误数组类型。
- [x] 列表读取使用一次目录扫描完成，并为单次请求复用结果，避免筛选时重复文件 IO。
- [x] 实现稳定序列化：合并已有 Front Matter，保留未知字段、正文和 reviews；只更新用户实际编辑的字段。
- [x] 写入前验证 ID 和目标路径，阻止 `..`/路径穿越；使用同目录临时文件加原子替换，失败时不破坏原文件。
- [x] 提供创建、按 ID 读取、更新的 repository API，并用临时目录做集成测试。
- [x] 使用测试自有 fixtures 覆盖多 Knowledge、空 rating、Review 历史和不同状态；production Problem 目录允许为空。

**验收：** 一个损坏文件产生可定位错误但其他文件正常加载；更新题目不会改变 ID、丢失正文、未知字段或历史；5000 个 fixture 的读取基准处于可交互范围并记录结果。

### 阶段 4：Problems 题库与详情

- [x] 实现高信息密度 Problems 表格，展示题目、平台、rating、日期、状态、Knowledge、tags 和下一 Review。
- [x] 实现 title/contest/problem/tags 的大小写不敏感部分搜索。
- [x] 实现 status、`?knowledge=`、platform、Due/Overdue/Scheduled/No Review 筛选；Knowledge filter 支持父级 rollup 与显式 invalid state。
- [x] 实现 solved date、rating、next review 的升降序排序，并定义空值统一落后。
- [x] 将查询状态放入 URL 参数，刷新或分享 URL 后结果保持一致。
- [x] 实现 `/problems/[id]`：基本信息、状态、知识、Review、渲染后的 Markdown 和完整历史。
- [x] 展示加载错误摘要、无数据和无匹配结果 Empty State。

**验收：** 多筛选组合、排序空值、部分搜索均有测试；一题能同时出现在多个 Knowledge 查询结果，父节点匹配 descendants 且按题去重；Markdown 内容安全渲染。

### 阶段 5：Knowledge 与 Status 浏览

- [x] 实现 Knowledge 总览，展示十个 Domain 及 rollup Total、A/B/C/D、Mastered、Mastery Rate。
- [x] 实现 `/knowledge/[...segments]` 层级节点页、breadcrumb、children、direct/rollup statistics 与 descendant Problems。
- [x] 实现 Status 总览和 A/B/C/D 页面或参数化视图。
- [x] C 页面突出未安排 Review；D 页面突出 Knowledge breadcrumbs、tags、错误原因正文摘要和 Review 状态。
- [x] 统一复用 Problem 列表和统计组件，避免在页面组件重复业务逻辑。

**验收：** Total 为 0 时掌握率安全返回约定值；Knowledge rollup 按 Problem 去重，全局 Total 只计一次。

### 阶段 6：Review 任务与完成闭环

- [x] 实现 Overdue、Today、Upcoming（未来 7 天）分组；Overdue 按原计划日期升序。
- [x] 实现 Complete Review 表单：review date、new status、duration、note、是否继续安排、interval days。
- [x] 实现 `completeReview(problem, input)` 纯函数：记录旧状态、追加历史、更新当前状态，并计算或清空下一日期。
- [x] Server Action 重新读取磁盘数据后再应用 Review，避免基于陈旧表单覆盖新历史；写入前再次校验。
- [x] 对成功、校验失败、写入失败提供明确反馈，成功后刷新相关页面数据。
- [x] 测试任意状态迁移、连续多次 Review、取消后续安排以及旧历史不可变。

**验收：** SPEC 场景 1–3 端到端通过；未完成 Review 时任何读取或页面访问都不会改写 `nextReviewDate`；`fromStatus` 永远取提交前当前状态。

### 阶段 7：创建与编辑

- [x] 实现 Create 表单；必填 title、platform、solvedAt、status，支持其余可选字段及复盘模板。
- [x] 根据 platform/contest/problem 生成 kebab-case ID，并在保存前允许用户确认；冲突时拒绝覆盖。
- [x] 实现 Edit 表单，覆盖规范要求字段和 Markdown 正文；ID 只读。
- [x] Create/Edit 使用 production taxonomy 的层级 Knowledge selector，提交稳定 ID 并阻止 duplicate 与 ancestor/descendant 冲突；tags 支持去重、去空白的自由输入。
- [x] 直接编辑 scheduling 字段不得生成虚假 Review History；完成 Review 必须走专用流程。
- [x] 增加离开未保存表单提示和字段级错误信息。

**验收：** 创建后生成可独立阅读的 Markdown；再次编辑只产生必要 Git diff；非法 URL、日期、数值和重复 ID 无法写入。

### 阶段 8：Dashboard

- [x] 页面首屏优先展示 Today 与 Overdue，字段包含 rating、状态、knowledge、计划日期和逾期天数。
- [x] 展示 Total、A/B/C/D、Mastered、Mastery Rate。
- [x] 展示按 `solvedAt` 排序的 Recent Solved；MVP 不依赖不稳定的文件 mtime 作为长期数据。
- [x] 展示 C/D Backlog，并提供跳转到对应筛选结果的入口。
- [x] 为“无题目”“今日无 Review”“无 backlog”分别提供 Empty State。

**验收：** Dashboard 数据均来自共享查询/统计函数，与 Problems、Review、Statistics 页面结果一致。

### 阶段 9：Statistics

- [x] 实现整体 status 数量/比例与 Mastery Rate。
- [x] 实现每个 Knowledge node 的 direct / rollup Total、A/B/C/D、Mastered、Mastery Rate，并按 Problem 去重 ancestor rollup。
- [x] 实现 rating 区间分布，排除空 rating。
- [x] 实现最近 7 天、30 天、当年新增题量，日期边界按本地日历计算。
- [x] 从 reviews 推导状态转换矩阵、C→A/B 和 D→A/B；不得新增持久化 conversion 字段。
- [x] 实现当前 D 题按 direct Knowledge/tag 的知识缺口聚合；Knowledge Gap 不向 ancestors rollup。
- [x] 对统计定义添加界面说明，避免将“题目数”和“Review 次数”混淆。

**验收：** SPEC 场景 4 的结果为 Total 100、Mastered 50、Mastery Rate 50%；空数据、缺失 rating、多 Knowledge direct/rollup 与多次状态往返均有单元测试。

### 阶段 10：UX、可访问性与浏览器验收

- [x] 在 1440、1024、768、390 px 检查导航、表格、筛选、表单、Review、详情和 Markdown。
- [x] 小屏将宽表格切换为可横向滚动或紧凑列表，保持核心功能可浏览。
- [x] 检查键盘操作、表单 label、focus 状态、颜色对比以及不只依赖颜色表达 Status。
- [x] 统一 loading、error、empty、success 状态；Overdue 清晰但不过度刺眼。
- [x] 对 5000 题数据复查列表交互；必要时增加分页，但不引入数据库。
- [x] 逐项执行六个验收场景和 MVP Definition of Done。

**验收：** 四种宽度没有阻断操作的问题；核心流程可仅用键盘完成；损坏文件提示不会泄露不必要的绝对路径信息。

### 阶段 11：发布准备与文档收尾

- [ ] 更新 README：架构、安装、命令、Markdown Schema、数据备份、常见校验错误。
- [ ] 更新 AGENTS.md 中已实际采用的目录、命令、测试框架和命名约定。
- [ ] 提供一份可复制的 Problem Markdown 模板和数据迁移/手工修复说明。
- [ ] 执行完整 `lint`、`typecheck`、`test`、`build`，审查 Git diff 与未跟踪文件。
- [ ] 确认无密钥、token、用户私有临时数据或构建产物被提交。
- [ ] 创建 MVP 验收记录，列明已完成项、已知限制和明确延期项。

**验收：** 新环境按 README 可启动；所有质量门禁通过；所有长期训练数据脱离应用仍可直接阅读。

## 4. 测试策略

- **单元测试：** date、status、review、query、statistics 等纯函数，覆盖所有边界和空数据。
- **数据层集成测试：** 在临时目录验证读取、损坏隔离、重复 ID、创建、合并更新、原子写入与历史保留。
- **组件测试：** 重点覆盖筛选器、表单校验、Empty State 和统计展示；不重复测试纯函数细节。
- **端到端测试：** 创建 C 题 → Today → Overdue → 完成 C→B → 检查 Markdown 与统计，以及损坏文件隔离场景。
- **性能测试：** 生成 5000 个临时 fixture，记录初次读取和常用查询耗时，防止后续明显退化。

每完成一个 Feature 都执行相关测试、lint、typecheck、检查 diff，并在交付说明中列出修改文件和验证结果。阶段合并前执行完整测试；阶段 3、6、7 的数据安全测试失败时不得继续交付依赖功能。

## 5. 里程碑与依赖关系

```text
需求基线
  → 工程骨架
  → Schema / 日期
  → Markdown 数据层
  → Problems / Detail
  → Knowledge / Status
  → Review 闭环
  → Create / Edit
  → Dashboard
  → Statistics
  → UX 验收
  → 发布准备
```

页面样式可以在数据层稳定后并行细化，但 Review、创建/编辑和统计不得绕过共享领域函数。优先交付“读取 → 浏览 → Review → 安全写回”的纵向闭环，再补全仪表盘和高级统计，避免先完成大量展示页面却无法验证核心数据资产。

## 6. MVP 完成判定

只有同时满足以下条件才标记 MVP 完成：

- `SPEC.md` 的六个验收场景和 Definition of Done 全部通过或有用户确认的延期记录。
- 核心训练闭环可用，且不会因访问页面、日期变化或失败写入破坏 Markdown。
- 所有核心业务规则有自动化测试，完整 lint、typecheck、test、build 通过。
- 桌面端可高效使用，移动端可浏览和完成核心操作。
- README、AGENTS.md、数据模板与实际实现一致，Git diff 清晰可审查。
