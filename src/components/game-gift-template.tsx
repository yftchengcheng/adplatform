"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // 有效的图片列表
  const validImages = finalConfig.images.filter(img => img.imageUrl || img.imageMacro);

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

  // 解析图片
  const resolveImage = (img: { imageUrl?: string; imageMacro?: string }): string | undefined => {
    if (img.imageMacro) {
      const resolved = resolveMacro(img.imageMacro);
      if (resolved.includes('${') || resolved.startsWith('$')) {
        return undefined;
      }
      return resolved;
    }
    if (img.imageUrl) {
      return resolveMacro(img.imageUrl);
    }
    return undefined;
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

  // 自动轮播
  useEffect(() => {
    if (validImages.length <= 1 || isPaused || !previewMode) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [validImages.length, isPaused, previewMode]);

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

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % validImages.length);
  };

  if (!isVisible && previewMode === false) return null;

  const currentImage = validImages[currentImageIndex];
  const imageSrc = currentImage ? resolveImage(currentImage) : undefined;

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
            {/* Left: Image with carousel */}
            <div 
              className="flex-shrink-0 relative w-[67px] h-[67px] rounded bg-gray-100 overflow-hidden"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt="应用图片"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  图片
                </div>
              )}

              {/* Carousel Controls */}
              {validImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-6 flex items-center justify-center bg-black/30 text-white hover:bg-black/50"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-6 flex items-center justify-center bg-black/30 text-white hover:bg-black/50"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </>
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
