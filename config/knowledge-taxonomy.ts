import { createKnowledgeCatalog } from "@/lib/knowledge/catalog";
import { defineKnowledgeTaxonomy } from "@/lib/knowledge/definition";
import type { KnowledgeNodeDefinition } from "@/lib/knowledge/types";

const knowledgeTaxonomyDefinition = [
  {
    id: "algorithmic-techniques",
    name: "通用算法技巧",
    description: "不依赖某一种数学或数据模型的通用处理范式，如二分、双指针、前缀和与离线处理。",
    selectable: false,
    children: [
      {
        id: "algorithmic-techniques.simulation",
        name: "模拟",
        selectable: true,
      },
      {
        id: "algorithmic-techniques.prefix-sum-difference",
        name: "前缀和与差分",
        selectable: false,
        children: [
          {
            id: "algorithmic-techniques.prefix-sum-difference.prefix-sum",
            name: "前缀和",
            selectable: true,
          },
          {
            id: "algorithmic-techniques.prefix-sum-difference.difference-array",
            name: "差分数组",
            selectable: true,
          },
        ],
      },
      {
        id: "algorithmic-techniques.binary-search",
        name: "二分",
        selectable: true,
        children: [
          {
            id: "algorithmic-techniques.binary-search.answer-search",
            name: "二分答案",
            selectable: true,
          },
          {
            id: "algorithmic-techniques.binary-search.continuous-search",
            name: "实数二分",
            selectable: true,
          },
        ],
      },
      {
        id: "algorithmic-techniques.two-pointers",
        name: "双指针",
        selectable: true,
        children: [
          {
            id: "algorithmic-techniques.two-pointers.sliding-window",
            name: "滑动窗口",
            selectable: true,
          },
        ],
      },
      {
        id: "algorithmic-techniques.divide-and-conquer",
        name: "分治",
        selectable: true,
        children: [
          {
            id: "algorithmic-techniques.divide-and-conquer.merge-based-counting",
            name: "归并式统计",
            selectable: true,
          },
          {
            id: "algorithmic-techniques.divide-and-conquer.cdq-divide-and-conquer",
            name: "CDQ 分治",
            selectable: true,
          },
        ],
      },
      {
        id: "algorithmic-techniques.doubling",
        name: "倍增",
        selectable: true,
      },
      {
        id: "algorithmic-techniques.offline-processing",
        name: "离线处理",
        selectable: true,
        children: [
          {
            id: "algorithmic-techniques.offline-processing.mo-algorithm",
            name: "莫队算法",
            selectable: true,
          },
        ],
      },
      {
        id: "algorithmic-techniques.coordinate-compression",
        name: "离散化",
        selectable: true,
      },
      {
        id: "algorithmic-techniques.meet-in-the-middle",
        name: "折半枚举",
        selectable: true,
      },
      {
        id: "algorithmic-techniques.sweep-line",
        name: "扫描线",
        selectable: true,
      },
      {
        id: "algorithmic-techniques.randomization",
        name: "随机化算法",
        selectable: false,
        children: [
          {
            id: "algorithmic-techniques.randomization.monte-carlo",
            name: "Monte Carlo 算法",
            selectable: true,
          },
          {
            id: "algorithmic-techniques.randomization.las-vegas",
            name: "Las Vegas 算法",
            selectable: true,
          },
        ],
      },
      {
        id: "algorithmic-techniques.hashing",
        name: "哈希方法",
        selectable: true,
        children: [
          {
            id: "algorithmic-techniques.hashing.polynomial-rolling-hash",
            name: "多项式滚动哈希",
            selectable: true,
          },
        ],
      },
    ],
  },
  {
    id: "search",
    name: "搜索",
    description: "对状态空间进行系统遍历、回溯、剪枝或双向探索的方法。",
    selectable: false,
    children: [
      {
        id: "search.traversal",
        name: "遍历搜索",
        selectable: false,
        children: [
          {
            id: "search.traversal.depth-first-search",
            name: "深度优先搜索",
            selectable: true,
          },
          {
            id: "search.traversal.breadth-first-search",
            name: "广度优先搜索",
            selectable: true,
          },
          {
            id: "search.traversal.multi-source-bfs",
            name: "多源 BFS",
            selectable: true,
          },
        ],
      },
      {
        id: "search.backtracking",
        name: "回溯搜索",
        selectable: true,
        children: [
          {
            id: "search.backtracking.branch-and-bound",
            name: "分支定界",
            selectable: true,
          },
        ],
      },
      {
        id: "search.state-space",
        name: "状态空间搜索",
        selectable: true,
        children: [
          {
            id: "search.state-space.bidirectional-search",
            name: "双向搜索",
            selectable: true,
          },
          {
            id: "search.state-space.iterative-deepening",
            name: "迭代加深",
            selectable: true,
          },
          {
            id: "search.state-space.heuristic-search",
            name: "启发式搜索",
            selectable: true,
          },
        ],
      },
    ],
  },
  {
    id: "data-structure",
    name: "数据结构",
    description: "为更新、查询、合并、持久化和有序访问提供复杂度保证的数据组织方式。",
    selectable: false,
    children: [
      {
        id: "data-structure.heap",
        name: "堆与优先队列",
        selectable: true,
      },
      {
        id: "data-structure.disjoint-set-union",
        name: "并查集",
        selectable: true,
        children: [
          {
            id: "data-structure.disjoint-set-union.potential-dsu",
            name: "带权并查集",
            selectable: true,
          },
          {
            id: "data-structure.disjoint-set-union.rollback-dsu",
            name: "可撤销并查集",
            selectable: true,
          },
        ],
      },
      {
        id: "data-structure.range-query",
        name: "区间查询结构",
        selectable: false,
        children: [
          {
            id: "data-structure.range-query.fenwick-tree",
            name: "树状数组",
            selectable: true,
          },
          {
            id: "data-structure.range-query.segment-tree",
            name: "线段树",
            selectable: true,
          },
          {
            id: "data-structure.range-query.sparse-table",
            name: "稀疏表",
            selectable: true,
          },
          {
            id: "data-structure.range-query.square-root-decomposition",
            name: "分块",
            selectable: true,
          },
        ],
      },
      {
        id: "data-structure.balanced-search-tree",
        name: "平衡搜索树",
        selectable: true,
        children: [
          {
            id: "data-structure.balanced-search-tree.treap",
            name: "Treap",
            selectable: true,
          },
          {
            id: "data-structure.balanced-search-tree.splay-tree",
            name: "Splay Tree",
            selectable: true,
          },
        ],
      },
      {
        id: "data-structure.line-container",
        name: "直线容器",
        selectable: false,
        children: [
          {
            id: "data-structure.line-container.convex-hull-trick",
            name: "Convex Hull Trick",
            selectable: true,
          },
          {
            id: "data-structure.line-container.li-chao-tree",
            name: "Li Chao Tree",
            selectable: true,
          },
        ],
      },
      {
        id: "data-structure.trie",
        name: "Trie",
        selectable: true,
        children: [
          {
            id: "data-structure.trie.binary-trie",
            name: "01 Trie",
            selectable: true,
          },
        ],
      },
      {
        id: "data-structure.monotonic-structure",
        name: "单调结构",
        selectable: false,
        children: [
          {
            id: "data-structure.monotonic-structure.monotonic-stack",
            name: "单调栈",
            selectable: true,
          },
          {
            id: "data-structure.monotonic-structure.monotonic-queue",
            name: "单调队列",
            selectable: true,
          },
        ],
      },
      {
        id: "data-structure.persistent-data-structure",
        name: "可持久化数据结构",
        selectable: true,
        children: [
          {
            id: "data-structure.persistent-data-structure.persistent-segment-tree",
            name: "可持久化线段树",
            selectable: true,
          },
        ],
      },
      {
        id: "data-structure.hash-table",
        name: "哈希表",
        selectable: true,
      },
    ],
  },
  {
    id: "graph",
    name: "图论",
    description: "图模型上的连通性、路径、流、匹配和树结构算法。",
    selectable: false,
    children: [
      {
        id: "graph.connectivity",
        name: "连通性",
        selectable: true,
        children: [
          {
            id: "graph.connectivity.connected-components",
            name: "连通分量",
            selectable: true,
          },
          {
            id: "graph.connectivity.strongly-connected-components",
            name: "强连通分量",
            selectable: true,
          },
          {
            id: "graph.connectivity.articulation-points-and-bridges",
            name: "割点与桥",
            selectable: true,
          },
          {
            id: "graph.connectivity.biconnected-components",
            name: "双连通分量",
            selectable: true,
          },
        ],
      },
      {
        id: "graph.shortest-path",
        name: "最短路",
        selectable: true,
        children: [
          {
            id: "graph.shortest-path.dijkstra",
            name: "Dijkstra",
            selectable: true,
          },
          {
            id: "graph.shortest-path.bellman-ford",
            name: "Bellman–Ford",
            selectable: true,
          },
          {
            id: "graph.shortest-path.floyd-warshall",
            name: "Floyd–Warshall",
            selectable: true,
          },
          {
            id: "graph.shortest-path.zero-one-bfs",
            name: "0-1 BFS",
            selectable: true,
          },
        ],
      },
      {
        id: "graph.minimum-spanning-tree",
        name: "最小生成树",
        selectable: true,
        children: [
          {
            id: "graph.minimum-spanning-tree.kruskal",
            name: "Kruskal",
            selectable: true,
          },
          {
            id: "graph.minimum-spanning-tree.prim",
            name: "Prim",
            selectable: true,
          },
        ],
      },
      {
        id: "graph.directed-acyclic-graph",
        name: "有向无环图",
        selectable: true,
        children: [
          {
            id: "graph.directed-acyclic-graph.topological-sort",
            name: "拓扑排序",
            selectable: true,
          },
        ],
      },
      {
        id: "graph.eulerian-trail",
        name: "欧拉路与欧拉回路",
        selectable: true,
      },
      {
        id: "graph.network-flow",
        name: "网络流",
        selectable: true,
        children: [
          {
            id: "graph.network-flow.maximum-flow",
            name: "最大流",
            selectable: true,
          },
          {
            id: "graph.network-flow.minimum-cost-flow",
            name: "最小费用流",
            selectable: true,
          },
          {
            id: "graph.network-flow.circulation",
            name: "可行流与上下界流",
            selectable: true,
          },
        ],
      },
      {
        id: "graph.matching",
        name: "图匹配",
        selectable: true,
        children: [
          {
            id: "graph.matching.bipartite-matching",
            name: "二分图匹配",
            selectable: true,
          },
          {
            id: "graph.matching.weighted-bipartite-matching",
            name: "带权二分图匹配（KM / Hungarian）",
            selectable: true,
          },
          {
            id: "graph.matching.general-graph-matching",
            name: "一般图匹配（Blossom）",
            selectable: true,
          },
        ],
      },
      {
        id: "graph.tree",
        name: "树上算法",
        selectable: true,
        children: [
          {
            id: "graph.tree.lowest-common-ancestor",
            name: "最近公共祖先",
            selectable: true,
          },
          {
            id: "graph.tree.tree-diameter",
            name: "树的直径",
            selectable: true,
          },
          {
            id: "graph.tree.heavy-light-decomposition",
            name: "树链剖分",
            selectable: true,
          },
          {
            id: "graph.tree.centroid-decomposition",
            name: "点分治",
            selectable: true,
          },
          {
            id: "graph.tree.dsu-on-tree",
            name: "DSU on Tree",
            selectable: true,
          },
          {
            id: "graph.tree.virtual-tree",
            name: "虚树",
            selectable: true,
          },
        ],
      },
      {
        id: "graph.functional-graph",
        name: "函数图",
        selectable: true,
        children: [
          {
            id: "graph.functional-graph.cycle-decomposition",
            name: "环与基环结构分解",
            selectable: true,
          },
          {
            id: "graph.functional-graph.successor-query",
            name: "后继查询",
            selectable: true,
          },
        ],
      },
    ],
  },
  {
    id: "dynamic-programming",
    name: "动态规划",
    description: "通过状态、转移、边界与计算顺序复用重叠子问题的方法。",
    selectable: false,
    children: [
      {
        id: "dynamic-programming.linear",
        name: "线性 DP",
        selectable: true,
      },
      {
        id: "dynamic-programming.grid",
        name: "网格 DP",
        selectable: true,
      },
      {
        id: "dynamic-programming.knapsack",
        name: "背包 DP",
        selectable: true,
        children: [
          {
            id: "dynamic-programming.knapsack.zero-one-knapsack",
            name: "0/1 背包",
            selectable: true,
          },
          {
            id: "dynamic-programming.knapsack.unbounded-knapsack",
            name: "完全背包",
            selectable: true,
          },
          {
            id: "dynamic-programming.knapsack.bounded-knapsack",
            name: "多重背包",
            selectable: true,
          },
          {
            id: "dynamic-programming.knapsack.grouped-knapsack",
            name: "分组背包",
            selectable: true,
          },
        ],
      },
      {
        id: "dynamic-programming.sequence",
        name: "序列 DP",
        selectable: true,
        children: [
          {
            id: "dynamic-programming.sequence.longest-increasing-subsequence",
            name: "最长递增子序列",
            selectable: true,
          },
          {
            id: "dynamic-programming.sequence.longest-common-subsequence",
            name: "最长公共子序列",
            selectable: true,
          },
        ],
      },
      {
        id: "dynamic-programming.interval",
        name: "区间 DP",
        selectable: true,
      },
      {
        id: "dynamic-programming.tree",
        name: "树形 DP",
        selectable: true,
      },
      {
        id: "dynamic-programming.directed-acyclic-graph",
        name: "DAG DP",
        selectable: true,
      },
      {
        id: "dynamic-programming.digit",
        name: "数位 DP",
        selectable: true,
      },
      {
        id: "dynamic-programming.subset-state",
        name: "子集与轮廓 DP",
        selectable: true,
        children: [
          {
            id: "dynamic-programming.subset-state.subset-dp",
            name: "子集 DP",
            selectable: true,
          },
          {
            id: "dynamic-programming.subset-state.profile-dp",
            name: "轮廓线 DP",
            selectable: true,
          },
          {
            id: "dynamic-programming.subset-state.sum-over-subsets-dp",
            name: "SOS DP",
            selectable: true,
          },
        ],
      },
      {
        id: "dynamic-programming.expected-value",
        name: "期望 DP",
        selectable: true,
      },
      {
        id: "dynamic-programming.optimization",
        name: "DP 优化",
        selectable: true,
        children: [
          {
            id: "dynamic-programming.optimization.divide-and-conquer-optimization",
            name: "分治优化 DP",
            selectable: true,
          },
          {
            id: "dynamic-programming.optimization.knuth-optimization",
            name: "Knuth 优化",
            selectable: true,
          },
        ],
      },
    ],
  },
  {
    id: "greedy-constructive",
    name: "贪心、构造与不变量",
    description: "通过局部决策、显式构造或全程保持性质来获得解的方法。",
    selectable: false,
    children: [
      {
        id: "greedy-constructive.greedy",
        name: "贪心",
        selectable: true,
        children: [
          {
            id: "greedy-constructive.greedy.interval-greedy",
            name: "区间贪心",
            selectable: true,
          },
          {
            id: "greedy-constructive.greedy.scheduling-greedy",
            name: "调度贪心",
            selectable: true,
          },
          {
            id: "greedy-constructive.greedy.exchange-argument",
            name: "交换论证",
            selectable: true,
          },
        ],
      },
      {
        id: "greedy-constructive.constructive",
        name: "构造算法",
        selectable: true,
      },
      {
        id: "greedy-constructive.invariant",
        name: "不变量",
        selectable: true,
      },
    ],
  },
  {
    id: "math",
    name: "数学",
    description: "数论、组合、线性代数、卷积、概率、博弈和递推等竞赛数学知识。",
    selectable: false,
    children: [
      {
        id: "math.number-theory",
        name: "数论",
        selectable: true,
        children: [
          {
            id: "math.number-theory.greatest-common-divisor",
            name: "最大公约数",
            selectable: true,
          },
          {
            id: "math.number-theory.extended-euclidean-algorithm",
            name: "扩展欧几里得",
            selectable: true,
          },
          {
            id: "math.number-theory.modular-arithmetic",
            name: "模运算与模逆",
            selectable: true,
          },
          {
            id: "math.number-theory.prime-sieve",
            name: "素数筛",
            selectable: true,
          },
          {
            id: "math.number-theory.integer-factorization",
            name: "整数分解",
            selectable: true,
          },
          {
            id: "math.number-theory.euler-totient",
            name: "欧拉函数",
            selectable: true,
          },
          {
            id: "math.number-theory.chinese-remainder-theorem",
            name: "中国剩余定理",
            selectable: true,
          },
        ],
      },
      {
        id: "math.combinatorics",
        name: "组合数学",
        selectable: true,
        children: [
          {
            id: "math.combinatorics.binomial-coefficient",
            name: "组合数",
            selectable: true,
          },
          {
            id: "math.combinatorics.inclusion-exclusion",
            name: "容斥原理",
            selectable: true,
          },
          {
            id: "math.combinatorics.catalan-number",
            name: "Catalan 数",
            selectable: true,
          },
          {
            id: "math.combinatorics.burnside-lemma",
            name: "Burnside 引理",
            selectable: true,
          },
          {
            id: "math.combinatorics.generating-function",
            name: "生成函数",
            selectable: true,
          },
        ],
      },
      {
        id: "math.linear-algebra",
        name: "线性代数",
        selectable: true,
        children: [
          {
            id: "math.linear-algebra.gaussian-elimination",
            name: "高斯消元",
            selectable: true,
          },
          {
            id: "math.linear-algebra.matrix-exponentiation",
            name: "矩阵快速幂",
            selectable: true,
          },
        ],
      },
      {
        id: "math.convolution",
        name: "卷积与多项式变换",
        selectable: true,
        children: [
          {
            id: "math.convolution.fast-fourier-transform",
            name: "FFT",
            selectable: true,
          },
          {
            id: "math.convolution.number-theoretic-transform",
            name: "NTT",
            selectable: true,
          },
        ],
      },
      {
        id: "math.probability-expectation",
        name: "概率与期望",
        selectable: true,
        children: [
          {
            id: "math.probability-expectation.conditional-probability",
            name: "条件概率",
            selectable: true,
          },
          {
            id: "math.probability-expectation.linearity-of-expectation",
            name: "期望的线性性",
            selectable: true,
          },
        ],
      },
      {
        id: "math.game-theory",
        name: "组合博弈",
        selectable: true,
        children: [
          {
            id: "math.game-theory.nim",
            name: "Nim",
            selectable: true,
          },
          {
            id: "math.game-theory.sprague-grundy",
            name: "Sprague–Grundy 理论",
            selectable: true,
          },
        ],
      },
      {
        id: "math.recurrence",
        name: "递推与线性递推",
        selectable: true,
        children: [
          {
            id: "math.recurrence.linear-recurrence",
            name: "线性递推",
            selectable: true,
          },
          {
            id: "math.recurrence.berlekamp-massey",
            name: "Berlekamp–Massey",
            selectable: true,
          },
        ],
      },
    ],
  },
  {
    id: "bitwise",
    name: "位运算与状态表示",
    description: "利用二进制表示、集合掩码、异或代数和位变换的知识。",
    selectable: false,
    children: [
      {
        id: "bitwise.bit-manipulation",
        name: "位运算",
        selectable: true,
      },
      {
        id: "bitwise.state-compression",
        name: "状态压缩",
        selectable: true,
        children: [
          {
            id: "bitwise.state-compression.submask-enumeration",
            name: "子掩码枚举",
            selectable: true,
          },
        ],
      },
      {
        id: "bitwise.xor",
        name: "异或结构",
        selectable: true,
        children: [
          {
            id: "bitwise.xor.xor-linear-basis",
            name: "异或线性基",
            selectable: true,
          },
        ],
      },
      {
        id: "bitwise.transform",
        name: "子集变换",
        selectable: false,
        children: [
          {
            id: "bitwise.transform.subset-zeta-mobius-transform",
            name: "子集 Zeta / Möbius 变换",
            selectable: true,
          },
          {
            id: "bitwise.transform.fast-walsh-hadamard-transform",
            name: "FWT",
            selectable: true,
          },
        ],
      },
    ],
  },
  {
    id: "string",
    name: "字符串算法",
    description: "模式匹配、后缀结构、回文、周期和字典序等序列算法。",
    selectable: false,
    children: [
      {
        id: "string.pattern-matching",
        name: "模式匹配",
        selectable: true,
        children: [
          {
            id: "string.pattern-matching.prefix-function-kmp",
            name: "KMP / Prefix Function",
            selectable: true,
          },
          {
            id: "string.pattern-matching.z-function",
            name: "Z Function",
            selectable: true,
          },
          {
            id: "string.pattern-matching.aho-corasick",
            name: "Aho–Corasick 自动机",
            selectable: true,
          },
        ],
      },
      {
        id: "string.suffix-structure",
        name: "后缀结构",
        selectable: false,
        children: [
          {
            id: "string.suffix-structure.suffix-array",
            name: "后缀数组",
            selectable: true,
          },
          {
            id: "string.suffix-structure.suffix-automaton",
            name: "后缀自动机",
            selectable: true,
          },
        ],
      },
      {
        id: "string.palindrome",
        name: "回文结构",
        selectable: true,
        children: [
          {
            id: "string.palindrome.manacher",
            name: "Manacher",
            selectable: true,
          },
          {
            id: "string.palindrome.palindromic-tree",
            name: "回文自动机",
            selectable: true,
          },
        ],
      },
      {
        id: "string.periodicity",
        name: "周期与 Border",
        selectable: true,
        children: [
          {
            id: "string.periodicity.border-and-period",
            name: "Border 与周期分析",
            selectable: true,
          },
        ],
      },
      {
        id: "string.lexicographic",
        name: "字典序结构",
        selectable: true,
        children: [
          {
            id: "string.lexicographic.minimum-rotation",
            name: "最小表示法",
            selectable: true,
          },
        ],
      },
    ],
  },
  {
    id: "computational-geometry",
    name: "计算几何",
    description: "点、线、圆、多边形、凸性与距离问题中的鲁棒几何计算。",
    selectable: false,
    children: [
      {
        id: "computational-geometry.primitives",
        name: "几何基础运算",
        selectable: true,
        children: [
          {
            id: "computational-geometry.primitives.orientation-and-cross-product",
            name: "方向与叉积",
            selectable: true,
          },
          {
            id: "computational-geometry.primitives.line-segment-intersection",
            name: "线段相交",
            selectable: true,
          },
          {
            id: "computational-geometry.primitives.projection-and-distance",
            name: "投影与距离",
            selectable: true,
          },
        ],
      },
      {
        id: "computational-geometry.convex-geometry",
        name: "凸几何",
        selectable: true,
        children: [
          {
            id: "computational-geometry.convex-geometry.convex-hull",
            name: "凸包",
            selectable: true,
          },
          {
            id: "computational-geometry.convex-geometry.rotating-calipers",
            name: "旋转卡壳",
            selectable: true,
          },
          {
            id: "computational-geometry.convex-geometry.half-plane-intersection",
            name: "半平面交",
            selectable: true,
          },
        ],
      },
      {
        id: "computational-geometry.polygon",
        name: "多边形",
        selectable: true,
        children: [
          {
            id: "computational-geometry.polygon.polygon-area",
            name: "多边形面积",
            selectable: true,
          },
          {
            id: "computational-geometry.polygon.point-in-polygon",
            name: "点在多边形内",
            selectable: true,
          },
        ],
      },
      {
        id: "computational-geometry.circle",
        name: "圆",
        selectable: true,
        children: [
          {
            id: "computational-geometry.circle.circle-intersection",
            name: "圆的相交关系",
            selectable: true,
          },
          {
            id: "computational-geometry.circle.minimum-enclosing-circle",
            name: "最小覆盖圆",
            selectable: true,
          },
        ],
      },
      {
        id: "computational-geometry.distance",
        name: "平面距离问题",
        selectable: true,
        children: [
          {
            id: "computational-geometry.distance.closest-pair-of-points",
            name: "平面最近点对",
            selectable: true,
          },
        ],
      },
    ],
  },
] as const satisfies readonly KnowledgeNodeDefinition[];

export const knowledgeTaxonomy = defineKnowledgeTaxonomy(
  knowledgeTaxonomyDefinition,
);

export const knowledgeCatalog = createKnowledgeCatalog(knowledgeTaxonomy);

