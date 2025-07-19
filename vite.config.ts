import path from "node:path";
import fs from "node:fs/promises";

import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA, VitePWAOptions } from "vite-plugin-pwa";

const ROOT = path.resolve(__dirname, "pages");
const ENV_DIR = path.resolve(__dirname);
const DIST_DIR = path.resolve(__dirname, "dist");
const PUBLIC_DIR = path.resolve(__dirname, "public");
const TEMPLATE_DIST_DIR = path.resolve(__dirname, "template/dist");

const fileExists = async (filename: string) => {
  try {
    await fs.stat(filename);
    return true;
  } catch {
    return false;
  }
};

const pluginStrictRoute = (): PluginOption => {
  return {
    name: "vite-strict-route",
    configureServer(server) {
      const { root, publicDir } = server.config;

      server.middlewares.use(async (req, res, next) => {
        const { pathname } = new URL(req.url ?? "/", `http://${req.headers.host}`);
        const relativePath = path.relative("/", pathname);

        if (
          relativePath.startsWith("@") ||
          (await fileExists(path.resolve(root, relativePath))) ||
          (await fileExists(path.resolve(publicDir, relativePath)))
        ) {
          return next();
        }

        if (relativePath === "template.html") {
          try {
            const template = await fs.readFile(path.resolve(TEMPLATE_DIST_DIR, "template.html"));
            res.writeHead(200, { "content-type": "text/html" });
            res.end(template);
            return;
          } catch {
            /* empty */
          }
        }

        res.writeHead(404, "file not found");
        res.end();
      });
    },
  };
};

const pluginFixBrotliWasm = (): PluginOption => {
  return {
    name: "vite-plugin-fix-brotli-wasm",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.endsWith("brotli_wasm_bg.wasm")) {
          const filePath = path.resolve(__dirname, "node_modules/brotli-wasm/pkg.web/brotli_wasm_bg.wasm");
          const fileContent = await fs.readFile(filePath);
          res.setHeader("Content-Type", "application/wasm");
          res.statusCode = 200;
          res.end(fileContent);
        } else {
          next();
        }
      });
    },
  };
};

const vitePwaConfig: Partial<VitePWAOptions> = {
  manifest: false,
  registerType: "autoUpdate",
  workbox: {
    cacheId: Date.now().toString(36),
    globPatterns: ["**/*.{js,wasm,css,html,png}"],
  },
};

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
  plugins: [react(), tailwindcss(), pluginStrictRoute(), pluginFixBrotliWasm(), VitePWA(vitePwaConfig)],
  root: ROOT,
  envDir: ENV_DIR,
  publicDir: PUBLIC_DIR,
  build: {
    outDir: DIST_DIR,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(ROOT, "index.html"),
        preview: path.resolve(ROOT, "preview/index.html"),
      },
      output: {
        manualChunks(id) {
          if (id.match(/node_modules\/@codemirror\/(view|state)(\/|$)/)) {
            return "cm-core";
          }
          if (id.match(/node_modules\/@codemirror(\/|$)/)) {
            return "cm-ext";
          }
          if (id.match(/node_modules\/react(-.*?)?(\/|$)/)) {
            return "react";
          }
          return null;
        },
      },
    },
  },
});
