"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// SDK模板类型
type SDKTemplateType = 
  | "static_splash"      // 静态开屏
  | "video_splash"        // 视频开屏
  | "interstitial_half"   // 插屏-半屏
  | "interstitial_full"   // 插屏-全屏
  | "banner"              // 横幅
  | "native"              // 原生（信息流）
  | "rewarded_video";    // 激励视频

// 默认图片URL
const DEFAULT_IMAGES: Record<SDKTemplateType, string> = {
  static_splash: "/static-splash.png",
  video_splash: "/video-splash.mp4",
  interstitial_half: "/interstitial-half.png",
  interstitial_full: "/interstitial-full.png",
  banner: "/banner.png",
  native: "/native.png",
  rewarded_video: "/rewarded-video.mp4",
};

// ============================================
// 1. 静态开屏广告
// 尺寸：1080×1920 px，9:16
// 特点：大连五一风景图+跳过按钮
// ============================================
function StaticSplashStyle() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 背景图片 - 按9:16比例填满 */}
      <div className="absolute inset-0">
        <img 
          src={DEFAULT_IMAGES.static_splash} 
          alt="静态开屏"
          className="w-full h-full object-cover"
        />
        {/* 底部渐变遮罩 */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* 左上角：App Logo */}
      <div className="absolute top-1 left-0.5 w-2.5 h-2.5 bg-white/40 rounded flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-sm" />
      </div>

      {/* 右上角：跳过按钮 */}
      <div className="absolute top-1 right-0.5 px-1 py-0.5 bg-white/30 rounded text-white text-[6px]">
        跳过 5s
      </div>

      {/* 底部：标题和按钮 */}
      <div className="absolute bottom-3 left-0 right-0 text-center px-1">
        <h2 className="text-[8px] font-bold text-white drop-shadow">大连五一游</h2>
        <p className="text-[6px] text-white/90 mt-0.5">浪漫滨城</p>
        <button className="mt-1 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-full text-[6px]">
          查看详情
        </button>
      </div>
    </div>
  );
}

// ============================================
// 2. 视频开屏广告
// 尺寸：1080×1920 px，9:16
// 特点：大连五一人物图+跳过按钮+滑动引导
// ============================================
function VideoSplashStyle() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 背景图片 */}
      <div className="absolute inset-0">
        <img 
          src={DEFAULT_IMAGES.video_splash} 
          alt="视频开屏"
          className="w-full h-full object-cover opacity-80"
        />
        {/* 顶部渐变遮罩 */}
        <div className="absolute top-0 left-0 right-0 h-5 bg-gradient-to-b from-black/50 to-transparent" />
        {/* 底部渐变遮罩 */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      {/* 左上角：App Logo */}
      <div className="absolute top-1 left-0.5 w-2.5 h-2.5 bg-white/20 rounded flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-white/80 rounded-sm" />
      </div>

      {/* 右上角：跳过按钮 */}
      <div className="absolute top-1 right-0.5 px-1 py-0.5 bg-white/20 rounded text-white text-[6px]">
        跳过 5s
      </div>

      {/* 底部：滑动引导 */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="flex gap-0.5">
          <div className="w-1.5 h-0.5 bg-white/60 rounded" />
          <div className="w-1.5 h-0.5 bg-white/60 rounded" />
          <div className="w-1.5 h-0.5 bg-white/60 rounded" />
        </div>
        <span className="text-white/50 text-[5px] mt-0.5">上滑</span>
      </div>
    </div>
  );
}

// ============================================
// 3. 插屏广告 - 半屏
// 尺寸：1080×1920，广告居中，宽高比5:4
// 特点：大连五一横幅图+游戏卡片布局
// ============================================
function InterstitialHalfStyle() {
  return (
    <div className="relative w-full h-full bg-black/30 flex items-center justify-center">
      {/* 白色卡片弹窗 */}
      <div className="w-[85%] bg-white rounded-xl shadow-xl overflow-hidden">
        {/* 关闭按钮 */}
        <div className="absolute top-1 right-1 w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center z-10">
          <span className="text-gray-500 text-xs font-light leading-none">×</span>
        </div>

        {/* 背景图 */}
        <div className="w-full aspect-[5/4] relative">
          <img 
            src={DEFAULT_IMAGES.interstitial_half} 
            alt="插屏半屏"
            className="w-full h-full object-cover"
          />
          {/* 底部渐变 */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
          {/* 底部文字 */}
          <div className="absolute bottom-2 left-3 right-3">
            <h3 className="font-bold text-white text-[8px] drop-shadow">大连五一旅游季</h3>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="px-2 py-1.5 flex items-center justify-between">
          <span className="text-[6px] text-gray-400">Sponsored</span>
          <button className="px-2 py-0.5 bg-green-500 text-white text-[6px] rounded font-medium">
            查看
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 4. 插屏广告 - 全屏
// 尺寸：1080×1920 px，保留状态栏和Home指示器
// 特点：大连五一人物图+电竞风格
// ============================================
function InterstitialFullStyle() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 背景图片 */}
      <div className="absolute inset-0">
        <img 
          src={DEFAULT_IMAGES.interstitial_full} 
          alt="插屏全屏"
          className="w-full h-full object-cover"
        />
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
      </div>

      {/* 中央内容叠加 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* 标题 */}
        <h2 className="text-[10px] font-bold text-white text-center drop-shadow px-2">大连五一游</h2>
        {/* 描述文字 */}
        <p className="mt-1 text-[6px] text-white/90 text-center px-3">浪漫滨城 五一等你来</p>

        {/* 评分 */}
        <div className="mt-1 flex items-center gap-1">
          <span className="text-amber-400 text-[7px]">★★★★★</span>
        </div>

        {/* 按钮 */}
        <button className="absolute bottom-2 left-2 right-2 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded text-[6px] font-bold">
          立即查看
        </button>
      </div>

      {/* 底部信息 */}
      <div className="absolute bottom-0.5 right-1 text-[5px] text-white/30">
        广告
      </div>
    </div>
  );
}

// ============================================
// 5. 原生广告（信息流）
// 尺寸：宽度自适应，高度根据内容自适应
// 特点：大连横幅图+左文右图布局
// ============================================
function NativeStyle() {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-1">
      {/* 广告卡片 */}
      <div className="w-full bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex gap-1 p-1">
          {/* 左侧文字区 */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            {/* 顶部标签 */}
            <div className="flex items-center gap-1">
              <span className="text-[6px] text-gray-400">推荐</span>
              <span className="text-[6px] text-gray-400 bg-gray-100 px-0.5 rounded">Ad</span>
            </div>

            {/* 标题 */}
            <h3 className="text-[7px] font-bold text-gray-800 line-clamp-2 leading-tight">
              大连五一·海滨之旅
            </h3>

            {/* 描述 */}
            <p className="text-[6px] text-gray-400 leading-tight">蔚蓝海岸</p>

            {/* 底部 */}
            <div className="flex items-center justify-between">
              <span className="text-[6px] text-green-600">查看详情</span>
            </div>
          </div>

          {/* 右侧：图片 */}
          <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-orange-100 rounded overflow-hidden flex-shrink-0">
            <img 
              src={DEFAULT_IMAGES.native} 
              alt="原生信息流"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 6. 横幅广告 (Banner)
// 尺寸：320×50 dp
// 特点：大连横幅图+电商风格
// ============================================
function BannerStyle() {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-0.5">
      <div className="relative w-full h-[18px] bg-white border border-gray-200 rounded flex items-center overflow-hidden">
        {/* 背景图（半透明） */}
        <div className="absolute inset-0 opacity-20">
          <img 
            src={DEFAULT_IMAGES.banner} 
            alt="横幅"
            className="w-full h-full object-cover object-left"
          />
        </div>

        <div className="relative flex items-center gap-1 px-1 w-full">
          {/* 应用图标 */}
          <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[6px]">🏖️</span>
          </div>

          {/* 文字内容 */}
          <div className="flex-1 min-w-0">
            <h4 className="text-[7px] font-medium text-gray-800 truncate leading-tight">大连五一旅游</h4>
          </div>

          {/* 查看按钮 */}
          <button className="px-1 py-0.5 bg-blue-500 text-white text-[6px] rounded font-medium flex-shrink-0">
            查看
          </button>

          {/* 关闭按钮 */}
          <button className="w-3 h-3 text-gray-400 flex items-center justify-center flex-shrink-0">
            <span className="text-[8px] leading-none">×</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 7. 激励视频广告
// 尺寸：1080×1920 px
// 特点：大连风景图+金色横幅+倒计时角标
// ============================================
function RewardedVideoStyle() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : p + 1.5));
    }, 200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 背景图片 */}
      <div className="absolute inset-0">
        <img 
          src={DEFAULT_IMAGES.rewarded_video} 
          alt="激励视频"
          className="w-full h-full object-cover"
        />
        {/* 底部渐变 */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* 顶部：金色奖励横幅 */}
      <div className="absolute top-1 left-1 right-1">
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white text-center py-0.5 px-1 rounded text-[5px]">
          观看视频领取双倍金币
        </div>
      </div>

      {/* 右下角：倒计时角标 */}
      <div className="absolute bottom-3 right-0.5 px-1 py-0.5 bg-white/90 rounded text-[6px]">
        {Math.max(0, Math.floor((100 - progress) / 6.7))}s
      </div>

      {/* 底部：进度条 */}
      <div className="absolute bottom-2 left-1 right-1 flex items-center gap-1">
        <span className="text-[8px]">💎</span>
        <div className="flex-1 h-1 bg-white/60 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[6px] text-white font-bold">{progress}%</span>
      </div>

      {/* 视频结束画面 */}
      {progress >= 100 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <button className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded text-[7px] font-bold">
            点击领取奖励
          </button>
        </div>
      )}
    </div>
  );
}

// 模板样式映射
const TEMPLATE_STYLES: Record<SDKTemplateType, React.ComponentType> = {
  static_splash: StaticSplashStyle,
  video_splash: VideoSplashStyle,
  interstitial_half: InterstitialHalfStyle,
  interstitial_full: InterstitialFullStyle,
  banner: BannerStyle,
  native: NativeStyle,
  rewarded_video: RewardedVideoStyle,
};

// 模板信息
export const SDK_TEMPLATE_INFO_STYLES: Record<SDKTemplateType, { 
  name: string; 
  desc: string;
  size: string;
  ratio: string;
}> = {
  static_splash: { 
    name: "静态开屏", 
    desc: "静态图片展示的广告形式，1080×1920，9:16竖屏全屏",
    size: "1080×1920",
    ratio: "9:16"
  },
  video_splash: { 
    name: "视频开屏", 
    desc: "视频素材展示的广告形式，1080×1920，9:16竖屏全屏",
    size: "1080×1920",
    ratio: "9:16"
  },
  interstitial_half: { 
    name: "插屏-半屏", 
    desc: "半屏弹窗形式，1080×1920，居中显示，宽高比5:4",
    size: "1080×1920",
    ratio: "5:4"
  },
  interstitial_full: { 
    name: "插屏-全屏", 
    desc: "全屏沉浸式广告，1080×1920，保留状态栏和Home指示器",
    size: "1080×1920",
    ratio: "9:16"
  },
  banner: { 
    name: "横幅", 
    desc: "固定在屏幕底部的横幅广告，320×50",
    size: "320×50",
    ratio: "32:5"
  },
  native: { 
    name: "原生信息流", 
    desc: "融入内容信息流的原生广告，宽度自适应，高度根据内容",
    size: "自适应",
    ratio: "自适应"
  },
  rewarded_video: { 
    name: "激励视频", 
    desc: "用户主动观看以获取奖励的视频广告，1080×1920",
    size: "1080×1920",
    ratio: "9:16"
  },
};

// SDK模板样式展示组件
export function SDKTemplatesShowcase({ className }: { className?: string }) {
  const [activeTemplate, setActiveTemplate] = useState<SDKTemplateType>("static_splash");
  
  const TemplateComponent = TEMPLATE_STYLES[activeTemplate];
  const templateInfo = SDK_TEMPLATE_INFO_STYLES[activeTemplate];

  return (
    <div className={cn("w-full h-full flex flex-col", className)}>
      {/* 模板选择器 */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white overflow-x-auto">
        <div className="flex px-2 py-2 gap-1">
          {Object.entries(SDK_TEMPLATE_INFO_STYLES).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setActiveTemplate(key as SDKTemplateType)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                activeTemplate === key
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {info.name}
            </button>
          ))}
        </div>
      </div>

      {/* 样式展示区域 */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-100 overflow-auto">
        <div className="flex flex-col items-center gap-4">
          {/* 手机框架 */}
          <div className="relative">
            {/* 手机外框 */}
            <div className={cn(
              "bg-gray-900 rounded-[2rem] p-1.5 shadow-2xl",
              activeTemplate === "banner" ? "w-[200px]" : 
              activeTemplate === "native" ? "w-[200px]" : "w-[180px]"
            )}>
              <div className={cn(
                "bg-white rounded-[1.5rem] overflow-hidden relative",
                activeTemplate === "banner" ? "h-[32px]" : 
                activeTemplate === "native" ? "h-[60px]" : "h-[320px]"
              )}>
                {/* 状态栏 */}
                {activeTemplate !== "banner" && activeTemplate !== "native" && (
                  <div className="h-5 bg-white flex items-center justify-between px-4">
                    <span className="text-[9px] font-medium text-gray-900">9:41</span>
                    <div className="flex gap-0.5">
                      <div className="w-0.5 h-1 bg-gray-900 rounded-full" />
                      <div className="w-0.5 h-1 bg-gray-900 rounded-full" />
                      <div className="w-0.5 h-1 bg-gray-900 rounded-full" />
                    </div>
                  </div>
                )}

                {/* 模板内容 */}
                <div className={cn(
                  "w-full",
                  activeTemplate === "banner" || activeTemplate === "native" ? "h-full" : "flex-1"
                )}>
                  <TemplateComponent />
                </div>

                {/* 主页指示器 */}
                {activeTemplate !== "banner" && activeTemplate !== "native" && (
                  <div className="h-4 bg-white flex items-center justify-center">
                    <div className="w-16 h-0.5 bg-gray-300 rounded-full" />
                  </div>
                )}
              </div>
            </div>

            {/* 装饰：手机听筒 */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gray-700 rounded-full" />
          </div>

          {/* 模板信息 */}
          <div className="text-center">
            <h3 className="text-sm font-semibold text-gray-800">{templateInfo.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{templateInfo.size} · {templateInfo.ratio}</p>
            <p className="text-xs text-gray-400 mt-0.5 max-w-xs">{templateInfo.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 单独的模板样式卡片组件（用于列表展示）
export function SDKTemplateStyleCard({ 
  type, 
  className,
  showFrame = true 
}: { 
  type: SDKTemplateType; 
  className?: string;
  showFrame?: boolean;
}) {
  const TemplateComponent = TEMPLATE_STYLES[type];

  // 统一手机框架尺寸
  const phoneWidth = "w-[80px]";
  const phoneHeight = "h-[144px]";

  if (!showFrame) {
    return (
      <div className={cn("rounded-lg overflow-hidden", className)}>
        <TemplateComponent />
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-gray-900 rounded-xl p-1 shadow-lg flex items-center justify-center",
      phoneWidth
    )}>
      {/* 手机外框 */}
      <div className={cn(
        "bg-white rounded-lg overflow-hidden relative flex flex-col",
        phoneHeight
      )}>
        {/* 状态栏 */}
        <div className="h-2 bg-white flex items-center justify-between px-1.5 flex-shrink-0">
          <span className="text-[6px] text-gray-900">9:41</span>
          <div className="flex gap-0.5">
            <div className="w-0.5 h-1 bg-gray-900 rounded-full" />
            <div className="w-0.5 h-1 bg-gray-900 rounded-full" />
            <div className="w-0.5 h-1 bg-gray-900 rounded-full" />
          </div>
        </div>

        {/* 内容区域 - 自适应高度 */}
        <div className="flex-1 overflow-hidden">
          <TemplateComponent />
        </div>

        {/* 底部指示器 */}
        <div className="h-1.5 bg-white flex items-center justify-center flex-shrink-0">
          <div className="w-6 h-0.5 bg-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export { TEMPLATE_STYLES, SDK_TEMPLATE_INFO_STYLES, DEFAULT_IMAGES };
