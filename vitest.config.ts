import path from "node:path";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // server-only throws outside a React Server environment; tests import server modules directly.
      "server-only": path.resolve(__dirname, "tests/stubs/empty.ts"),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    // DB_* from .env.local for the MySQL integration tests (they skip when MySQL is not reachable).
    env: loadEnv(mode, process.cwd(), ""),
    fileParallelism: false,
  },
}));
