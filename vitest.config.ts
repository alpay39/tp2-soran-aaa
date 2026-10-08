import { defineConfig } from "vitest/config";

// Normalisation du nommage des tests — ticket INFRA-205.
// La convention du depot est *.spec.ts.
export default defineConfig({
  test: {
    include: ["test/**/*.spec.ts"],
    environment: "node",
    setupFiles: process.env.SALLES_COVERAGE_DIR ? ["test/coverage.ts"] : []
  }
});
