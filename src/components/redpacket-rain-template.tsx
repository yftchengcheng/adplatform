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

// 飘落红包数据结构 - 模仿落叶飘落
interface FallingRedpacket {
  id: number;
  startX: number;       // 起始X位置（百分比）
  startY: number;      // 起始Y位置
  endX: number;         // 终点X位置（水平飘动）
  delay: number;        // 延迟开始时间
  duration: number;     // 飘落时长
  rotation: number;      // 初始旋转角度
  rotationSpeed: number; // 旋转速度（度/秒）
  size: number;          // 红包大小
}

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
  const nextIdRef = useRef(0);
  const containerHeightRef = useRef(500);

  // 红包雨配置
  const MAX_REDPACKETS = 8; // 最多同时存在8个红包，更有美感
  const SPAWN_INTERVAL = 800; // 每800ms生成一个，慢一些
  const BASE_DURATION = 8000; // 基础飘落时长8秒
  const BASE_SIZE = 36; // 基础红包大小

  // 生成随机红包 - 模仿落叶飘落
  const generateRedpacket = useCallback((): FallingRedpacket => {
    const id = nextIdRef.current++;
    
    // 随机起始位置（整个屏幕宽度）
    const startX = Math.random() * 85; // 0-85%
    
    // 随机终点位置（水平飘动，可以左右摆动）
    const drift = (Math.random() - 0.5) * 25; // 左右飘动±12.5%
    const endX = Math.max(5, Math.min(95, startX + drift));
    
    // 随机飘落时长（8-14秒），更慢更优雅
    const duration = BASE_DURATION + (Math.random() - 0.5) * 6000;
    
    // 随机初始旋转角度
    const rotation = (Math.random() - 0.5) * 45; // ±22.5度
    
    // 随机旋转速度（飘落过程中旋转），更慢
    const rotationSpeed = (Math.random() - 0.5) * 80; // 每秒旋转±40度
    
    // 随机大小（32-48像素），稍微大一些更美观
    const size = BASE_SIZE + Math.random() * 16;
    
    // 随机延迟（1-3秒后开始），避免同时出现在顶部
    const delay = 1000 + Math.random() * 2000;
    
    return {
      id,
      startX,
      startY: -50,
      endX,
      delay,
      duration,
      rotation,
      rotationSpeed,
      size,
    };
  }, []);

  // 添加红包到列表
  const addRedpacket = useCallback(() => {
    setFallingRedpackets(prev => {
      // 如果已超过最大数量，先移除最老的
      if (prev.length >= MAX_REDPACKETS) {
        return [...prev.slice(1), generateRedpacket()];
      }
      return [...prev, generateRedpacket()];
    });
  }, [generateRedpacket]);

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

  // 初始化红包雨
  useEffect(() => {
    if (isOpen && !previewMode) {
      setIsVisible(true);
      setIsClaimed(false);
      setFallingRedpackets([]);
      nextIdRef.current = 0;
    } else if (previewMode) {
      setIsVisible(true);
      setIsClaimed(false);
      setFallingRedpackets([]);
      nextIdRef.current = 0;
    }
  }, [isOpen, previewMode]);

  // 开始生成红包
  useEffect(() => {
    if (!isVisible || isClaimed) return;

    // 获取容器高度
    if (containerRef.current) {
      containerHeightRef.current = containerRef.current.offsetHeight;
    }

    // 初始生成几个红包，延迟更大避免同时出现在顶部
    for (let i = 0; i < 4; i++) {
      setTimeout(() => addRedpacket(), 1000 + i * 600);
    }

    // 定时生成新红包
    const interval = setInterval(() => {
      if (!isClaimed) {
        addRedpacket();
      }
    }, SPAWN_INTERVAL);

    return () => clearInterval(interval);
  }, [isVisible, isClaimed, addRedpacket]);

  // 清理过期红包
  useEffect(() => {
    if (!isVisible || isClaimed) return;

    const cleanup = setInterval(() => {
      const now = Date.now();
      setFallingRedpackets(prev => 
        prev.filter(rp => {
          const totalTime = rp.delay + rp.duration;
          return totalTime > 0; // 保留所有红包，让CSS动画控制消失
        })
      );
    }, 1000);

    return () => clearInterval(cleanup);
  }, [isVisible, isClaimed]);

  // 点击红包
  const handleRedpacketClick = useCallback(() => {
    setIsClaimed(true);
    onButtonClick?.(finalConfig);
  }, [finalConfig, onButtonClick]);

  // 点击领取按钮
  const handleClaim = useCallback(() => {
    if (previewMode) {
      return;
    }
    const landingPage = resolveLandingPage();
    if (landingPage) {
      window.open(landingPage, "_blank");
    }
    onClose();
  }, [previewMode, resolveLandingPage, onClose]);

  const shouldRender = previewMode || isVisible;
  if (!shouldRender) return null;

  const redpacketImage = resolveRedpacketImage();
  const containerHeight = containerHeightRef.current;

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
        {/* Close Button - 底边中间 */}
        <button
          onClick={onClose}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors text-sm"
        >
          <X className="w-4 h-4 mr-1" />
          <span>关闭</span>
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

            {/* Falling Redpackets - 落叶飘落效果，从文字下方开始 */}
            <style jsx>{`
              @keyframes fallLeaf {
                0% {
                  top: 100px;
                  opacity: 0.3;
                  transform: rotate(0deg) scale(0.8);
                }
                10% {
                  opacity: 1;
                  transform: rotate(5deg) scale(1);
                }
                25% {
                  transform: rotate(15deg) translateX(10px);
                }
                50% {
                  transform: rotate(-10deg) translateX(-8px);
                }
                75% {
                  transform: rotate(8deg) translateX(6px);
                }
                100% {
                  top: calc(100% - 60px);
                  opacity: 0;
                  transform: rotate(-5deg);
                }
              }
              .falling-redpacket {
                animation-name: fallLeaf;
                animation-timing-function: ease-in-out;
                animation-fill-mode: forwards;
              }
            `}</style>

            {fallingRedpackets.map((rp) => {
              return (
                <div
                  key={rp.id}
                  className="absolute cursor-pointer hover:scale-110 transition-transform falling-redpacket"
                  style={{
                    left: `${rp.startX}%`,
                    width: `${rp.size}px`,
                    height: `${rp.size * 1.17}px`,
                    animationDuration: `${rp.duration}ms`,
                    animationDelay: `${rp.delay}ms`,
                    ['--end-x' as string]: `${rp.endX}%`,
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
                  />
                </div>
              );
            })}
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
                      alt="奖励"
                      className="w-full object-contain rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded-xl flex items-center justify-center">
                      <p className="text-gray-400 text-sm">暂无奖励图片</p>
                    </div>
                  )}
                </div>
              )}

              {/* Reward Text */}
              <p className="text-center text-gray-800 font-medium text-base">
                {resolveRewardText()}
              </p>

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
