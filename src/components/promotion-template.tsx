"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { openLandingPage } from "./landing-page-config";

export interface PromotionPoint {
  id: string;
  text: string;
  textMacro?: string;
}

export interface PromotionTemplateConfig {
  iconUrl?: string;               // 图标URL
  iconMacro?: string;            // 图标宏变量
  title: string;                // 标题（最多14字符）
  titleMacro?: string;           // 标题宏变量
  promotionPoints: PromotionPoint[];  // 推广卖点（最多10条）
  buttonText: string;            // 行动号召（最多12字符）
  buttonTextMacro?: string;      // 行动号召宏变量
  landingPageUrl?: string;      // 落地页URL
  landingPageMacro?: string; // 落地页宏变量
  landingPageType?: "url" | "deeplink"; // 跳转类型
  deeplinkUrl?: string; // Deeplink地址
  deeplinkMacro?: string; // Deeplink宏变量
  defaultLandingPageUrl?: string;
  // 宏替换变量映射
  macroVariables?: Record<string, string>;
}

export interface PromotionTemplateProps {
  config: PromotionTemplateConfig;
  isOpen?: boolean;
  onClose?: () => void;
  onButtonClick?: (config: PromotionTemplateConfig) => void;
  previewMode?: boolean;
}

// 默认配置
const defaultConfig: PromotionTemplateConfig = {
  iconUrl: "",
  title: "卡片标题",
  promotionPoints: [{ id: "1", text: "推广卖点1" }],
  buttonText: "行动号召",
  defaultLandingPageUrl: "",
};

export function PromotionTemplate({
  config,
  isOpen = true,
  onClose,
  onButtonClick,
  previewMode = false,
}: PromotionTemplateProps) {
  // 合并默认配置
  const finalConfig: PromotionTemplateConfig = {
    ...defaultConfig,
    ...config,
  };

  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // 获取有效的推广卖点
  const validPoints = Array.isArray(finalConfig.promotionPoints)
    ? finalConfig.promotionPoints.filter(p => p.text)
    : [];
  const hasMultiplePoints = validPoints.length > 1;

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

  // 解析图标
  const resolveIcon = (): string | undefined => {
    if (finalConfig.iconMacro) {
      const resolved = resolveMacro(finalConfig.iconMacro);
      if (resolved.includes('${') || resolved.startsWith('$')) {
        return undefined;
      }
      return resolved;
    }
    if (finalConfig.iconUrl) {
      return resolveMacro(finalConfig.iconUrl);
    }
    return undefined;
  };

  // 解析标题
  const resolveTitle = (): string => {
    if (finalConfig.titleMacro) {
      const resolved = resolveMacro(finalConfig.titleMacro);
      if (resolved.includes('${') || resolved.startsWith('$')) {
        return finalConfig.title;
      }
      return resolved;
    }
    return finalConfig.title;
  };

  // 解析推广卖点
  const resolvePointText = (point: PromotionPoint): string => {
    if (point.textMacro) {
      const resolved = resolveMacro(point.textMacro);
      if (resolved.includes('${') || resolved.startsWith('$')) {
        return point.text;
      }
      return resolved;
    }
    return point.text;
  };

  // 解析按钮文案
  const resolveButtonText = (): string => {
    if (finalConfig.buttonTextMacro) {
      const resolved = resolveMacro(finalConfig.buttonTextMacro);
      if (resolved.includes('${') || resolved.startsWith('$')) {
        return finalConfig.buttonText;
      }
      return resolved;
    }
    return finalConfig.buttonText;
  };

  // 解析落地页链接
  const resolveLandingPageUrl = (): string | undefined => {
    // Deeplink 类型
    if (finalConfig.landingPageType === "deeplink") {
      if (finalConfig.deeplinkMacro) {
        const resolved = resolveMacro(finalConfig.deeplinkMacro);
        if (resolved.includes('${') || resolved.startsWith('$')) {
          return undefined;
        }
        return resolved;
      }
      if (finalConfig.deeplinkUrl) {
        return resolveMacro(finalConfig.deeplinkUrl);
      }
      return undefined;
    }

    if (finalConfig.landingPageMacro) {
      const resolved = resolveMacro(finalConfig.landingPageMacro);
      if (resolved.includes('${') || resolved.startsWith('$')) {
        return undefined;
      }
      return resolved;
    }
    if (finalConfig.landingPageUrl) {
      return resolveMacro(finalConfig.landingPageUrl);
    }
    if (finalConfig.defaultLandingPageUrl) {
      return resolveMacro(finalConfig.defaultLandingPageUrl);
    }
    return undefined;
  };

  // 自动轮播
  useEffect(() => {
    if (!hasMultiplePoints || isPaused || !previewMode) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validPoints.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [hasMultiplePoints, isPaused, previewMode, validPoints.length]);

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

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = resolveLandingPageUrl();
    if (url) {
      openLandingPage(finalConfig, url);
    }
    onButtonClick?.(finalConfig);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + validPoints.length) % validPoints.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % validPoints.length);
  };

  if (!isVisible && previewMode === false) return null;

  const iconSrc = resolveIcon();
  const currentPoint = validPoints[currentIndex] || { text: "" };

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
        {/* Card */}
        <div
          className={cn(
            "relative w-full max-w-[300px] overflow-hidden rounded-2xl",
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
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center rounded-full z-10 transition-all"
            style={{
              background: "rgba(255, 255, 255, 0.4)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              border: "0.5px solid rgba(255, 255, 255, 0.5)",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)",
            }}
          >
            <X className="w-3 h-3 text-gray-500" />
          </button>

          {/* Content - Horizontal Layout */}
          <div 
            className="flex items-center p-2 gap-2"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Left: Icon */}
            <div
              className="flex-shrink-0 w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center"
              style={{
                background: "rgba(255, 255, 255, 0.35)",
                boxShadow:
                  "inset 0 0 0 0.5px rgba(255, 255, 255, 0.4), 0 1px 2px rgba(0, 0, 0, 0.04)",
              }}
            >
              {iconSrc ? (
                <img
                  src={iconSrc}
                  alt="图标"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-gray-400 text-xs">图标</span>
              )}
            </div>

            {/* Middle: Title + Points */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              {/* Title */}
              <p className="text-[13px] text-gray-600 font-medium truncate tracking-tight">
                {resolveTitle()}
              </p>

              {/* Promotion Point with Navigation */}
              <div className="flex items-center gap-1">
                {hasMultiplePoints && (
                  <button
                    onClick={handlePrev}
                    className="w-3 h-3 flex items-center justify-center text-gray-400 hover:text-gray-600"
                  >
                    <ChevronLeft className="w-2 h-2" />
                  </button>
                )}

                <p className="text-[11px] text-gray-500 truncate flex-1 tabular-nums">
                  {resolvePointText(currentPoint)}
                </p>

                {hasMultiplePoints && (
                  <button
                    onClick={handleNext}
                    className="w-3 h-3 flex items-center justify-center text-gray-400 hover:text-gray-600"
                  >
                    <ChevronRight className="w-2 h-2" />
                  </button>
                )}
              </div>

              {/* Indicators */}
              {hasMultiplePoints && (
                <div className="flex items-center gap-0.5 mt-0.5">
                  {validPoints.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(index);
                      }}
                      className={cn(
                        "h-1 rounded-full transition-all",
                        index === currentIndex
                          ? "w-2 bg-blue-500/80"
                          : "w-1 bg-gray-300/60"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right: Button */}
            <button
              onClick={handleButtonClick}
              className="flex-shrink-0 h-6 px-2.5 text-white text-[11px] font-semibold rounded-md flex items-center justify-center whitespace-nowrap transition-all"
              style={{
                background: "linear-gradient(180deg, #3B95FF 0%, #1E6BD9 100%)",
                boxShadow:
                  "0 2px 4px rgba(30, 107, 217, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
                letterSpacing: "0.02em",
              }}
            >
              {resolveButtonText()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
