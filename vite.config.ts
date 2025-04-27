import path from "node:path";
import fs from "fs/promises";

import { defineConfig, PluginOption } from "vite";
import tailwindcss from "@tailwindcss/vite";

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
          next();
          return;
        }

        if (relativePath === "template.html") {
          try {
            const template = await fs.readFile(path.resolve(__dirname, "dist/template.html"));
            res.writeHead(200, { "content-type": "text/html" });
            res.end(template);
            return;
          } catch {}
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

const root = path.resolve(__dirname, "pages");
const publicDir = path.resolve(__dirname, "public");

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
  plugins: [tailwindcss(), pluginStrictRoute(), pluginFixBrotliWasm()],
  root,
  publicDir,
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(root, "index.html"),
        preview: path.resolve(root, "preview/index.html"),
      },
    },
  },
  base: "./",
});
