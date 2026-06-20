import path from "node:path";
import fs from "node:fs/promises";

import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

import { escapeHtml } from "./src/utils";

const pluginUseExample = (): PluginOption => {
  return {
    name: "plugin-use-example",
    transformIndexHtml: {
      order: "pre",
      async handler(html, context) {
        if (context.server) {
          const source = (await fs.readFile(path.resolve(__dirname, "example.md")))
            .toString()
            .replace(/\r\n|\r/g, "\n");
          return html.replace("<!-- __STORY_SOURCE__ -->", escapeHtml(source));
        }
        return html;
      },
    },
  };
};

export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile(), pluginUseExample()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "template.html"),
      },
    },
  },
  base: "./",
});
