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
  const displayName = templateName || SDK_TEMPLATE_NAMES[templateType] || "广告模板";
  const isVideoType = templateType === "video_splash" || templateType === "rewarded_video";

  // 横幅广告：在手机底部展示
  if (templateType === "banner") {
    return (
      <div 
        className={cn(
          "relative w-full h-full overflow-hidden cursor-pointer",
          onClick && "hover:opacity-90 transition-opacity",
          className
        )}
        onClick={onClick}
      >
        {/* 模拟应用内容背景 */}
        <div className="absolute inset-0 bg-gray-100">
          <div className="h-3 bg-white flex items-center px-1">
            <span className="text-[4px] text-gray-900">9:41</span>
          </div>
          <div className="p-1 space-y-0.5">
            <div className="h-1 bg-gray-200 rounded w-3/4" />
            <div className="h-1 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-1 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-1 bg-gray-200 rounded w-4/5" />
          </div>
        </div>
        {/* 横幅广告 - 固定在底部 */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="relative">
            <img src={defaultImage} alt={displayName} className="w-full h-auto" />
            {/* 关闭按钮 - 素材右上角 */}
            <button
              onClick={(e) => { e.stopPropagation(); }}
              className="absolute top-0.5 right-0.5 w-3 h-3 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70"
            >
              <span className="text-white/80 text-[8px] leading-none">x</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 插屏半屏：居中弹窗展示
  if (templateType === "interstitial_half") {
    return (
      <div 
        className={cn(
          "relative w-full h-full overflow-hidden cursor-pointer",
          onClick && "hover:opacity-90 transition-opacity",
          className
        )}
        onClick={onClick}
      >
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <img src={defaultImage} alt={displayName} className="w-[80%] h-auto rounded shadow-lg" />
        </div>
      </div>
    );
  }

  // 原生信息流：在内容流中展示
  if (templateType === "native") {
    return (
      <div 
        className={cn(
          "relative w-full h-full overflow-hidden cursor-pointer",
          onClick && "hover:opacity-90 transition-opacity",
          className
        )}
        onClick={onClick}
      >
        <div className="absolute inset-0 bg-gray-50">
          <div className="h-3 bg-white flex items-center px-1">
            <span className="text-[4px] text-gray-900">9:41</span>
          </div>
          <div className="p-1 space-y-0.5">
            <div className="h-1 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded" />
            <div className="relative">
              <img src={defaultImage} alt={displayName} className="w-full h-auto rounded shadow-sm" />
              {/* 关闭按钮 */}
              <button
                onClick={(e) => { e.stopPropagation(); }}
                className="absolute top-0.5 right-0.5 w-3 h-3 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70"
              >
                <span className="text-white/80 text-[8px] leading-none">x</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 激励视频：在手机框架内展示完整UI（进度、倒计时、奖励）
  if (templateType === "rewarded_video") {
    return (
      <div
        className={cn(
          "relative w-full h-full overflow-hidden cursor-pointer bg-black",
          onClick && "hover:opacity-90 transition-opacity",
          className
        )}
        onClick={onClick}
      >
        {/* 视频背景 */}
        <video
          src={defaultImage}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          loop
          playsInline
        />
        {/* 底部渐变 */}
        <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/40 to-transparent" />

        {/* 顶部：金色横幅 */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-white text-center py-0.5 px-2 rounded-full shadow border border-amber-300/30">
            <p className="text-[5px] font-semibold whitespace-nowrap">观看视频领取双倍金币</p>
          </div>
        </div>

        {/* 右下角：倒计时角标 */}
        <div className="absolute bottom-8 right-1 z-20">
          <div className="bg-white/90 rounded px-1 py-0.5 shadow">
            <p className="text-gray-800 text-[5px] font-medium">15s后</p>
          </div>
        </div>

        {/* 底部左侧：钻石 */}
        <div className="absolute bottom-1 left-1 z-20">
          <div className="bg-white/25 backdrop-blur-sm rounded px-1 py-0.5">
            <div className="flex items-center gap-0.5">
              <span className="text-[6px]">💎</span>
              <span className="text-white text-[6px] font-bold">×50</span>
            </div>
          </div>
        </div>

        {/* 底部进度条 */}
        <div className="absolute bottom-1 right-1 left-8 z-20">
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-1 py-0.5 border border-white/20">
            <div className="flex items-center gap-0.5">
              <span className="text-white/80 text-[4px]">▶</span>
              <div className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full" />
              </div>
              <span className="text-white/90 text-[4px] font-medium">67%</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 全屏类型：填满整个区域
  return (
    <div 
      className={cn(
        "relative w-full h-full bg-gray-900 overflow-hidden cursor-pointer",
        onClick && "hover:opacity-90 transition-opacity",
        className
      )}
      onClick={onClick}
    >
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
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-1 left-1 right-1">
        <p className="text-white text-[8px] font-medium truncate">{displayName}</p>
      </div>
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

  const phoneWidth = "270px";
  const phoneHeight = "540px";

  const [countdown, setCountdown] = useState(5);

  const resetCountdown = useCallback(() => {
    setCountdown(5);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    resetCountdown();
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, resetCountdown]);

  if (!isOpen) return null;

  // 判断是否为特殊类型（需要场景化展示）
  const isSpecialType = templateType === "banner" || templateType === "interstitial_half" || templateType === "native" || templateType === "rewarded_video";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="relative w-full max-w-sm mx-auto">
        {/* 完整手机框架 */}
        <div 
          className="relative mx-auto bg-gray-900 rounded-[3rem] p-2 shadow-2xl"
          style={{ width: phoneWidth, height: phoneHeight }}
        >
          <div className="relative w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
            {/* 刘海区域 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-gray-900 rounded-b-2xl z-10" />

            {/* 内容区域 */}
            <div className="relative w-full h-full overflow-hidden bg-gray-100">
              {/* 横幅广告 - 手机底部展示 */}
              {templateType === "banner" && (
                <>
                  <div className="absolute inset-0 bg-gray-50">
                    <div className="h-8 bg-white flex items-center justify-between px-4 pt-2">
                      <span className="text-[10px] text-gray-900 font-medium">9:41</span>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-2.5 bg-gray-900 rounded-full" />
                        <div className="w-1.5 h-2.5 bg-gray-900 rounded-full" />
                        <div className="w-1.5 h-2.5 bg-gray-900 rounded-full" />
                      </div>
                    </div>
                    <div className="p-3 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-16 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="h-16 bg-gray-200 rounded" />
                      <div className="h-4 bg-gray-200 rounded w-4/5" />
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-0 right-0">
                    <div className="relative">
                      <img src={defaultImage} alt={displayName} className="w-full h-auto" />
                      {/* 关闭按钮 - 素材右上角 */}
                      <button
                        onClick={onClose}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white/80 hover:bg-black/70"
                      >
                        <span className="text-white/80 text-xs leading-none">x</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* 插屏半屏 - 居中弹窗 */}
              {templateType === "interstitial_half" && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="relative w-[75%] overflow-hidden rounded-lg shadow-xl">
                    <img src={defaultImage} alt={displayName} className="w-full h-auto" />
                    <button
                      onClick={onClose}
                      className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white/80 hover:bg-black/70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* 原生信息流 - 在内容流中展示 */}
              {templateType === "native" && (
                <div className="absolute inset-0 bg-gray-50">
                  <div className="h-8 bg-white flex items-center justify-between px-4 pt-2">
                    <span className="text-[10px] text-gray-900 font-medium">9:41</span>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-2.5 bg-gray-900 rounded-full" />
                      <div className="w-1.5 h-2.5 bg-gray-900 rounded-full" />
                      <div className="w-1.5 h-2.5 bg-gray-900 rounded-full" />
                    </div>
                  </div>
                  <div className="p-3 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-16 bg-gray-200 rounded" />
                    {/* 原生广告卡片 */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden relative">
                      <img src={defaultImage} alt={displayName} className="w-full h-auto" />
                      {/* 关闭按钮 */}
                      <button
                        onClick={onClose}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white/80 hover:bg-black/70"
                      >
                        <span className="text-white/80 text-xs leading-none">x</span>
                      </button>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-16 bg-gray-200 rounded" />
                  </div>
                </div>
              )}

              {/* 激励视频 - 在手机框架内展示完整UI */}
              {templateType === "rewarded_video" && (
                <div className="absolute inset-0 bg-black">
                  {/* 视频背景 */}
                  <video
                    src={defaultImage}
                    className="absolute inset-0 w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                    autoPlay
                  />
                  {/* 底部渐变 */}
                  <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/40 to-transparent" />

                  {/* 顶部：金色横幅 */}
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
                    <div className="relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-300/50 via-yellow-300/50 to-amber-400/50 rounded-full blur-sm" />
                      <div className="relative bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-white text-center py-1.5 px-5 rounded-full shadow-lg border border-amber-300/30">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs">🎁</span>
                          <p className="text-[9px] font-semibold whitespace-nowrap">观看视频以领取双倍金币奖励</p>
                          <span className="text-xs">🎁</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 右下角：倒计时角标 - 白底黑字圆角矩形 */}
                  <div className="absolute bottom-20 right-3 z-20">
                    <div className="bg-white/90 backdrop-blur-md rounded-lg px-2.5 py-1 shadow-lg border border-white/50">
                      <p className="text-gray-800 text-[9px] font-medium">15s后可领取</p>
                    </div>
                  </div>

                  {/* 底部左侧：钻石计数 */}
                  <div className="absolute bottom-6 left-3 z-20">
                    <div className="bg-white/25 backdrop-blur-md rounded-xl px-2.5 py-1.5 shadow-lg border border-white/30">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">💎</span>
                        <span className="text-white text-xs font-bold drop-shadow-md">×50</span>
                      </div>
                      <div className="mt-1 w-12 h-1 bg-white/30 rounded-full overflow-hidden">
                        <div className="h-full w-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* 底部右侧：视频进度条 */}
                  <div className="absolute bottom-6 right-3 left-20 z-20">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 border border-white/20">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white/80 text-[8px]">▶️</span>
                        <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                          <div className="h-full w-2/3 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full" />
                        </div>
                        <span className="text-white/90 text-[8px] font-medium">67%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 全屏类型 - 填满整个内容区 */}
              {!isSpecialType && (
                <>
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
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
                  {/* 跳过按钮 - 只对静态开屏和视频开屏显示 */}
                  {!["interstitial_full", "rewarded_video"].includes(templateType) && (
                    <button
                      onClick={onClose}
                      className="absolute top-8 right-3 px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-colors"
                    >
                      <span className="text-white/80 text-xs">
                        {countdown > 0 ? `跳过 ${countdown}s` : "跳过"}
                      </span>
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="absolute top-8 left-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white/80 hover:bg-black/70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-8 left-0 right-0 text-center">
                    <h2 className="text-lg font-bold text-white">{displayName}</h2>
                    <p className="text-xs text-white/80 mt-1">点击查看详情</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 右侧按钮（音量键） */}
          <div className="absolute -right-2 top-32 flex flex-col gap-2">
            <div className="w-1 h-8 bg-gray-700 rounded" />
            <div className="w-1 h-12 bg-gray-700 rounded" />
          </div>
          {/* 左侧按钮（电源键） */}
          <div className="absolute -left-2 top-28 flex flex-col gap-2">
            <div className="w-1 h-10 bg-gray-700 rounded" />
          </div>
        </div>

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
