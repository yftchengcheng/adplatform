"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Play,
  Clock,
  MousePointer,
  RotateCcw,
  Hand,
  Zap,
  ChevronRight,
  ArrowRight,
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

const SDK_TEMPLATE_NAMES: Record<string, string> = {
  static_splash: "静态开屏",
  video_splash: "视频开屏",
  interstitial_half: "插屏-半屏",
  interstitial_full: "插屏-全屏",
  banner: "横幅",
  native: "原生信息流",
  rewarded_video: "激励视频",
};

const TRIGGER_RULES: Record<TriggerRule, { label: string; icon: React.ReactNode; desc: string }> = {
  video_complete: { label: "视频播放完毕", icon: <Play className="w-4 h-4" />, desc: "视频广告播放完毕，即组件弹出展示" },
  show_time: { label: "出现时间", icon: <Clock className="w-4 h-4" />, desc: "广告展示指定时间后组件弹出" },
  click_close: { label: "点击关闭按钮", icon: <X className="w-4 h-4" />, desc: "点击广告关闭按钮后触发组件展示" },
  back_from_media: { label: "跳转后返回", icon: <RotateCcw className="w-4 h-4" />, desc: "跳转后返回媒体时触发组件展示" },
  click_other_ad: { label: "点击其他广告", icon: <MousePointer className="w-4 h-4" />, desc: "点击其他(匿名)广告后触发" },
  in_app_interaction: { label: "应用内互动", icon: <Hand className="w-4 h-4" />, desc: "应用内非广告互动，如滑动、点击文章等" },
};

// 交互链路步骤
interface FlowStep {
  id: string;
  type: "template" | "trigger" | "component";
  name: string;
  subtitle?: string;
  preview?: string;
  triggerRule?: TriggerRule;
  triggerTime?: number;
  status?: "enabled" | "disabled";
  parentId?: string;
  parentName?: string;
  componentType?: string;
}

// ---- 构建交互链路步骤 ----

function buildFlowSteps(
  templateType: SDKTemplateType,
  templateName: string,
  links: ComponentLinkConfig[]
): FlowStep[][] {
  const defaultImage = DEFAULT_IMAGES[templateType];
  const displayName = templateName || SDK_TEMPLATE_NAMES[templateType] || "广告模板";

  // 找出直接挂在主素材下的组件
  const rootLinks = links.filter((l) => l.parentId === "main" && l.status === "enabled");

  if (rootLinks.length === 0) {
    return [[
      { id: "template", type: "template", name: displayName, preview: defaultImage },
    ]];
  }

  // 每条链路: template → trigger → component
  const chains: FlowStep[][] = rootLinks.map((link) => {
    const chain: FlowStep[] = [
      { id: "template", type: "template", name: displayName, preview: defaultImage },
      {
        id: `trigger_${link.id}`,
        type: "trigger",
        name: TRIGGER_RULES[link.triggerRule]?.label || link.triggerRule,
        triggerRule: link.triggerRule,
        triggerTime: link.triggerTime,
        subtitle:
          link.triggerRule === "show_time" && link.triggerTime
            ? `${link.triggerTime}s 后触发`
            : undefined,
      },
      {
        id: link.id,
        type: "component",
        name: link.componentName,
        preview: link.componentPreview,
        componentType: link.componentType,
        triggerRule: link.triggerRule,
        triggerTime: link.triggerTime,
        status: link.status,
        parentId: link.parentId,
        parentName: link.parentName,
      },
    ];

    // 递归查找子组件链路
    const addChildChains = (parentLinkId: string, currentChain: FlowStep[]) => {
      const childLinks = links.filter(
        (l) => l.parentId === parentLinkId && l.status === "enabled"
      );
      childLinks.forEach((childLink) => {
        currentChain.push(
          {
            id: `trigger_${childLink.id}`,
            type: "trigger",
            name: TRIGGER_RULES[childLink.triggerRule]?.label || childLink.triggerRule,
            triggerRule: childLink.triggerRule,
            triggerTime: childLink.triggerTime,
            subtitle:
              childLink.triggerRule === "show_time" && childLink.triggerTime
                ? `${childLink.triggerTime}s 后触发`
                : undefined,
          },
          {
            id: childLink.id,
            type: "component",
            name: childLink.componentName,
            preview: childLink.componentPreview,
            componentType: childLink.componentType,
            triggerRule: childLink.triggerRule,
            triggerTime: childLink.triggerTime,
            status: childLink.status,
            parentId: childLink.parentId,
            parentName: childLink.parentName,
          }
        );
        addChildChains(childLink.id, currentChain);
      });
    };
    addChildChains(link.id, chain);

    return chain;
  });

  return chains;
}

// ---- 手机框架内模板预览 ----

function PhoneTemplatePreview({ templateType }: { templateType: SDKTemplateType }) {
  const defaultImage = DEFAULT_IMAGES[templateType];
  const isVideoType = templateType === "video_splash" || templateType === "rewarded_video";

  if (templateType === "banner") {
    return (
      <div className="w-full h-full bg-gray-50">
        <div className="h-6 bg-white flex items-center px-3">
          <span className="text-[8px] text-gray-900">9:41</span>
        </div>
        <div className="p-2 space-y-2">
          <div className="h-2 bg-gray-200 rounded w-3/4" />
          <div className="h-8 bg-gray-200 rounded" />
          <div className="h-2 bg-gray-200 rounded w-1/2" />
          <div className="h-8 bg-gray-200 rounded" />
        </div>
        <div className="absolute bottom-4 left-0 right-0 px-2">
          <div className="relative">
            <img src={defaultImage} alt="横幅" className="w-full h-auto rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (templateType === "interstitial_half") {
    return (
      <div className="w-full h-full bg-black/30 flex items-center justify-center">
        <img src={defaultImage} alt="插屏" className="w-[80%] h-auto rounded-lg shadow-lg" />
      </div>
    );
  }

  if (templateType === "native") {
    return (
      <div className="w-full h-full bg-gray-50">
        <div className="h-6 bg-white flex items-center px-3">
          <span className="text-[8px] text-gray-900">9:41</span>
        </div>
        <div className="p-2 space-y-2">
          <div className="h-2 bg-gray-200 rounded w-3/4" />
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <img src={defaultImage} alt="原生" className="w-full h-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (templateType === "rewarded_video") {
    return (
      <div className="w-full h-full bg-black">
        <video src={defaultImage} className="w-full h-full object-cover" muted loop playsInline />
        <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute top-3 left-1/2 -translate-x-1/2">
          <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-white text-center py-0.5 px-3 rounded-full shadow border border-amber-300/30">
            <p className="text-[7px] font-semibold whitespace-nowrap">观看视频领取双倍金币</p>
          </div>
        </div>
      </div>
    );
  }

  // 全屏类型（静态开屏/视频开屏/插屏全屏）
  return (
    <div className="w-full h-full bg-gray-900">
      {isVideoType ? (
        <video src={defaultImage} className="w-full h-full object-cover" muted loop playsInline />
      ) : (
        <img src={defaultImage} alt="开屏" className="w-full h-full object-cover" />
      )}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
}

// ---- 组件预览小卡片 ----

function ComponentPreviewCard({
  name,
  preview,
  componentType,
}: {
  name: string;
  preview: string;
  componentType?: string;
}) {
  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
        <img src={preview} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="px-2 py-1.5 flex items-center gap-1.5">
        <span className="text-[10px] font-medium text-gray-900 truncate">{name}</span>
        {componentType && (
          <span className="text-[8px] text-gray-400 bg-gray-100 px-1 py-0.5 rounded flex-shrink-0">
            {componentType}
          </span>
        )}
      </div>
    </div>
  );
}

// ---- 手机框架 ----

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto bg-gray-900 rounded-[2rem] p-1.5 shadow-2xl" style={{ width: "220px", height: "440px" }}>
      <div className="relative w-full h-full bg-white rounded-[1.7rem] overflow-hidden">
        {/* 刘海 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-5 bg-gray-900 rounded-b-xl z-10" />
        {/* 内容 */}
        <div className="relative w-full h-full overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

// ---- 触发规则动画指示 ----

function TriggerAnimation({ step }: { step: FlowStep }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  const icon = step.triggerRule ? TRIGGER_RULES[step.triggerRule]?.icon : <Zap className="w-4 h-4" />;

  return (
    <div
      className={`flex flex-col items-center transition-all duration-500 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
    >
      {/* 连接线 + 箭头 */}
      <div className="flex flex-col items-center">
        <div className="w-px h-4 bg-gradient-to-b from-blue-300 to-blue-500" />
        <svg width="10" height="8" className="text-blue-500 -mt-0.5">
          <polygon points="5,8 0,0 10,0" fill="currentColor" />
        </svg>
      </div>
      {/* 规则标签 */}
      <div className="mt-1 flex flex-col items-center">
        <div className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-lg shadow-sm">
          <span className="text-amber-600">{icon}</span>
          <span className="text-[11px] font-medium text-amber-700">{step.name}</span>
        </div>
        {step.subtitle && (
          <span className="text-[10px] text-gray-400 mt-1">{step.subtitle}</span>
        )}
      </div>
      {/* 下方连接线 */}
      <div className="flex flex-col items-center mt-1">
        <div className="w-px h-4 bg-gradient-to-b from-blue-500 to-purple-400" />
        <svg width="10" height="8" className="text-purple-400 -mt-0.5">
          <polygon points="5,8 0,0 10,0" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}

// ---- 主组件：全屏预览 ----

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
  const chains = buildFlowSteps(templateType, templateName, componentLinks);
  const enabledLinks = componentLinks.filter((l) => l.status === "enabled");
  const hasLinks = enabledLinks.length > 0;

  // 当前播放的链路索引和步骤
  const [activeChainIndex, setActiveChainIndex] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // 自动播放
  const [isPlaying, setIsPlaying] = useState(false);
  const currentChain = chains[activeChainIndex] || [];

  const totalSteps = currentChain.length;
  const canPlayNext = activeStepIndex < totalSteps - 1;
  const canPlayPrev = activeStepIndex > 0;
  const hasMultipleChains = chains.length > 1;

  // 播放下一步
  const playNext = useCallback(() => {
    if (canPlayNext) {
      setActiveStepIndex((i) => i + 1);
    } else if (activeChainIndex < chains.length - 1) {
      // 切换到下一条链路
      setActiveChainIndex((i) => i + 1);
      setActiveStepIndex(0);
    }
  }, [canPlayNext, activeChainIndex, chains.length]);

  // 播放上一步
  const playPrev = useCallback(() => {
    if (canPlayPrev) {
      setActiveStepIndex((i) => i - 1);
    } else if (activeChainIndex > 0) {
      setActiveChainIndex((i) => i - 1);
      setActiveStepIndex(chains[activeChainIndex - 1].length - 1);
    }
  }, [canPlayPrev, activeChainIndex, chains]);

  // 自动播放逻辑
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      if (canPlayNext) {
        setActiveStepIndex((i) => i + 1);
      } else if (activeChainIndex < chains.length - 1) {
        setActiveChainIndex((i) => i + 1);
        setActiveStepIndex(0);
      } else {
        // 播放完毕，停止
        setIsPlaying(false);
      }
    }, 1500);
    return () => clearInterval(timer);
  }, [isPlaying, canPlayNext, activeChainIndex, chains.length]);

  // 重置
  const handleReset = () => {
    setActiveChainIndex(0);
    setActiveStepIndex(0);
    setIsPlaying(false);
  };

  // 当链路改变时重置步骤
  useEffect(() => {
    setActiveStepIndex(0);
  }, [activeChainIndex]);

  // 当前展示的步骤
  const visibleSteps = currentChain.slice(0, activeStepIndex + 1);
  const currentStep = currentChain[activeStepIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="relative w-full max-w-3xl max-h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* 顶部栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">全屏预览</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              模版预览 → 规则触发 → 组件预览 · {templateName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 overflow-auto p-6">
          {!hasLinks ? (
            /* 无关联组件 */
            <div className="flex flex-col items-center justify-center py-12">
              <PhoneFrame>
                <PhoneTemplatePreview templateType={templateType} />
              </PhoneFrame>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">暂无关联组件</p>
                <p className="text-xs text-gray-400 mt-1">
                  添加组件后可预览完整的广告互动链路
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-8">
              {/* 左侧：手机预览 */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <PhoneFrame>
                  {/* 根据当前步骤显示不同内容 */}
                  {currentStep?.type === "template" && (
                    <PhoneTemplatePreview templateType={templateType} />
                  )}
                  {currentStep?.type === "trigger" && (
                    <div className="w-full h-full bg-gray-900/80 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center">
                          <span className="text-amber-600">
                            {currentStep.triggerRule
                              ? TRIGGER_RULES[currentStep.triggerRule]?.icon
                              : <Zap className="w-5 h-5" />}
                          </span>
                        </div>
                        <p className="text-white text-xs font-medium">{currentStep.name}</p>
                        {currentStep.subtitle && (
                          <p className="text-white/60 text-[10px] mt-1">{currentStep.subtitle}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {currentStep?.type === "component" && currentStep.preview && (
                    <div className="w-full h-full bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
                      <div className="w-full">
                        <img
                          src={currentStep.preview}
                          alt={currentStep.name}
                          className="w-full rounded-lg shadow-lg"
                        />
                        <p className="text-center text-[9px] text-gray-500 mt-2 truncate">
                          {currentStep.name}
                        </p>
                      </div>
                    </div>
                  )}
                </PhoneFrame>

                {/* 手机底部步骤提示 */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    {currentStep?.type === "template" && "Step 1 · 模版展示"}
                    {currentStep?.type === "trigger" && "Step 2 · 规则触发"}
                    {currentStep?.type === "component" && "Step 3 · 组件弹出"}
                  </p>
                </div>
              </div>

              {/* 右侧：交互链路流程 */}
              <div className="flex-1 min-w-0">
                {/* 链路选择 Tab */}
                {hasMultipleChains && (
                  <div className="flex gap-2 mb-5">
                    {chains.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveChainIndex(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          idx === activeChainIndex
                            ? "bg-blue-500 text-white shadow-sm"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        链路 {idx + 1}
                      </button>
                    ))}
                  </div>
                )}

                {/* 流程步骤展示 */}
                <div className="flex flex-col items-center">
                  {visibleSteps.map((step, idx) => {
                    const isActive = idx === activeStepIndex;
                    const isPast = idx < activeStepIndex;

                    return (
                      <React.Fragment key={step.id}>
                        {/* 节点卡片 */}
                        {step.type === "template" && (
                          <div
                            className={`w-full max-w-xs rounded-xl border-2 p-3 transition-all duration-300 ${
                              isActive
                                ? "border-blue-400 bg-blue-50 shadow-md shadow-blue-100"
                                : isPast
                                  ? "border-gray-200 bg-gray-50 opacity-70"
                                  : "border-gray-200 bg-white"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                                <Play className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {step.name}
                                </p>
                                <p className="text-xs text-gray-500">广告模版展示</p>
                              </div>
                              {isActive && (
                                <span className="px-2 py-0.5 bg-blue-500 text-white text-[10px] rounded-full font-medium">
                                  当前
                                </span>
                              )}
                              {isPast && (
                                <span className="text-green-500 text-xs">✓</span>
                              )}
                            </div>
                          </div>
                        )}

                        {step.type === "trigger" && (
                          <div className="my-1">
                            <TriggerAnimation step={step} />
                          </div>
                        )}

                        {step.type === "component" && (
                          <div
                            className={`w-full max-w-xs rounded-xl border-2 p-3 transition-all duration-300 ${
                              isActive
                                ? "border-purple-400 bg-purple-50 shadow-md shadow-purple-100"
                                : isPast
                                  ? "border-gray-200 bg-gray-50 opacity-70"
                                  : "border-gray-200 bg-white"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                                {step.preview ? (
                                  <img
                                    src={step.preview}
                                    alt={step.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {step.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {step.componentType || "组件"}弹出
                                </p>
                              </div>
                              {isActive && (
                                <span className="px-2 py-0.5 bg-purple-500 text-white text-[10px] rounded-full font-medium">
                                  当前
                                </span>
                              )}
                              {isPast && (
                                <span className="text-green-500 text-xs">✓</span>
                              )}
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}

                  {/* 未展示的下一步预览 */}
                  {activeStepIndex < totalSteps - 1 && (
                    <div className="mt-2 flex flex-col items-center">
                      <div className="w-px h-3 bg-gray-200" />
                      <div className="w-full max-w-xs rounded-xl border-2 border-dashed border-gray-200 p-3 opacity-40">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">
                              {currentChain[activeStepIndex + 1]?.type === "trigger"
                                ? "触发规则..."
                                : currentChain[activeStepIndex + 1]?.type === "component"
                                  ? `${currentChain[activeStepIndex + 1]?.name || "组件"}...`
                                  : "下一步..."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部控制栏 */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          {/* 左侧：步骤指示 */}
          <div className="flex items-center gap-1">
            {currentChain.map((step, idx) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === activeStepIndex
                    ? step.type === "template"
                      ? "bg-blue-500 w-4"
                      : step.type === "trigger"
                        ? "bg-amber-500 w-4"
                        : "bg-purple-500 w-4"
                    : idx < activeStepIndex
                      ? "bg-gray-400"
                      : "bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* 中间：控制按钮 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              title="重置"
            >
              <RotateCcw className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={playPrev}
              disabled={!canPlayPrev && activeChainIndex === 0}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="上一步"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 rotate-180" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-sm"
              title={isPlaying ? "暂停" : "播放"}
            >
              {isPlaying ? (
                <div className="flex items-center gap-0.5">
                  <div className="w-1 h-3 bg-white rounded-sm" />
                  <div className="w-1 h-3 bg-white rounded-sm" />
                </div>
              ) : (
                <Play className="w-4 h-4 ml-0.5" />
              )}
            </button>
            <button
              onClick={playNext}
              disabled={!canPlayNext && activeChainIndex >= chains.length - 1}
              className="p-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="下一步"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* 右侧：步骤文字 */}
          <div className="text-xs text-gray-500">
            {activeStepIndex + 1}/{totalSteps}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InteractionPreview;
