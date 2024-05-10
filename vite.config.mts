import { fileURLToPath, URL } from "node:url";

import { defineConfig, loadEnv, type UserConfigFnObject, UserConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

const env = loadEnv("", process.cwd());

// https://vitejs.dev/config/
const config: UserConfigFnObject = ({ command, mode, ssrBuild }): UserConfig => {
  let c: UserConfig = {
    server: {
      host: true,
      proxy: {
        "/api": {
          target: env.VITE_SERVER_TARGET || "http://127.0.0.1:8088",
          changeOrigin: true,
          ws: true
        },
        "/oauth2": {
          target: env.VITE_SERVER_TARGET || "http://127.0.0.1:8088",
          changeOrigin: true,
          ws: false
        }
      }
    },
    plugins: [
      AutoImport({
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver()]
      }),
      vue()
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url))
      }
    },
    build: {
      cssCodeSplit: true,
      minify: "esbuild",
      cssMinify: "lightningcss",
      reportCompressedSize: false,
      assetsInlineLimit: 0 // 禁止内敛为base64
    },
    base: env.VITE_BASEURL,
    css: {
      lightningcss: {}
    },
    json: {
      stringify: true
    },
    envPrefix: "VITE_"
  };
  if (mode !== "development") {
    c.esbuild = {
      drop: ["console", "debugger"]
    };
  }
  return c;
};

export default defineConfig(config);
