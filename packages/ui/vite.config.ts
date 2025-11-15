import { resolve } from "node:path";

import { defineConfig } from "vite";

import react from "@vitejs/plugin-react";

const entry = resolve(__dirname, "src/index.ts");

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry,
      name: "SeoulMomentUI",
      formats: ["es", "cjs"],
      cssFileName: "styles",
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@radix-ui/react-slot",
        "@radix-ui/react-accordion",
        "@radix-ui/react-tabs",
        "@radix-ui/react-label",
        "@radix-ui/react-dialog",
      ],
      output: [
        {
          format: "es",
          entryFileNames: "index.js",
        },
        {
          format: "cjs",
          entryFileNames: "index.cjs",
          exports: "named",
        },
      ],
    },
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
