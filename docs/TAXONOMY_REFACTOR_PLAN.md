# Taxonomy Schema Cutover 调查与重构计划

## 1. 本文范围

本文记录对当前知识分类实现的只读调查，并规划一次无兼容层的 Schema Cutover：

```text
categories → knowledge
```

已确认的前提：

- 当前没有正式题目数据；
- `data/problems/*.md` 均为测试/样例数据，可在实施阶段删除；
- 不保留 `categories` 兼容读取；
- 不做数据迁移、迁移脚本或 legacy fallback；
- 本轮不修改业务代码、不修改或删除数据、不实现新 taxonomy。

调查时仓库中不存在用户指定的 `SPECIFICATION.md`。仓库实际规范文件是 `SPEC.md`（`README.md` 和 `PLAN.md` 也引用它），本文已完整阅读 `SPEC.md`，但不能断言它等同于缺失的 `SPECIFICATION.md`。因此，目标 `knowledge` 的最终结构（例如 `string[]`、稳定 ID 数组或层级对象）仍需在实施前由新版规范明确；本文只对当前实现和切换影响作事实性分析。

本次还完整阅读了 `AGENTS.md`、`package.json`、Problem 类型/Schema、Markdown parser/writer、分类配置、Create/Edit、Problems、Knowledge、Statistics、Review、Dashboard、Status 间接消费者、全部 Vitest 测试及 `e2e/core-flows.spec.ts`。

## 2. 当前数据模型与唯一配置源

当前 Problem 类型不是手写 interface。`lib/problems/types.ts` 从 `lib/problems/schema.ts` 导入 Zod 输出类型，因此真实类型源是 `problemFrontmatterSchema`：

```text
config/categories.ts
  categoryValues + Category + categoryMetadata + getCategoryBySlug
                         ↓
lib/problems/schema.ts
  categorySchema + problemFrontmatterSchema.categories
                         ↓
ProblemFrontmatter / ProblemFrontmatterInput
                         ↓
ProblemDocument / ProblemFile / ProblemEditorInput / ProblemUpdate
```

`config/categories.ts` 是运行时代码中唯一集中定义八个一级分类及其 slug/description 的地方。八个当前值是：

1. 动态规划
2. 图论
3. 数据结构
4. 数学与数论
5. 贪心、构造与不变量
6. 字符串
7. 位运算与状态压缩
8. 计算几何

## 3. 从 Markdown 到 UI 的完整 category 数据流

### 3.1 读取链路

```text
data/problems/<id>.md
  YAML Front Matter: categories: string[]
    ↓ readFile
ProblemRepository.readAll() / findById()
    ↓
parseProblemMarkdown()
    ↓ parseDocument()，YAML → Record<string, unknown>
problemFrontmatterSchema.parse()
    ↓ z.array(categorySchema).default([]) + 去重校验
ProblemFrontmatter.categories: Category[]
    ↓
ProblemFile.frontmatter.categories
```

读取细节：

- `categorySchema` 是 `z.enum(categoryValues)`，所以数组成员必须来自集中配置；
- 缺少 `categories` 时会规范化为 `[]`；
- 非数组、未知分类值、重复值会产生逐文件 validation error；
- Repository 隔离单个损坏文件，不阻断其他题目；
- Schema 使用 `.passthrough()`，未知 Front Matter 字段会进入规范化对象并在一般编辑中被保留。

### 3.2 查询与聚合链路

加载后的 `ProblemFile[]` 分成以下消费者：

- Problems：`parseProblemQuery()` 用 `categoryValues` 校验 `?category=`；`queryProblems()` 用 `frontmatter.categories.includes(query.category)` 过滤；`ProblemList` 在桌面表格和移动卡片中显示数组。
- Knowledge 总览：`getCategoryStats()` 遍历全部配置分类，对每一类筛选 `frontmatter.categories.includes(category)`，再计算 Total、A/B/C/D、Mastered、Mastery Rate；页面用 `categoryMetadata` 生成描述和 `/knowledge/<slug>` 链接。
- Knowledge 详情：`getCategoryBySlug()` 将路由 slug 反查为 `Category`，然后复用 Problems 查询器过滤题目，再聚合该范围内的 tags 和掌握统计。
- Statistics：`getCategoryStats()` 生成分类掌握表；`getDKnowledgeGaps()` 对当前 D 题逐分类计数，并通过 `categories.length === 0` 统计未分类题；页面用 metadata slug 生成下钻链接。
- Status D：`app/status/[status]/page.tsx` 间接使用 `KnowledgeGapList`，显示每道 D 题的 categories 和 tags。
- Review：队列本身不按 category 决策，但 `ReviewTaskList` 在任务摘要中显示 categories。
- Dashboard：统计摘要本身只计算全局状态，但 `BacklogList` 和 `RecentSolvedList` 展示 categories；Dashboard 复用的 `ReviewTaskList` 也展示 categories。
- Problem Detail：右侧 Knowledge 区域直接显示 `frontmatter.categories`。

### 3.3 创建与编辑写入链路

```text
config/categories.ts
  ↓ checkbox options
ProblemEditorForm
  name="categories" 的多个 checkbox
  ↓ FormData.getAll("categories")
parseProblemEditorFormData()
  去重 + z.enum(categoryValues) 校验
  ↓ ProblemEditorInput.categories
createProblemAction / updateProblemAction
  ↓ frontmatter.categories / patch.categories
ProblemRepository.create() / update()
  ↓
serializeProblemMarkdown() / updateProblemMarkdown()
  ↓
data/problems/<id>.md
```

写入细节：

- Create 初始值在 `app/problems/new/page.tsx` 中显式设为 `categories: []`；
- Edit 从 `frontmatter.categories` 回填；
- Server Action 在新建完整 Front Matter 和一般编辑 patch 中都显式映射 `categories`；
- `lib/problems/markdown.ts` 的 `editableFields` 是手工维护的白名单，显式包含 `"categories"`；
- 新建通过 Schema 验证后完整序列化；
- 编辑把 patch 合并到原始 YAML，仅更新实际变化的节点，保留未知字段、注释、字段顺序、正文和 Review History；
- Review 完成只改 status、排期和 reviews，不改 categories，但会通过完整 Problem Schema 再验证整份数据。

## 4. 依赖 categories 的文件

下表区分直接字段/符号依赖和通过共享组件或 Schema 产生的间接依赖。文档、测试数据和历史计划也属于完整 cutover 的仓库级影响面。

### 4.1 配置、领域模型和数据层

| 文件 | 依赖 |
| --- | --- |
| `config/categories.ts` | 八类值、`Category` 类型、slug、描述、反查函数的唯一运行时配置源 |
| `lib/problems/schema.ts` | `categorySchema`、`categories` 默认值/数组/枚举/去重校验，以及派生的 Problem 类型 |
| `lib/problems/types.ts` | 经 `ProblemFrontmatter`/`ProblemFrontmatterInput` 间接派生可编辑字段和 patch 类型 |
| `lib/problems/markdown.ts` | 手工可编辑字段白名单包含 `categories`；parser/serializer/update 都经完整 Schema |
| `lib/problems/repository.ts` | 经 parser、serializer、Schema 间接依赖；所有读写和 Review 完成都会验证该字段 |
| `lib/problems/editor.ts` | 编辑器 Schema、FormData 字段名、分类枚举与去重 |
| `lib/problems/query.ts` | `ProblemQuery.category`、URL 参数 `category`、合法值解析和包含关系过滤 |
| `lib/statistics/problem-stats.ts` | `CategoryStats`、`getCategoryStats()` 和逐分类聚合 |
| `lib/statistics/analysis.ts` | Summary 的 `categories`、D gap 分类计数、未分类计数和 `Category` 类型 |
| `lib/review/completion.ts` | 完成 Review 后以完整 Problem Schema 重建并复验，属于结构性间接依赖 |

### 4.2 页面、Actions 和组件

| 文件 | 依赖 |
| --- | --- |
| `app/problems/actions.ts` | Create 和 Edit 两条 Server Action 都显式映射 `categories` |
| `app/problems/new/page.tsx` | 新建表单初始值 `categories: []` |
| `app/problems/[id]/edit/page.tsx` | 从 Front Matter 回填 `categories` |
| `components/problems/problem-editor-form.tsx` | 配置导入、checkbox 名称/值/选中态、字段错误键和 Categories 文案 |
| `app/problems/page.tsx` | 间接组合 category filter、query 和 list |
| `components/problems/problem-filters.tsx` | `?category=` 选择器和全部配置值 |
| `components/problems/problem-list.tsx` | 桌面/移动两套 categories 展示和列标题 |
| `app/problems/[id]/page.tsx` | Problem Detail 的 Knowledge 展示 |
| `app/knowledge/page.tsx` | 分类配置、分类统计、slug 链接、列表 DOM id 和一级分类文案 |
| `app/knowledge/[slug]/page.tsx` | slug 反查、category query、统计、tag 二次过滤及页面命名 |
| `app/knowledge/[slug]/not-found.tsx` | Category 组件名和分类文案 |
| `app/statistics/page.tsx` | 分类统计表、summary.categories、D gap categories、slug 下钻及文案 |
| `components/statistics/category-statistics-table.tsx` | 文件名、组件/类型名、row.category、metadata slug 和表头 |
| `components/problems/knowledge-gap-list.tsx` | Status D 列表中的 categories 展示 |
| `app/status/[status]/page.tsx` | 经 `KnowledgeGapList`、`ProblemList`、`queryProblems` 间接依赖 |
| `components/review/review-task-list.tsx` | Review 和 Dashboard 任务摘要中的 categories 展示 |
| `app/review/page.tsx` | 经 `ReviewTaskList` 间接依赖 |
| `app/page.tsx` | 经 Dashboard 列表和 `ReviewTaskList` 间接依赖 |
| `components/dashboard/backlog-list.tsx` | categories 展示及“未分类”空态 |
| `components/dashboard/recent-solved-list.tsx` | 最多显示前两个 categories |

`app/review/[id]/page.tsx` 和 Review 表单不显示或编辑 category；Review 算法也不以 category 决策。因此它们通常不需要 UI 改名，但 Review 完成路径必须参加回归测试，因为最终会通过新的完整 Problem Schema。

### 4.3 测试

直接含 category 字段、符号或固定分类值的测试：

- `tests/problem-editor.test.ts`
- `tests/problem-markdown.test.ts`
- `tests/problem-query.test.ts`
- `tests/problem-repository.test.ts`
- `tests/problem-repository.performance.test.ts`
- `tests/problem-schema.test.ts`
- `tests/problem-stats.test.ts`
- `tests/review-completion.test.ts`
- `tests/sample-data.test.ts`
- `tests/statistics-analysis.test.ts`

通过 Problem Schema 或测试数据目录间接依赖、即使当前不出现 `category` 字样也必须回归的测试：

- `tests/dashboard-summary.test.ts`
- `tests/review-queue.test.ts`
- `e2e/core-flows.spec.ts`

当前可视为与 taxonomy 独立的测试：

- `tests/date-only.test.ts`
- `tests/markdown-sections.test.ts`
- `tests/navigation.test.ts`（前提是 `/knowledge` 顶级路由保持不变）
- `tests/review-rules.test.ts`

### 4.4 数据、规范和说明文档

- 八个 `data/problems/*.md` 文件都持久化 `categories:`；
- `SPEC.md` 多处定义 `categories`、Category、八个一级分类和相关验收场景；
- `PLAN.md` 多处记录旧字段、旧函数和旧验收口径；
- `README.md` 描述 category mastery；
- `docs/problem-schema.md`；
- `docs/problem-editor.md`；
- `docs/statistics.md`；
- `docs/dashboard.md`；
- `docs/ux-acceptance.md`。

`docs/data-layer.md` 虽未直接写 `categories`，但它描述的完整 Schema 验证、未知字段保留和原位更新保证会直接影响 clean cutover 策略，因此实施后也应复核。

## 5. 所有硬编码一级分类的位置

### 5.1 运行时代码

八个值只在 `config/categories.ts` 的 `categoryValues` 中作为业务枚举硬编码，并在同一文件的 `categoryMetadata` 中再次作为对象键出现；八个 slug 和 description 也在该文件硬编码。未发现其他页面或业务逻辑重新声明一份八类数组，这是当前实现的优点。

### 5.2 测试中的硬编码

以下测试直接写入或断言具体一级分类：

- `tests/problem-editor.test.ts`：图论；
- `tests/problem-markdown.test.ts`：数学与数论；
- `tests/problem-query.test.ts`：动态规划、贪心/构造/不变量、图论、数据结构；
- `tests/problem-repository.test.ts`：图论；
- `tests/problem-schema.test.ts`：图论、位运算与状态压缩；
- `tests/problem-stats.test.ts`：图论、数据结构、动态规划、计算几何；
- `tests/review-completion.test.ts`：图论；
- `tests/statistics-analysis.test.ts`：图论、数据结构。

其中 `tests/problem-editor.test.ts` 还故意把“图论”作为自由 tag 使用；这是 tag 内容，不应被误当作一级分类引用统一替换。

### 5.3 测试/样例数据和文档

- 八个 `data/problems/*.md` 使用了当前分类值；
- `SPEC.md` 重复列出八类、示例值和多分类验收场景；
- `docs/problem-schema.md` 示例含图论、位运算与状态压缩。

未发现名为 `CATEGORIES` 的常量；当前命名是 `categoryValues`。

## 6. categories → knowledge 的功能影响

一次完整语义切换不应只替换 YAML key。以下契约必须同步改变：

1. **持久化契约**：Markdown Front Matter key、Schema 字段、缺省值、重复/非法值错误路径和文档示例。
2. **TypeScript 契约**：`ProblemFrontmatter`、`ProblemFrontmatterInput`、`ProblemEditorInput`、patch 和所有读取属性。
3. **写入安全契约**：`editableFields` 白名单、Create/Edit action 映射、序列化和原位 YAML 更新。
4. **表单协议**：checkbox 的 `name`、`FormData.getAll()`、initial value 和字段错误 key。
5. **查询 URL 契约**：当前是 `/problems?category=<值>`。无向后兼容意味着应明确切换为新的参数名（预计 `knowledge`，但以目标规范为准），旧参数应回落为默认值而不是继续工作。
6. **Knowledge 路由内部契约**：顶级 `/knowledge` 路由可保留，但 `CategoryPageProps`、slug lookup、变量和 metadata 文案需要去 category 化。是否保留现有 slug 取决于新 taxonomy 定义，不属于简单字段改名。
7. **聚合结果契约**：`CategoryStats`、`getCategoryStats()`、`summary.categories`、D gap 的 `categories` 和每项 `category` 都应同步命名，否则内部仍残留旧 schema 语言。
8. **UI 展示**：Problems 列、Problem Detail、Create/Edit、Knowledge、Statistics、Status D、Review 列表、Dashboard Backlog/Recent Solved。
9. **空态与可访问性**：Categories、Category、分类、未分类、DOM id、aria label、组件名和文件名都需按目标术语复核，不能只保证编译通过。
10. **缓存刷新**：Create/Edit/Review actions 当前刷新 `/knowledge`，但没有显式刷新 `/statistics` 和 Dashboard `/`。页面是 `force-dynamic`，普通导航通常会重新读取；重构时仍应把所有 taxonomy 消费页面列入 Server Action 刷新审计，避免客户端导航缓存显示旧聚合。
11. **测试数据策略**：删除 `data/problems` 样例后，读取真实目录的 query/stats/sample-data 测试和依赖固定 ID 的 E2E 会失去前置数据，必须改用测试自有 fixture/临时目录/受控 E2E seed。
12. **文档与验收基线**：现有 `SPEC.md`、`PLAN.md` 和多份 docs 都把 categories 视为产品契约；如不更新，它们会与代码相互矛盾。

## 7. 测试更新建议

### 7.1 必须改写的行为测试

- Schema：验证 `knowledge` 的目标形状、默认/必填语义、合法值、重复值、空输入和失败路径；加入 `categories` 被拒绝的 clean-cutover 测试。
- Markdown：解析/序列化/局部更新必须只使用 `knowledge`；验证不会生成 `categories`；若目标要求严格切断旧字段，应验证含 `categories` 的输入明确失败。
- Editor：FormData key、schema 输出、去重和字段错误全部改为 `knowledge`；覆盖空选择、多个选择、非法值。
- Repository：所有 fixture 改用新字段；保留 create/update/atomic write/unknown field/history 不丢失的断言；增加一次新字段局部更新的最小 diff 测试。
- Query：`ProblemQuery` 与 URL 参数改名，多知识归属过滤继续成立，旧 `category` 参数按无兼容策略失效。
- Statistics：重命名分类统计和 D gap 结果结构，继续覆盖“一题计入多个知识项但 overall 只计一次”、空输入和未分类/未标注口径。
- Config/slug：对新的配置值、metadata 完整性、slug 唯一性和可逆性做测试。
- Review completion：fixture 改用新字段，并断言 Review 完成不会改变 taxonomy 数据。
- Performance：5000 题内联 Markdown fixture 改用新字段。

### 7.2 必须解除对 `data/problems` 的测试耦合

- `tests/problem-query.test.ts` 和 `tests/problem-stats.test.ts` 当前读取仓库的 `data/problems`；应改为内存 fixture 或每测试临时目录。
- `tests/sample-data.test.ts` 的目标是验证“仓库至少有 8 条样例且覆盖多分类等情况”。在正式数据为空的前提下，该测试应删除，或改造成不依赖用户数据的 fixture/schema 示例测试。
- `e2e/core-flows.spec.ts` 固定依赖 `codeforces-455-a`、`codeforces-20-c` 和相应页面内容。应使用隔离的 E2E 数据目录/启动时 seed，且不得把 seed 混入正式 `data/problems`。

### 7.3 需要回归但不一定改代码的测试

- `dashboard-summary.test.ts`：确认新 Schema 默认值不会破坏 Dashboard fixture，并补充 Dashboard taxonomy 展示的浏览器或组件覆盖。
- `review-queue.test.ts`：确认通过新 Schema 构造的 Problem 仍能进入队列。
- `navigation.test.ts`：若 `/knowledge` 保持不变，预期无需改；若路由也调整则必须同步。
- date、Markdown section、review rules 测试应保持不变并全量回归，防止机械重命名波及无关行为。

## 8. 推荐重构顺序

以下顺序用于下一阶段，不在本轮执行：

1. **冻结目标契约**：补齐/确认权威规范文件，明确 `knowledge` 的准确 YAML/TypeScript 形状、合法值来源、空值语义、slug/ID 策略、UI 术语和 URL 参数名。没有这一步，不应开始机械改名。
2. **先隔离测试数据**：把依赖 `data/problems` 的单元测试迁到自有 fixture/临时目录，为 E2E 建立隔离 seed；随后删除八个样例数据。这样空正式数据目录成为可测试的真实状态。
3. **建立新 taxonomy 配置**：一次性替换 `config/categories.ts` 及 `Category`/metadata/slug API；避免同时保留新旧配置源。
4. **切换 Schema 和派生类型**：将 Problem Front Matter 契约切到 `knowledge`，删除 `categorySchema` 和 `categories`；增加旧字段拒绝测试，防止 `.passthrough()` 让 legacy key 静默存活。
5. **切换 Markdown 与 Repository 写入边界**：更新 editable whitelist、serializer/update 行为和 Repository fixture；先保证新 Schema 能安全 round-trip，再改 UI。
6. **切换 Create/Edit 纵向写入链路**：Editor Schema → FormData → Server Actions → 初始/回填 → checkbox/control，验证新建和编辑产生的 Markdown 只含新字段。
7. **切换 Query 和 Problems UI**：更新 query type、URL 参数、过滤器、列表和详情；明确旧 `?category=` 不兼容。
8. **切换 Knowledge 页面与路由内部命名**：配置总览、slug 反查、详情过滤、tag 聚合、not-found、metadata 和可访问性文案。
9. **切换统计契约**：重命名 stats 类型/函数/result keys，更新 Statistics 表格、D gaps 和链接。此步应避免保留 `CategoryStats`、`summary.categories` 等旧语言。
10. **切换间接消费者**：Status D、ReviewTaskList、Dashboard Backlog/Recent Solved，以及 Server Action revalidation 路径。
11. **更新所有测试、规范和说明**：运行全仓旧词扫描，确保业务代码、测试和权威文档不再把 `categories` 当作有效 Schema；历史文档是否保留旧词应由文档策略显式决定。
12. **质量门禁**：依次运行 targeted tests、`npm test`、`npm run typecheck`、`npm run lint`、`npm run build`、隔离 E2E；最后检查 `git diff` 和空 `data/problems` 的页面状态。

## 9. 容易遗漏的 category 依赖与风险

### 9.1 `.passthrough()` 会削弱“无兼容”切换

当前 Problem Schema 保留未知字段。若只新增 `knowledge` 并删除显式 `categories` 定义，旧 `categories` 可能仍作为未知字段被解析、进入对象并在更新时保留。要实现真正 clean cutover，必须在目标 Schema 中明确拒绝 legacy key，或在边界做有测试的精确约束；不能依赖“删除属性定义”自然淘汰它。

### 9.2 Markdown 可编辑字段是第二份手工 Schema

`lib/problems/markdown.ts` 的 `editableFields` 不由 Zod Schema 自动生成。漏改这里会导致表单和类型看似正确，但 Update 拒绝 `knowledge`，或旧 `categories` 仍可被一般编辑路径修改。

### 9.3 `keyof` 派生类型会造成广泛编译影响

`EditableProblemField`、`ProblemFrontmatterPatch` 由 Problem Schema key 派生。Schema 一改，Actions、editor initial values、patch 和 property access 会同时报错；这有助于发现依赖，但 `.passthrough()` 的未知字段行为不受 TypeScript 完全保护。

### 9.4 “category” 同时存在于持久化、查询和聚合输出

除了 `frontmatter.categories`，还有三套独立公共契约：

- URL/query：`ProblemQuery.category` 和 `?category=`；
- 路由配置：`Category`、metadata、slug lookup；
- 统计输出：`CategoryStats.category`、`summary.categories`、`dKnowledgeGaps.categories`。

只改 Front Matter 会留下大量语义和 API 残余。

### 9.5 `/knowledge` 已经使用目标词，但内部仍是 category 模型

路由名看起来已经完成切换，容易漏掉 `CategoryPageProps`、`CategoryPage`、`KnowledgeCategoryNotFound`、DOM id、metadata fallback 和统计组件文件名。这些不一定导致运行错误，却会持续混淆后续 taxonomy 开发。

### 9.6 Status、Review、Dashboard 是间接消费者

它们大多不导入分类配置，因此只搜 `config/categories` import 会漏掉：

- Status D 的 `KnowledgeGapList`；
- Review 页和 Dashboard 共用的 `ReviewTaskList`；
- Dashboard 的 Backlog 和 Recent Solved。

### 9.7 Search 当前不搜索 categories

`matchesSearch()` 只搜索 title、contest、problem 和 tags，不搜索 categories。字段改名本身不应顺手改变此行为；若希望搜索 `knowledge`，那是独立产品决定和测试变化。

### 9.8 删除样例数据会破坏现有验收基础

这不是 migration 风险，而是测试架构风险。query/stats 单测、sample-data 测试和多个 E2E 流程把仓库样例当 fixture。必须在删除数据前完成隔离，否则会把“无正式数据”的正确状态误报为回归。

### 9.9 权威规范文件名不一致

`SPEC.md` 自己推荐目录中写的是 `SPECIFICATION.md`，但仓库实际只有 `SPEC.md`。在 taxonomy 契约落地前应确定唯一权威文件并修复引用，否则新旧分类规范可能分叉。

## 10. 下一阶段的完成判定

只有同时满足以下条件，才能认为 clean cutover 完成：

- 新建、读取、编辑、Review 完成后的 Markdown 只使用 `knowledge`；
- `categories` 不再作为合法输入、类型属性、表单字段、查询参数或统计结果键；
- 不存在兼容分支、迁移脚本或双写；
- `data/problems` 可为空，所有页面空态正常；
- 所有自动化测试使用隔离 fixture，不依赖正式题目目录；
- 多知识归属、空归属、非法值、重复值和旧字段拒绝均有测试；
- Dashboard、Problems、Knowledge、Status D、Review、Statistics 展示一致；
- 全仓扫描的旧词只存在于明确保留的历史记录中，而不出现在当前有效契约；
- lint、typecheck、unit、build 和 E2E 全部通过。
