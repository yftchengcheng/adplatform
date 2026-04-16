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

export function SmashEggTemplate({
  config,
  isOpen = true,
  onClose,
  previewMode = false,
}: SmashEggTemplateProps) {
  // 状态
  const [isSmashed, setIsSmashed] = useState(false);
  const [isHammerHit, setIsHammerHit] = useState(false);
  const [isEggShaking, setIsEggShaking] = useState(false);
  const [showEggOpen, setShowEggOpen] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // 默认配置
  const defaultConfig: SmashEggConfig = {
    componentName: "砸金蛋",
    guideText: "砸蛋送大礼",
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
    eggImageUrl: "/egg-shake.png",
    eggImageMacro: "",
    hammerImageUrl: "/hammer.png",
    hammerImageMacro: "",
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
    if (isSmashed || isHammerHit) return;

    // 1. 蛋开始抖动
    setIsEggShaking(true);
    
    // 2. 锤子砸下
    setTimeout(() => {
      setIsEggShaking(false);
      setIsHammerHit(true);
    }, 500);

    // 3. 显示开蛋效果
    setTimeout(() => {
      setShowEggOpen(true);
    }, 1000);

    // 4. 切换到领奖场景
    setTimeout(() => {
      setIsSmashed(true);
      setShowReward(true);
    }, 1500);
  }, [isSmashed, isHammerHit]);

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

  // 重置状态
  useEffect(() => {
    setIsSmashed(false);
    setIsHammerHit(false);
    setIsEggShaking(false);
    setShowEggOpen(false);
    setShowReward(false);
  }, []);

  // 渲染砸蛋场景
  const renderSmashScene = () => (
    <div 
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: "url('/smash-page.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* 蛋容器 */}
      <div 
        className={cn(
          "relative cursor-pointer",
          isEggShaking && "egg-shake-lr",
          !isEggShaking && !isHammerHit && "egg-shake-rotate"
        )}
        onClick={handleSmash}
      >
        <img
          src={finalConfig.eggImageUrl || "/egg-shake.png"}
          alt="彩蛋"
          className="w-48 h-auto object-contain"
          draggable={false}
        />
      </div>

      {/* 锤子 */}
      <div 
        className={cn(
          "absolute",
          isHammerHit ? "hammer-hit" : "hammer-shake"
        )}
        style={{
          top: "25%",
          right: "15%",
        }}
        onClick={handleSmash}
      >
        <img
          src={finalConfig.hammerImageUrl || "/hammer.png"}
          alt="锤子"
          className="w-24 h-auto object-contain"
          draggable={false}
        />
      </div>

      {/* 开蛋效果 */}
      {showEggOpen && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src="/egg-open.png"
            alt="开蛋"
            className="w-48 h-auto object-contain egg-open-anim"
            draggable={false}
          />
        </div>
      )}

      {/* 点击提示 */}
      {!isEggShaking && !isHammerHit && !showEggOpen && (
        <div className="absolute bottom-20 left-0 right-0 text-center">
          <p className="text-white text-sm font-bold drop-shadow-lg animate-pulse">
            {resolveGuideText()}
          </p>
        </div>
      )}
    </div>
  );

  // 渲染领奖场景
  const renderRewardScene = () => (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-6">
      {/* 背景 */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/smash-page.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.7)",
        }}
      />
      
      {/* 内容 */}
      <div className="relative z-10 flex flex-col items-center">
        {/* 奖励展示 */}
        <div className="mb-6 text-center reward-pop">
          {finalConfig.rewardType === "cash" ? (
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 shadow-2xl">
              <p className="text-white/90 text-sm mb-1">恭喜获得</p>
              <p className="text-white text-4xl font-bold">¥{resolveCashAmount()}</p>
            </div>
          ) : resolveRewardImage() ? (
            <img
              src={resolveRewardImage()}
              alt="奖励"
              className="max-w-full max-h-32 object-contain rounded-xl shadow-lg"
              draggable={false}
            />
          ) : null}
        </div>

        {/* 奖品文案 */}
        <p className="text-white text-xl font-bold mb-2 drop-shadow-lg">{resolveRewardText()}</p>

        {/* 特殊说明 */}
        <p className="text-white/80 text-sm mb-8 drop-shadow">{resolveSpecialNote()}</p>

        {/* 领取按钮 */}
        <button
          onClick={handleClaim}
          className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-bold text-lg shadow-lg hover:opacity-90 transition-opacity"
        >
          立即领取
        </button>
      </div>
    </div>
  );

  // 预览模式
  if (previewMode) {
    return (
      <div className="w-full h-full rounded-t-2xl shadow-lg relative overflow-hidden" style={{ minHeight: "500px" }}>
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

  // 全屏模式
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
      <div className="flex-1">
        {isSmashed ? renderRewardScene() : renderSmashScene()}
      </div>
    </div>
  );
}
