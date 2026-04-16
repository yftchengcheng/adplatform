"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SmashEggConfig } from "./smash-egg-template-config";

interface SmashEggTemplateProps {
  config?: Partial<SmashEggConfig>;
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

// 获取字符串显示宽度（中文2字符，英文1字符）
function getStringWidth(str: string): number {
  let width = 0;
  for (const char of str) {
    if (/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(char)) {
      width += 2;
    } else {
      width += 1;
    }
  }
  return width;
}

export function SmashEggTemplate({
  config,
  isOpen = true,
  onClose,
  previewMode = false,
}: SmashEggTemplateProps) {
  // 状态
  const [isSmashed, setIsSmashed] = useState(false);
  const [isHammerUp, setIsHammerUp] = useState(false);
  const [isEggShaking, setIsEggShaking] = useState(false);
  const [isEggBreaking, setIsEggBreaking] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const hammerRef = useRef<HTMLDivElement>(null);
  const eggRef = useRef<HTMLDivElement>(null);

  // 使用默认配置填充空值
  const defaultConfig: SmashEggConfig = {
    guideText: "点击金蛋，领取奖品",
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
    eggImageUrl: "",
    eggImageMacro: "",
    hammerImageUrl: "",
    hammerImageMacro: "",
    landingPageUrl: "",
    landingPageMacro: "",
    defaultLandingPageUrl: "",
    macroVariables: {},
    componentName: "砸金蛋",
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

  const resolveGuideText = useCallback(() => {
    return resolveMacroText(finalConfig.guideText, finalConfig.guideTextMacro);
  }, [finalConfig.guideText, finalConfig.guideTextMacro, resolveMacroText]);

  const resolveCashAmount = useCallback(() => {
    return resolveMacroText(finalConfig.cashAmount, finalConfig.cashAmountMacro);
  }, [finalConfig.cashAmount, finalConfig.cashAmountMacro, resolveMacroText]);

  const resolveRewardText = useCallback(() => {
    return resolveMacroText(finalConfig.rewardText, finalConfig.rewardTextMacro);
  }, [finalConfig.rewardText, finalConfig.rewardTextMacro, resolveMacroText]);

  const resolveSpecialNote = useCallback(() => {
    return resolveMacroText(finalConfig.specialNote, finalConfig.specialNoteMacro);
  }, [finalConfig.specialNote, finalConfig.specialNoteMacro, resolveMacroText]);

  const resolveRewardImage = useCallback(() => {
    if (finalConfig.rewardImageMacro) {
      const resolved = resolveMacro(finalConfig.rewardImageMacro, finalConfig.macroVariables);
      if (!resolved.includes("${") && !resolved.startsWith("$")) {
        return resolved;
      }
    }
    return finalConfig.rewardImageUrl;
  }, [finalConfig.rewardImageUrl, finalConfig.rewardImageMacro, finalConfig.macroVariables]);

  const resolveEggImage = useCallback(() => {
    if (finalConfig.eggImageMacro) {
      const resolved = resolveMacro(finalConfig.eggImageMacro, finalConfig.macroVariables);
      if (!resolved.includes("${") && !resolved.startsWith("$")) {
        return resolved;
      }
    }
    return finalConfig.eggImageUrl || "/smash-egg.png";
  }, [finalConfig.eggImageUrl, finalConfig.eggImageMacro, finalConfig.macroVariables]);

  const resolveHammerImage = useCallback(() => {
    if (finalConfig.hammerImageMacro) {
      const resolved = resolveMacro(finalConfig.hammerImageMacro, finalConfig.macroVariables);
      if (!resolved.includes("${") && !resolved.startsWith("$")) {
        return resolved;
      }
    }
    return finalConfig.hammerImageUrl || "/smash-hammer.png";
  }, [finalConfig.hammerImageUrl, finalConfig.hammerImageMacro, finalConfig.macroVariables]);

  // 获取落地页链接
  const getLandingPageUrl = useCallback(() => {
    if (finalConfig.landingPageMacro) {
      const resolved = resolveMacro(finalConfig.landingPageMacro, finalConfig.macroVariables);
      if (!resolved.includes("${") && !resolved.startsWith("$")) {
        return resolved;
      }
    }
    if (finalConfig.landingPageUrl) {
      return finalConfig.landingPageUrl;
    }
    return finalConfig.defaultLandingPageUrl || "#";
  }, [finalConfig.landingPageUrl, finalConfig.landingPageMacro, finalConfig.defaultLandingPageUrl, finalConfig.macroVariables]);

  // 处理砸蛋点击
  const handleSmash = useCallback(() => {
    if (isSmashed) return;

    // 开始砸蛋动画序列
    // 1. 金蛋抖动
    setIsEggShaking(true);
    
    // 2. 锤子抬起
    setTimeout(() => {
      setIsHammerUp(true);
    }, 200);

    // 3. 锤子落下砸蛋
    setTimeout(() => {
      setIsHammerUp(false);
      setIsEggShaking(false);
      setIsEggBreaking(true);
    }, 500);

    // 4. 切换到领奖场景
    setTimeout(() => {
      setIsSmashed(true);
      setShowReward(true);
    }, 1000);
  }, [isSmashed]);

  // 处理领取
  const handleClaim = useCallback(() => {
    const url = getLandingPageUrl();
    if (url && url !== "#") {
      window.open(url, "_blank");
    }
  }, [getLandingPageUrl]);

  // 组件显示动画
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  // 渲染砸蛋场景
  const renderSmashScene = () => (
    <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden" style={{ background: "linear-gradient(180deg, #FFF8E7 0%, #FFE4B5 100%)" }}>
      {/* 背景装饰 - 云彩滚动 */}
      <div className="absolute inset-x-0 bottom-0 h-1/4 overflow-hidden pointer-events-none">
        <style jsx>{`
          @keyframes cloudScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .cloud-scroll {
            animation: cloudScroll 20s linear infinite;
          }
        `}</style>
        <div className="cloud-scroll flex items-end h-full whitespace-nowrap">
          {[...Array(10)].map((_, i) => (
            <img
              key={i}
              src="/smash-cloud.png"
              alt=""
              className="h-12 w-auto object-contain opacity-60"
              style={{ marginRight: "20px" }}
              draggable={false}
            />
          ))}
        </div>
      </div>

      {/* 引导文案 */}
      <div className="absolute top-4 left-0 right-0 z-10">
        <div className="relative flex flex-col items-center">
          <div className="relative bg-gradient-to-r from-black/40 via-black/30 to-black/40 backdrop-blur-sm rounded-full px-4 py-1.5 border border-white/20 whitespace-nowrap">
            <p className="text-white text-xs font-semibold text-center drop-shadow-lg">
              {resolveGuideText()}
            </p>
          </div>
        </div>
      </div>

      {/* 金蛋和锤子容器 */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* 金蛋 */}
        <div
          ref={eggRef}
          onClick={handleSmash}
          className={cn(
            "relative cursor-pointer transition-all",
            isEggShaking && "animate-[shake_0.2s_ease-in-out_infinite]",
            isEggBreaking && "animate-[break_0.5s_ease-out_forwards]"
          )}
        >
          <img
            src={resolveEggImage()}
            alt="金蛋"
            className="w-40 h-auto object-contain"
            draggable={false}
          />
        </div>

        {/* 锤子 */}
        <div
          ref={hammerRef}
          className={cn(
            "absolute top-0 right-0 w-20 h-auto transition-transform origin-bottom-right",
            isHammerUp && "-rotate-[30deg]",
            !isHammerUp && !isEggBreaking && "rotate-0",
            isEggBreaking && "opacity-0"
          )}
          style={{ transform: isHammerUp ? "rotate(-30deg)" : "rotate(0deg)" }}
          onClick={handleSmash}
        >
          <img
            src={resolveHammerImage()}
            alt="锤子"
            className="w-full h-auto object-contain"
            draggable={false}
          />
        </div>

        {/* 点击提示 */}
        {!isEggShaking && !isEggBreaking && (
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
            <p className="text-xs text-gray-500 animate-pulse">点击金蛋或锤子</p>
          </div>
        )}
      </div>

      {/* 碎裂动画效果 */}
      {isEggBreaking && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <style jsx>{`
            @keyframes break {
              0% { opacity: 1; transform: scale(1); }
              100% { opacity: 0; transform: scale(1.5); }
            }
            .break-effect {
              animation: break 0.5s ease-out forwards;
            }
          `}</style>
          <div className="break-effect">
            <img
              src="/smash-break.png"
              alt="碎裂"
              className="w-48 h-auto object-contain"
              draggable={false}
            />
          </div>
        </div>
      )}
    </div>
  );

  // 渲染领奖场景
  const renderRewardScene = () => (
    <div className="relative flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-[#FFF5E6] to-[#FFE4CC] p-6">
      {/* 奖励展示 */}
      <div className="mb-4 text-center animate-fadeIn">
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
        ) : null}
      </div>

      {/* 奖品文案 */}
      <p className="text-center text-gray-800 font-medium mb-2">{resolveRewardText()}</p>

      {/* 特殊说明 */}
      <p className="text-center text-gray-400 text-xs mb-6">{resolveSpecialNote()}</p>

      {/* 领取按钮 */}
      <button
        onClick={handleClaim}
        className="w-full py-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF4757] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
      >
        立即领取
      </button>
    </div>
  );

  // 预览模式
  if (previewMode) {
    return (
      <div className="w-full rounded-t-2xl shadow-lg relative" style={{ overflow: 'visible' }}>
        {/* Close Button - 预览模式下显示 */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-20 w-7 h-7 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        {!isSmashed ? renderSmashScene() : renderRewardScene()}
      </div>
    );
  }

  // 全屏模式
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
      <div className="flex-1 flex flex-col transition-all duration-500">
        {isSmashed ? renderRewardScene() : renderSmashScene()}
      </div>
    </div>
  );
}
