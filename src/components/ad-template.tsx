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
    <div
      className={cn(
        previewMode
          ? "absolute left-0 top-1/2 -translate-y-1/2 w-[240px] h-[160px] overflow-hidden rounded-2xl"
          : ""
      )}
    >
      {/* Container - Editorial / Magazine style */}
      <div
        className={cn(
          previewMode
            ? "relative w-[240px] h-[160px] rounded-2xl overflow-hidden"
            : "fixed left-0 top-1/2 -translate-y-1/2 z-50 w-[240px] rounded-2xl overflow-hidden",
          "transition-all duration-300 flex flex-col",
          isOpen || previewMode
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-1 scale-95 opacity-0"
        )}
        style={{
          height: 160,
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          backgroundColor: "#FAF8F5",
          border: "1px solid #E8E4DE",
          boxShadow:
            "0 1px 2px rgba(26, 26, 26, 0.04), 0 8px 24px rgba(26, 26, 26, 0.06)",
        }}
      >
        {/* Top row: brand dot + AD label */}
        <div className="flex items-center justify-between px-3 pt-2.5">
          {/* Brand dot - 4x4 editorial mark */}
          <div className="flex items-center gap-1.5">
            <span
              className="block w-1 h-1 rounded-full"
              style={{ backgroundColor: "#C9A961" }}
              aria-hidden
            />
            <span
              className="text-[8px] font-medium uppercase"
              style={{ color: "#6B6B6B", letterSpacing: "0.2em" }}
            >
              Edit{"'"}s Pick
            </span>
          </div>
          {/* AD label - top right */}
          <span
            className="text-[8px] font-medium uppercase"
            style={{ color: "#6B6B6B", letterSpacing: "0.2em" }}
          >
            AD
          </span>
        </div>

        {/* Content - title + subtitle */}
        <div className="flex-1 px-3 pt-1.5 pb-1 flex flex-col justify-center min-h-0">
          <h2
            className="text-[13px] font-semibold leading-tight tracking-tight truncate"
            style={{ color: "#1A1A1A" }}
          >
            {finalConfig.title}
          </h2>
          {/* Hairline divider */}
          <div
            className="my-1.5 h-px w-6"
            style={{ backgroundColor: "#C9A961" }}
            aria-hidden
          />
          <p
            className="text-[10px] leading-relaxed tracking-wide uppercase line-clamp-2"
            style={{ color: "#6B6B6B" }}
          >
            {finalConfig.subtitle}
          </p>
        </div>

        {/* Close Button - top right corner, but on top of AD label */}
        <button
          onClick={onClose}
          className="group absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center rounded-full transition-all duration-300 z-10"
          style={{ backgroundColor: "rgba(232, 228, 222, 0.6)" }}
          aria-label="关闭"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#1A1A1A";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(232, 228, 222, 0.6)";
          }}
        >
          <X
            className="w-3 h-3 transition-all duration-300 group-hover:rotate-90 group-hover:text-white"
            style={{ color: "#1A1A1A" }}
          />
        </button>

        {/* Buttons - Editorial: primary = black, secondary = outline */}
        <div className="px-3 pb-2.5 flex gap-1.5">
          <button
            onClick={handleButton1Click}
            className="group/btn flex-1 h-7 rounded text-white font-medium text-[10px] tracking-widest uppercase active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#1A1A1A",
              letterSpacing: "0.12em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#1E3A5F";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(26, 26, 26, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#1A1A1A";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
            disabled={!finalConfig.button1.text}
          >
            {finalConfig.button1.text}
          </button>

          <button
            onClick={handleButton2Click}
            className="group/btn2 flex-1 h-7 rounded font-medium text-[10px] tracking-widest uppercase active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "transparent",
              color: "#1A1A1A",
              border: "1px solid #1A1A1A",
              letterSpacing: "0.12em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#1A1A1A";
              e.currentTarget.style.color = "#FAF8F5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#1A1A1A";
            }}
            disabled={!finalConfig.button2.text}
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
