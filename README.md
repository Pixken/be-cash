# BE-Cash - 个人记账应用

BE-Cash 是一款现代化的个人记账应用，帮助用户跟踪收入和支出，分析财务状况，实现财务目标。该应用使用 Vue 3、TypeScript 和 Ionic 框架构建，提供了流畅的跨平台体验。

## 功能特点

- **简洁的记账界面**：直观的用户界面，轻松记录日常收支
- **财务分析**：图表化展示收支情况，了解财务趋势
- **分类管理**：支持自定义收支分类，灵活管理财务数据
- **多平台支持**：Web、iOS、Android 全平台适配
- **数据安全**：本地存储、数据加密，保障财务数据安全
- **用户账户**：支持账号注册与登录，数据云同步

## 技术栈

- Vue 3
- TypeScript
- Ionic Framework
- Vite (构建工具)
- Pinia (状态管理)
- Vue Router
- Cypress (E2E测试)
- Tailwind CSS

## 安装指南

### 前提条件

- Node.js (v14+)
- npm 或 pnpm

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/Pixken/be-cash.git
cd be-cash
```

2. 安装依赖
```bash
pnpm install
```

3. 启动开发服务器
```bash
pnpm dev
```

4. 构建生产版本
```bash
pnpm build
```

## 项目结构

```
be-cash/
├── public/             # 静态资源
├── src/                # 源代码目录
│   ├── components/     # 可复用组件
│   ├── router/         # 路由配置
│   ├── store/          # Pinia 状态管理
│   ├── types/          # TypeScript 类型定义
│   ├── views/          # 页面组件
│   ├── App.vue         # 根组件
│   └── main.ts         # 应用入口
├── assets/             # 项目资源文件
├── dist/               # 构建输出目录
├── android/            # Android 平台代码
├── tests/              # 测试文件
├── icons/              # 应用图标
├── index.html          # HTML 模板
└── package.json        # 项目配置
```

## 路由说明

- `/tabs/tab1` - 记账界面
- `/tabs/tab2` - 统计分析
- `/tabs/tab3` - 设置

## 开发指南

### 添加新功能

1. 创建新组件在 `src/components/` 目录
2. 如需新页面，在 `src/views/` 目录创建，并在 `router/index.ts` 添加路由
3. 需要新数据存储，在 `src/store/` 添加 Pinia store

### 编码规范

- 使用 TypeScript 类型
- 组件使用组合式 API (Composition API)
- 遵循 ESLint 配置的代码格式
- 应用 Tailwind CSS 样式类

## 移动端构建

### iOS

```bash
pnpm build
ionic capacitor add ios
ionic capacitor copy ios
```

然后使用 Xcode 打开 `ios/App/App.xcworkspace` 构建应用。

### Android

```bash
pnpm build
ionic capacitor add android
ionic capacitor copy android
```

使用 Android Studio 打开 `android` 目录构建应用。

## 数据存储

应用使用多种存储机制保存用户数据：

- **本地存储**：使用 localStorage 存储交易记录和设置
- **IndexedDB**：存储大型数据集和离线数据
- **云同步**：(计划中) 同步数据到云端，实现多设备访问

## 核心功能实现

### 交易记录

交易记录存储在 Pinia store 中，包含以下字段：
- id: 唯一标识符
- type: 'income' | 'expense'
- amount: 金额
- category: 分类
- note: 备注
- createdAt: 创建时间

### 图表分析

统计页面使用图表库实现以下图表：
- 收支分类饼图
- 月度收支柱状图
- 收支趋势折线图

## 部署

项目支持使用 Vercel 进行部署：

```bash
vercel
```

## 未来计划

- 预算管理功能
- 多货币支持
- 账单导出 (CSV/Excel)
- 离线模式增强
- 深色主题支持
- 数据备份与恢复功能

## 常见问题

### 数据如何备份？

目前数据存储在本地设备中，计划添加云备份功能。您可以在设置页面中导出数据为JSON文件。

### 支持多账户吗？

当前版本支持单一账户，多账户支持将在未来版本中推出。

## 许可证

[MIT License](LICENSE)

## 联系方式

项目维护者：[Pixken](https://github.com/Pixken)

---

*BE-Cash - 简单、高效的个人财务管理工具*