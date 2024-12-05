// vite.config.ts
import legacy from "file:///C:/Users/windshine/Desktop/code/ionic/be-cash/node_modules/.pnpm/@vitejs+plugin-legacy@5.4.3_terser@5.36.0_vite@5.2.14_@types+node@22.10.1_sass@1.82.0_terser@5.36.0_/node_modules/@vitejs/plugin-legacy/dist/index.mjs";
import vue from "file:///C:/Users/windshine/Desktop/code/ionic/be-cash/node_modules/.pnpm/@vitejs+plugin-vue@4.6.2_vite@5.2.14_@types+node@22.10.1_sass@1.82.0_terser@5.36.0__vue@3.5.13_typescript@5.7.2_/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import path from "path";
import { defineConfig } from "file:///C:/Users/windshine/Desktop/code/ionic/be-cash/node_modules/.pnpm/vite@5.2.14_@types+node@22.10.1_sass@1.82.0_terser@5.36.0/node_modules/vite/dist/node/index.js";
import AutoImport from "file:///C:/Users/windshine/Desktop/code/ionic/be-cash/node_modules/.pnpm/unplugin-auto-import@0.18.6_rollup@4.28.0/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///C:/Users/windshine/Desktop/code/ionic/be-cash/node_modules/.pnpm/unplugin-vue-components@0.27.5_@babel+parser@7.26.2_rollup@4.28.0_vue@3.5.13_typescript@5.7.2_/node_modules/unplugin-vue-components/dist/vite.js";
var __vite_injected_original_dirname = "C:\\Users\\windshine\\Desktop\\code\\ionic\\be-cash";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    legacy(),
    AutoImport({
      imports: ["vue"],
      // 自动导入vue模块中的API
      dts: "src/auto-imports.d.ts"
      // 生成自动导入的类型声明文件
    }),
    Components({
      dirs: ["src/components"],
      // 自动导入的目录
      dts: "src/components.d.ts"
      // 生成自动导入类型声明文件
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  test: {
    globals: true,
    environment: "jsdom"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx3aW5kc2hpbmVcXFxcRGVza3RvcFxcXFxjb2RlXFxcXGlvbmljXFxcXGJlLWNhc2hcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHdpbmRzaGluZVxcXFxEZXNrdG9wXFxcXGNvZGVcXFxcaW9uaWNcXFxcYmUtY2FzaFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvd2luZHNoaW5lL0Rlc2t0b3AvY29kZS9pb25pYy9iZS1jYXNoL3ZpdGUuY29uZmlnLnRzXCI7Ly8vIDxyZWZlcmVuY2UgdHlwZXM9XCJ2aXRlc3RcIiAvPlxuXG5pbXBvcnQgbGVnYWN5IGZyb20gJ0B2aXRlanMvcGx1Z2luLWxlZ2FjeSdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tICd1bnBsdWdpbi1hdXRvLWltcG9ydC92aXRlJ1xuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSdcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICB2dWUoKSxcbiAgICBsZWdhY3koKSxcbiAgICBBdXRvSW1wb3J0KHtcbiAgICAgIGltcG9ydHM6IFsndnVlJ10sIC8vIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NXZ1ZVx1NkEyMVx1NTc1N1x1NEUyRFx1NzY4NEFQSVxuICAgICAgZHRzOiAnc3JjL2F1dG8taW1wb3J0cy5kLnRzJywgLy8gXHU3NTFGXHU2MjEwXHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1XHU3Njg0XHU3QzdCXHU1NzhCXHU1OEYwXHU2NjBFXHU2NTg3XHU0RUY2XG4gICAgfSksXG4gICAgQ29tcG9uZW50cyh7XG4gICAgICBkaXJzOiBbJ3NyYy9jb21wb25lbnRzJ10sIC8vIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1NzY4NFx1NzZFRVx1NUY1NVxuICAgICAgZHRzOiAnc3JjL2NvbXBvbmVudHMuZC50cycsIC8vIFx1NzUxRlx1NjIxMFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1N0M3Qlx1NTc4Qlx1NThGMFx1NjYwRVx1NjU4N1x1NEVGNlxuICAgIH0pLFxuICBdLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXG4gICAgfSxcbiAgfSxcbiAgdGVzdDoge1xuICAgIGdsb2JhbHM6IHRydWUsXG4gICAgZW52aXJvbm1lbnQ6ICdqc2RvbSdcbiAgfVxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFFQSxPQUFPLFlBQVk7QUFDbkIsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sVUFBVTtBQUNqQixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLGdCQUFnQjtBQUN2QixPQUFPLGdCQUFnQjtBQVB2QixJQUFNLG1DQUFtQztBQVV6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUEsSUFDSixPQUFPO0FBQUEsSUFDUCxXQUFXO0FBQUEsTUFDVCxTQUFTLENBQUMsS0FBSztBQUFBO0FBQUEsTUFDZixLQUFLO0FBQUE7QUFBQSxJQUNQLENBQUM7QUFBQSxJQUNELFdBQVc7QUFBQSxNQUNULE1BQU0sQ0FBQyxnQkFBZ0I7QUFBQTtBQUFBLE1BQ3ZCLEtBQUs7QUFBQTtBQUFBLElBQ1AsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNKLFNBQVM7QUFBQSxJQUNULGFBQWE7QUFBQSxFQUNmO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
