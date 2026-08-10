import { describe, expect, it } from "vitest";

import {
  addCalendarDays,
  dateOnlySchema,
  differenceInCalendarDays,
  isValidDateOnly,
} from "@/lib/date/date-only";
import { toLocalDateOnly } from "@/lib/date/local-date";

const date = (value: string) => dateOnlySchema.parse(value);

describe("date-only validation", () => {
  it("accepts real calendar dates including leap day", () => {
    expect(isValidDateOnly("2024-02-29")).toBe(true);
    expect(isValidDateOnly("2026-12-31")).toBe(true);
  });

  it("rejects invalid dates and non-canonical formats", () => {
    expect(isValidDateOnly("2025-02-29")).toBe(false);
    expect(isValidDateOnly("2026-04-31")).toBe(false);
    expect(isValidDateOnly("2026-8-10")).toBe(false);
  });
});

describe("date-only arithmetic", () => {
  it("crosses month, year, and leap-year boundaries", () => {
    expect(addCalendarDays(date("2026-01-31"), 1)).toBe("2026-02-01");
    expect(addCalendarDays(date("2026-12-31"), 1)).toBe("2027-01-01");
    expect(addCalendarDays(date("2024-02-28"), 1)).toBe("2024-02-29");
  });

  it("supports negative offsets without mutating the input", () => {
    const original = date("2026-03-01");

    expect(addCalendarDays(original, -1)).toBe("2026-02-28");
    expect(original).toBe("2026-03-01");
  });

  it("calculates calendar-day differences", () => {
    expect(
      differenceInCalendarDays(date("2026-08-13"), date("2026-08-10")),
    ).toBe(3);
  });

  it("rejects fractional offsets", () => {
    expect(() => addCalendarDays(date("2026-08-10"), 1.5)).toThrow(
      "Calendar day offset must be an integer",
    );
  });
});

describe("local date boundary", () => {
  it("formats the supplied local calendar date without using UTC fields", () => {
    expect(toLocalDateOnly(new Date(2026, 7, 10, 23, 30))).toBe("2026-08-10");
  });
});
