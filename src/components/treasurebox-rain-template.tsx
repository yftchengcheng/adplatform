"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TreasureboxRainConfig } from "./treasurebox-rain-template-config";
import { openLandingPage } from "./landing-page-config";

interface TreasureboxRainTemplateProps {
  config?: Partial<TreasureboxRainConfig>;
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

interface FallingTreasurebox {
  id: string;
  x: number;
  delay: number;
  duration: number;
  scale: number;
}

export function TreasureboxRainTemplate({
  config,
  isOpen = true,
  onClose,
  previewMode = false,
}: TreasureboxRainTemplateProps) {
  // 状态
  const [isClaimed, setIsClaimed] = useState(false);
  const [fallingTreasureboxes, setFallingTreasureboxes] = useState<FallingTreasurebox[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 使用默认配置填充空值
  const defaultConfig: TreasureboxRainConfig = {
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
    treasureboxImageUrl: "",
    treasureboxImageMacro: "",
    landingPageUrl: "",
    landingPageMacro: "",
    defaultLandingPageUrl: "",
    macroVariables: {},
    componentName: "宝箱雨",
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
      if (!resolved.includes("${") && !resolved.startsWith("$")) {
        return resolved;
      }
    }
    if (finalConfig.landingPageUrl) {
      return finalConfig.landingPageUrl;
    }
    if (finalConfig.defaultLandingPageUrl) {
      return finalConfig.defaultLandingPageUrl;
    }
    return "";
  }, [finalConfig.landingPageMacro, finalConfig.landingPageUrl, finalConfig.defaultLandingPageUrl, finalConfig.macroVariables]);

  // 解析宝箱图片
  const resolveTreasureboxImage = useCallback(() => {
    if (finalConfig.treasureboxImageMacro) {
      const resolved = resolveMacro(finalConfig.treasureboxImageMacro, finalConfig.macroVariables);
      if (!resolved.includes("${") && !resolved.startsWith("$")) {
        return resolved;
      }
    }
    return finalConfig.treasureboxImageUrl || "/treasurebox-close.png";
  }, [finalConfig.treasureboxImageMacro, finalConfig.treasureboxImageUrl, finalConfig.macroVariables]);

  // 解析领奖图片
  const resolveRewardImage = useCallback(() => {
    if (finalConfig.rewardImageMacro) {
      const resolved = resolveMacro(finalConfig.rewardImageMacro, finalConfig.macroVariables);
      if (!resolved.includes("${") && !resolved.startsWith("$")) {
        return resolved;
      }
    }
    return finalConfig.rewardImageUrl || "";
  }, [finalConfig.rewardImageMacro, finalConfig.rewardImageUrl, finalConfig.macroVariables]);

  // 生成飘落宝箱 - 三条固定线 + 容器外淡入/淡出 + 严格错开 delay
  const generateFallingTreasureboxes = useCallback(() => {
    const treasureboxes: FallingTreasurebox[] = [];
    const FALL_LINES = [15, 50, 85];
    const getStartX = () =>
      FALL_LINES[Math.floor(Math.random() * FALL_LINES.length)] +
      (Math.random() - 0.5) * 6;

    // 18 个初始，delay 严格按 150ms 阶梯 + ±50ms 微随机
    // 第 1 个 delay 100ms 起步，避免开局瞬间涌入造成卡顿
    for (let i = 0; i < 18; i++) {
      treasureboxes.push({
        id: `tb-${Date.now()}-${i}`,
        x: getStartX(),
        delay: 100 + i * 150 + (Math.random() - 0.5) * 100,
        duration: 2800 + Math.random() * 1200, // 2.8-4s，更密
        scale: 0.85 + Math.random() * 0.15,
      });
    }
    return treasureboxes;
  }, []);

  // 开始飘落
  useEffect(() => {
    if (isOpen && !isClaimed) {
      setIsVisible(true);
      const treasureboxes = generateFallingTreasureboxes();
      setFallingTreasureboxes(treasureboxes);

      // 定期添加新的宝箱 - 350ms 节奏更密集，并发上限 12
      const interval = setInterval(() => {
        setFallingTreasureboxes((prev) => {
          const FALL_LINES = [15, 50, 85];
          const startX =
            FALL_LINES[Math.floor(Math.random() * FALL_LINES.length)] +
            (Math.random() - 0.5) * 6;
          const newTreasurebox: FallingTreasurebox = {
            id: `tb-${Date.now()}-${Math.random()}`,
            x: startX,
            delay: 0,
            duration: 2800 + Math.random() * 1200,
            scale: 0.85 + Math.random() * 0.15,
          };
          return [...prev.slice(-11), newTreasurebox]; // 保持最多12个（prev保留11+新增1）
        });
      }, 350);

      return () => clearInterval(interval);
    }
  }, [isOpen, isClaimed, generateFallingTreasureboxes]);

  // 点击宝箱
  const handleTreasureboxClick = useCallback(() => {
    if (isClaimed) return;
    setIsClaimed(true);
  }, [isClaimed]);

  // 点击领取
  const handleClaim = useCallback(() => {
    const url = resolveLandingPage();
    if (url) {
      openLandingPage(finalConfig, url);
    }
  }, [resolveLandingPage]);

  if (!isVisible) return null;

  const treasureboxImage = resolveTreasureboxImage();

  // 全屏模式
  if (!previewMode) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
        {/* Close Button - 底边中间 */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Rain Scene */}
          {!isClaimed ? (
            <div
              ref={containerRef}
              className="flex-1 relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(180deg, rgba(26, 10, 46, 0.55) 0%, rgba(45, 27, 78, 0.55) 100%)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                boxShadow:
                  "0 16px 40px rgba(15, 5, 30, 0.45), 0 2px 8px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.10)",
              }}
            >
              {/* 节日光晕装饰 - 金色+红色（宝箱宝藏感） */}
              <div
                aria-hidden
                className="absolute pointer-events-none"
                style={{
                  top: "-40px",
                  left: "-40px",
                  width: "240px",
                  height: "240px",
                  background:
                    "radial-gradient(circle, rgba(255, 215, 0, 0.30) 0%, rgba(255, 215, 0, 0) 70%)",
                  filter: "blur(20px)",
                  zIndex: 0,
                }}
              />
              <div
                aria-hidden
                className="absolute pointer-events-none"
                style={{
                  bottom: "-40px",
                  right: "-40px",
                  width: "260px",
                  height: "260px",
                  background:
                    "radial-gradient(circle, rgba(255, 75, 87, 0.25) 0%, rgba(255, 75, 87, 0) 70%)",
                  filter: "blur(22px)",
                  zIndex: 0,
                }}
              />

              {/* Guide Text */}
              <div className="absolute top-8 left-0 right-0 z-10">
                <div className="relative flex flex-col items-center">
                  <div
                    className="relative rounded-full px-4 py-2 whitespace-nowrap"
                    style={{
                      background: "rgba(255, 215, 0, 0.18)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      border: "0.5px solid rgba(255, 255, 255, 0.30)",
                    }}
                  >
                    <p className="text-white text-sm font-semibold text-center drop-shadow-lg animate-pulse">
                      {resolveGuideText()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Falling Treasureboxes - 流水式持续飘落 */}
              <style jsx>{`
                @keyframes fallTreasureboxWater {
                  /* 0% 宝箱在容器外更远，opacity 0 */
                  0%   { top: -90px; opacity: 0; transform: scale(var(--tb-scale, 1)) translateX(0px) rotate(0deg); }
                  /* 6% 仍容器外（-50px），opacity 已 1，避免顶部闪烁 */
                  6%   { top: -50px; opacity: 1; transform: scale(var(--tb-scale, 1)) translateX(3px) rotate(8deg); }
                  25%  { top: 22%;   opacity: 1; transform: scale(var(--tb-scale, 1)) translateX(-3px) rotate(-8deg); }
                  50%  { top: 50%;   opacity: 1; transform: scale(var(--tb-scale, 1)) translateX(3px) rotate(8deg); }
                  75%  { top: 78%;   opacity: 1; transform: scale(var(--tb-scale, 1)) translateX(-3px) rotate(-8deg); }
                  92%  { top: 96%;   opacity: 1; transform: scale(var(--tb-scale, 1)) translateX(2px) rotate(5deg); }
                  /* 100% 容器外 10%，opacity 0，平滑消失 */
                  100% { top: 110%;  opacity: 0; transform: scale(var(--tb-scale, 1)) translateX(0px) rotate(0deg); }
                }
              `}</style>

              {fallingTreasureboxes.map((tb) => (
                <div
                  key={tb.id}
                  onClick={handleTreasureboxClick}
                  className="absolute cursor-pointer hover:scale-110 transition-transform"
                  style={{
                    left: `${tb.x}%`,
                    animation: `fallTreasureboxWater ${tb.duration}ms linear ${tb.delay}ms infinite both`,
                    animationFillMode: 'backwards',
                    ['--tb-scale' as React.CSSProperties['--tb-scale']]: tb.scale,
                    willChange: 'top, opacity, transform',
                    backfaceVisibility: 'hidden',
                    zIndex: 10,
                  }}
                >
                  <img
                    src={treasureboxImage}
                    alt="宝箱"
                    className="w-[66px] h-auto object-contain"
                    style={{ maxHeight: "60px" }}
                    draggable={false}
                  />
                </div>
              ))}

          </div>
          ) : (
            /* Reward Scene */
            <div
              className="relative flex-1 flex flex-col items-center justify-center p-6"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255, 245, 230, 0.55) 0%, rgba(255, 228, 204, 0.55) 100%)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                border: "1px solid rgba(255, 200, 130, 0.30)",
                boxShadow:
                  "0 16px 40px rgba(180, 100, 0, 0.30), 0 2px 8px rgba(0, 0, 0, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.40)",
              }}
            >
              {/* 暖色光晕 - 橙+金（领奖喜庆感） */}
              <div
                aria-hidden
                className="absolute pointer-events-none"
                style={{
                  top: "-40px",
                  right: "-40px",
                  width: "240px",
                  height: "240px",
                  background:
                    "radial-gradient(circle, rgba(255, 165, 0, 0.30) 0%, rgba(255, 165, 0, 0) 70%)",
                  filter: "blur(22px)",
                  zIndex: 0,
                }}
              />
              <div
                aria-hidden
                className="absolute pointer-events-none"
                style={{
                  bottom: "-40px",
                  left: "-40px",
                  width: "220px",
                  height: "220px",
                  background:
                    "radial-gradient(circle, rgba(255, 215, 0, 0.25) 0%, rgba(255, 215, 0, 0) 70%)",
                  filter: "blur(20px)",
                  zIndex: 0,
                }}
              />

              <div className="w-full max-w-sm flex flex-col items-center animate-fadeIn relative z-10">
                {/* 奖励展示 */}
                <div className="mb-6 text-center">
                  {finalConfig.rewardType === "cash" ? (
                    <div
                      className="rounded-2xl p-6"
                      style={{
                        background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                        boxShadow:
                          "0 8px 24px rgba(255, 165, 0, 0.40), 0 2px 6px rgba(0, 0, 0, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.45), inset 0 -2px 0 rgba(180, 100, 0, 0.30)",
                        border: "0.5px solid rgba(255, 255, 255, 0.30)",
                      }}
                    >
                      <p className="text-white/80 text-sm mb-1">恭喜获得</p>
                      <p className="text-white text-4xl font-bold">¥{resolveCashAmount()}</p>
                    </div>
                  ) : resolveRewardImage() ? (
                    <img
                      src={resolveRewardImage()}
                      alt="奖励"
                      className="max-w-full max-h-40 object-contain rounded-lg"
                      draggable={false}
                    />
                  ) : (
                    <div
                      className="rounded-2xl p-6"
                      style={{
                        background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                        boxShadow:
                          "0 8px 24px rgba(255, 165, 0, 0.40), 0 2px 6px rgba(0, 0, 0, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.45), inset 0 -2px 0 rgba(180, 100, 0, 0.30)",
                        border: "0.5px solid rgba(255, 255, 255, 0.30)",
                      }}
                    >
                      <p className="text-white/80 text-sm mb-1">恭喜获得</p>
                      <p className="text-white text-4xl font-bold">神秘奖品</p>
                    </div>
                  )}
                </div>

                {/* 奖品文案 */}
                <p className="text-gray-800 text-lg font-semibold mb-2">{resolveRewardText()}</p>

                {/* 特殊说明 */}
                <p className="text-gray-400 text-sm mb-6">{resolveSpecialNote()}</p>

                {/* 领取按钮 */}
                <button
                  onClick={handleClaim}
                  className="w-full py-3 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                  style={{
                    background: "linear-gradient(135deg, #FF6B6B 0%, #FF4757 100%)",
                    boxShadow:
                      "0 6px 16px rgba(255, 75, 87, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.30), inset 0 -2px 0 rgba(180, 30, 30, 0.30)",
                    border: "0.5px solid rgba(255, 255, 255, 0.20)",
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

  // 预览模式
  return (
    <div className="w-full rounded-2xl shadow-lg relative">
      {/* Close Button - 预览模式下显示 - 位于右上角 */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-30 w-6 h-6 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.25)" }}
        >
          <X className="w-3 h-3 text-white" />
        </button>
      )}

      {/* Rain Scene */}
      {!isClaimed ? (
        <div
          ref={containerRef}
          className="relative overflow-hidden"
          style={{ height: "300px",
            background: "linear-gradient(180deg, rgba(26, 10, 46, 0.55) 0%, rgba(45, 27, 78, 0.55) 100%)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
            boxShadow: "0 16px 40px rgba(15, 5, 30, 0.45), 0 2px 8px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.10)",
          }}
        >
          {/* 节日光晕装饰 - 金+红（宝箱宝藏感） */}
          <div
            aria-hidden
            className="absolute pointer-events-none"
            style={{
              top: "-30px",
              left: "-30px",
              width: "180px",
              height: "180px",
              background: "radial-gradient(circle, rgba(255, 215, 0, 0.30) 0%, rgba(255, 215, 0, 0) 70%)",
              filter: "blur(16px)",
              zIndex: 0,
            }}
          />
          <div
            aria-hidden
            className="absolute pointer-events-none"
            style={{
              bottom: "-30px",
              right: "-30px",
              width: "200px",
              height: "200px",
              background: "radial-gradient(circle, rgba(255, 75, 87, 0.25) 0%, rgba(255, 75, 87, 0) 70%)",
              filter: "blur(18px)",
              zIndex: 0,
            }}
          />

          {/* Guide Text */}
          <div className="absolute top-2 left-0 right-0 z-10">
            <div className="relative flex flex-col items-center">
              <div
                className="relative rounded-full px-3 py-1.5 whitespace-nowrap"
                style={{
                  background: "rgba(255, 215, 0, 0.18)",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: "0.5px solid rgba(255, 255, 255, 0.30)",
                }}
              >
                <p className="text-white text-xs font-semibold text-center drop-shadow-lg animate-pulse">
                  {resolveGuideText()}
                </p>
              </div>
            </div>
          </div>

          {/* Falling Treasureboxes - 流水式持续飘落 */}
          <style jsx>{`
            @keyframes fallTreasureboxWaterPreview {
              0%   { top: -90px; opacity: 0; transform: scale(var(--tb-scale, 1)) translateX(0px) rotate(0deg); }
              6%   { top: -50px; opacity: 1; transform: scale(var(--tb-scale, 1)) translateX(2px) rotate(8deg); }
              25%  { top: 22%;   opacity: 1; transform: scale(var(--tb-scale, 1)) translateX(-2px) rotate(-8deg); }
              50%  { top: 50%;   opacity: 1; transform: scale(var(--tb-scale, 1)) translateX(2px) rotate(8deg); }
              75%  { top: 78%;   opacity: 1; transform: scale(var(--tb-scale, 1)) translateX(-2px) rotate(-8deg); }
              92%  { top: 96%;   opacity: 1; transform: scale(var(--tb-scale, 1)) translateX(1px) rotate(5deg); }
              100% { top: 110%;  opacity: 0; transform: scale(var(--tb-scale, 1)) translateX(0px) rotate(0deg); }
            }
          `}</style>

          {fallingTreasureboxes.slice(0, 12).map((tb) => (
            <div
              key={tb.id}
              onClick={handleTreasureboxClick}
              className="absolute cursor-pointer hover:scale-110 transition-transform"
              style={{
                left: `${tb.x}%`,
                animation: `fallTreasureboxWaterPreview ${tb.duration}ms linear ${tb.delay}ms infinite both`,
                animationFillMode: 'backwards',
                ['--tb-scale' as React.CSSProperties['--tb-scale']]: tb.scale * 0.8,
                willChange: 'top, opacity, transform',
                backfaceVisibility: 'hidden',
                zIndex: 10,
              }}
            >
              <img
                src={treasureboxImage}
                alt="宝箱"
                className="w-[50px] h-auto object-contain"
                style={{ maxHeight: "45px" }}
                draggable={false}
              />
            </div>
          ))}
        </div>
      ) : (
        /* Reward Scene */
        <div
          className="relative p-4"
          style={{
            height: "300px",
            background: "linear-gradient(180deg, rgba(255, 245, 230, 0.55) 0%, rgba(255, 228, 204, 0.55) 100%)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(255, 200, 130, 0.30)",
            boxShadow: "0 16px 40px rgba(180, 100, 0, 0.30), 0 2px 8px rgba(0, 0, 0, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.40)",
          }}
        >
          {/* 暖色光晕 - 橙+金（领奖喜庆感） */}
          <div
            aria-hidden
            className="absolute pointer-events-none"
            style={{
              top: "-30px",
              right: "-30px",
              width: "180px",
              height: "180px",
              background: "radial-gradient(circle, rgba(255, 165, 0, 0.30) 0%, rgba(255, 165, 0, 0) 70%)",
              filter: "blur(18px)",
              zIndex: 0,
            }}
          />
          <div
            aria-hidden
            className="absolute pointer-events-none"
            style={{
              bottom: "-30px",
              left: "-30px",
              width: "160px",
              height: "160px",
              background: "radial-gradient(circle, rgba(255, 215, 0, 0.25) 0%, rgba(255, 215, 0, 0) 70%)",
              filter: "blur(16px)",
              zIndex: 0,
            }}
          />

          <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
            {/* 奖励展示 */}
            <div className="mb-4 text-center">
              {finalConfig.rewardType === "cash" ? (
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                    boxShadow:
                      "0 8px 24px rgba(255, 165, 0, 0.40), 0 2px 6px rgba(0, 0, 0, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.45), inset 0 -2px 0 rgba(180, 100, 0, 0.30)",
                    border: "0.5px solid rgba(255, 255, 255, 0.30)",
                  }}
                >
                  <p className="text-white/80 text-xs mb-1">恭喜获得</p>
                  <p className="text-white text-2xl font-bold">¥{resolveCashAmount()}</p>
                </div>
              ) : resolveRewardImage() ? (
                <img
                  src={resolveRewardImage()}
                  alt="奖励"
                  className="max-w-full max-h-24 object-contain rounded-lg"
                  draggable={false}
                />
              ) : (
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                    boxShadow:
                      "0 8px 24px rgba(255, 165, 0, 0.40), 0 2px 6px rgba(0, 0, 0, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.45), inset 0 -2px 0 rgba(180, 100, 0, 0.30)",
                    border: "0.5px solid rgba(255, 255, 255, 0.30)",
                  }}
                >
                  <p className="text-white/80 text-xs mb-1">恭喜获得</p>
                  <p className="text-white text-2xl font-bold">神秘奖品</p>
                </div>
              )}
            </div>

            {/* 奖品文案 */}
            <p className="text-gray-800 text-sm font-semibold mb-1">{resolveRewardText()}</p>

            {/* 特殊说明 */}
            <p className="text-gray-400 text-xs mb-4">{resolveSpecialNote()}</p>

            {/* 领取按钮 */}
            <button
              onClick={handleClaim}
              className="w-full py-2 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{
                background: "linear-gradient(135deg, #FF6B6B 0%, #FF4757 100%)",
                boxShadow:
                  "0 6px 16px rgba(255, 75, 87, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.30), inset 0 -2px 0 rgba(180, 30, 30, 0.30)",
                border: "0.5px solid rgba(255, 255, 255, 0.20)",
              }}
            >
              立即领取
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TreasureboxRainTemplate;
