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
        {/* Coupon Card - 票券腰身 + 毛玻璃 */}
        <div
          className={cn(
            "relative w-full max-w-[300px] transition-all duration-300",
            !previewMode && (isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0")
          )}
          style={{
            // 票券腰身：左右中央高度内凹 8%（5 点近似弧线）
            clipPath:
              "polygon(0% 0%, 100% 0%, 100% 35%, 98% 40%, 92% 50%, 98% 60%, 100% 65%, 100% 100%, 0% 100%, 0% 65%, 2% 60%, 8% 50%, 2% 40%, 0% 35%)",
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            boxShadow:
              "0 12px 32px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.05)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button - 浅灰底，置于白色顶部区 */}
          <button
            onClick={onClose}
            aria-label="关闭"
            className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full z-20 transition-colors hover:bg-gray-200"
            style={{
              background: "rgba(0, 0, 0, 0.06)",
              color: "rgb(75, 85, 99)",
            }}
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* TOP 白色区 - 活动名称 + 有效期（电商券头部） */}
          <div className="relative px-5 pt-4 pb-3 flex items-start justify-between">
            <p
              className="text-[10px] uppercase font-medium"
              style={{
                color: "rgb(107, 114, 128)",
                letterSpacing: "0.15em",
              }}
            >
              {resolveMacro(finalConfig.title) || "活动名称"}
            </p>
            <span
              className="text-[9px] text-gray-400"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatValidDate()}
            </span>
          </div>

          {/* 水平撕开虚线 - 只在右侧 65% 区域（避开 30 文字） */}
          <div className="relative h-3 pointer-events-none" aria-hidden>
            <svg
              className="absolute top-0 right-0 h-full"
              viewBox="0 0 65 12"
              preserveAspectRatio="none"
              style={{ overflow: "visible", width: "65%" }}
            >
              <path
                d="M 0 0.5 Q 32.5 10 65 0.5"
                stroke="rgba(0, 0, 0, 0.18)"
                strokeWidth="1"
                strokeDasharray="2 2.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* 主体橙色区 - 电商橙 #FF6B35 平铺 */}
          <div className="relative">
            <div
              className="relative flex items-stretch"
              style={{ background: "#FF6B35" }}
            >
              {/* 垂直虚线 - 30 区域和条件区域之间的分隔 */}
              <div
                className="absolute left-[35%] top-3 bottom-3 z-10 pointer-events-none"
                style={{
                  borderLeft: "1px dashed rgba(255, 255, 255, 0.5)",
                }}
              />

              {/* Left 35% - 30 数字 */}
              <div className="w-[35%] relative py-4 px-2 flex flex-col items-center justify-center">
                <DiscountInfoDisplay text={resolveMacro(finalConfig.discountInfo) || "优惠"} />
              </div>

              {/* Right 65% - 条件 + 米黄按钮 */}
              <div className="w-[65%] relative px-4 py-3 flex flex-col items-start justify-center gap-1.5">
                <span className="text-white/95 text-[13px] font-medium leading-tight">
                  {resolveMacro(finalConfig.discountCondition) || "优惠条件"}
                </span>
                {/* 米黄按钮 - 视觉 CTA（非交互，点击仍由整卡 click area 触发） */}
                <div
                  className="text-xs font-semibold px-4 py-1.5 rounded-full pointer-events-none"
                  style={{
                    background: "#FFF5E6",
                    color: "#C73E1D",
                    boxShadow: "0 1px 3px rgba(199, 62, 29, 0.25)",
                  }}
                >
                  {resolveButtonText()}
                </div>
              </div>
            </div>
          </div>

          {/* Click Area - 整张卡片可点击 */}
          <button
            onClick={handleButtonClick}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
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
