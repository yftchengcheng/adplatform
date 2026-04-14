"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Link2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PromotionTemplateConfig,
  PromotionPoint,
  PromotionTemplate,
} from "@/components/promotion-template";
import { cn, getStringWidth } from "@/lib/utils";

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
        手动输入
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
        宏替换
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 校验文件类型
    if (!file.type.startsWith("image/")) {
      setError("请上传图片文件（支持 JPG、PNG、GIF、WebP 等格式）");
      return;
    }

    // 校验文件大小（1MB）
    if (file.size > 1 * 1024 * 1024) {
      setError("图片大小不能超过 1MB，当前文件 " + (file.size / 1024 / 1024).toFixed(2) + "MB");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPreviewUrl(url);
      onChange(url);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">图标设置</label>
        <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
          <button
            onClick={() => onModeChange("upload")}
            className={cn(
              "px-2 py-0.5 text-xs font-medium rounded transition-all",
              mode === "upload" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
            )}
          >
            上传图片
          </button>
          <button
            onClick={() => onModeChange("macro")}
            className={cn(
              "px-2 py-0.5 text-xs font-medium rounded transition-all",
              mode === "macro" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
            )}
          >
            图片宏
          </button>
        </div>
      </div>

      {mode === "macro" ? (
        <Input
          placeholder="如 ${icon_url}"
          value={macroValue || ""}
          onChange={(e) => macroOnChange(e.target.value)}
        />
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
              <label className="flex flex-col items-center justify-center py-6 cursor-pointer hover:bg-gray-50">
                <Plus className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-gray-500">点击上传图片</span>
                <span className="text-xs text-gray-400">推荐 108×108px，最大 1MB</span>
              </label>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            id="icon-upload"
          />
          {!previewUrl && (
            <label
              htmlFor="icon-upload"
              className="hidden"
            >
              选择文件
            </label>
          )}
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
  point: PromotionPoint;
  index: number;
  onChange: (point: PromotionPoint) => void;
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
          placeholder="请输入推广卖点"
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

interface PromotionTemplateConfigPanelProps {
  initialConfig?: Partial<PromotionTemplateConfig>;
  onChange?: (config: PromotionTemplateConfig) => void;
  onSave?: (config: PromotionTemplateConfig) => void;
  onPreview?: (config: PromotionTemplateConfig) => void;
  macroVariables?: Record<string, string>;
}

export function PromotionTemplateConfigPanel({
  initialConfig,
  onChange,
  onSave,
  onPreview,
  macroVariables = {},
}: PromotionTemplateConfigPanelProps) {
  // 默认推广卖点
  const defaultPoints: PromotionPoint[] = [
    { id: "1", text: "推广卖点1" },
    { id: "2", text: "推广卖点2" },
  ];

  // 表单配置
  const [config, setConfig] = useState<PromotionTemplateConfig>(() => ({
    ...{
      iconUrl: "",
      iconMacro: "",
      title: "卡片标题",
      titleMacro: "",
      promotionPoints: [...defaultPoints],
      buttonText: "行动号召",
      buttonTextMacro: "",
      landingPageUrl: "",
      landingPageMacro: "",
    },
    ...initialConfig,
    promotionPoints: initialConfig?.promotionPoints?.length 
      ? initialConfig.promotionPoints 
      : [...defaultPoints],
    macroVariables,
  }));

  // 折叠状态
  const [basicOpen, setBasicOpen] = useState(true);
  const [pointsOpen, setPointsOpen] = useState(true);
  const [landingOpen, setLandingOpen] = useState(true);

  // 模式状态
  const [iconMode, setIconMode] = useState<"upload" | "macro">(
    config.iconMacro ? "macro" : "upload"
  );
  const [titleMode, setTitleMode] = useState<"input" | "macro">(
    config.titleMacro ? "macro" : "input"
  );
  const [buttonTextMode, setButtonTextMode] = useState<"input" | "macro">(
    config.buttonTextMacro ? "macro" : "input"
  );
  const [landingPageMode, setLandingPageMode] = useState<"input" | "macro">(
    config.landingPageMacro ? "macro" : "input"
  );

  // 更新配置
  const updateConfig = (updates: Partial<PromotionTemplateConfig>) => {
    const newConfig = { ...config, ...updates, macroVariables };
    setConfig(newConfig);
    onChange?.(newConfig);
  };

  // 添加推广卖点
  const addPromotionPoint = () => {
    if (config.promotionPoints.length >= 10) return;
    const newPoint: PromotionPoint = {
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
  const updatePromotionPoint = (index: number, point: PromotionPoint) => {
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
      updateConfig({ titleMacro: value, title: value });
    } else {
      updateConfig({ title: value, titleMacro: "" });
    }
  };

  // 处理按钮文案输入
  const handleButtonTextInput = (value: string) => {
    if (buttonTextMode === "macro") {
      updateConfig({ buttonTextMacro: value, buttonText: value });
    } else {
      updateConfig({ buttonText: value, buttonTextMacro: "" });
    }
  };

  // 处理落地页输入
  const handleLandingPageInput = (value: string) => {
    if (landingPageMode === "macro") {
      updateConfig({ landingPageMacro: value, landingPageUrl: "" });
    } else {
      updateConfig({ landingPageUrl: value, landingPageMacro: "" });
    }
  };

  // 获取各输入值
  const getTitleValue = () => titleMode === "macro" ? (config.titleMacro || config.title || "") : (config.title || "");
  const getButtonTextValue = () => buttonTextMode === "macro" ? (config.buttonTextMacro || config.buttonText || "") : (config.buttonText || "");
  const getLandingPageValue = () => landingPageMode === "macro" ? (config.landingPageMacro || "") : (config.landingPageUrl || "");

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
            {/* 图标设置 */}
            <ImageUpload
              value={config.iconUrl || ""}
              onChange={(v) => updateConfig({ iconUrl: v, iconMacro: "" })}
              macroValue={config.iconMacro || ""}
              macroOnChange={(v) => updateConfig({ iconMacro: v, iconUrl: "" })}
              mode={iconMode}
              onModeChange={setIconMode}
            />

            {/* 标题 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">标题</label>
                <ModeToggle value={titleMode} onChange={setTitleMode} />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="请输入卡片标题"
                  value={getTitleValue()}
                  onChange={(e) => handleTitleInput(e.target.value)}
                  className="flex-1"
                />
                <CharCounter value={getTitleValue()} max={14} />
              </div>
            </div>

            {/* 行动号召 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">行动号召</label>
                <ModeToggle value={buttonTextMode} onChange={setButtonTextMode} />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="请输入按钮文案"
                  value={getButtonTextValue()}
                  onChange={(e) => handleButtonTextInput(e.target.value)}
                  className="flex-1"
                />
                <CharCounter value={getButtonTextValue()} max={12} />
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
              {config.promotionPoints.length}/10 条卖点
            </p>
          </div>
        )}
      </div>

      {/* Landing Page Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <SectionHeader
            title="落地页配置"
            isOpen={landingOpen}
            onToggle={() => setLandingOpen(!landingOpen)}
          />
        </div>
        {landingOpen && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                点击后动作
              </label>
              <ModeToggle
                value={landingPageMode}
                onChange={setLandingPageMode}
              />
            </div>

            {landingPageMode === "macro" ? (
              <div className="space-y-2">
                <Input
                  placeholder="如 ${landing_page_url}"
                  value={getLandingPageValue()}
                  onChange={(e) => handleLandingPageInput(e.target.value)}
                />
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Link2 className="w-3 h-3" />
                  宏变量将自动替换为实际值
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="请输入落地页链接"
                  value={getLandingPageValue()}
                  onChange={(e) => handleLandingPageInput(e.target.value)}
                />
                <p className="text-xs text-gray-400">
                  不配置默认使用广告（素材）链接
                </p>
              </div>
            )}

            {/* 动作 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                动作
              </label>
              <Select
                value={config.clickAction || "open"}
                onValueChange={(v) => updateConfig({ clickAction: v as "open" | "close" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">打开</SelectItem>
                  <SelectItem value="close">关闭</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
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
      <PromotionTemplatePreview config={config} />
    </div>
  );
}

// 预览弹窗状态管理
let previewRef: {
  setConfig: (config: PromotionTemplateConfig) => void;
  open: () => void;
} | null = null;

function PromotionTemplatePreview({ config }: { config: PromotionTemplateConfig }) {
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
    <PromotionTemplate
      config={previewConfig}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    />
  );
}

// 打开预览的全局方法
export function openPromotionPreview(config: PromotionTemplateConfig) {
  previewRef?.setConfig(config);
  previewRef?.open();
}
