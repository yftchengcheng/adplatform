"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// 图片项配置
export interface ImageItem {
  id: string;
  imageUrl?: string;
  imageMacro?: string;
  landingPageUrl?: string;
  landingPageMacro?: string;
}

// 组件配置
export interface ImageTemplateConfig {
  images: ImageItem[];
  defaultLandingPageUrl?: string;
  landingPageMacro?: string;
  macroVariables?: Record<string, string>;
  onImageClick?: (imageIndex: number) => void;
}

interface ImageTemplateProps {
  config: ImageTemplateConfig;
  isOpen?: boolean;
  onClose?: () => void;
  previewMode?: boolean;
}

// 默认配置
const defaultConfig: ImageTemplateConfig = {
  images: [],
  defaultLandingPageUrl: "",
};

// 图片磁贴组件
export function ImageTemplate({
  config,
  isOpen = true,
  onClose,
  previewMode = false,
}: ImageTemplateProps) {
  // 合并默认配置
  const finalConfig: ImageTemplateConfig = {
    ...defaultConfig,
    ...config,
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const images = finalConfig.images || [];

  // 宏替换函数
  const resolveMacro = (macro: string): string => {
    if (!macro || !finalConfig.macroVariables) return macro;
    let result = macro;
    Object.entries(finalConfig.macroVariables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\$\\{${key}\\}`, "g"), value);
      result = result.replace(new RegExp(`\\$${key}`, "g"), value);
    });
    return result;
  };

  // 解析图片URL
  const resolveImageUrl = (image: ImageItem): string | undefined => {
    if (image.imageUrl) return image.imageUrl;
    if (image.imageMacro) {
      const resolved = resolveMacro(image.imageMacro);
      if (resolved.includes("${") || resolved.startsWith("$")) {
        return undefined;
      }
      return resolved;
    }
    return undefined;
  };

  // 解析落地页URL
  const resolveLandingPageUrl = (image?: ImageItem): string | undefined => {
    // 优先使用图片单独的落地页
    if (image?.landingPageMacro) {
      const resolved = resolveMacro(image.landingPageMacro);
      if (resolved.includes("${") || resolved.startsWith("$")) {
        return undefined;
      }
      return resolved;
    }
    if (image?.landingPageUrl) {
      return resolveMacro(image.landingPageUrl);
    }

    // 其次使用全局宏替换落地页
    if (finalConfig.landingPageMacro) {
      const resolved = resolveMacro(finalConfig.landingPageMacro);
      if (resolved.includes("${") || resolved.startsWith("$")) {
        return undefined;
      }
      return resolved;
    }

    // 最后使用默认落地页
    if (finalConfig.defaultLandingPageUrl) {
      return resolveMacro(finalConfig.defaultLandingPageUrl);
    }

    return undefined;
  };

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 处理图片点击
  const handleImageClick = (index: number) => {
    const image = images[index];
    const url = resolveLandingPageUrl(image);
    if (url) {
      window.open(url, "_blank");
    }
    finalConfig.onImageClick?.(index);
  };

  // 轮播导航
  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!isVisible && !previewMode) return null;

  // 单图模式
  if (images.length === 1) {
    const imageUrl = resolveImageUrl(images[0]);
    if (!imageUrl) return null;

    return (
      <div
        className={cn(
          "w-full overflow-hidden rounded-xl transition-all duration-300",
          previewMode ? "" : "fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        )}
        onClick={!previewMode ? onClose : undefined}
      >
        <div
          className={cn(
            "relative w-full max-w-2xl mx-auto",
            previewMode ? "" : "max-h-[80vh]"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`图片 1`}
            className="w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => handleImageClick(0)}
          />
        </div>
      </div>
    );
  }

  // 多图模式（轮播）
  if (images.length === 0) return null;

  const imageUrl = resolveImageUrl(images[currentIndex]);
  if (!imageUrl) return null;

  return (
    <div
      className={cn(
        "w-full overflow-hidden transition-all duration-300",
        previewMode ? "" : "fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      )}
      onClick={!previewMode ? onClose : undefined}
    >
      <div
        className="relative w-full max-w-2xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 主图 */}
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`图片 ${currentIndex + 1}`}
            className="w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity aspect-video object-cover"
            onClick={() => handleImageClick(currentIndex)}
          />

          {/* 左右箭头 */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </>
          )}
        </div>

        {/* 指示器 */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentIndex
                    ? "bg-white w-4"
                    : "bg-white/50 hover:bg-white/70"
                )}
              />
            ))}
          </div>
        )}

        {/* 计数 */}
        <p className="text-white/70 text-center text-xs mt-2">
          {currentIndex + 1} / {images.length}
        </p>
      </div>
    </div>
  );
}

export { defaultConfig };
