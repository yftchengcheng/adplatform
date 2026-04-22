"use client";

import React, { useState, useCallback, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// SDK模板类型
type SDKTemplateType = 
  | "static_splash"
  | "video_splash"
  | "interstitial_half"
  | "interstitial_full"
  | "banner"
  | "native"
  | "rewarded_video";

// 默认图片URL
const DEFAULT_IMAGES: Record<string, string> = {
  static_splash: "/static-splash.png",
  video_splash: "/video-splash.mp4",
  interstitial_half: "/interstitial-half.png",
  interstitial_full: "/interstitial-full.png",
  banner: "/banner.png",
  native: "/native.png",
  rewarded_video: "/rewarded-video.mp4",
};

// SDK模板信息
const SDK_TEMPLATE_NAMES: Record<string, string> = {
  static_splash: "静态开屏",
  video_splash: "视频开屏",
  interstitial_half: "插屏-半屏",
  interstitial_full: "插屏-全屏",
  banner: "横幅",
  native: "原生信息流",
  rewarded_video: "激励视频",
};

// SDK模板尺寸
const SDK_TEMPLATE_SIZES: Record<string, { width: number; height: number }> = {
  static_splash: { width: 1080, height: 1920 },
  video_splash: { width: 1080, height: 1920 },
  interstitial_half: { width: 600, height: 500 },
  interstitial_full: { width: 1080, height: 1920 },
  banner: { width: 320, height: 50 },
  native: { width: 540, height: 200 },
  rewarded_video: { width: 1080, height: 1920 },
};

interface RealAdPreviewProps {
  templateType: string;
  templateName?: string;
  className?: string;
  onClick?: () => void;
}

export function RealAdPreview({
  templateType,
  templateName,
  className,
  onClick,
}: RealAdPreviewProps) {
  const defaultImage = DEFAULT_IMAGES[templateType];
  const templateSize = SDK_TEMPLATE_SIZES[templateType] || { width: 540, height: 960 };
  const displayName = templateName || SDK_TEMPLATE_NAMES[templateType] || "广告模板";
  const isVideoType = templateType === "video_splash" || templateType === "rewarded_video";

  // 计算缩放比例以适应容器
  const scaleToFit = (containerWidth: number, containerHeight: number) => {
    const scaleX = containerWidth / templateSize.width;
    const scaleY = containerHeight / templateSize.height;
    return Math.min(scaleX, scaleY, 1);
  };

  return (
    <div 
      className={cn(
        "relative w-full h-full bg-gray-900 overflow-hidden cursor-pointer",
        onClick && "hover:opacity-90 transition-opacity",
        className
      )}
      onClick={onClick}
    >
      {/* 图片或视频 */}
      {isVideoType ? (
        <video
          src={defaultImage}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          loop
          playsInline
        />
      ) : (
        <img
          src={defaultImage}
          alt={displayName}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* 底部遮罩 */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

      {/* 模板名称 */}
      <div className="absolute bottom-1 left-1 right-1">
        <p className="text-white text-[8px] font-medium truncate">{displayName}</p>
      </div>

      {/* 点击提示 */}
      {onClick && (
        <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-xs bg-black/50 px-2 py-1 rounded">点击查看</span>
        </div>
      )}
    </div>
  );
}

// 全屏预览弹窗组件
interface FullscreenPreviewModalProps {
  templateType: string;
  templateName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function FullscreenPreviewModal({
  templateType,
  templateName,
  isOpen,
  onClose,
}: FullscreenPreviewModalProps) {
  const defaultImage = DEFAULT_IMAGES[templateType];
  const templateSize = SDK_TEMPLATE_SIZES[templateType] || { width: 540, height: 960 };
  const displayName = templateName || SDK_TEMPLATE_NAMES[templateType] || "广告模板";
  const isVideoType = templateType === "video_splash" || templateType === "rewarded_video";
  
  // 这些类型不需要手机框架，直接展示内容
  const isSpecialType = templateType === "interstitial_half" || templateType === "banner" || templateType === "native";
  
  // 倒计时状态
  const [countdown, setCountdown] = useState(5);
  const [currentTime, setCurrentTime] = useState("9:41");
  
  // 重置倒计时
  const resetCountdown = useCallback(() => {
    setCountdown(5);
  }, []);
  
  // 倒计时逻辑
  useEffect(() => {
    if (!isOpen) return;
    
    resetCountdown();
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isOpen, resetCountdown]);
  
  // 更新时间（模拟）
  useEffect(() => {
    if (!isOpen) return;
    
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  // 渲染内容区域（无倒计时，用于特殊类型）
  const renderSpecialContent = () => (
    <>
      {/* 图片或视频 */}
      {isVideoType ? (
        <video
          src={defaultImage}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          loop
          playsInline
          autoPlay
        />
      ) : (
        <img
          src={defaultImage}
          alt={displayName}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </>
  );

  // 渲染内容区域（带倒计时）
  const renderContent = () => (
    <>
      {/* 图片或视频 */}
      {isVideoType ? (
        <video
          src={defaultImage}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          loop
          playsInline
          autoPlay
        />
      ) : (
        <img
          src={defaultImage}
          alt={displayName}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* 底部渐变遮罩 */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

      {/* 跳过按钮 */}
      <button 
        onClick={onClose}
        className="absolute top-3 right-3 px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-colors"
      >
        <span className="text-white/80 text-xs">
          {countdown > 0 ? `跳过 ${countdown}s` : "跳过"}
        </span>
      </button>

      {/* 关闭按钮 */}
      <button 
        onClick={onClose}
        className="absolute top-3 left-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white/80 hover:bg-black/70"
      >
        <X className="w-4 h-4" />
      </button>

      {/* 底部文字 */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <h2 className="text-lg font-bold text-white">{displayName}</h2>
        <p className="text-xs text-white/80 mt-1">点击查看详情</p>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="relative w-full max-w-sm mx-auto">
        {/* 特殊类型：直接展示内容，不显示手机框架 */}
        {isSpecialType ? (
          <div 
            className="bg-white rounded-xl overflow-hidden relative shadow-2xl"
            style={{ 
              // 根据类型设置合适的尺寸
              ...(templateType === "banner" && { 
                width: "320px", 
                height: "50px" 
              }),
              ...(templateType === "interstitial_half" && { 
                width: "300px",
                aspectRatio: "6/5"
              }),
              ...(templateType === "native" && { 
                width: "270px",
                aspectRatio: "27/10"
              })
            }}
          >
            {renderSpecialContent()}
          </div>
        ) : (
          /* 手机框架 */
          <div className="bg-gray-900 rounded-[2rem] p-1.5 shadow-2xl">
            {/* 状态栏 */}
            <div className="h-5 bg-white rounded-t-[1.2rem] flex items-center justify-between px-4">
              <span className="text-[9px] font-medium text-gray-900">{currentTime}</span>
              <div className="flex gap-0.5">
                <div className="w-0.5 h-1 bg-gray-900 rounded-full" />
                <div className="w-0.5 h-1 bg-gray-900 rounded-full" />
                <div className="w-0.5 h-1 bg-gray-900 rounded-full" />
              </div>
            </div>

            {/* 内容 */}
            <div 
              className="bg-white rounded-[1rem] overflow-hidden relative"
              style={{ aspectRatio: `${templateSize.width}/${templateSize.height}` }}
            >
              {renderContent()}
            </div>

            {/* 主页指示器 */}
            <div className="h-4 bg-white rounded-b-[1.2rem] flex items-center justify-center">
              <div className="w-16 h-0.5 bg-gray-300 rounded-full" />
            </div>
          </div>
        )}

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 模板信息 */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-white/60 text-xs">
          {templateSize.width}×{templateSize.height} · {displayName}
        </p>
      </div>
    </div>
  );
}

export default RealAdPreview;
