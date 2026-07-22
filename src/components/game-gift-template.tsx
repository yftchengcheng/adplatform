"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { openLandingPage } from "./landing-page-config";

export interface GameGiftTemplateConfig {
  // 组件名称
  componentName?: string;
  componentNameMacro?: string;
  // 应用图片（最多2张，支持轮播）
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
  // 默认落地页
  defaultLandingPageUrl?: string;
  landingPageMacro?: string;
  landingPageType?: "url" | "deeplink"; // 跳转类型
  deeplinkUrl?: string; // Deeplink地址
  deeplinkMacro?: string; // Deeplink宏变量
  // 宏替换变量
  macroVariables?: Record<string, string>;
}

export interface GameGiftTemplateProps {
  config: GameGiftTemplateConfig;
  isOpen?: boolean;
  onClose?: () => void;
  onButtonClick?: (config: GameGiftTemplateConfig) => void;
  previewMode?: boolean;
}

// 默认配置
const defaultConfig: GameGiftTemplateConfig = {
  images: [{ id: "1", imageUrl: "" }],
  logoUrl: "",
  appName: "游戏名称",
  appDescription: "游戏描述内容",
  appPackageName: "com.example.game",
  downloadUrl: "",
  giftCode: "",
  defaultLandingPageUrl: "",
};

export function GameGiftTemplate({
  config,
  isOpen = true,
  onClose,
  onButtonClick,
  previewMode = false,
}: GameGiftTemplateProps) {
  const finalConfig: GameGiftTemplateConfig = {
    ...defaultConfig,
    ...config,
  };

  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 宏替换函数
  const resolveMacro = (macro: string): string => {
    if (!macro || !finalConfig.macroVariables) return macro;
    let result = macro;
    Object.entries(finalConfig.macroVariables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
      result = result.replace(new RegExp(`\\$${key}`, 'g'), value);
    });
    return result;
  };

  // 解析组件名称
  const resolveComponentName = (): string => {
    if (finalConfig.componentNameMacro) {
      const resolved = resolveMacro(finalConfig.componentNameMacro);
      if (resolved.includes('${') || resolved.startsWith('$')) {
        return finalConfig.componentName || "游戏礼包码";
      }
      return resolved;
    }
    return finalConfig.componentName || "游戏礼包码";
  };

  // 解析应用名称
  const resolveAppName = (): string => {
    if (finalConfig.appNameMacro) {
      const resolved = resolveMacro(finalConfig.appNameMacro);
      if (resolved.includes('${') || resolved.startsWith('$')) {
        return finalConfig.appName;
      }
      return resolved;
    }
    return finalConfig.appName;
  };

  // 解析应用描述
  const resolveAppDescription = (): string => {
    if (finalConfig.appDescriptionMacro) {
      const resolved = resolveMacro(finalConfig.appDescriptionMacro);
      if (resolved.includes('${') || resolved.startsWith('$')) {
        return finalConfig.appDescription;
      }
      return resolved;
    }
    return finalConfig.appDescription;
  };

  // 解析应用包名
  const resolveAppPackageName = (): string => {
    if (finalConfig.appPackageMacro) {
      const resolved = resolveMacro(finalConfig.appPackageMacro);
      if (resolved.includes('${') || resolved.startsWith('$')) {
        return finalConfig.appPackageName || "";
      }
      return resolved;
    }
    return finalConfig.appPackageName || "";
  };

  // 解析礼包码
  const resolveGiftCode = (): string => {
    if (finalConfig.giftCodeMacro) {
      const resolved = resolveMacro(finalConfig.giftCodeMacro);
      if (resolved.includes('${') || resolved.startsWith('$')) {
        return finalConfig.giftCode || "";
      }
      return resolved;
    }
    return finalConfig.giftCode || "";
  };

  // 解析下载链接
  const resolveDownloadUrl = (): string | undefined => {
    if (finalConfig.downloadMacro) {
      const resolved = resolveMacro(finalConfig.downloadMacro);
      if (resolved.includes('${') || resolved.startsWith('$')) {
        return undefined;
      }
      return resolved;
    }
    if (finalConfig.downloadUrl) {
      return resolveMacro(finalConfig.downloadUrl);
    }
    if (finalConfig.defaultLandingPageUrl) {
      return resolveMacro(finalConfig.defaultLandingPageUrl);
    }
    return undefined;
  };

  // 入场动画
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = resolveDownloadUrl();
    if (url) {
      openLandingPage(finalConfig, url);
    }
    onButtonClick?.(finalConfig);
  };

  if (!isVisible && previewMode === false) return null;

  // 解析 Logo 图片
  const logoSrc = (() => {
    if (finalConfig.logoMacro) {
      const resolved = resolveMacro(finalConfig.logoMacro);
      if (resolved.includes('${') || resolved.startsWith('$')) {
        return undefined;
      }
      return resolved;
    }
    if (finalConfig.logoUrl) {
      return resolveMacro(finalConfig.logoUrl);
    }
    return undefined;
  })();

  return (
    <div
      className={cn(
        previewMode
          ? "w-full absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex items-center justify-center"
          : ""
      )}
    >
      {/* Backdrop */}
      <div
        className={cn(
          previewMode
            ? "flex items-center justify-center w-full"
            : "fixed inset-0 z-50 bg-black/50",
          "transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={!previewMode ? onClose : undefined}
      >
        {/* Card - Glass */}
        <div
          className={cn(
            "relative w-full max-w-[320px] overflow-hidden rounded-2xl",
            "transition-all duration-300",
            !previewMode && (isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0")
          )}
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            boxShadow:
              "0 12px 32px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.35)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button - Glass */}
          <button
            onClick={onClose}
            aria-label="关闭"
            className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center rounded-full z-10 transition-all hover:opacity-80"
            style={{
              background: "rgba(255, 255, 255, 0.4)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              border: "0.5px solid rgba(255, 255, 255, 0.5)",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)",
            }}
          >
            <X className="w-3 h-3 text-gray-600" />
          </button>

          {/* Content */}
          <div className="p-3.5 space-y-2.5">
            {/* Component Name - 顶部小标 */}
            <p
              className="text-[10px] uppercase font-medium pr-6"
              style={{
                color: "rgb(107, 114, 128)",
                letterSpacing: "0.15em",
              }}
            >
              {resolveComponentName()}
            </p>

            {/* Left & Right Row */}
            <div className="flex gap-3 items-center">
              {/* Left: Logo */}
              <div
                className="flex-shrink-0 w-[56px] h-[56px] rounded-xl overflow-hidden flex items-center justify-center"
                style={{
                  background: "rgba(255, 255, 255, 0.45)",
                  boxShadow:
                    "inset 0 0 0 0.5px rgba(255, 255, 255, 0.4), 0 2px 6px rgba(0, 0, 0, 0.06)",
                }}
              >
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt="应用Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-gray-400 text-[10px]">Logo</span>
                )}
              </div>

              {/* Right: Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                {/* App Name */}
                <p className="text-[15px] font-semibold text-gray-900 truncate leading-tight tracking-tight">
                  {resolveAppName()}
                </p>

                {/* App Description */}
                <p className="text-xs text-gray-600 line-clamp-2 leading-snug">
                  {resolveAppDescription()}
                </p>

                {/* Package Name & Gift Code */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  {resolveAppPackageName() && (
                    <span className="text-[10px] text-gray-500 truncate font-mono">
                      {resolveAppPackageName()}
                    </span>
                  )}
                  {resolveGiftCode() && (
                    <span
                      className="text-[10px] font-medium text-blue-600 truncate px-1.5 py-0.5 rounded tabular-nums"
                      style={{
                        background: "rgba(59, 130, 246, 0.12)",
                        border: "0.5px solid rgba(59, 130, 246, 0.28)",
                      }}
                    >
                      码: {resolveGiftCode()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Download Button - 蓝渐变 CTA */}
          <div className="px-3.5 pb-3.5">
            <button
              onClick={handleDownloadClick}
              className="w-full h-9 text-white text-[13px] font-semibold rounded-lg flex items-center justify-center transition-all hover:opacity-95"
              style={{
                background: "linear-gradient(180deg, #3B97FF 0%, #2079F0 100%)",
                boxShadow:
                  "0 4px 12px rgba(48, 135, 255, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.30)",
                border: "0.5px solid rgba(255, 255, 255, 0.18)",
                letterSpacing: "0.02em",
              }}
            >
              立即下载
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
