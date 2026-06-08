"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  FloatingWindowTemplateConfig,
  FloatingWindowPromotionPoint,
  FloatingWindowPosition,
  FloatingWindowTemplate,
  defaultFloatingWindowConfig,
} from "@/components/floating-window-template";
import { cn, getStringWidth } from "@/lib/utils";
import { LandingPageConfigSection } from "./landing-page-config";

// Tab switch component
function ModeToggle({
  value,
  onChange,
}: {
  value: "input" | "macro";
  onChange: (v: "input" | "macro") => void;
}) {
  return (
    <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
      <button
        onClick={() => onChange("input")}
        className={cn(
          "px-3 py-1 text-xs font-medium rounded-md transition-all",
          value === "input"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        输入模式
      </button>
      <button
        onClick={() => onChange("macro")}
        className={cn(
          "px-3 py-1 text-xs font-medium rounded-md transition-all",
          value === "macro"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        宏模式
      </button>
    </div>
  );
}

// Character counter
function CharCounter({
  value,
  max,
}: {
  value: string;
  max: number;
}) {
  const width = getStringWidth(value);
  const isOverLimit = width > max;
  return (
    <span
      className={cn(
        "text-xs",
        isOverLimit ? "text-red-500" : "text-gray-400"
      )}
    >
      {width}/{max}字符
      {isOverLimit && <span className="text-red-500 ml-1">（超出限制）</span>}
    </span>
  );
}

// Section header with collapse
function SectionHeader({
  title,
  isOpen,
  onToggle,
  required,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  required?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full text-left py-2 group"
    >
      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
        {title}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      {isOpen ? (
        <ChevronDown className="w-4 h-4 text-gray-400" />
      ) : (
        <ChevronRight className="w-4 h-4 text-gray-400" />
      )}
    </button>
  );
}

// Image Upload Component
function ImageUpload({
  value,
  onChange,
  macroValue,
  macroOnChange,
  mode,
  onModeChange,
}: {
  value: string;
  onChange: (v: string) => void;
  macroValue: string;
  macroOnChange: (v: string) => void;
  mode: "upload" | "macro";
  onModeChange: (v: "upload" | "macro") => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);

  // 同步外部 value 变化
  useEffect(() => {
    if (mode === "upload") {
      setPreviewUrl(value || null);
    }
  }, [value, mode]);

  // 切换到宏模式时清空预览
  useEffect(() => {
    if (mode === "macro") {
      setPreviewUrl(null);
      setError(null);
    }
  }, [mode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 校验文件类型
    if (!file.type.startsWith("image/")) {
      setError("请上传图片文件（支持 JPG、PNG、JPEG 格式）");
      return;
    }

    // 校验文件大小（1MB）
    if (file.size > 1 * 1024 * 1024) {
      setError("图片大小不能超过 1MB，当前文件 " + (file.size / 1024 / 1024).toFixed(2) + "MB");
      return;
    }

    // 校验图片尺寸（1:1比例，推荐 108×108px）
    const img = new window.Image();
    img.onload = () => {
      if (img.width !== img.height) {
        setError(`图片比例必须为1:1，当前为 ${img.width}×${img.height}px`);
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setPreviewUrl(url);
        onChange(url);
      };
      reader.readAsDataURL(file);
    };
    img.onerror = () => {
      setError("图片加载失败，请重新上传");
    };
    img.src = URL.createObjectURL(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          图片模式<span className="text-red-500 ml-1">*</span>
        </label>
        <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
          <button
            onClick={() => {
              setError(null);
              onModeChange("upload");
            }}
            className={cn(
              "px-2 py-0.5 text-xs font-medium rounded transition-all",
              mode === "upload" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
            )}
          >
            自定义上传
          </button>
          <button
            onClick={() => {
              setError(null);
              onModeChange("macro");
            }}
            className={cn(
              "px-2 py-0.5 text-xs font-medium rounded transition-all",
              mode === "macro" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
            )}
          >
            宏模式
          </button>
        </div>
      </div>

      {mode === "macro" ? (
        <div className="space-y-1">
          <Input
            placeholder="如 {icon_url}"
            value={macroValue || ""}
            onChange={(e) => macroOnChange(e.target.value)}
          />
        </div>
      ) : (
        <>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg overflow-hidden",
              error ? "border-red-300" : "border-gray-200"
            )}
          >
            {previewUrl ? (
              <div className="relative group">
                <img
                  src={previewUrl}
                  alt="图标预览"
                  className="w-20 h-20 object-cover mx-auto"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2">
                  <label className="px-2 py-1 bg-white rounded text-xs cursor-pointer">
                    重新上传
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  <button
                    onClick={() => {
                      setPreviewUrl(null);
                      onChange("");
                    }}
                    className="px-2 py-1 bg-white rounded text-xs text-red-500"
                  >
                    删除
                  </button>
                </div>
              </div>
            ) : (
              <label htmlFor="floating-icon-upload" className="flex flex-col items-center justify-center py-6 cursor-pointer hover:bg-gray-50">
                <Plus className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-gray-500">上传图片</span>
                <span className="text-xs text-gray-400">宽高比1:1, 尺寸最小108×108, 大小&lt;1M</span>
              </label>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            id="floating-icon-upload"
          />
          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}

// Promotion Point Editor
function PromotionPointEditor({
  point,
  index,
  onChange,
  onDelete,
  canDelete,
}: {
  point: FloatingWindowPromotionPoint;
  index: number;
  onChange: (point: FloatingWindowPromotionPoint) => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  const [mode, setMode] = useState<"input" | "macro">(
    point.textMacro ? "macro" : "input"
  );

  const handleTextChange = (text: string) => {
    if (mode === "macro") {
      onChange({ ...point, textMacro: text, text: text });
    } else {
      onChange({ ...point, text: text, textMacro: undefined });
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">卖点 {index + 1}</span>
          {canDelete && (
            <button
              onClick={onDelete}
              className="text-red-500 hover:bg-red-50 p-1 rounded"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
        <ModeToggle value={mode} onChange={setMode} />
      </div>

      <div className="flex items-center justify-between">
        <Input
          placeholder={mode === "macro" ? "如 {promotion_point}" : "请输入推广卖点"}
          value={mode === "macro" ? (point.textMacro || "") : point.text}
          onChange={(e) => handleTextChange(e.target.value)}
          className="flex-1"
        />
        <CharCounter
          value={mode === "macro" ? (point.textMacro || "") : point.text}
          max={18}
        />
      </div>
    </div>
  );
}

interface FloatingWindowTemplateConfigPanelProps {
  initialConfig?: Partial<FloatingWindowTemplateConfig>;
  onChange?: (config: FloatingWindowTemplateConfig) => void;
  onSave?: (config: FloatingWindowTemplateConfig) => void;
  onPreview?: (config: FloatingWindowTemplateConfig) => void;
  macroVariables?: Record<string, string>;
}

export function FloatingWindowTemplateConfigPanel({
  initialConfig,
  onChange,
  onSave,
  onPreview,
  macroVariables = {},
}: FloatingWindowTemplateConfigPanelProps) {
  // 默认推广卖点
  const defaultPoints: FloatingWindowPromotionPoint[] = [
    { id: "1", text: "推广卖点1" },
  ];

  // 表单配置
  const [config, setConfig] = useState<FloatingWindowTemplateConfig>(() => ({
    ...defaultFloatingWindowConfig,
    ...initialConfig,
    promotionPoints: Array.isArray(initialConfig?.promotionPoints) && initialConfig.promotionPoints.length
      ? initialConfig.promotionPoints
      : [...defaultPoints],
    macroVariables,
  }));

  // 折叠状态
  const [basicOpen, setBasicOpen] = useState(true);
  const [pointsOpen, setPointsOpen] = useState(true);

  // 模式状态（纯UI状态，不存入配置数据）
  const [iconMode, setIconMode] = useState<"upload" | "macro">(
    config.iconMacro ? "macro" : "upload"
  );
  const [titleMode, setTitleMode] = useState<"input" | "macro">(
    config.titleMacro ? "macro" : "input"
  );

  // 更新配置
  const updateConfig = (updates: Partial<FloatingWindowTemplateConfig>) => {
    const newConfig = { ...config, ...updates, macroVariables };
    setConfig(newConfig);
    onChange?.(newConfig);
  };

  // 处理标题模式切换 - 切换时清空另一模式的值（AGENTS.md规范）
  const handleTitleModeChange = (mode: "input" | "macro") => {
    setTitleMode(mode);
    if (mode === "macro") {
      // 切换到宏模式：清空title，让用户输入宏值
      updateConfig({ title: "", titleMacro: "" });
    } else {
      // 切换到输入模式：清空titleMacro，让用户输入标题
      updateConfig({ title: "", titleMacro: "" });
    }
  };

  // 处理图标模式切换 - 切换时清空另一模式的值
  const handleIconModeChange = (mode: "input" | "macro") => {
    setIconMode(mode);
    if (mode === "macro") {
      updateConfig({ iconUrl: "", iconMacro: "" });
    } else {
      updateConfig({ iconUrl: "", iconMacro: "" });
    }
  };

  // 添加推广卖点
  const addPromotionPoint = () => {
    if (config.promotionPoints.length >= 10) return;
    const newPoint: FloatingWindowPromotionPoint = {
      id: Date.now().toString(),
      text: `推广卖点${config.promotionPoints.length + 1}`,
    };
    updateConfig({
      promotionPoints: [...config.promotionPoints, newPoint],
    });
  };

  // 删除推广卖点
  const deletePromotionPoint = (id: string) => {
    if (config.promotionPoints.length <= 1) return;
    updateConfig({
      promotionPoints: config.promotionPoints.filter((p) => p.id !== id),
    });
  };

  // 更新推广卖点
  const updatePromotionPoint = (index: number, point: FloatingWindowPromotionPoint) => {
    const newPoints = [...config.promotionPoints];
    newPoints[index] = point;
    updateConfig({ promotionPoints: newPoints });
  };

  // 预览
  const handlePreview = () => {
    onPreview?.(config);
  };

  // 保存
  const handleSave = () => {
    onSave?.(config);
  };

  // 处理标题输入
  const handleTitleInput = (value: string) => {
    if (titleMode === "macro") {
      updateConfig({ titleMacro: value });
    } else {
      updateConfig({ title: value });
    }
  };

  // 获取各输入值 - 宏模式下只显示宏值，输入模式下只显示标题
  const getTitleValue = () => titleMode === "macro" ? (config.titleMacro || "") : (config.title || "");

  return (
    <div className="space-y-4">
      {/* Basic Config Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <SectionHeader
            title="基础配置"
            isOpen={basicOpen}
            onToggle={() => setBasicOpen(!basicOpen)}
            required
          />
        </div>
        {basicOpen && (
          <div className="p-4 space-y-4">
            {/* 行动 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                行动<span className="text-red-500 ml-1">*</span>
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="floating-action"
                    value="open"
                    checked={config.action === "open" || !config.action}
                    onChange={() => updateConfig({ action: "open" })}
                    className="w-3.5 h-3.5 text-blue-500"
                  />
                  <span className="text-sm text-gray-700">打开</span>
                </label>
              </div>
            </div>

            {/* 浮窗位置 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                浮窗位置<span className="text-red-500 ml-1">*</span>
              </label>
              <div className="flex items-center gap-4">
                {(["top", "bottom", "middle"] as FloatingWindowPosition[]).map((pos) => (
                  <label key={pos} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="floating-position"
                      value={pos}
                      checked={config.position === pos}
                      onChange={() => updateConfig({ position: pos })}
                      className="w-3.5 h-3.5 text-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {pos === "top" ? "顶部" : pos === "bottom" ? "底部" : "中部"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 图标设置 */}
            <ImageUpload
              value={config.iconUrl || ""}
              onChange={(v) => updateConfig({ iconUrl: v, iconMacro: "" })}
              macroValue={config.iconMacro || ""}
              macroOnChange={(v) => updateConfig({ iconMacro: v, iconUrl: "" })}
              mode={iconMode}
              onModeChange={handleIconModeChange}
            />

            {/* 卡片标题 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  卡片标题<span className="text-red-500 ml-1">*</span>
                </label>
                <ModeToggle value={titleMode} onChange={handleTitleModeChange} />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder={titleMode === "macro" ? "如 {title}" : "请输入卡片标题, 最多14个字符"}
                  value={getTitleValue()}
                  onChange={(e) => handleTitleInput(e.target.value)}
                  className="flex-1"
                />
                <CharCounter value={getTitleValue()} max={14} />
              </div>
            </div>

            {/* 行动号召 - 无宏模式 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                行动号召<span className="text-red-500 ml-1">*</span>
              </label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="请输入行动号召, 最多12个字符"
                  value={config.buttonText || ""}
                  onChange={(e) => updateConfig({ buttonText: e.target.value })}
                  className="flex-1"
                />
                <CharCounter value={config.buttonText || ""} max={12} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Promotion Points Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <SectionHeader
            title="推广卖点"
            isOpen={pointsOpen}
            onToggle={() => setPointsOpen(!pointsOpen)}
          />
        </div>
        {pointsOpen && (
          <div className="p-4 space-y-3">
            {config.promotionPoints.map((point, index) => (
              <PromotionPointEditor
                key={point.id}
                point={point}
                index={index}
                onChange={(p) => updatePromotionPoint(index, p)}
                onDelete={() => deletePromotionPoint(point.id)}
                canDelete={config.promotionPoints.length > 1}
              />
            ))}

            {config.promotionPoints.length < 10 && (
              <button
                onClick={addPromotionPoint}
                className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加推广卖点
              </button>
            )}
            <p className="text-xs text-gray-400 text-right">
              已选: {config.promotionPoints.length}/10
            </p>
          </div>
        )}
      </div>

      {/* Landing Page Section */}
      <LandingPageConfigSection
        config={{
          landingPageType: config.landingPageType || "url",
          landingPageUrl: config.landingPageUrl || "",
          landingPageMacro: config.landingPageMacro || "",
          deeplinkUrl: config.deeplinkUrl || "",
          deeplinkMacro: config.deeplinkMacro || "",
          defaultLandingPageUrl: config.defaultLandingPageUrl,
          macroVariables: config.macroVariables,
        }}
        onChange={(updates) => updateConfig(updates)}
        hint="不配置默认使用广告（素材）链接"
      />

      {/* Component Name - 最下方 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 space-y-2">
          <label className="text-sm font-medium text-gray-700">
            组件名称<span className="text-red-500 ml-1">*</span>
          </label>
          <div className="flex items-center gap-2">
            <Input
              placeholder="请输入组件名称, 最多20个字符"
              value={config.componentName || ""}
              onChange={(e) => updateConfig({ componentName: e.target.value })}
              className="flex-1"
            />
            <CharCounter value={config.componentName || ""} max={20} />
          </div>
        </div>
      </div>

      {/* Preview & Save Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={handlePreview}
          className="h-10 px-4 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          预览
        </button>
        <button
          onClick={handleSave}
          className="h-10 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          保存
        </button>
      </div>

      {/* Preview Modal */}
      <FloatingWindowTemplatePreview config={config} />
    </div>
  );
}

// 预览弹窗状态管理
let previewRef: {
  setConfig: (config: FloatingWindowTemplateConfig) => void;
  open: () => void;
} | null = null;

function FloatingWindowTemplatePreview({ config }: { config: FloatingWindowTemplateConfig }) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewConfig, setPreviewConfig] = useState(config);

  // 注册到全局
  React.useEffect(() => {
    previewRef = {
      setConfig: (cfg) => setPreviewConfig(cfg),
      open: () => setIsOpen(true),
    };
    return () => {
      previewRef = null;
    };
  }, []);

  // 监听 config 变化
  React.useEffect(() => {
    setPreviewConfig(config);
  }, [config]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/10"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Preview - 模拟浮窗位置 */}
      {isOpen && (
        <FloatingWindowTemplate
          config={previewConfig}
          isOpen={true}
          onClose={() => setIsOpen(false)}
          previewMode={false}
        />
      )}
    </>
  );
}

// 导出预览函数
export function openFloatingWindowPreview(config: FloatingWindowTemplateConfig) {
  previewRef?.setConfig(config);
  previewRef?.open();
}

// 导出类型
export type { FloatingWindowTemplateConfigPanelProps };
