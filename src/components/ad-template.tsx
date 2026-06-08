"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { openLandingPage } from "./landing-page-config";

export interface AdButtonConfig {
  text: string;
  action: "jump" | "show_image" | "deeplink";
  landingPageUrl?: string;
  landingPageMacro?: string; // 落地页宏变量
  landingPageType?: "url" | "deeplink"; // 跳转类型
  deeplinkUrl?: string; // Deeplink地址
  deeplinkMacro?: string; // Deeplink宏变量
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
    // Deeplink 类型
    if (button.action === "deeplink") {
      if (button.deeplinkMacro) {
        const resolved = resolveMacro(button.deeplinkMacro);
        if (resolved.includes('${') || resolved.startsWith('$')) {
          return undefined;
        }
        return resolved;
      }
      if (button.deeplinkUrl) {
        return resolveMacro(button.deeplinkUrl);
      }
      return undefined;
    }
    // URL 类型
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
    if (finalConfig.button1.action === "jump" || finalConfig.button1.action === "deeplink") {
      const url = resolveLandingPageUrl(finalConfig.button1);
      if (url) {
        openLandingPage(finalConfig.button1, url);
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
    if (finalConfig.button2.action === "jump" || finalConfig.button2.action === "deeplink") {
      const url = resolveLandingPageUrl(finalConfig.button2);
      if (url) {
        openLandingPage(finalConfig.button2, url);
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
      openLandingPage(currentButtonConfig, url);
    }
  };

  if (!isVisible && !previewMode) return null;

  return (
    <div className={cn(previewMode ? "relative left-0 top-1/2 -translate-y-1/2" : "")}>
      {/* Container */}
      <div
        className={cn(
          previewMode
            ? "w-[240px] bg-white rounded-r-2xl shadow-xl overflow-hidden"
            : "fixed left-0 top-1/2 -translate-y-1/2 z-50 w-[240px] bg-white rounded-r-2xl shadow-2xl overflow-hidden",
          "transition-all duration-300",
          isOpen || previewMode ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
        style={{ height: 160 }}
      >
          {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
              aria-label="关闭"
            >
              <X className="w-3 h-3 text-gray-500" />
            </button>

          {/* Content */}
          <div className="px-2.5 pt-2 pb-1.5">
            {/* Title */}
            <h2 className="text-xs font-bold text-gray-900 pr-5 leading-tight">
              {finalConfig.title}
            </h2>

            {/* Subtitle */}
            <p className="mt-0.5 text-[10px] text-gray-600 leading-relaxed">
              {finalConfig.subtitle}
            </p>
          </div>

          {/* Buttons */}
          <div className="px-2.5 pb-2 space-y-1">
            <button
              onClick={handleButton1Click}
              className={cn(
                "w-full h-7 rounded-lg text-white font-medium text-[11px]",
                "bg-gradient-to-r from-blue-500 to-blue-600",
                "hover:from-blue-600 hover:to-blue-700",
                "active:scale-[0.98] transition-all duration-150",
                "shadow-md shadow-blue-500/25",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {finalConfig.button1.text}
            </button>

            <button
              onClick={handleButton2Click}
              className={cn(
                "w-full h-7 rounded-lg text-white font-medium text-[11px]",
                "bg-gradient-to-r from-blue-500 to-blue-600",
                "hover:from-blue-600 hover:to-blue-700",
                "active:scale-[0.98] transition-all duration-150",
                "shadow-md shadow-blue-500/25",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {finalConfig.button2.text}
            </button>
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
