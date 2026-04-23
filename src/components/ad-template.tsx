"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdButtonConfig {
  text: string;
  action: "jump" | "show_image";
  landingPageUrl?: string;
  landingPageMacro?: string; // 落地页宏变量
  imageUrl?: string;
  imageMacro?: string;
  resultText?: string;
  buttonClickText?: string;
}

export interface AdTemplateConfig {
  title: string;
  subtitle: string;
  button1: AdButtonConfig;
  button2: AdButtonConfig;
  action: "open" | "show_image" | "custom";
  defaultLandingPageUrl?: string;
  // 宏替换变量映射
  macroVariables?: Record<string, string>;
}

export interface AdTemplateProps {
  config: AdTemplateConfig;
  isOpen?: boolean;
  onClose?: () => void;
  onButton1Click?: (config: AdButtonConfig) => void;
  onButton2Click?: (config: AdButtonConfig) => void;
  previewMode?: boolean;
}

// 默认配置
const defaultConfig: AdTemplateConfig = {
  title: "限时特惠活动",
  subtitle: "新用户首单立减50元，更有超值礼包等你来拿",
  button1: {
    text: "立即领取",
    action: "jump",
    landingPageUrl: "",
  },
  button2: {
    text: "查看详情",
    action: "show_image",
    imageUrl: "",
    resultText: "",
    buttonClickText: "",
  },
  action: "open",
  defaultLandingPageUrl: "",
};

export function AdTemplate({
  config,
  isOpen = true,
  onClose,
  onButton1Click,
  onButton2Click,
  previewMode = false,
}: AdTemplateProps) {
  // 合并默认配置，确保所有必需字段存在
  const finalConfig: AdTemplateConfig = {
    ...defaultConfig,
    ...config,
    button1: { ...defaultConfig.button1, ...config?.button1 },
    button2: { ...defaultConfig.button2, ...config?.button2 },
  };
  
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);
  const [currentButtonConfig, setCurrentButtonConfig] = useState<AdButtonConfig | null>(null);

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

  // 解析按钮的图片资源（支持 imageUrl 或 imageMacro）
  const resolveButtonImage = (button: AdButtonConfig): string | undefined => {
    if (button.imageUrl) return button.imageUrl;
    if (button.imageMacro) {
      const resolved = resolveMacro(button.imageMacro);
      // 如果宏替换后仍然包含 ${} 或 $，说明没有对应的变量，返回 undefined
      if (resolved.includes('${') || resolved.startsWith('$')) {
        return undefined;
      }
      return resolved;
    }
    return undefined;
  };

  // 解析落地页链接
  const resolveLandingPageUrl = (button: AdButtonConfig): string | undefined => {
    // 优先使用宏变量
    if (button.landingPageMacro) {
      const resolved = resolveMacro(button.landingPageMacro);
      // 如果宏替换后仍然包含 ${} 或 $，说明没有对应的变量，返回 undefined
      if (resolved.includes('${') || resolved.startsWith('$')) {
        return undefined;
      }
      return resolved;
    }
    // 其次使用直接输入的链接
    if (button.landingPageUrl) {
      return resolveMacro(button.landingPageUrl);
    }
    // 最后使用默认链接
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

  const handleButton1Click = () => {
    if (finalConfig.button1.action === "jump") {
      const url = resolveLandingPageUrl(finalConfig.button1);
      if (url) {
        // 始终在新页面打开
        window.open(url, "_blank");
      } else {
        onButton1Click?.(finalConfig.button1);
      }
    } else if (finalConfig.button1.action === "show_image") {
      const image = resolveButtonImage(finalConfig.button1);
      if (image) {
        setCurrentImage(image);
        setCurrentButtonConfig(finalConfig.button1);
        setShowImageModal(true);
      }
    }
    onButton1Click?.(finalConfig.button1);
  };

  const handleButton2Click = () => {
    if (finalConfig.button2.action === "jump") {
      const url = resolveLandingPageUrl(finalConfig.button2);
      if (url) {
        // 始终在新页面打开
        window.open(url, "_blank");
      } else {
        onButton2Click?.(finalConfig.button2);
      }
    } else if (finalConfig.button2.action === "show_image") {
      const image = resolveButtonImage(finalConfig.button2);
      if (image) {
        setCurrentImage(image);
        setCurrentButtonConfig(finalConfig.button2);
        setShowImageModal(true);
      }
    }
    onButton2Click?.(finalConfig.button2);
  };

  // 点击图片跳转到落地页
  const handleImageClick = () => {
    if (!currentButtonConfig) return;
    const url = resolveLandingPageUrl(currentButtonConfig);
    if (url) {
      setShowImageModal(false);
      // 始终在新页面打开
      window.open(url, "_blank");
    }
  };

  if (!isVisible && !previewMode) return null;

  return (
    <div className={cn(previewMode ? "w-[375px] max-w-full flex items-center justify-center" : "")}>
      {/* Backdrop */}
      <div
        className={cn(
          previewMode
            ? "flex items-center justify-center w-full max-w-full"
            : "fixed inset-0 z-50 bg-gradient-to-b from-[#1a0a2e] to-[#2d1b4e]",
          "transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={!previewMode ? onClose : undefined}
      >
        {/* Modal */}
        <div
          className={cn(
            previewMode
              ? "w-full bg-white rounded-2xl shadow-xl overflow-hidden"
              : "fixed left-1/2 top-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl overflow-hidden",
            "transition-all duration-300",
            isOpen || previewMode ? "scale-100 opacity-100" : "scale-95 opacity-0"
          )}
        >
          {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
              aria-label="关闭"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>

          {/* Content */}
          <div className="px-5 pt-6 pb-4">
            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 pr-8 leading-tight">
              {finalConfig.title}
            </h2>

            {/* Subtitle */}
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              {finalConfig.subtitle}
            </p>
          </div>

          {/* Buttons */}
          <div className="px-5 pb-6 space-y-3">
            <button
              onClick={handleButton1Click}
              className={cn(
                "w-full h-12 rounded-xl text-white font-medium text-base",
                "bg-gradient-to-r from-blue-500 to-blue-600",
                "hover:from-blue-600 hover:to-blue-700",
                "active:scale-[0.98] transition-all duration-150",
                "shadow-lg shadow-blue-500/25",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {finalConfig.button1.text}
            </button>

            <button
              onClick={handleButton2Click}
              className={cn(
                "w-full h-12 rounded-xl text-white font-medium text-base",
                "bg-gradient-to-r from-blue-500 to-blue-600",
                "hover:from-blue-600 hover:to-blue-700",
                "active:scale-[0.98] transition-all duration-150",
                "shadow-lg shadow-blue-500/25",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {finalConfig.button2.text}
            </button>
          </div>
        </div>
      </div>

      {/* Image Modal (for show_image action) */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImage}
              alt="内容图片"
              className="max-w-full max-h-[80vh] object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={handleImageClick}
            />
            {/* Hint text */}
            <p className="text-white/70 text-center text-xs mt-2">点击图片跳转落地页</p>
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-10 right-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { defaultConfig };
