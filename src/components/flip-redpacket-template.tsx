"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlipRedpacketTemplateConfig } from "./flip-redpacket-template-config";

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
    componentName: "",
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
      window.open(landingPage, "_blank");
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
          ? "w-full flex items-center justify-center"
          : "fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      )}
      onClick={() => !previewMode && onClose?.()}
    >
      {/* Modal Content */}
      <div
        className={cn(
          previewMode
            ? "relative w-full bg-gradient-to-b from-[#8B0000]/70 to-[#4A0000]/70 rounded-2xl overflow-hidden"
            : "relative w-full max-w-sm bg-gradient-to-b from-[#8B0000]/70 to-[#4A0000]/70 rounded-2xl shadow-2xl overflow-hidden",
          "transition-all duration-500",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {!previewMode && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        )}

        {/* Content */}
        <div className="p-6 flex flex-col items-center">
          {!showReward ? (
            /* 红包场景 - 三个红包并排 */
            <>
              {/* 头部图片 */}
              <div className="mb-4 text-center">
                <img
                  src="/flip-redpacket-header.png"
                  alt="翻红包"
                  className="w-[50px] h-auto object-contain inline-block"
                  draggable={false}
                />
              </div>

              {/* 引导文案 */}
              <div className="mb-6 text-center">
                <div className="bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <p className="text-white text-sm font-semibold animate-pulse">
                    {resolveGuideText()}
                  </p>
                </div>
              </div>

              {/* 三个红包并排 */}
              <div className="flex items-center justify-center gap-4 mb-4">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className={cn(
                      "relative cursor-pointer select-none",
                      "transform transition-transform duration-300",
                      "hover:scale-105 active:scale-95",
                      isFlipping && "animate-flip"
                    )}
                    onClick={handleRedpacketClick}
                  >
                    {/* 红包图片 */}
                    <img
                      src={resolveRedpacketImage()}
                      alt={`红包${index + 1}`}
                      className="w-[100px] h-auto object-contain"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>

              {/* 手势提示 */}
              <div 
                className="flex justify-center animate-bounce"
                style={{ animationDuration: '1.2s' }}
              >
                <img
                  src="/flip-redpacket-gesture.png"
                  alt="手势"
                  className="w-10 h-auto"
                  draggable={false}
                />
              </div>

              {/* 提示文字 */}
              <p className="mt-6 text-white/70 text-xs text-center">
                点击红包翻出惊喜
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

              {/* 翻出效果图片 */}
              <div className="mt-4">
                <img
                  src="/flip-redpacket-reveal.png"
                  alt="翻出"
                  className="w-16 h-auto"
                />
              </div>
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
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

export default FlipRedpacketTemplate;
