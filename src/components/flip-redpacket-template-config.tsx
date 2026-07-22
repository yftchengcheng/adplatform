"use client";

import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus, Trash2, ImageIcon, Link2 } from "lucide-react";
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
      <ChevronDown
        className={cn(
          "w-4 h-4 text-gray-400 transition-transform",
          !isOpen && "-rotate-90"
        )}
      />
    </button>
  );
}

// 配置数据类型
export interface FlipRedpacketConfig {
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
  landingPageType?: "url" | "deeplink"; // 跳转类型
  deeplinkUrl?: string; // Deeplink地址
  deeplinkMacro?: string; // Deeplink宏变量
  // 默认落地页
  defaultLandingPageUrl?: string;
  // 宏变量
  macroVariables?: Record<string, string>;
  // 组件名称
  componentName?: string;
}

// 模板配置类型
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FlipRedpacketTemplateConfig extends FlipRedpacketConfig {}

// 默认配置
export const defaultFlipRedpacketConfig: FlipRedpacketConfig = {
  guideText: "点击红包，领取奖品",
  guideTextMacro: "",
  rewardType: "cash",
  cashAmount: "88.88",
  cashAmountMacro: "",
  rewardImageUrl: "",
  rewardImageMacro: "",
  rewardText: "恭喜发财",
  rewardTextMacro: "",
  specialNote: "实际奖品以APP为准！",
  specialNoteMacro: "",
  redpacketImageUrl: "/redbag-bg.png",
  redpacketImageMacro: "",
  landingPageUrl: "",
  landingPageMacro: "",
    landingPageType: "url",
    deeplinkUrl: "",
    deeplinkMacro: "",
  defaultLandingPageUrl: "",
  macroVariables: {
    guide_text: "点击红包，领取奖品",
    landing_url: "https://example.com/claim",
    cash_amount: "88.88",
    reward_image: "",
    reward_text: "恭喜发财",
    special_note: "实际奖品以APP为准！",
  },
  componentName: "点击红包领取奖品",
};

// Props
export interface FlipRedpacketTemplateConfigPanelProps {
  config: FlipRedpacketTemplateConfig;
  onChange: (config: FlipRedpacketTemplateConfig) => void;
  onSave?: () => void;
  onCancel?: () => void;
  macroVariables?: Record<string, string>;
  onMacroVariablesChange?: (vars: Record<string, string>) => void;
}

// 宏变量编辑器
function MacroVariableEditor({
  variables,
  onChange,
}: {
  variables: Record<string, string>;
  onChange: (vars: Record<string, string>) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const addVariable = () => {
    if (newKey.trim()) {
      onChange({ ...variables, [newKey.trim()]: newValue });
      setNewKey("");
      setNewValue("");
    }
  };

  const removeVariable = (key: string) => {
    const updated = { ...variables };
    delete updated[key];
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">宏变量</label>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs text-blue-500 hover:text-blue-600"
        >
          {isOpen ? "收起" : "展开"}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
          {Object.entries(variables).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-gray-200 px-2 py-1 rounded truncate">
                $&#123;{key}&#125;
              </code>
              <Input
                value={value}
                onChange={(e) => onChange({ ...variables, [key]: e.target.value })}
                className="flex-1 h-7 text-xs"
                placeholder="变量值"
              />
              <button
                onClick={() => removeVariable(key)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
            <Input
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="flex-1 h-7 text-xs"
              placeholder="变量名"
            />
            <Input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="flex-1 h-7 text-xs"
              placeholder="变量值"
            />
            <button
              onClick={addVariable}
              className="text-blue-500 hover:text-blue-600"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 图片上传组件
function ImageUpload({
  value,
  onChange,
  aspectRatio,
  maxSize = 2,
  placeholder,
  error,
}: {
  value?: string;
  onChange: (url: string) => void;
  aspectRatio?: string;
  maxSize?: number;
  placeholder?: string;
  error?: string;
}) {
  const [previewUrl, setPreviewUrl] = useState(value || "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");

    // 允许的文件类型
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("仅支持 JPG、PNG、JPEG、WebP 格式");
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(`图片大小不能超过 ${maxSize}MB`);
      return;
    }

    // Validate aspect ratio if specified
    if (aspectRatio) {
      const [w, h] = aspectRatio.split(":").map(Number);
      const img = document.createElement("img");
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        const actualRatio = img.width / img.height;
        const targetRatio = w / h;
        if (Math.abs(actualRatio - targetRatio) > 0.1) {
          setUploadError(`图片宽高比应为 ${aspectRatio}，当前 ${img.width}×${img.height}`);
          return;
        }

        // Create preview
        const reader = new FileReader();
        let uploadedUrl = "";
        reader.onload = (event) => {
          uploadedUrl = event.target?.result as string;
          setPreviewUrl(uploadedUrl);
        };
        reader.readAsDataURL(file);

        // Simulate upload
        setIsUploading(true);
        setTimeout(() => {
          setIsUploading(false);
          onChange(uploadedUrl);
        }, 500);
      };
      img.onerror = () => {
        setUploadError("无法读取图片文件");
      };
      img.src = URL.createObjectURL(file);
    } else {
      // Create preview without aspect ratio check
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setPreviewUrl(dataUrl);
      };
      reader.readAsDataURL(file);

      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        onChange(reader.result as string);
      }, 500);
    }
  };

  const handleRemove = () => {
    setPreviewUrl("");
    onChange("");
  };

  const displayError = error || uploadError;

  return (
    <div className="space-y-2">
      {previewUrl ? (
        <div className="relative group">
          <div className="border-2 border-dashed border-gray-200 rounded-lg overflow-hidden">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-auto object-contain max-h-32"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <label className="px-3 py-1.5 bg-white rounded text-xs cursor-pointer hover:bg-gray-100">
                重新上传
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleRemove}
                className="px-3 py-1.5 bg-red-500 text-white rounded text-xs hover:bg-red-600"
              >
                删除
              </button>
            </div>
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <span className="text-white text-sm">上传中...</span>
            </div>
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
          <Plus className="w-6 h-6 text-gray-400 mb-1" />
          <span className="text-sm text-gray-500">{placeholder || "点击上传图片"}</span>
          {aspectRatio && (
            <span className="text-xs text-gray-400 mt-1">
              比例 {aspectRatio}，最大 {maxSize}MB
            </span>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}
      {displayError && (
        <p className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
          {displayError}
        </p>
      )}
    </div>
  );
}

// 主配置面板
export function FlipRedpacketTemplateConfigPanel({
  config,
  onChange,
  onSave,
  onCancel,
  macroVariables = {},
  onMacroVariablesChange,
}: FlipRedpacketTemplateConfigPanelProps) {
  const updateConfig = useCallback(
    (updates: Partial<FlipRedpacketTemplateConfig>) => {
      onChange({ ...config, ...updates });
    },
    [config, onChange]
  );

  // 宏替换模式状态
  const [guideTextMode, setGuideTextMode] = useState<"input" | "macro">(
    config.guideTextMacro ? "macro" : "input"
  );
  const [landingPageMode, setLandingPageMode] = useState<"input" | "macro">(
    config.landingPageMacro ? "macro" : "input"
  );

  // 奖励图片模式状态
  const [rewardImageMode, setRewardImageMode] = useState<"input" | "macro">(
    config.rewardImageMacro ? "macro" : "input"
  );

  // 获取引导文案值
  const getGuideTextValue = () => {
    return guideTextMode === "macro"
      ? (config.guideTextMacro || "")
      : config.guideText;
  };

  // 获取落地页值
  const getLandingPageValue = () => {
    return landingPageMode === "macro"
      ? (config.landingPageMacro || "")
      : (config.landingPageUrl || "");
  };

  // 获取奖励图片值
  const getRewardImageValue = () => {
    return rewardImageMode === "macro"
      ? (config.rewardImageMacro || "")
      : (config.rewardImageUrl || "");
  };

  // 落地页展开状态
  const [landingOpen, setLandingOpen] = useState(true);
  const [basicOpen, setBasicOpen] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  return (
    <div className="space-y-4">
      {/* 基础配置 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">基础配置</h3>
        </div>
        <div className="p-4 space-y-4">
          {/* 红包图片 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">红包图片</label>
            <ImageUpload
              value={config.redpacketImageUrl || ""}
              onChange={(url) => updateConfig({ redpacketImageUrl: url })}
              aspectRatio="115:133"
              maxSize={0.03}
              placeholder="点击上传红包图片"
              error={
                config.redpacketImageUrl
                  ? undefined
                  : "使用默认红包图片"
              }
            />
            <p className="text-xs text-gray-400">
              尺寸：115×133px，JPG/PNG/JPEG，最大 30KB
            </p>
          </div>

          {/* 引导文案 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                引导文案
                <span className="text-red-500 ml-1">*</span>
              </label>
              <ModeToggle value={guideTextMode} onChange={setGuideTextMode} />
            </div>
            <Input
              value={getGuideTextValue()}
              onChange={(e) => {
                if (guideTextMode === "macro") {
                  updateConfig({ guideTextMacro: e.target.value });
                } else {
                  updateConfig({ guideText: e.target.value });
                }
              }}
              placeholder={'如 ${guide_text}'}
            />
            <div className="flex justify-end">
              <CharCounter
                value={getGuideTextValue()}
                max={20}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 领奖场景配置 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">领奖场景</h3>
        </div>
        <div className="p-4 space-y-4">
          {/* 奖励类型 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">奖励类型</label>
            <div className="flex gap-4">
              <button
                onClick={() => updateConfig({ rewardType: "cash" })}
                className={cn(
                  "flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-colors",
                  config.rewardType === "cash"
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                现金奖励
              </button>
              <button
                onClick={() => updateConfig({ rewardType: "custom" })}
                className={cn(
                  "flex-1 py-2 px-4 rounded-lg border-2 text-sm font-medium transition-colors",
                  config.rewardType === "custom"
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                自定义图片
              </button>
            </div>
          </div>

          {/* 现金奖励 */}
          {config.rewardType === "cash" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">现金金额</label>
              <Input
                value={config.cashAmount || ""}
                onChange={(e) => updateConfig({ cashAmount: e.target.value })}
                placeholder="如 88.88"
              />
            </div>
          )}

          {/* 自定义奖励图片 */}
          {config.rewardType === "custom" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">奖励图片</label>
                <ModeToggle value={rewardImageMode} onChange={setRewardImageMode} />
              </div>
              {rewardImageMode === "input" ? (
                <>
                  <ImageUpload
                    value={config.rewardImageUrl || ""}
                    onChange={(url) => updateConfig({ rewardImageUrl: url })}
                    aspectRatio="16:9"
                    maxSize={0.3}
                    placeholder="点击上传奖励图片"
                  />
                  <p className="text-xs text-gray-400">
                    宽高比 16:9，JPG/PNG/JPEG，最大 300KB
                  </p>
                </>
              ) : (
                <>
                  <Input
                    value={getRewardImageValue()}
                    onChange={(e) => updateConfig({ rewardImageMacro: e.target.value })}
                    placeholder={'如 ${reward_image}'}
                  />
                  <p className="text-xs text-gray-400">
                    {'图片宏变量，如 ${reward_image}'}
                  </p>
                </>
              )}
            </div>
          )}

          {/* 奖品文案 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">奖品文案</label>
            <Input
              value={config.rewardText}
              onChange={(e) => updateConfig({ rewardText: e.target.value })}
              placeholder="输入奖品文案"
            />
            <div className="flex justify-end">
              <CharCounter value={config.rewardText} max={30} />
            </div>
          </div>

          {/* 特殊说明 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">特殊说明</label>
            <Input
              value={config.specialNote}
              onChange={(e) => updateConfig({ specialNote: e.target.value })}
              placeholder="输入特殊说明"
            />
            <div className="flex justify-end">
              <CharCounter value={config.specialNote} max={20} />
            </div>
          </div>
        </div>
      </div>

      {/* 落地页配置 */}
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
      />

      {/* 组件名称 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => setBasicOpen(!basicOpen)}
          className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50"
        >
          <span className="text-sm font-medium text-gray-700">组件名称</span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-gray-400 transition-transform",
              !basicOpen && "-rotate-90"
            )}
          />
        </button>
        {basicOpen && (
          <div className="p-4 space-y-4 border-t border-gray-200">
            <div className="space-y-2">
              <Input
                value={config.componentName || "点击红包领取奖品"}
                onChange={(e) => updateConfig({ componentName: e.target.value })}
                placeholder="输入组件名称"
              />
            </div>
          </div>
        )}
      </div>

      {/* 底部按钮 */}
      {(onSave || onCancel) && (
        <div className="flex gap-3 pt-4 mt-4 border-t border-gray-200">
          {onCancel && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="flex-1 h-10 px-4 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
          )}
          {onSave && (
            <button
              onClick={onSave}
              className="flex-1 h-10 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              保存
            </button>
          )}
        </div>
      )}

      {/* 取消确认弹窗 */}
      {showCancelConfirm && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setShowCancelConfirm(false)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 -translate-y-1/2">
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="px-5 pt-6 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">确认取消</h3>
                <p className="text-sm text-gray-500 mb-6">确定要取消编辑吗？未保存的更改将会丢失。</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 h-10 px-4 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    继续编辑
                  </button>
                  <button
                    onClick={() => {
                      setShowCancelConfirm(false);
                      onCancel?.();
                    }}
                    className="flex-1 h-10 px-4 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                    确认取消
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default FlipRedpacketTemplateConfigPanel;
