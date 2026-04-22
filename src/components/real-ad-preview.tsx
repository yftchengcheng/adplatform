"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, Play, Pause, ChevronDown, ChevronUp, ZoomIn } from "lucide-react";
import { useComponents } from "@/contexts/component-context";
import { cn } from "@/lib/utils";

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
  static_splash: { width: 540, height: 960, ratio: "9:16" },
  video_splash: { width: 540, height: 960, ratio: "9:16" },
  interstitial_half: { width: 540, height: 450, ratio: "6:5" },
  interstitial_full: { width: 540, height: 960, ratio: "9:16" },
  banner: { width: 640, height: 100, ratio: "32:5" },
  native: { width: 540, height: 450, ratio: "6:5" },
  rewarded_video: { width: 540, height: 960, ratio: "9:16" },
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

  // 获取关联组件的详细信息
  const getLinkedComponents = useCallback(() => {
    return componentLinks
      .filter(link => link.status === "enabled")
      .map(link => {
        // 优先使用传入的配置
        if (link.componentName && link.componentType) {
          return { ...link, config: link.config || {} };
        }
        // 否则从组件列表中查找
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
  const displayName = templateName || SDK_TEMPLATE_NAMES[templateType] || "广告模板";
  const templateSize = SDK_TEMPLATE_SIZES[templateType] || { width: 540, height: 960, ratio: "9:16" };

  // 计时器效果
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setShowTime(prev => {
        const newTime = prev + 0.1;
        
        // 检查触发规则
        linkedComponents.forEach(comp => {
          if (triggeredComponents.has(comp.id)) return;
          
          // 出现时间触发
          if (comp.triggerRule === "show_time" && comp.triggerTime && newTime >= comp.triggerTime) {
            setTriggeredComponents(prev => new Set([...prev, comp.id]));
          }
          
          // 视频播放完毕触发（模拟5秒）
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
  };

  // 点击触发组件
  const handleTriggerComponent = (comp: ComponentLinkConfig & { config: Record<string, unknown> }) => {
    const rule = TRIGGER_RULE_LABELS[comp.triggerRule];
    
    // 如果是点击关闭按钮，先关闭再显示
    if (comp.triggerRule === "click_close") {
      setIsPlaying(false);
    }
    
    // 显示组件
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
    const isVideo = templateType === "video_splash" || templateType === "rewarded_video";
    
    return (
      <div 
        className="relative w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden"
        style={{ aspectRatio: `${templateSize.width}/${templateSize.height}` }}
      >
        {/* 主素材内容 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white/60">
            <div className="w-24 h-32 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-xl mx-auto mb-3 flex items-center justify-center">
              {isVideo ? (
                <Play className="w-12 h-12" />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl" />
              )}
            </div>
            <p className="text-sm">{displayName}</p>
            <p className="text-xs text-white/40 mt-1">{templateSize.width}×{templateSize.height}</p>
          </div>
        </div>

        {/* 视频进度条 */}
        {isVideo && isPlaying && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div 
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${Math.min((showTime / 5) * 100, 100)}%` }}
            />
          </div>
        )}

        {/* 关闭按钮（可选） */}
        {isPlaying && (
          <button 
            onClick={() => {
              // 模拟点击关闭
              linkedComponents
                .filter(c => c.triggerRule === "click_close")
                .forEach(c => handleTriggerComponent(c));
              if (!linkedComponents.some(c => c.triggerRule === "click_close")) {
                handleReset();
              }
            }}
            className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white/80 hover:bg-black/70"
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
              .map((c, i) => (
                <div 
                  key={c.id}
                  className="px-2 py-1 bg-purple-500/90 rounded text-xs text-white flex items-center gap-1"
                >
                  <span>{TRIGGER_RULE_LABELS[c.triggerRule]?.icon}</span>
                  <span>{c.componentName.slice(0, 4)}</span>
                </div>
              ))}
            {triggeredComponents.size > 3 && (
              <div className="px-2 py-1 bg-gray-500/90 rounded text-xs text-white">
                +{triggeredComponents.size - 3}
              </div>
            )}
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
          {/* 组件内容（简化版） */}
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
          
          {/* 关闭按钮 */}
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
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          开始模拟
        </button>
      );
    }

    return (
      <div className="space-y-2">
        {/* 计时器 */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">时间</span>
          <span className="font-medium text-gray-700">{showTime.toFixed(1)}s</span>
        </div>

        {/* 已触发组件列表 */}
        <div className="space-y-1">
          <span className="text-xs text-gray-500">已触发 ({triggeredComponents.size}/{linkedComponents.length})</span>
          {linkedComponents.length === 0 ? (
            <p className="text-xs text-gray-400 italic">暂无关联组件</p>
          ) : (
            linkedComponents.map(comp => {
              const isTriggered = triggeredComponents.has(comp.id);
              const rule = TRIGGER_RULE_LABELS[comp.triggerRule];
              
              return (
                <button
                  key={comp.id}
                  onClick={() => isTriggered && handleTriggerComponent(comp)}
                  disabled={!isTriggered}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg text-left text-xs transition-all",
                    isTriggered 
                      ? "bg-purple-50 border border-purple-200 hover:bg-purple-100 cursor-pointer" 
                      : "bg-gray-50 border border-gray-200 opacity-50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{rule?.icon}</span>
                      <span className={isTriggered ? "text-purple-700" : "text-gray-500"}>
                        {comp.componentName}
                      </span>
                    </div>
                    {isTriggered && <span className="text-purple-500">点击查看</span>}
                  </div>
                  <div className="mt-1 text-gray-400">
                    {rule?.label}
                    {comp.triggerRule === "show_time" && comp.triggerTime && ` · ${comp.triggerTime}s`}
                    {comp.triggerRule === "video_complete" && " · 5s"}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* 控制按钮 */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleReset}
            className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium transition-colors"
          >
            重置
          </button>
          {isVideoComplete && (
            <button
              onClick={() => {
                linkedComponents
                  .filter(c => c.triggerRule === "video_complete" && triggeredComponents.has(c.id))
                  .forEach(c => handleTriggerComponent(c));
              }}
              className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-colors"
            >
              查看组件
            </button>
          )}
        </div>
      </div>
    );
  };

  // 全屏预览
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex flex-col">
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900">
          <h3 className="text-white font-medium">{displayName} - 真实预览</h3>
          <button
            onClick={onClose}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* 预览内容 */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-[320px] h-[600px] bg-gray-900 rounded-[2rem] p-2 shadow-2xl">
            <div className="w-full h-full bg-white rounded-[1.8rem] overflow-hidden relative">
              {/* 状态栏 */}
              <div className="h-8 bg-white flex items-end justify-between px-5 pb-0.5">
                <span className="text-[10px] font-medium text-gray-900">9:41</span>
                <div className="flex items-center gap-0.5">
                  <div className="w-1 h-1.5 bg-gray-900 rounded-full" />
                  <div className="w-1 h-1.5 bg-gray-900 rounded-full" />
                  <div className="w-1 h-1.5 bg-gray-900 rounded-full" />
                  <div className="w-1 h-1.5 bg-gray-900 rounded-full" />
                </div>
              </div>

              {/* 主素材 */}
              <div className="flex-1 bg-gray-100 relative overflow-hidden">
                {renderMainMaterial()}
                {renderComponentOverlay()}
              </div>

              {/* 主页指示器 */}
              <div className="h-6 bg-white flex items-center justify-center">
                <div className="w-24 h-0.5 bg-gray-300 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* 底部控制面板 */}
        <div className="bg-gray-900 p-4">
          <div className="max-w-md mx-auto">
            {renderTriggerPanel()}
          </div>
        </div>
      </div>
    );
  }

  // 紧凑预览（编辑页面使用）
  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-100 to-slate-200 flex flex-col">
      {/* 手机框架 */}
      <div className="flex-1 flex items-center justify-center p-2">
        <div 
          className="bg-gray-900 rounded-xl overflow-hidden shadow-lg"
          style={{ width: '120px', height: '200px' }}
        >
          <div className="w-full h-full bg-white rounded-lg overflow-hidden relative">
            {/* 简化状态栏 */}
            <div className="h-3 bg-white flex items-center justify-between px-2">
              <span className="text-[6px] text-gray-900">9:41</span>
              <div className="flex gap-0.5">
                <div className="w-0.5 h-1 bg-gray-900 rounded-full" />
              </div>
            </div>

            {/* 主素材 */}
            <div className="flex-1 relative overflow-hidden">
              {renderMainMaterial()}
              {renderComponentOverlay()}
            </div>
          </div>
        </div>
      </div>

      {/* 触发信息 */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 p-2">
        {linkedComponents.length === 0 ? (
          <p className="text-[10px] text-gray-400 text-center">暂无关联组件</p>
        ) : (
          <div className="flex items-center justify-center gap-1 flex-wrap">
            {linkedComponents.slice(0, 3).map(comp => {
              const rule = TRIGGER_RULE_LABELS[comp.triggerRule];
              return (
                <span 
                  key={comp.id}
                  className="px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded text-[9px]"
                >
                  {rule?.icon} {comp.componentName.slice(0, 4)}
                </span>
              );
            })}
            {linkedComponents.length > 3 && (
              <span className="text-[9px] text-gray-500">+{linkedComponents.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// 兼容旧的 AdInteractionPreview 名称
export { RealAdPreview as AdInteractionPreview };
