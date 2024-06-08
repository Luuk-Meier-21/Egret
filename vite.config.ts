import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(async (env) => ({
  plugins: [react()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
    proxy: {
      "/tactile": `http://192.168.178.164:1420/windows/companion/index.html`,
      "/api/dummy-text": {
        target: "https://loripsum.net/api",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  rollupOptions: {
    input: {
      main: resolve(__dirname, "index.html"),
      nested: resolve(__dirname, "windows/prompt/index.html"),
      companion: resolve(__dirname, "windows/companion/index.html"),
    },
  },
}));
