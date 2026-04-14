"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// 配置数据类型
export interface RedpacketRainConfig {
  // 红包元素
  redpacketImageUrl?: string;
  redpacketImageMacro?: string;
  // 引导文案
  guideText: string;
  guideTextMacro?: string;
  // 奖励类型
  rewardType: "cash" | "custom";
  // 现金奖励
  cashAmount?: string;
  cashAmountMacro?: string;
  // 自定义奖励图片
  rewardImageUrl?: string;
  rewardImageMacro?: string;
  // 奖品文案
  rewardText: string;
  rewardTextMacro?: string;
  // 特殊说明
  specialNote: string;
  specialNoteMacro?: string;
  // 落地页
  landingPageUrl?: string;
  landingPageMacro?: string;
  // 默认落地页
  defaultLandingPageUrl?: string;
  // 宏变量
  macroVariables?: Record<string, string>;
}

// 模板配置类型
export type RedpacketRainTemplateConfig = RedpacketRainConfig;

// 默认配置
const defaultConfig: RedpacketRainConfig = {
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
  redpacketImageUrl: "",
  redpacketImageMacro: "",
  landingPageUrl: "",
  landingPageMacro: "",
  defaultLandingPageUrl: "",
};

interface RedpacketRainTemplateProps {
  config: RedpacketRainConfig;
  isOpen: boolean;
  onClose: () => void;
  previewMode?: boolean;
  onButtonClick?: (config: RedpacketRainConfig) => void;
}

export function RedpacketRainTemplate({
  config,
  isOpen,
  onClose,
  previewMode = false,
  onButtonClick,
}: RedpacketRainTemplateProps) {
  const finalConfig: RedpacketRainConfig = {
    ...defaultConfig,
    ...config,
  };

  const [isVisible, setIsVisible] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [fallingRedpackets, setFallingRedpackets] = useState<FallingRedpacket[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  // 红包雨配置
  const TOTAL_REDPACKETS = 15;
  const FALL_DURATION = 3000; // 3秒落地
  const SPAWN_INTERVAL = 200; // 每200ms生成一个

  // 生成随机红包
  const generateRedpacket = useCallback((id: number): FallingRedpacket => {
    // 三条飘落线：左、中、右
    const lanes = [15, 50, 85]; // 百分比位置
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    const xOffset = (Math.random() - 0.5) * 10; // ±5% 偏移
    
    return {
      id,
      x: lane + xOffset,
      delay: Math.random() * 2000, // 随机延迟 0-2s
      duration: FALL_DURATION + (Math.random() - 1000), // 3s ± 1s
      rotation: (Math.random() - 0.5) * 30, // 随机旋转 ±15度
    };
  }, []);

  // 宏替换函数
  const resolveMacro = useCallback((macro: string): string => {
    if (!macro || !finalConfig.macroVariables) return macro;
    let result = macro;
    Object.entries(finalConfig.macroVariables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
      result = result.replace(new RegExp(`\\$${key}`, 'g'), value);
    });
    return result;
  }, [finalConfig.macroVariables]);

  // 解析引导文案
  const resolveGuideText = useCallback((): string => {
    if (finalConfig.guideTextMacro) {
      const resolved = resolveMacro(finalConfig.guideTextMacro);
      if (resolved.includes('${') || resolved.startsWith('$')) {
        return finalConfig.guideText;
      }
      return resolved;
    }
    return finalConfig.guideText;
  }, [finalConfig.guideText, finalConfig.guideTextMacro, resolveMacro]);

  // 默认红包图片URL
  const DEFAULT_REDPACKET_IMAGE = "https://code.coze.cn/api/sandbox/coze_coding/file/proxy?expire_time=-1&file_path=assets%2F%E5%85%83%E7%B4%A02_%E5%89%AF%E6%9C%AC.png&nonce=e7fab6ca-83d2-448d-890a-25e1ed9b5876&project_id=7628071345674895423&sign=519ae46c48a91edf52823aefc5f8dd3e00a6c52faa6bcc80e87b981165b40600";

  // 解析红包图片
  const resolveRedpacketImage = useCallback((): string => {
    if (finalConfig.redpacketImageMacro) {
      const resolved = resolveMacro(finalConfig.redpacketImageMacro);
      if (resolved.includes('${') || resolved.startsWith('$')) {
        return DEFAULT_REDPACKET_IMAGE;
      }
      return resolved;
    }
    if (finalConfig.redpacketImageUrl) {
      return resolveMacro(finalConfig.redpacketImageUrl);
    }
    return DEFAULT_REDPACKET_IMAGE;
  }, [finalConfig.redpacketImageMacro, finalConfig.redpacketImageUrl, resolveMacro]);

  // 解析落地页
  const resolveLandingPage = useCallback((): string => {
    if (finalConfig.landingPageMacro) {
      const resolved = resolveMacro(finalConfig.landingPageMacro);
      if (resolved.includes('${') || resolved.startsWith('$')) {
        return "";
      }
      return resolved;
    }
    return finalConfig.landingPageUrl || "";
  }, [finalConfig.landingPageMacro, finalConfig.landingPageUrl, resolveMacro]);

  // 解析现金金额
  const resolveCashAmount = useCallback((): string => {
    if (finalConfig.cashAmountMacro) {
      const resolved = resolveMacro(finalConfig.cashAmountMacro);
      if (resolved.includes('${') || resolved.startsWith('$')) {
        return finalConfig.cashAmount || "0.00";
      }
      return resolved;
    }
    return finalConfig.cashAmount || "0.00";
  }, [finalConfig.cashAmountMacro, finalConfig.cashAmount, resolveMacro]);

  // 解析自定义奖励图片
  const resolveCustomRewardImage = useCallback((): string => {
    if (finalConfig.rewardImageMacro) {
      const resolved = resolveMacro(finalConfig.rewardImageMacro);
      if (resolved.includes('${') || resolved.startsWith('$')) {
        return "";
      }
      return resolved;
    }
    if (finalConfig.rewardImageUrl) {
      return resolveMacro(finalConfig.rewardImageUrl);
    }
    return "";
  }, [finalConfig.rewardImageMacro, finalConfig.rewardImageUrl, resolveMacro]);

  // 解析奖品文案
  const resolveRewardText = useCallback((): string => {
    if (finalConfig.rewardTextMacro) {
      const resolved = resolveMacro(finalConfig.rewardTextMacro);
      if (resolved.includes('${') || resolved.startsWith('$')) {
        return finalConfig.rewardText;
      }
      return resolved;
    }
    return finalConfig.rewardText;
  }, [finalConfig.rewardText, finalConfig.rewardTextMacro, resolveMacro]);

  // 解析特殊说明
  const resolveSpecialNote = useCallback((): string => {
    if (finalConfig.specialNoteMacro) {
      const resolved = resolveMacro(finalConfig.specialNoteMacro);
      if (resolved.includes('${') || resolved.startsWith('$')) {
        return finalConfig.specialNote;
      }
      return resolved;
    }
    return finalConfig.specialNote;
  }, [finalConfig.specialNote, finalConfig.specialNoteMacro, resolveMacro]);

  // 点击红包
  const handleRedpacketClick = useCallback(() => {
    setIsClaimed(true);
    onButtonClick?.(finalConfig);
  }, [finalConfig, onButtonClick]);

  // 开始红包雨
  const startRedpacketRain = useCallback(() => {
    const redpackets: FallingRedpacket[] = [];
    for (let i = 0; i < TOTAL_REDPACKETS; i++) {
      redpackets.push(generateRedpacket(i));
    }
    setFallingRedpackets(redpackets);
  }, [generateRedpacket]);

  // 入场动画
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClaimed(false);
      setFallingRedpackets([]);
      // 延迟开始红包雨
      const timer = setTimeout(() => {
        startRedpacketRain();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setFallingRedpackets([]);
    }
  }, [isOpen, startRedpacketRain]);

  // 点击领取按钮
  const handleClaim = useCallback(() => {
    if (previewMode) {
      // 预览模式下不跳转
      return;
    }
    const landingPage = resolveLandingPage();
    if (landingPage) {
      window.open(landingPage, "_blank");
    }
    onClose();
  }, [previewMode, resolveLandingPage, onClose]);

  // 预览模式下直接显示
  const shouldRender = previewMode || isVisible;
  if (!shouldRender) return null;

  const redpacketImage = resolveRedpacketImage();

  return (
    <div
      className={`${previewMode ? "relative w-full h-full" : "fixed inset-0 z-50"} transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={!isClaimed ? undefined : onClose}
    >
      {/* Backdrop */}
      {!isClaimed && !previewMode && (
        <div className="absolute inset-0 bg-black/70" />
      )}

      {/* Modal Content - 半屏浮层 */}
      <div
        className={`relative w-full h-full flex flex-col transition-all duration-500 ${
          isVisible ? "translate-y-0" : previewMode ? "" : "-translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Redpacket Rain Scene */}
        {!isClaimed ? (
          <div ref={containerRef} className="flex-1 relative overflow-hidden bg-gradient-to-b from-[#8B0000] to-[#4A0000]">
            {/* Guide Text */}
            <div className="absolute top-8 left-0 right-0 text-center z-10">
              <p className="text-white text-lg font-medium drop-shadow-lg animate-pulse">
                {resolveGuideText()}
              </p>
            </div>

            {/* Hand Gesture Hint */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
              <div className="w-10 h-10">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 44C24 44 8 32 8 20C8 12 14 6 22 6C22 6 20 10 20 14C20 18 22 20 24 20C26 20 28 18 28 14C28 10 26 6 26 6C34 6 40 12 40 20C40 32 24 44 24 44Z" fill="white" fillOpacity="0.9"/>
                  <path d="M20 14V6M24 14V4M28 14V6" stroke="white" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>

            {/* Falling Redpackets */}
            {fallingRedpackets.map((rp) => (
              <div
                key={rp.id}
                className="absolute top-0 cursor-pointer hover:scale-110 transition-transform"
                style={{
                  left: `${rp.x}%`,
                  width: "32px",
                  height: "37px",
                  animation: `fallDown ${rp.duration}ms ease-in forwards`,
                  animationDelay: `${rp.delay}ms`,
                  transform: `rotate(${rp.rotation}deg)`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRedpacketClick();
                }}
              >
                <img
                  src={redpacketImage}
                  alt="红包"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // 默认红包样式
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ))}

            {/* Fall Animation Keyframes */}
            <style jsx>{`
              @keyframes fallDown {
                0% {
                  top: -50px;
                  opacity: 1;
                }
                100% {
                  top: calc(60%);
                  opacity: 0.8;
                }
              }
            `}</style>
          </div>
        ) : (
          /* Reward Claimed Scene */
          <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-[#FFF5E6] to-[#FFE4CC] p-6">
            {/* Reward Content */}
            <div className="w-full max-w-[345px] space-y-4">
              {/* Reward Image or Cash */}
              {finalConfig.rewardType === "cash" ? (
                <div className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-xl p-4 text-center">
                  <p className="text-white/80 text-xs mb-1">恭喜获得</p>
                  <p className="text-white text-3xl font-bold">¥{resolveCashAmount()}</p>
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden">
                  {resolveCustomRewardImage() ? (
                    <img
                      src={resolveCustomRewardImage()}
                      alt="奖励图片"
                      className="w-full h-auto"
                    />
                  ) : (
                    <div className="bg-gray-200 rounded-xl aspect-[690/360] flex items-center justify-center">
                      <span className="text-gray-400">奖励图片</span>
                    </div>
                  )}
                </div>
              )}

              {/* Reward Text */}
              {resolveRewardText() && (
                <p className="text-center text-gray-800 font-medium">
                  {resolveRewardText()}
                </p>
              )}

              {/* Special Note */}
              <p className="text-center text-gray-400 text-xs">
                {resolveSpecialNote()}
              </p>

              {/* Claim Button */}
              <button
                onClick={handleClaim}
                className="w-full py-2 bg-gradient-to-r from-[#FF6B6B] to-[#FF4757] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow text-sm"
              >
                立即领取
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 飘落红包类型
interface FallingRedpacket {
  id: number;
  x: number;
  delay: number;
  duration: number;
  rotation: number;
}
