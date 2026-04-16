"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// 配置数据类型
export interface PopupRedpacketConfig {
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
        "relative",
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
          "bg-white/20 hover:bg-white/30 transition-colors"
        )}
      >
        <X className="w-4 h-4 text-white" />
      </button>

      {/* 红包主体 */}
      <div className="relative w-[280px]">
        {/* 红包背景 - 精确颜色渐变 */}
        <div 
          className="w-full rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: "linear-gradient(180deg, #F24A30 0%, #E03A24 30%, #B92B19 100%)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
          }}
        >
          {/* 顶部装饰区域 - 卡通形象和金币红包 */}
          <div className="relative h-[100px]">
            {/* 卡通形象 - 坐姿元宝小人 */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0">
              {/* 身体（圆球形） */}
              <div 
                className="relative rounded-full"
                style={{
                  width: "70px",
                  height: "65px",
                  background: "linear-gradient(180deg, #FF7B4A 0%, #E85C3A 50%, #D44A28 100%)",
                }}
              >
                {/* 帽子 - 元宝形状 */}
                <div className="absolute -top-[18px] left-1/2 -translate-x-1/2">
                  {/* 帽子主体 */}
                  <div 
                    className="relative"
                    style={{
                      width: "40px",
                      height: "28px",
                      background: "linear-gradient(180deg, #FFE066 0%, #FFD230 50%, #E6B820 100%)",
                      borderRadius: "50% 50% 50% 50% / 80% 80% 20% 20%",
                      border: "2px solid #A67A10",
                    }}
                  >
                    {/* 帽子高光 */}
                    <div 
                      className="absolute top-1 left-1 w-3 h-2 rounded-full opacity-60"
                      style={{ background: "#FFF5CC" }}
                    />
                    {/* 人民币符号 */}
                    <span 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#8B6914] font-bold"
                      style={{ fontSize: "12px" }}
                    >
                      ¥
                    </span>
                  </div>
                  {/* 帽子顶部 */}
                  <div 
                    className="absolute -top-2 left-1/2 -translate-x-1/2"
                    style={{
                      width: "20px",
                      height: "15px",
                      background: "linear-gradient(180deg, #FFE066 0%, #FFD230 100%)",
                      borderRadius: "50% 50% 20% 20% / 100% 100% 0% 0%",
                      border: "2px solid #A67A10",
                      borderBottom: "none",
                    }}
                  />
                </div>

                {/* 眼睛 */}
                <div className="absolute top-[18px] left-[14px]">
                  {/* 左眼 */}
                  <div 
                    className="absolute rounded-full"
                    style={{
                      width: "10px",
                      height: "10px",
                      background: "#5C2E10",
                    }}
                  >
                    {/* 眼睛高光 */}
                    <div 
                      className="absolute top-0.5 left-0.5 w-2 h-2 rounded-full opacity-80"
                      style={{ background: "white" }}
                    />
                  </div>
                  {/* 右眼 */}
                  <div 
                    className="absolute left-[36px] rounded-full"
                    style={{
                      width: "10px",
                      height: "10px",
                      background: "#5C2E10",
                    }}
                  >
                    {/* 眼睛高光 */}
                    <div 
                      className="absolute top-0.5 left-0.5 w-2 h-2 rounded-full opacity-80"
                      style={{ background: "white" }}
                    />
                  </div>
                  {/* 眉毛 */}
                  <div 
                    className="absolute -top-0.5 left-[12px] w-4 h-1 rounded-full"
                    style={{ background: "#5C2E10" }}
                  />
                  <div 
                    className="absolute -top-0.5 left-[44px] w-4 h-1 rounded-full"
                    style={{ background: "#5C2E10" }}
                  />
                </div>

                {/* 腮红 */}
                <div 
                  className="absolute top-[28px] left-[6px] w-6 h-3 rounded-full opacity-70"
                  style={{ background: "#FFB4B4" }}
                />
                <div 
                  className="absolute top-[28px] right-[6px] w-6 h-3 rounded-full opacity-70"
                  style={{ background: "#FFB4B4" }}
                />

                {/* 嘴巴 */}
                <div 
                  className="absolute bottom-[10px] left-1/2 -translate-x-1/2"
                  style={{ width: "24px", height: "16px" }}
                >
                  {/* 嘴型 */}
                  <div 
                    className="absolute inset-0 rounded-b-full"
                    style={{ background: "#E85C5C" }}
                  >
                    {/* 牙齿 */}
                    <div 
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-3 rounded-t-full"
                      style={{ background: "white" }}
                    />
                    {/* 舌头 */}
                    <div 
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-2 rounded-b-full"
                      style={{ background: "#FF6B6B" }}
                    />
                  </div>
                </div>

                {/* 手臂 - 红色细手臂扒着边缘 */}
                <div 
                  className="absolute -left-3 top-[25px]"
                  style={{
                    width: "12px",
                    height: "20px",
                    background: "linear-gradient(180deg, #E03A24 0%, #C52E1A 100%)",
                    borderRadius: "6px 6px 0 0",
                    transform: "rotate(-30deg)",
                  }}
                />
                <div 
                  className="absolute -right-3 top-[25px]"
                  style={{
                    width: "12px",
                    height: "20px",
                    background: "linear-gradient(180deg, #E03A24 0%, #C52E1A 100%)",
                    borderRadius: "6px 6px 0 0",
                    transform: "rotate(30deg)",
                  }}
                />
              </div>
            </div>

            {/* 左侧小红包 */}
            <div 
              className="absolute left-[18%] bottom-[8px] rounded-lg overflow-hidden"
              style={{
                width: "28px",
                height: "36px",
                background: "linear-gradient(180deg, #F24A30 0%, #E03A24 100%)",
                transform: "rotate(-15deg)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              {/* 小红包封口线 */}
              <div 
                className="absolute top-[10px] left-0 right-0 h-[2px]"
                style={{ background: "#B92B19" }}
              />
              {/* 小红包上的¥符号 */}
              <div 
                className="absolute top-[14px] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full"
                style={{ background: "#FFD230" }}
              >
                <span className="absolute inset-0 flex items-center justify-center text-[#8B6914] text-[8px] font-bold">¥</span>
              </div>
            </div>

            {/* 左侧金币1 */}
            <div 
              className="absolute left-[30%] bottom-[5px]"
              style={{
                width: "16px",
                height: "16px",
                background: "linear-gradient(135deg, #FFE066 0%, #FFD230 50%, #E6B820 100%)",
                borderRadius: "50%",
                border: "1px solid #A67A10",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              }}
            >
              {/* 金币高光 */}
              <div 
                className="absolute top-0.5 left-0.5 w-2 h-2 rounded-full opacity-60"
                style={{ background: "white" }}
              />
            </div>

            {/* 左侧金币2 */}
            <div 
              className="absolute left-[36%] bottom-[18px]"
              style={{
                width: "14px",
                height: "14px",
                background: "linear-gradient(135deg, #FFE066 0%, #FFD230 50%, #E6B820 100%)",
                borderRadius: "50%",
                border: "1px solid #A67A10",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              <div className="absolute top-0.5 left-0.5 w-2 h-2 rounded-full opacity-60" style={{ background: "white" }} />
            </div>

            {/* 右侧小红包 */}
            <div 
              className="absolute right-[18%] bottom-[8px] rounded-lg overflow-hidden"
              style={{
                width: "28px",
                height: "36px",
                background: "linear-gradient(180deg, #F24A30 0%, #E03A24 100%)",
                transform: "rotate(15deg)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              <div className="absolute top-[10px] left-0 right-0 h-[2px]" style={{ background: "#B92B19" }} />
              <div className="absolute top-[14px] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full" style={{ background: "#FFD230" }}>
                <span className="absolute inset-0 flex items-center justify-center text-[#8B6914] text-[8px] font-bold">¥</span>
              </div>
            </div>

            {/* 右侧金币1 */}
            <div 
              className="absolute right-[30%] bottom-[5px]"
              style={{
                width: "16px",
                height: "16px",
                background: "linear-gradient(135deg, #FFE066 0%, #FFD230 50%, #E6B820 100%)",
                borderRadius: "50%",
                border: "1px solid #A67A10",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              }}
            >
              <div className="absolute top-0.5 left-0.5 w-2 h-2 rounded-full opacity-60" style={{ background: "white" }} />
            </div>

            {/* 右侧金币2 */}
            <div 
              className="absolute right-[36%] bottom-[18px]"
              style={{
                width: "14px",
                height: "14px",
                background: "linear-gradient(135deg, #FFE066 0%, #FFD230 50%, #E6B820 100%)",
                borderRadius: "50%",
                border: "1px solid #A67A10",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              <div className="absolute top-0.5 left-0.5 w-2 h-2 rounded-full opacity-60" style={{ background: "white" }} />
            </div>

            {/* 最右侧金币 */}
            <div 
              className="absolute right-[25%] bottom-[25px]"
              style={{
                width: "12px",
                height: "12px",
                background: "linear-gradient(135deg, #FFE066 0%, #FFD230 50%, #E6B820 100%)",
                borderRadius: "50%",
                border: "1px solid #A67A10",
              }}
            >
              <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full opacity-60" style={{ background: "white" }} />
            </div>

            {/* 翻盖褶皱线 */}
            <div 
              className="absolute top-[55px] left-0 right-0 h-[3px]"
              style={{
                background: "linear-gradient(90deg, transparent 0%, #B92B19 20%, #8B1A1A 50%, #B92B19 80%, transparent 100%)",
              }}
            />
          </div>

          {/* 领取按钮区域 */}
          <div className="flex items-center justify-center py-12">
            {/* 金色领取按钮 */}
            <button
              onClick={handleOpen}
              className={cn(
                "relative rounded-full",
                "hover:scale-105 active:scale-95 transition-transform",
                "animate-pulse-subtle"
              )}
              style={{
                width: "100px",
                height: "100px",
                background: "linear-gradient(180deg, #FFE270 0%, #FFB730 40%, #E69A20 100%)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -2px 4px rgba(166,106,21,0.5)",
                border: "2px solid #A66A15",
              }}
            >
              {/* 按钮高光 */}
              <div 
                className="absolute top-3 left-1/2 -translate-x-1/2 w-[60px] h-[20px] rounded-full opacity-40"
                style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.8) 0%, transparent 100%)" }}
              />
              {/* 按钮文字 */}
              <span 
                className="absolute inset-0 flex items-center justify-center font-bold"
                style={{ 
                  color: "#A66A15", 
                  fontSize: "42px",
                  fontFamily: "sans-serif",
                  textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                }}
              >
                领
              </span>
            </button>
          </div>

          {/* 底部留白 */}
          <div className="h-8" />
        </div>

        {/* 红包边缘光泽 */}
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        />
      </div>
    </div>
  );

  // 渲染已领取状态（领奖页面）
  const renderClaimedState = () => (
    <div
      className={cn(
        "relative w-[280px]",
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
              className="flex items-center justify-center mb-4"
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
          ? "relative w-full h-full flex items-center justify-center" 
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
