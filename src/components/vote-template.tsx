"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// 配置接口
export interface VoteOption {
  id: string;
  buttonText: string;
}

export interface VoteTemplateConfig {
  title: string;
  titleMacro?: string;
  subtitle?: string;
  subtitleMacro?: string;
  options: VoteOption[];
  action: "jump" | "show_image";
  landingPageUrl?: string;
  landingPageMacro?: string;
  imageUrl?: string;
  imageMacro?: string;
  defaultLandingPageUrl?: string;
  macroVariables?: Record<string, string>;
  onVote?: (optionId: string) => void;
}

interface VoteTemplateProps {
  config: VoteTemplateConfig;
  isOpen?: boolean;
  onClose?: () => void;
  onButtonClick?: (option: VoteOption) => void;
  previewMode?: boolean;
}

// 默认配置
const defaultConfig: VoteTemplateConfig = {
  title: "请选择您的偏好",
  subtitle: "感谢您的参与，点击选项查看详情",
  options: [
    { id: "1", buttonText: "选项一" },
    { id: "2", buttonText: "选项二" },
  ],
  action: "jump",
  defaultLandingPageUrl: "",
};

// 投票选项组件
function VoteOptionBar({
  option,
  percentage,
  onSelect,
  selected,
}: {
  option: VoteOption;
  percentage: number;
  onSelect: () => void;
  selected: boolean;
}) {
  const progressWidth = Math.max(5, Math.min(100, percentage));

  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative w-full h-14 rounded-xl border-2 overflow-hidden transition-all duration-300",
        selected
          ? "border-blue-500 bg-blue-50"
          : "border-blue-500 bg-white hover:bg-blue-50"
      )}
    >
      {/* 进度条背景 */}
      <div
        className={cn(
          "absolute inset-y-0 left-0 transition-all duration-500 ease-out",
          selected ? "bg-blue-500" : "bg-blue-200"
        )}
        style={{ width: `${progressWidth}%` }}
      />

      {/* 内容 */}
      <div className="relative flex items-center justify-between h-full px-4">
        {/* 左侧：按钮文字 */}
        <span
          className={cn(
            "font-medium text-sm",
            selected ? "text-white" : "text-blue-600"
          )}
        >
          {option.buttonText}
        </span>

        {/* 右侧：百分比 */}
        <span
          className={cn(
            "font-semibold text-sm",
            selected ? "text-white" : "text-gray-600"
          )}
        >
          {percentage}%
        </span>
      </div>
    </button>
  );
}

// 投票组件主组件
export function VoteTemplate({
  config,
  isOpen = true,
  onClose,
  onButtonClick,
  previewMode = false,
}: VoteTemplateProps) {
  // 合并默认配置，确保所有必需字段存在
  const finalConfig: VoteTemplateConfig = {
    ...defaultConfig,
    ...config,
    options: config?.options?.length
      ? config.options
      : defaultConfig.options,
  };

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>("");
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

  // 解析图片资源（支持 imageUrl 或 imageMacro）
  const resolveImage = (): string | undefined => {
    if (finalConfig.imageUrl) return finalConfig.imageUrl;
    if (finalConfig.imageMacro) {
      const resolved = resolveMacro(finalConfig.imageMacro);
      // 如果宏替换后仍然包含 ${} 或 $，说明没有对应的变量，返回 undefined
      if (resolved.includes("${") || resolved.startsWith("$")) {
        return undefined;
      }
      return resolved;
    }
    return undefined;
  };

  // 解析落地页链接
  const resolveLandingPageUrl = (): string | undefined => {
    // 优先使用宏变量
    if (finalConfig.landingPageMacro) {
      const resolved = resolveMacro(finalConfig.landingPageMacro);
      // 如果宏替换后仍然包含 ${} 或 $，说明没有对应的变量，返回 undefined
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

  // 获取选项的固定百分比（选项1为75%，选项2为25%）
  const getFixedPercentage = (index: number): number => {
    return index === 0 ? 75 : 25;
  };

  // 处理选项选择
  const handleSelect = (option: VoteOption) => {
    // 记录已选择的选项
    setSelectedOption(option.id);

    // 执行动作
    if (finalConfig.action === "show_image") {
      const image = resolveImage();
      if (image) {
        setCurrentImage(image);
        setShowImageModal(true);
      }
    } else {
      // jump 模式：直接跳转落地页
      const url = resolveLandingPageUrl();
      if (url) {
        window.open(url, "_blank");
      }
    }

    // 回调
    onButtonClick?.(option);
  };

  // 点击图片跳转到落地页
  const handleImageClick = () => {
    const url = resolveLandingPageUrl();
    if (url) {
      setShowImageModal(false);
      // 始终在新页面打开
      window.open(url, "_blank");
    }
  };

  if (!isVisible && !previewMode) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          previewMode
            ? "flex items-center justify-center min-h-[400px]"
            : "fixed inset-0 z-50 bg-black/50",
          "transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={!previewMode ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className={cn(
          previewMode
            ? "w-full max-w-sm mx-4"
            : "fixed left-1/2 top-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 -translate-y-1/2",
          "transition-all duration-300",
          isOpen || previewMode ? "scale-100 opacity-100" : "scale-95 opacity-0"
        )}
      >
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
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
            {finalConfig.subtitle && (
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                {finalConfig.subtitle}
              </p>
            )}
          </div>

          {/* Vote Options */}
          <div className="px-5 pb-6 space-y-3">
            {finalConfig.options.map((option, index) => (
              <VoteOptionBar
                key={option.id}
                option={option}
                percentage={getFixedPercentage(index)}
                onSelect={() => handleSelect(option)}
                selected={selectedOption === option.id}
              />
            ))}
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
            <p className="text-white/70 text-center text-xs mt-2">
              点击图片跳转落地页
            </p>
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-10 right-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export { defaultConfig };
