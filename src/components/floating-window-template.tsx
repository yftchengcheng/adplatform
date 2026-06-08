"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { openLandingPage } from "./landing-page-config";

// 浮窗位置类型
export type FloatingWindowPosition = "top" | "bottom" | "middle_bottom";

// 推广卖点
export interface FloatingWindowPromotionPoint {
  id: string;
  text: string;
  textMacro?: string;
}

// 浮窗配置
export interface FloatingWindowTemplateConfig {
  // 行动
  action?: "open";                  // 组件动作，默认打开

  // 浮窗位置
  position: FloatingWindowPosition; // 顶部/底部/中下部

  // 图片模式
  iconMode?: "upload" | "macro";    // 图标模式：上传/宏
  iconUrl?: string;                 // 图标URL
  iconMacro?: string;               // 图标宏变量

  // 卡片标题（最多14字符）
  title: string;
  titleMacro?: string;

  // 推广卖点（最多10条，轮播）
  promotionPoints: FloatingWindowPromotionPoint[];

  // 行动号召（最多12字符）
  buttonText: string;
  buttonTextMacro?: string;

  // 落地页
  landingPageUrl?: string;
  landingPageMacro?: string;
  landingPageType?: "url" | "deeplink";
  deeplinkUrl?: string;
  deeplinkMacro?: string;
  defaultLandingPageUrl?: string;

  // 组件名称（最多20字符）
  componentName?: string;

  // 宏替换变量映射
  macroVariables?: Record<string, string>;
}

export interface FloatingWindowTemplateProps {
  config: FloatingWindowTemplateConfig;
  isOpen?: boolean;
  onClose?: () => void;
  onButtonClick?: (config: FloatingWindowTemplateConfig) => void;
  previewMode?: boolean;
}

// 默认配置
const defaultConfig: FloatingWindowTemplateConfig = {
  position: "bottom",
  iconMode: "upload",
  iconUrl: "",
  title: "卡片标题",
  promotionPoints: [{ id: "1", text: "推广卖点1" }],
  buttonText: "立即查看",
  componentName: "浮窗",
};

export function FloatingWindowTemplate({
  config,
  isOpen = true,
  onClose,
  onButtonClick,
  previewMode = false,
}: FloatingWindowTemplateProps) {
  // 合并默认配置
  const finalConfig: FloatingWindowTemplateConfig = {
    ...defaultConfig,
    ...config,
  };

  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // 获取有效的推广卖点
  const validPoints = finalConfig.promotionPoints.filter(p => p.text);
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
  const resolvePointText = (point: FloatingWindowPromotionPoint): string => {
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
    if (!hasMultiplePoints || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validPoints.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [hasMultiplePoints, isPaused, validPoints.length]);

  // 入场动画 - 根据位置不同使用不同滑入方向
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // 延迟触发动画，确保DOM已渲染
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 预览模式动画
  useEffect(() => {
    if (previewMode && !isVisible) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsAnimating(true), 50);
      return () => clearTimeout(timer);
    }
  }, [previewMode, isVisible]);

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

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose?.();
  };

  if (!isVisible) return null;

  const iconSrc = resolveIcon();
  const currentPoint = validPoints[currentIndex] || { text: "" };
  const position = finalConfig.position || "bottom";

  // 根据位置决定组件宽度
  const isMiddleBottom = position === "middle_bottom";

  // 根据位置决定滑入动画
  const getAnimationClass = () => {
    if (!isAnimating) {
      switch (position) {
        case "top":
          return "translate-y-[-100%]";
        case "bottom":
          return "translate-y-[100%]";
        case "middle_bottom":
          return "translate-x-[-100%]";
      }
    }
    return "translate-y-0 translate-x-0";
  };

  // 根据位置决定定位方式
  const getPositionClass = () => {
    if (previewMode) return "";
    switch (position) {
      case "top":
        return "fixed top-0 left-0 right-0 z-50";
      case "bottom":
        return "fixed bottom-0 left-0 right-0 z-50";
      case "middle_bottom":
        return "fixed bottom-[30%] left-0 z-50";
    }
  };

  return (
    <div className={cn(previewMode ? "w-full flex items-center justify-center" : getPositionClass())}>
      {/* 底层透明度10%遮罩 */}
      {!previewMode && (
        <div
          className={cn(
            "fixed inset-0 bg-black/10 transition-opacity duration-300",
            isAnimating ? "opacity-100" : "opacity-0"
          )}
          onClick={handleClose}
        />
      )}

      {/* 浮窗主体 */}
      <div
        className={cn(
          "relative bg-white shadow-lg overflow-hidden transition-transform duration-500 ease-out",
          isMiddleBottom ? "w-[480px]" : "w-[640px] max-w-full",
          isMiddleBottom ? "h-[100px]" : "h-[100px]",
          getAnimationClass(),
          previewMode && "w-full"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/15 text-gray-400 hover:text-gray-600 z-10 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>

        {/* 内容 - 水平布局 */}
        <div
          className="flex items-center h-full px-4 gap-3"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* 左侧：图标 */}
          <div className="flex-shrink-0 w-[54px] h-[54px] rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
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
              <span className="text-gray-300 text-xs">图标</span>
            )}
          </div>

          {/* 中间：标题 + 推广卖点 */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            {/* 标题 */}
            <p className="text-sm font-semibold text-gray-800 truncate">
              {resolveTitle()}
            </p>

            {/* 推广卖点（带导航） */}
            <div className="flex items-center gap-1 mt-1">
              {hasMultiplePoints && (
                <button
                  onClick={handlePrev}
                  className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
              )}

              <p className="text-xs text-gray-500 truncate flex-1">
                {resolvePointText(currentPoint)}
              </p>

              {hasMultiplePoints && (
                <button
                  onClick={handleNext}
                  className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* 轮播指示器 */}
            {hasMultiplePoints && (
              <div className="flex items-center gap-1 mt-1.5">
                {validPoints.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(index);
                    }}
                    className={cn(
                      "h-1 rounded-full transition-all",
                      index === currentIndex ? "w-3 bg-blue-500" : "w-1 bg-gray-300"
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 右侧：行动号召按钮 */}
          <button
            onClick={handleButtonClick}
            className="flex-shrink-0 h-8 px-4 bg-[#3087FF] text-white text-xs font-medium rounded-lg flex items-center justify-center whitespace-nowrap hover:bg-[#2070EE] transition-colors"
          >
            {resolveButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
}

// 导出默认配置供外部使用
export const defaultFloatingWindowConfig: FloatingWindowTemplateConfig = {
  position: "bottom",
  iconMode: "upload",
  iconUrl: "",
  title: "卡片标题",
  promotionPoints: [{ id: "1", text: "推广卖点1" }],
  buttonText: "立即查看",
  componentName: "浮窗",
};
