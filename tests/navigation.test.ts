import { describe, expect, it } from "vitest";

import { navigationItems } from "../config/navigation";

describe("primary navigation", () => {
  it("contains each MVP top-level destination exactly once", () => {
    expect(navigationItems.map((item) => item.href)).toEqual([
      "/",
      "/problems",
      "/knowledge",
      "/status",
      "/review",
      "/statistics",
    ]);

    expect(new Set(navigationItems.map((item) => item.href)).size).toBe(
      navigationItems.length,
    );
  });
});
