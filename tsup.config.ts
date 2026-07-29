import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "react/index": "src/react/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  minify: true,
  external: ["lit", "react", "@lit/react"],
  target: "es2022",
  esbuildOptions(options) {
    options.keepNames = true;
  },
});
