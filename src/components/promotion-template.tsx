"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
  landingPageMacro?: string;    // 落地页宏变量
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
    }, 3000);

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
      window.open(url, "_blank");
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
          {/* Close Button */}
          {!previewMode && (
            <button
              onClick={onClose}
              className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-gray-500 z-10 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Content - Horizontal Layout */}
          <div 
            className="flex items-center p-2 gap-2"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Left: Icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded bg-gray-100 overflow-hidden flex items-center justify-center">
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
              <p className="text-xs text-gray-500 truncate">
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
                
                <p className="text-[10px] text-gray-600 truncate flex-1">
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
                        index === currentIndex ? "w-2 bg-blue-500" : "w-1 bg-gray-300"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right: Button */}
            <button
              onClick={handleButtonClick}
              className="flex-shrink-0 h-5 px-2 bg-[#3087FF] text-white text-[10px] font-medium rounded flex items-center justify-center whitespace-nowrap"
            >
              {resolveButtonText()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
