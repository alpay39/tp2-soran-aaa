import { afterAll } from "vitest";
import { Session } from "node:inspector";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

const directory = process.env.SALLES_COVERAGE_DIR;
if (directory) {
  const session = new Session();
  session.connect();
  session.post("Profiler.enable");
  session.post("Profiler.startPreciseCoverage", { callCount: true, detailed: true });
  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      session.post("Profiler.takePreciseCoverage", (error, result) => {
        if (error) { reject(error); return; }
        mkdirSync(directory, { recursive: true });
        writeFileSync(join(directory, `${randomUUID()}.json`), JSON.stringify(result));
        resolve();
      });
    });
    session.post("Profiler.stopPreciseCoverage");
    session.disconnect();
  });
}
