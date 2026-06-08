"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";

/**
 * 跳转类型
 */
export type LandingPageType = "url" | "deeplink";

/**
 * 落地页配置值
 */
export interface LandingPageConfigValue {
  landingPageType?: LandingPageType;
  landingPageUrl?: string;
  landingPageMacro?: string;
  deeplinkUrl?: string;
  deeplinkMacro?: string;
  defaultLandingPageUrl?: string;
  macroVariables?: Record<string, string>;
}

interface LandingPageConfigSectionProps {
  config: LandingPageConfigValue;
  onChange: (updates: Partial<LandingPageConfigValue>) => void;
  /** 是否默认展开 */
  defaultOpen?: boolean;
  /** 提示文字 */
  hint?: string;
  /** 区块标题，默认"落地页配置" */
  sectionTitle?: string;
  /** URL类型标签，默认"落地页链接" */
  urlLabel?: string;
  /** Deeplink类型标签，默认"Deeplink" */
  deeplinkLabel?: string;
}

/**
 * 落地页配置区块组件
 * 支持"落地页链接"和"Deeplink"两种跳转类型，每种都支持输入模式和宏模式
 */
export function LandingPageConfigSection({
  config,
  onChange,
  defaultOpen = true,
  hint = "支持手动输入、宏替换",
  sectionTitle = "落地页配置",
  urlLabel = "落地页链接",
  deeplinkLabel = "Deeplink",
}: LandingPageConfigSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [landingPageMode, setLandingPageMode] = useState<"input" | "macro">(
    config.landingPageMacro ? "macro" : "input"
  );
  const [deeplinkMode, setDeeplinkMode] = useState<"input" | "macro">(
    config.deeplinkMacro ? "macro" : "input"
  );

  const landingPageType = config.landingPageType || "url";

  const handleLandingPageInput = (value: string) => {
    if (landingPageMode === "macro") {
      onChange({ landingPageMacro: value, landingPageUrl: "" });
    } else {
      onChange({ landingPageUrl: value, landingPageMacro: "" });
    }
  };

  const handleDeeplinkInput = (value: string) => {
    if (deeplinkMode === "macro") {
      onChange({ deeplinkMacro: value, deeplinkUrl: "" });
    } else {
      onChange({ deeplinkUrl: value, deeplinkMacro: "" });
    }
  };

  const getLandingPageValue = (): string => {
    return landingPageMode === "macro"
      ? (config.landingPageMacro || "")
      : (config.landingPageUrl || "");
  };

  const getDeeplinkValue = (): string => {
    return deeplinkMode === "macro"
      ? (config.deeplinkMacro || "")
      : (config.deeplinkUrl || "");
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700">{sectionTitle}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-4">
          {hint && <p className="text-xs text-gray-400">{hint}</p>}

          {/* 跳转类型选择 */}
          <div className="space-y-2">
            <label className="text-xs text-gray-500">跳转类型</label>
            <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
              <button
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  landingPageType === "url"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => onChange({ landingPageType: "url" })}
              >
                {urlLabel}
              </button>
              <button
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  landingPageType === "deeplink"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => onChange({ landingPageType: "deeplink" })}
              >
                {deeplinkLabel}
              </button>
            </div>
          </div>

          {/* 落地页链接输入 */}
          {landingPageType === "url" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500">{urlLabel}</label>
                <ModeToggle
                  value={landingPageMode}
                  onChange={(mode) => {
                    setLandingPageMode(mode);
                    // 切换模式时清空另一模式的值
                    if (mode === "input") {
                      onChange({ landingPageMacro: "" });
                    } else {
                      onChange({ landingPageUrl: "" });
                    }
                  }}
                />
              </div>
              <Input
                value={getLandingPageValue()}
                onChange={(e) => handleLandingPageInput(e.target.value)}
                placeholder={
                  landingPageMode === "macro"
                    ? `如 {landing_page}`
                    : `请输入${urlLabel}`
                }
              />
            </div>
          )}

          {/* Deeplink 输入 */}
          {landingPageType === "deeplink" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500">{deeplinkLabel}</label>
                <ModeToggle
                  value={deeplinkMode}
                  onChange={(mode) => {
                    setDeeplinkMode(mode);
                    if (mode === "input") {
                      onChange({ deeplinkMacro: "" });
                    } else {
                      onChange({ deeplinkUrl: "" });
                    }
                  }}
                />
              </div>
              <Input
                value={getDeeplinkValue()}
                onChange={(e) => handleDeeplinkInput(e.target.value)}
                placeholder={
                  deeplinkMode === "macro"
                    ? "如 {deeplink_url}"
                    : `请输入 ${deeplinkLabel} 地址`
                }
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * 模式切换组件（输入模式 / 宏模式）
 */
function ModeToggle({
  value,
  onChange,
}: {
  value: "input" | "macro";
  onChange: (value: "input" | "macro") => void;
}) {
  return (
    <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
      <button
        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
          value === "input"
            ? "bg-white shadow-sm text-gray-900"
            : "text-gray-500 hover:text-gray-700"
        }`}
        onClick={() => onChange("input")}
      >
        输入模式
      </button>
      <button
        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
          value === "macro"
            ? "bg-white shadow-sm text-gray-900"
            : "text-gray-500 hover:text-gray-700"
        }`}
        onClick={() => onChange("macro")}
      >
        宏模式
      </button>
    </div>
  );
}

/**
 * 获取解析后的跳转URL（考虑落地页类型和宏变量替换）
 */
export function resolveLandingPageUrl(config: LandingPageConfigValue): string {
  const type = config.landingPageType || "url";

  if (type === "deeplink") {
    const raw = config.deeplinkMacro || config.deeplinkUrl || "";
    return resolveMacro(raw, config.macroVariables);
  }

  // url 类型
  const raw = config.landingPageMacro || config.landingPageUrl || config.defaultLandingPageUrl || "";
  return resolveMacro(raw, config.macroVariables);
}

function resolveMacro(macro: string, macroVariables?: Record<string, string>): string {
  if (!macro || !macroVariables) return macro;
  let result = macro;
  Object.entries(macroVariables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\$\\{${key}\\}`, "g"), value);
    result = result.replace(new RegExp(`\\$${key}`, "g"), value);
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  });
  return result;
}

/**
 * 打开落地页：URL 类型用 window.open 新窗口打开，Deeplink 类型用 window.location.href 跳转
 */
export function openLandingPage(config: LandingPageConfigValue, resolvedUrl?: string): void {
  const url = resolvedUrl || resolveLandingPageUrl(config);
  if (!url) return;
  
  const type = config.landingPageType || "url";
  if (type === "deeplink") {
    window.location.href = url;
  } else {
    window.open(url, "_blank");
  }
}
