"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GameGiftTemplateConfig {
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
      window.open(url, "_blank");
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
    <div className={cn(previewMode ? "w-full flex items-center justify-center" : "")}>
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
        {/* Card */}
        <div
          className={cn(
            "relative w-full max-w-[300px] bg-white rounded-lg shadow-lg overflow-hidden",
            "transition-all duration-300",
            !previewMode && (isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0")
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button - 仅在非预览模式下显示 */}
          {!previewMode && (
            <button
              onClick={onClose}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-gray-500 z-10 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Content */}
          <div className="flex p-3 gap-3">
            {/* Left: Logo */}
            <div className="flex-shrink-0 w-[67px] h-[67px] rounded bg-gray-100 overflow-hidden">
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
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  Logo
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              {/* App Name */}
              <p className="text-sm font-medium text-gray-900 truncate">
                {resolveAppName()}
              </p>

              {/* App Description */}
              <p className="text-xs text-gray-500 line-clamp-2">
                {resolveAppDescription()}
              </p>

              {/* Package Name & Gift Code */}
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                {finalConfig.appPackageName && (
                  <span className="truncate">{finalConfig.appPackageName}</span>
                )}
                {finalConfig.giftCode && (
                  <span className="text-blue-500 truncate">码: {finalConfig.giftCode}</span>
                )}
              </div>
            </div>
          </div>

          {/* Bottom: Download Button */}
          <div className="px-3 pb-3">
            <button
              onClick={handleDownloadClick}
              className="w-full h-7 bg-[#3087FF] text-white text-xs font-medium rounded flex items-center justify-center"
            >
              立即下载
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
