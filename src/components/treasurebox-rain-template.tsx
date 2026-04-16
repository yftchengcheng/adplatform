"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { TreasureboxRainConfig } from "./treasurebox-rain-template-config";

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

  // 生成飘落宝箱
  const generateFallingTreasureboxes = useCallback(() => {
    const treasureboxes: FallingTreasurebox[] = [];
    const positions = [15, 50, 85]; // 三条垂直轨迹位置

    for (let i = 0; i < 15; i++) {
      treasureboxes.push({
        id: `tb-${Date.now()}-${i}`,
        x: positions[i % 3],
        delay: Math.random() * 3000,
        duration: 3000 + Math.random() * 1000,
        scale: 0.8 + Math.random() * 0.4,
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

      // 定期添加新的宝箱
      const interval = setInterval(() => {
        setFallingTreasureboxes((prev) => {
          const positions = [15, 50, 85];
          const newTreasurebox: FallingTreasurebox = {
            id: `tb-${Date.now()}-${Math.random()}`,
            x: positions[Math.floor(Math.random() * 3)],
            delay: 0,
            duration: 3000 + Math.random() * 1000,
            scale: 0.8 + Math.random() * 0.4,
          };
          return [...prev.slice(-10), newTreasurebox]; // 保持最多10个
        });
      }, 500);

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
      window.open(url, "_blank");
    }
  }, [resolveLandingPage]);

  if (!isVisible) return null;

  const treasureboxImage = resolveTreasureboxImage();

  // 全屏模式
  if (!previewMode) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 transition-colors"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Rain Scene */}
          {!isClaimed ? (
            <div ref={containerRef} className="flex-1 relative overflow-hidden bg-gradient-to-b from-[#1a0a2e] to-[#2d1b4e]">
              {/* Guide Text */}
              <div className="absolute top-8 left-0 right-0 z-10">
                <div className="relative flex flex-col items-center">
                  <div className="relative bg-gradient-to-r from-black/40 via-black/30 to-black/40 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20 whitespace-nowrap">
                    <p className="text-white text-sm font-semibold text-center drop-shadow-lg animate-pulse">
                      {resolveGuideText()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Falling Treasureboxes */}
              <style jsx>{`
                @keyframes fallTreasurebox {
                  0% {
                    top: 80px;
                    opacity: 0;
                    transform: scale(0.8) rotate(0deg);
                  }
                  10% {
                    opacity: 1;
                  }
                  90% {
                    opacity: 1;
                  }
                  100% {
                    top: calc(100% - 60px);
                    opacity: 1;
                    transform: scale(1) rotate(360deg);
                  }
                }
              `}</style>

              {fallingTreasureboxes.map((tb) => (
                <div
                  key={tb.id}
                  onClick={handleTreasureboxClick}
                  className="absolute cursor-pointer hover:scale-110 transition-transform"
                  style={{
                    left: `${tb.x}%`,
                    top: 0,
                    animation: `fallTreasurebox ${tb.duration}ms ease-in forwards`,
                    animationDelay: `${tb.delay}ms`,
                    transform: `scale(${tb.scale})`,
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

              {/* Gesture hint */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <img
                  src="/treasurebox-gesture.png"
                  alt="手势提示"
                  className="w-8 h-auto animate-bounce opacity-70"
                  style={{ animationDuration: "1s" }}
                  draggable={false}
                />
              </div>
            </div>
          ) : (
            /* Reward Scene */
            <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-[#FFF5E6] to-[#FFE4CC] p-6">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="w-full max-w-sm flex flex-col items-center animate-fadeIn">
                {/* 宝箱已开 */}
                <div className="mb-6">
                  <img
                    src="/treasurebox-open.png"
                    alt="开启的宝箱"
                    className="w-32 h-auto object-contain"
                    draggable={false}
                  />
                </div>

                {/* 奖励展示 */}
                <div className="mb-6 text-center">
                  {finalConfig.rewardType === "cash" ? (
                    <div className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-2xl p-6 shadow-lg">
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
                    <div className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-2xl p-6 shadow-lg">
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
                  className="w-full py-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF4757] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                >
                  领取奖品
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
    <div className="w-full rounded-t-2xl overflow-hidden shadow-lg" style={{ minHeight: "300px" }}>
      {/* Rain Scene */}
      {!isClaimed ? (
        <div ref={containerRef} className="flex-1 relative overflow-hidden bg-gradient-to-b from-[#1a0a2e] to-[#2d1b4e]">
          {/* Guide Text */}
          <div className="absolute top-4 left-0 right-0 z-10">
            <div className="relative flex flex-col items-center">
              <div className="relative bg-gradient-to-r from-black/40 via-black/30 to-black/40 backdrop-blur-sm rounded-full px-4 py-1.5 border border-white/20 whitespace-nowrap">
                <p className="text-white text-xs font-semibold text-center drop-shadow-lg animate-pulse">
                  {resolveGuideText()}
                </p>
              </div>
            </div>
          </div>

          {/* Falling Treasureboxes */}
          <style jsx>{`
            @keyframes fallTreasureboxPreview {
              0% {
                top: 40px;
                opacity: 0;
                transform: scale(0.8) rotate(0deg);
              }
              10% {
                opacity: 1;
              }
              90% {
                opacity: 1;
              }
              100% {
                top: calc(100% - 40px);
                opacity: 1;
                transform: scale(1) rotate(360deg);
              }
            }
          `}</style>

          {fallingTreasureboxes.slice(0, 6).map((tb) => (
            <div
              key={tb.id}
              onClick={handleTreasureboxClick}
              className="absolute cursor-pointer hover:scale-110 transition-transform"
              style={{
                left: `${tb.x}%`,
                top: 0,
                animation: `fallTreasureboxPreview ${tb.duration}ms ease-in forwards`,
                animationDelay: `${tb.delay}ms`,
                transform: `scale(${tb.scale * 0.8})`,
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

          {/* Gesture hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <img
              src="/treasurebox-gesture.png"
              alt="手势提示"
              className="w-6 h-auto animate-bounce opacity-70"
              style={{ animationDuration: "1s" }}
              draggable={false}
            />
          </div>
        </div>
      ) : (
        /* Reward Scene */
        <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-[#FFF5E6] to-[#FFE4CC] p-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition-colors"
          >
            <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* 宝箱已开 */}
            <div className="mb-4">
              <img
                src="/treasurebox-open.png"
                alt="开启的宝箱"
                className="w-24 h-auto object-contain"
                draggable={false}
              />
            </div>

            {/* 奖励展示 */}
            <div className="mb-4 text-center">
              {finalConfig.rewardType === "cash" ? (
                <div className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-xl p-4 shadow-lg">
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
                <div className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-xl p-4 shadow-lg">
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
              className="w-full py-2 bg-gradient-to-r from-[#FF6B6B] to-[#FF4757] text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              领取奖品
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TreasureboxRainTemplate;
