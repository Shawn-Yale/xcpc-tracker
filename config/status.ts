export const statusValues = ["A", "B", "C", "D"] as const;

export type Status = (typeof statusValues)[number];

export const statusMetadata: Record<
  Status,
  { label: string; meaning: string }
> = {
  A: { label: "A", meaning: "在训练时间内完全独立完成" },
  B: { label: "B", meaning: "基本独立完成，但用时较长或有轻微提示" },
  C: { label: "C", meaning: "理解题解后可以独立复现，尚未真正掌握" },
  D: { label: "D", meaning: "仍有明显知识、建模或实现缺口" },
};
