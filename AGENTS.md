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

### 1. 文本输入框 (Input)

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

