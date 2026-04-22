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
    <div className="relative w-full h-full bg-gradient-to-br from-sky-200 via-blue-100 to-sky-300 overflow-hidden">
      {/* 背景图片 */}
      <div className="absolute inset-0">
        <img 
          src={DEFAULT_IMAGES.static_splash} 
          alt="静态开屏"
          className="w-full h-full object-cover"
        />
        {/* 底部渐变遮罩，确保底部内容可读 */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* 左上角：App Logo */}
      <div className="absolute top-10 left-4 w-10 h-10 bg-white/40 backdrop-blur-sm rounded-xl flex items-center justify-center">
        <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg" />
      </div>

      {/* 右上角：跳过按钮 */}
      <div className="absolute top-10 right-4 px-3 py-1.5 bg-white/30 backdrop-blur-sm rounded-full">
        <span className="text-white/90 text-xs font-light tracking-wide">跳过 5s</span>
      </div>

      {/* 底部：标题和按钮 */}
      <div className="absolute bottom-16 left-0 right-0 text-center px-4">
        {/* 主标题 */}
        <h2 className="text-2xl font-bold text-white tracking-wide drop-shadow-lg">大连五一游</h2>
        {/* 副标题 */}
        <p className="text-sm text-white/90 mt-1 drop-shadow">浪漫滨城 欢乐假期</p>
        {/* 金色胶囊按钮 */}
        <button className="mt-4 px-8 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-full shadow-lg text-sm font-medium">
          查看详情
        </button>
      </div>

      {/* 底部：导航指示器 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/50 rounded-full" />
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
    <div className="relative w-full h-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 overflow-hidden">
      {/* 背景图片 */}
      <div className="absolute inset-0">
        <img 
          src={DEFAULT_IMAGES.video_splash} 
          alt="视频开屏"
          className="w-full h-full object-cover opacity-80"
        />
        {/* 顶部渐变遮罩 */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/50 to-transparent" />
        {/* 底部渐变遮罩 */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* 左上角：App Logo */}
      <div className="absolute top-10 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
        <div className="w-6 h-6 bg-white/80 rounded-lg" />
      </div>

      {/* 右上角：跳过按钮 */}
      <div className="absolute top-10 right-4 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
        <span className="text-white/80 text-xs">跳过 5s | 静音</span>
      </div>

      {/* 底部：滑动引导条 */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <div className="flex gap-1.5">
          <div className="w-5 h-0.5 bg-white/60 rounded" />
          <div className="w-5 h-0.5 bg-white/60 rounded" />
          <div className="w-5 h-0.5 bg-white/60 rounded" />
        </div>
        <span className="text-white/50 text-xs mt-1">上滑</span>
      </div>

      {/* 右下角：查看详情按钮 */}
      <div className="absolute bottom-12 right-4 px-4 py-2 bg-white rounded-lg shadow-lg">
        <span className="text-gray-800 text-xs font-medium">查看详情 &gt;</span>
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
    <div className="relative w-full h-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
      {/* 白色卡片弹窗 */}
      <div className="w-[90%] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* 关闭按钮 */}
        <div className="absolute top-2 right-2 w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center z-10">
          <span className="text-gray-500 text-lg font-light leading-none">×</span>
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
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="font-bold text-white text-sm drop-shadow">大连五一旅游季</h3>
            <p className="text-white/80 text-xs mt-0.5">邂逅滨海浪漫 畅玩活力五一</p>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="px-4 py-3 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">Sponsored</span>
          <button className="px-4 py-1.5 bg-green-500 text-white text-xs rounded-lg font-medium">
            查看详情
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
    <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
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

      {/* 顶部状态栏 */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-black/20 flex items-center justify-between px-4">
        <span className="text-white/80 text-[10px]">9:41</span>
        <div className="flex gap-1">
          <div className="w-1 h-1.5 bg-white/80 rounded-full" />
          <div className="w-1 h-1.5 bg-white/80 rounded-full" />
          <div className="w-1 h-1.5 bg-white/80 rounded-full" />
        </div>
      </div>

      {/* 中央内容叠加 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* 标题 */}
        <h2 className="text-xl font-bold text-white text-center drop-shadow-lg px-4">大连五一游</h2>
        {/* 描述文字 */}
        <p className="mt-2 text-xs text-white/90 text-center px-8 drop-shadow">
          浪漫滨城 五一等你来
        </p>

        {/* 评分和下载次数 */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-amber-400 text-sm">★★★★★</span>
          <span className="text-white/60 text-xs">2024.05.01-05.07</span>
        </div>

        {/* 巨型渐变按钮 */}
        <button className="absolute bottom-20 left-4 right-4 py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg text-sm font-bold">
          立即查看（99MB）
        </button>
      </div>

      {/* 底部信息 */}
      <div className="absolute bottom-6 right-4 text-[10px] text-white/30">
        广告
      </div>

      {/* Home指示器 */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-white/30 rounded-full" />
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
    <div className="relative w-full h-full bg-gray-50 p-2">
      {/* 广告卡片 */}
      <div className="w-full bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex gap-2 p-2">
          {/* 左侧文字区 */}
          <div className="flex-1 flex flex-col justify-between">
            {/* 顶部标签 */}
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-gray-400">推荐</span>
              <span className="text-[9px] text-gray-400 bg-gray-100 px-1 py-0.5 rounded">Ad</span>
            </div>

            {/* 标题 */}
            <h3 className="text-xs font-bold text-gray-800 line-clamp-2">
              大连五一·海滨之旅
            </h3>

            {/* 描述 */}
            <p className="text-[10px] text-gray-400">蔚蓝海岸 金色假期</p>

            {/* 底部 */}
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-green-600">查看详情</span>
            </div>
          </div>

          {/* 右侧：图片 */}
          <div className="w-20 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-md overflow-hidden flex-shrink-0">
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
    <div className="relative w-full h-full bg-[#F8F9FA] border-t border-gray-200 flex items-center overflow-hidden">
      {/* 背景图（半透明） */}
      <div className="absolute inset-0 opacity-20">
        <img 
          src={DEFAULT_IMAGES.banner} 
          alt="横幅"
          className="w-full h-full object-cover object-left"
        />
      </div>

      <div className="relative flex items-center gap-1.5 px-1.5 w-full">
        {/* 应用图标 */}
        <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[10px]">🏖️</span>
        </div>

        {/* 文字内容 */}
        <div className="flex-1 min-w-0">
          <h4 className="text-[10px] font-medium text-gray-800 truncate leading-tight">大连五一旅游季</h4>
          <p className="text-[9px] text-gray-500 truncate leading-tight">邂逅滨海浪漫 畅玩活力五一</p>
        </div>

        {/* 查看按钮 */}
        <button className="px-2 py-1 bg-blue-500 text-white text-[9px] rounded-md font-medium flex-shrink-0">
          查看
        </button>

        {/* 关闭按钮 */}
        <button className="w-4 h-4 text-gray-400 flex items-center justify-center flex-shrink-0">
          <span className="text-xs leading-none">×</span>
        </button>
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
    <div className="relative w-full h-full bg-gradient-to-b from-sky-200 via-green-200 to-green-300 overflow-hidden">
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
      <div className="absolute top-12 left-4 right-4">
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white text-center py-2 px-4 rounded-lg shadow-lg">
          <span className="text-sm font-bold">观看视频以领取双倍金币奖励</span>
        </div>
      </div>

      {/* 右下角：倒计时角标 */}
      <div className="absolute bottom-28 right-3 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow">
        <span className="text-sm font-medium text-gray-800">{Math.max(0, Math.floor((100 - progress) / 6.7))}s后可领取</span>
      </div>

      {/* 底部：进度条 */}
      <div className="absolute bottom-16 left-4 right-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💎</span>
          <div className="flex-1 h-2 bg-white/60 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-bold text-white">{progress}%</span>
        </div>
      </div>

      {/* 视频结束画面 */}
      {progress >= 100 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <button className="px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-2xl shadow-xl text-base font-bold">
            点击屏幕领取奖励
          </button>
        </div>
      )}

      {/* 状态栏 */}
      <div className="absolute top-0 left-0 right-0 h-6 bg-black/10 flex items-center justify-between px-3">
        <span className="text-white/70 text-[9px]">9:41</span>
      </div>
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

  // 判断是否需要手机框架（全屏类型需要，半屏/横幅/原生不需要）
  const needsPhoneFrame = type !== "banner" && type !== "native" && type !== "interstitial_half";

  // 获取手机框架尺寸
  const getPhoneFrameClasses = () => {
    switch (type) {
      case "banner":
        return "w-[140px]";
      case "native":
        return "w-[130px]";
      case "interstitial_half":
        return "w-[100px]";
      default:
        return "w-[80px]";
    }
  };

  const getPhoneContentClasses = () => {
    switch (type) {
      case "banner":
        return "h-[28px]";
      case "native":
        return "h-[52px]";
      case "interstitial_half":
        return "h-[180px]";
      default:
        return "h-[144px]";
    }
  };

  // 获取预览内容高度
  const getContentHeight = () => {
    switch (type) {
      case "banner":
        return "h-[26px]";
      case "native":
        return "h-[48px]";
      case "interstitial_half":
        return "h-[168px]";
      default:
        return "h-[132px]";
    }
  };

  if (!showFrame || !needsPhoneFrame) {
    // 横幅、原生、插屏-半屏：直接展示广告内容，不需要手机框架
    return (
      <div className={cn("rounded-lg overflow-hidden", className)}>
        <div className={getContentHeight()}>
          <TemplateComponent />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-gray-900 rounded-xl p-1 shadow-lg flex items-center justify-center",
      getPhoneFrameClasses()
    )}>
      {/* 手机外框 */}
      <div className={cn(
        "bg-white rounded-lg overflow-hidden relative",
        getPhoneContentClasses()
      )}>
        {/* 状态栏 */}
        <div className="h-2 bg-white flex items-center justify-between px-1.5">
          <span className="text-[6px] text-gray-900">9:41</span>
          <div className="flex gap-0.5">
            <div className="w-0.5 h-1 bg-gray-900 rounded-full" />
            <div className="w-0.5 h-1 bg-gray-900 rounded-full" />
            <div className="w-0.5 h-1 bg-gray-900 rounded-full" />
          </div>
        </div>

        {/* 内容 */}
        <div className={getContentHeight()}>
          <TemplateComponent />
        </div>

        {/* 底部指示器 */}
        <div className="h-1.5 bg-white flex items-center justify-center">
          <div className="w-6 h-0.5 bg-gray-300 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export { TEMPLATE_STYLES, SDK_TEMPLATE_INFO_STYLES, DEFAULT_IMAGES };
