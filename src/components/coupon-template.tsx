"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { openLandingPage } from "./landing-page-config";

export interface CouponTemplateConfig {
  title: string;              // 活动名称（最多14字符）
  discountInfo: string;       // 优惠信息（建议不超过6字符）
  discountCondition: string;  // 优惠条件（最多16字符）
  buttonText: string;         // 按钮文案（固定选项）
  buttonTextMacro?: string;   // 按钮文案宏变量
  validFrom?: string;         // 有效期开始
  validTo?: string;           // 有效期结束
  landingPageUrl?: string;    // 落地页URL
  landingPageMacro?: string; // 落地页宏变量
  landingPageType?: "url" | "deeplink"; // 跳转类型
  deeplinkUrl?: string; // Deeplink地址
  deeplinkMacro?: string; // Deeplink宏变量
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

  // 格式化有效期 - 紧凑格式
  const formatValidDate = (): string => {
    const { validFrom, validTo } = finalConfig;
    if (!validFrom && !validTo) {
      return "长期有效";
    }

    // 转换日期格式 2026-01-01 -> 01.01
    const formatDate = (dateStr: string): string => {
      if (!dateStr) return "";
      const parts = dateStr.split("-");
      if (parts.length !== 3) return dateStr;
      const [, month, day] = parts;
      return `${parseInt(month)}.${parseInt(day)}`;
    };

    if (validFrom && validTo) {
      return `${formatDate(validFrom)} - ${formatDate(validTo)}`;
    }
    if (validFrom) {
      return `${formatDate(validFrom)} 起`;
    }
    if (validTo) {
      return `至 ${formatDate(validTo)}`;
    }
    return "";
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
      openLandingPage(finalConfig, url);
    }
    onButtonClick?.(finalConfig);
  };

  if (!isVisible && previewMode === false) return null;

  return (
    <div className={cn(previewMode ? "absolute inset-0 flex items-center justify-center" : "")}>
      {/* Backdrop */}
      <div
        className={cn(
          previewMode
            ? "w-full h-full flex items-center justify-center"
            : "fixed inset-0 z-50 bg-black/50",
          "transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={!previewMode ? onClose : undefined}
      >
        {/* Coupon Card - Glass container */}
        <div
          className={cn(
            "relative w-full max-w-[300px] overflow-hidden rounded-2xl transition-all duration-300",
            !previewMode && (isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0")
          )}
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            boxShadow:
              "0 12px 32px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.05)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button - Glass */}
          <button
            onClick={onClose}
            aria-label="关闭"
            className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full z-10 transition-colors"
            style={{
              background: "rgba(255, 255, 255, 0.4)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              color: "rgb(75, 85, 99)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.4)";
            }}
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Activity Title - 顶部小标 */}
          <div className="px-5 pt-4 pb-2">
            <p
              className="text-[10px] uppercase font-medium"
              style={{
                color: "rgb(107, 114, 128)",
                letterSpacing: "0.15em",
              }}
            >
              {resolveMacro(finalConfig.title) || "活动名称"}
            </p>
          </div>

          {/* Main Content - 主体票券区 */}
          <div className="px-4 pb-4">
            <div className="relative flex items-stretch">
              {/* 左侧凹口半圆（票券"撕开"标记）*/}
              <div
                className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full z-20"
                style={{
                  background: "rgba(255, 255, 255, 0.95)",
                  boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.04)",
                }}
              />
              {/* 右侧凹口半圆 */}
              <div
                className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full z-20"
                style={{
                  background: "rgba(255, 255, 255, 0.95)",
                  boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.04)",
                }}
              />

              {/* 中央虚线撕开线 */}
              <div
                className="absolute left-1/3 top-2 bottom-2 z-10 pointer-events-none"
                style={{
                  borderLeft: "1px dashed rgba(255, 255, 255, 0.55)",
                }}
              />

              {/* Left Side - Discount Amount (1/3) */}
              <div
                className="w-1/3 relative py-4 px-2 flex flex-col items-center justify-center overflow-hidden"
                style={{
                  borderTopLeftRadius: "10px",
                  borderBottomLeftRadius: "10px",
                  background:
                    "linear-gradient(135deg, #F87D79 0%, #E85D5A 100%)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 2px rgba(232,93,90,0.25)",
                }}
              >
                {/* 顶部 inset 高光 */}
                <div
                  className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%)",
                    borderTopLeftRadius: "10px",
                  }}
                />
                {/* 优惠信息：数字 vs 单位 */}
                <DiscountInfoDisplay text={resolveMacro(finalConfig.discountInfo) || "优惠"} />
              </div>

              {/* Right Side - Info (2/3) */}
              <div
                className="w-2/3 relative px-4 py-3 flex flex-col justify-between overflow-hidden"
                style={{
                  borderTopRightRadius: "10px",
                  borderBottomRightRadius: "10px",
                  background:
                    "linear-gradient(135deg, #F87D79 0%, #E85D5A 100%)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.2), 0 1px 2px rgba(232,93,90,0.25)",
                }}
              >
                {/* 顶部 inset 高光 */}
                <div
                  className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%)",
                    borderTopRightRadius: "10px",
                  }}
                />

                {/* Top: Button Text */}
                <div>
                  <span
                    className="text-white text-base font-semibold whitespace-nowrap"
                    style={{ letterSpacing: "0.02em" }}
                  >
                    {resolveButtonText()}
                  </span>
                </div>

                {/* Middle: Discount Condition */}
                <div>
                  <span className="text-white/90 text-xs line-clamp-1">
                    {resolveMacro(finalConfig.discountCondition) || "优惠条件"}
                  </span>
                </div>

                {/* Bottom: Valid Date */}
                <div>
                  <span
                    className="text-white/80 text-[10px] whitespace-nowrap truncate"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    有效期: {formatValidDate()}
                  </span>
                </div>
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

// 优惠信息展示组件：把 "30元" 拆成 "¥" + "30" + "元"，让数字更突出
function DiscountInfoDisplay({ text }: { text: string }) {
  // 匹配 "数字 + 单位" 的格式（如 "30元"、"8折"、"100积分"）
  const match = text.match(/^(\d+(?:\.\d+)?)(.*)$/);
  if (match) {
    const [, num, unit] = match;
    return (
      <div className="flex items-baseline gap-0.5">
        {unit !== "折" && (
          <span className="text-white/90 text-xs font-medium">¥</span>
        )}
        <span
          className="text-white text-3xl font-bold leading-none"
          style={{
            letterSpacing: "-0.02em",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {num}
        </span>
        <span className="text-white/90 text-xs font-medium ml-0.5">
          {unit}
        </span>
      </div>
    );
  }
  // fallback：直接显示原文
  return (
    <span className="text-white text-2xl font-semibold leading-none">
      {text}
    </span>
  );
}
