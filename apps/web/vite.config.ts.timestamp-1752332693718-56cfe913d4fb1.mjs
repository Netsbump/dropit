// vite.config.ts
import path from "path";
import { TanStackRouterVite } from "file:///home/nenets/Projects/dropit/node_modules/.pnpm/@tanstack+router-plugin@1.115.3_@tanstack+react-router@1.115.3_vite@5.4.18/node_modules/@tanstack/router-plugin/dist/esm/vite.js";
import viteReact from "file:///home/nenets/Projects/dropit/node_modules/.pnpm/@vitejs+plugin-react@4.3.4_vite@5.4.18/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { defineConfig } from "file:///home/nenets/Projects/dropit/node_modules/.pnpm/vite@5.4.18_@types+node@20.17.30/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname = "/home/nenets/Projects/dropit/apps/web";
var vite_config_default = defineConfig({
  plugins: [TanStackRouterVite(), viteReact()],
  server: {
    port: 5173
  },
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9uZW5ldHMvUHJvamVjdHMvZHJvcGl0L2FwcHMvd2ViXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9uZW5ldHMvUHJvamVjdHMvZHJvcGl0L2FwcHMvd2ViL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL25lbmV0cy9Qcm9qZWN0cy9kcm9waXQvYXBwcy93ZWIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IFRhblN0YWNrUm91dGVyVml0ZSB9IGZyb20gJ0B0YW5zdGFjay9yb3V0ZXItcGx1Z2luL3ZpdGUnO1xuaW1wb3J0IHZpdGVSZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1RhblN0YWNrUm91dGVyVml0ZSgpLCB2aXRlUmVhY3QoKV0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDUxNzMsXG4gIH0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcbiAgICB9LFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWlTLE9BQU8sVUFBVTtBQUNsVCxTQUFTLDBCQUEwQjtBQUNuQyxPQUFPLGVBQWU7QUFDdEIsU0FBUyxvQkFBb0I7QUFIN0IsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLG1CQUFtQixHQUFHLFVBQVUsQ0FBQztBQUFBLEVBQzNDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
