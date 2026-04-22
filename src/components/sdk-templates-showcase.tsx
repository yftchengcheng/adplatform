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
// 尺寸：1080×1920 px，视频播放界面
// 特点：金色横幅 + 倒计时角标 + 钻石动画 + 毛玻璃UI
// ============================================
function RewardedVideoStyle() {
  const [progress, setProgress] = useState(0);
  const [diamondCount, setDiamondCount] = useState(0);
  const maxSeconds = 15;
  const currentSeconds = Math.max(0, Math.ceil((100 - progress) / (100 / maxSeconds)));

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 100;
        return p + 0.8;
      });
    }, 150);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const diamondTimer = setInterval(() => {
      setDiamondCount((c) => {
        if (c >= 50) return 50;
        return c + 1;
      });
    }, 300);
    return () => clearInterval(diamondTimer);
  }, []);

  const isCompleted = progress >= 100;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 视频内容背景 */}
      <div className="absolute inset-0">
        <img 
          src={DEFAULT_IMAGES.rewarded_video} 
          alt="激励视频"
          className="w-full h-full object-cover"
        />
        {/* 底部渐变 */}
        <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/40 to-transparent" />
      </div>

      {/* 顶部：金色横幅 - 居中醒目 */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
        <div className="relative">
          {/* 光晕效果 */}
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-300/50 via-yellow-300/50 to-amber-400/50 rounded-full blur-md" />
          <div className="relative bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-white text-center py-2.5 px-6 rounded-full shadow-xl border border-amber-300/30">
            <div className="flex items-center gap-2">
              <span className="text-sm">🎁</span>
              <p className="text-sm font-semibold whitespace-nowrap">观看视频以领取双倍金币奖励</p>
              <span className="text-sm">🎁</span>
            </div>
          </div>
        </div>
      </div>

      {/* 右下角：倒计时角标 - 白底黑字圆角矩形 */}
      <div className="absolute bottom-24 right-3 z-20">
        <div className="bg-white/90 backdrop-blur-md rounded-lg px-3 py-1.5 shadow-lg border border-white/50">
          <p className="text-gray-800 text-xs font-medium">
            {isCompleted ? "可领取" : `${currentSeconds}s后可领取`}
          </p>
        </div>
      </div>

      {/* 底部左侧：钻石计数动画 */}
      <div className="absolute bottom-6 left-3 z-20">
        <div className="bg-white/25 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg border border-white/30">
          <div className="flex items-center gap-2">
            {/* 钻石图标 + 动态计数 */}
            <div className="relative flex items-center gap-1">
              <span className="text-lg">💎</span>
              <span className="text-white text-base font-bold drop-shadow-md tabular-nums">
                ×{diamondCount}
              </span>
              {/* 增长中的闪烁效果 */}
              {diamondCount < 50 && (
                <div className="absolute -top-0.5 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75" />
              )}
            </div>
          </div>
          {/* 进度条 */}
          <div className="mt-1.5 w-16 h-1.5 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${(diamondCount / 50) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 底部右侧：视频进度条 */}
      <div className="absolute bottom-6 right-3 left-20 z-20">
        <div className="bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1.5 border border-white/20">
          <div className="flex items-center gap-2">
            <span className="text-white/80 text-xs">▶️</span>
            <div className="flex-1 h-1.5 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 transition-all duration-150 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-white/90 text-xs font-medium">{Math.floor(progress)}%</span>
          </div>
        </div>
      </div>

      {/* 视频结束画面 */}
      {isCompleted && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center">
          {/* 半透明遮罩 */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          {/* 内容 */}
          <div className="relative text-center">
            {/* 奖励图标 */}
            <div className="mb-4">
              <span className="text-7xl drop-shadow-xl">🎉</span>
            </div>
            
            {/* 奖励信息 */}
            <div className="mb-6">
              <p className="text-white/80 text-sm mb-1">恭喜获得</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl">🪙</span>
                <span className="text-5xl font-bold text-yellow-400 drop-shadow-lg">
                  {diamondCount * 2}
                </span>
                <span className="text-xl text-yellow-300">金币</span>
              </div>
            </div>

            {/* 大按钮 - 点击屏幕领取奖励 */}
            <button className="relative group">
              {/* 按钮光晕 */}
              <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-2xl blur opacity-60 group-hover:opacity-90 transition-opacity" />
              <div className="relative bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-white px-10 py-4 rounded-2xl shadow-xl border border-amber-300/30">
                <p className="text-lg font-bold">点击屏幕领取奖励</p>
              </div>
            </button>

            {/* 提示文字 */}
            <p className="text-white/50 text-xs mt-4">观看完成后即可领取</p>
          </div>
        </div>
      )}
    </div>
  );
}

// 模板样式映射
const TEMPLATE_STYLES: Record<SDKTemplateType, () => JSX.Element> = {
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

// SDK模板尺寸配置
const SDK_TEMPLATE_SIZES: Record<SDKTemplateType, { width: number; height: number }> = {
  static_splash: { width: 1080, height: 1920 },
  video_splash: { width: 1080, height: 1920 },
  interstitial_half: { width: 600, height: 500 },
  interstitial_full: { width: 1080, height: 1920 },
  banner: { width: 320, height: 50 },
  native: { width: 540, height: 200 },
  rewarded_video: { width: 1080, height: 1920 },
};

// SDK模板样式展示组件 - 与列表页RealAdPreview保持完全一致
export function SDKTemplatesShowcase({ className }: { className?: string }) {
  const [activeTemplate, setActiveTemplate] = useState<SDKTemplateType>("static_splash");
  
  const templateInfo = SDK_TEMPLATE_INFO_STYLES[activeTemplate];
  const isVideoType = activeTemplate === "video_splash" || activeTemplate === "rewarded_video";

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

      {/* 样式展示区域 - 与RealAdPreview保持完全一致 */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-100 overflow-auto">
        <div className="flex flex-col items-center gap-4">
          {/* 手机框架 - 与RealAdPreview一致：270px x 540px */}
          <div className="relative bg-gray-900 w-[270px] h-[540px] rounded-[3rem] p-2 shadow-2xl">
            {/* 手机外边框 */}
            <div className="relative w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
              {/* 刘海区域 */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-gray-900 rounded-b-2xl z-10" />

              {/* 内容区域 */}
              <div className="relative w-full h-full overflow-hidden bg-gray-100">
                {/* 横幅广告 - 手机底部展示 */}
                {activeTemplate === "banner" && (
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
                        <img src={DEFAULT_IMAGES[activeTemplate]} alt={templateInfo.name} className="w-full h-auto" />
                        {/* 关闭按钮 - 素材右上角 */}
                        <button
                          onClick={() => {}}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white/80 hover:bg-black/70"
                        >
                          <span className="text-white/80 text-xs leading-none">x</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* 插屏半屏 - 居中弹窗 */}
                {activeTemplate === "interstitial_half" && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-[75%] overflow-hidden rounded-lg shadow-xl">
                      <img src={DEFAULT_IMAGES[activeTemplate]} alt={templateInfo.name} className="w-full h-auto" />
                    </div>
                  </div>
                )}

                {/* 原生信息流 - 在内容流中展示 */}
                {activeTemplate === "native" && (
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
                      <div className="bg-white rounded-lg shadow-sm overflow-hidden relative">
                        <img src={DEFAULT_IMAGES[activeTemplate]} alt={templateInfo.name} className="w-full h-auto" />
                        {/* 关闭按钮 */}
                        <button
                          onClick={() => {}}
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

                {/* 全屏类型 - 填满整个内容区 */}
                {!["banner", "interstitial_half", "native"].includes(activeTemplate) && (
                  <>
                    {isVideoType ? (
                      <video
                        src={DEFAULT_IMAGES[activeTemplate]}
                        className="absolute inset-0 w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        autoPlay
                      />
                    ) : (
                      <img
                        src={DEFAULT_IMAGES[activeTemplate]}
                        alt={templateInfo.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
                  </>
                )}
              </div>
            </div>

            {/* 右侧按钮 */}
            <div className="absolute -right-2 top-32 flex flex-col gap-2">
              <div className="w-1 h-8 bg-gray-700 rounded" />
              <div className="w-1 h-12 bg-gray-700 rounded" />
            </div>
            {/* 左侧按钮 */}
            <div className="absolute -left-2 top-28 flex flex-col gap-2">
              <div className="w-1 h-10 bg-gray-700 rounded" />
            </div>
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

// 单独的模板样式卡片组件（用于列表展示）- 与RealAdPreview保持一致
export function SDKTemplateStyleCard({ 
  type, 
  className,
  showFrame = true 
}: { 
  type: SDKTemplateType; 
  className?: string;
  showFrame?: boolean;
}) {
  const templateInfo = SDK_TEMPLATE_INFO_STYLES[type];
  const isVideoType = type === "video_splash" || type === "rewarded_video";

  if (!showFrame) {
    return (
      <div className={cn("rounded-lg overflow-hidden relative bg-gray-900", className)}>
        {isVideoType ? (
          <video
            src={DEFAULT_IMAGES[type]}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            autoPlay
          />
        ) : (
          <img
            src={DEFAULT_IMAGES[type]}
            alt={templateInfo.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>
    );
  }

  // 横幅广告：在手机底部展示
  if (type === "banner") {
    return (
      <div className={cn("bg-gray-900 rounded-xl p-1 shadow-lg", "w-[80px] h-[144px]", className)}>
        <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-100">
          {/* 模拟应用内容 */}
          <div className="absolute inset-0 bg-gray-50">
            <div className="h-2 bg-white flex items-center px-1">
              <span className="text-[4px] text-gray-900">9:41</span>
            </div>
            <div className="p-0.5 space-y-0.5">
              <div className="h-1 bg-gray-200 rounded w-3/4" />
              <div className="h-1 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded" />
              <div className="h-1 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-200 rounded" />
            </div>
          </div>
          {/* 横幅广告 - 固定在底部 */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="relative">
              <img src={DEFAULT_IMAGES[type]} alt={templateInfo.name} className="w-full h-auto" />
              {/* 关闭按钮 - 素材右上角 */}
              <button
                onClick={() => {}}
                className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-black/50 rounded-full flex items-center justify-center"
              >
                <span className="text-white/80 text-[6px] leading-none">x</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 插屏半屏：居中弹窗展示
  if (type === "interstitial_half") {
    return (
      <div className={cn("bg-gray-900 rounded-xl p-1 shadow-lg", "w-[80px] h-[144px]", className)}>
        <div className="relative w-full h-full rounded-lg overflow-hidden bg-black/30 flex items-center justify-center">
          <img src={DEFAULT_IMAGES[type]} alt={templateInfo.name} className="w-[80%] h-auto rounded shadow-lg" />
        </div>
      </div>
    );
  }

  // 原生信息流：在内容流中展示
  if (type === "native") {
    return (
      <div className={cn("bg-gray-900 rounded-xl p-1 shadow-lg", "w-[80px] h-[144px]", className)}>
        <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-50">
          <div className="h-2 bg-white flex items-center px-1">
            <span className="text-[4px] text-gray-900">9:41</span>
          </div>
          <div className="p-0.5 space-y-0.5">
            <div className="h-1 bg-gray-200 rounded w-3/4" />
            <div className="h-2 bg-gray-200 rounded" />
            <div className="relative">
              <img src={DEFAULT_IMAGES[type]} alt={templateInfo.name} className="w-full h-auto rounded shadow-sm" />
              {/* 关闭按钮 */}
              <button
                onClick={() => {}}
                className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-black/50 rounded-full flex items-center justify-center"
              >
                <span className="text-white/80 text-[6px] leading-none">x</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 全屏类型：填满整个手机框架
  return (
    <div className={cn("bg-gray-900 rounded-xl p-1 shadow-lg", "w-[80px] h-[144px]", className)}>
      <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-900">
        {isVideoType ? (
          <video
            src={DEFAULT_IMAGES[type]}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            loop
            playsInline
            autoPlay
          />
        ) : (
          <img
            src={DEFAULT_IMAGES[type]}
            alt={templateInfo.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0.5 left-0.5 right-0.5">
          <p className="text-white text-[5px] font-medium truncate">{templateInfo.name}</p>
        </div>
      </div>
    </div>
  );
}

export { TEMPLATE_STYLES, SDK_TEMPLATE_INFO_STYLES, DEFAULT_IMAGES };
