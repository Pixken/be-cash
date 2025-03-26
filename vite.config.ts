/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'
import { defineConfig } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    legacy(),
    vueJsx(),
    AutoImport({
      imports: ['vue'], // 自动导入vue模块中的API
      dts: 'src/auto-imports.d.ts', // 生成自动导入的类型声明文件
    }),
    Components({
      dirs: ['src/components'], // 自动导入的目录
      dts: 'src/components.d.ts', // 生成自动导入类型声明文件
    }),
    VitePWA({ registerType: 'autoUpdate' }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom'
  },
})
