import { dateOnlySchema, type DateOnly } from "./date-only";

export function toLocalDateOnly(date: Date): DateOnly {
  const year = date.getFullYear().toString().padStart(4, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return dateOnlySchema.parse(`${year}-${month}-${day}`);
}
