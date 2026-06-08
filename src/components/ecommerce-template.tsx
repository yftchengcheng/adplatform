"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { openLandingPage } from "./landing-page-config";

// 组件配置
export interface EcommerceTemplateConfig {
  title: string;
  titleMacro?: string;
  content: string;
  contentMacro?: string;
  buttonText: string;
  buttonTextMacro?: string;
  imageUrl?: string;
  imageMacro?: string;
  landingPageUrl?: string;
  landingPageMacro?: string;
  landingPageType?: "url" | "deeplink"; // 跳转类型
  deeplinkUrl?: string; // Deeplink地址
  deeplinkMacro?: string; // Deeplink宏变量
  defaultLandingPageUrl?: string;
  macroVariables?: Record<string, string>;
  onButtonClick?: () => void;
}

interface EcommerceTemplateProps {
  config: EcommerceTemplateConfig;
  isOpen?: boolean;
  onClose?: () => void;
  previewMode?: boolean;
}

// 默认配置
const defaultConfig: EcommerceTemplateConfig = {
  title: "精选好物限时特惠",
  content: "品质保证，价格实惠，错过不再有",
  buttonText: "立即购买",
  defaultLandingPageUrl: "",
};

// 电商磁贴组件
export function EcommerceTemplate({
  config,
  isOpen = true,
  onClose,
  previewMode = false,
}: EcommerceTemplateProps) {
  // 合并默认配置
  const finalConfig: EcommerceTemplateConfig = {
    ...defaultConfig,
    ...config,
  };

  const [isVisible, setIsVisible] = useState(false);

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

  // 解析标题
  const resolveTitle = (): string => {
    if (finalConfig.titleMacro) {
      const resolved = resolveMacro(finalConfig.titleMacro);
      if (resolved.includes("${") || resolved.startsWith("$")) {
        return finalConfig.title;
      }
      return resolved;
    }
    return finalConfig.title;
  };

  // 解析内容
  const resolveContent = (): string => {
    if (finalConfig.contentMacro) {
      const resolved = resolveMacro(finalConfig.contentMacro);
      if (resolved.includes("${") || resolved.startsWith("$")) {
        return finalConfig.content;
      }
      return resolved;
    }
    return finalConfig.content;
  };

  // 解析按钮文案
  const resolveButtonText = (): string => {
    if (finalConfig.buttonTextMacro) {
      const resolved = resolveMacro(finalConfig.buttonTextMacro);
      if (resolved.includes("${") || resolved.startsWith("$")) {
        return finalConfig.buttonText;
      }
      return resolved;
    }
    return finalConfig.buttonText;
  };

  // 解析图片URL
  const resolveImageUrl = (): string | undefined => {
    if (finalConfig.imageUrl) return finalConfig.imageUrl;
    if (finalConfig.imageMacro) {
      const resolved = resolveMacro(finalConfig.imageMacro);
      if (resolved.includes("${") || resolved.startsWith("$")) {
        return undefined;
      }
      return resolved;
    }
    return undefined;
  };

  // 解析落地页URL
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
    // 优先使用宏变量
    if (finalConfig.landingPageMacro) {
      const resolved = resolveMacro(finalConfig.landingPageMacro);
      if (resolved.includes("${") || resolved.startsWith("$")) {
        return undefined;
      }
      return resolved;
    }
    // 其次使用直接输入的链接
    if (finalConfig.landingPageUrl) {
      return resolveMacro(finalConfig.landingPageUrl);
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

  // 处理按钮点击
  const handleButtonClick = () => {
    const url = resolveLandingPageUrl();
    if (url) {
      openLandingPage(finalConfig, url);
    }
    finalConfig.onButtonClick?.();
  };

  if (!isVisible && !previewMode) return null;

  const imageUrl = resolveImageUrl();

  return (
    <div className={cn(previewMode ? "w-full" : "")}>
      {/* Backdrop */}
      {!previewMode && (
        <div
          className="fixed inset-0 z-50 bg-black/50 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Card - 左图右文布局，左侧贴边 */}
      <div
        className={cn(
          previewMode
            ? "w-full"
            : "fixed left-0 z-50",
          "transition-all duration-300",
          isOpen || previewMode ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
        style={{
          width: previewMode ? undefined : 320,
          height: previewMode ? undefined : 150,
        }}
      >
        <div
          className="relative bg-white rounded-r-2xl shadow-xl overflow-hidden"
          style={{
            width: previewMode ? "100%" : 320,
            height: previewMode ? "auto" : 150,
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100/80 hover:bg-gray-200 transition-colors z-10"
            aria-label="关闭"
          >
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>

          {/* Content - 左图右文 */}
          <div className="flex items-center p-4 gap-4" style={previewMode ? {} : { height: 150 }}>
            {/* 左侧图片 */}
            <div className="flex-shrink-0 w-[87px] h-[87px] rounded-lg overflow-hidden bg-gray-100">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="商品图片"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                  暂无图片
                </div>
              )}
            </div>

            {/* 右侧文字内容 */}
            <div className="flex-1 min-w-0 flex flex-col justify-between h-[87px] overflow-hidden">
              {/* 标题 */}
              <h3 className="text-sm font-medium text-gray-900 leading-tight line-clamp-1 truncate">
                {resolveTitle()}
              </h3>

              {/* 文案内容 */}
              <p className="text-xs text-gray-500 leading-snug line-clamp-2 flex-1 overflow-hidden">
                {resolveContent()}
              </p>

              {/* 按钮 */}
              <button
                onClick={handleButtonClick}
                className="self-start px-3 py-1.5 bg-red-500 text-white text-xs font-normal rounded-lg hover:bg-red-600 transition-colors"
              >
                {resolveButtonText()}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { defaultConfig };
