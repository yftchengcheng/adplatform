# 项目文件目录与功能细项对应表

## 一、页面路由层 (`src/app/`)

| 文件路径 | 功能说明 |
|---------|---------|
| `app/page.tsx` | 首页 - 系统导航入口，包含组件管理和SDK模板两大模块入口 |
| `app/layout.tsx` | 根布局 - 全局HTML结构、字体加载、Providers包装 |
| `app/globals.css` | 全局样式 - Tailwind CSS、CSS变量、主题配置 |
| `app/robots.ts` | SEO - 搜索引擎爬虫配置 |
| `app/sdk/page.tsx` | SDK模板首页 - 展示7种广告位类型（开屏、视频开屏、半屏插屏、全屏插屏、Banner、原生、激励视频），支持搜索过滤 |
| `app/sdk/[type]/page.tsx` | SDK模板列表页 - 按广告位类型展示模板列表，支持预览、克隆、编辑、启停、删除 |
| `app/sdk/[type]/[id]/page.tsx` | SDK模板编辑页 - 编辑模板基础信息、组件关联配置、触发规则、流程图 |
| `app/sdk/templates/page.tsx` | SDK模板样式总览页 - 展示所有广告位样式的入口 |
| `app/components/create/page.tsx` | 组件创建页 - 选择15种组件类型创建新组件 |
| `app/components/config/page.tsx` | 组件配置页 - 编辑组件内容（标题、图片、按钮、落地页等），右侧手机预览 |
| `app/components/preview/page.tsx` | 组件预览页 - 全屏手机预览组件效果 |

---

## 二、API路由层 (`src/app/api/`)

| 文件路径 | 方法 | 功能说明 |
|---------|------|---------|
| `api/components/route.ts` | GET | 获取所有广告组件列表（10秒超时保护） |
| `api/fetch-url/route.ts` | POST | URL内容抓取 - 使用 coze-coding-dev-sdk 获取网页/PDF等内容 |
| `api/sdk/templates/route.ts` | GET | 获取SDK模板列表（按type过滤） |
| `api/sdk/templates/route.ts` | POST | 创建新SDK模板（含组件关联批量插入、启用数量计算） |
| `api/sdk/templates/[id]/route.ts` | GET | 获取单个SDK模板详情（含组件关联配置） |
| `api/sdk/templates/[id]/route.ts` | PUT | 更新SDK模板（含组件关联全量更新：先删后插） |
| `api/sdk/templates/[id]/route.ts` | DELETE | 删除SDK模板（同时清理关联组件） |

---

## 三、核心业务组件 (`src/components/`)

### 3.1 SDK模板管理

| 文件路径 | 行数 | 功能说明 |
|---------|------|---------|
| `sdk-template-list.tsx` | 570 | SDK模板列表 - 表格展示（模板ID、名称、广告位ID、状态、规格、预览、关联组件、创建人、时间），操作下拉菜单（预览/克隆/编辑/暂停/删除），全屏交互预览 |
| `sdk-template-edit.tsx` | 1410 | SDK模板编辑 - 左侧流程图（节点拖拽、连线）、右侧配置面板（基础信息、组件关联列表、触发规则、添加/删除关联），组件图标映射表 |
| `sdk-templates-showcase.tsx` | 834 | SDK模板样式卡片 - 展示7种广告位类型的预览图、描述、标签 |

### 3.2 全屏交互预览

| 文件路径 | 行数 | 功能说明 |
|---------|------|---------|
| `interaction-preview.tsx` | 973 | 全屏交互预览 - 手机框架模拟，支持链式触发（主素材→组件→子组件），15种组件真实渲染，重置/关闭/状态栏，enabledLinksRef避免闭包陈旧，linksSignature异步重启 |
| `ad-interaction-preview.tsx` | ~200 | 广告交互预览 - 组件关联配置展示，缩放控制 |

### 3.3 广告素材组件

| 文件路径 | 行数 | 功能说明 |
|---------|------|---------|
| `real-ad-preview.tsx` | 642 | 广告素材真实预览 - 7种广告位类型（开屏静态图/视频、半屏/全屏插屏、Banner、原生、激励视频），倒计时关闭，落地页跳转 |
| `ad-template.tsx` | ~120 | 广告模板渲染 - 关闭按钮、倒计时、落地页跳转 |
| `ad-template-config.tsx` | 823 | 广告模板配置 - 图片/视频上传、落地页URL、宏变量模式切换 |

### 3.4 组件管理

| 文件路径 | 行数 | 功能说明 |
|---------|------|---------|
| `component-list.tsx` | 904 | 组件列表 - 卡片网格展示（15种组件），全屏预览弹窗，搜索过滤，启停/删除操作，手机框架内居中展示 |

---

## 四、15种组件模板（渲染 + 配置）

### 4.1 静态类组件（7种）

| 组件类型 | 渲染文件 | 配置文件 | 功能说明 |
|---------|---------|---------|---------|
| 双按钮 `dual_button` | `ad-template.tsx` | `ad-template-config.tsx` | 主标题+副标题+双按钮，点击跳转落地页或显示图片 |
| 投票 `vote` | `vote-template.tsx` | `vote-template-config.tsx` | 投票选项条（75%/25%固定比例），点击跳转/弹图预览 |
| 图片磁贴 `image` | `image-template.tsx` | `image-template-config.tsx` | 单图/多图轮播（最多3张），自动轮播3秒，落地页配置 |
| 电商 `ecommerce` | `ecommerce-template.tsx` | `ecommerce-template-config.tsx` | 左图右文（174×174px商品图），按钮文案（立即下单/购买/下载） |
| 优惠券 `coupon` | `coupon-template.tsx` | `coupon-template-config.tsx` | 上下结构（活动名+红色主体），优惠信息+条件+有效期 |
| 推广卡片 `promotion_card` | `promotion-template.tsx` | `promotion-template-config.tsx` | 左图标右文+卖点轮播（最多10条），行动号召按钮 |
| 游戏礼包码 `game_gift` | `game-gift-template.tsx` | `game-gift-template-config.tsx` | 左图右文（应用图片轮播+应用名+描述+包名+礼包码），下载按钮 |

### 4.2 交互类组件（8种）

| 组件类型 | 渲染文件 | 配置文件 | 功能说明 |
|---------|---------|---------|---------|
| 红包雨 `redpacket_rain` | `redpacket-rain-template.tsx` | `redpacket-rain-template-config.tsx` | 15个红包三条线飘落动画，点击触发领取场景（现金/自定义奖励），深红渐变背景 |
| 翻卡 `flip_card` | `flip-card-template.tsx` | `flip-card-template-config.tsx` | 卡片翻转动画（3D CSS），正面引导→反面展示，落地页跳转 |
| 翻红包 `flip_redpacket` | `flip-redpacket-template.tsx` | `flip-redpacket-template-config.tsx` | 红包翻转动画，引导手势→展示金额/奖励，落地页跳转 |
| 翻宝箱 `flip_treasure` | `treasurebox-template.tsx` | `treasurebox-template-config.tsx` | 宝箱翻转动画，引导→展示奖励内容，落地页跳转 |
| 宝箱雨 `treasure_rain` | `treasurebox-rain-template.tsx` | `treasurebox-rain-template-config.tsx` | 元宝飘落动画+倒计时，点击元宝触发领取场景，金色渐变 |
| 砸金蛋 `smash_egg` | `smash-egg-template.tsx` | `smash-egg-template-config.tsx` | 砸锤动画+蛋碎裂特效，点击触发奖励展示 |
| 刮刮卡 `scratch_card` | `scratch-card-template.tsx` | `scratch-card-template-config.tsx` | Canvas刮除遮罩动画，刮开比例达标后展示奖励 |
| 弹窗红包 `popup_redpacket` | `popup-redpacket-template.tsx` | `popup-redpacket-config.tsx` | 弹窗式红包，展示金额/奖励，一键领取按钮 |

---

## 五、UI组件库 (`src/components/ui/`)

共 56 个 shadcn/ui 基础组件（6199行），主要包括：

| 组件 | 用途 |
|------|------|
| `button.tsx` | 按钮组件（主按钮/次按钮/危险按钮/图标按钮） |
| `input.tsx` | 输入框组件 |
| `select.tsx` | 下拉选择组件 |
| `dialog.tsx` | 模态弹窗组件 |
| `dropdown-menu.tsx` | 下拉菜单组件（模板列表操作菜单） |
| `tooltip.tsx` | 提示浮层组件（模板ID/广告位ID悬停提示） |
| `tabs.tsx` | 标签页组件 |
| `switch.tsx` | 开关组件 |
| `badge.tsx` | 标签组件 |
| `card.tsx` | 卡片组件 |
| `carousel.tsx` | 轮播组件 |
| `skeleton.tsx` | 骨架屏组件 |
| `sonner.tsx` | Toast通知组件 |
| `scroll-area.tsx` | 滚动区域组件 |
| `sheet.tsx` | 侧边抽屉组件 |
| `separator.tsx` | 分隔线组件 |
| 其余39个 | 手风琴/头像/面包屑/日历/复选框/命令面板/右键菜单/表单/悬浮卡/标签/菜单栏/导航/分页/气泡/进度条/单选/可调整大小/滑块/表格/文本域/开关组/切换组/空状态/输入组/OTP输入/字段/快捷键/项/加载中/手风琴折叠等 |

---

## 六、数据层 (`src/storage/`, `src/contexts/`, `src/lib/`)

| 文件路径 | 功能说明 |
|---------|---------|
| `storage/database/supabase-client.ts` | Supabase客户端 - 服务端API Routes使用，自动读取环境变量 |
| `storage/database/supabase-client-browser.ts` | Supabase客户端 - 浏览器端组件使用 |
| `storage/database/supabase-server.ts` | Supabase客户端 - Server Component使用 |
| `storage/database/shared/schema.ts` | 数据库Schema - healthCheck、sdkTemplates、sdkTemplateComponents、adComponents表定义 |
| `storage/database/shared/relations.ts` | 表关联关系 - sdkTemplateComponents→sdkTemplates、sdkTemplateComponents→adComponents |
| `contexts/component-context.tsx` | 组件上下文 - 全局组件列表状态管理，useComponents Hook，组件增删改查 |
| `lib/component-types.ts` | 组件类型定义 - ComponentCategory、ComponentType枚举，15种组件图标映射(iconMap)，组件模板配置 |
| `lib/utils.ts` | 工具函数 - cn()样式合并、通用工具 |
| `hooks/use-mobile.ts` | 响应式Hook - 检测是否移动端（768px断点） |

---

## 七、数据库表结构

| 表名 | 功能 | 关键字段 |
|------|------|---------|
| `sdk_templates` | SDK模板 | id, name, type, ad_slot, status, width, height, format, created_by |
| `sdk_template_components` | 模板-组件关联 | template_id, component_id, component_type_key, component_config, trigger_rule, trigger_time, parent_id, status |
| `ad_components` | 广告组件 | id, name, type, status, config, created_by |

---

## 八、静态资源 (`public/`)

| 资源 | 用途 |
|------|------|
| `static-splash.png` | 开屏静态广告预览图 |
| `video-splash.mp4` | 视频开屏广告预览视频 |
| `interstitial-half.png` | 半屏插屏预览图 |
| `interstitial-full.png` | 全屏插屏预览图 |
| `banner.png` | Banner广告预览图 |
| `native.png` | 原生广告预览图 |
| `reward-page.png` | 激励视频奖励页预览图 |
| `redbag-bg.png` | 红包背景图 |
| `flip-redpacket-*.png` | 翻红包引导/展示/手势图 |
| `treasurebox-*.png` | 宝箱关闭/手势图 |
| `smash-*.png/jpg` | 砸金蛋相关图（锤子/蛋/碎裂/云朵） |
| `scratch-card-*.png` | 刮刮卡内层/页面/奖励页图 |
| `egg-*.png` | 金蛋开/摇状态图 |
| `yuanbao1~6.png` | 元宝图片（宝箱雨飘落用） |
| `hammer.png` | 锤子图标 |
| `card-default.png` / `card-item.png` | 卡片默认/选项图 |
| `doc-*.png/jpg` | 文档配图 |
| `doc-images/` | 文档图片目录 |
| `doc-ecom-images/` | 电商文档图片目录 |
| `treasurebox-rain-colors.json` | 宝箱雨颜色配置 |

---

## 九、配置文件

| 文件路径 | 功能说明 |
|---------|---------|
| `package.json` | 项目依赖与脚本配置 |
| `tsconfig.json` | TypeScript编译配置 |
| `next.config.ts` | Next.js框架配置 |
| `tailwind.config.ts` | Tailwind CSS配置 |
| `postcss.config.mjs` | PostCSS配置 |
| `.coze` | Coze CLI构建与运行配置 |
| `next-env.d.ts` | Next.js类型声明 |
