import { z } from "zod";

const dateOnlyPattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const millisecondsPerDay = 24 * 60 * 60 * 1000;

type DateParts = {
  year: number;
  month: number;
  day: number;
};

function parseDateParts(value: string): DateParts | null {
  if (!dateOnlyPattern.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day };
}

function toUtcDate(parts: DateParts): Date {
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(parts.year, parts.month - 1, parts.day);
  return date;
}

function toUtcTimestamp(value: DateOnly): number {
  const parts = parseDateParts(value);

  if (!parts) {
    throw new RangeError(`Invalid date-only value: ${value}`);
  }

  return toUtcDate(parts).getTime();
}

function formatUtcDate(date: Date): DateOnly {
  const year = date.getUTCFullYear().toString().padStart(4, "0");
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = date.getUTCDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}` as DateOnly;
}

export function isValidDateOnly(value: string): boolean {
  const parts = parseDateParts(value);

  if (!parts) {
    return false;
  }

  const date = toUtcDate(parts);
  return (
    date.getUTCFullYear() === parts.year &&
    date.getUTCMonth() === parts.month - 1 &&
    date.getUTCDate() === parts.day
  );
}

export const dateOnlySchema = z
  .string()
  .refine(isValidDateOnly, "Expected a valid date in YYYY-MM-DD format")
  .brand<"DateOnly">();

export type DateOnly = z.infer<typeof dateOnlySchema>;

export function addCalendarDays(date: DateOnly, days: number): DateOnly {
  if (!Number.isInteger(days)) {
    throw new TypeError("Calendar day offset must be an integer");
  }

  const result = new Date(toUtcTimestamp(date));
  result.setUTCDate(result.getUTCDate() + days);
  return formatUtcDate(result);
}

export function compareDateOnly(left: DateOnly, right: DateOnly): number {
  return Math.sign(toUtcTimestamp(left) - toUtcTimestamp(right));
}

export function differenceInCalendarDays(
  later: DateOnly,
  earlier: DateOnly,
): number {
  return (toUtcTimestamp(later) - toUtcTimestamp(earlier)) / millisecondsPerDay;
}
