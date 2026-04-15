"use client";

import React, { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FlipCardConfig } from "./flip-card-template-config";

interface FlipCardTemplateProps {
  config?: Partial<FlipCardConfig>;
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

export function FlipCardTemplate({
  config,
  isOpen = true,
  onClose,
  previewMode = false,
}: FlipCardTemplateProps) {
  // 状态
  const [showReward, setShowReward] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [gestureIndex, setGestureIndex] = useState(0);
  const [flipHoverIndex, setFlipHoverIndex] = useState(-1);

  // 使用默认配置填充空值
  const defaultConfig: FlipCardConfig = {
    guideText: "点击卡牌，领取奖品",
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
    cardImageUrl: "/card-item.png",
    cardImageMacro: "",
    landingPageUrl: "",
    landingPageMacro: "",
    defaultLandingPageUrl: "",
    macroVariables: {},
    componentName: "点击卡牌领取奖品",
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

  // 解析卡牌图片
  const resolveCardImage = useCallback(() => {
    if (finalConfig.cardImageMacro) {
      const resolved = resolveMacro(finalConfig.cardImageMacro, finalConfig.macroVariables);
      if (resolved.includes("${") || resolved.startsWith("$")) {
        return finalConfig.cardImageUrl || "/card-item.png";
      }
      return resolved;
    }
    return finalConfig.cardImageUrl || "/card-item.png";
  }, [finalConfig.cardImageMacro, finalConfig.cardImageUrl, finalConfig.macroVariables]);

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
      setGestureIndex((prev) => (prev + 1) % 3);
    }, 1500);
    
    return () => clearInterval(interval);
  }, [isVisible, showReward, isFlipping]);
  
  // 卡牌抖动跟随手势
  useEffect(() => {
    setFlipHoverIndex(gestureIndex);
  }, [gestureIndex]);

  // 点击卡牌
  const handleCardClick = useCallback(() => {
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
      window.open(landingPage, "_blank");
    } else if (!previewMode) {
      onClose?.();
    }
  }, [previewMode, resolveLandingPage, onClose]);

  return (
    <div
      className={cn(
        previewMode
          ? "w-full rounded-t-2xl overflow-hidden"
          : "fixed inset-0 z-50 bg-black/80 flex items-end justify-center"
      )}
      onClick={() => !previewMode && onClose?.()}
    >
      {/* Modal Content */}
      <div
        className={cn(
          previewMode
            ? "relative w-full"
            : "relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden mb-4",
          "transition-all duration-500",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        )}
        style={{
          background: "rgba(0, 0, 0, 0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 left-1/2 -translate-x-1/2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 transition-colors"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-4 flex flex-col items-center relative">
          {!showReward ? (
            /* 翻卡场景 */
            <>
              {/* 引导文案 */}
              <div className="mb-3 text-center">
                <div className="bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <p className="text-white text-sm font-semibold animate-pulse">
                    {resolveGuideText()}
                  </p>
                </div>
              </div>

              {/* 三个卡牌并排 - 手势内嵌到卡牌上方 */}
              <div className="flex items-center justify-center gap-4 mb-2">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className={cn(
                      "relative cursor-pointer select-none",
                      "transform transition-transform duration-300",
                      "hover:scale-105 active:scale-95"
                    )}
                    onClick={handleCardClick}
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
                    {/* 卡牌图片 - 手势指向时抖动 */}
                    <img
                      src={resolveCardImage()}
                      alt={`卡牌${index + 1}`}
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
              <p className="text-white/70 text-xs text-center invisible">
                占位
              </p>
            </>
          ) : (
            /* 领奖场景 */
            <div className="w-full flex flex-col items-center animate-fadeIn">
              {/* 奖励展示 */}
              <div className="mb-6 text-center">
                {finalConfig.rewardType === "cash" ? (
                  /* 现金奖励 */
                  <div className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-2xl p-6 shadow-lg">
                    <p className="text-white/80 text-sm mb-1">恭喜获得</p>
                    <p className="text-white text-4xl font-bold">
                      ¥{resolveCashAmount()}
                    </p>
                  </div>
                ) : (
                  /* 自定义图片奖励 */
                  <div className="rounded-xl overflow-hidden shadow-lg">
                    {resolveRewardImage() ? (
                      <img
                        src={resolveRewardImage()}
                        alt="奖励"
                        className="w-[280px] h-auto object-contain"
                      />
                    ) : (
                      <div className="w-[280px] h-[150px] bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">奖励图片</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 奖品文案 */}
              <p className="text-white text-lg font-semibold mb-2">
                {resolveRewardText()}
              </p>

              {/* 特殊说明 */}
              <p className="text-white/70 text-sm mb-6">
                {resolveSpecialNote()}
              </p>

              {/* 领取按钮 */}
              <button
                onClick={handleClaim}
                className="w-full py-3 px-6 bg-gradient-to-r from-[#FF6B6B] to-[#FF4757] text-white text-base font-semibold rounded-xl hover:from-[#FF5252] hover:to-[#FF3D3D] transition-all active:scale-95 shadow-lg"
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

export default FlipCardTemplate;
