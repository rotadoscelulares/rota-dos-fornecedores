import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Admin panel (React + Ant Design) for Rota dos Celulares 66.
// Built as a static bundle served by the existing Express backend at /admin.
export default defineConfig({
  base: "/admin/",
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      // Backend Express server (server/server.js) running on 5566.
      "/api": {
        target: "http://localhost:5566",
        changeOrigin: true,
      },
    },
  },
});
