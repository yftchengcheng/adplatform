"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { openLandingPage } from "./landing-page-config";

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
  landingPageType?: "url" | "deeplink"; // 跳转类型
  deeplinkUrl?: string; // Deeplink地址
  deeplinkMacro?: string; // Deeplink宏变量
  // 默认落地页
  defaultLandingPageUrl?: string;
  // 宏变量
  macroVariables?: Record<string, string>;
  // 组件名称
  componentName?: string;
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
  componentName: "点击红包，领取奖品",
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

  // 红包雨配置 - 调整为更自然的密度
  const MAX_REDPACKETS = 12; // 最多同时存在12个红包（雨感更密）
  const SPAWN_INTERVAL = 420; // 每420ms生成一个（密度更高）
  const BASE_DURATION = 5500; // 基础飘落时长5.5秒（更快落地）
  const BASE_SIZE = 36; // 基础红包大小
  const INITIAL_COUNT = 5; // 初始生成5个红包，让首屏立即有雨感

  // 生成随机红包 - 模仿落叶飘落
  const generateRedpacket = useCallback((): FallingRedpacket => {
    const id = nextIdRef.current++;
    
    // 固定三条飘落线（AGENTS.md 16.5节）+ 微随机 ±5%——避免"杂乱无章闪烁"
    const FALL_LINES = [15, 50, 85];
    const baseLine = FALL_LINES[Math.floor(Math.random() * FALL_LINES.length)];
    const startX = Math.max(5, Math.min(95, baseLine + (Math.random() - 0.5) * 10));

    // 随机终点位置（水平飘动，可以左右摆动）
    const drift = (Math.random() - 0.5) * 30; // 左右飘动±15%
    const endX = Math.max(5, Math.min(95, startX + drift));

    // 随机飘落时长（4.5-7.5秒），更快更自然
    const duration = BASE_DURATION + (Math.random() - 0.5) * 3000;

    // 随机初始旋转角度
    const rotation = (Math.random() - 0.5) * 45; // ±22.5度

    // 随机旋转方向（+1 正向 / -1 反向），让红包旋转方向不单调
    const rotationDirection = Math.random() > 0.5 ? 1 : -1;
    const rotationAmount = 540 * rotationDirection; // 总旋转±540°（1.5圈）

    // 随机大小（32-48像素），稍微大一些更美观
    const size = BASE_SIZE + Math.random() * 16;

    // 随机延迟（0-200ms），紧凑入场让首屏立即有雨感
    const delay = Math.random() * 200;
    
    return {
      id,
      startX,
      startY: -50,
      endX,
      delay,
      duration,
      rotation,
      rotationSpeed: rotationAmount,
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
    // 优先使用配置的落地页宏变量
    if (finalConfig.landingPageMacro) {
      const resolved = resolveMacro(finalConfig.landingPageMacro);
      if (resolved.includes('${') || resolved.startsWith('$')) {
        // 宏变量未解析，使用默认落地页
        return finalConfig.defaultLandingPageUrl || "";
      }
      return resolved;
    }
    // 其次使用配置的落地页
    if (finalConfig.landingPageUrl) {
      return resolveMacro(finalConfig.landingPageUrl);
    }
    // 最后使用默认落地页
    return finalConfig.defaultLandingPageUrl || "";
  }, [finalConfig.landingPageMacro, finalConfig.landingPageUrl, finalConfig.defaultLandingPageUrl, resolveMacro]);

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

    // 初始生成 5 个红包，紧密间隔（80ms）让首屏立即有雨感
    for (let i = 0; i < INITIAL_COUNT; i++) {
      setTimeout(() => addRedpacket(), i * 80);
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
    const landingPage = resolveLandingPage();
    if (landingPage) {
      openLandingPage(finalConfig, landingPage);
    } else if (!previewMode) {
      // 非预览模式下且没有落地页时才关闭
      onClose();
    }
  }, [previewMode, resolveLandingPage, onClose]);

  const shouldRender = previewMode || isVisible;
  if (!shouldRender) return null;

  const redpacketImage = resolveRedpacketImage();
  const containerHeight = containerHeightRef.current;

  return (
    <div
      className={`${previewMode ? "relative mx-auto" : "fixed inset-0 z-50"} transition-opacity duration-300 ${
        previewMode ? "opacity-100" : (isVisible ? "opacity-100" : "opacity-0 pointer-events-none")
      }`}
      style={previewMode ? { width: "260px", height: "312px" } : undefined}
      onClick={!isClaimed ? undefined : onClose}
    >
      {/* Backdrop */}
      {!isClaimed && (
        <div className={`absolute inset-0 ${previewMode ? "bg-black/30 rounded-xl" : "bg-black/30"}`} />
      )}

      {/* Modal Content - 直接显示，取消入场动画 */}
      <div
        className={`relative w-full h-full max-w-full flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button - 右上角 */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-30 w-6 h-6 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.25)" }}
        >
          <X className="w-3 h-3 text-white" />
        </button>

        {/* Redpacket Rain Scene */}
        {!isClaimed ? (
          <div ref={containerRef} className="flex-1 relative overflow-hidden bg-gradient-to-b from-[#1a0a2e] to-[#2d1b4e]">
            {/* Guide Text */}
            <div className="absolute top-6 left-0 right-0 z-10">
              <div className="relative flex flex-col items-center">
                <div className="relative bg-gradient-to-r from-black/40 via-black/30 to-black/40 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 whitespace-nowrap">
                  <p className="text-white text-sm font-semibold text-center drop-shadow-lg animate-pulse">
                    {resolveGuideText()}
                  </p>
                </div>
              </div>
            </div>



            {/* Falling Redpackets - 修复顶部定位闪现：
                0% 红包在容器外 top:-50px opacity:0
                8% 红包已到达容器顶 top:0px（但仍 opacity:0，隐藏在容器外下方）
                18% 红包刚进入容器 5%（已部分可见 opacity:0.4）
                中段正常飘落
                95% 红包接近容器底 100%（仍 opacity:1）
                100% 红包已离开容器 opacity:0
                关键：opacity 渐入时红包已在容器内，避免"顶部定位闪现" */}
            <style jsx>{`
              @keyframes fallRedpacketNatural {
                0% {
                  top: -80px;
                  opacity: 0;
                  transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
                }
                6% {
                  top: -40px;
                  opacity: 1;
                  transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
                }
                25% {
                  top: 22%;
                  opacity: 1;
                  transform: translate3d(-10px, 0, 0) scale(1) rotate(calc(var(--rot-step, 72deg) * 0.5));
                }
                50% {
                  top: 55%;
                  opacity: 1;
                  transform: translate3d(0, 0, 0) scale(1) rotate(calc(var(--rot-step, 72deg) * 1));
                }
                75% {
                  top: 80%;
                  opacity: 1;
                  transform: translate3d(10px, 0, 0) scale(1) rotate(calc(var(--rot-step, 72deg) * 1.5));
                }
                98% {
                  top: 110%;
                  opacity: 1;
                  transform: translate3d(0, 0, 0) scale(1) rotate(calc(var(--rot-step, 72deg) * 1.95));
                }
                100% {
                  top: 110%;
                  opacity: 0;
                  transform: translate3d(0, 0, 0) scale(1) rotate(calc(var(--rot-step, 72deg) * 2));
                }
              }
              .falling-redpacket {
                animation-name: fallRedpacketNatural;
                animation-timing-function: linear;
                animation-iteration-count: infinite;
                will-change: transform, top, opacity;
                backface-visibility: hidden;
                -webkit-backface-visibility: hidden;
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
                    ['--rot-step' as string]: `${rp.rotationSpeed / 5}deg`,
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
                <div className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-2xl p-4 text-center shadow-lg">
                  <p className="text-white/80 text-xs mb-1">恭喜获得</p>
                  <p className="text-white text-3xl font-bold">¥{resolveCashAmount()}</p>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  {resolveCustomRewardImage() ? (
                    <img
                      src={resolveCustomRewardImage()}
                      alt="奖励"
                      className="w-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded-2xl flex items-center justify-center">
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
                className="w-full py-2 bg-gradient-to-r from-[#FF6B6B] to-[#FF4757] text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-sm"
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
