"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { openLandingPage } from "./landing-page-config";

// 浮窗位置类型
export type FloatingWindowPosition = "top" | "bottom" | "middle";

// 推广卖点
export interface FloatingWindowPromotionPoint {
  id: string;
  text: string;
  textMacro?: string;
}

// 浮窗配置
export interface FloatingWindowTemplateConfig {
  // 行动
  action?: "open" | "close";           // 组件动作，默认打开

  // 浮窗位置
  position: FloatingWindowPosition; // 顶部/底部/中部

  // 图标
  iconUrl?: string;                 // 图标URL
  iconMacro?: string;               // 图标宏变量

  // 卡片标题（最多14字符）
  title: string;
  titleMacro?: string;

  // 推广卖点（最多10条，轮播）
  promotionPoints: FloatingWindowPromotionPoint[];

  // 行动号召（最多12字符）
  buttonText: string;

  // 落地页
  landingPageUrl?: string;
  landingPageMacro?: string;
  landingPageType?: "url" | "deeplink";
  deeplinkUrl?: string;
  deeplinkMacro?: string;
  defaultLandingPageUrl?: string;

  // 组件名称（最多20字符）
  componentName?: string;

  // 宏替换变量映射
  macroVariables?: Record<string, string>;
}

export interface FloatingWindowTemplateProps {
  config: FloatingWindowTemplateConfig;
  isOpen?: boolean;
  onClose?: () => void;
  onButtonClick?: (config: FloatingWindowTemplateConfig) => void;
  previewMode?: boolean;
}

// 默认配置
const defaultConfig: FloatingWindowTemplateConfig = {
  position: "bottom",
  iconUrl: "",
  title: "卡片标题",
  promotionPoints: [{ id: "1", text: "推广卖点1" }],
  buttonText: "立即查看",
  componentName: "浮窗",
};

export function FloatingWindowTemplate({
  config,
  isOpen = true,
  onClose,
  onButtonClick,
  previewMode = false,
}: FloatingWindowTemplateProps) {
  // 合并默认配置
  const finalConfig: FloatingWindowTemplateConfig = {
    ...defaultConfig,
    ...config,
  };

  const [isAnimating, setIsAnimating] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [glowPhase, setGlowPhase] = useState<"none" | "card" | "button">("none");
  const [glowProgress, setGlowProgress] = useState(0); // 0~1 卡片流光进度
  const [buttonGlowProgress, setButtonGlowProgress] = useState(0); // 0~1 按钮流光进度
  const cardRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  // 获取有效的推广卖点
  const safePoints = Array.isArray(finalConfig.promotionPoints) ? finalConfig.promotionPoints : [];
  const validPoints = safePoints.filter(p => p.text);
  const hasMultiplePoints = validPoints.length > 1;

  // 宏替换函数 - 支持 ${key}、$key、{key} 三种格式
  const resolveMacro = (macro: string): string => {
    if (!macro || !finalConfig.macroVariables) return macro;
    let result = macro;
    Object.entries(finalConfig.macroVariables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
      result = result.replace(new RegExp(`\\$${key}`, 'g'), value);
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    });
    return result;
  };

  // 检查字符串是否包含未解析的宏占位符
  const hasUnresolvedMacro = (str: string): boolean => {
    return str.includes('${') || str.startsWith('$') || /\{[a-zA-Z_]\w*\}/.test(str);
  };

  // 解析图标 - 有 iconMacro 则使用宏模式
  const resolveIcon = (): string | undefined => {
    if (finalConfig.iconMacro) {
      const resolved = resolveMacro(finalConfig.iconMacro);
      if (hasUnresolvedMacro(resolved)) {
        return finalConfig.iconUrl || undefined;
      }
      return resolved || finalConfig.iconUrl || undefined;
    }
    if (finalConfig.iconUrl) {
      return finalConfig.iconUrl;
    }
    return undefined;
  };

  // 解析标题 - 有 titleMacro 则使用宏模式
  const resolveTitle = (): string => {
    if (finalConfig.titleMacro) {
      const resolved = resolveMacro(finalConfig.titleMacro);
      if (hasUnresolvedMacro(resolved)) {
        // 宏未解析：回退到 title，如果 title 也为空则显示宏原始值
        return finalConfig.title || finalConfig.titleMacro;
      }
      return resolved;
    }
    return finalConfig.title;
  };

  // 解析推广卖点
  const resolvePointText = (point: FloatingWindowPromotionPoint): string => {
    if (point.textMacro) {
      const resolved = resolveMacro(point.textMacro);
      if (hasUnresolvedMacro(resolved)) {
        return point.text || point.textMacro;
      }
      return resolved;
    }
    return point.text;
  };

  // 解析落地页链接
  const resolveLandingPageUrl = (): string | undefined => {
    if (finalConfig.landingPageType === "deeplink") {
      if (finalConfig.deeplinkMacro) {
        const resolved = resolveMacro(finalConfig.deeplinkMacro);
        if (hasUnresolvedMacro(resolved)) {
          return undefined;
        }
        return resolved;
      }
      if (finalConfig.deeplinkUrl) {
        return resolveMacro(finalConfig.deeplinkUrl);
      }
      return undefined;
    }

    if (finalConfig.landingPageMacro) {
      const resolved = resolveMacro(finalConfig.landingPageMacro);
      if (hasUnresolvedMacro(resolved)) {
        return undefined;
      }
      return resolved;
    }
    if (finalConfig.landingPageUrl) {
      return resolveMacro(finalConfig.landingPageUrl);
    }
    if (finalConfig.defaultLandingPageUrl) {
      return resolveMacro(finalConfig.defaultLandingPageUrl);
    }
    return undefined;
  };

  // 自动轮播
  useEffect(() => {
    if (!hasMultiplePoints || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validPoints.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [hasMultiplePoints, isPaused, validPoints.length]);

  // 入场动画 - isOpen 或 position 变化时重新播放
  useEffect(() => {
    if (isClosed) return;
    setIsAnimating(false);
    setGlowPhase("none");
    setGlowProgress(0);
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, 150);
    // 滑入动画1.2s完成后，触发卡片边框七彩光带顺时针跑一圈
    const cardGlowTimer = setTimeout(() => {
      setGlowPhase("card");
    }, 150 + 1200);
    return () => {
      clearTimeout(timer);
      clearTimeout(cardGlowTimer);
    };
  }, [isOpen, finalConfig.position, isClosed]);

  // 卡片边框流光动画 - 光带沿四条边顺时针移动
  useEffect(() => {
    if (glowPhase !== "card") return;
    const duration = 1500; // 1.5s 跑一圈
    const startTime = performance.now();
    let rafId: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setGlowProgress(progress);
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        // 卡片流光跑完一圈，切换到按钮流光
        setGlowPhase("button");
        setGlowProgress(0);
      }
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [glowPhase]);

  // 按钮边框流光动画 - 光带沿四条边持续顺时针转圈
  useEffect(() => {
    if (glowPhase !== "button") return;
    const duration = 1000; // 1s 跑一圈
    let startTime = performance.now();
    let rafId: number;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = (elapsed % duration) / duration;
      setButtonGlowProgress(progress);
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [glowPhase]);

  // 根据进度计算光带在卡片边框上的位置和旋转
  const getGlowPosition = (progress: number, w: number, h: number) => {
    const perimeter = 2 * (w + h);
    const dist = progress * perimeter;
    if (dist <= w) {
      // 上边：左→右
      return { x: dist, y: 0, rotation: 0 };
    } else if (dist <= w + h) {
      // 右边：上→下
      return { x: w, y: dist - w, rotation: 90 };
    } else if (dist <= 2 * w + h) {
      // 下边：右→左
      return { x: w - (dist - w - h), y: h, rotation: 180 };
    } else {
      // 左边：下→上
      return { x: 0, y: h - (dist - 2 * w - h), rotation: 270 };
    }
  };

  // 全局点击跳转 - 点击浮层任意位置（含卡片区域）触发落地页跳转
  const handleGlobalClick = (e: React.MouseEvent) => {
    const url = resolveLandingPageUrl();
    if (url) {
      openLandingPage(finalConfig, url);
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = resolveLandingPageUrl();
    if (url) {
      openLandingPage(finalConfig, url);
    }
    onButtonClick?.(finalConfig);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + validPoints.length) % validPoints.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % validPoints.length);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewMode) {
      // 预览模式下，关闭后重新播放动画
      setIsAnimating(false);
      setIsClosed(true);
      setTimeout(() => {
        setIsClosed(false);
        setIsAnimating(true);
      }, 800);
    } else {
      setIsAnimating(false);
      onClose?.();
    }
  };

  const iconSrc = resolveIcon();
  const currentPoint = validPoints[currentIndex] || { text: "" };
  const position = finalConfig.position || "bottom";
  const isMiddle = position === "middle";

  // 根据位置决定滑入动画的初始偏移
  const getAnimationTransform = () => {
    if (isAnimating) {
      return "translate(0, 0)";
    }
    switch (position) {
      case "top":
        return "translate(0, -100%)";
      case "bottom":
        return "translate(0, 100%)";
      case "middle":
        return "translate(-100%, 0)";
    }
  };

  // 根据位置获取浮窗宽度
  const getWindowWidth = () => {
    if (previewMode) {
      // 预览模式：用百分比填充父容器（手机外框由配置页/列表页提供）
      return "100%";
    }
    return "640px";
  };

  // 缩放比例（预览模式下文字和图标需要等比缩小）
  // 预览容器约264px宽（280px手机框 - 16px内边距），模拟640px设计宽度
  const scale = previewMode ? 264 / 640 : 1;

  // 流光边框圆角
  const glowBorderRadius = previewMode ? `${12 * scale}px` : "12px";

  // 流光光带长度（卡片短边的80%）
  const glowBandLength = previewMode ? `${Math.max(60 * scale, 30)}px` : "80px";
  const glowBandWidth = previewMode ? `${Math.max(4 * scale, 2)}px` : "5px";

  // 浮窗卡片主体（外层容器 + 内层内容 + 光带）
  const floatingWindowContent = (
    <div
      ref={cardRef}
      className="relative cursor-pointer"
      style={{
        width: getWindowWidth(),
        height: `${100 * scale}px`,
        transform: getAnimationTransform(),
        transition: "transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        borderRadius: glowBorderRadius,
        overflow: "visible",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 卡片边框七彩光带 - JS驱动沿四条边顺时针移动 */}
      {glowPhase === "card" && (() => {
        const w = cardRef.current?.offsetWidth ?? (previewMode ? 264 : 640);
        const h = cardRef.current?.offsetHeight ?? (100 * scale);
        const pos = getGlowPosition(glowProgress, w, h);
        return (
          <div
            style={{
              position: "absolute",
              width: glowBandLength,
              height: glowBandWidth,
              background: "linear-gradient(90deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff, #ff00ff)",
              borderRadius: `${Math.max(3 * scale, 2)}px`,
              boxShadow: `0 0 ${Math.max(8 * scale, 4)}px ${Math.max(3 * scale, 1)}px rgba(255, 100, 100, 0.5), 0 0 ${Math.max(16 * scale, 8)}px ${Math.max(6 * scale, 2)}px rgba(100, 100, 255, 0.3)`,
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transform: `translate(-50%, -50%) rotate(${pos.rotation}deg)`,
              zIndex: 30,
              pointerEvents: "none",
            }}
          />
        );
      })()}

      {/* 卡片内容层 */}
      <div
        className="relative overflow-hidden h-full"
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: glowBorderRadius,
          border: glowPhase === "card" ? `${Math.max(1.5 * scale, 1)}px solid rgba(255, 255, 255, 0.3)` : "none",
          backdropFilter: "blur(8px)",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04)",
        }}
      >
      {/* 关闭按钮 - stopPropagation 阻止冒泡到浮层全局点击 */}
      <button
        onClick={(e) => { e.stopPropagation(); handleClose(e); }}
        className="absolute flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 z-10 transition-colors duration-200 cursor-pointer"
        style={{
          top: `${Math.max(4 * scale, 3)}px`,
          right: `${Math.max(4 * scale, 3)}px`,
          width: `${Math.max(20 * scale, 16)}px`,
          height: `${Math.max(20 * scale, 16)}px`,
          borderRadius: `${Math.max(4 * scale, 3)}px`,
        }}
        aria-label="关闭浮窗"
      >
        <X style={{ width: `${Math.max(12 * scale, 10)}px`, height: `${Math.max(12 * scale, 10)}px` }} />
      </button>

      {/* 内容 - 左图右文水平布局 */}
      <div
        className="flex items-center h-full"
        style={{ padding: `${Math.max(8 * scale, 6)}px`, gap: `${Math.max(8 * scale, 5)}px` }}
      >
        {/* 左侧：图标 */}
        <div
          className="flex-shrink-0 flex items-center justify-center rounded overflow-hidden"
          style={{
            width: `${Math.max(48 * scale, 24)}px`,
            height: `${Math.max(48 * scale, 24)}px`,
            backgroundColor: "#F3F4F6",
          }}
        >
          {iconSrc ? (
            <img
              src={iconSrc}
              alt="图标"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <ImageIcon style={{ width: `${Math.max(24 * scale, 14)}px`, height: `${Math.max(24 * scale, 14)}px` }} className="text-gray-400" />
          )}
        </div>

        {/* 中间：标题 + 推广卖点 */}
        <div className="flex-1 min-w-0 flex flex-col justify-center" style={{ gap: `${Math.max(2 * scale, 2)}px` }}>
          {/* 标题 */}
          <p className="text-gray-800 font-medium truncate leading-tight" style={{ fontSize: `${Math.max(12 * scale, 10)}px` }}>
            {resolveTitle()}
          </p>

          {/* 推广卖点 */}
          <p className="text-gray-500 truncate leading-tight" style={{ fontSize: `${Math.max(10 * scale, 9)}px` }}>
            {resolvePointText(currentPoint)}
          </p>
        </div>

        {/* 右侧：行动号召按钮（含流光边框） */}
        <div
          ref={buttonRef}
          className="flex-shrink-0 relative"
          style={{
            borderRadius: `${Math.max(6 * scale, 4)}px`,
            overflow: 'hidden',
            padding: `${Math.max(2 * scale, 1)}px`,
          }}
        >
          {/* 按钮流光层 - 七彩光带沿边框持续顺时针转圈 */}
          {glowPhase === "button" && buttonRef.current && (() => {
            const bw = buttonRef.current.offsetWidth;
            const bh = buttonRef.current.offsetHeight;
            const glowLen = Math.max(30, (2 * (bw + bh)) * 0.2);
            const pos = getGlowPosition(buttonGlowProgress, bw, bh);
            return (
              <span
                className="absolute pointer-events-none"
                style={{
                  left: `${pos.x - glowLen / 2}px`,
                  top: `${pos.y - 6}px`,
                  width: `${glowLen}px`,
                  height: '12px',
                  background: 'linear-gradient(90deg, transparent, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff, #ff00ff, transparent)',
                  borderRadius: '6px',
                  transform: `rotate(${pos.rotation}deg)`,
                  filter: 'blur(2px)',
                  boxShadow: '0 0 8px 2px rgba(255,100,0,0.6), 0 0 16px 4px rgba(0,100,255,0.3)',
                }}
              />
            );
          })()}
          <button
            onClick={handleButtonClick}
            className="relative text-white rounded flex items-center justify-center whitespace-nowrap cursor-pointer hover:opacity-90 transition-opacity duration-200 font-medium"
            style={{
              height: `${Math.max(24 * scale, 18)}px`,
              paddingLeft: `${Math.max(8 * scale, 6)}px`,
              paddingRight: `${Math.max(8 * scale, 6)}px`,
              fontSize: `${Math.max(10 * scale, 9)}px`,
              backgroundColor: "#3087FF",
              borderRadius: `${Math.max(4 * scale, 3)}px`,
            }}
          >
            {finalConfig.buttonText}
          </button>
        </div>
      </div>
      </div>{/* 关闭卡片内容层 */}
    </div>
  );

  // 预览模式 - 直接填充父容器（手机外框由配置页/组件列表页提供），全屏透明浮层 + flexbox 定位
  if (previewMode) {
    return (
      <div className="relative w-full h-full">
        {/* 模拟手机屏幕内容 */}
        <div className="absolute inset-0 flex flex-col items-center justify-start pt-6 px-4 gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-full rounded-lg bg-gray-100"
              style={{ height: "36px" }}
            />
          ))}
        </div>

        {/* 全屏透明浮层 - 通过 flexbox 定位卡片 */}
        {!isClosed && (
          <div
            className="absolute inset-0 z-20 flex flex-col"
            style={{
              background: "transparent",
              cursor: "pointer",
              justifyContent: position === "top" ? "flex-start" : position === "bottom" ? "flex-end" : "center",
              alignItems: "center",
              padding: position === "top"
                ? `${8 * scale}px ${8 * scale}px 0 ${8 * scale}px`
                : position === "bottom"
                  ? `0 ${8 * scale}px ${8 * scale}px ${8 * scale}px`
                  : `${8 * scale}px`,
            }}
            onClick={handleGlobalClick}
          >
            {floatingWindowContent}
          </div>
        )}
      </div>
    );
  }

  // 非预览模式 - 全屏透明浮层 + flexbox 定位
  return (
    <>
      {!isClosed && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{
            background: "transparent",
            cursor: "pointer",
            justifyContent: position === "top" ? "flex-start" : position === "bottom" ? "flex-end" : "center",
            alignItems: "center",
            padding: position === "top"
              ? "12px 12px 0 12px"
              : position === "bottom"
                ? "0 12px 12px 12px"
                : "12px",
          }}
          onClick={handleGlobalClick}
        >
          {floatingWindowContent}
        </div>
      )}
    </>
  );
}

// 导出默认配置供外部使用
export const defaultFloatingWindowConfig: FloatingWindowTemplateConfig = {
  position: "bottom",
  iconUrl: "",
  title: "卡片标题",
  promotionPoints: [{ id: "1", text: "推广卖点1" }],
  buttonText: "立即查看",
  componentName: "浮窗",
};
