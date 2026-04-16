"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// 配置数据类型
export interface PopupRedpacketConfig {
  // 红包图片
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
  const [isEntered, setIsEntered] = useState(false);
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
    redpacketImageUrl: resolveMacro(finalConfig.redpacketImageUrl, finalConfig.macroVariables),
  };

  // 入场动画
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsOpening(true);
      setIsClaimed(false);
      setIsExiting(false);
      setIsEntered(false);
      // 入场动画完成后切换到循环动画
      setTimeout(() => {
        setIsOpening(false);
        setIsEntered(true);
      }, 800);
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
        "relative",
        isOpening
          ? "animate-popup-enter"
          : isEntered
          ? "animate-popup-loop"
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
          "bg-white/20 hover:bg-white/30 transition-colors"
        )}
      >
        <X className="w-4 h-4 text-white" />
      </button>

      {/* 红包主体 - 使用用户上传的图片 */}
      <div className="relative w-full max-w-[300px]">
        {resolvedConfig.redpacketImageUrl ? (
          // 使用用户上传的红包图片
          <div 
            className="relative overflow-hidden rounded-2xl"
            style={{
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            }}
          >
            <img
              src={resolvedConfig.redpacketImageUrl}
              alt="红包"
              className="w-full h-auto object-contain"
            />
            {/* 点击区域遮罩 - 覆盖整个红包可点击 */}
            <div 
              className="absolute inset-0 cursor-pointer"
              onClick={handleOpen}
            />
          </div>
        ) : (
          // 无图片时的占位提示
          <div 
            className="flex flex-col items-center justify-center rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(180deg, #F24A30 0%, #E03A24 50%, #B92B19 100%)",
              minHeight: "400px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
            }}
          >
            <p className="text-white/80 text-sm mb-4">请上传红包图片</p>
            <button
              onClick={handleOpen}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-full text-white font-medium"
            >
              点击预览效果
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // 渲染已领取状态（领奖页面）
  const renderClaimedState = () => (
    <div
      className={cn(
        "relative w-full max-w-[300px]",
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
        className="rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #FFF5E6 0%, #FFE4CC 100%)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
        }}
      >
        {/* 标题 */}
        <div className="text-center pt-6 pb-4">
          <h3 
            className="font-semibold"
            style={{ color: "#333", fontSize: "18px" }}
          >
            恭喜获得
          </h3>
        </div>

        {/* 奖励内容 */}
        <div className="px-6 pb-4">
          {finalConfig.rewardType === "cash" ? (
            // 现金奖励
            <div 
              className="flex items-center justify-center mb-4 animate-reward-pop"
              style={{
                background: "linear-gradient(180deg, #FFD230 0%, #FFA500 100%)",
                borderRadius: "12px",
                padding: "16px 24px",
                boxShadow: "0 4px 12px rgba(255,165,0,0.3)",
              }}
            >
              <span 
                className="font-bold"
                style={{ color: "white", fontSize: "36px", textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
              >
                ¥
              </span>
              <span 
                className="font-bold ml-1"
                style={{ color: "white", fontSize: "36px", textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}
              >
                {resolvedConfig.cashAmount}
              </span>
            </div>
          ) : (
            // 自定义奖励图片
            finalConfig.rewardImageUrl && (
              <img
                src={finalConfig.rewardImageUrl}
                alt="奖励图片"
                className="w-full aspect-video object-contain rounded-lg mb-4"
              />
            )
          )}

          {/* 奖品文案 */}
          <p 
            className="text-center mb-3"
            style={{ color: "#333", fontSize: "14px", fontWeight: 500 }}
          >
            {resolvedConfig.rewardText}
          </p>

          {/* 特殊说明 */}
          <p 
            className="text-center mb-4"
            style={{ color: "#E85D5A", fontSize: "12px" }}
          >
            {resolvedConfig.specialNote}
          </p>

          {/* 领取按钮 */}
          <button
            onClick={handleClaim}
            className={cn(
              "w-full py-3 rounded-xl text-white font-semibold",
              "hover:opacity-90 active:scale-[0.98] transition-all"
            )}
            style={{
              background: "linear-gradient(180deg, #FF6B6B 0%, #FF4757 100%)",
              boxShadow: "0 4px 12px rgba(255,71,87,0.4)",
              fontSize: "14px",
            }}
          >
            领取奖品
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        previewMode
          ? "relative w-full h-full flex items-center justify-center bg-gradient-to-b from-[#1a0a2e] to-[#2d1b4e]"
          : "fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[#1a0a2e] to-[#2d1b4e]",
        isExiting ? "animate-fade-out" : "animate-fade-in"
      )}
      onClick={handleBackdropClick}
    >
      {isClaimed ? renderClaimedState() : renderUnclaimedState()}
    </div>
  );
}

export default PopupRedpacketTemplate;
