"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CouponTemplateConfig {
  title: string;              // 活动名称（最多14字符）
  discountInfo: string;       // 优惠信息（建议不超过6字符）
  discountCondition: string;  // 优惠条件（最多16字符）
  buttonText: string;         // 按钮文案（固定选项）
  buttonTextMacro?: string;   // 按钮文案宏变量
  validFrom?: string;         // 有效期开始
  validTo?: string;           // 有效期结束
  landingPageUrl?: string;    // 落地页URL
  landingPageMacro?: string;  // 落地页宏变量
  defaultLandingPageUrl?: string;
  // 宏替换变量映射
  macroVariables?: Record<string, string>;
}

export interface CouponTemplateProps {
  config: CouponTemplateConfig;
  isOpen?: boolean;
  onClose?: () => void;
  onButtonClick?: (config: CouponTemplateConfig) => void;
  previewMode?: boolean;
}

// 默认配置
const defaultConfig: CouponTemplateConfig = {
  title: "满减大酬宾",
  discountInfo: "30元",
  discountCondition: "满100立减！",
  buttonText: "立即领取",
  validFrom: "2026-01-01",
  validTo: "2026-12-31",
  landingPageUrl: "",
};

export function CouponTemplate({
  config,
  isOpen = true,
  onClose,
  onButtonClick,
  previewMode = false,
}: CouponTemplateProps) {
  // 合并默认配置，确保所有必需字段存在
  const finalConfig: CouponTemplateConfig = {
    ...defaultConfig,
    ...config,
  };

  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

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

  // 解析落地页链接
  const resolveLandingPageUrl = (): string | undefined => {
    // 优先使用宏变量
    if (finalConfig.landingPageMacro) {
      const resolved = resolveMacro(finalConfig.landingPageMacro);
      if (resolved.includes('${') || resolved.startsWith('$')) {
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

  // 解析按钮文案（支持宏替换）
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

  // 格式化有效期
  const formatValidDate = (): string => {
    const { validFrom, validTo } = finalConfig;
    if (!validFrom && !validTo) {
      return "";
    }
    if (validFrom && validTo) {
      return `有效期: ${validFrom} 至 ${validTo}`;
    }
    if (validFrom) {
      return `有效期: ${validFrom} 起`;
    }
    return `有效期: 至 ${validTo}`;
  };

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // 触发入场动画
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleButtonClick = () => {
    const url = resolveLandingPageUrl();
    if (url) {
      window.open(url, "_blank");
    }
    onButtonClick?.(finalConfig);
  };

  if (!isVisible && !previewMode) return null;

  return (
    <div className={cn(previewMode ? "w-full flex items-center justify-center" : "")}>
      {/* Backdrop */}
      <div
        className={cn(
          previewMode
            ? "flex items-center justify-center w-full max-w-sm"
            : "fixed inset-0 z-50 bg-black/50",
          "transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={!previewMode ? onClose : undefined}
      >
        {/* Coupon Card */}
        <div
          className={cn(
            "relative w-full max-w-[300px] bg-white rounded-lg shadow-2xl overflow-hidden",
            "transition-all duration-300",
            !previewMode && (isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0")
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          {!previewMode && (
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-gray-500 z-10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Activity Title */}
          <div className="px-4 pt-3 pb-1">
            <p className="text-xs text-gray-500" style={{ letterSpacing: "0.05em" }}>
              {resolveMacro(finalConfig.title) || "活动名称"}
            </p>
          </div>

          {/* Main Content - Red Background */}
          <div className="flex mx-3 mb-3 rounded-lg overflow-hidden">
            {/* Left Side - Discount Amount */}
            <div className="w-[80px] bg-gradient-to-br from-[#F87D79] to-[#E85D5A] flex flex-col items-center justify-center py-4 px-2">
              <span className="text-white text-2xl font-semibold leading-none">
                {resolveMacro(finalConfig.discountInfo) || "优惠"}
              </span>
            </div>

            {/* Right Side - Info */}
            <div className="flex-1 bg-gradient-to-br from-[#F87D79] to-[#E85D5A] px-3 py-3 flex flex-col justify-between">
              {/* Top: Button and Condition */}
              <div className="flex items-start justify-between">
                {/* Button Text */}
                <div className="flex-1">
                  <span className="text-white text-sm font-semibold whitespace-nowrap">
                    {resolveButtonText()}
                  </span>
                </div>
              </div>

              {/* Middle: Discount Condition */}
              <div className="mt-1">
                <span className="text-white/90 text-sm font-medium line-clamp-1">
                  {resolveMacro(finalConfig.discountCondition) || "优惠条件"}
                </span>
              </div>

              {/* Bottom: Valid Date */}
              <div className="mt-1">
                <span className="text-white/80 text-xs whitespace-nowrap">
                  {formatValidDate()}
                </span>
              </div>
            </div>
          </div>

          {/* Click Area */}
          <button
            onClick={handleButtonClick}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="点击领取优惠券"
          />
        </div>
      </div>
    </div>
  );
}
