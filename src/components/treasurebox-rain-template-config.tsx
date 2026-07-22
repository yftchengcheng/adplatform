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
export interface TreasureboxRainConfig {
  // 宝箱元素
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
export interface TreasureboxRainTemplateConfig extends TreasureboxRainConfig {}

// 默认配置
export const defaultTreasureboxRainConfig: TreasureboxRainConfig = {
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
  treasureboxImageUrl: "",
  treasureboxImageMacro: "",
  landingPageUrl: "",
  landingPageMacro: "",
    landingPageType: "url",
    deeplinkUrl: "",
    deeplinkMacro: "",
  defaultLandingPageUrl: "",
  macroVariables: {
    guide_text: "点击宝箱，领取奖品",
    landing_url: "https://example.com/claim",
    cash_amount: "88.88",
    reward_image: "",
    reward_text: "恭喜发财",
    special_note: "实际奖品以APP为准！",
  },
  componentName: "宝箱雨",
};

interface TreasureboxRainTemplateConfigPanelProps {
  config: TreasureboxRainConfig;
  onChange: (config: TreasureboxRainConfig) => void;
  previewUrl?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

export function TreasureboxRainTemplateConfigPanel({
  config,
  onChange,
  previewUrl,
  onSave,
  onCancel,
}: TreasureboxRainTemplateConfigPanelProps) {
  // 折叠状态
  const [basicOpen, setBasicOpen] = useState(true);
  const [rewardOpen, setRewardOpen] = useState(true);
  const [landingOpen, setLandingOpen] = useState(true);
  const [otherOpen, setOtherOpen] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // 模式状态
  const [guideTextMode, setGuideTextMode] = useState<"input" | "macro">(
    config.guideTextMacro ? "macro" : "input"
  );
  const [rewardTextMode, setRewardTextMode] = useState<"input" | "macro">(
    config.rewardTextMacro ? "macro" : "input"
  );
  const [specialNoteMode, setSpecialNoteMode] = useState<"input" | "macro">(
    config.specialNoteMacro ? "macro" : "input"
  );
  const [cashMode, setCashMode] = useState<"input" | "macro">(
    config.cashAmountMacro ? "macro" : "input"
  );
  const [landingMode, setLandingMode] = useState<"input" | "macro">(
    config.landingPageMacro ? "macro" : "input"
  );
  const [rewardImageMode, setRewardImageMode] = useState<"input" | "macro">(
    config.rewardImageMacro ? "macro" : "input"
  );
  const [treasureboxImageMode, setTreasureboxImageMode] = useState<"input" | "macro">(
    config.treasureboxImageMacro ? "macro" : "input"
  );

  // 奖励图片错误信息
  const [rewardImageError, setRewardImageError] = useState("");

  // 确保 rewardType 始终有有效值，避免 hydration mismatch
  // 使用固定初始值，不依赖 config，确保服务端和客户端一致
  const [rewardType, setRewardType] = useState<"cash" | "custom">("cash");

  // 使用 useEffect 同步 config 中的 rewardType（只在客户端执行）
  React.useEffect(() => {
    if (config.rewardType === "custom") {
      setRewardType("custom");
    }
  }, [config.rewardType]);

  // 更新配置
  const updateConfig = useCallback(
    (updates: Partial<TreasureboxRainConfig>) => {
      const newConfig = { ...config, ...updates };
      onChange(newConfig);
      // 同步 rewardType 状态
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
            {/* 宝箱图片 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">宝箱图片</label>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => setTreasureboxImageMode("input")}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-all",
                      treasureboxImageMode === "input"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    自定义上传
                  </button>
                  <button
                    onClick={() => setTreasureboxImageMode("macro")}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-md transition-all",
                      treasureboxImageMode === "macro"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    宏替换
                  </button>
                </div>
              </div>
              {treasureboxImageMode === "input" ? (
                <div className="space-y-2">
                  <div className="border-2 border-dashed border-gray-200 rounded-lg overflow-hidden">
                    {config.treasureboxImageUrl ? (
                      <div className="relative group p-2">
                        <img
                          src={config.treasureboxImageUrl}
                          alt="宝箱图片"
                          className="w-full h-auto max-h-32 object-contain rounded"
                        />
                        <button
                          onClick={() => updateConfig({ treasureboxImageUrl: "" })}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center py-8 cursor-pointer hover:bg-gray-50">
                        <Plus className="w-6 h-6 text-gray-400" />
                        <span className="text-sm text-gray-500 mt-2">点击上传宝箱图片</span>
                        <span className="text-xs text-gray-400">推荐 133×115px，小于 30KB</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 30 * 1024) {
                                alert("图片大小不能超过 30KB");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                updateConfig({ treasureboxImageUrl: ev.target?.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    value={config.treasureboxImageMacro || ""}
                    onChange={(e) => updateConfig({ treasureboxImageMacro: e.target.value })}
                    placeholder="输入宝箱图片宏变量，如 ${treasurebox_image}"
                  />
                  <p className="text-xs text-gray-400">示例: {"${treasurebox_image}"}</p>
                </div>
              )}
            </div>

            {/* 引导文案 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">引导文案</label>
                <ModeToggle
                  value={guideTextMode}
                  onChange={setGuideTextMode}
                />
              </div>
              {guideTextMode === "input" ? (
                <div className="space-y-1">
                  <Input
                    value={config.guideText || ""}
                    onChange={(e) => updateConfig({ guideText: e.target.value })}
                    placeholder="输入引导文案"
                    maxLength={20}
                  />
                  <CharCounter value={config.guideText || ""} max={20} />
                </div>
              ) : (
                <div className="space-y-1">
                  <Input
                    value={config.guideTextMacro || ""}
                    onChange={(e) => updateConfig({ guideTextMacro: e.target.value })}
                    placeholder="输入引导文案宏变量"
                  />
                  <p className="text-xs text-gray-400">示例: {"${guide_text}"}</p>
                </div>
              )}
            </div>
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
                  <ModeToggle
                    value={cashMode}
                    onChange={setCashMode}
                  />
                </div>
                {cashMode === "input" ? (
                  <div className="space-y-1">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">¥</span>
                      <Input
                        value={config.cashAmount || ""}
                        onChange={(e) => updateConfig({ cashAmount: e.target.value })}
                        placeholder="输入金额"
                        className="pl-7"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Input
                      value={config.cashAmountMacro || ""}
                      onChange={(e) => updateConfig({ cashAmountMacro: e.target.value })}
                      placeholder="输入现金金额宏变量"
                    />
                    <p className="text-xs text-gray-400">示例: {"${cash_amount}"}</p>
                  </div>
                )}
              </div>
            )}

            {/* 自定义奖励图片 */}
            {rewardType === "custom" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">奖励图片</label>
                <div className="flex items-center gap-2 mb-2">
                  <ModeToggle
                    value={rewardImageMode}
                    onChange={setRewardImageMode}
                  />
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
                          <span className="text-xs text-gray-400">16:9 比例，JPG/PNG/JPEG，最大 300KB</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // 检验文件类型
                                const validTypes = ["image/jpeg", "image/png", "image/jpg"];
                                if (!validTypes.includes(file.type)) {
                                  setRewardImageError("仅支持 JPG/PNG/JPEG 格式");
                                  return;
                                }
                                // 检验文件大小
                                if (file.size > 300 * 1024) {
                                  setRewardImageError(`图片大小不能超过 300KB，当前 ${(file.size / 1024).toFixed(1)}KB`);
                                  return;
                                }
                                // 检验宽高比 16:9
                                const img = new window.Image();
                                img.onload = () => {
                                  const ratio = img.width / img.height;
                                  const targetRatio = 16 / 9;
                                  const tolerance = 0.05; // 允许 5% 的误差
                                  if (Math.abs(ratio - targetRatio) > tolerance) {
                                    setRewardImageError(`图片宽高比需为 16:9，当前 ${img.width}×${img.height}`);
                                    return;
                                  }
                                  setRewardImageError("");
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    updateConfig({ rewardImageUrl: ev.target?.result as string });
                                  };
                                  reader.readAsDataURL(file);
                                };
                                img.onerror = () => {
                                  setRewardImageError("图片加载失败，请重新上传");
                                };
                                img.src = URL.createObjectURL(file);
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                    {rewardImageError && (
                      <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{rewardImageError}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      value={config.rewardImageMacro || ""}
                      onChange={(e) => updateConfig({ rewardImageMacro: e.target.value })}
                      placeholder="输入奖励图片宏变量"
                    />
                    <p className="text-xs text-gray-400">示例: {"${reward_image}"}</p>
                  </div>
                )}
              </div>
            )}

            {/* 奖品文案 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">奖品文案</label>
                <ModeToggle
                  value={rewardTextMode}
                  onChange={setRewardTextMode}
                />
              </div>
              {rewardTextMode === "input" ? (
                <div className="space-y-1">
                  <Input
                    value={config.rewardText || ""}
                    onChange={(e) => updateConfig({ rewardText: e.target.value })}
                    placeholder="输入奖品文案"
                    maxLength={30}
                  />
                  <CharCounter value={config.rewardText || ""} max={30} />
                </div>
              ) : (
                <div className="space-y-1">
                  <Input
                    value={config.rewardTextMacro || ""}
                    onChange={(e) => updateConfig({ rewardTextMacro: e.target.value })}
                    placeholder="输入奖品文案宏变量"
                  />
                  <p className="text-xs text-gray-400">示例: {"${reward_text}"}</p>
                </div>
              )}
            </div>

            {/* 特殊说明 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">特殊说明</label>
                <ModeToggle
                  value={specialNoteMode}
                  onChange={setSpecialNoteMode}
                />
              </div>
              {specialNoteMode === "input" ? (
                <div className="space-y-1">
                  <Input
                    value={config.specialNote || ""}
                    onChange={(e) => updateConfig({ specialNote: e.target.value })}
                    placeholder="输入特殊说明"
                    maxLength={20}
                  />
                  <CharCounter value={config.specialNote || ""} max={20} />
                </div>
              ) : (
                <div className="space-y-1">
                  <Input
                    value={config.specialNoteMacro || ""}
                    onChange={(e) => updateConfig({ specialNoteMacro: e.target.value })}
                    placeholder="输入特殊说明宏变量"
                  />
                  <p className="text-xs text-gray-400">示例: {"${special_note}"}</p>
                </div>
              )}
            </div>
          </div>
        )}
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

      {/* 其他配置 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <SectionHeader
            title="其他配置"
            isOpen={otherOpen}
            onToggle={() => setOtherOpen(!otherOpen)}
          />
        </div>
        {otherOpen && (
          <div className="p-4 space-y-4">
            {/* 组件名称 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">组件名称</label>
              <Input
                value={config.componentName || ""}
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
