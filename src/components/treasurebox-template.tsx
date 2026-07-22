"use client";

import React, { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { TreasureBoxConfig } from "./treasurebox-template-config";
import { openLandingPage } from "./landing-page-config";

interface TreasureBoxTemplateProps {
  config?: Partial<TreasureBoxConfig>;
  isOpen?: boolean;
  onClose?: () => void;
  previewMode?: boolean;
}

// 解析宏变量
function resolveMacro(macro: string, variables?: Record<string, string>): string {
  if (!macro || !variables) return macro;
  let result = macro;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
    result = result.replace(new RegExp(`\\$${key}`, 'g'), value);
  });
  return result;
}

export function TreasureBoxTemplate({
  config,
  isOpen = true,
  onClose,
  previewMode = false,
}: TreasureBoxTemplateProps) {
  // 状态
  const [showReward, setShowReward] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [gestureIndex, setGestureIndex] = useState(0);
  const [flipHoverIndex, setFlipHoverIndex] = useState(-1);

  // 使用默认配置填充空值
  const defaultConfig: TreasureBoxConfig = {
    guideText: "点击宝箱，领取奖品",
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
    treasureboxImageUrl: "/treasurebox-close.png",
    treasureboxImageMacro: "",
    landingPageUrl: "",
    landingPageMacro: "",
    defaultLandingPageUrl: "",
    macroVariables: {},
    componentName: "点击宝箱领取奖品",
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
    return finalConfig.landingPageUrl || finalConfig.defaultLandingPageUrl || "";
  }, [finalConfig.landingPageMacro, finalConfig.landingPageUrl, finalConfig.defaultLandingPageUrl, finalConfig.macroVariables]);

  // 解析宝箱图片
  const resolveTreasureboxImage = useCallback(() => {
    if (finalConfig.treasureboxImageMacro) {
      const resolved = resolveMacro(finalConfig.treasureboxImageMacro, finalConfig.macroVariables);
      if (resolved.includes("${") || resolved.startsWith("$")) {
        return finalConfig.treasureboxImageUrl || "/treasurebox-close.png";
      }
      return resolved;
    }
    return finalConfig.treasureboxImageUrl || "/treasurebox-close.png";
  }, [finalConfig.treasureboxImageMacro, finalConfig.treasureboxImageUrl, finalConfig.macroVariables]);

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
      // 同步更新手势和宝箱状态
      setGestureIndex((prev) => (prev + 1) % 3);
    }, 1500);
    
    return () => clearInterval(interval);
  }, [isVisible, showReward, isFlipping]);
  
  // 宝箱抖动跟随手势
  useEffect(() => {
    setFlipHoverIndex(gestureIndex);
  }, [gestureIndex]);

  // 点击宝箱
  const handleTreasureboxClick = useCallback(() => {
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

  return (
    <div
      className={cn(
        previewMode
          ? "absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-full px-4 flex items-center justify-center"
          : "fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      )}
      onClick={() => !previewMode && onClose?.()}
    >
      {/* Modal Content */}
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
            "0 16px 40px rgba(15, 5, 30, 0.45), 0 2px 8px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.10)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 节日光晕装饰 - 金色+红色（宝藏节日感） */}
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            top: "-12px",
            left: "-12px",
            width: "120px",
            height: "120px",
            background: "radial-gradient(circle, rgba(255, 215, 0, 0.40) 0%, rgba(255, 215, 0, 0) 70%)",
            filter: "blur(8px)",
            zIndex: 0,
          }}
        />
        <div
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            bottom: "-12px",
            right: "-12px",
            width: "140px",
            height: "140px",
            background: "radial-gradient(circle, rgba(255, 75, 87, 0.32) 0%, rgba(255, 75, 87, 0) 70%)",
            filter: "blur(10px)",
            zIndex: 0,
          }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="关闭"
          className="absolute top-3 right-3 z-20 w-7 h-7 flex items-center justify-center rounded-full transition-all hover:opacity-80"
          style={{
            background: "rgba(255, 255, 255, 0.18)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "0.5px solid rgba(255, 255, 255, 0.30)",
          }}
        >
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-4 pt-4 flex flex-col items-center relative z-10">
          {!showReward ? (
            /* 宝箱场景 */
            <>
              {/* 引导文案 */}
              <div className="mb-5 text-center">
                <div
                  className="rounded-full px-4 py-1.5"
                  style={{
                    background: "linear-gradient(135deg, rgba(255, 75, 87, 0.85) 0%, rgba(220, 38, 38, 0.85) 100%)",
                    boxShadow: "0 4px 12px rgba(255, 75, 87, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.30)",
                    border: "0.5px solid rgba(255, 255, 255, 0.25)",
                  }}
                >
                  <p className="text-white text-[13px] font-semibold tracking-wide animate-pulse">
                    {resolveGuideText()}
                  </p>
                </div>
              </div>

              {/* 三个宝箱并排 - 手势内嵌到宝箱上方 */}
              <div className="flex items-center justify-center gap-4 mb-3">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className={cn(
                      "relative cursor-pointer select-none",
                      "transform transition-transform duration-300",
                      "hover:scale-105 active:scale-95"
                    )}
                    onClick={handleTreasureboxClick}
                    style={{
                      filter: "drop-shadow(0 8px 16px rgba(255, 215, 0, 0.35))",
                    }}
                  >
                    {/* 手势提示 */}
                    {gestureIndex === index && (
                      <img
                        src="/treasurebox-gesture.png"
                        alt="手势"
                        className="w-10 h-auto absolute animate-bounce z-10"
                        style={{ top: '20px', left: 'calc(50% + 2px)', transform: 'translateX(-50%)', animationDuration: '0.8s' }}
                        draggable={false}
                      />
                    )}
                    {/* 宝箱图片 - 手势指向时抖动 */}
                    <img
                      src={resolveTreasureboxImage()}
                      alt={`宝箱${index + 1}`}
                      className={cn(
                        "w-[100px] h-auto object-contain transition-transform duration-300",
                        flipHoverIndex === index && !isFlipping && "animate-shake",
                        isFlipping && "animate-flip"
                      )}
                      draggable={false}
                    />
                  </div>
                ))}
              </div>

              {/* 提示文字 */}
              <p className="mt-3 text-white/60 text-[11px] font-medium tracking-wider text-center">
                点击宝箱翻出惊喜
              </p>
            </>
          ) : (
            /* 领奖场景 */
            <div className="w-full flex flex-col items-center animate-fadeIn">
              {/* 奖励展示 */}
              <div className="mb-5 text-center">
                {finalConfig.rewardType === "cash" ? (
                  /* 现金奖励 */
                  <div
                    className="rounded-2xl p-5"
                    style={{
                      background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                      boxShadow:
                        "0 8px 24px rgba(255, 165, 0, 0.40), 0 2px 6px rgba(0, 0, 0, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.45), inset 0 -2px 0 rgba(180, 100, 0, 0.30)",
                      border: "0.5px solid rgba(255, 255, 255, 0.30)",
                    }}
                  >
                    <p className="text-white/85 text-[12px] font-medium tracking-wide mb-0.5">恭喜获得</p>
                    <p
                      className="text-white text-4xl font-bold tracking-tight"
                      style={{ fontVariantNumeric: "tabular-nums", textShadow: "0 2px 4px rgba(180, 100, 0, 0.30)" }}
                    >
                      ¥{resolveCashAmount()}
                    </p>
                  </div>
                ) : (
                  /* 自定义图片奖励 */
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.30), 0 2px 6px rgba(0, 0, 0, 0.12)",
                      border: "0.5px solid rgba(255, 255, 255, 0.25)",
                    }}
                  >
                    {resolveRewardImage() ? (
                      <img
                        src={resolveRewardImage()}
                        alt="奖励"
                        className="w-[280px] h-auto object-contain"
                      />
                    ) : (
                      <div className="w-[280px] h-[150px] bg-white/10 flex items-center justify-center">
                        <span className="text-white/50">奖励图片</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 奖品文案 */}
              <p
                className="text-[18px] font-bold mb-1.5 text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                }}
              >
                {resolveRewardText()}
              </p>

              {/* 特殊说明 */}
              <p className="text-white/65 text-[12px] font-light mb-5 text-center px-2">
                {resolveSpecialNote()}
              </p>

              {/* 领取按钮 */}
              <button
                onClick={handleClaim}
                className="w-full py-2.5 px-6 text-white text-[15px] font-semibold rounded-2xl active:scale-95 transition-all"
                style={{
                  background: "linear-gradient(180deg, #FF6B6B 0%, #E0383B 100%)",
                  boxShadow:
                    "0 6px 16px rgba(255, 75, 87, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.30), inset 0 -2px 0 rgba(180, 30, 30, 0.30)",
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
        
        @keyframes shake {
          0%, 100% {
            transform: translateX(0) rotate(0deg);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-3px) rotate(-5deg);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(3px) rotate(5deg);
          }
        }
        
        .animate-flip {
          animation: flip 0.6s ease-in-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out infinite;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

export default TreasureBoxTemplate;
