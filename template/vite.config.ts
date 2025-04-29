import path from "node:path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../"),
    },
  },
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: {
    outDir: path.resolve(__dirname, "../dist"),
    emptyOutDir: false,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "template.html"),
      },
    },
  },
  base: "./",
});
