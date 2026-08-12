---
id: luogu-mco-2023-c
title: Two Pointers (hard version)
platform: Luogu
contest: MCO 2023
problem: C
url: https://www.luogu.com.cn/problem/P15292
rating: null
solvedAt: 2026-08-11
durationMinutes: 120
status: C
knowledge:
  - data-structure.range-query.fenwick-tree
  - data-structure.range-query.segment-tree
tags: []
nextReviewDate: 2026-08-14
reviewIntervalDays: 7
reviews: []
solutionLanguage: C++17
solutionCode: "#include <bits/stdc++.h>\r

  using namespace std;\r

  #define endl \"\\n\"\r

  #define int long long\r

  #define vi vector<int>\r

  #define pii pair<int, int>\r

  #define lowbit(x) ((x) & -(x))\r

  #define rep(i, a, b) for(int i = (a); i <= (b); i++)\r

  #define per(i, a, b) for(int i = (a); i >= (b); i--)\r

  const int N = 5e5 + 10, mod = 998244353, INF = 1e18;\r

  \r

  struct BIT{\r

  \    int n, tr[N];\r

  \    void init(int n){\r

  \        this -> n = n;\r

  \        rep(i, 1, n) tr[i] = 0;\r

  \    }\r

  \    void add(int x, int k = 1){\r

  \        for(int i = x; i <= n; i += lowbit(i)) tr[i] += k;\r

  \    }\r

  \    int sum(int x){\r

  \        int ans = 0;\r

  \        for(int i = x; i; i -= lowbit(i)) ans += tr[i];\r

  \        return ans;\r

  \    }\r

  \    int kth1(int k){ // 找第 k 个 1，默认初始化全 0\r

  \        int pos = 0;\r

  \        per(i, 20, 0){ // 20 可以替换成 log2(mx) 或 __lg(mx)\r

  \            int nxt = pos + (1ll << i);\r

  \            if(nxt <= n && tr[nxt] < k){\r

  \                pos = nxt;\r

  \                k -= tr[nxt];\r

  \            }\r

  \        }\r

  \        return pos + 1;\r

  \    }\r

  \    int kth0(int k){ // 找第 k 个 0，默认初始化全 0\r

  \        int pos = 0, cnt = 0;\r

  \        per(i, 20, 0){\r

  \            int nxt = pos + (1ll << i);\r

  \            if(nxt <= n && nxt - (cnt + tr[nxt]) < k){\r

  \                pos = nxt;\r

  \                cnt += tr[nxt];\r

  \            }\r

  \        }\r

  \        return pos + 1;\r

  \    }\r

  }row, col;\r

  \r

  void solve(){\r

  \tint cnt_row, cnt_col; cin >> cnt_row >> cnt_col;\r

  \trow.init(cnt_row), col.init(cnt_col);\r

  }\r

  \r

  signed main(){\r

  \    ios::sync_with_stdio(0), cin.tie(0), cout.tie(0);\r

  \    int T = 1;\r

  \    // cin >> T;\r

  \    while(T--) solve();\r

  \    return 0;\r

  }"
---
# 题意抽象



# 第一想法



# 正确思路



# 没想到的关键点



# 实现注意事项



# 做题感想

