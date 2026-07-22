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
        {/* Coupon Card - 票券腰身 10% + 4:3 比例（匹配 demo-C2-c） */}
        <div
          className={cn(
            "relative w-full max-w-[400px] transition-all duration-300 flex flex-col",
            !previewMode && (isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0")
          )}
          style={{
            // 4:3 比例（按用户要求）
            aspectRatio: "4 / 3",
            // 票券腰身：左右中央高度内凹 10%（按 demo-C2-c 实际 10.5%）
            // 位置：上腰身 25%，下腰身 65%（更紧凑、更接近 demo）
            clipPath:
              "polygon(0% 0%, 100% 0%, 100% 41.5%, 95.5% 44.5%, 89.5% 47.5%, 95.5% 50.5%, 100% 53.5%, 100% 84%, 95.5% 87%, 89.5% 90%, 95.5% 93%, 100% 96%, 100% 100%, 0% 100%, 0% 96%, 4.5% 93%, 10.5% 90%, 4.5% 87%, 0% 84%, 0% 53.5%, 4.5% 50.5%, 10.5% 47.5%, 4.5% 44.5%, 0% 41.5%)",
            background: "#E8E9ED",
            border: "1px solid rgba(0, 0, 0, 0.06)",
            boxShadow:
              "0 8px 24px rgba(249, 111, 12, 0.18), 0 2px 4px rgba(0, 0, 0, 0.04)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button - 小型圆形，半透白底（融入米白顶区） */}
          <button
            onClick={onClose}
            aria-label="关闭"
            className="absolute top-2.5 right-2.5 w-5 h-5 flex items-center justify-center rounded-full z-20 transition-colors hover:bg-white/50"
            style={{
              background: "rgba(255, 255, 255, 0.4)",
              color: "rgb(75, 85, 99)",
            }}
          >
            <X className="w-3 h-3" />
          </button>

          {/* TOP 米白区 - 活动名称 + 有效期（电商券头部，固定高度匹配 4:3 比例） */}
          <div className="relative h-[50px] px-4 pt-3 pb-2 flex items-start justify-between gap-2">
            <p
              className="text-[11px] font-medium leading-tight flex-1"
              style={{
                color: "rgb(75, 85, 99)",
              }}
            >
              {resolveMacro(finalConfig.title) || "活动名称"}
            </p>
            <span
              className="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatValidDate()}
            </span>
          </div>

          {/* 水平撕开虚线 - 在米白顶和橙红之间（按 demo 真实位置），横穿整个宽度，浅灰白色 */}
          <div
            className="h-[1px] w-full pointer-events-none"
            style={{
              borderTop: "1px dashed rgba(120, 120, 130, 0.55)",
              background: "transparent",
            }}
            aria-hidden
          />

          {/* 主体橙色区 - flex 布局（匹配 demo-C2-c 结构） */}
          <div className="flex-1 flex flex-col relative" style={{ background: "#F96F0C" }}>
            {/* 主体内容：30 + 满100立减 + 立即领取（grid 布局精确 y 位置） */}
            <div className="flex-1 relative grid" style={{ gridTemplateColumns: "35% 65%", gridTemplateRows: "55% 45%" }}>
              {/* 垂直虚线 - 30 区域和条件区域之间的分隔（贯穿整个主体高度） */}
              <div
                className="absolute top-3 bottom-3 z-10 pointer-events-none"
                style={{ left: "35%", borderLeft: "1px dashed rgba(255, 255, 255, 0.5)" }}
              />

              {/* (1,1) Left 35% 顶部 - 30 数字（居中） */}
              <div className="relative flex flex-col items-center justify-center py-2 px-2">
                <DiscountInfoDisplay text={resolveMacro(finalConfig.discountInfo) || "优惠"} />
              </div>

              {/* (1,2) Right 65% 顶部 - 满100立减条件（居中） */}
              <div className="relative flex items-center justify-start px-4 py-2">
                <span className="text-white text-[13px] font-medium leading-tight">
                  {resolveMacro(finalConfig.discountCondition) || "优惠条件"}
                </span>
              </div>

              {/* (2,1-2) 整行底部 - 米黄按钮（居中，跨越整宽） */}
              <div className="col-span-2 relative flex items-center justify-center px-4 pb-1">
                <div
                  className="text-xs font-semibold px-4 py-1.5 rounded-full pointer-events-none"
                  style={{
                    background: "#FDE6C6",
                    color: "#E54001",
                    boxShadow: "0 1px 3px rgba(229, 64, 1, 0.25)",
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
          <span
            className="text-white font-semibold self-start"
            style={{ fontSize: "20px", lineHeight: 1, marginTop: "6px" }}
          >
            ¥
          </span>
        )}
        <span
          className="text-white font-bold leading-none"
          style={{
            fontSize: "56px",
            letterSpacing: "-0.04em",
            fontVariantNumeric: "tabular-nums",
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.08)",
          }}
        >
          {num}
        </span>
        <span
          className="text-white font-semibold self-end"
          style={{ fontSize: "18px", lineHeight: 1, marginBottom: "8px" }}
        >
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
