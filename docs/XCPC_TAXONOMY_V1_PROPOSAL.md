# XCPC Taxonomy V1 Proposal

Status: Frozen — approved as XCPC Production Taxonomy V1 inventory

From this point, KnowledgeId changes are breaking taxonomy changes.

This document proposes the first production XCPC knowledge inventory. It is content design only. It does not authorize a Problem schema cutover, a production taxonomy definition, migration, compatibility behavior, UI changes, or Problem data changes.

The proposal follows `TAXONOMY_V2_CONTRACT.md`: IDs are hierarchical dotted paths, depth is at most three, every node declares `selectable`, and one concept has one canonical location. A Problem may select multiple non-conflicting IDs when it genuinely combines knowledge from multiple branches.

## 1. Design principles

1. A node represents stable, reusable algorithmic knowledge, not a single template, problem story, implementation trick, or common mistake.
2. Domains organize long-lived bodies of XCPC knowledge and are not directly selectable in V1.
3. A Topic is selectable when it is already a useful classification without naming a particular algorithm.
4. A Technique is selectable when it has independent learning value and recurs across Problems.
5. An algorithm appears once. Applications in another field select the canonical algorithm plus the relevant node from that field.
6. Named variants are omitted when they mainly describe implementation details; those remain tags.
7. The hierarchy is chosen conservatively because reparenting changes persisted IDs.

### 1.1 Minimal Sufficient Knowledge Principle

A Problem records only the smallest set of KnowledgeIds required to discover, prove, or understand its core solution. It does not record every implementation dependency, standard container, or algorithm used internally by a higher-level Technique.

- Ordinary Dijkstra does not mechanically add `data-structure.heap` merely because the standard implementation uses a priority queue.
- BFS does not add a queue knowledge node merely because its implementation uses a queue.
- A low-link/Tarjan-style graph algorithm does not mechanically add DFS when DFS is only its traversal mechanism.
- Aho–Corasick does not mechanically add Trie when the Trie is merely the expected internal representation of the automaton.
- A supporting node is added only when it is independently necessary to the Problem's key modeling or learning objective.

This principle takes priority over collecting as many applicable labels as possible. Multi-selection expresses genuinely independent core knowledge, not transitive implementation dependencies.

## 2. Domain summary

| ID | 中文名称 | Selectable | Definition | Why it is a Domain |
| --- | --- | --- | --- | --- |
| `algorithmic-techniques` | 通用算法技巧 | `false` | 不依赖某一种数学或数据模型的通用处理范式，如二分、双指针、前缀和与离线处理。 | 这些技巧横跨数组、图、字符串和几何；放进任一应用领域都会导致重复或频繁 reparent。 |
| `search` | 搜索 | `false` | 对状态空间进行系统遍历、回溯、剪枝或双向探索的方法。 | DFS/BFS/回溯是独立训练体系，不能机械归入图论；许多状态空间并不是显式图。 |
| `data-structure` | 数据结构 | `false` | 为更新、查询、合并、持久化和有序访问提供复杂度保证的数据组织方式。 | 数据结构具有独立不变量、操作语义和复杂度，是大量跨领域解法的基础。 |
| `graph` | 图论 | `false` | 图模型上的连通性、路径、流、匹配和树结构算法。 | 相关算法共享图模型、证明方法与复杂度体系，且规模足以形成稳定 Domain。 |
| `dynamic-programming` | 动态规划 | `false` | 通过状态、转移、边界与计算顺序复用重叠子问题的方法。 | DP 的核心是建模范式；其结构化子类长期稳定并跨越具体题材。 |
| `greedy-constructive` | 贪心、构造与不变量 | `false` | 通过局部决策、显式构造或全程保持性质来获得解的方法。 | 三者经常共享交换、存在性与不变量证明，但不自然从属于数学、DP 或搜索。 |
| `math` | 数学 | `false` | 数论、组合、线性代数、卷积、概率、博弈和递推等竞赛数学知识。 | 这些知识以数学结构和定理为核心，算法实现只是其应用层。 |
| `bitwise` | 位运算与状态表示 | `false` | 利用二进制表示、集合掩码、异或代数和位变换的知识。 | 状态压缩不只服务于 DP，异或与位变换也有独立结构；单独放置可避免跨领域复制。 |
| `string` | 字符串算法 | `false` | 模式匹配、后缀结构、回文、周期和字典序等序列算法。 | 字符串算法拥有稳定的术语、数据模型和专用结构，长期作为独立竞赛领域。 |
| `computational-geometry` | 计算几何 | `false` | 点、线、圆、多边形、凸性与距离问题中的鲁棒几何计算。 | 几何具有独立表示、精度与退化情形，不能仅作为数学的普通子类处理。 |

The old eight-category list is therefore not preserved mechanically. Search and general algorithmic techniques become first-class Domains; bitwise remains independent; tree algorithms remain in graph; probability, game theory, FFT, and NTT receive explicit positions under mathematics.

## 3. Complete proposed tree

Notation: `中文名称 — KnowledgeId — selectable`.

### 3.1 通用算法技巧

```text
通用算法技巧 — algorithmic-techniques — false
├── 模拟 — algorithmic-techniques.simulation — true
├── 前缀和与差分 — algorithmic-techniques.prefix-sum-difference — false
│   ├── 前缀和 — algorithmic-techniques.prefix-sum-difference.prefix-sum — true
│   └── 差分数组 — algorithmic-techniques.prefix-sum-difference.difference-array — true
├── 二分 — algorithmic-techniques.binary-search — true
│   ├── 二分答案 — algorithmic-techniques.binary-search.answer-search — true
│   └── 实数二分 — algorithmic-techniques.binary-search.continuous-search — true
├── 双指针 — algorithmic-techniques.two-pointers — true
│   └── 滑动窗口 — algorithmic-techniques.two-pointers.sliding-window — true
├── 分治 — algorithmic-techniques.divide-and-conquer — true
│   ├── 归并式统计 — algorithmic-techniques.divide-and-conquer.merge-based-counting — true
│   └── CDQ 分治 — algorithmic-techniques.divide-and-conquer.cdq-divide-and-conquer — true
├── 倍增 — algorithmic-techniques.doubling — true
├── 离线处理 — algorithmic-techniques.offline-processing — true
│   └── 莫队算法 — algorithmic-techniques.offline-processing.mo-algorithm — true
├── 离散化 — algorithmic-techniques.coordinate-compression — true
├── 折半枚举 — algorithmic-techniques.meet-in-the-middle — true
├── 扫描线 — algorithmic-techniques.sweep-line — true
├── 随机化算法 — algorithmic-techniques.randomization — false
│   ├── Monte Carlo 算法 — algorithmic-techniques.randomization.monte-carlo — true
│   └── Las Vegas 算法 — algorithmic-techniques.randomization.las-vegas — true
└── 哈希方法 — algorithmic-techniques.hashing — true
    └── 多项式滚动哈希 — algorithmic-techniques.hashing.polynomial-rolling-hash — true
```

### 3.2 搜索

```text
搜索 — search — false
├── 遍历搜索 — search.traversal — false
│   ├── 深度优先搜索 — search.traversal.depth-first-search — true
│   ├── 广度优先搜索 — search.traversal.breadth-first-search — true
│   └── 多源 BFS — search.traversal.multi-source-bfs — true
├── 回溯搜索 — search.backtracking — true
│   └── 分支定界 — search.backtracking.branch-and-bound — true
└── 状态空间搜索 — search.state-space — true
    ├── 双向搜索 — search.state-space.bidirectional-search — true
    ├── 迭代加深 — search.state-space.iterative-deepening — true
    └── 启发式搜索 — search.state-space.heuristic-search — true
```

### 3.3 数据结构

```text
数据结构 — data-structure — false
├── 堆与优先队列 — data-structure.heap — true
├── 并查集 — data-structure.disjoint-set-union — true
│   ├── 带权并查集 — data-structure.disjoint-set-union.potential-dsu — true
│   └── 可撤销并查集 — data-structure.disjoint-set-union.rollback-dsu — true
├── 区间查询结构 — data-structure.range-query — false
│   ├── 树状数组 — data-structure.range-query.fenwick-tree — true
│   ├── 线段树 — data-structure.range-query.segment-tree — true
│   ├── 稀疏表 — data-structure.range-query.sparse-table — true
│   └── 分块 — data-structure.range-query.square-root-decomposition — true
├── 平衡搜索树 — data-structure.balanced-search-tree — true
│   ├── Treap — data-structure.balanced-search-tree.treap — true
│   └── Splay Tree — data-structure.balanced-search-tree.splay-tree — true
├── 直线容器 — data-structure.line-container — false
│   ├── Convex Hull Trick — data-structure.line-container.convex-hull-trick — true
│   └── Li Chao Tree — data-structure.line-container.li-chao-tree — true
├── Trie — data-structure.trie — true
│   └── 01 Trie — data-structure.trie.binary-trie — true
├── 单调结构 — data-structure.monotonic-structure — false
│   ├── 单调栈 — data-structure.monotonic-structure.monotonic-stack — true
│   └── 单调队列 — data-structure.monotonic-structure.monotonic-queue — true
├── 可持久化数据结构 — data-structure.persistent-data-structure — true
│   └── 可持久化线段树 — data-structure.persistent-data-structure.persistent-segment-tree — true
└── 哈希表 — data-structure.hash-table — true
```

### 3.4 图论

```text
图论 — graph — false
├── 连通性 — graph.connectivity — true
│   ├── 连通分量 — graph.connectivity.connected-components — true
│   ├── 强连通分量 — graph.connectivity.strongly-connected-components — true
│   ├── 割点与桥 — graph.connectivity.articulation-points-and-bridges — true
│   └── 双连通分量 — graph.connectivity.biconnected-components — true
├── 最短路 — graph.shortest-path — true
│   ├── Dijkstra — graph.shortest-path.dijkstra — true
│   ├── Bellman–Ford — graph.shortest-path.bellman-ford — true
│   ├── Floyd–Warshall — graph.shortest-path.floyd-warshall — true
│   └── 0-1 BFS — graph.shortest-path.zero-one-bfs — true
├── 最小生成树 — graph.minimum-spanning-tree — true
│   ├── Kruskal — graph.minimum-spanning-tree.kruskal — true
│   └── Prim — graph.minimum-spanning-tree.prim — true
├── 有向无环图 — graph.directed-acyclic-graph — true
│   └── 拓扑排序 — graph.directed-acyclic-graph.topological-sort — true
├── 欧拉路与欧拉回路 — graph.eulerian-trail — true
├── 网络流 — graph.network-flow — true
│   ├── 最大流 — graph.network-flow.maximum-flow — true
│   ├── 最小费用流 — graph.network-flow.minimum-cost-flow — true
│   └── 可行流与上下界流 — graph.network-flow.circulation — true
├── 图匹配 — graph.matching — true
│   ├── 二分图匹配 — graph.matching.bipartite-matching — true
│   ├── 带权二分图匹配（KM / Hungarian） — graph.matching.weighted-bipartite-matching — true
│   └── 一般图匹配（Blossom） — graph.matching.general-graph-matching — true
├── 树上算法 — graph.tree — true
│   ├── 最近公共祖先 — graph.tree.lowest-common-ancestor — true
│   ├── 树的直径 — graph.tree.tree-diameter — true
│   ├── 树链剖分 — graph.tree.heavy-light-decomposition — true
│   ├── 点分治 — graph.tree.centroid-decomposition — true
│   ├── DSU on Tree — graph.tree.dsu-on-tree — true
│   └── 虚树 — graph.tree.virtual-tree — true
└── 函数图 — graph.functional-graph — true
    ├── 环与基环结构分解 — graph.functional-graph.cycle-decomposition — true
    └── 后继查询 — graph.functional-graph.successor-query — true
```

### 3.5 动态规划

```text
动态规划 — dynamic-programming — false
├── 线性 DP — dynamic-programming.linear — true
├── 网格 DP — dynamic-programming.grid — true
├── 背包 DP — dynamic-programming.knapsack — true
│   ├── 0/1 背包 — dynamic-programming.knapsack.zero-one-knapsack — true
│   ├── 完全背包 — dynamic-programming.knapsack.unbounded-knapsack — true
│   ├── 多重背包 — dynamic-programming.knapsack.bounded-knapsack — true
│   └── 分组背包 — dynamic-programming.knapsack.grouped-knapsack — true
├── 序列 DP — dynamic-programming.sequence — true
│   ├── 最长递增子序列 — dynamic-programming.sequence.longest-increasing-subsequence — true
│   └── 最长公共子序列 — dynamic-programming.sequence.longest-common-subsequence — true
├── 区间 DP — dynamic-programming.interval — true
├── 树形 DP — dynamic-programming.tree — true
├── DAG DP — dynamic-programming.directed-acyclic-graph — true
├── 数位 DP — dynamic-programming.digit — true
├── 子集与轮廓 DP — dynamic-programming.subset-state — true
│   ├── 子集 DP — dynamic-programming.subset-state.subset-dp — true
│   ├── 轮廓线 DP — dynamic-programming.subset-state.profile-dp — true
│   └── SOS DP — dynamic-programming.subset-state.sum-over-subsets-dp — true
├── 期望 DP — dynamic-programming.expected-value — true
└── DP 优化 — dynamic-programming.optimization — true
    ├── 分治优化 DP — dynamic-programming.optimization.divide-and-conquer-optimization — true
    └── Knuth 优化 — dynamic-programming.optimization.knuth-optimization — true
```

### 3.6 贪心、构造与不变量

```text
贪心、构造与不变量 — greedy-constructive — false
├── 贪心 — greedy-constructive.greedy — true
│   ├── 区间贪心 — greedy-constructive.greedy.interval-greedy — true
│   ├── 调度贪心 — greedy-constructive.greedy.scheduling-greedy — true
│   └── 交换论证 — greedy-constructive.greedy.exchange-argument — true
├── 构造算法 — greedy-constructive.constructive — true
└── 不变量 — greedy-constructive.invariant — true
```

### 3.7 数学

```text
数学 — math — false
├── 数论 — math.number-theory — true
│   ├── 最大公约数 — math.number-theory.greatest-common-divisor — true
│   ├── 扩展欧几里得 — math.number-theory.extended-euclidean-algorithm — true
│   ├── 模运算与模逆 — math.number-theory.modular-arithmetic — true
│   ├── 素数筛 — math.number-theory.prime-sieve — true
│   ├── 整数分解 — math.number-theory.integer-factorization — true
│   ├── 欧拉函数 — math.number-theory.euler-totient — true
│   └── 中国剩余定理 — math.number-theory.chinese-remainder-theorem — true
├── 组合数学 — math.combinatorics — true
│   ├── 组合数 — math.combinatorics.binomial-coefficient — true
│   ├── 容斥原理 — math.combinatorics.inclusion-exclusion — true
│   ├── Catalan 数 — math.combinatorics.catalan-number — true
│   ├── Burnside 引理 — math.combinatorics.burnside-lemma — true
│   └── 生成函数 — math.combinatorics.generating-function — true
├── 线性代数 — math.linear-algebra — true
│   ├── 高斯消元 — math.linear-algebra.gaussian-elimination — true
│   └── 矩阵快速幂 — math.linear-algebra.matrix-exponentiation — true
├── 卷积与多项式变换 — math.convolution — true
│   ├── FFT — math.convolution.fast-fourier-transform — true
│   └── NTT — math.convolution.number-theoretic-transform — true
├── 概率与期望 — math.probability-expectation — true
│   ├── 条件概率 — math.probability-expectation.conditional-probability — true
│   └── 期望的线性性 — math.probability-expectation.linearity-of-expectation — true
├── 组合博弈 — math.game-theory — true
│   ├── Nim — math.game-theory.nim — true
│   └── Sprague–Grundy 理论 — math.game-theory.sprague-grundy — true
└── 递推与线性递推 — math.recurrence — true
    ├── 线性递推 — math.recurrence.linear-recurrence — true
    └── Berlekamp–Massey — math.recurrence.berlekamp-massey — true
```

### 3.8 位运算与状态表示

```text
位运算与状态表示 — bitwise — false
├── 位运算 — bitwise.bit-manipulation — true
├── 状态压缩 — bitwise.state-compression — true
│   └── 子掩码枚举 — bitwise.state-compression.submask-enumeration — true
├── 异或结构 — bitwise.xor — true
│   └── 异或线性基 — bitwise.xor.xor-linear-basis — true
└── 子集变换 — bitwise.transform — false
    ├── 子集 Zeta / Möbius 变换 — bitwise.transform.subset-zeta-mobius-transform — true
    └── FWT — bitwise.transform.fast-walsh-hadamard-transform — true
```

### 3.9 字符串算法

```text
字符串算法 — string — false
├── 模式匹配 — string.pattern-matching — true
│   ├── KMP / Prefix Function — string.pattern-matching.prefix-function-kmp — true
│   ├── Z Function — string.pattern-matching.z-function — true
│   └── Aho–Corasick 自动机 — string.pattern-matching.aho-corasick — true
├── 后缀结构 — string.suffix-structure — false
│   ├── 后缀数组 — string.suffix-structure.suffix-array — true
│   └── 后缀自动机 — string.suffix-structure.suffix-automaton — true
├── 回文结构 — string.palindrome — true
│   ├── Manacher — string.palindrome.manacher — true
│   └── 回文自动机 — string.palindrome.palindromic-tree — true
├── 周期与 Border — string.periodicity — true
│   └── Border 与周期分析 — string.periodicity.border-and-period — true
└── 字典序结构 — string.lexicographic — true
    └── 最小表示法 — string.lexicographic.minimum-rotation — true
```

### 3.10 计算几何

```text
计算几何 — computational-geometry — false
├── 几何基础运算 — computational-geometry.primitives — true
│   ├── 方向与叉积 — computational-geometry.primitives.orientation-and-cross-product — true
│   ├── 线段相交 — computational-geometry.primitives.line-segment-intersection — true
│   └── 投影与距离 — computational-geometry.primitives.projection-and-distance — true
├── 凸几何 — computational-geometry.convex-geometry — true
│   ├── 凸包 — computational-geometry.convex-geometry.convex-hull — true
│   ├── 旋转卡壳 — computational-geometry.convex-geometry.rotating-calipers — true
│   └── 半平面交 — computational-geometry.convex-geometry.half-plane-intersection — true
├── 多边形 — computational-geometry.polygon — true
│   ├── 多边形面积 — computational-geometry.polygon.polygon-area — true
│   └── 点在多边形内 — computational-geometry.polygon.point-in-polygon — true
├── 圆 — computational-geometry.circle — true
│   ├── 圆的相交关系 — computational-geometry.circle.circle-intersection — true
│   └── 最小覆盖圆 — computational-geometry.circle.minimum-enclosing-circle — true
└── 平面距离问题 — computational-geometry.distance — true
    └── 平面最近点对 — computational-geometry.distance.closest-pair-of-points — true
```

## 4. Canonical boundaries and ambiguity rules

| Concept | Canonical knowledge location | Boundary and multi-selection rule |
| --- | --- | --- |
| 状态压缩 | `bitwise.state-compression` | 表示状态、集合和转移所需的压缩编码在这里。若核心算法是状压 DP，再选 `dynamic-programming.subset-state.*`；不要创建 `dynamic-programming.state-compression` 的重复节点。 |
| 位运算 | `bitwise.bit-manipulation` | 位级恒等式、掩码和二进制性质属于 knowledge；具体的 `lowbit` 写法、位宽和语言 API 属于 tags。 |
| 搜索、DFS、BFS | `search.*` | DFS/BFS 只在搜索中定义。纯状态空间搜索可以只选 Search；若 Problem 的目标具有对应 Graph 语义，并且搜索方法也是独立核心，可同时选 Graph 与 Search。Graph 算法内部机械使用 DFS/BFS 时不追加 Search；不创建 `graph.dfs` 或 `graph.bfs`。 |
| 二分答案 | `algorithmic-techniques.binary-search.answer-search` | 参数单调性与判定式属于 knowledge；“最大化最小值”等题面形态可做 tags。 |
| 分治 | `algorithmic-techniques.divide-and-conquer` | 通用分治与 CDQ 在此。点分治因依赖树结构，唯一位置是 `graph.tree.centroid-decomposition`。DP 分治优化则是 `dynamic-programming.optimization.divide-and-conquer-optimization`，三者语义不同。 |
| 倍增 | `algorithmic-techniques.doubling` | 通用 jump table / binary lifting 在此，不再保留含义近乎重复的 child。LCA 是问题知识 `graph.tree.lowest-common-ancestor`；仅当倍增本身也是核心推导或训练目标时才同时选择。 |
| 前缀和 / 差分 | `algorithmic-techniques.prefix-sum-difference` | 作为通用数组变换，不归入数据结构。二维、环形、树上前缀等实现形态使用 tags，除非未来证明需要稳定节点。 |
| 离散化 | `algorithmic-techniques.coordinate-compression` | 坐标压缩既可服务离线查询，也可服务几何、DP、图和在线数据结构初始化；它不是 `offline-processing` 的天然语义子类。为避免未来 breaking reparent，V1 将其设为独立 Topic。 |
| 双指针 / 滑动窗口 | `algorithmic-techniques.two-pointers` | 滑动窗口是双指针的稳定子技术。固定窗口、可变窗口、同向/相向等细节以 tags 表达。 |
| 单调栈 / 单调队列 | `data-structure.monotonic-structure.*` | 它们是维护单调不变量的数据结构。用于 DP 时再选 `dynamic-programming.optimization`，不重复创建“单调队列优化”Technique。 |
| 哈希 | `algorithmic-techniques.hashing` | 指纹、滚动哈希等算法方法在这里；容器语义属于 `data-structure.hash-table`。字符串子串哈希选择通用哈希 Technique，字符串只是应用对象，不再复制 `string.hashing`。 |
| 随机化 | `algorithmic-techniques.randomization` | 正确性或复杂度依赖随机选择时属于 knowledge；固定随机种子、防 hack、双哈希等工程措施属于 tags。 |
| 构造 | `greedy-constructive.constructive` | 存在性构造或按规则生成答案属于 knowledge；“脑洞”“观察性质”“分类讨论”过于题目化，放 tags。 |
| 博弈 | `math.game-theory` | 组合博弈理论属于数学。用 minimax/搜索求解的有限游戏可另选 `search.*`，但不复制博弈节点。 |
| 概率 / 期望 | `math.probability-expectation` | 概率定理和期望推导在这里；若状态递推是解法核心，再选 `dynamic-programming.expected-value`。 |
| FFT / NTT | `math.convolution.*` | 它们作为卷积/多项式变换知识存在；具体模数、蝴蝶实现和常数优化属于 tags。 |
| 计算几何 | `computational-geometry.*` | 几何对象、谓词、凸性和精度属于独立 Domain。扫描线、分治、随机化等通用技术从 canonical Domain 另选。 |
| 字符串算法 | `string.*` | KMP、自动机、后缀和回文结构留在字符串。Trie 是通用数据结构，唯一位置在 `data-structure.trie`；AC 自动机内部使用 Trie 时不机械追加 Trie。 |
| 网络流 | `graph.network-flow` | 最大流、费用流和上下界流在图论中唯一出现。Dinic、ISAP、HLPP 等具体实现版本先作为 tags。 |
| 匹配 | `graph.matching` | 匹配是独立图论语义。只有当“化为流”本身是核心建模步骤时，才同时选择匹配和最大流；若流只是替代实现，不机械追加最大流。 |
| 树上算法 | `graph.tree` | LCA、树剖、点分治等放在图论。树形 DP 唯一放在 `dynamic-programming.tree`；一道题可同时选择二者。 |

### Knowledge versus tags

Knowledge should contain the stable method or theory needed to solve the Problem. Tags should carry local and descriptive context, including:

- story or shape: `网格图`, `环形数组`, `括号序列`, `交互题`;
- implementation choice: `Dinic`, `Tarjan 写法`, `递归版`, `迭代版`, `手写堆`;
- constraints and engineering: `卡常`, `高精度`, `防溢出`, `递归深度`;
- mistakes and review notes: `边界错误`, `漏判重边`, `初始化错误`;
- informal insights: `正难则反`, `枚举贡献`, `观察奇偶性`, `结论题`;
- platform metadata or personal workflow labels.

An implementation name may later become knowledge only after it proves to be a stable, independently trained algorithm rather than a replaceable variant.

## 5. Cross-domain classification examples

These examples test whether one canonical location plus multi-selection feels natural. They are illustrative, not migration data.

After the semantic audit, standard internal dependencies are deliberately represented as tags or omitted. Multi-selection remains only where two methods are independently necessary to the solution or learning objective.

### 5.1 Dijkstra with a standard priority queue

```yaml
knowledge:
  - graph.shortest-path.dijkstra
tags:
  - 优先队列
  - 邻接表
  - 路径恢复
```

### 5.2 Grid shortest path with 0-1 BFS

```yaml
knowledge:
  - graph.shortest-path.zero-one-bfs
tags:
  - 网格图
  - 隐式图
  - 双端队列
```

### 5.3 Articulation points via DFS low-link values

```yaml
knowledge:
  - graph.connectivity.articulation-points-and-bridges
tags:
  - low-link
  - 重边
```

### 5.4 Maximum flow implemented with Dinic

```yaml
knowledge:
  - graph.network-flow.maximum-flow
tags:
  - Dinic
  - 当前弧优化
```

### 5.5 Bipartite matching reduced to maximum flow

```yaml
knowledge:
  - graph.matching.bipartite-matching
  - graph.network-flow.maximum-flow
tags:
  - 建图
  - 容量为一
```

### 5.6 Heavy-light decomposition with a segment tree

```yaml
knowledge:
  - graph.tree.heavy-light-decomposition
  - data-structure.range-query.segment-tree
tags:
  - 路径修改
  - 懒标记
```

### 5.7 Tree knapsack DP

```yaml
knowledge:
  - dynamic-programming.tree
  - dynamic-programming.knapsack.grouped-knapsack
tags:
  - 子树合并
  - 恰好选择
```

### 5.8 Profile DP with bitmask states

```yaml
knowledge:
  - bitwise.state-compression
  - dynamic-programming.subset-state.profile-dp
tags:
  - 棋盘覆盖
  - 轮廓线
```

### 5.9 Digit DP

```yaml
knowledge:
  - dynamic-programming.digit
tags:
  - 数位限制
  - 前导零
```

### 5.10 String substring equality with rolling hash

```yaml
knowledge:
  - algorithmic-techniques.hashing.polynomial-rolling-hash
tags:
  - 字符串
  - 子串判等
  - 双哈希
```

### 5.11 Aho–Corasick over a Trie

```yaml
knowledge:
  - string.pattern-matching.aho-corasick
tags:
  - 多模式串
  - Trie
  - fail 指针
```

### 5.12 NTT polynomial convolution

```yaml
knowledge:
  - math.convolution.number-theoretic-transform
tags:
  - 多项式乘法
  - 原根
```

### 5.13 Expected-value DP

```yaml
knowledge:
  - math.probability-expectation
  - dynamic-programming.expected-value
tags:
  - 吸收状态
  - 逆向递推
```

### 5.14 Sprague–Grundy game on a DAG

```yaml
knowledge:
  - math.game-theory.sprague-grundy
tags:
  - mex
  - DAG
  - 多子游戏异或和
```

### 5.15 Convex hull followed by rotating calipers

```yaml
knowledge:
  - computational-geometry.convex-geometry.convex-hull
  - computational-geometry.convex-geometry.rotating-calipers
tags:
  - 最远点对
  - 共线点
```

These are sibling Techniques, so selecting both does not violate the ancestor/descendant rule.

### 5.16 Closest pair by divide and conquer

```yaml
knowledge:
  - computational-geometry.distance.closest-pair-of-points
  - algorithmic-techniques.divide-and-conquer
tags:
  - 平面点集
  - 按坐标排序
```

### 5.17 Binary search on an answer checked by maximum flow

```yaml
knowledge:
  - algorithmic-techniques.binary-search.answer-search
  - graph.network-flow.maximum-flow
tags:
  - 最大化最小值
  - 可行性判定
```

### 5.18 Coordinate compression with a Fenwick tree

```yaml
knowledge:
  - algorithmic-techniques.coordinate-compression
  - data-structure.range-query.fenwick-tree
tags:
  - 逆序对
  - 权值域
```

### 5.19 Monotonic queue optimization for DP

```yaml
knowledge:
  - dynamic-programming.optimization
  - data-structure.monotonic-structure.monotonic-queue
tags:
  - 固定转移窗口
  - 队首过期
```

The DP node and the data-structure node describe different reusable knowledge; there is no duplicate “monotonic-queue DP” node.

### 5.20 Randomized minimum enclosing circle

```yaml
knowledge:
  - computational-geometry.circle.minimum-enclosing-circle
  - algorithmic-techniques.randomization.las-vegas
tags:
  - 随机增量
  - 浮点误差
```

## 6. Granularity review

### 6.1 Topic-by-Topic selectability audit

The audit question is: after fully understanding a Problem, can the Topic itself still be the natural minimal sufficient classification without requiring one of its children? Having children does not decide the answer.

| Topic | Selectable | Audit result |
| --- | --- | --- |
| `algorithmic-techniques.simulation` | `true` | Simulation is itself a complete solution class and has no stable mandatory subtype. |
| `algorithmic-techniques.prefix-sum-difference` | `false` | Pure container for the distinct prefix-sum and difference-array Techniques; a fully understood use can name one or both children. |
| `algorithmic-techniques.binary-search` | `true` | Generic monotone-boundary bisection remains meaningful when neither specialized child adds necessary information. |
| `algorithmic-techniques.two-pointers` | `true` | Many two-pointer solutions are not sliding windows. |
| `algorithmic-techniques.divide-and-conquer` | `true` | Generic divide-and-conquer is meaningful beyond merge-based counting and CDQ. |
| `algorithmic-techniques.doubling` | `true` | Doubling/binary lifting is one complete generic technique; the redundant child was removed. |
| `algorithmic-techniques.offline-processing` | `true` | Offline event/query reordering is meaningful without coordinate compression or a specific data structure. |
| `algorithmic-techniques.coordinate-compression` | `true` | Coordinate compression is an independent cross-domain technique. |
| `algorithmic-techniques.meet-in-the-middle` | `true` | Splitting enumeration into two halves is a complete cross-domain technique, not merely a Search container. |
| `algorithmic-techniques.sweep-line` | `true` | Event-ordered scanning is a complete method across geometry, intervals, and time axes. |
| `algorithmic-techniques.randomization` | `false` | Container for the materially different Monte Carlo and Las Vegas correctness contracts. |
| `algorithmic-techniques.hashing` | `true` | Hash fingerprints remain meaningful beyond polynomial rolling hash. |
| `search.traversal` | `false` | Pure container: a completed classification should name DFS, BFS, or multi-source BFS. |
| `search.backtracking` | `true` | Ordinary backtracking remains a complete method without branch-and-bound. |
| `search.state-space` | `true` | State-space modeling can be the core knowledge without requiring one listed search variant. |
| `data-structure.heap` | `true` | Heap/priority-queue semantics are meaningful without freezing implementation variants. |
| `data-structure.disjoint-set-union` | `true` | Ordinary DSU is independently useful and is not a container for only potential/rollback DSU. |
| `data-structure.range-query` | `false` | Organizational container for concrete online/static range-query structures; Mo's algorithm now lives under offline processing. |
| `data-structure.balanced-search-tree` | `true` | Ordered-set/map semantics may be the core knowledge even when a standard-library tree hides the implementation. |
| `data-structure.line-container` | `false` | Organizational container for Convex Hull Trick and Li Chao Tree. |
| `data-structure.trie` | `true` | Ordinary Trie is a complete data structure; the synonymous `prefix-trie` child was removed. |
| `data-structure.monotonic-structure` | `false` | Pure container for monotonic stack and monotonic queue. |
| `data-structure.persistent-data-structure` | `true` | Persistence is a reusable technique beyond the currently listed persistent segment tree. |
| `data-structure.hash-table` | `true` | Hash-table lookup/update semantics are independently meaningful. |
| `graph.connectivity` | `true` | Generic reachability/connectivity can be the exact graph objective without a specialized child. |
| `graph.shortest-path` | `true` | Unweighted or model-level shortest-path Problems need not force a weighted algorithm child. |
| `graph.minimum-spanning-tree` | `true` | MST modeling/proofs may be the core knowledge independent of choosing Kruskal or Prim. |
| `graph.directed-acyclic-graph` | `true` | DAG structure has independent consequences beyond topological sorting. |
| `graph.eulerian-trail` | `true` | Terminal Topic representing Euler trails and circuits. |
| `graph.network-flow` | `true` | Flow modeling can be the core knowledge before a specific flow objective is required. |
| `graph.matching` | `true` | Matching semantics can be sufficient without forcing bipartite, weighted, or general-graph matching. |
| `graph.tree` | `true` | Tree structure and generic tree algorithms remain meaningful beyond the listed advanced Techniques. |
| `graph.functional-graph` | `true` | Functional-graph structure can be the complete classification without a listed child. |
| `dynamic-programming.linear` | `true` | Terminal Topic for ordinary one-dimensional/stage DP. |
| `dynamic-programming.grid` | `true` | Terminal Topic for grid-state recurrence. |
| `dynamic-programming.knapsack` | `true` | Generic knapsack modeling can be sufficient when a named multiplicity subtype is not the learning target. |
| `dynamic-programming.sequence` | `true` | Sequence DP includes many recurrences beyond LIS and LCS. |
| `dynamic-programming.interval` | `true` | Terminal Topic with stable independent meaning. |
| `dynamic-programming.tree` | `true` | Terminal Topic for tree-structured state transitions. |
| `dynamic-programming.directed-acyclic-graph` | `true` | Terminal Topic for DP over a DAG dependency order. |
| `dynamic-programming.digit` | `true` | Terminal Topic for digit-restricted state DP. |
| `dynamic-programming.subset-state` | `true` | Subset-state recurrence may be sufficient without being subset, profile, or SOS DP specifically. |
| `dynamic-programming.expected-value` | `true` | Terminal Topic for expectation recurrences. |
| `dynamic-programming.optimization` | `true` | Generic transition optimization remains meaningful beyond the two listed DP-specific Techniques. |
| `greedy-constructive.greedy` | `true` | Generic greedy choice and proof can be the full solution without an interval/scheduling subtype. |
| `greedy-constructive.constructive` | `true` | Construction is a complete solution paradigm without a stable exhaustive child taxonomy. |
| `greedy-constructive.invariant` | `true` | Invariant reasoning is independently classifiable without turning every invariant form into a child. |
| `math.number-theory` | `true` | Many stable number-theory Problems combine or fall outside the listed Techniques. |
| `math.combinatorics` | `true` | General counting arguments can be complete without a named child theorem. |
| `math.linear-algebra` | `true` | Linear-algebra modeling can be sufficient beyond elimination or matrix exponentiation. |
| `math.convolution` | `true` | Convolution itself may be the core operation even when naive or another transform is sufficient. |
| `math.probability-expectation` | `true` | General probability/expectation reasoning remains meaningful beyond the two children. |
| `math.game-theory` | `true` | General combinatorial-game reasoning can be sufficient beyond Nim or SG theory. |
| `math.recurrence` | `true` | Recurrence analysis remains meaningful beyond the listed linear-recurrence Techniques. |
| `bitwise.bit-manipulation` | `true` | Terminal Topic for reusable bit identities and mask operations. |
| `bitwise.state-compression` | `true` | State representation is independently meaningful without requiring submask enumeration. |
| `bitwise.xor` | `true` | XOR algebra and prefix-XOR reasoning extend beyond linear bases. |
| `bitwise.transform` | `false` | Organizational container for Zeta/Möbius and Walsh–Hadamard transforms. |
| `string.pattern-matching` | `true` | Pattern matching may be solved by hashing or other methods not represented as children. |
| `string.suffix-structure` | `false` | Organizational container for concrete suffix structures; a completed solution should name the structure used. |
| `string.palindrome` | `true` | Palindrome reasoning extends beyond Manacher and palindromic trees. |
| `string.periodicity` | `true` | Periodicity itself remains meaningful beyond border-based analysis. |
| `string.lexicographic` | `true` | Lexicographic reasoning extends beyond minimum rotation. |
| `computational-geometry.primitives` | `true` | Problems often require a combination of geometric predicates rather than one child alone. |
| `computational-geometry.convex-geometry` | `true` | Convexity reasoning can be sufficient beyond the listed algorithms. |
| `computational-geometry.polygon` | `true` | Polygon modeling and predicates extend beyond area and containment. |
| `computational-geometry.circle` | `true` | Circle geometry extends beyond intersection and minimum enclosing circle. |
| `computational-geometry.distance` | `true` | Geometric distance optimization extends beyond closest pair. |

Result: 8 Topics are non-selectable containers; the other 60 Topics retain independently meaningful selectable semantics.

### 6.2 Technique selectability audit

All remaining depth-three nodes were individually reviewed. All 117 remaining Techniques are `selectable: true`: each names a concrete reusable algorithm, theorem, data structure, transform, or proof method that can independently be the minimal sufficient classification. No pure organizational node remains at Technique depth.

The audit removed or moved nodes rather than preserving artificial selectable Techniques:

| Previous node | Audit action | Reason |
| --- | --- | --- |
| `algorithmic-techniques.binary-search.ordered-search` | Removed; use selectable Topic `algorithmic-techniques.binary-search`. | “Ordered search” was the default binary-search meaning and duplicated its parent. |
| `algorithmic-techniques.doubling.binary-lifting` | Removed; use selectable Topic `algorithmic-techniques.doubling`. | “Doubling” and “binary lifting” were effectively duplicate knowledge at adjacent levels. |
| `search.backtracking.pruning` | Removed; ordinary pruning remains a tag or part of backtracking. | “Pruning” alone is too unspecific to be stable Technique knowledge. |
| `data-structure.trie.prefix-trie` | Removed; use selectable Topic `data-structure.trie`. | It was synonymous with the ordinary Trie represented by its parent. |
| `algorithmic-techniques.offline-processing.coordinate-compression` | Reparented as Topic `algorithmic-techniques.coordinate-compression`. | Coordinate compression is not semantically dependent on offline processing. |
| `search.state-space.meet-in-the-middle` | Reparented as Topic `algorithmic-techniques.meet-in-the-middle`. | Meet-in-the-middle is a general enumeration technique, not inherently state-space search. |
| `dynamic-programming.optimization.convex-hull-trick` | Reparented as `data-structure.line-container.convex-hull-trick`. | The line-container structure is reusable outside DP; DP use selects DP optimization only when independently core. |

### 6.3 Potentially too broad

| Node | Concern | V1 decision |
| --- | --- | --- |
| `algorithmic-techniques.simulation` | Covers many unrelated implementation-heavy Problems. | Keep selectable as a broad terminal Topic; do not invent unstable simulation subtypes. |
| `data-structure.heap` | Binary heap, meldable heap, and priority queue behavior differ. | Keep one Topic in V1; specific heap variants remain tags until repeated training data justifies nodes. |
| `greedy-constructive.constructive` | Construction has no universally accepted stable sub-taxonomy. | Keep broad and selectable; use tags for permutation construction, graph construction, parity construction, and similar shapes. |
| `greedy-constructive.invariant` | Invariants vary by algebraic, parity, coloring, or potential arguments. | Keep broad to avoid turning every proof observation into knowledge. |
| `bitwise.bit-manipulation` | Contains many small identities and idioms. | Keep broad; individual bit tricks are tags unless a reusable theory emerges. |
| `dynamic-programming.linear` | “Linear” describes topology more than a unique algorithm. | Keep because it is a practical fallback classification for ordinary one-dimensional recurrence; review after real usage. |

### 6.4 Low-frequency Technique final review

| Node | Concern | V1 decision |
| --- | --- | --- |
| `algorithmic-techniques.randomization.las-vegas` | Relatively rare in ordinary personal training. | Retain because its correctness contract differs fundamentally from Monte Carlo; it can be hidden by collapsed UI. |
| `search.backtracking.branch-and-bound` | Less frequent in XCPC than generic pruning. | Retain as a stable optimization-search concept, not an implementation variant. |
| `data-structure.persistent-data-structure.persistent-segment-tree` | First authored child makes the branch asymmetric. | Retain due to common independent training value; do not add every persistent variant preemptively. |
| `graph.matching.general-graph-matching` | Advanced and infrequent. | Retain for long-term ICPC completeness; ordinary users can select the parent matching Topic. |
| `math.combinatorics.burnside-lemma` | Specialized theorem. | Retain because it is stable, reusable, and not well represented by a generic tag. |
| `math.recurrence.berlekamp-massey` | Advanced named algorithm. | Retain because it solves a stable, distinct recurrence-learning task. |
| `computational-geometry.convex-geometry.half-plane-intersection` | Advanced geometry technique. | Retain because its invariants and implementation are independently trained. |

Final low-frequency decision: **KEEP all seven nodes above; REMOVE none**. Frequency alone is not a deletion criterion. Each retained node is stable, independently learnable, and materially more precise than its parent Topic.

### 6.5 Duplicate risks intentionally avoided

- No `graph.dfs`, `graph.bfs`, or `tree.dfs`; DFS/BFS live only under `search.traversal`.
- No `dynamic-programming.state-compression`; representation lives under `bitwise`, while subset/profile DP remains under DP.
- No `string.hashing`; rolling hash lives under the general hashing technique.
- No `string.trie`; Trie lives under data structures.
- No `graph.tree.tree-dp`; tree DP lives under dynamic programming.
- No `graph.matching.max-flow-matching`; matching semantics and chosen flow algorithm are separate selections.
- No geometry-specific sweep line or closest-pair divide-and-conquer duplicate; select both canonical branches.
- No “monotonic queue optimization” Technique under DP; select DP optimization plus the monotonic queue structure.
- No duplicate Binary Lifting child below doubling, ordinary ordered-search child below binary search, or ordinary prefix-Trie child below Trie.
- No DP-owned Convex Hull Trick; line-container Techniques live under data structures and are selected with DP optimization only when both are independently core.

### 6.6 Highest reparent risk

| Candidate | Semantic / hierarchy risk | Audit decision now |
| --- | --- | --- |
| Coordinate compression under offline processing | Compression is also used for online structures, geometry, DP, and graph labels. | **Reparent now** to independent Topic `algorithmic-techniques.coordinate-compression`. |
| Meet-in-the-middle under Search | It is commonly an enumeration/decomposition technique without a searched transition graph. | **Reparent now** to independent Topic `algorithmic-techniques.meet-in-the-middle`. |
| Convex Hull Trick under DP optimization | A line container is reusable outside DP and Li Chao Tree belongs beside it. | **Reparent now** to `data-structure.line-container.convex-hull-trick`; add sibling `li-chao-tree`. |
| `algorithmic-techniques.hashing` | Could be mistaken for string-only hashing or hash tables. | **Keep after review**: algorithmic fingerprints here, hash-table container semantics under `data-structure.hash-table`, string only as an application. |
| `algorithmic-techniques.doubling` | Often taught only as tree/LCA binary lifting. | **Keep after review** as generic repeated-function/jump-table knowledge; remove the redundant Binary Lifting child. |
| `algorithmic-techniques.sweep-line` | Often taught inside computational geometry. | **Keep after review** as event ordering over any axis/time coordinate; select geometry separately only when core. |
| Mo's algorithm under range-query data structures | Mo's algorithm is an offline ordering algorithm, not literally a data structure. | **Reparent now** to `algorithmic-techniques.offline-processing.mo-algorithm`; it remains a range-query method semantically, but its hierarchy now reflects the required offline ordering. |
| 矩阵快速幂的归属 | Matrix exponentiation also solves recurrences. | **Keep after review** only at `math.linear-algebra.matrix-exponentiation`; recurrence is an application, not a second node. |
| Zeta/Möbius transform versus SOS DP | Algebraic transform and DP formulation overlap. | **Keep separate after review**: `bitwise.transform.subset-zeta-mobius-transform` explicitly covers subset Zeta and its Möbius inverse; `dynamic-programming.subset-state.sum-over-subsets-dp` is the DP formulation. Select both only when independently core. |

## 7. KnowledgeId stability review

### 7.1 Naming rules applied

- IDs use full English concepts where an abbreviation would be ambiguous: `greatest-common-divisor`, `strongly-connected-components`, `fast-fourier-transform`.
- Widely canonical algorithm names may remain names in IDs: `dijkstra`, `kruskal`, `treap`, `manacher`.
- Ambiguous surnames are qualified by the concept, or replaced by semantic IDs: `bellman-ford`, `floyd-warshall`, `weighted-bipartite-matching`, `general-graph-matching`.
- Chinese textbook shorthand is not persisted: no `状压`, `树剖`, `主席树`, `数位`, or `斜率优化` transliteration appears in IDs.
- Implementation brands and replaceable variants are excluded: no `dinic`, `isap`, `hlpp`, `tarjan`, `kosaraju`, `zkw`, or `chairman-tree` IDs.
- IDs name semantic knowledge, not current UI wording. Chinese names may be revised without changing IDs.

### 7.2 English ambiguity and semantic-rename audit

| Candidate | Risk | Decision |
| --- | --- | --- |
| `data-structure.disjoint-set-union.weighted-dsu` | “Weighted union” often means union-by-size/rank, while Chinese 带权并查集 means maintaining relative potentials. | **Changed now** to `data-structure.disjoint-set-union.potential-dsu`; display name remains 带权并查集. |
| `graph.matching.assignment-problem` | “Assignment problem” is a problem family and does not unambiguously mean the weighted bipartite matching knowledge being classified. | **Changed now** to `graph.matching.weighted-bipartite-matching`; KM/Hungarian remains display/help text. |
| `dynamic-programming.subset-state.sos-dp` | SOS is opaque outside a particular competitive-programming vocabulary and may be confused with other acronyms. | **Changed now** to `dynamic-programming.subset-state.sum-over-subsets-dp`; display name may remain SOS DP. |
| `algorithmic-techniques` | Broad umbrella wording could imply beginner-only fundamentals. | **Kept after review**: “algorithmic techniques” is level-neutral and explicitly means stable cross-domain methods. |
| `greedy-constructive` | The Chinese Domain also includes invariants, which are not written in the ID. | **Kept intentionally**: greedy and constructive are the two solution-producing paradigms; invariant is a closely coupled proof Topic. Avoid a longer compound ID unless reviewers view all three as equal top-level pillars. |
| `dynamic-programming.subset-state` | “Subset state” is less common than “state compression,” but the latter already has a canonical bitwise meaning. | **Kept after review** to distinguish DP recurrence structure from `bitwise.state-compression`. |
| `graph.eulerian-trail` | Display text includes both trails and circuits. | **Kept after review**: Eulerian circuit is a constrained Eulerian trail, and the singular semantic ID covers the family. |
| `algorithmic-techniques.divide-and-conquer.cdq-divide-and-conquer` | CDQ is community shorthand and a named technique whose English expansion is not descriptive. | **Kept after review** because no broader English phrase preserves the established algorithm identity without incorrectly narrowing it to one application. |
| `graph.tree.dsu-on-tree` | The acronym does not describe the technique and is sometimes conflated with generic small-to-large merging. | **Kept by final decision** as a selectable Technique using the established XCPC term. |
| `data-structure.range-query.mo-algorithm` | Named algorithm was nested below a structure-oriented Topic. | **Changed by final decision** to `algorithmic-techniques.offline-processing.mo-algorithm`. |
| `bitwise.transform.fast-zeta-transform` | The ID named only the forward transform while the intended node also covered its inverse. | **Changed by final decision** to `bitwise.transform.subset-zeta-mobius-transform`, explicitly covering subset Zeta transform and its Möbius inverse. |
| `computational-geometry.primitives.line-segment-intersection` | The former Chinese name “直线与线段相交” could imply line-versus-segment rather than segment intersection. | **Kept ID, changed display name** to “线段相交” so both languages have the same scope. |

### 7.3 Stability conclusion

All identified ID questions are resolved. The inventory is frozen for later production authoring. From this point, KnowledgeId renames, reparenting, semantic changes, or selectable-to-non-selectable changes are breaking taxonomy changes. Ordinary growth may add siblings or children without changing existing IDs or explicit selectable values. The discarded proposal-only IDs were never persisted and therefore do not consume reserved IDs; the Frozen Contract's non-reuse rule applies to IDs once formally used.

## 8. Relationship to the old eight categories

This is an explanatory correspondence only, not a migration map.

| Old Category | Taxonomy V1 position |
| --- | --- |
| 动态规划 | `dynamic-programming` and its Topics/Techniques. State representation additionally uses `bitwise.state-compression`; probability theory additionally uses `math.probability-expectation`. |
| 图论 | `graph`. DFS/BFS move canonically to `search`; tree DP moves to `dynamic-programming.tree`; graph Problems select both when needed. |
| 数据结构 | `data-structure`. Prefix sums, difference arrays, coordinate compression, and hashing methods move to `algorithmic-techniques`; only hash tables stay as a data structure. |
| 数学与数论 | `math`, now explicitly including combinatorics, linear algebra, convolution, probability, game theory, and recurrence. |
| 贪心、构造与不变量 | `greedy-constructive`; the conceptual grouping is retained because it remains useful, but it gains explicit Topics and stable boundaries. |
| 字符串 | `string`. Trie moves canonically to `data-structure.trie`; rolling hash moves to `algorithmic-techniques.hashing`. |
| 位运算与状态压缩 | `bitwise`; subset/profile DP remains under `dynamic-programming.subset-state` and can be selected together with state compression. |
| 计算几何 | `computational-geometry`; generic sweep line, divide-and-conquer, and randomization move to their canonical cross-domain nodes. |
| Previously absent | `search` and `algorithmic-techniques` are new Domains, making DFS/BFS, binary search, prefix/difference, two pointers, offline processing, and related knowledge first-class rather than forcing them into unrelated categories. |

## 9. Scale

| Level | Count |
| --- | ---: |
| Domains | 10 |
| Topics | 68 |
| Techniques | 117 |
| Total nodes | 195 |
| Selectable nodes | 177 |
| Non-selectable nodes | 18 |

The 18 non-selectable nodes are all 10 Domains plus 8 Topic containers. The other 60 Topics and all 117 remaining Techniques are selectable after semantic review. Selectability remains explicit and stable; later child additions do not change it automatically.

For a personal XCPC Tracker, 177 selectable nodes is near the upper end of a reasonable initial catalog but remains workable if the selector is collapsed by Domain, searchable by name/ID/breadcrumb, and favors recent selections. The frozen inventory avoids hundreds of implementation variants while still covering long-term regional and ICPC-level training. The reviewed low-frequency Techniques remain because they are stable and independently learnable, not because V1 aims to maximize node count.

## 10. Final audit disposition

### CHANGED

- Added the Minimal Sufficient Knowledge Principle and revised all 20 examples against it.
- Marked 8 organizational Topics non-selectable instead of treating every Topic mechanically as selectable.
- Reparented coordinate compression to `algorithmic-techniques.coordinate-compression`.
- Reparented meet-in-the-middle to `algorithmic-techniques.meet-in-the-middle`.
- Reparented Convex Hull Trick under the new non-selectable `data-structure.line-container` Topic and added Li Chao Tree as its sibling.
- Renamed `weighted-dsu` to `potential-dsu`.
- Renamed `assignment-problem` to `weighted-bipartite-matching`.
- Expanded opaque `sos-dp` to `sum-over-subsets-dp`.
- Reparented Mo's algorithm to `algorithmic-techniques.offline-processing.mo-algorithm`.
- Renamed `bitwise.transform.fast-zeta-transform` to `bitwise.transform.subset-zeta-mobius-transform` and froze its forward/inverse scope.
- Removed redundant or underspecified Techniques: ordinary ordered search, Binary Lifting below doubling, generic pruning, and prefix Trie.
- Removed mechanical implementation-dependency selections from the Dijkstra, 0-1 BFS, articulation-point, Aho–Corasick, and Sprague–Grundy examples.
- Narrowed the Chinese display meaning of `line-segment-intersection` to “线段相交”.

### KEPT AFTER REVIEW

- The 10-Domain architecture.
- `greedy-constructive` as an intentional stable canonical Domain ID; invariant remains a first-class child Topic without lengthening the Domain ID.
- DFS/BFS canonically under Search, with Graph + Search multi-selection permitted only when both are independently core.
- `algorithmic-techniques`, `algorithmic-techniques.hashing`, `algorithmic-techniques.doubling`, and `algorithmic-techniques.sweep-line` in their cross-domain locations.
- `dynamic-programming.subset-state` separate from `bitwise.state-compression`.
- Matrix exponentiation under `math.linear-algebra` rather than recurrence.
- Distinct matching and network-flow nodes, governed by minimal sufficient classification rather than implementation-driven dual labeling.
- `graph.tree.dsu-on-tree` as a selectable Technique using the established contest term.
- All seven reviewed low-frequency Techniques; none were removed solely because they are uncommon.
- All 117 remaining Techniques as selectable after removing pure duplicates and vague pseudo-Techniques.

### STILL REQUIRES HUMAN DECISION

None within the Taxonomy V1 inventory. Future KnowledgeId changes must be handled as breaking taxonomy changes rather than reopening V1 implicitly.

This document is the approved frozen XCPC Production Taxonomy V1 inventory. It is still a design artifact; authoring `config/knowledge-taxonomy.ts` and performing the Problem Schema cutover require separate implementation phases.
