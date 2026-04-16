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
    ...config,
  };

  // 状态管理
  const [isVisible, setIsVisible] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // 解析宏变量后的配置
  const resolvedConfig = {
    ...finalConfig,
    guideText: resolveMacro(finalConfig.guideText, finalConfig.macroVariables),
    cashAmount: resolveMacro(finalConfig.cashAmount, finalConfig.macroVariables),
    rewardText: resolveMacro(finalConfig.rewardText, finalConfig.macroVariables),
    specialNote: resolveMacro(finalConfig.specialNote, finalConfig.macroVariables),
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

  // 点击开红包
  const handleOpen = useCallback(() => {
    if (isOpening || isClaimed) return;
    setIsClaimed(true);
  }, [isOpening, isClaimed]);

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

  if (!isOpen || !isVisible) return null;

  // 渲染未领取状态（红包弹窗）
  const renderUnclaimedState = () => (
    <div
      className={cn(
        "relative w-full max-w-[280px] mx-4",
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

      {/* 红包主体 */}
      <div className="relative">
        {/* 红包背景 - 渐变红色 */}
        <div 
          className="w-full aspect-[280/400] rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: "linear-gradient(180deg, #E85D5A 0%, #D4363A 40%, #B8241E 100%)",
          }}
        >
          {/* 红包顶部装饰 - 散落的红包和金币 */}
          <div className="relative h-full flex flex-col">
            {/* 装饰层 - 元宝和红包溢出效果 */}
            <div className="relative h-[60px] -mt-4">
              {/* 中心卡通形象 - 元宝小人 */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-2">
                {/* 身体 */}
                <div className="relative w-16 h-14">
                  {/* 头部 - 橘色圆形 */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-b from-[#FF8C42] to-[#FF6B3D] rounded-full">
                    {/* 眼睛 */}
                    <div className="absolute top-3 left-2 w-2 h-2 bg-white rounded-full">
                      <div className="absolute top-0 left-0 w-1 h-1 bg-[#333] rounded-full"></div>
                    </div>
                    <div className="absolute top-3 right-2 w-2 h-2 bg-white rounded-full">
                      <div className="absolute top-0 left-0 w-1 h-1 bg-[#333] rounded-full"></div>
                    </div>
                    {/* 嘴巴 */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-2 bg-[#FF4757] rounded-full">
                      <div className="absolute top-0.5 left-1 w-1 h-1 bg-white rounded-full"></div>
                      <div className="absolute top-0.5 right-1 w-1 h-1 bg-white rounded-full"></div>
                    </div>
                    {/* 帽子 - 元宝 */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-6 bg-gradient-to-b from-[#FFD700] to-[#FFA500] rounded-t-lg">
                      <span className="absolute top-0.5 left-1/2 -translate-x-1/2 text-[#8B4513] text-[8px] font-bold">¥</span>
                    </div>
                    {/* 帽子顶部 */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-4 h-3 bg-gradient-to-b from-[#FFD700] to-[#FFA500] rounded-t-full"></div>
                    {/* 红色手臂 */}
                    <div className="absolute -left-2 top-6 w-4 h-2 bg-[#D4363A] rounded-full transform -rotate-45"></div>
                    <div className="absolute -right-2 top-6 w-4 h-2 bg-[#D4363A] rounded-full transform rotate-45"></div>
                  </div>
                </div>
              </div>

              {/* 左侧小红包 */}
              <div className="absolute left-[15%] top-2 w-6 h-8 bg-gradient-to-b from-[#FF6B6B] to-[#E85D5A] rounded shadow-md">
                <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[#FFD700] text-[6px] font-bold">¥</div>
              </div>
              
              {/* 左侧金币 */}
              <div className="absolute left-[25%] top-6 w-4 h-4 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full shadow-md">
                <div className="absolute inset-0.5 bg-gradient-to-br from-[#FFF176] to-[#FFD700] rounded-full"></div>
              </div>

              {/* 右侧小红包 */}
              <div className="absolute right-[15%] top-2 w-6 h-8 bg-gradient-to-b from-[#FF6B6B] to-[#E85D5A] rounded shadow-md">
                <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[#FFD700] text-[6px] font-bold">¥</div>
              </div>

              {/* 右侧金币 */}
              <div className="absolute right-[25%] top-6 w-4 h-4 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full shadow-md">
                <div className="absolute inset-0.5 bg-gradient-to-br from-[#FFF176] to-[#FFD700] rounded-full"></div>
              </div>

              {/* 更多金币散落 */}
              <div className="absolute left-[35%] top-0 w-3 h-3 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full"></div>
              <div className="absolute right-[35%] top-1 w-3 h-3 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full"></div>
            </div>

            {/* 红包封口装饰线 */}
            <div className="px-4">
              <div className="h-[2px] bg-gradient-to-r from-transparent via-[#8B1A1A] to-transparent"></div>
            </div>

            {/* 中央领取按钮区域 */}
            <div className="flex-1 flex items-center justify-center">
              {/* 领取按钮 - 金色圆形 */}
              <button
                onClick={handleOpen}
                className={cn(
                  "relative w-24 h-24 rounded-full",
                  "bg-gradient-to-br from-[#FFE066] via-[#FFD700] to-[#FFA500]",
                  "shadow-[0_4px_20px_rgba(255,215,0,0.6)]",
                  "hover:scale-105 active:scale-95 transition-transform",
                  "animate-pulse-subtle"
                )}
              >
                {/* 按钮边框 */}
                <div className="absolute inset-1 rounded-full border-2 border-[#8B4513]/30"></div>
                
                {/* 按钮文字 */}
                <span className="text-[#8B4513] text-2xl font-bold">领</span>

                {/* 按钮光晕 */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-[#FFE066] to-[#FFA500] opacity-30 blur-lg"></div>
              </button>
            </div>

            {/* 底部装饰 */}
            <div className="h-8"></div>
          </div>
        </div>

        {/* 红包边缘光泽效果 */}
        <div className="absolute inset-0 rounded-2xl border border-white/20 pointer-events-none"></div>
      </div>
    </div>
  );

  // 渲染已领取状态（领奖页面）
  const renderClaimedState = () => (
    <div
      className={cn(
        "relative w-full max-w-[280px] mx-4",
        "animate-reward-enter"
      )}
    >
      {/* 关闭按钮 */}
      <button
        onClick={handleClose}
        className={cn(
          "absolute -top-10 right-0 z-20 w-7 h-7 flex items-center justify-center rounded-full",
          "bg-white/20 hover:bg-white/30 transition-colors"
        )}
      >
        <X className="w-4 h-4 text-white" />
      </button>

      {/* 领奖卡片 */}
      <div
        className="bg-gradient-to-b from-[#FFF5E6] to-[#FFE4CC] rounded-2xl p-5 shadow-2xl"
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
            finalConfig.rewardImageUrl && (
              <img
                src={finalConfig.rewardImageUrl}
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
    </div>
  );

  return (
    <div
      className={cn(
        previewMode 
          ? "relative w-full h-full flex items-center justify-center bg-black/60" 
          : "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm",
        isExiting ? "animate-fade-out" : "animate-fade-in"
      )}
      onClick={handleBackdropClick}
    >
      {isClaimed ? renderClaimedState() : renderUnclaimedState()}
    </div>
  );
}

export default PopupRedpacketTemplate;
