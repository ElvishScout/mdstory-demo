import path from "node:path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const root = path.resolve(__dirname, "pages");
const envDir = path.resolve(__dirname);
const publicDir = path.resolve(__dirname, "public");

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
  plugins: [react(), tailwindcss()],
  root,
  envDir,
  publicDir,
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.match(/\/@codemirror\/(view|state)(\/|$)/)) {
            return "codemirror-core";
          }
          if (id.match(/\/@codemirror(\/|$)/)) {
            return "codemirror-ext";
          }
          if (id.match(/\/(react|react-dom)(\/|$)/)) {
            return "react";
          }
          if (id.match(/\/markdown-it(-.*?)?(\/|$)/)) {
            return "markdown-it";
          }
          if (id.match(/\/mdstory(\/|$)/)) {
            return "mdstory";
          }
          return null;
        },
      },
    },
  },
  base: "./",
});
