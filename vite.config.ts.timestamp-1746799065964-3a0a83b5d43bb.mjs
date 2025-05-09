// vite.config.ts
import legacy from "file:///C:/Users/windshine/Desktop/code/be-cash/node_modules/.pnpm/@vitejs+plugin-legacy@5.4.3_4ebc6e1a3dc06c9117e8e3cf08a74efa/node_modules/@vitejs/plugin-legacy/dist/index.mjs";
import vue from "file:///C:/Users/windshine/Desktop/code/be-cash/node_modules/.pnpm/@vitejs+plugin-vue@4.6.2_vi_d520db6b642bdb28322b602a4725b3c8/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///C:/Users/windshine/Desktop/code/be-cash/node_modules/.pnpm/@vitejs+plugin-vue-jsx@4.1._c34427b4b75f7b1632787ebe1f7eb86c/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import path from "path";
import { defineConfig } from "file:///C:/Users/windshine/Desktop/code/be-cash/node_modules/.pnpm/vite@5.2.14_@types+node@22._0f5767c13577da048925f9f7dc964960/node_modules/vite/dist/node/index.js";
import AutoImport from "file:///C:/Users/windshine/Desktop/code/be-cash/node_modules/.pnpm/unplugin-auto-import@0.18.6_rollup@4.28.0/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///C:/Users/windshine/Desktop/code/be-cash/node_modules/.pnpm/unplugin-vue-components@0.2_e95feb26c6a023c906916411173e66c1/node_modules/unplugin-vue-components/dist/vite.js";
var __vite_injected_original_dirname = "C:\\Users\\windshine\\Desktop\\code\\be-cash";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    legacy(),
    vueJsx(),
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
  },
  server: {
    port: 4060
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx3aW5kc2hpbmVcXFxcRGVza3RvcFxcXFxjb2RlXFxcXGJlLWNhc2hcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHdpbmRzaGluZVxcXFxEZXNrdG9wXFxcXGNvZGVcXFxcYmUtY2FzaFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvd2luZHNoaW5lL0Rlc2t0b3AvY29kZS9iZS1jYXNoL3ZpdGUuY29uZmlnLnRzXCI7Ly8vIDxyZWZlcmVuY2UgdHlwZXM9XCJ2aXRlc3RcIiAvPlxyXG5cclxuaW1wb3J0IGxlZ2FjeSBmcm9tICdAdml0ZWpzL3BsdWdpbi1sZWdhY3knXHJcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xyXG5pbXBvcnQgdnVlSnN4IGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZS1qc3gnXHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnXHJcbmltcG9ydCBDb21wb25lbnRzIGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3ZpdGUnXHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtcclxuICAgIHZ1ZSgpLFxyXG4gICAgbGVnYWN5KCksXHJcbiAgICB2dWVKc3goKSxcclxuICAgIEF1dG9JbXBvcnQoe1xyXG4gICAgICBpbXBvcnRzOiBbJ3Z1ZSddLCAvLyBcdTgxRUFcdTUyQThcdTVCRkNcdTUxNjV2dWVcdTZBMjFcdTU3NTdcdTRFMkRcdTc2ODRBUElcclxuICAgICAgZHRzOiAnc3JjL2F1dG8taW1wb3J0cy5kLnRzJywgLy8gXHU3NTFGXHU2MjEwXHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1XHU3Njg0XHU3QzdCXHU1NzhCXHU1OEYwXHU2NjBFXHU2NTg3XHU0RUY2XHJcbiAgICB9KSxcclxuICAgIENvbXBvbmVudHMoe1xyXG4gICAgICBkaXJzOiBbJ3NyYy9jb21wb25lbnRzJ10sIC8vIFx1ODFFQVx1NTJBOFx1NUJGQ1x1NTE2NVx1NzY4NFx1NzZFRVx1NUY1NVxyXG4gICAgICBkdHM6ICdzcmMvY29tcG9uZW50cy5kLnRzJywgLy8gXHU3NTFGXHU2MjEwXHU4MUVBXHU1MkE4XHU1QkZDXHU1MTY1XHU3QzdCXHU1NzhCXHU1OEYwXHU2NjBFXHU2NTg3XHU0RUY2XHJcbiAgICB9KSxcclxuICBdLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgdGVzdDoge1xyXG4gICAgZ2xvYmFsczogdHJ1ZSxcclxuICAgIGVudmlyb25tZW50OiAnanNkb20nXHJcbiAgfSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIHBvcnQ6IDQwNjAsXHJcbiAgfSxcclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUVBLE9BQU8sWUFBWTtBQUNuQixPQUFPLFNBQVM7QUFDaEIsT0FBTyxZQUFZO0FBQ25CLE9BQU8sVUFBVTtBQUNqQixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLGdCQUFnQjtBQUN2QixPQUFPLGdCQUFnQjtBQVJ2QixJQUFNLG1DQUFtQztBQVd6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUEsSUFDSixPQUFPO0FBQUEsSUFDUCxPQUFPO0FBQUEsSUFDUCxXQUFXO0FBQUEsTUFDVCxTQUFTLENBQUMsS0FBSztBQUFBO0FBQUEsTUFDZixLQUFLO0FBQUE7QUFBQSxJQUNQLENBQUM7QUFBQSxJQUNELFdBQVc7QUFBQSxNQUNULE1BQU0sQ0FBQyxnQkFBZ0I7QUFBQTtBQUFBLE1BQ3ZCLEtBQUs7QUFBQTtBQUFBLElBQ1AsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNKLFNBQVM7QUFBQSxJQUNULGFBQWE7QUFBQSxFQUNmO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
