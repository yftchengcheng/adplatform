"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
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
  action?: "open" | "close";           // 组件动作，默认打开

  // 浮窗位置
  position: FloatingWindowPosition; // 顶部/底部/中下部

  // 图标
  iconUrl?: string;                 // 图标URL
  iconMacro?: string;               // 图标宏变量

  // 卡片标题（最多14字符）
  title: string;
  titleMacro?: string;

  // 推广卖点（最多10条，轮播）
  promotionPoints: FloatingWindowPromotionPoint[];

  // 行动号召（最多12字符）
  buttonText: string;

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

  const [isAnimating, setIsAnimating] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // 获取有效的推广卖点
  const safePoints = Array.isArray(finalConfig.promotionPoints) ? finalConfig.promotionPoints : [];
  const validPoints = safePoints.filter(p => p.text);
  const hasMultiplePoints = validPoints.length > 1;

  // 宏替换函数 - 支持 ${key}、$key、{key} 三种格式
  const resolveMacro = (macro: string): string => {
    if (!macro || !finalConfig.macroVariables) return macro;
    let result = macro;
    Object.entries(finalConfig.macroVariables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
      result = result.replace(new RegExp(`\\$${key}`, 'g'), value);
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    });
    return result;
  };

  // 检查字符串是否包含未解析的宏占位符
  const hasUnresolvedMacro = (str: string): boolean => {
    return str.includes('${') || str.startsWith('$') || /\{[a-zA-Z_]\w*\}/.test(str);
  };

  // 解析图标 - 有 iconMacro 则使用宏模式
  const resolveIcon = (): string | undefined => {
    if (finalConfig.iconMacro) {
      const resolved = resolveMacro(finalConfig.iconMacro);
      if (hasUnresolvedMacro(resolved)) {
        return finalConfig.iconUrl || undefined;
      }
      return resolved || finalConfig.iconUrl || undefined;
    }
    if (finalConfig.iconUrl) {
      return finalConfig.iconUrl;
    }
    return undefined;
  };

  // 解析标题 - 有 titleMacro 则使用宏模式
  const resolveTitle = (): string => {
    if (finalConfig.titleMacro) {
      const resolved = resolveMacro(finalConfig.titleMacro);
      if (hasUnresolvedMacro(resolved)) {
        // 宏未解析：回退到 title，如果 title 也为空则显示宏原始值
        return finalConfig.title || finalConfig.titleMacro;
      }
      return resolved;
    }
    return finalConfig.title;
  };

  // 解析推广卖点
  const resolvePointText = (point: FloatingWindowPromotionPoint): string => {
    if (point.textMacro) {
      const resolved = resolveMacro(point.textMacro);
      if (hasUnresolvedMacro(resolved)) {
        return point.text || point.textMacro;
      }
      return resolved;
    }
    return point.text;
  };

  // 解析落地页链接
  const resolveLandingPageUrl = (): string | undefined => {
    if (finalConfig.landingPageType === "deeplink") {
      if (finalConfig.deeplinkMacro) {
        const resolved = resolveMacro(finalConfig.deeplinkMacro);
        if (hasUnresolvedMacro(resolved)) {
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
      if (hasUnresolvedMacro(resolved)) {
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

  // 入场动画 - isOpen 或 position 变化时重新播放
  useEffect(() => {
    if (isClosed) return;
    setIsAnimating(false);
    const timer = setTimeout(() => setIsAnimating(true), 80);
    return () => clearTimeout(timer);
  }, [isOpen, finalConfig.position, isClosed]);

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
    if (previewMode) {
      // 预览模式下，关闭后重新播放动画
      setIsAnimating(false);
      setIsClosed(true);
      setTimeout(() => {
        setIsClosed(false);
        setIsAnimating(true);
      }, 800);
    } else {
      setIsAnimating(false);
      onClose?.();
    }
  };

  const iconSrc = resolveIcon();
  const currentPoint = validPoints[currentIndex] || { text: "" };
  const position = finalConfig.position || "bottom";
  const isMiddleBottom = position === "middle_bottom";

  // 根据位置决定滑入动画的初始偏移
  const getAnimationTransform = () => {
    if (isAnimating) {
      return "translate(0, 0)";
    }
    switch (position) {
      case "top":
        return "translate(0, -100%)";
      case "bottom":
        return "translate(0, 100%)";
      case "middle_bottom":
        return "translate(-100%, 0)";
    }
  };

  // 根据位置获取浮窗宽度
  const getWindowWidth = () => {
    if (previewMode) {
      // 预览模式：按比例缩放，260px手机屏模拟640px宽度
      return isMiddleBottom ? "195px" : "260px"; // 480/640*260=195, 640/640*260=260
    }
    return isMiddleBottom ? "480px" : "640px";
  };

  // 缩放比例（预览模式下文字和图标需要等比缩小）
  const scale = previewMode ? 260 / 640 : 1;

  // 浮窗主体内容
  const floatingWindowContent = (
    <div
      className={cn(
        "relative overflow-hidden cursor-pointer",
      )}
      style={{
        width: getWindowWidth(),
        height: `${100 * scale}px`,
        transform: getAnimationTransform(),
        transition: "transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        background: "rgba(255, 255, 255, 1)",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)",
        borderRadius: previewMode ? `${12 * scale}px` : (isMiddleBottom ? "0 12px 12px 0" : "12px"),
        backdropFilter: "blur(8px)",
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 关闭按钮 */}
      <button
        onClick={handleClose}
        className="absolute flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 z-10 transition-colors duration-200 cursor-pointer"
        style={{
          top: `${4 * scale}px`,
          right: `${4 * scale}px`,
          width: `${20 * scale}px`,
          height: `${20 * scale}px`,
          borderRadius: `${4 * scale}px`,
        }}
        aria-label="关闭浮窗"
      >
        <X style={{ width: `${12 * scale}px`, height: `${12 * scale}px` }} />
      </button>

      {/* 内容 - 左图右文水平布局 */}
      <div
        className="flex items-center h-full"
        style={{ padding: `${8 * scale}px`, gap: `${8 * scale}px` }}
      >
        {/* 左侧：图标 */}
        <div
          className="flex-shrink-0 flex items-center justify-center rounded overflow-hidden"
          style={{
            width: `${40 * scale}px`,
            height: `${40 * scale}px`,
            backgroundColor: "#F3F4F6",
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
            <ImageIcon style={{ width: `${20 * scale}px`, height: `${20 * scale}px` }} className="text-gray-300" />
          )}
        </div>

        {/* 中间：标题 + 推广卖点 */}
        <div className="flex-1 min-w-0 flex flex-col justify-center" style={{ gap: `${2 * scale}px` }}>
          {/* 标题 */}
          <p className="text-gray-500 truncate leading-tight" style={{ fontSize: `${12 * scale}px` }}>
            {resolveTitle()}
          </p>

          {/* 推广卖点 */}
          <p className="text-gray-600 truncate leading-tight" style={{ fontSize: `${10 * scale}px` }}>
            {resolvePointText(currentPoint)}
          </p>
        </div>

        {/* 右侧：行动号召按钮 */}
        <button
          onClick={handleButtonClick}
          className="flex-shrink-0 text-white rounded flex items-center justify-center whitespace-nowrap cursor-pointer hover:opacity-90 transition-opacity duration-200"
          style={{
            height: `${20 * scale}px`,
            paddingLeft: `${8 * scale}px`,
            paddingRight: `${8 * scale}px`,
            fontSize: `${10 * scale}px`,
            backgroundColor: "#3087FF",
          }}
        >
          {finalConfig.buttonText}
        </button>
      </div>
    </div>
  );

  // 预览模式 - 模拟手机屏幕，展示位置和动画效果
  if (previewMode) {
    return (
      <div className="w-full flex items-center justify-center">
        <div
          className="relative rounded-2xl overflow-hidden bg-gray-100"
          style={{
            width: "260px",
            height: "312px",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
          }}
        >
          {/* 模拟手机屏幕内容 */}
          <div className="absolute inset-0 flex flex-col items-center justify-start pt-6 px-4 gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-full rounded-lg bg-white/70"
                style={{ height: `${36 * scale}px` }}
              />
            ))}
          </div>

          {/* 底层透明度10%遮罩 - 预览模式 */}
          {!isClosed && (
            <div
              className={cn(
                "absolute inset-0 bg-black/10 transition-opacity duration-500 z-10",
                isAnimating ? "opacity-100" : "opacity-0"
              )}
            />
          )}

          {/* 浮窗定位容器 - 相对于手机屏幕定位 */}
          <div
            className={cn(
              "absolute z-20",
              position === "top" && "top-0 left-0 right-0",
              position === "bottom" && "bottom-0 left-0 right-0",
              position === "middle_bottom" && "bottom-[30%] left-0"
            )}
            style={{
              display: "flex",
              justifyContent: isMiddleBottom ? "flex-start" : "center",
              paddingLeft: isMiddleBottom ? `${8 * scale}px` : undefined,
            }}
          >
            {!isClosed && floatingWindowContent}
          </div>
        </div>
      </div>
    );
  }

  // 非预览模式 - 完整浮窗展示
  return (
    <>
      {/* 底层透明度10%遮罩 */}
      {!isClosed && (
        <div
          className={cn(
            "fixed inset-0 bg-black/10 transition-opacity duration-500 z-40",
            isAnimating ? "opacity-100" : "opacity-0"
          )}
          onClick={handleClose}
        />
      )}

      {/* 浮窗定位容器 - 相对于手机屏幕定位 */}
      <div
        className={cn(
          "fixed z-50",
          position === "top" && "top-0 left-0 right-0",
          position === "bottom" && "bottom-0 left-0 right-0",
          position === "middle_bottom" && "bottom-[30%] left-0"
        )}
        style={{
          display: "flex",
          justifyContent: isMiddleBottom ? "flex-start" : "center",
          paddingLeft: isMiddleBottom ? "0" : undefined,
        }}
      >
        {!isClosed && floatingWindowContent}
      </div>
    </>
  );
}

// 导出默认配置供外部使用
export const defaultFloatingWindowConfig: FloatingWindowTemplateConfig = {
  position: "bottom",
  iconUrl: "",
  title: "卡片标题",
  promotionPoints: [{ id: "1", text: "推广卖点1" }],
  buttonText: "立即查看",
  componentName: "浮窗",
};
