import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/integration/**/*.test.ts"],

    setupFiles: [
      "./tests/setup/integration.setup.ts",
    ],

    globals: true,

    testTimeout: 30_000,
  },
});