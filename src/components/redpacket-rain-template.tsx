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

// 飘落红包数据结构 - 参考宝箱雨 v2 思路精简
interface FallingRedpacket {
  id: number;
  startX: number;       // 起始X位置（百分比，三条固定线之一）
  delay: number;        // 延迟开始时间（ms）
  duration: number;     // 飘落时长（ms）
  size: number;         // 红包大小（px）
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

  // 红包雨配置 - 参考宝箱雨 v2 方案（密集但不涌入）
  const MAX_REDPACKETS = 12;        // 最多同时存在12个
  const SPAWN_INTERVAL = 350;      // 每350ms生成一个
  const BASE_DURATION = 3500;      // 基础飘落时长3.5秒（宝箱雨节奏）
  const BASE_SIZE = 38;             // 基础红包大小
  const INITIAL_COUNT = 18;         // 初始生成18个，阶梯错开入场

  // 生成随机红包 - 严格三条线 + 阶梯错开
  const generateRedpacket = useCallback((): FallingRedpacket => {
    const id = nextIdRef.current++;

    // 三条固定飘落线（AGENTS.md 16.5节）+ ±3% 微随机
    const FALL_LINES = [15, 50, 85];
    const baseLine = FALL_LINES[Math.floor(Math.random() * FALL_LINES.length)];
    const startX = Math.max(5, Math.min(95, baseLine + (Math.random() - 0.5) * 6));

    // 飘落时长 2.8-4.2 秒（紧凑节奏）
    const duration = BASE_DURATION + (Math.random() - 0.5) * 1400;

    // 大小 32-46 像素
    const size = BASE_SIZE + (Math.random() - 0.5) * 14;

    // delay 由调用方传入（阶梯或间隔），这里不设
    return {
      id,
      startX,
      delay: 0,
      duration,
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
  // 初始生成 + interval 持续补一个 - 参考宝箱雨 v2
  useEffect(() => {
    if (!isVisible || isClaimed) return;

    // 获取容器高度
    if (containerRef.current) {
      containerHeightRef.current = containerRef.current.offsetHeight;
    }

    // 初始 18 个红包，阶梯错开入场（100ms + 150ms*i + ±50ms 抖动）
    // 关键：避免 5 个 0-400ms 集中涌入造成的"开局卡顿"
    const initialDelays: number[] = [];
    for (let i = 0; i < INITIAL_COUNT; i++) {
      const d = 100 + i * 150 + (Math.random() - 0.5) * 100;
      initialDelays.push(d);
    }
    initialDelays.forEach((d) => {
      setTimeout(() => {
        setFallingRedpackets((prev) => {
          if (prev.length >= MAX_REDPACKETS) {
            return [...prev.slice(1), { ...generateRedpacket(), delay: 0 }];
          }
          return [...prev, { ...generateRedpacket(), delay: 0 }];
        });
      }, d);
    });

    // 定时补一个
    const interval = setInterval(() => {
      if (!isClaimed) {
        addRedpacket();
      }
    }, SPAWN_INTERVAL);

    return () => clearInterval(interval);
  }, [isVisible, isClaimed, addRedpacket, generateRedpacket]);

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

        {/* Redpacket Rain Scene - 暗紫磨砂玻璃 + 金红光晕 */}
        {!isClaimed ? (
          <div
            ref={containerRef}
            className="flex-1 relative overflow-hidden"
            style={{
              background: "linear-gradient(180deg, rgba(26, 10, 46, 0.55) 0%, rgba(45, 27, 78, 0.55) 100%)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              boxShadow:
                "0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 0 1px rgba(255, 215, 0, 0.08)",
            }}
          >
            {/* 金色光晕 - 左上 */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: "-60px",
                left: "-60px",
                width: "220px",
                height: "220px",
                background: "radial-gradient(circle, rgba(255, 215, 0, 0.32) 0%, rgba(255, 215, 0, 0) 70%)",
                filter: "blur(20px)",
              }}
            />
            {/* 红色光晕 - 右下 */}
            <div
              className="absolute pointer-events-none"
              style={{
                bottom: "-60px",
                right: "-60px",
                width: "240px",
                height: "240px",
                background: "radial-gradient(circle, rgba(255, 75, 75, 0.30) 0%, rgba(255, 75, 75, 0) 70%)",
                filter: "blur(22px)",
              }}
            />
            {/* Guide Text - 金色磨砂 chip */}
            <div className="absolute top-6 left-0 right-0 z-10">
              <div className="relative flex flex-col items-center">
                <div
                  className="relative rounded-full px-4 py-2 whitespace-nowrap"
                  style={{
                    background: "linear-gradient(90deg, rgba(255, 215, 0, 0.20) 0%, rgba(255, 200, 50, 0.25) 50%, rgba(255, 215, 0, 0.20) 100%)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                    border: "1px solid rgba(255, 215, 0, 0.30)",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                  }}
                >
                  <p className="text-yellow-50 text-sm font-semibold text-center drop-shadow-lg animate-pulse">
                    {resolveGuideText()}
                  </p>
                </div>
              </div>
            </div>



            {/* Falling Redpackets - v5 借鉴宝箱雨 v2 方案：
                关键修复：animation-fill-mode: backwards（解决 delay 期间 top:0 闪现）
                关键帧：容器外淡入/淡出（-90px→-50px 完成 opacity 0→1）
                摇摆：±8° 替代 1.5 圈旋转 + translateX(±4px) 微飘动
                节奏：3-4.2s（宝箱雨节奏），无 scale 渐变 */}
            <style jsx>{`
              @keyframes fallRedpacketNatural {
                0% {
                  top: -90px;
                  opacity: 0;
                  transform: translate3d(0, 0, 0) rotate(0deg);
                }
                6% {
                  top: -50px;
                  opacity: 1;
                  transform: translate3d(0, 0, 0) rotate(0deg);
                }
                25% {
                  top: 22%;
                  opacity: 1;
                  transform: translate3d(-4px, 0, 0) rotate(-8deg);
                }
                50% {
                  top: 55%;
                  opacity: 1;
                  transform: translate3d(4px, 0, 0) rotate(8deg);
                }
                75% {
                  top: 80%;
                  opacity: 1;
                  transform: translate3d(-4px, 0, 0) rotate(-8deg);
                }
                96% {
                  top: 110%;
                  opacity: 1;
                  transform: translate3d(0, 0, 0) rotate(0deg);
                }
                100% {
                  top: 110%;
                  opacity: 0;
                  transform: translate3d(0, 0, 0) rotate(0deg);
                }
              }
              .falling-redpacket {
                animation-name: fallRedpacketNatural;
                animation-timing-function: linear;
                animation-iteration-count: infinite;
                animation-fill-mode: backwards;
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
          /* Reward Claimed Scene - 暖橙磨砂玻璃 + 橙金光晕 */
          <div
            className="flex-1 flex flex-col items-center justify-center p-6 relative"
            style={{
              background: "linear-gradient(180deg, rgba(255, 245, 230, 0.55) 0%, rgba(255, 228, 204, 0.55) 100%)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              border: "1px solid rgba(255, 200, 130, 0.30)",
              boxShadow:
                "0 8px 32px rgba(255, 140, 60, 0.20), inset 0 1px 0 rgba(255, 255, 255, 0.35), 0 0 0 1px rgba(255, 215, 0, 0.10)",
            }}
          >
            {/* 橙色光晕 - 右上 */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: "-40px",
                right: "-40px",
                width: "200px",
                height: "200px",
                background: "radial-gradient(circle, rgba(255, 165, 80, 0.40) 0%, rgba(255, 165, 80, 0) 70%)",
                filter: "blur(20px)",
              }}
            />
            {/* 金色光晕 - 左下 */}
            <div
              className="absolute pointer-events-none"
              style={{
                bottom: "-40px",
                left: "-40px",
                width: "200px",
                height: "200px",
                background: "radial-gradient(circle, rgba(255, 215, 0, 0.35) 0%, rgba(255, 215, 0, 0) 70%)",
                filter: "blur(20px)",
              }}
            />
            {/* Reward Content */}
            <div className="w-full max-w-[345px] space-y-4 relative z-10">
              {/* Reward Image or Cash */}
              {finalConfig.rewardType === "cash" ? (
                <div
                  className="rounded-2xl p-4 text-center"
                  style={{
                    background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                    boxShadow: "0 6px 20px rgba(255, 165, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.30), inset 0 -2px 0 rgba(180, 100, 0, 0.20)",
                    border: "1px solid rgba(255, 215, 0, 0.50)",
                  }}
                >
                  <p className="text-white/85 text-xs mb-1 drop-shadow">恭喜获得</p>
                  <p className="text-white text-3xl font-bold drop-shadow-lg">¥{resolveCashAmount()}</p>
                </div>
              ) : (
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.25)",
                    border: "1px solid rgba(255, 200, 130, 0.35)",
                  }}
                >
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

              {/* Claim Button - 立体红渐变 */}
              <button
                onClick={handleClaim}
                className="w-full py-2.5 text-white font-semibold rounded-2xl transition-all text-sm active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #FF6B6B 0%, #FF4757 100%)",
                  boxShadow: "0 4px 14px rgba(255, 71, 87, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.30), inset 0 -2px 0 rgba(180, 30, 50, 0.25)",
                  border: "1px solid rgba(255, 120, 120, 0.50)",
                }}
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
