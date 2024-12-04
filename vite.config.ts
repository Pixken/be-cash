/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    legacy(),
    AutoImport({
      imports: ['vue'], // 自动导入vue模块中的API
      dts: 'src/auto-imports.d.ts', // 生成自动导入的类型声明文件
    }),
    Components({
      dirs: ['src/components'], // 自动导入的目录
      dts: 'src/components.d.ts', // 生成自动导入类型声明文件
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
