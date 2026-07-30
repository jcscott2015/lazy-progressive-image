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

  // DO NOT bundle React, but DO bundle Lit elements
  external: ["react"],
  noExternal: ["lit", "lit-html", "lit-element", "@lit/reactive-element"],

  target: "es2022",
  esbuildOptions(options) {
    options.keepNames = true;
  },
});
