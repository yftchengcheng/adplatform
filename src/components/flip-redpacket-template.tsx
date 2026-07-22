"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlipRedpacketTemplateConfig } from "./flip-redpacket-template-config";
import { openLandingPage } from "./landing-page-config";

// Props
export interface FlipRedpacketTemplateProps {
  config: FlipRedpacketTemplateConfig;
  isOpen?: boolean;
  previewMode?: boolean;
  onClose?: () => void;
  onSave?: (config: FlipRedpacketTemplateConfig) => void;
}

// 解析宏变量
function resolveMacro(text: string, variables?: Record<string, string>): string {
  if (!text) return text;
  if (!variables) return text;
  
  let result = text;
  Object.entries(variables).forEach(([key, value]) => {
    // 支持 ${key} 和 $key 两种格式
    result = result.replace(new RegExp(`\\$\\{${key}\\}`, "g"), value);
    result = result.replace(new RegExp(`\\$${key}`, "g"), value);
  });
  return result;
}

export function FlipRedpacketTemplate({
  config,
  isOpen = true,
  previewMode = false,
  onClose,
  onSave,
}: FlipRedpacketTemplateProps) {
  // 状态
  const [showReward, setShowReward] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [gestureIndex, setGestureIndex] = useState(0);
  const [flipHoverIndex, setFlipHoverIndex] = useState(-1);

  // 使用默认配置填充空值
  const defaultConfig: FlipRedpacketTemplateConfig = {
    guideText: "点击红包，领取奖品",
    guideTextMacro: "",
    rewardType: "cash",
    cashAmount: "88.88",
    cashAmountMacro: "",
    rewardImageUrl: "",
    rewardImageMacro: "",
    rewardText: "恭喜发财",
    rewardTextMacro: "",
    specialNote: "实际奖品以APP为准！",
    specialNoteMacro: "",
    redpacketImageUrl: "/redbag-bg.png",
    redpacketImageMacro: "",
    landingPageUrl: "",
    landingPageMacro: "",
    defaultLandingPageUrl: "",
    macroVariables: {},
    componentName: "点击红包领取奖品",
  };

  const finalConfig = { ...defaultConfig, ...config };

  // 解析宏变量
  const resolveMacroText = useCallback(
    (text?: string, macroText?: string) => {
      if (macroText) {
        const resolved = resolveMacro(macroText, finalConfig.macroVariables);
        if (resolved.includes("${") || resolved.startsWith("$")) {
          return text || "";
        }
        return resolved;
      }
      return text || "";
    },
    [finalConfig.macroVariables]
  );

  // 解析引导文案
  const resolveGuideText = useCallback(() => {
    return resolveMacroText(finalConfig.guideText, finalConfig.guideTextMacro);
  }, [finalConfig.guideText, finalConfig.guideTextMacro, resolveMacroText]);

  // 解析现金金额
  const resolveCashAmount = useCallback(() => {
    return resolveMacroText(finalConfig.cashAmount, finalConfig.cashAmountMacro);
  }, [finalConfig.cashAmount, finalConfig.cashAmountMacro, resolveMacroText]);

  // 解析奖品文案
  const resolveRewardText = useCallback(() => {
    return resolveMacroText(finalConfig.rewardText, finalConfig.rewardTextMacro);
  }, [finalConfig.rewardText, finalConfig.rewardTextMacro, resolveMacroText]);

  // 解析特殊说明
  const resolveSpecialNote = useCallback(() => {
    return resolveMacroText(finalConfig.specialNote, finalConfig.specialNoteMacro);
  }, [finalConfig.specialNote, finalConfig.specialNoteMacro, resolveMacroText]);

  // 解析落地页
  const resolveLandingPage = useCallback((): string => {
    if (finalConfig.landingPageMacro) {
      const resolved = resolveMacro(finalConfig.landingPageMacro, finalConfig.macroVariables);
      if (resolved.includes("${") || resolved.startsWith("$")) {
        return finalConfig.defaultLandingPageUrl || "";
      }
      return resolved;
    }
    if (finalConfig.landingPageUrl) {
      return resolveMacro(finalConfig.landingPageUrl, finalConfig.macroVariables);
    }
    return finalConfig.defaultLandingPageUrl || "";
  }, [finalConfig.landingPageMacro, finalConfig.landingPageUrl, finalConfig.defaultLandingPageUrl, finalConfig.macroVariables]);

  // 解析红包图片
  const resolveRedpacketImage = useCallback(() => {
    if (finalConfig.redpacketImageMacro) {
      const resolved = resolveMacro(finalConfig.redpacketImageMacro, finalConfig.macroVariables);
      if (resolved.includes("${") || resolved.startsWith("$")) {
        return finalConfig.redpacketImageUrl || "/redbag-bg.png";
      }
      return resolved;
    }
    return finalConfig.redpacketImageUrl || "/redbag-bg.png";
  }, [finalConfig.redpacketImageMacro, finalConfig.redpacketImageUrl, finalConfig.macroVariables]);

  // 解析奖励图片
  const resolveRewardImage = useCallback(() => {
    if (finalConfig.rewardImageMacro) {
      const resolved = resolveMacro(finalConfig.rewardImageMacro, finalConfig.macroVariables);
      if (resolved.includes("${") || resolved.startsWith("$")) {
        return finalConfig.rewardImageUrl || "";
      }
      return resolved;
    }
    return finalConfig.rewardImageUrl || "";
  }, [finalConfig.rewardImageMacro, finalConfig.rewardImageUrl, finalConfig.macroVariables]);

  // 入场动画
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // 手势顺序闪现（1.5秒切换一次）
  useEffect(() => {
    if (!isVisible || showReward) return;
    
    const interval = setInterval(() => {
      const nextIndex = (gestureIndex + 1) % 3;
      setGestureIndex(nextIndex);
      setFlipHoverIndex(nextIndex);
    }, 1500);
    
    return () => clearInterval(interval);
  }, [isVisible, showReward, gestureIndex]);

  // 点击红包
  const handleRedpacketClick = useCallback(() => {
    if (isFlipping) return;
    setIsFlipping(true);
    
    // 翻转动画结束后显示奖励
    setTimeout(() => {
      setShowReward(true);
      setIsFlipping(false);
    }, 600);
  }, [isFlipping]);

  // 点击领取
  const handleClaim = useCallback(() => {
    const landingPage = resolveLandingPage();
    if (landingPage) {
      openLandingPage(finalConfig, landingPage);
    } else if (!previewMode) {
      onClose?.();
    }
  }, [previewMode, resolveLandingPage, onClose]);

  // 点击红包（移动端支持）
  const handleTouchStart = useCallback(() => {
    // 移动端点击效果
  }, []);

  return (
    <div
      className={cn(
        previewMode
          ? "w-full h-full absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex items-center justify-center p-4"
          : "fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      )}
      onClick={() => !previewMode && onClose?.()}
    >
      {/* Modal Content - 深紫毛玻璃 + 节日装饰光晕 */}
      <div
        className={cn(
          previewMode
            ? "relative w-full rounded-3xl overflow-hidden"
            : "relative w-full max-w-sm rounded-3xl overflow-hidden",
          "transition-all duration-500",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        )}
        style={{
          background: "linear-gradient(180deg, rgba(26, 10, 46, 0.55) 0%, rgba(45, 27, 78, 0.55) 100%)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          border: "1px solid rgba(255, 255, 255, 0.18)",
          boxShadow:
            "0 16px 40px rgba(15, 5, 30, 0.45), 0 2px 8px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 节日装饰光晕（金色 + 红色） */}
        <div
          className="pointer-events-none absolute -top-12 -left-12 w-48 h-48 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255, 215, 0, 0.35) 0%, rgba(255, 215, 0, 0) 70%)",
            filter: "blur(8px)",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-16 -right-16 w-56 h-56 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255, 75, 87, 0.30) 0%, rgba(255, 75, 87, 0) 70%)",
            filter: "blur(10px)",
          }}
        />

        {/* Close Button - 毛玻璃化 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-7 h-7 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity"
          style={{
            background: "rgba(255, 255, 255, 0.18)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "0.5px solid rgba(255, 255, 255, 0.30)",
          }}
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Content */}
        <div className="relative px-6 py-7 flex flex-col items-center">
          {!showReward ? (
            /* 红包场景 - 三个红包并排 */
            <>
              {/* 引导文案 - 红色节日 chip */}
              <div className="mb-7 text-center">
                <div
                  className="rounded-full px-4 py-1.5"
                  style={{
                    background: "linear-gradient(135deg, rgba(255, 75, 87, 0.85) 0%, rgba(220, 38, 38, 0.85) 100%)",
                    boxShadow: "0 4px 12px rgba(255, 75, 87, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.25)",
                    border: "0.5px solid rgba(255, 255, 255, 0.25)",
                  }}
                >
                  <p className="text-white text-[13px] font-semibold tracking-wide animate-pulse">
                    {resolveGuideText()}
                  </p>
                </div>
              </div>

              {/* 三个红包并排 - 手势内嵌到红包上方 */}
              <div className="flex items-center justify-center gap-4 mb-2">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className={cn(
                      "relative cursor-pointer select-none",
                      "transform transition-transform duration-300",
                      "hover:scale-105 active:scale-95"
                    )}
                    onClick={handleRedpacketClick}
                  >
                    {/* 手势提示 */}
                    {gestureIndex === index && (
                      <img
                        src="/flip-redpacket-gesture.png"
                        alt="手势"
                        className="w-10 h-auto absolute animate-bounce z-10"
                        style={{ top: '20px', left: 'calc(50% + 2px)', transform: 'translateX(-50%)', animationDuration: '0.8s' }}
                        draggable={false}
                      />
                    )}
                    {/* 红包图片 - 手势指向时翻转 */}
                    <img
                      src={resolveRedpacketImage()}
                      alt={`红包${index + 1}`}
                      className={cn(
                        "w-[100px] h-auto object-contain transition-transform duration-300",
                        "drop-shadow-[0_8px_16px_rgba(255,75,87,0.35)]",
                        flipHoverIndex === index && "animate-gesture-flip",
                        isFlipping && "animate-flip"
                      )}
                      draggable={false}
                    />
                  </div>
                ))}
              </div>

              {/* 提示文字 */}
              <p className="mt-5 text-white/80 text-[11px] text-center font-medium tracking-wider">
                点击红包翻出惊喜
              </p>
            </>
          ) : (
            /* 领奖场景 */
            <div className="w-full flex flex-col items-center animate-fadeIn">
              {/* 奖励展示 */}
              <div className="mb-5 text-center">
                {finalConfig.rewardType === "cash" ? (
                  /* 现金奖励 - 金色玻璃 */
                  <div
                    className="rounded-2xl px-8 py-5"
                    style={{
                      background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                      boxShadow: "0 8px 20px rgba(255, 165, 0, 0.40), inset 0 1px 0 rgba(255, 255, 255, 0.35), inset 0 -1px 0 rgba(180, 100, 0, 0.20)",
                      border: "0.5px solid rgba(255, 255, 255, 0.30)",
                    }}
                  >
                    <p className="text-white/90 text-xs mb-1 font-medium tracking-wide">恭喜获得</p>
                    <p className="text-white text-4xl font-bold tracking-tight tabular-nums" style={{ textShadow: "0 2px 4px rgba(180, 100, 0, 0.30)" }}>
                      ¥{resolveCashAmount()}
                    </p>
                  </div>
                ) : (
                  /* 自定义图片奖励 */
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.25)",
                      border: "0.5px solid rgba(255, 255, 255, 0.25)",
                    }}
                  >
                    {resolveRewardImage() ? (
                      <img
                        src={resolveRewardImage()}
                        alt="奖励"
                        className="w-[260px] h-auto object-contain"
                      />
                    ) : (
                      <div className="w-[260px] h-[150px] bg-white/10 flex items-center justify-center backdrop-blur-sm">
                        <span className="text-white/60 text-sm">奖励图片</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 奖品文案 */}
              <p
                className="text-transparent bg-clip-text text-lg font-bold mb-1.5"
                style={{
                  backgroundImage: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                }}
              >
                {resolveRewardText()}
              </p>

              {/* 特殊说明 */}
              <p className="text-white/70 text-xs mb-5 font-light">
                {resolveSpecialNote()}
              </p>

              {/* 领取按钮 - 红色精致渐变 */}
              <button
                onClick={handleClaim}
                className="w-full py-3 px-6 text-white text-[15px] font-semibold rounded-2xl transition-all active:scale-95"
                style={{
                  background: "linear-gradient(180deg, #FF6B6B 0%, #E0383B 100%)",
                  boxShadow: "0 6px 16px rgba(255, 75, 87, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.30), inset 0 -1px 0 rgba(180, 30, 40, 0.20)",
                  border: "0.5px solid rgba(255, 255, 255, 0.20)",
                  letterSpacing: "0.05em",
                }}
              >
                立即领取
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes flip {
          0% {
            transform: rotateY(0deg) scale(1);
          }
          50% {
            transform: rotateY(90deg) scale(1.1);
          }
          100% {
            transform: rotateY(0deg) scale(1);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-flip {
          animation: flip 0.6s ease-in-out;
        }
        
        .animate-gesture-flip {
          animation: gestureFlip 0.3s ease-in-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        
        @keyframes gestureFlip {
          0%, 100% {
            transform: scaleX(1) rotateY(0deg);
          }
          50% {
            transform: scaleX(0) rotateY(90deg);
          }
        }
      `}</style>
    </div>
  );
}

export default FlipRedpacketTemplate;
