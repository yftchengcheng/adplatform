"use client";

import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus, Trash2, ImageIcon, Link2 } from "lucide-react";
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

// Image upload component
function ImageUpload({
  value,
  onChange,
  aspectRatio,
  maxSize,
  placeholder = "点击上传图片",
  error,
}: {
  value: string;
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

    // 清除之前的错误提示
    setUploadError("");

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("请上传图片文件（支持 JPG、PNG、GIF、WebP 等格式）");
      return;
    }

    // Validate file size
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      setUploadError(`图片大小不能超过 ${maxSize}MB，当前文件 ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return;
    }

    // Validate aspect ratio
    if (aspectRatio) {
      const [w, h] = aspectRatio.split(":").map(Number);
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        const expectedRatio = w / h;
        if (Math.abs(ratio - expectedRatio) > 0.1) {
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
      let uploadedUrl = "";
      reader.onload = (event) => {
        uploadedUrl = event.target?.result as string;
        setPreviewUrl(uploadedUrl);
      };
      reader.readAsDataURL(file);

      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        onChange(uploadedUrl);
      }, 500);
    }
  };

  const handleDelete = () => {
    setPreviewUrl("");
    onChange("");
    setUploadError("");
  };

  const displayError = uploadError || error;

  return (
    <div className="space-y-2">
      <label className="relative flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
        {previewUrl ? (
          <div className="relative w-full h-full">
            <img src={previewUrl} alt="Preview" className="w-full h-auto object-contain max-h-32" />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        ) : (
          <>
            <Plus className="w-6 h-6 text-gray-400 mb-1" />
            <span className="text-sm text-gray-500">{placeholder}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </>
        )}
      </label>
      {previewUrl && (
        <div className="relative flex gap-2">
          <label className="relative flex-1 flex items-center justify-center py-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm text-gray-600">
            重新上传
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </label>
          <button
            onClick={handleDelete}
            className="relative flex-1 flex items-center justify-center py-2 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors text-sm"
          >
            删除
          </button>
        </div>
      )}
      {displayError && (
        <p className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
          {displayError}
        </p>
      )}
    </div>
  );
}

// 配置数据类型
export interface TreasureBoxConfig {
  // 宝箱图片
  treasureboxImageUrl?: string;
  treasureboxImageMacro?: string;
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
  // 组件名称
  componentName?: string;
}

// 默认配置
export const defaultTreasureBoxConfig: TreasureBoxConfig = {
  guideText: "点击宝箱，领取奖品",
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
  treasureboxImageUrl: "/treasurebox-close.png",
  treasureboxImageMacro: "",
  landingPageUrl: "",
  landingPageMacro: "",
  defaultLandingPageUrl: "",
  macroVariables: {},
  componentName: "点击宝箱领取奖品",
};

// Props
export interface TreasureBoxTemplateConfigPanelProps {
  config: TreasureBoxConfig;
  onChange: (config: TreasureBoxConfig) => void;
  macroVariables?: Record<string, string>;
  onMacroVariablesChange?: (vars: Record<string, string>) => void;
}

// 主配置面板
export function TreasureBoxTemplateConfigPanel({
  config,
  onChange,
  macroVariables = {},
  onMacroVariablesChange,
}: TreasureBoxTemplateConfigPanelProps) {
  const updateConfig = useCallback(
    (updates: Partial<TreasureBoxConfig>) => {
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

  return (
    <div className="space-y-4">
      {/* 基础配置 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">基础配置</h3>
        </div>
        <div className="p-4 space-y-4">
          {/* 宝箱图片 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">宝箱图片</label>
            <ImageUpload
              value={config.treasureboxImageUrl || ""}
              onChange={(url) => updateConfig({ treasureboxImageUrl: url })}
              aspectRatio="133:115"
              maxSize={0.03}
              placeholder="点击上传宝箱图片"
              error={
                config.treasureboxImageUrl
                  ? undefined
                  : "使用默认宝箱图片"
              }
            />
            <p className="text-xs text-gray-400">
              尺寸：133×115px，JPG/PNG/JPEG，最大 30KB
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
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">现金金额</label>
                <ModeToggle
                  value={config.cashAmountMacro ? "macro" : "input"}
                  onChange={(mode) => {
                    if (mode === "input") {
                      updateConfig({ cashAmountMacro: "" });
                    } else {
                      updateConfig({ cashAmountMacro: config.cashAmount || "" });
                    }
                  }}
                />
              </div>
              {config.cashAmountMacro ? (
                <Input
                  value={config.cashAmountMacro || ""}
                  onChange={(e) => updateConfig({ cashAmountMacro: e.target.value })}
                  placeholder={'如 ${cash_amount}'}
                />
              ) : (
                <Input
                  value={config.cashAmount || ""}
                  onChange={(e) => updateConfig({ cashAmount: e.target.value })}
                  placeholder="输入现金金额"
                />
              )}
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
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => setLandingOpen(!landingOpen)}
          className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50"
        >
          <span className="text-sm font-medium text-gray-700">落地页配置</span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-gray-400 transition-transform",
              !landingOpen && "-rotate-90"
            )}
          />
        </button>
        {landingOpen && (
          <div className="p-4 space-y-4 border-t border-gray-200">
            {/* 落地页模式 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">落地页</label>
                <ModeToggle value={landingPageMode} onChange={setLandingPageMode} />
              </div>
              <Input
                value={getLandingPageValue()}
                onChange={(e) => {
                  if (landingPageMode === "macro") {
                    updateConfig({ landingPageMacro: e.target.value });
                  } else {
                    updateConfig({ landingPageUrl: e.target.value });
                  }
                }}
                placeholder={landingPageMode === "macro" ? '如 ${landing_url}' : "输入落地页链接"}
              />
            </div>

            {/* 默认落地页 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">默认落地页</label>
              <Input
                value={config.defaultLandingPageUrl || ""}
                onChange={(e) => updateConfig({ defaultLandingPageUrl: e.target.value })}
                placeholder="输入默认落地页链接"
              />
              <p className="text-xs text-gray-400">
                当宏变量未解析时使用此链接
              </p>
            </div>
          </div>
        )}
      </div>

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
                value={config.componentName || "点击宝箱领取奖品"}
                onChange={(e) => updateConfig({ componentName: e.target.value })}
                placeholder="输入组件名称"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TreasureBoxTemplateConfigPanel;
