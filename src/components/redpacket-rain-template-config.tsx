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
export interface RedpacketRainConfig {
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
  // 组件名称
  componentName?: string;
}

// 模板配置类型
export interface RedpacketRainTemplateConfig extends RedpacketRainConfig {}

// 默认配置
export const defaultRedpacketRainConfig: RedpacketRainConfig = {
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
  redpacketImageUrl: "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F%E5%85%83%E7%B4%A02_%E5%89%AF%E6%9C%AC.png&nonce=e7fab6ca-83d2-448d-890a-25e1ed9b5876&project_id=7628071345674895423&sign=519ae46c48a91edf52823aefc5f8dd3e00a6c52faa6bcc80e87b981165b40600",
  redpacketImageMacro: "",
  landingPageUrl: "",
  landingPageMacro: "",
  defaultLandingPageUrl: "",
  macroVariables: {
    guide_text: "点击红包，领取奖品",
    landing_url: "https://example.com/claim",
    cash_amount: "88.88",
    reward_image: "",
    reward_text: "恭喜发财",
    special_note: "实际奖品以APP为准！",
  },
  componentName: "点击红包，领取奖品",
};

interface RedpacketRainTemplateConfigPanelProps {
  config: RedpacketRainConfig;
  onChange: (config: RedpacketRainConfig) => void;
  previewUrl?: string;
}

export function RedpacketRainTemplateConfigPanel({
  config,
  onChange,
  previewUrl,
}: RedpacketRainTemplateConfigPanelProps) {
  // 折叠状态
  const [basicOpen, setBasicOpen] = useState(true);
  const [rewardOpen, setRewardOpen] = useState(true);
  const [landingOpen, setLandingOpen] = useState(true);

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
  const [redpacketMode, setRedpacketMode] = useState<"upload" | "macro">(
    config.redpacketImageMacro ? "macro" : "upload"
  );
  const [rewardImageMode, setRewardImageMode] = useState<"upload" | "macro">(
    config.rewardImageMacro ? "macro" : "upload"
  );

  // 红包图片错误
  const [redpacketError, setRedpacketError] = useState<string | null>(null);
  // 奖励图片错误
  const [rewardImageError, setRewardImageError] = useState<string | null>(null);

  // 更新配置
  const updateConfig = useCallback((updates: Partial<RedpacketRainConfig>) => {
    onChange({ ...config, ...updates });
  }, [config, onChange]);

  // 获取落地页值
  const getLandingValue = () => {
    if (landingMode === "macro") {
      return config.landingPageMacro || "";
    }
    return config.landingPageUrl || "";
  };

  // 处理落地页输入
  const handleLandingInput = (value: string) => {
    if (landingMode) {
      updateConfig({ landingPageMacro: value, landingPageUrl: "" });
    } else {
      updateConfig({ landingPageUrl: value, landingPageMacro: "" });
    }
  };

  return (
    <div className="space-y-4">
      {/* 红包元素 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <SectionHeader
            title="红包元素"
            isOpen={basicOpen}
            onToggle={() => setBasicOpen(!basicOpen)}
            required
          />
        </div>
        {basicOpen && (
          <div className="p-4 space-y-4">
            {/* 红包图片 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  红包图片
                </label>
                <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => {
                      setRedpacketMode("upload");
                      setRedpacketError(null);
                    }}
                    className={cn(
                      "px-2 py-0.5 text-xs font-medium rounded transition-all",
                      redpacketMode === "upload" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
                    )}
                  >
                    上传
                  </button>
                  <button
                    onClick={() => {
                      setRedpacketMode("macro");
                      setRedpacketError(null);
                    }}
                    className={cn(
                      "px-2 py-0.5 text-xs font-medium rounded transition-all",
                      redpacketMode === "macro" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
                    )}
                  >
                    宏替换
                  </button>
                </div>
              </div>

              {redpacketMode === "macro" ? (
                <Input
                  placeholder="如 ${redpacket_image}"
                  value={config.redpacketImageMacro || ""}
                  onChange={(e) => updateConfig({ redpacketImageMacro: e.target.value, redpacketImageUrl: "" })}
                />
              ) : (
                <div>
                  {config.redpacketImageUrl ? (
                    <div className="relative w-20 h-20 border border-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={config.redpacketImageUrl}
                        alt="红包图片"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => updateConfig({ redpacketImageUrl: "", redpacketImageMacro: "" })}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className="relative flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-400">
                      <img
                        src={defaultRedpacketRainConfig.redpacketImageUrl}
                        alt="默认红包"
                        className="w-full h-full object-cover opacity-30"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                        <Plus className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          // 校验文件大小 30KB
                          if (file.size > 30 * 1024) {
                            setRedpacketError(`红包图片大小不能超过 30KB，当前 ${(file.size / 1024).toFixed(2)}KB`);
                            return;
                          }
                          // 校验精确尺寸 115×133px
                          const img = new window.Image();
                          img.onload = () => {
                            if (img.naturalWidth !== 115 || img.naturalHeight !== 133) {
                              setRedpacketError(`红包图片尺寸需为 115×133px，当前 ${img.naturalWidth}×${img.naturalHeight}px`);
                              return;
                            }
                            setRedpacketError(null);
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              updateConfig({ redpacketImageUrl: ev.target?.result as string, redpacketImageMacro: "" });
                            };
                            reader.readAsDataURL(file);
                          };
                          img.onerror = () => {
                            setRedpacketError("无法读取图片文件，请选择其他图片");
                          };
                          img.src = URL.createObjectURL(file);
                        }}
                      />
                    </label>
                  )}
                </div>
              )}
              {redpacketError && (
                <p className="text-xs text-red-500 mt-1">{redpacketError}</p>
              )}
              <p className="text-xs text-gray-400">尺寸 115×133px，最大 30KB</p>
            </div>

            {/* 引导文案 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  引导文案
                </label>
                <ModeToggle
                  value={guideTextMode}
                  onChange={(v) => {
                    setGuideTextMode(v);
                    if (v === "macro") {
                      updateConfig({ guideTextMacro: config.guideText, guideText: "" });
                    } else {
                      updateConfig({ guideText: config.guideTextMacro || "", guideTextMacro: "" });
                    }
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="点击红包，领取奖品"
                  value={guideTextMode === "macro" ? (config.guideTextMacro || "") : config.guideText}
                  onChange={(e) => {
                    if (guideTextMode === "macro") {
                      updateConfig({ guideTextMacro: e.target.value });
                    } else {
                      updateConfig({ guideText: e.target.value, guideTextMacro: "" });
                    }
                  }}
                  className="flex-1"
                />
                <CharCounter
                  value={guideTextMode === "macro" ? (config.guideTextMacro || "") : config.guideText}
                  max={20}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 领奖场景 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <SectionHeader
            title="领奖场景"
            isOpen={rewardOpen}
            onToggle={() => setRewardOpen(!rewardOpen)}
            required
          />
        </div>
        {rewardOpen && (
          <div className="p-4 space-y-4">
            {/* 奖励类型 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">奖励类型</label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateConfig({ rewardType: "cash", rewardImageUrl: "", rewardImageMacro: "" })}
                  className={cn(
                    "px-4 py-2 text-sm rounded-lg border transition-all",
                    config.rewardType === "cash"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  现金
                </button>
                <button
                  onClick={() => updateConfig({ rewardType: "custom", cashAmount: "", cashAmountMacro: "" })}
                  className={cn(
                    "px-4 py-2 text-sm rounded-lg border transition-all",
                    config.rewardType === "custom"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  自定义
                </button>
              </div>
            </div>

            {/* 现金奖励 */}
            {config.rewardType === "cash" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">金额</label>
                  <ModeToggle
                    value={cashMode}
                    onChange={(v) => {
                      setCashMode(v);
                      if (v === "macro") {
                        updateConfig({ cashAmountMacro: config.cashAmount, cashAmount: "" });
                      } else {
                        updateConfig({ cashAmount: config.cashAmountMacro || "", cashAmountMacro: "" });
                      }
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    {cashMode === "macro" ? (
                      <Input
                        placeholder="如 ${cash_amount}"
                        value={config.cashAmountMacro || ""}
                        onChange={(e) => updateConfig({ cashAmountMacro: e.target.value })}
                      />
                    ) : (
                      <Input
                        placeholder="88.88"
                        value={config.cashAmount || ""}
                        onChange={(e) => updateConfig({ cashAmount: e.target.value, cashAmountMacro: "" })}
                      />
                    )}
                    {cashMode === "input" && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">元</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 自定义奖励图片 */}
            {config.rewardType === "custom" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">奖励图片</label>
                  <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
                    <button
                      onClick={() => {
                        setRewardImageMode("upload");
                        setRewardImageError(null);
                      }}
                      className={cn(
                        "px-2 py-0.5 text-xs font-medium rounded transition-all",
                        rewardImageMode === "upload" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
                      )}
                    >
                      上传
                    </button>
                    <button
                      onClick={() => {
                        setRewardImageMode("macro");
                        setRewardImageError(null);
                      }}
                      className={cn(
                        "px-2 py-0.5 text-xs font-medium rounded transition-all",
                        rewardImageMode === "macro" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
                      )}
                    >
                      宏替换
                    </button>
                  </div>
                </div>

                {rewardImageMode === "macro" ? (
                  <Input
                    placeholder="如 ${reward_image}"
                    value={config.rewardImageMacro || ""}
                    onChange={(e) => updateConfig({ rewardImageMacro: e.target.value, rewardImageUrl: "" })}
                  />
                ) : (
                  <div>
                    {config.rewardImageUrl ? (
                      <div className="relative w-full h-24 border border-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={config.rewardImageUrl}
                          alt="奖励图片"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => updateConfig({ rewardImageUrl: "", rewardImageMacro: "" })}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center"
                        >
                          <Trash2 className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-400">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                        <span className="text-sm text-gray-400">点击上传图片</span>
                        <span className="text-xs text-gray-400">16:9，推荐 690×360px，最大 100KB</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            // 校验文件大小 100KB
                            if (file.size > 100 * 1024) {
                              setRewardImageError(`奖励图片大小不能超过 100KB，当前 ${(file.size / 1024).toFixed(2)}KB`);
                              return;
                            }
                            // 校验宽高比 16:9
                            const img = new window.Image();
                            img.onload = () => {
                              const ratio = img.naturalWidth / img.naturalHeight;
                              const targetRatio = 16 / 9;
                              if (Math.abs(ratio - targetRatio) > 0.1) {
                                setRewardImageError(`奖励图片宽高比需为 16:9，当前 ${img.naturalWidth}×${img.naturalHeight}`);
                                return;
                              }
                              setRewardImageError(null);
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                updateConfig({ rewardImageUrl: ev.target?.result as string, rewardImageMacro: "" });
                              };
                              reader.readAsDataURL(file);
                            };
                            img.onerror = () => {
                              setRewardImageError("无法读取图片文件，请选择其他图片");
                            };
                            img.src = URL.createObjectURL(file);
                          }}
                        />
                      </label>
                    )}
                  </div>
                )}
                {rewardImageError && (
                  <p className="text-xs text-red-500 mt-1">{rewardImageError}</p>
                )}
                <p className="text-xs text-gray-400">宽高比 16:9，推荐 690×360px，最大 100KB</p>
              </div>
            )}

            {/* 奖品文案 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">奖品文案</label>
                <ModeToggle
                  value={rewardTextMode}
                  onChange={(v) => {
                    setRewardTextMode(v);
                    if (v === "macro") {
                      updateConfig({ rewardTextMacro: config.rewardText, rewardText: "" });
                    } else {
                      updateConfig({ rewardText: config.rewardTextMacro || "", rewardTextMacro: "" });
                    }
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="恭喜发财"
                  value={rewardTextMode === "macro" ? (config.rewardTextMacro || "") : config.rewardText}
                  onChange={(e) => {
                    if (rewardTextMode === "macro") {
                      updateConfig({ rewardTextMacro: e.target.value });
                    } else {
                      updateConfig({ rewardText: e.target.value, rewardTextMacro: "" });
                    }
                  }}
                  className="flex-1"
                />
                <CharCounter
                  value={rewardTextMode === "macro" ? (config.rewardTextMacro || "") : config.rewardText}
                  max={30}
                />
              </div>
            </div>

            {/* 特殊说明 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">特殊说明</label>
                <ModeToggle
                  value={specialNoteMode}
                  onChange={(v) => {
                    setSpecialNoteMode(v);
                    if (v === "macro") {
                      updateConfig({ specialNoteMacro: config.specialNote, specialNote: "" });
                    } else {
                      updateConfig({ specialNote: config.specialNoteMacro || "", specialNoteMacro: "" });
                    }
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="实际奖品以APP为准！"
                  value={specialNoteMode === "macro" ? (config.specialNoteMacro || "") : config.specialNote}
                  onChange={(e) => {
                    if (specialNoteMode === "macro") {
                      updateConfig({ specialNoteMacro: e.target.value });
                    } else {
                      updateConfig({ specialNote: e.target.value, specialNoteMacro: "" });
                    }
                  }}
                  className="flex-1"
                />
                <CharCounter
                  value={specialNoteMode === "macro" ? (config.specialNoteMacro || "") : config.specialNote}
                  max={20}
                />
              </div>
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
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                点击后动作
              </label>
              <ModeToggle
                value={landingMode}
                onChange={(v) => {
                  setLandingMode(v);
                  if (v === "macro") {
                    updateConfig({ landingPageMacro: config.landingPageUrl, landingPageUrl: "" });
                  } else {
                    updateConfig({ landingPageUrl: config.landingPageMacro || "", landingPageMacro: "" });
                  }
                }}
              />
            </div>

            {landingMode === "macro" ? (
              <div className="space-y-2">
                <Input
                  placeholder="如 ${landing_url}"
                  value={getLandingValue()}
                  onChange={handleLandingInput}
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
                  value={getLandingValue()}
                  onChange={handleLandingInput}
                />
                <p className="text-xs text-gray-400">
                  不配置默认使用广告（素材）链接
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview Button */}
      {previewUrl && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => window.open(previewUrl, "_blank")}
            className="gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            预览效果
          </Button>
        </div>
      )}

      {/* 组件名称 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-700">组件名称</span>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Input
              placeholder="请输入组件名称"
              value={typeof config.componentName === "string" ? config.componentName : ""}
              onChange={(e) => {
                const value = typeof e.target.value === "string" ? e.target.value : "";
                onChange({ ...config, componentName: value });
              }}
              className="flex-1"
            />
            <CharCounter
              value={config.componentName || ""}
              max={20}
            />
          </div>
          <p className="text-xs text-gray-400">
            默认值取自引导文案，修改后自动同步
          </p>
        </div>
      </div>
    </div>
  );
}
