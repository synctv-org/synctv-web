import { fileURLToPath, URL } from "node:url";

import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

const env = loadEnv("", process.cwd());

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8088",
        ws: true
      },
      "/oauth2": {
        target: "http://127.0.0.1:8088",
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
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      },
      mangle: true,
      toplevel: true
    },
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
});
