"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  Play,
  Clock,
  MousePointer,
  RotateCcw,
  Zap,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";

// ---- 类型定义 ----

type SDKTemplateType =
  | "static_splash"
  | "video_splash"
  | "interstitial_half"
  | "interstitial_full"
  | "banner"
  | "native"
  | "rewarded_video";

type TriggerRule =
  | "video_complete"
  | "show_time"
  | "click_close"
  | "back_from_media"
  | "click_other_ad"
  | "in_app_interaction";

interface ComponentLinkConfig {
  id: string;
  componentId: string;
  componentName: string;
  componentType: string;
  componentPreview: string;
  triggerRule: TriggerRule;
  triggerTime?: number;
  parentId?: string;
  parentName?: string;
  status: "enabled" | "disabled";
}

// ---- 常量 ----

const DEFAULT_IMAGES: Record<string, string> = {
  static_splash: "/static-splash.png",
  video_splash: "/video-splash.mp4",
  interstitial_half: "/interstitial-half.png",
  interstitial_full: "/interstitial-full.png",
  banner: "/banner.png",
  native: "/native.png",
  rewarded_video: "/rewarded-video.mp4",
};

const TRIGGER_RULES: Record<TriggerRule, { label: string; autoDelay: number }> = {
  video_complete: { label: "视频播放完毕", autoDelay: 5000 },
  show_time: { label: "出现时间", autoDelay: 3000 },
  click_close: { label: "点击关闭按钮", autoDelay: 0 },
  back_from_media: { label: "跳转后返回", autoDelay: 4000 },
  click_other_ad: { label: "点击其他广告", autoDelay: 0 },
  in_app_interaction: { label: "应用内互动", autoDelay: 3000 },
};

// ---- 手机框架内模板预览 ----

function PhoneTemplatePreview({
  templateType,
  onCloseClick,
}: {
  templateType: SDKTemplateType;
  onCloseClick?: () => void;
}) {
  const defaultImage = DEFAULT_IMAGES[templateType];
  const isVideoType = templateType === "video_splash" || templateType === "rewarded_video";

  // 开屏倒计时
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!["static_splash", "video_splash"].includes(templateType)) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [templateType]);

  // 横幅
  if (templateType === "banner") {
    return (
      <div className="w-full h-full bg-gray-50">
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
        <div className="absolute bottom-6 left-0 right-0">
          <div className="relative">
            <img src={defaultImage} alt="横幅" className="w-full h-auto" />
            {onCloseClick && (
              <button
                onClick={onCloseClick}
                className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white/80 hover:bg-black/70"
              >
                <span className="text-white/80 text-[10px] leading-none">x</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 插屏半屏
  if (templateType === "interstitial_half") {
    return (
      <div className="w-full h-full bg-black/40 flex items-center justify-center">
        <div className="relative w-[75%] overflow-hidden rounded-lg shadow-xl">
          <img src={defaultImage} alt="插屏" className="w-full h-auto" />
          {onCloseClick && (
            <button
              onClick={onCloseClick}
              className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white/80 hover:bg-black/70"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // 原生信息流
  if (templateType === "native") {
    return (
      <div className="w-full h-full bg-gray-50">
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
            <img src={defaultImage} alt="原生" className="w-full h-auto" />
            {onCloseClick && (
              <button
                onClick={onCloseClick}
                className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center text-white/80 hover:bg-black/70"
              >
                <span className="text-white/80 text-[10px] leading-none">x</span>
              </button>
            )}
          </div>
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-16 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  // 激励视频
  if (templateType === "rewarded_video") {
    return <RewardedVideoPhonePreview defaultImage={defaultImage} onCloseClick={onCloseClick} />;
  }

  // 全屏类型（静态开屏/视频开屏/插屏全屏）
  return (
    <div className="w-full h-full bg-gray-900 relative">
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
        <img src={defaultImage} alt="开屏" className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
      {/* 跳过按钮（开屏类型） */}
      {["static_splash", "video_splash"].includes(templateType) && (
        <button
          onClick={onCloseClick}
          className="absolute top-8 right-3 px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-colors"
        >
          <span className="text-white/80 text-xs">
            {countdown > 0 ? `跳过 ${countdown}s` : "跳过"}
          </span>
        </button>
      )}
      {onCloseClick && (
        <button
          onClick={onCloseClick}
          className="absolute top-8 left-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white/80 hover:bg-black/70"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <h2 className="text-lg font-bold text-white">广告展示</h2>
        <p className="text-xs text-white/80 mt-1">点击查看详情</p>
      </div>
    </div>
  );
}

// 激励视频手机预览
function RewardedVideoPhonePreview({
  defaultImage,
  onCloseClick,
}: {
  defaultImage: string;
  onCloseClick?: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [diamondCount, setDiamondCount] = useState(0);
  const maxSeconds = 15;
  const currentSeconds = Math.max(0, Math.ceil(((100 - progress) / 100) * maxSeconds));
  const isCompleted = progress >= 100;

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : p + 0.8));
    }, 150);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setDiamondCount((c) => (c >= 50 ? 50 : c + 1));
    }, 300);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-full bg-black relative">
      <video
        src={defaultImage}
        className="absolute inset-0 w-full h-full object-cover"
        muted
        loop
        playsInline
        autoPlay
      />
      <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/40 to-transparent" />

      {/* 金色横幅 */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-300/50 via-yellow-300/50 to-amber-400/50 rounded-full blur-sm" />
          <div className="relative bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-white text-center py-1.5 px-5 rounded-full shadow-lg border border-amber-300/30">
            <p className="text-[9px] font-semibold whitespace-nowrap">观看视频以领取双倍金币奖励</p>
          </div>
        </div>
      </div>

      {/* 倒计时 */}
      <div className="absolute bottom-20 right-3 z-20">
        <div className="bg-white/90 backdrop-blur-md rounded-lg px-2.5 py-1 shadow-lg border border-white/50">
          <p className="text-gray-800 text-[9px] font-medium">
            {isCompleted ? "可领取" : `${currentSeconds}s后可领取`}
          </p>
        </div>
      </div>

      {/* 钻石计数 */}
      <div className="absolute bottom-6 left-3 z-20">
        <div className="bg-white/25 backdrop-blur-md rounded-xl px-2.5 py-1.5 shadow-lg border border-white/30">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">💎</span>
            <span className="text-white text-xs font-bold drop-shadow-md tabular-nums">x{diamondCount}</span>
          </div>
        </div>
      </div>

      {/* 进度条 */}
      <div className="absolute bottom-6 right-3 left-20 z-20">
        <div className="bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 border border-white/20">
          <div className="flex items-center gap-1.5">
            <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 transition-all duration-150 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-white/90 text-[8px] font-medium">{Math.floor(progress)}%</span>
          </div>
        </div>
      </div>

      {/* 完成画面 */}
      {isCompleted && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
          <span className="text-5xl mb-3">🎉</span>
          <p className="text-white/80 text-xs mb-1">恭喜获得</p>
          <div className="flex items-center gap-1 mb-3">
            <span className="text-2xl">🪙</span>
            <span className="text-3xl font-bold text-yellow-400">{diamondCount * 2}</span>
            <span className="text-sm text-yellow-300">金币</span>
          </div>
          <button className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-white px-6 py-2.5 rounded-xl shadow" onClick={onCloseClick}>
            <p className="text-xs font-bold">点击领取奖励</p>
          </button>
        </div>
      )}
    </div>
  );
}

// ---- 组件弹出层 ----

function ComponentPopup({
  link,
  onDismiss,
  onChildTrigger,
}: {
  link: ComponentLinkConfig;
  onDismiss: () => void;
  onChildTrigger: (childLink: ComponentLinkConfig) => void;
}) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 animate-in fade-in duration-300">
      <div className="relative w-[85%] bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* 组件预览 */}
        <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
          <img src={link.componentPreview} alt={link.componentName} className="w-full h-full object-cover" />
        </div>
        {/* 组件信息 */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">{link.componentName}</p>
              <p className="text-xs text-gray-500 mt-0.5">{link.componentType}</p>
            </div>
          </div>
        </div>
        {/* 关闭按钮 */}
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white/80 hover:bg-black/70"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ---- 主组件：真实预览 ----

interface InteractionPreviewProps {
  templateType: SDKTemplateType;
  templateName: string;
  componentLinks: ComponentLinkConfig[];
  onClose: () => void;
}

export function InteractionPreview({
  templateType,
  templateName,
  componentLinks,
  onClose,
}: InteractionPreviewProps) {
  const enabledLinks = componentLinks.filter((l) => l.status === "enabled");

  // 交互状态：追踪当前弹出的组件栈
  const [activeComponents, setActiveComponents] = useState<ComponentLinkConfig[]>([]);
  const [dismissedComponents, setDismissedComponents] = useState<Set<string>>(new Set());

  // 当前场景阶段：template / triggered / component
  const [phase, setPhase] = useState<"template" | "triggering" | "component">("template");

  // 自动触发计时器
  const triggerTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // 清除所有计时器
  const clearAllTimers = useCallback(() => {
    triggerTimersRef.current.forEach((timer) => clearTimeout(timer));
    triggerTimersRef.current.clear();
  }, []);

  // 重置预览
  const handleReset = useCallback(() => {
    clearAllTimers();
    setActiveComponents([]);
    setDismissedComponents(new Set());
    setPhase("template");
    // 重新启动自动触发
    startAutoTriggers();
  }, [clearAllTimers]);

  // 启动自动触发逻辑
  const startAutoTriggers = useCallback(() => {
    clearAllTimers();
    const rootLinks = enabledLinks.filter((l) => l.parentId === "main");
    rootLinks.forEach((link) => {
      const rule = TRIGGER_RULES[link.triggerRule];
      if (rule && rule.autoDelay > 0) {
        const actualDelay = link.triggerRule === "show_time" && link.triggerTime
          ? link.triggerTime * 1000
          : rule.autoDelay;
        const timer = setTimeout(() => {
          triggerComponent(link);
        }, actualDelay);
        triggerTimersRef.current.set(link.id, timer);
      }
    });
  }, [enabledLinks]);

  // 触发组件弹出
  const triggerComponent = useCallback((link: ComponentLinkConfig) => {
    setActiveComponents((prev) => {
      if (prev.find((l) => l.id === link.id)) return prev;
      return [...prev, link];
    });
    setPhase("component");
  }, []);

  // 处理关闭按钮点击（click_close 类型触发）
  const handleCloseClick = useCallback(() => {
    const clickCloseLinks = enabledLinks.filter(
      (l) => l.triggerRule === "click_close" && l.parentId === "main" && !dismissedComponents.has(l.id)
    );
    clickCloseLinks.forEach((link) => {
      triggerComponent(link);
    });
  }, [enabledLinks, dismissedComponents, triggerComponent]);

  // 关闭组件弹出
  const dismissComponent = useCallback((linkId: string) => {
    setDismissedComponents((prev) => new Set(prev).add(linkId));
    setActiveComponents((prev) => prev.filter((l) => l.id !== linkId));
    // 触发 back_from_media 类型的子组件
    const backLinks = enabledLinks.filter(
      (l) => l.triggerRule === "back_from_media" && l.parentId === linkId && !dismissedComponents.has(l.id)
    );
    backLinks.forEach((link) => {
      const delay = TRIGGER_RULES[link.triggerRule].autoDelay;
      setTimeout(() => triggerComponent(link), delay);
    });
    if (activeComponents.length <= 1) {
      setPhase("template");
    }
  }, [enabledLinks, dismissedComponents, triggerComponent, activeComponents.length]);

  // 初始启动
  useEffect(() => {
    startAutoTriggers();
    return () => clearAllTimers();
  }, []);

  // 获取当前最顶层的弹出组件
  const topComponent = activeComponents.length > 0
    ? activeComponents[activeComponents.length - 1]
    : null;

  // 计算链路描述
  const getChainDescription = () => {
    if (activeComponents.length === 0) {
      const pendingRoots = enabledLinks.filter((l) => l.parentId === "main");
      if (pendingRoots.length === 0) return "模版展示中";
      const next = pendingRoots[0];
      const rule = TRIGGER_RULES[next.triggerRule];
      return `模版展示 → ${rule.label}后弹出「${next.componentName}」`;
    }
    const chain = activeComponents.map((l) => l.componentName).join(" → ");
    return `模版 → ${chain}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="relative w-full max-w-md mx-auto">
        {/* 手机框架 */}
        <div
          className="relative mx-auto bg-gray-900 rounded-[3rem] p-2 shadow-2xl"
          style={{ width: "270px", height: "540px" }}
        >
          <div className="relative w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
            {/* 刘海 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-gray-900 rounded-b-2xl z-10" />

            {/* 内容区 */}
            <div className="relative w-full h-full overflow-hidden">
              {/* 底层：模版展示 */}
              <PhoneTemplatePreview
                templateType={templateType}
                onCloseClick={handleCloseClick}
              />

              {/* 上层：组件弹出 */}
              {activeComponents.map((link) => (
                <ComponentPopup
                  key={link.id}
                  link={link}
                  onDismiss={() => dismissComponent(link.id)}
                  onChildTrigger={triggerComponent}
                />
              ))}
            </div>
          </div>

          {/* 侧边按钮 */}
          <div className="absolute -right-2 top-32 flex flex-col gap-2">
            <div className="w-1 h-8 bg-gray-700 rounded" />
            <div className="w-1 h-12 bg-gray-700 rounded" />
          </div>
          <div className="absolute -left-2 top-28 flex flex-col gap-2">
            <div className="w-1 h-10 bg-gray-700 rounded" />
          </div>
        </div>

        {/* 手机上方：关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 手机下方：操作区 */}
        <div className="mt-6 text-center space-y-3">
          {/* 链路描述 */}
          <p className="text-white/70 text-xs">{getChainDescription()}</p>

          {/* 控制按钮 */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              重置
            </button>
          </div>

          {/* 交互提示 */}
          <div className="space-y-1">
            {enabledLinks.filter((l) => l.parentId === "main").map((link) => {
              const rule = TRIGGER_RULES[link.triggerRule];
              const isAuto = rule.autoDelay > 0;
              const isTriggered = activeComponents.some((c) => c.id === link.id) || dismissedComponents.has(link.id);
              return (
                <div
                  key={link.id}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] mx-0.5 ${
                    isTriggered
                      ? "bg-green-500/20 text-green-300"
                      : isAuto
                        ? "bg-blue-500/20 text-blue-300"
                        : "bg-amber-500/20 text-amber-300"
                  }`}
                >
                  {isTriggered ? (
                    <span className="text-green-400">✓</span>
                  ) : isAuto ? (
                    <Clock className="w-3 h-3" />
                  ) : (
                    <MousePointer className="w-3 h-3" />
                  )}
                  <span>
                    {isTriggered
                      ? `已触发「${link.componentName}」`
                      : isAuto
                        ? `${rule.label}后 → ${link.componentName}`
                        : `${rule.label} → ${link.componentName}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InteractionPreview;
