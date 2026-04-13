# 项目上下文

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4

## 目录结构

```
├── public/                 # 静态资源
├── scripts/                # 构建与启动脚本
│   ├── build.sh            # 构建脚本
│   ├── dev.sh              # 开发环境启动脚本
│   ├── prepare.sh          # 预处理脚本
│   └── start.sh            # 生产环境启动脚本
├── src/
│   ├── app/                # 页面路由与布局
│   ├── components/ui/      # Shadcn UI 组件库
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/                # 工具库
│   │   └── utils.ts        # 通用工具函数 (cn)
│   └── server.ts           # 自定义服务端入口
├── next.config.ts          # Next.js 配置
├── package.json            # 项目依赖管理
└── tsconfig.json           # TypeScript 配置
```

- 项目文件（如 app 目录、pages 目录、components 等）默认初始化到 `src/` 目录下。

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。
**常用命令**：
- 安装依赖：`pnpm add <package>`
- 安装开发依赖：`pnpm add -D <package>`
- 安装所有依赖：`pnpm install`
- 移除依赖：`pnpm remove <package>`

## 开发规范

### Hydration 问题防范

1. 严禁在 JSX 渲染逻辑中直接使用 typeof window、Date.now()、Math.random() 等动态数据。**必须使用 'use client' 并配合 useEffect + useState 确保动态内容仅在客户端挂载后渲染**；同时严禁非法 HTML 嵌套（如 <p> 嵌套 <div>）。
2. **禁止使用 head 标签**，优先使用 metadata，详见文档：https://nextjs.org/docs/app/api-reference/functions/generate-metadata
   1. 三方 CSS、字体等资源可在 `globals.css` 中顶部通过 `@import` 引入或使用 next/font
   2. preload, preconnect, dns-prefetch 通过 ReactDOM 的 preload、preconnect、dns-prefetch 方法引入
   3. json-ld 可阅读 https://nextjs.org/docs/app/guides/json-ld

## UI 设计与组件规范 (UI & Styling Standards)

- 模板默认预装核心组件库 `shadcn/ui`，位于`src/components/ui/`目录下
- Next.js 项目**必须默认**采用 shadcn/ui 组件、风格和规范，**除非用户指定用其他的组件和规范。**

## 广告组件说明

### 组件位置
- 广告模板核心组件：`src/components/ad-template.tsx`
- 广告配置面板：`src/components/ad-template-config.tsx`
- 组件列表页面：`src/components/component-list.tsx`
- 组件选择页面：`src/app/components/create/page.tsx`
- 演示页面：`src/app/page.tsx`
- 类型定义：`src/lib/component-types.ts`

### 组件列表功能
- **用途**：管理和展示广告组件列表
- **功能特性**：
  - 表格展示：ID、组件预览、组件名称、组件分类、组件类型、关联模板数量、组件状态、编辑人、编辑时间、操作
  - 筛选功能：组件分类（静态类、动效类）、组件类型、组件状态
  - 搜索：支持按组件名称和ID搜索
  - 排序：支持按状态和时间排序
  - 批量操作：批量开启、批量暂停
  - 分页：智能分页组件
  - 操作菜单：编辑、开启/暂停、预览、删除

### 组件选择页面
- **路由**：`/components/create`
- **用途**：选择组件样式模板
- **功能特性**：
  - 静态组件：双按钮磁贴、投票磁贴、图片磁贴、电商磁贴、优惠券磁贴、推广卡片、游戏礼包码
  - 动效组件：红包雨、翻卡、翻红包、翻宝箱、宝箱雨、刮刮卡、砸蛋、弹窗(红包)
  - 分类筛选：全部/静态组件/动效组件
  - 组件卡片展示：图标、名称、描述、选择按钮
  - 步骤指示器：选择样式 → 填写内容

### 广告组件功能

#### AdTemplate（广告弹窗组件）
- **用途**：APP端广告弹窗展示
- **结构**：上文下按钮（主标题 + 副标题 + 双按钮）
- **主要特性**：
  - 支持双按钮配置
  - 按钮支持跳转落地页或显示图片
  - 支持输入模式和宏替换
  - 移动端优化的触摸交互
  - 圆角设计和渐变按钮
- **宏替换功能**：
  - 支持 `${变量名}` 格式的宏替换
  - 通过 `macroVariables` 字段传入变量映射
  - 支持按钮落地页链接、图片宏的动态替换

#### AdTemplateConfigPanel（配置面板）
- **用途**：广告模板的可视化配置界面
- **配置项**：
  - 基础配置：动作、主标题、副标题
  - 按钮1/2配置：文案、点击行为、落地页链接、图片上传
  - 默认落地页链接（全局配置）
  - 组件名称

### 组件使用示例

```typescript
import { AdTemplate, AdTemplateConfig } from "@/components/ad-template";

const config: AdTemplateConfig = {
  title: "限时特惠活动",
  subtitle: "新用户首单立减50元，更有超值礼包等你来拿",
  button1: {
    text: "立即领取",
    action: "jump",
    landingPageUrl: "https://example.com/claim",
  },
  button2: {
    text: "查看详情",
    action: "show_image",
    imageMacro: "${image_url}", // 图片宏模式
  },
  action: "open",
  defaultLandingPageUrl: "https://example.com/default",
  // 宏变量映射
  macroVariables: {
    image_url: "https://example.com/promotion.jpg",
  },
};

<AdTemplate
  config={config}
  isOpen={true}
  onClose={() => setIsOpen(false)}
  onButton1Click={(btn) => console.log("Button 1 clicked:", btn)}
  onButton2Click={(btn) => console.log("Button 2 clicked:", btn)}
/>
```
