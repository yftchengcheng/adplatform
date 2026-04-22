"use client";

import React, { useState, useEffect } from "react";
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

// ============================================
// 1. 静态开屏广告
// 尺寸：1080×1920 px，9:16
// 特点：化妆品静物、粉色渐变、金色胶囊按钮
// ============================================
function StaticSplashStyle() {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-pink-100 via-pink-50 to-rose-100 overflow-hidden">
      {/* 左上角：App Logo 浮层 */}
      <div className="absolute top-10 left-4 w-10 h-10 bg-white/40 backdrop-blur-sm rounded-xl flex items-center justify-center">
        <div className="w-6 h-6 bg-gradient-to-br from-pink-300 to-pink-500 rounded-lg" />
      </div>

      {/* 右上角：跳过按钮 */}
      <div className="absolute top-10 right-4 px-3 py-1.5 bg-white/30 backdrop-blur-sm rounded-full">
        <span className="text-white/90 text-xs font-light tracking-wide">跳过 5s</span>
      </div>

      {/* 中央：化妆品静物 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          {/* 化妆品瓶子 */}
          <div className="w-32 h-40 bg-gradient-to-br from-pink-200 via-pink-100 to-white rounded-3xl mx-auto shadow-lg shadow-pink-200/50 flex items-center justify-center">
            <div className="w-20 h-28 bg-gradient-to-br from-pink-300 to-pink-400 rounded-2xl" />
          </div>
        </div>
      </div>

      {/* 底部三分之一：标题和按钮 */}
      <div className="absolute bottom-24 left-0 right-0 text-center">
        {/* 主标题 */}
        <h2 className="text-3xl font-bold text-gray-800 tracking-wide">Adtalos</h2>
        {/* 副标题 */}
        <p className="text-sm text-gray-500 mt-1">Discover the routine</p>
        {/* 金色胶囊按钮 */}
        <button className="mt-6 px-10 py-3 bg-gradient-to-r from-amber-300 to-amber-400 text-white rounded-full shadow-lg text-sm font-medium">
          LEARN MORE
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
// 特点：红色跑车、沿海公路、滑动引导条
// ============================================
function VideoSplashStyle() {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 overflow-hidden">
      {/* 动态模糊背景：红色跑车沿海公路 */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/30 to-slate-900" />
        {/* 模拟沿海公路模糊效果 */}
        <div className="absolute top-1/4 left-0 right-0 h-48 bg-gradient-to-r from-red-500/30 via-orange-500/30 to-red-500/30 blur-3xl" />
        <div className="absolute bottom-1/3 left-0 right-0 h-24 bg-gradient-to-r from-blue-400/20 via-cyan-400/20 to-blue-400/20 blur-2xl" />
      </div>

      {/* 顶部渐变遮罩 */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/40 to-transparent" />

      {/* 左上角：App Logo */}
      <div className="absolute top-10 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
        <div className="w-6 h-6 bg-white/80 rounded-lg" />
      </div>

      {/* 右上角：跳过按钮 */}
      <div className="absolute top-10 right-4 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
        <span className="text-white/80 text-xs">跳过 5s | 静音</span>
      </div>

      {/* 中央：红色跑车 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-48 h-28 bg-gradient-to-br from-red-400/60 to-red-600/60 rounded-2xl blur-sm" />
        </div>
      </div>

      {/* 底部：滑动引导条（三个小横条） */}
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
// 尺寸：1080×1920，广告居中，宽高比5:4或1:1
// 特点：白色卡片、游戏Royal Match、三颗星
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

        <div className="p-4">
          <div className="flex gap-3">
            {/* 左侧：游戏图标和文字 */}
            <div className="flex-1 flex gap-3">
              {/* 游戏图标 */}
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xl font-bold">R</span>
              </div>
              {/* 文字信息 */}
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-sm">Royal Match</h3>
                {/* 三颗星星评分 */}
                <div className="flex items-center gap-0.5 mt-1">
                  <span className="text-amber-400 text-sm">★</span>
                  <span className="text-amber-400 text-sm">★</span>
                  <span className="text-amber-400 text-sm">★</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Match 3 Game</p>
              </div>
            </div>

            {/* 右侧：下载按钮 */}
            <div className="flex items-center">
              <button className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg font-medium">
                下载
              </button>
            </div>
          </div>
        </div>

        {/* 底部 */}
        <div className="px-4 pb-3 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">Sponsored</span>
          <span className="text-[10px] text-gray-400">🔒 Privacy</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 4. 插屏广告 - 全屏
// 尺寸：1080×1920 px，保留状态栏和Home指示器
// 特点：深蓝色科技感网格、电竞风格
// ============================================
function InterstitialFullStyle() {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
      {/* 科技感网格背景 */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.4) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }} 
        />
      </div>

      {/* 粒子光效 */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
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

      {/* 中央内容 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* 电竞风格圆形应用图标 */}
        <div className="w-20 h-20 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full shadow-2xl shadow-purple-500/40 flex items-center justify-center">
          <span className="text-3xl">⚔️</span>
        </div>

        {/* 标题 */}
        <h2 className="mt-6 text-xl font-bold text-white text-center">史诗级策略对战</h2>
        {/* 描述文字 */}
        <p className="mt-2 text-xs text-white/60 text-center px-8">
          与全球玩家一决高下，体验极致策略乐趣
        </p>

        {/* 评分和下载次数 */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-amber-400 text-sm">★★★★★</span>
          <span className="text-white/60 text-xs">999万+ 下载</span>
        </div>

        {/* 巨型渐变按钮 */}
        <button className="absolute bottom-20 left-4 right-4 py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg text-sm font-bold">
          立即下载（99MB）
        </button>
      </div>

      {/* 底部信息 */}
      <div className="absolute bottom-6 right-4 text-[10px] text-white/30">
        广告 | Epic Games
      </div>

      {/* Home指示器 */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-white/30 rounded-full" />
    </div>
  );
}

// ============================================
// 5. 原生广告（信息流）
// 尺寸：宽度自适应，高度根据内容自适应
// 特点：左文右图、16:9图片、书桌场景
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
              告别拖延，从微习惯开始
            </h3>

            {/* 描述 */}
            <p className="text-[10px] text-gray-400">已有10万人参与挑战</p>

            {/* 底部 */}
            <div className="flex items-center justify-between mt-1">
              <span className="text-[10px] text-green-600">免费下载</span>
            </div>
          </div>

          {/* 右侧：16:9图片 */}
          <div className="w-20 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-md overflow-hidden flex-shrink-0">
            <div className="w-full h-full flex items-center justify-center">
              {/* 模拟书桌场景 */}
              <div className="relative w-full h-full">
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-amber-200" />
                <div className="absolute bottom-1/2 left-1/4 w-3 h-4 bg-amber-400 rounded" />
                <div className="absolute bottom-1/2 right-1/4 w-4 h-3 bg-blue-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 6. 横幅广告 (Banner)
// 尺寸：320×50 dp
// 特点：电商类应用、橙色按钮
// ============================================
function BannerStyle() {
  return (
    <div className="relative w-full h-full bg-[#F8F9FA] border-t border-gray-200 flex items-center">
      <div className="flex items-center gap-1.5 px-1.5 w-full">
        {/* 应用图标 */}
        <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-[10px]">🛒</span>
        </div>

        {/* 文字内容 */}
        <div className="flex-1 min-w-0">
          <h4 className="text-[10px] font-medium text-gray-800 truncate leading-tight">购物App - 限时秒杀</h4>
          <p className="text-[9px] text-gray-500 truncate leading-tight">全场满199减30</p>
        </div>

        {/* 查看按钮 */}
        <button className="px-2 py-1 bg-orange-500 text-white text-[9px] rounded-md font-medium flex-shrink-0">
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
// 特点：农场收割游戏、金色横幅、倒计时角标
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
      {/* 视频内容：农场收割游戏画面 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center w-full">
          {/* 游戏场景 */}
          <div className="w-44 h-64 bg-gradient-to-b from-sky-300 to-green-400 rounded-xl overflow-hidden mx-auto relative">
            {/* 太阳 */}
            <div className="absolute top-4 right-6 w-8 h-8 bg-yellow-300 rounded-full" />
            {/* 云朵 */}
            <div className="absolute top-6 left-6 w-10 h-4 bg-white/60 rounded-full" />
            {/* 田野 */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-amber-300 to-amber-200" />
            {/* 庄稼 */}
            <div className="absolute bottom-1/2 left-0 right-0 flex justify-around">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="w-1.5 h-8 bg-amber-500 rounded-t" />
              ))}
            </div>
            {/* 进度收割线 */}
            <div 
              className="absolute bottom-1/2 left-0 h-0.5 bg-green-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
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
          <span className="text-sm font-bold text-amber-600">{progress}%</span>
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

  const content = (
    <div className={cn(
      "overflow-hidden",
      type === "banner" ? "h-[28px]" : 
      type === "native" ? "h-[48px]" : "h-[120px]"
    )}>
      <TemplateComponent />
    </div>
  );

  if (!showFrame) {
    return (
      <div className={cn("rounded-lg overflow-hidden", className)}>
        {content}
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-gray-900 rounded-xl p-1 shadow-lg",
      type === "banner" ? "w-[130px]" : 
      type === "native" ? "w-[120px]" : "w-[72px]"
    )}>
      <div className={cn(
        "bg-white rounded-lg overflow-hidden relative",
        type === "banner" ? "h-[26px]" : 
        type === "native" ? "h-[44px]" : "h-[108px]"
      )}>
        {/* 状态栏 */}
        {type !== "banner" && type !== "native" && (
          <div className="h-2 bg-white flex items-center justify-between px-1.5">
            <span className="text-[6px] text-gray-900">9:41</span>
          </div>
        )}

        {/* 内容 */}
        <div className={type === "banner" || type === "native" ? "h-full" : "flex-1"}>
          <TemplateComponent />
        </div>

        {/* 底部指示器 */}
        {type !== "banner" && type !== "native" && (
          <div className="h-1.5 bg-white flex items-center justify-center">
            <div className="w-6 h-0.5 bg-gray-300 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}

export { TEMPLATE_STYLES, SDK_TEMPLATE_INFO_STYLES };
