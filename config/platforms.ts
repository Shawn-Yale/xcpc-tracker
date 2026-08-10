export const platformValues = [
  "Codeforces",
  "AtCoder",
  "NowCoder",
  "Luogu",
  "ICPC",
  "CCPC",
  "Other",
] as const;

export type Platform = (typeof platformValues)[number];
