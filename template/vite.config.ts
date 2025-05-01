import path from "node:path";
import fs from "node:fs/promises";

import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

import { parseStorySource } from "@elvishscout/mdstory";

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
          const storyBody = parseStorySource(source);
          const storyBodyJson = JSON.stringify(storyBody);
          const storyBodyHtml = storyBodyJson.replace(/[&<>'"]/g, (char) => `&#${char.charCodeAt(0)};`);
          return html.replace("{{story-body}}", storyBodyHtml);
        }
        return html;
      },
    },
  };
};

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../"),
    },
  },
  plugins: [react(), tailwindcss(), viteSingleFile(), pluginUseExample()],
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
