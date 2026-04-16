"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// 配置数据类型
export interface PopupRedpacketConfig {
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
  // 组件名称
  componentName?: string;
}

// 模板配置类型
export type PopupRedpacketTemplateConfig = PopupRedpacketConfig;

// 默认配置
const defaultConfig: PopupRedpacketConfig = {
  guideText: "点击开红包",
  guideTextMacro: "",
  rewardType: "cash",
  cashAmount: "88.88",
  cashAmountMacro: "",
  rewardImageUrl: "",
  rewardImageMacro: "",
  rewardText: "恭喜获得100元优惠券",
  rewardTextMacro: "",
  specialNote: "实际奖品以APP为准",
  specialNoteMacro: "",
  redpacketImageUrl: "",
  redpacketImageMacro: "",
  landingPageUrl: "",
  landingPageMacro: "",
  defaultLandingPageUrl: "",
  componentName: "弹窗红包",
};

// 宏变量替换函数
const resolveMacro = (
  value: string | undefined,
  macroVariables?: Record<string, string>
): string => {
  if (!value || !macroVariables) return value || "";
  let result = value;
  Object.entries(macroVariables).forEach(([key, val]) => {
    result = result.replace(new RegExp(`\\$\\{${key}\\}`, "g"), val);
    result = result.replace(new RegExp(`\\$${key}`, "g"), val);
  });
  return result;
};

interface PopupRedpacketTemplateProps {
  config: PopupRedpacketConfig;
  isOpen: boolean;
  onClose: () => void;
  previewMode?: boolean;
  onButtonClick?: (config: PopupRedpacketConfig) => void;
}

export function PopupRedpacketTemplate({
  config,
  isOpen,
  onClose,
  previewMode = false,
  onButtonClick,
}: PopupRedpacketTemplateProps) {
  const finalConfig: PopupRedpacketConfig = {
    ...defaultConfig,
    ...config,
  };

  // 状态管理
  const [isVisible, setIsVisible] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const particleIdRef = useRef(0);

  // 解析宏变量后的配置
  const resolvedConfig = {
    ...finalConfig,
    guideText: resolveMacro(finalConfig.guideText, finalConfig.macroVariables),
    cashAmount: resolveMacro(finalConfig.cashAmount, finalConfig.macroVariables),
    rewardText: resolveMacro(finalConfig.rewardText, finalConfig.macroVariables),
    specialNote: resolveMacro(finalConfig.specialNote, finalConfig.macroVariables),
    redpacketImageUrl: resolveMacro(finalConfig.redpacketImageUrl, finalConfig.macroVariables),
    rewardImageUrl: resolveMacro(finalConfig.rewardImageUrl, finalConfig.macroVariables),
    landingPageUrl: resolveMacro(finalConfig.landingPageUrl, finalConfig.macroVariables) || finalConfig.defaultLandingPageUrl || "",
  };

  // 入场动画
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsOpening(true);
      setIsClaimed(false);
      setIsExiting(false);
      setTimeout(() => setIsOpening(false), 600);
    }
  }, [isOpen]);

  // 生成粒子
  const generateParticles = useCallback(() => {
    const newParticles = Array.from({ length: 12 }, () => ({
      id: particleIdRef.current++,
      x: 50 + (Math.random() - 0.5) * 40,
      y: 45 + (Math.random() - 0.5) * 20,
    }));
    setParticles(newParticles);
    setShowParticles(true);
    setTimeout(() => setShowParticles(false), 800);
  }, []);

  // 点击开红包
  const handleOpen = useCallback(() => {
    if (isOpening || isClaimed) return;

    // 生成粒子效果
    generateParticles();

    // 闪白效果
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 200);

    // 显示奖品
    setTimeout(() => {
      setIsClaimed(true);
    }, 300);
  }, [isOpening, isClaimed, generateParticles]);

  // 点击领取按钮
  const handleClaim = useCallback(() => {
    if (resolvedConfig.landingPageUrl) {
      window.open(resolvedConfig.landingPageUrl, "_blank");
    }
    if (onButtonClick) {
      onButtonClick(finalConfig);
    }
  }, [resolvedConfig.landingPageUrl, onButtonClick, finalConfig]);

  // 关闭弹窗
  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClaimed(false);
      setIsExiting(false);
      onClose();
    }, 300);
  }, [onClose]);

  // 点击遮罩关闭
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose]
  );

  // 解析后的图片URL
  const displayRedpacketImage = resolvedConfig.redpacketImageUrl;
  const displayRewardImage = resolvedConfig.rewardImageUrl;

  if (!isOpen || !isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-black/60 backdrop-blur-sm",
        isExiting ? "animate-fade-out" : "animate-fade-in"
      )}
      onClick={handleBackdropClick}
    >
      {/* 弹窗容器 */}
      <div
        className={cn(
          "relative w-full max-w-[300px] mx-4",
          isOpening
            ? "animate-popup-enter"
            : isExiting
            ? "animate-popup-exit"
            : "scale-100"
        )}
      >
        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className={cn(
            "absolute -top-10 right-0 z-20 w-7 h-7 flex items-center justify-center rounded-full",
            "bg-white/20 hover:bg-white/30 transition-colors",
            previewMode && "bg-white/25"
          )}
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {/* 红包未开状态 */}
        {!isClaimed && (
          <div className="flex flex-col items-center">
            {/* 红包主体 */}
            <button
              onClick={handleOpen}
              className="relative w-full animate-redpacket-float"
              disabled={isOpening}
            >
              {displayRedpacketImage ? (
                <img
                  src={displayRedpacketImage}
                  alt="红包"
                  className="w-full h-auto aspect-[9/16] object-contain rounded-lg shadow-2xl"
                />
              ) : (
                // 默认红包样式
                <div className="w-full aspect-[9/16] bg-gradient-to-b from-[#D4363A] to-[#8B1A1A] rounded-lg shadow-2xl flex flex-col items-center justify-center overflow-hidden">
                  {/* 红包装饰 */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {/* 红包封口 */}
                    <div className="absolute top-[25%] w-[60%] h-[3px] bg-[#FFD700] shadow-lg" />
                    <div className="absolute top-[25%] w-[50%] h-[3px] bg-[#FFD700] shadow-lg rotate-45" />
                    <div className="absolute top-[25%] w-[50%] h-[3px] bg-[#FFD700] shadow-lg -rotate-45" />

                    {/* 开启文字 */}
                    <span className="text-[#FFD700] text-3xl font-bold drop-shadow-lg animate-pulse-zh">
                      开
                    </span>

                    {/* 福字装饰 */}
                    <span className="absolute top-[40%] text-[#FFD700]/30 text-6xl font-serif">
                      福
                    </span>
                  </div>

                  {/* 金色边框 */}
                  <div className="absolute inset-0 border-4 border-[#FFD700]/30 rounded-lg pointer-events-none" />

                  {/* 光晕效果 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#FFD700]/20 to-transparent rounded-lg animate-pulse-glow" />
                </div>
              )}
            </button>

            {/* 引导文案 */}
            <p className="mt-4 text-white/90 text-sm font-medium drop-shadow-lg animate-pulse">
              {resolvedConfig.guideText}
            </p>
          </div>
        )}

        {/* 已开/领奖状态 */}
        {isClaimed && (
          <div
            className={cn(
              "bg-gradient-to-b from-[#FFF5E6] to-[#FFE4CC] rounded-2xl p-5 shadow-2xl",
              "animate-reward-enter"
            )}
          >
            {/* 标题 */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">恭喜获得</h3>
            </div>

            {/* 奖励内容 */}
            <div className="flex flex-col items-center mb-4">
              {finalConfig.rewardType === "cash" ? (
                // 现金奖励
                <div className="bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-xl px-8 py-4 mb-3 animate-rotate-in">
                  <span className="text-white text-4xl font-bold">¥</span>
                  <span className="text-white text-4xl font-bold ml-1">
                    {resolvedConfig.cashAmount}
                  </span>
                </div>
              ) : (
                // 自定义奖励图片
                displayRewardImage && (
                  <img
                    src={displayRewardImage}
                    alt="奖励图片"
                    className="w-full aspect-video object-contain rounded-lg mb-3 animate-rotate-in"
                  />
                )
              )}

              {/* 奖品文案 */}
              <p className="text-gray-800 text-sm font-medium text-center animate-fade-in-up">
                {resolvedConfig.rewardText}
              </p>
            </div>

            {/* 特殊说明 */}
            <p className="text-center text-[#E85D5A] text-xs mb-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              {resolvedConfig.specialNote}
            </p>

            {/* 领取按钮 */}
            <button
              onClick={handleClaim}
              className={cn(
                "w-full py-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF4757]",
                "text-white text-sm font-semibold rounded-xl",
                "hover:from-[#FF5252] hover:to-[#FF3D3D] transition-all",
                "active:scale-95 shadow-lg",
                "animate-btn-breathe"
              )}
            >
              领取奖品
            </button>
          </div>
        )}
      </div>

      {/* 粒子效果 */}
      {showParticles && (
        <div className="fixed inset-0 pointer-events-none z-[60]">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-3 h-3 bg-[#FFD700] rounded-full animate-particle-fly"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
            />
          ))}
        </div>
      )}

      {/* 闪白效果 */}
      {showFlash && (
        <div className="fixed inset-0 bg-white/90 z-[70] animate-flash" />
      )}
    </div>
  );
}

export default PopupRedpacketTemplate;
