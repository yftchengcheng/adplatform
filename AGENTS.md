# 组件设计规范记忆库

## 一、UI 组件库

### 1. ModeToggle（模式切换组件）

**用途**：在"输入模式"和"宏模式"之间切换

**设计样式**：
```tsx
<div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
  <button className="px-3 py-1 text-xs font-medium rounded-md transition-all">
    {/* 选中：bg-white shadow-sm text-gray-900 */}
    {/* 未选中：text-gray-500 hover:text-gray-700 */}
  </button>
</div>
```

**校验规则**：
- 无特殊校验
- 切换时清空另一模式的值

---

### 2. CharCounter（字符计数器）

**用途**：显示当前字符数/最大字符数

**设计样式**：
```tsx
<span className="text-xs {isOverLimit ? 'text-red-500' : 'text-gray-400'}">
  {current}/{max}
</span>
```

**校验规则**：
- 超出限制时显示红色 `text-red-500`
- 通常搭配 Input 的 `maxLength` 属性使用

---

### 3. ImageUpload（图片上传组件）

**用途**：图片上传、预览、删除

**设计样式**：
```tsx
// 容器
<div className="border-2 border-dashed border-gray-200 rounded-lg overflow-hidden">
  // 上传区域
  <label className="flex flex-col items-center justify-center py-8 cursor-pointer hover:bg-gray-50">
    <Plus className="w-10 h-10 rounded-full bg-gray-100" />
    <span className="text-sm text-gray-500">点击上传图片</span>
    <span className="text-xs text-gray-400">推荐 300×150px，最大 2MB</span>
  </label>
  // 预览区域（hover显示操作按钮）
  <div className="relative group">
    <Image />
    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100">
      <button>重新上传</button>
      <button>删除</button>
    </div>
  </div>
</div>
```

**校验规则**：
| 校验项 | 规则 | 错误提示 |
|--------|------|---------|
| 文件类型 | `file.type.startsWith("image/")` | "请上传图片文件（支持 JPG、PNG、GIF、WebP 等格式）" |
| 文件大小 | `file.size <= maxSize * 1024 * 1024` | "图片大小不能超过 {maxSize}MB，当前文件 {实际大小}MB" |
| 删除确认 | 无确认弹窗，直接删除 | - |

**状态管理**：
- `previewUrl`: string - 当前预览图片
- `isUploading`: boolean - 上传中状态
- `error`: string - 错误信息

---

### 4. SectionCollapse（可折叠区块）

**用途**：配置面板中的可折叠分组

**设计样式**：
```tsx
<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <button className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50">
    <span className="text-sm font-medium text-gray-700">标题</span>
    <ChevronDown/ChevronRight className="w-4 h-4 text-gray-400" />
  </button>
  {isOpen && <div className="px-4 pb-4">内容</div>}
</div>
```

---

### 5. VoteOptionEditor（投票选项编辑器）

**用途**：编辑单个投票选项

**设计样式**：
```tsx
<div className="border border-gray-200 rounded-lg bg-white p-4">
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">选项 {index}</span>
      <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 rounded">
        {fixedPercentage}%
      </span>
    </div>
  </div>
  {/* 按钮文本 */}
</div>
```

---

### 6. StepIndicator（步骤指示器）

**用途**：显示当前步骤

**设计样式**：
```tsx
<div className="flex items-center gap-2 text-xs">
  <div className="flex items-center gap-1">
    <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">1</span>
    <span className="text-gray-600">选择样式</span>
    <ChevronRight className="w-3 h-3 text-gray-400" />
  </div>
  <div className="flex items-center gap-1">
    <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">2</span>
    <span className="text-blue-600 font-medium">填写内容</span>
  </div>
</div>
```

---

## 二、表单输入规范

### 1. 字符计数规则（重要）

**字符计算规则**：
- **中文**：每个汉字占 2 个字符
- **英文/数字/符号**：每个占 1 个字符

**实现函数**：
```typescript
// 计算字符串的显示宽度
export function getStringWidth(str: string): number {
  let width = 0;
  for (const char of str) {
    // 判断是否是中文字符
    if (/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(char)) {
      width += 2;
    } else {
      width += 1;
    }
  }
  return width;
}
```

**超出限制提示**：
```tsx
<p className="text-xs text-gray-400 text-right">
  {getStringWidth(value)}/{max}字符
  {isOverWidth(value, max) && <span className="text-red-500 ml-1">（超出限制）</span>}
</p>
```

### 2. 文本输入框 (Input)

| 场景 | 最大长度 | 提示文字 |
|------|---------|---------|
| 主标题 | 24字符 | "请输入主标题" |
| 副标题 | 60字符 | "请输入副标题" |
| 按钮文本 | 16字符 | "请输入按钮文本" |
| 选项文本 | 20字符 | "请输入选项文本" |
| 组件名称 | 20字符 | "请输入组件名称" |
| 落地页链接 | 无限制 | "请输入落地页链接" |
| 宏变量 | 无限制 | "如 ${variable_name}" |

### 2. 下拉选择 (Select)

| 场景 | 选项 |
|------|------|
| 点击后动作 | 跳转落地页 / 显示图片 |
| 图片设置 | 上传图片 / 图片宏 |
| 输入模式/宏模式 | 输入模式 / 宏模式 |

### 3. 数字输入

| 场景 | 范围 | 说明 |
|------|------|------|
| 投票数 | >= 0 | 后台实时统计，不在前端输入 |

---

## 三、按钮样式规范

### 1. 主按钮
```tsx
<button className="h-10 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600">
  保存
</button>
```

### 2. 次按钮
```tsx
<button className="h-10 px-4 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50">
  取消
</button>
```

### 3. 危险按钮
```tsx
<button className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-red-500 hover:bg-red-50">
  删除
</button>
```

---

## 四、弹窗组件规范

### 1. 模态弹窗结构
```tsx
<>
  {/* Backdrop */}
  <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} />

  {/* Modal */}
  <div className="fixed left-1/2 top-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 -translate-y-1/2">
    <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Close Button */}
      <button className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200">
        <X className="w-4 h-4 text-gray-500" />
      </button>
      {/* Content */}
      <div className="px-5 pt-6 pb-4">
        {children}
      </div>
    </div>
  </div>
</>
```

---

## 五、配置面板布局规范

### 1. 整体结构
```
┌─────────────────────────────────────┐
│ Header: 图标 + 标题                  │
├─────────────────────────────────────┤
│ Step Indicator: 步骤1 / 步骤2        │
├─────────────────────────────────────┤
│                                     │
│  Form Content (可滚动)               │
│  ┌─────────────────────────────┐   │
│  │ Section: 基础配置            │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ Section: 投票选项配置        │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ Section: 落地页配置          │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│ Footer: 取消 | 上一步 | 保存         │
└─────────────────────────────────────┘
```

### 2. Section 样式
```tsx
<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
  <button className="...">标题 + ChevronDown</button>
  {isOpen && <div className="px-4 pb-4 space-y-4">
    {/* 表单项 */}
  </div>}
</div>
```

---

## 六、投票磁贴特殊规范

### 1. 选项数据结构
```typescript
interface VoteOption {
  id: string;
  buttonText: string;      // 按钮文本（最多16字符）
}
```

### 2. 固定百分比
```typescript
// 固定百分比（选项1为75%，选项2为25%）
const getFixedPercentage = (index: number): number => {
  return index === 0 ? 75 : 25;
};
```

### 3. 投票选项条样式
```tsx
<button className="relative w-full h-14 rounded-xl border-2 overflow-hidden">
  {/* 进度条 */}
  <div className="absolute inset-y-0 left-0 bg-blue-200" style={{ width: `${percentage}%` }} />
  {/* 内容 */}
  <div className="relative flex items-center justify-between h-full px-4">
    <span>{buttonText}</span>
    <span>{percentage}%</span>
  </div>
</button>
```

### 4. 交互逻辑（与选择磁贴一致）

#### 动作类型处理
| 动作类型 | 行为 |
|----------|------|
| `jump` | 点击选项后直接跳转落地页 |
| `show_image` | 点击选项后弹出图片预览，点击图片跳转落地页 |

#### 交互流程
1. 用户点击投票选项
2. 立即执行动作：
   - `jump` → 直接打开落地页链接
   - `show_image` → 弹出图片预览弹窗
3. 点击图片 → 打开落地页链接

#### 图片预览弹窗（与选择磁贴一致）
```tsx
{showImageModal && (
  <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4" onClick={closeImageModal}>
    <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
      <img src={currentImage} alt="内容图片" className="max-w-full max-h-[80vh] object-contain rounded-lg cursor-pointer" onClick={handleImageClick} />
      <p className="text-white/70 text-center text-xs mt-2">点击图片跳转落地页</p>
      <button onClick={closeImageModal} className="absolute -top-10 right-0 w-8 h-8 ..."><X /></button>
    </div>
  </div>
)}
```

#### 宏变量替换（与选择磁贴一致）
```typescript
const resolveMacro = (macro: string): string => {
  if (!macro || !macroVariables) return macro;
  let result = macro;
  Object.entries(macroVariables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
    result = result.replace(new RegExp(`\\$${key}`, 'g'), value);
  });
  return result;
};
```

---

## 七、校验错误显示规范

### 1. 错误提示样式
```tsx
<div className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
  {errorMessage}
</div>
```

### 2. 错误边框
```tsx
<div className={cn(
  "border-2 border-dashed rounded-lg",
  hasError ? "border-red-300" : "border-gray-200"
)}>
  {/* 内容 */}
</div>
```

---

## 八、颜色使用规范

| 用途 | 颜色 | Tailwind |
|------|------|----------|
| 主色 | 蓝色 | `blue-500` / `blue-600` |
| 危险 | 红色 | `red-500` |
| 警告 | 橙色 | `orange-500` |
| 成功 | 绿色 | `green-500` |
| 文字-主要 | 灰色-900 | `text-gray-900` |
| 文字-次要 | 灰色-500 | `text-gray-500` |
| 文字-提示 | 灰色-400 | `text-gray-400` |
| 背景-卡片 | 白色 | `bg-white` |
| 背景-页面 | 灰色-50 | `bg-gray-50` |
| 边框 | 灰色-200 | `border-gray-200` |

---

## 九、间距规范

| 场景 | 间距 | Tailwind |
|------|------|----------|
| 卡片内边距 | 16px | `p-4` |
| 表单项间距 | 16px | `space-y-4` |
| 按钮间距 | 12px | `gap-3` |
| 标签与输入框 | 8px | `space-y-2` |
| 标题与内容 | 12px | `mt-3` |

---

## 十、字体规范

| 用途 | 大小 | 权重 | Tailwind |
|------|------|------|----------|
| 页面标题 | 20px | 600 | `text-xl font-semibold` |
| 分组标题 | 14px | 500 | `text-sm font-medium` |
| 正文 | 14px | 400 | `text-sm` |
| 标签 | 12px | 400 | `text-xs` |
| 字符计数 | 12px | 400 | `text-xs` |

---

## 十一、图片磁贴特殊规范

### 1. 组件特点
- **单图模式**：一张大图展示
- **多图模式**：轮播图展示，最多3张图片
- **落地页配置**：每张图片可单独配置落地页，也支持全局落地页

### 2. 图片数据结构
```typescript
interface ImageItem {
  id: string;
  imageUrl?: string;          // 上传的图片URL
  imageMacro?: string;         // 图片宏变量
  landingPageUrl?: string;    // 落地页URL（可选，优先级高于全局）
  landingPageMacro?: string;  // 落地页宏变量
}

interface ImageTemplateConfig {
  images: ImageItem[];              // 图片列表（最多3张）
  defaultLandingPageUrl?: string;  // 全局默认落地页
  landingPageMacro?: string;       // 全局落地页宏变量
  macroVariables?: Record<string, string>;
}
```

### 3. 图片要求
| 项目 | 要求 |
|------|------|
| 尺寸 | 640×360px（精确匹配） |
| 格式 | JPG、PNG、JPEG |
| 大小 | 小于 2MB |

### 4. UI组件

#### 4.1 图片上传组件
```tsx
// 上传区域
<label className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50">
  <Plus className="w-6 h-6 text-gray-400" />
  <span className="text-sm text-gray-500">点击上传图片</span>
  <span className="text-xs text-gray-400">推荐 640×360px，最大 2MB</span>
</label>

// 预览区域（hover显示操作按钮）
<div className="relative group">
  <Image src={previewUrl} alt="Preview" fill className="object-cover" />
  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100">
    <button>重新上传</button>
    <button>删除</button>
  </div>
</div>
```

#### 4.2 图片列表项
```tsx
<div className="border border-gray-200 rounded-lg bg-white p-4">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <ImageIcon className="w-4 h-4 text-gray-400" />
      <span className="text-sm font-medium">图片 {index + 1}</span>
    </div>
    {canRemove && <button className="text-red-500"><Trash2 /></button>}
  </div>
  {/* 图片上传 */}
  {/* 落地页配置 */}
</div>
```

#### 4.3 模式切换
```tsx
<div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
  <button className={value === "upload" ? "bg-white shadow-sm" : "text-gray-500"}>上传图片</button>
  <button className={value === "macro" ? "bg-white shadow-sm" : "text-gray-500"}>图片宏</button>
</div>
```

### 5. 渲染样式

#### 5.1 单图模式
```tsx
<div className="w-full rounded-xl overflow-hidden">
  <img src={imageUrl} alt="图片" className="w-full h-auto aspect-video object-cover" />
</div>
```

#### 5.2 多图轮播模式
```tsx
<div className="w-full rounded-xl overflow-hidden">
  {/* 主图 */}
  <div className="relative">
    <img src={currentImage} alt={`图片 ${currentIndex + 1}`} className="w-full aspect-video object-cover" />
    {/* 左右箭头 */}
    <button className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80">
      <ChevronLeft />
    </button>
    <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80">
      <ChevronRight />
    </button>
  </div>
  {/* 指示器 */}
  <div className="flex justify-center gap-2 mt-4">
    {images.map((_, i) => (
      <button
        key={i}
        className={i === currentIndex ? "bg-white w-4" : "bg-white/50"}
      />
    ))}
  </div>
</div>
```

### 6. 交互逻辑
1. 用户点击图片 → 跳转到落地页
2. **自动轮播**：2张以上图片时，每3秒自动切换
3. 鼠标悬停时暂停自动轮播
4. 点击左右箭头或指示器手动切换图片
5. 全局落地页优先级：图片单独配置 > 全局宏变量 > 全局默认链接

---

## 十二、电商磁贴特殊规范

### 1. 组件结构
- **左图右文布局**：左侧商品图片，右侧文字内容和按钮
- **落地页配置**：支持手动输入、宏替换，默认使用广告（素材）链接

### 2. 配置数据结构
```typescript
interface EcommerceTemplateConfig {
  title: string;              // 标题（最多20字符）
  titleMacro?: string;         // 标题宏变量
  content: string;            // 文案内容（最多30字符）
  contentMacro?: string;       // 内容宏变量
  buttonText: string;         // 按钮文案
  buttonTextMacro?: string;    // 按钮文案宏变量
  imageUrl?: string;           // 图片URL
  imageMacro?: string;        // 图片宏变量
  landingPageUrl?: string;    // 落地页URL
  landingPageMacro?: string;  // 落地页宏变量
  defaultLandingPageUrl?: string;
  macroVariables?: Record<string, string>;
}
```

### 3. 字段规范
| 字段 | 最大字符 | 说明 |
|------|---------|------|
| 标题 | 20字符 | 10个汉字（不含标点） |
| 文案内容 | 30字符 | 15个汉字（不含标点） |
| 按钮文案 | - | 固定选项：立即下单、立即购买、立即下载 |

### 4. 图片要求
| 项目 | 要求 |
|------|------|
| 尺寸 | 174×174px（精确匹配） |
| 格式 | JPG、PNG、JPEG |
| 大小 | 小于 1MB |

### 5. 渲染样式
```tsx
<div className="flex items-center p-4 gap-4">
  {/* 左侧图片 */}
  <div className="flex-shrink-0 w-[87px] h-[87px] rounded-lg overflow-hidden">
    <img src={imageUrl} alt="商品图片" className="w-full h-full object-cover" />
  </div>

  {/* 右侧内容 */}
  <div className="flex-1 flex flex-col justify-between h-[87px]">
    <h3 className="text-sm font-semibold line-clamp-2">{title}</h3>
    <p className="text-xs text-gray-500 line-clamp-2">{content}</p>
    <button className="self-start px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg">
      {buttonText}
    </button>
  </div>
</div>
```

### 6. 按钮文案选项
```typescript
const BUTTON_TEXT_OPTIONS = [
  { value: "立即下单", label: "立即下单" },
  { value: "立即购买", label: "立即购买" },
  { value: "立即下载", label: "立即下载" },
];
```

---

## 十三、优惠券磁贴特殊规范

### 1. 组件结构
- **上下结构**：顶部活动名称 + 主体红色区域
- **主体布局**：左侧优惠信息 + 右侧按钮文案、优惠条件、有效期

### 2. 配置数据结构
```typescript
interface CouponTemplateConfig {
  title: string;              // 活动名称（最多14字符）
  discountInfo: string;       // 优惠信息（建议不超过6字符）
  discountCondition: string;   // 优惠条件（最多16字符）
  buttonText: string;         // 按钮文案
  buttonTextMacro?: string;    // 按钮文案宏变量
  validFrom?: string;         // 有效期开始
  validTo?: string;           // 有效期结束
  landingPageUrl?: string;    // 落地页URL
  landingPageMacro?: string;  // 落地页宏变量
  defaultLandingPageUrl?: string;
  macroVariables?: Record<string, string>;
}
```

### 3. 字段规范
| 字段 | 最大字符 | 说明 |
|------|---------|------|
| 活动名称 | 14字符 | 7个汉字（不含标点） |
| 优惠信息 | 6字符 | 3个汉字，建议格式：30元、8折 |
| 优惠条件 | 16字符 | 8个汉字，如：满100立减！ |
| 有效期 | 日期格式 | 开始日期和结束日期 |
| 按钮文案 | 固定选项 | 见下方按钮文案选项 |

### 4. 按钮文案选项
```typescript
const BUTTON_TEXT_OPTIONS = [
  { value: "立即领取", label: "立即领取" },
  { value: "立即使用", label: "立即使用" },
  { value: "马上抢", label: "马上抢" },
  { value: "去领取", label: "去领取" },
  { value: "点击领取", label: "点击领取" },
];
```

### 5. 渲染样式
```tsx
<div className="w-full max-w-[300px] bg-white rounded-lg overflow-hidden">
  {/* 活动名称 */}
  <div className="px-4 pt-3 pb-1">
    <p className="text-xs text-gray-500">
      {title}
    </p>
  </div>

  {/* 主体红色区域 */}
  <div className="flex mx-3 mb-3 rounded-lg overflow-hidden">
    {/* 左侧：优惠信息 */}
    <div className="w-[80px] bg-gradient-to-br from-[#F87D79] to-[#E85D5A] flex flex-col items-center justify-center py-4 px-2">
      <span className="text-white text-2xl font-semibold">
        {discountInfo}
      </span>
    </div>

    {/* 右侧：信息 */}
    <div className="flex-1 bg-gradient-to-br from-[#F87D79] to-[#E85D5A] px-3 py-3 flex flex-col justify-between">
      {/* 按钮文案 */}
      <span className="text-white text-sm font-semibold">
        {buttonText}
      </span>
      {/* 优惠条件 */}
      <span className="text-white/90 text-sm">
        {discountCondition}
      </span>
      {/* 有效期 */}
      <span className="text-white/80 text-xs">
        有效期: {validFrom} 至 {validTo}
      </span>
    </div>
  </div>
</div>
```

### 6. 交互逻辑
1. **点击优惠券**：跳转到落地页
2. **默认动作**：打开落地页链接
3. **宏变量替换**：支持标题、优惠信息、优惠条件、按钮文案、落地页的宏替换

---

## 十四、推广卡片特殊规范

### 1. 组件结构
- **左图右文布局**：左侧图标，右侧标题+推广卖点+行动号召按钮
- **推广卖点**：支持多条轮播展示（最多10条）

### 2. 配置数据结构
```typescript
interface PromotionPoint {
  id: string;
  text: string;           // 卖点文本（最多18字符）
  textMacro?: string;    // 卖点宏变量
}

interface PromotionTemplateConfig {
  iconUrl?: string;               // 图标URL
  iconMacro?: string;             // 图标宏变量
  title: string;                  // 标题（最多14字符）
  titleMacro?: string;            // 标题宏变量
  promotionPoints: PromotionPoint[];  // 推广卖点（最多10条）
  buttonText: string;             // 行动号召（最多12字符）
  buttonTextMacro?: string;       // 行动号召宏变量
  landingPageUrl?: string;        // 落地页URL
  landingPageMacro?: string;      // 落地页宏变量
  defaultLandingPageUrl?: string;
  macroVariables?: Record<string, string>;
}
```

### 3. 字段规范
| 字段 | 最大字符 | 说明 |
|------|---------|------|
| 图标 | 1MB | 推荐 108×108px，支持 JPG、PNG、JPEG |
| 标题 | 14字符 | 7个汉字（不含标点） |
| 推广卖点(单条) | 18字符 | 9个汉字（不含标点） |
| 行动号召 | 12字符 | 6个汉字（不含标点） |

### 4. 渲染样式
```tsx
<div className="flex items-center p-2 gap-2">
  {/* 左侧图标 */}
  <div className="w-10 h-10 rounded bg-gray-100">
    <img src={iconUrl} alt="图标" className="w-full h-full object-cover" />
  </div>

  {/* 右侧内容 */}
  <div className="flex-1">
    <p className="text-xs text-gray-500">{title}</p>
    <p className="text-[10px] text-gray-600">{currentPoint}</p>
  </div>

  {/* 按钮 */}
  <button className="h-5 px-2 bg-[#3087FF] text-white text-[10px] rounded">
    {buttonText}
  </button>
</div>
```

### 5. 交互逻辑
1. **点击行动号召按钮**：跳转到落地页
2. **推广卖点轮播**：多条卖点时自动轮播（每3秒切换），鼠标悬停暂停
3. **手动切换**：点击左右箭头或指示器切换卖点
4. **宏变量替换**：支持图标、标题、卖点、按钮文案、落地页的宏替换

---

## 十五、游戏礼包码特殊规范

### 1. 组件结构
- **左图右文布局**：左侧应用图片（可轮播），右侧应用名称+描述+包名+礼包码
- **底部下载按钮**：蓝色按钮「立即下载」
- **应用图片**：最多2张，支持轮播

### 2. 配置数据结构
```typescript
interface GameGiftTemplateConfig {
  // 应用图片（最多2张）
  images: {
    id: string;
    imageUrl?: string;
    imageMacro?: string;
  }[];
  // 应用logo
  logoUrl?: string;
  logoMacro?: string;
  // 应用名称
  appName: string;
  appNameMacro?: string;
  // 应用描述
  appDescription: string;
  appDescriptionMacro?: string;
  // 应用包名
  appPackageName?: string;
  appPackageMacro?: string;
  // 下载链接
  downloadUrl?: string;
  downloadMacro?: string;
  // 礼包码
  giftCode?: string;
  giftCodeMacro?: string;
  defaultLandingPageUrl?: string;
  macroVariables?: Record<string, string>;
}
```

### 3. 字段规范
| 字段 | 最大字符 | 说明 |
|------|---------|------|
| 应用图片 | 1MB | 推荐 1280×720px，支持 JPG、PNG、JPEG |
| 应用logo | 1MB | 推荐 132×132px，支持 JPG、PNG、JPEG |
| 应用名称 | 18字符 | 9个汉字（不含标点） |
| 应用描述 | 30字符 | 15个汉字（不含标点） |
| 应用包名 | 无限制 | 如 com.example.game |
| 礼包码 | 无限制 | 礼包码文本 |
| 下载链接 | 无限制 | 支持宏替换 |

### 4. 渲染样式
```tsx
<div className="flex p-3 gap-3">
  {/* 左侧：应用图片 */}
  <div className="w-[67px] h-[67px] rounded bg-gray-100">
    <img src={imageSrc} alt="应用图片" className="w-full h-full object-cover" />
  </div>

  {/* 右侧：信息 */}
  <div className="flex-1">
    <p className="text-sm font-medium">{appName}</p>
    <p className="text-xs text-gray-500">{appDescription}</p>
    <p className="text-[10px] text-gray-400">{appPackageName}</p>
    <p className="text-[10px] text-blue-500">码: {giftCode}</p>
  </div>
</div>

{/* 底部：下载按钮 */}
<button className="w-full h-7 bg-[#3087FF] text-white text-xs rounded">
  立即下载
</button>
```

### 5. 交互逻辑
1. **点击下载按钮**：跳转到下载链接
2. **图片轮播**：多张图片时自动轮播（每3秒切换），鼠标悬停暂停
3. **宏变量替换**：支持图片、应用名称、描述、下载链接、礼包码的宏替换

---

## 十六、红包雨特殊规范

### 1. 组件结构
- **红包飘落场景**：深红色渐变背景，15个红包从顶部飘落
- **三条飘落线**：左(15%)、中(50%)、右(85%)位置
- **领奖场景**：点击红包后展示奖励内容

### 2. 配置数据结构
```typescript
interface RedpacketRainConfig {
  // 红包元素
  redpacketImageUrl?: string;
  redpacketImageMacro?: string;
  // 引导文案
  guideText: string;
  guideTextMacro?: string;
  // 奖励类型
  rewardType: "cash" | "custom";
  // 现金奖励
  cashAmount?: string;
  cashAmountMacro?: string;
  // 自定义奖励图片
  rewardImageUrl?: string;
  rewardImageMacro?: string;
  // 奖品文案
  rewardText: string;
  rewardTextMacro?: string;
  // 特殊说明
  specialNote: string;
  specialNoteMacro?: string;
  // 落地页
  landingPageUrl?: string;
  landingPageMacro?: string;
  // 默认落地页
  defaultLandingPageUrl?: string;
  // 宏变量
  macroVariables?: Record<string, string>;
}
```

### 3. 字段规范
| 字段 | 最大字符 | 说明 |
|------|---------|------|
| 引导文案 | 20字符 | 10个汉字（不含标点） |
| 现金金额 | 无限制 | 支持宏替换 |
| 奖品文案 | 30字符 | 15个汉字（不含标点） |
| 特殊说明 | 20字符 | 10个汉字（不含标点） |
| 红包图片 | 30KB | 推荐 115×133px，宽高比 115:133 |
| 奖励图片 | 100KB | 推荐 690×360px，宽高比 690:360 |

### 4. 渲染样式

#### 红包飘落场景
```tsx
<div className="flex-1 relative overflow-hidden bg-gradient-to-b from-[#8B0000] to-[#4A0000]">
  {/* 引导文案 */}
  <div className="absolute top-1/4 left-0 right-0 text-center z-10">
    <p className="text-white text-lg font-medium drop-shadow-lg animate-pulse">
      {guideText}
    </p>
  </div>

  {/* 飘落红包（三条线） */}
  {fallingRedpackets.map((rp) => (
    <div
      key={rp.id}
      className="absolute top-0 cursor-pointer hover:scale-110 transition-transform"
      style={{
        left: `${rp.x}%`, // 15%, 50%, 85%
        animation: `fallDown ${rp.duration}ms ease-in forwards`,
        animationDelay: `${rp.delay}ms`,
      }}
    >
      <img src={redpacketImage} alt="红包" />
    </div>
  ))}
</div>
```

#### 领奖场景
```tsx
<div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-[#FFF5E6] to-[#FFE4CC]">
  {/* 现金奖励 */}
  {rewardType === "cash" && (
    <div className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-xl p-6">
      <p className="text-white/80 text-sm">恭喜获得</p>
      <p className="text-white text-4xl font-bold">¥{cashAmount}</p>
    </div>
  )}

  {/* 自定义奖励图片 */}
  {rewardType === "custom" && (
    <img src={rewardImageUrl} alt="奖励图片" className="rounded-xl" />
  )}

  {/* 奖品文案 */}
  <p className="text-center text-gray-800 font-medium">{rewardText}</p>

  {/* 特殊说明 */}
  <p className="text-center text-gray-400 text-xs">{specialNote}</p>

  {/* 领取按钮 */}
  <button className="w-full py-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF4757] text-white rounded-xl">
    立即领取
  </button>
</div>
```

### 5. 动画配置
| 参数 | 值 | 说明 |
|------|------|------|
| 红包数量 | 15个 | TOTAL_REDPACKETS |
| 飘落时长 | 3秒 ± 1秒 | FALL_DURATION |
| 生成间隔 | 200ms | SPAWN_INTERVAL |
| 延迟开始 | 500ms | 入场后延迟 |
| 飘落线 | 15%, 50%, 85% | 三条垂直线 |
| 旋转角度 | ±15度 | 随机旋转 |

### 6. 交互逻辑
1. **入场动画**：遮罩层淡入，红包雨延迟500ms开始
2. **飘落动画**：15个红包从顶部随机位置飘落，点击任意红包触发领取
3. **领取场景**：点击红包后切换到领奖场景

---

## 十七、组件预览一致性规范

### 核心原则
**组件列表页面预览与组件配置页面右侧预览必须保持完全一致**

### 关闭按钮规范
在两个预览位置（组件列表、组件配置页面）都需要展示关闭按钮：

**组件列表页面（component-list.tsx）**：
```tsx
{/* 需要添加关闭按钮的组件 */}
previewComponent?.type === "flip_redpacket" || previewComponent?.type === "flip_treasure" ? (
  <div className="relative w-full px-2">
    <FlipRedpacketTemplate
      config={previewComponent.config}
      isOpen={true}
      previewMode={true}
      onClose={() => {}}
    />
    {/* 预览关闭按钮 - 必须添加 */}
    <button
      onClick={() => setPreviewComponent(null)}
      className="absolute top-2 right-4 z-20 w-6 h-6 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity"
      style={{ backgroundColor: "rgba(255, 255, 255, 0.25)" }}
    >
      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
) : null
```

**组件配置页面（config/page.tsx）**：
```tsx
{/* 需要添加关闭按钮的组件 */}
isFlipRedpacketComponent || isTreasureBoxComponent ? (
  <div className="relative w-full px-4">
    <FlipRedpacketTemplate
      config={config}
      isOpen={true}
      previewMode={true}
      onClose={() => setPreviewResetKey(k => k + 1)}
    />
    {/* 预览关闭按钮 - 必须添加 */}
    <button
      onClick={() => setPreviewResetKey(k => k + 1)}
      className="absolute top-2 right-6 z-20 w-6 h-6 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity"
      style={{ backgroundColor: "rgba(255, 255, 255, 0.25)" }}
    >
      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
) : null
```

### 关闭按钮样式规范
| 属性 | 值 | 说明 |
|------|------|------|
| 位置 | `top-2 right-4/6` | 右上角，组件配置页偏右 |
| z-index | `z-20` | 确保在最上层 |
| 尺寸 | `w-6 h-6` | 24px 圆形 |
| 背景 | `rgba(255,255,255,0.25)` | 白色25%透明度 |
| 悬停 | `hover:opacity-80` | 透明度降低 |
| 图标 | 白色 X 形状 | `text-white` |

### 检查清单
- [ ] 组件列表页面预览是否包含关闭按钮
- [ ] 组件配置页面预览是否包含关闭按钮
- [ ] 两个位置的关闭按钮样式是否一致
- [ ] 点击关闭按钮是否正确执行关闭操作
4. **点击领取**：跳转到落地页链接
5. **宏变量替换**：支持引导文案、金额、图片、文案、落地页的宏替换

---

## 十八、浮窗组件特殊规范

### 1. 组件特点
- **左图右文结构**：左侧图标，右侧标题+推广卖点+行动号召按钮
- **推广卖点**：支持多条轮播展示（最多10条）
- **出现位置**：顶部/底部/中下部，带滑入动画
- **出现动作**：
  - 顶部：自上而下滑动，直到整个组件展示完整后停止
  - 底部：自下而上滑动，直到整个组件展示完整后停止
  - 中下部：自左向右滑动，直到整个组件展示完整后停止

### 2. 配置数据结构
```typescript
interface FloatingWindowPromotionPoint {
  id: string;
  text: string;           // 卖点文本（最多18字符）
  textMacro?: string;    // 卖点宏变量
}

interface FloatingWindowTemplateConfig {
  position: "top" | "bottom" | "middle_bottom";  // 浮窗位置
  action: "open" | "close";                       // 动作
  iconUrl?: string;               // 图标URL
  iconMacro?: string;             // 图标宏变量
  title: string;                  // 标题（最多14字符）
  titleMacro?: string;            // 标题宏变量
  promotionPoints: FloatingWindowPromotionPoint[];  // 推广卖点（最多10条）
  buttonText: string;             // 行动号召（最多12字符）
  buttonTextMacro?: string;       // 行动号召宏变量
  landingPageType?: "url" | "deeplink";  // 落地页类型
  landingPageUrl?: string;        // 落地页URL
  landingPageMacro?: string;      // 落地页宏变量
  deeplinkUrl?: string;           // Deeplink URL
  deeplinkMacro?: string;         // Deeplink宏变量
  defaultLandingPageUrl?: string;
  macroVariables?: Record<string, string>;
  componentName?: string;         // 组件名称（最多20字符）
}
```

### 3. 字段规范
| 字段 | 最大字符 | 说明 |
|------|---------|------|
| 图标 | 1MB | 推荐 108×108px，支持 JPG、PNG、JPEG |
| 标题 | 14字符 | 7个汉字（不含标点） |
| 推广卖点(单条) | 18字符 | 9个汉字（不含标点） |
| 行动号召 | 12字符 | 6个汉字（不含标点） |
| 组件名称 | 20字符 | 10个汉字（不含标点） |

### 4. 组件尺寸
| 位置 | 宽度 | 高度 |
|------|------|------|
| 顶部 | 640px | 100px |
| 底部 | 640px | 100px |
| 中下部 | 480px | 100px |

### 5. 渲染样式
```tsx
<div className="flex items-center p-2 gap-2 bg-white/90 rounded-lg shadow-lg">
  {/* 左侧图标 */}
  <div className="w-10 h-10 rounded bg-gray-100">
    <img src={iconUrl} alt="图标" className="w-full h-full object-cover" />
  </div>

  {/* 右侧内容 */}
  <div className="flex-1">
    <p className="text-xs text-gray-500">{title}</p>
    <p className="text-[10px] text-gray-600">{currentPoint}</p>
  </div>

  {/* 按钮 */}
  <button className="h-5 px-2 bg-[#3087FF] text-white text-[10px] rounded">
    {buttonText}
  </button>

  {/* 关闭按钮 */}
  <button className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600">
    <X className="w-3 h-3" />
  </button>
</div>
```

### 6. 交互逻辑
1. **点击行动号召按钮**：跳转到落地页
2. **点击关闭按钮**：关闭浮窗（动画滑出）
3. **推广卖点轮播**：多条卖点时自动轮播（每3秒切换），鼠标悬停暂停
4. **手动切换**：点击左右箭头或指示器切换卖点
5. **宏变量替换**：支持图标、标题、卖点、按钮文案、落地页的宏替换

### 7. 出现动画
- **顶部**：`translateY(-100%)` → `translateY(0)` 自上而下滑入
- **底部**：`translateY(100%)` → `translateY(0)` 自下而上滑入
- **中下部**：`translateX(-100%)` → `translateX(0)` 自左向右滑入
- 底层透明度10%（`bg-black/10`）