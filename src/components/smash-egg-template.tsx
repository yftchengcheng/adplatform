"use client";

import React, { useState, useCallback, useEffect } from "react";
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

export function SmashEggTemplate({
  config,
  isOpen = true,
  onClose,
  previewMode = false,
}: SmashEggTemplateProps) {
  // 状态
  const [isSmashed, setIsSmashed] = useState(false);
  // 默认配置
  const defaultConfig: SmashEggConfig = {
    componentName: "砸金蛋得好礼！",
    guideText: "砸蛋送大礼",
    guideTextMacro: "",
    rewardType: "cash",
    cashAmount: "88.88",
    cashAmountMacro: "",
    rewardImageUrl: "",
    rewardImageMacro: "",
    specialNote: "实际奖品以APP为准！",
    specialNoteMacro: "",
    landingPageUrl: "",
    landingPageMacro: "",
    defaultLandingPageUrl: "",
    macroVariables: {},
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

  // 处理砸蛋点击 - 直接跳转到领奖页面
  const handleSmash = useCallback(() => {
    if (isSmashed) return;
    setIsSmashed(true);
  }, [isSmashed]);

  // 处理领取
  const handleClaim = useCallback(() => {
    const url = getLandingPageUrl();
    if (url && url !== "#") {
      window.open(url, "_blank");
    }
  }, [getLandingPageUrl]);

  // 重置状态
  useEffect(() => {
    setIsSmashed(false);
  }, []);

  // 渲染砸蛋场景
  const renderSmashScene = () => (
    <div 
      className="relative w-full h-full overflow-hidden"
      style={{
        backgroundImage: "url('/smash-page.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* 蛋容器 - 使用距离底部比例定位，25%表示距离底部25% */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 cursor-pointer egg-shake-rotate"
        onClick={handleSmash}
        style={{ bottom: "25%" }}
      >
        <img
          src="/egg-shake.png"
          alt="彩蛋"
          className="w-40 h-auto object-contain"
          draggable={false}
        />
      </div>

      {/* 锤子 - 相对于蛋的位置 */}
      <div 
        className="absolute hammer-shake"
        style={{
          top: "25%",
          right: "18%",
        }}
      >
        <img
          src="/hammer.png"
          alt="锤子"
          className="w-20 h-auto object-contain"
          draggable={false}
        />
      </div>

      {/* 点击提示 */}
      {!isSmashed && (
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-white text-xs font-bold drop-shadow-lg animate-pulse">
            {resolveGuideText()}
          </p>
        </div>
      )}
    </div>
  );

  // 渲染领奖场景
  const renderRewardScene = () => (
    <div 
      className="relative w-full h-full flex flex-col items-center justify-center cursor-pointer"
      style={{
        backgroundImage: "url('/reward-page.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onClick={handleClaim}
    >
      {/* 奖品展示区域 */}
      <div className="absolute top-[36%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 flex flex-col items-center">
        {/* 奖励展示 */}
        <div className="text-center reward-pop">
          {finalConfig.rewardType === "cash" ? (
            <div className="flex flex-col items-center">
              <p className="text-2xl font-bold text-red-500 mb-2">恭喜获得</p>
              <p className="text-5xl font-bold text-red-600">¥{resolveCashAmount()}</p>
            </div>
          ) : resolveRewardImage() ? (
            <img
              src={resolveRewardImage()}
              alt="奖励"
              className="max-w-full max-h-24 object-contain rounded-xl shadow-lg"
              draggable={false}
            />
          ) : null}
        </div>
      </div>

      {/* 底部特殊说明 */}
      <div className="absolute bottom-[42%] left-1/2 -translate-x-1/2 w-3/4 flex flex-col items-center gap-2">
        <p className="text-sm text-amber-700">{resolveSpecialNote()}</p>
      </div>

      {/* 图片按钮点击区域 - 与背景图片中的"马上去领奖"按钮位置对齐 */}
      <div 
        className="absolute bottom-[8%] left-1/2 -translate-x-1/2 w-[45%] aspect-[120/35] cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          handleClaim();
        }}
      />
    </div>
  );

  // 预览模式
  if (previewMode) {
    return (
      <div className="w-full h-full rounded-t-2xl shadow-lg relative overflow-hidden">
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-20 w-7 h-7 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
          >
            <X className="w-4 h-4 text-white" />
          </button>
        )}

        {!isSmashed ? renderSmashScene() : renderRewardScene()}
      </div>
    );
  }

  // 独立模式（fixed 全屏）
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
        >
          <X className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        {isSmashed ? renderRewardScene() : renderSmashScene()}
      </div>
    </div>
  );
}
