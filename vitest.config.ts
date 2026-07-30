import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    exclude: ["src/**/*.browser.test.ts", "src/**/*.browser.test.tsx"],
    include: [
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "src/**/*.unit.test.ts",
      "src/**/*.unit.test.tsx",
    ],
  },
});
