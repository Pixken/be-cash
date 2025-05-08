# BE-Cash - 个人记账应用

BE-Cash 是一款现代化的个人记账应用，帮助用户跟踪收入和支出，分析财务状况，实现财务目标。该应用使用 Vue 3、TypeScript 和 Ionic 框架构建，提供了流畅的跨平台体验。

## 功能特点

- **简洁的记账界面**：直观的用户界面，轻松记录日常收支
- **财务分析**：图表化展示收支情况，了解财务趋势
- **分类管理**：支持自定义收支分类，灵活管理财务数据
- **账单详情**：查看每笔交易的详细信息，包括金额、类别和日期
- **账单删除**：支持删除不需要的账单记录
- **多平台支持**：Web、iOS、Android 全平台适配
- **数据安全**：本地存储、数据加密，保障财务数据安全
- **用户账户**：支持账号注册与登录，数据云同步
- **AI 助手**：智能分析财务状况，提供个性化建议

## 技术栈

- Vue 3 + Composition API
- TypeScript
- Ionic Framework
- Vite (构建工具)
- Pinia (状态管理)
- Vue Router
- ECharts (图表可视化)
- Tailwind CSS
- Dayjs (日期处理)
- Cypress (E2E测试)

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
│   ├── api/            # API 接口
│   ├── assets/         # 项目资源文件
│   ├── components/     # 可复用组件
│   │   ├── common/     # 通用组件
│   │   └── ui/         # UI 组件
│   ├── composables/    # 组合式函数
│   ├── constants/      # 常量定义
│   ├── router/         # 路由配置
│   ├── store/          # Pinia 状态管理
│   ├── theme/          # 主题样式
│   ├── types/          # TypeScript 类型定义
│   ├── utils/          # 工具函数
│   ├── views/          # 页面组件
│   ├── App.vue         # 根组件
│   └── main.ts         # 应用入口
├── tests/              # 测试文件
│   ├── e2e/            # 端到端测试
│   └── unit/           # 单元测试
├── android/            # Android 平台代码
├── icons/              # 应用图标
├── index.html          # HTML 模板
└── package.json        # 项目配置
```

## 路由说明

- `/tabs/home` - 首页，显示账单列表和财务概览
- `/tabs/chart` - 统计分析，展示财务图表
- `/tabs/add-page` - 添加新交易记录
- `/tabs/account` - 账户管理
- `/tabs/user` - 用户设置
- `/login` - 用户登录
- `/register` - 用户注册
- `/notifications` - 通知中心

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

- **API 服务**：与后端 API 交互，获取和保存用户数据
- **Pinia Store**：前端状态管理，存储当前会话的数据
- **本地存储**：使用 localStorage 存储用户设置和认证信息
- **云同步**：通过用户账户系统实现多设备数据同步

## 核心功能实现

### 交易记录

交易记录存储在 Pinia store 中，包含以下字段：
- id: 唯一标识符
- amount: 金额
- type: 'INCOME' | 'EXPENSE'
- category: 分类
- account: 账户
- icon: 图标
- description: 描述
- transactionDate: 交易日期

### 图表分析

统计页面使用 ECharts 实现以下图表：
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
- 财务目标设置与跟踪

## 常见问题

### 数据如何备份？

目前数据存储在云端服务器中，通过用户账户系统进行同步。您也可以在设置页面中导出数据为JSON文件。

### 支持多账户吗？

当前版本支持单一用户下管理多个资金账户，如现金账户、银行卡等。

## 许可证

[MIT License](LICENSE)

## 联系方式

项目维护者：[Pixken](https://github.com/Pixken)

---

*BE-Cash - 简单、高效的个人财务管理工具*