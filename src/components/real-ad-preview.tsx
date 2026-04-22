"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, Play, Pause } from "lucide-react";
import { useComponents } from "@/contexts/component-context";
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

// 组件关联配置
interface ComponentLinkConfig {
  id: string;
  componentId: string;
  componentName: string;
  componentType: string;
  componentPreview: string;
  triggerRule: string;
  triggerTime?: number;
  status: "enabled" | "disabled";
  config?: Record<string, unknown>;
}

// 触发规则中文名和图标
const TRIGGER_RULE_LABELS: Record<string, { label: string; icon: string }> = {
  video_complete: { label: "视频播放完毕", icon: "▶" },
  show_time: { label: "出现时间", icon: "⏱" },
  click_close: { label: "点击关闭按钮", icon: "✕" },
  back_from_media: { label: "跳转后返回", icon: "↩" },
  click_other_ad: { label: "点击其他广告", icon: "👆" },
  in_app_interaction: { label: "应用内互动", icon: "🎮" },
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
const SDK_TEMPLATE_SIZES: Record<string, { width: number; height: number; ratio: string }> = {
  static_splash: { width: 1080, height: 1920, ratio: "9:16" },
  video_splash: { width: 1080, height: 1920, ratio: "9:16" },
  interstitial_half: { width: 600, height: 500, ratio: "6:5" },
  interstitial_full: { width: 1080, height: 1920, ratio: "9:16" },
  banner: { width: 320, height: 50, ratio: "32:5" },
  native: { width: 540, height: 200, ratio: "6:5" },
  rewarded_video: { width: 1080, height: 1920, ratio: "9:16" },
};

interface RealAdPreviewProps {
  templateType: string;
  templateName?: string;
  componentLinks?: ComponentLinkConfig[];
  isFullscreen?: boolean;
  onClose?: () => void;
}

export function RealAdPreview({
  templateType,
  templateName,
  componentLinks = [],
  isFullscreen = false,
  onClose,
}: RealAdPreviewProps) {
  const { components } = useComponents();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTime, setShowTime] = useState(0);
  const [triggeredComponents, setTriggeredComponents] = useState<Set<string>>(new Set());
  const [showComponentOverlay, setShowComponentOverlay] = useState(false);
  const [currentTriggeredComponent, setCurrentTriggeredComponent] = useState<ComponentLinkConfig | null>(null);
  const [isVideoComplete, setIsVideoComplete] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isVideoType = templateType === "video_splash" || templateType === "rewarded_video";
  const defaultImage = DEFAULT_IMAGES[templateType];
  const templateSize = SDK_TEMPLATE_SIZES[templateType] || { width: 540, height: 960, ratio: "9:16" };
  const displayName = templateName || SDK_TEMPLATE_NAMES[templateType] || "广告模板";

  // 获取关联组件的详细信息
  const getLinkedComponents = useCallback(() => {
    return componentLinks
      .filter(link => link.status === "enabled")
      .map(link => {
        if (link.componentName && link.componentType) {
          return { ...link, config: link.config || {} };
        }
        const comp = components.find(c => c.id === link.componentId);
        if (comp) {
          return {
            ...link,
            componentName: comp.name,
            componentType: comp.type,
            config: comp.config || {},
          };
        }
        return null;
      })
      .filter(Boolean) as (ComponentLinkConfig & { config: Record<string, unknown> })[];
  }, [componentLinks, components]);

  const linkedComponents = getLinkedComponents();

  // 视频播放控制
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (isPlaying && isVideoType) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, isVideoType]);

  // 计时器效果
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setShowTime(prev => {
        const newTime = prev + 0.1;
        
        linkedComponents.forEach(comp => {
          if (triggeredComponents.has(comp.id)) return;
          
          if (comp.triggerRule === "show_time" && comp.triggerTime && newTime >= comp.triggerTime) {
            setTriggeredComponents(prev => new Set([...prev, comp.id]));
          }
          
          if (comp.triggerRule === "video_complete" && newTime >= 5) {
            setIsVideoComplete(true);
            setTriggeredComponents(prev => new Set([...prev, comp.id]));
          }
        });
        
        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, linkedComponents, triggeredComponents]);

  // 开始模拟
  const handleStartSimulation = () => {
    setIsPlaying(true);
    setShowTime(0);
    setTriggeredComponents(new Set());
    setShowComponentOverlay(false);
    setCurrentTriggeredComponent(null);
    setIsVideoComplete(false);
  };

  // 重置模拟
  const handleReset = () => {
    setIsPlaying(false);
    setShowTime(0);
    setTriggeredComponents(new Set());
    setShowComponentOverlay(false);
    setCurrentTriggeredComponent(null);
    setIsVideoComplete(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  // 点击触发组件
  const handleTriggerComponent = (comp: ComponentLinkConfig & { config: Record<string, unknown> }) => {
    if (comp.triggerRule === "click_close") {
      setIsPlaying(false);
    }
    setCurrentTriggeredComponent(comp);
    setShowComponentOverlay(true);
  };

  // 关闭组件overlay
  const handleCloseComponentOverlay = () => {
    setShowComponentOverlay(false);
    setCurrentTriggeredComponent(null);
  };

  // 根据模板类型渲染主素材
  const renderMainMaterial = () => {
    return (
      <div 
        className="relative w-full h-full overflow-hidden"
        style={{ aspectRatio: `${templateSize.width}/${templateSize.height}` }}
      >
        {/* 背景图片或视频 */}
        {isVideoType ? (
          <video
            ref={videoRef}
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

        {/* 底部渐变遮罩 */}
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

        {/* 跳过按钮 */}
        <div className="absolute top-3 right-3 px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-full">
          <span className="text-white/80 text-xs">跳过 5s</span>
        </div>

        {/* 视频进度条 */}
        {isVideoType && isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div 
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${Math.min((showTime / 5) * 100, 100)}%` }}
            />
          </div>
        )}

        {/* 关闭按钮 */}
        {isPlaying && (
          <button 
            onClick={() => {
              linkedComponents
                .filter(c => c.triggerRule === "click_close")
                .forEach(c => handleTriggerComponent(c));
              if (!linkedComponents.some(c => c.triggerRule === "click_close")) {
                handleReset();
              }
            }}
            className="absolute top-3 left-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white/80 hover:bg-black/70"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* 已触发组件指示器 */}
        {triggeredComponents.size > 0 && (
          <div className="absolute bottom-3 left-3 flex gap-1">
            {linkedComponents
              .filter(c => triggeredComponents.has(c.id))
              .slice(0, 3)
              .map((c) => (
                <div 
                  key={c.id}
                  className="px-2 py-1 bg-purple-500/90 rounded text-xs text-white flex items-center gap-1"
                >
                  <span>{TRIGGER_RULE_LABELS[c.triggerRule]?.icon}</span>
                  <span>{c.componentName.slice(0, 4)}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    );
  };

  // 渲染组件overlay
  const renderComponentOverlay = () => {
    if (!currentTriggeredComponent) return null;
    
    return (
      <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl overflow-hidden max-w-[90%] max-h-[90%] shadow-2xl">
          <div className="w-40 h-32 bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <span className="text-2xl">{TRIGGER_RULE_LABELS[currentTriggeredComponent.triggerRule]?.icon}</span>
              </div>
              <p className="text-xs text-purple-700 font-medium">
                {currentTriggeredComponent.componentName}
              </p>
              <p className="text-[10px] text-purple-500">
                {TRIGGER_RULE_LABELS[currentTriggeredComponent.triggerRule]?.label}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleCloseComponentOverlay}
            className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  // 触发规则面板
  const renderTriggerPanel = () => {
    if (!isPlaying) {
      return (
        <button
          onClick={handleStartSimulation}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" />
          开始模拟
        </button>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">已播放</span>
          <span className="font-medium text-gray-900">{showTime.toFixed(1)}s</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? "暂停" : "继续"}
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            重置
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
      "relative bg-white rounded-lg overflow-hidden",
      isFullscreen ? "w-full h-full" : "w-full"
    )}>
      {/* 主素材 */}
      <div className={cn(
        "relative bg-gray-900",
        isFullscreen ? "w-full h-full" : "aspect-[9/16] max-h-[400px]"
      )}>
        {renderMainMaterial()}
        {renderComponentOverlay()}
      </div>

      {/* 控制面板 */}
      {!isFullscreen && (
        <div className="p-3 bg-gray-50 border-t border-gray-100">
          {renderTriggerPanel()}
        </div>
      )}

      {/* 关闭按钮（可选） */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 z-10"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

export default RealAdPreview;
