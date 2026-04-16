"use client";

import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { ChevronDown, Plus, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// 获取字符串显示宽度（中文2字符，英文1字符）
function getStringWidth(str: string): number {
  let width = 0;
  for (const char of str) {
    if (/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(char)) {
      width += 2;
    } else {
      width += 1;
    }
  }
  return width;
}

// 刮刮卡配置类型
export interface ScratchCardConfig {
  // 基础配置
  componentName: string;
  guideText: string;              // 引导文案（最多20字符）
  guideTextMacro: string;
  // 奖励配置
  rewardType: "cash" | "custom";  // 奖励类型
  cashAmount: string;              // 现金金额
  cashAmountMacro: string;
  rewardImageUrl: string;          // 自定义奖励图片
  rewardImageMacro: string;
  rewardText: string;             // 奖品文案（最多30字符）
  rewardTextMacro: string;
  specialNote: string;            // 特殊说明（最多20字符）
  specialNoteMacro: string;
  // 落地页配置
  landingPageUrl: string;         // 落地页链接
  landingPageMacro: string;
  defaultLandingPageUrl: string;   // 默认落地页（复用广告链接）
  // 宏变量
  macroVariables: Record<string, string>;
}

// 刮刮卡默认配置
export const defaultScratchCardConfig: ScratchCardConfig = {
  componentName: "好运刮出来！",
  guideText: "恭喜获得",
  guideTextMacro: "",
  rewardType: "cash",
  cashAmount: "88.88",
  cashAmountMacro: "",
  rewardImageUrl: "",
  rewardImageMacro: "",
  rewardText: "50元优惠券",
  rewardTextMacro: "",
  specialNote: "实际奖品以APP为准！",
  specialNoteMacro: "",
  landingPageUrl: "",
  landingPageMacro: "",
  defaultLandingPageUrl: "",
  macroVariables: {},
};

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
  const isOver = width > max;
  return (
    <span className={cn("text-xs", isOver ? "text-red-500" : "text-gray-400")}>
      {width}/{max}
    </span>
  );
}

// Section header
function SectionHeader({
  title,
  isOpen,
  onToggle,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      className="flex items-center justify-between w-full text-left"
      onClick={onToggle}
    >
      <span className="text-sm font-medium text-gray-700">{title}</span>
      <ChevronDown
        className={cn(
          "w-4 h-4 text-gray-400 transition-transform",
          isOpen && "rotate-180"
        )}
      />
    </button>
  );
}

interface ScratchCardTemplateConfigPanelProps {
  config: Partial<ScratchCardConfig>;
  onChange: (config: Partial<ScratchCardConfig>) => void;
  onCancel?: () => void;
  onSave?: () => void;
}

export function ScratchCardTemplateConfigPanel({
  config,
  onChange,
  onCancel,
  onSave,
}: ScratchCardTemplateConfigPanelProps) {
  // 折叠状态
  const [basicOpen, setBasicOpen] = useState(true);
  const [rewardOpen, setRewardOpen] = useState(true);
  const [landingOpen, setLandingOpen] = useState(true);

  // 模式状态
  const [guideTextMode, setGuideTextMode] = useState<"input" | "macro">(
    config.guideTextMacro ? "macro" : "input"
  );
  const [cashMode, setCashMode] = useState<"input" | "macro">(
    config.cashAmountMacro ? "macro" : "input"
  );
  const [rewardImageMode, setRewardImageMode] = useState<"input" | "macro">(
    config.rewardImageMacro ? "macro" : "input"
  );
  const [rewardTextMode, setRewardTextMode] = useState<"input" | "macro">(
    config.rewardTextMacro ? "macro" : "input"
  );
  const [specialNoteMode, setSpecialNoteMode] = useState<"input" | "macro">(
    config.specialNoteMacro ? "macro" : "input"
  );
  const [landingMode, setLandingMode] = useState<"input" | "macro">(
    config.landingPageMacro ? "macro" : "input"
  );

  // 奖励图片错误信息
  const [rewardImageError, setRewardImageError] = useState("");

  // 确保 rewardType 始终有有效值
  const [rewardType, setRewardType] = useState<"cash" | "custom">("cash");

  // 同步 config 中的 rewardType
  React.useEffect(() => {
    if (config.rewardType === "custom") {
      setRewardType("custom");
    }
  }, [config.rewardType]);

  // 更新配置
  const updateConfig = useCallback(
    (updates: Partial<ScratchCardConfig>) => {
      const newConfig = { ...config, ...updates };
      onChange(newConfig);
      if (updates.rewardType !== undefined) {
        setRewardType(updates.rewardType);
      }
    },
    [config, onChange]
  );

  return (
    <div className="space-y-4" suppressHydrationWarning>
      {/* 基础配置 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <SectionHeader
            title="基础配置"
            isOpen={basicOpen}
            onToggle={() => setBasicOpen(!basicOpen)}
          />
        </div>
        {basicOpen && (
          <div className="p-4 space-y-4">
            {/* 暂无其他基础配置 */}
          </div>
        )}
      </div>

      {/* 领奖配置 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <SectionHeader
            title="领奖配置"
            isOpen={rewardOpen}
            onToggle={() => setRewardOpen(!rewardOpen)}
          />
        </div>
        {rewardOpen && (
          <div className="p-4 space-y-4">
            {/* 奖励类型 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">奖励类型</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={rewardType === "cash"}
                    onChange={() => updateConfig({ rewardType: "cash" })}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-sm text-gray-600">现金</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={rewardType === "custom"}
                    onChange={() => updateConfig({ rewardType: "custom" })}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-sm text-gray-600">自定义</span>
                </label>
              </div>
            </div>

            {/* 现金奖励 */}
            {rewardType === "cash" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">现金金额</label>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <ModeToggle
                    value={cashMode}
                    onChange={setCashMode}
                  />
                </div>
                {cashMode === "input" ? (
                  <Input
                    placeholder="如 88.88"
                    value={config.cashAmount || ""}
                    onChange={(e) => updateConfig({ cashAmount: e.target.value, cashAmountMacro: "" })}
                  />
                ) : (
                  <Input
                    placeholder="如 ${cash_amount}"
                    value={config.cashAmountMacro || ""}
                    onChange={(e) => updateConfig({ cashAmountMacro: e.target.value })}
                  />
                )}
              </div>
            )}

            {/* 自定义奖励图片 */}
            {rewardType === "custom" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">奖励图片</label>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
                    <button
                      onClick={() => setRewardImageMode("input")}
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-md transition-all",
                        rewardImageMode === "input"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      自定义上传
                    </button>
                    <button
                      onClick={() => setRewardImageMode("macro")}
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-md transition-all",
                        rewardImageMode === "macro"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      )}
                    >
                      宏替换
                    </button>
                  </div>
                </div>
                {rewardImageMode === "input" ? (
                  <div className="space-y-2">
                    <div className={cn("border-2 border-dashed rounded-lg overflow-hidden", rewardImageError ? "border-red-300" : "border-gray-200")}>
                      {config.rewardImageUrl ? (
                        <div className="relative group p-2">
                          <img
                            src={config.rewardImageUrl}
                            alt="奖励图片"
                            className="w-full h-auto max-h-32 object-contain rounded"
                          />
                          <button
                            onClick={() => {
                              updateConfig({ rewardImageUrl: "" });
                              setRewardImageError("");
                            }}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center py-8 cursor-pointer hover:bg-gray-50">
                          <Plus className="w-6 h-6 text-gray-400" />
                          <span className="text-sm text-gray-500 mt-2">点击上传奖励图片</span>
                          <span className="text-xs text-gray-400">推荐 690×360px，最大 100KB</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const validTypes = ["image/jpeg", "image/png", "image/jpg"];
                                if (!validTypes.includes(file.type)) {
                                  setRewardImageError("仅支持 JPG/PNG/JPEG 格式");
                                  return;
                                }
                                if (file.size > 100 * 1024) {
                                  setRewardImageError(`图片大小不能超过 100KB，当前 ${(file.size / 1024).toFixed(1)}KB`);
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  updateConfig({ rewardImageUrl: ev.target?.result as string });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                    {rewardImageError && (
                      <div className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                        {rewardImageError}
                      </div>
                    )}
                  </div>
                ) : (
                  <Input
                    placeholder="如 ${reward_image}"
                    value={config.rewardImageMacro || ""}
                    onChange={(e) => updateConfig({ rewardImageMacro: e.target.value })}
                  />
                )}
              </div>
            )}

            {/* 特殊说明 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">特殊说明</label>
                <CharCounter value={config.specialNote || ""} max={20} />
              </div>
              <div className="flex items-center gap-2 mb-2">
                <ModeToggle
                  value={specialNoteMode}
                  onChange={setSpecialNoteMode}
                />
              </div>
              {specialNoteMode === "input" ? (
                <Input
                  placeholder="最多20个字符，10个汉字"
                  value={config.specialNote || ""}
                  onChange={(e) => updateConfig({ specialNote: e.target.value, specialNoteMacro: "" })}
                />
              ) : (
                <Input
                  placeholder="如 ${special_note}"
                  value={config.specialNoteMacro || ""}
                  onChange={(e) => updateConfig({ specialNoteMacro: e.target.value })}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* 落地页配置 */}
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
            <div className="flex items-center gap-2 mb-2">
              <ModeToggle
                value={landingMode}
                onChange={setLandingMode}
              />
            </div>
            {landingMode === "input" ? (
              <Input
                placeholder="请输入落地页链接"
                value={config.landingPageUrl || ""}
                onChange={(e) => updateConfig({ landingPageUrl: e.target.value, landingPageMacro: "" })}
              />
            ) : (
              <Input
                placeholder="如 ${landing_page}"
                value={config.landingPageMacro || ""}
                onChange={(e) => updateConfig({ landingPageMacro: e.target.value })}
              />
            )}
          </div>
        )}
      </div>

      {/* 组件名称 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <SectionHeader
            title="组件名称"
            isOpen={basicOpen}
            onToggle={() => setBasicOpen(!basicOpen)}
          />
        </div>
        {basicOpen && (
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="好运刮出来！"
                value={config.componentName || "好运刮出来！"}
                onChange={(e) => updateConfig({ componentName: e.target.value })}
              />
              <p className="text-xs text-gray-400 text-right">
                {getStringWidth(config.componentName || "好运刮出来！")}/20字符
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
