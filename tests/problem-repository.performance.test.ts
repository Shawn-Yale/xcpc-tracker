import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";

import { expect, it } from "vitest";

import { ProblemRepository } from "@/lib/problems/repository";

const runPerformanceTest = process.env.XCPC_RUN_PERF === "1" ? it : it.skip;

runPerformanceTest(
  "loads 5000 Markdown problems in one repository scan",
  async () => {
    const directory = await mkdtemp(path.join(tmpdir(), "xcpc-tracker-perf-"));

    try {
      const batchSize = 250;

      for (let start = 0; start < 5000; start += batchSize) {
        await Promise.all(
          Array.from({ length: batchSize }, (_, offset) => {
            const index = start + offset;
            const id = `fixture-${index.toString().padStart(4, "0")}`;
            const source = `---\nid: ${id}\ntitle: Fixture ${index}\nplatform: Other\nsolvedAt: "2026-01-01"\nstatus: A\ncategories: []\ntags: []\nreviews: []\n---\nbody\n`;
            return writeFile(path.join(directory, `${id}.md`), source, "utf8");
          }),
        );
      }

      const startedAt = performance.now();
      const result = await new ProblemRepository(directory).loadAll();
      const elapsedMilliseconds = performance.now() - startedAt;

      expect(result.errors).toEqual([]);
      expect(result.problems).toHaveLength(5000);
      expect(elapsedMilliseconds).toBeLessThan(15_000);
      console.info(`Loaded 5000 problems in ${elapsedMilliseconds.toFixed(1)} ms`);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  },
  60_000,
);
