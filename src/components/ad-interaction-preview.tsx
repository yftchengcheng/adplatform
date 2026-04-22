"use client";

import React, { useState } from "react";
import { X, ChevronDown, ChevronUp, ZoomIn, ZoomOut } from "lucide-react";
import { useComponents } from "@/contexts/component-context";

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
}

// 触发规则中文名
const TRIGGER_RULE_LABELS: Record<string, string> = {
  video_complete: "视频播放完毕",
  show_time: "出现时间",
  click_close: "点击关闭按钮",
  back_from_media: "跳转后返回",
  click_other_ad: "点击其他广告",
  in_app_interaction: "应用内互动",
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

interface AdInteractionPreviewProps {
  templateType: string;
  templateName?: string;
  componentLinks?: ComponentLinkConfig[];
  showFullscreen?: boolean;
  onClose?: () => void;
}

export function AdInteractionPreview({
  templateType,
  templateName,
  componentLinks = [],
  showFullscreen = false,
  onClose,
}: AdInteractionPreviewProps) {
  const { components } = useComponents();
  const [isExpanded, setIsExpanded] = useState(false);
  const [scale, setScale] = useState(1);

  // 获取关联组件的详细信息
  const getLinkedComponents = () => {
    return componentLinks
      .filter(link => link.status === "enabled")
      .map(link => {
        // 优先使用传入的数据
        if (link.componentName) {
          return {
            name: link.componentName,
            type: link.componentType,
            preview: link.componentPreview,
            triggerRule: TRIGGER_RULE_LABELS[link.triggerRule] || link.triggerRule,
            triggerTime: link.triggerTime,
          };
        }
        // 否则从组件列表中查找
        const comp = components.find(c => c.id === link.componentId);
        if (comp) {
          return {
            name: comp.name,
            type: comp.type,
            preview: getComponentPreview(comp.type, comp.config),
            triggerRule: TRIGGER_RULE_LABELS[link.triggerRule] || link.triggerRule,
            triggerTime: link.triggerTime,
          };
        }
        return null;
      })
      .filter(Boolean) as {
        name: string;
        type: string;
        preview: string;
        triggerRule: string;
        triggerTime?: number;
      }[];
  };

  const linkedComponents = getLinkedComponents();
  const displayName = templateName || SDK_TEMPLATE_NAMES[templateType] || "广告模板";

  // 缩放处理
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));

  // 列表页面小预览
  const ListPreview = () => (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-100 to-slate-200 rounded overflow-hidden">
      {/* 主素材 */}
      <div className="absolute inset-x-2 top-2 bottom-1/2 bg-white rounded-lg shadow-sm flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded mx-auto mb-1" />
          <span className="text-[8px] text-gray-500">主素材</span>
        </div>
      </div>
      
      {/* 链路指示 */}
      {linkedComponents.length > 0 && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-4 h-4 bg-white border border-gray-300 rounded-full flex items-center justify-center">
            <ChevronDown className="w-2 h-2 text-gray-400" />
          </div>
        </div>
      )}
      
      {/* 组件 */}
      <div className="absolute inset-x-2 bottom-2 top-1/2 flex flex-col items-center justify-start pt-4 gap-1">
        {linkedComponents.slice(0, 2).map((comp, index) => (
          <div
            key={index}
            className="w-full bg-gradient-to-br from-purple-100 to-purple-200 rounded shadow-sm p-0.5"
          >
            <div className="bg-white rounded flex items-center gap-1 px-1 py-0.5">
              <div className="w-4 h-3 bg-gray-200 rounded overflow-hidden">
                <img src={comp.preview} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="text-[8px] text-gray-600 truncate flex-1">
                {comp.name.length > 8 ? comp.name.slice(0, 8) + "..." : comp.name}
              </span>
            </div>
          </div>
        ))}
        {linkedComponents.length > 2 && (
          <span className="text-[8px] text-gray-500">+{linkedComponents.length - 2}个</span>
        )}
        {linkedComponents.length === 0 && (
          <div className="w-full h-6 border border-dashed border-gray-300 rounded flex items-center justify-center">
            <span className="text-[8px] text-gray-400">暂无关联</span>
          </div>
        )}
      </div>
    </div>
  );

  // 展开详情预览
  const ExpandedPreview = () => (
    <div 
      className="flex flex-col items-center gap-3 p-4"
      style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
    >
      {/* 主素材 */}
      <div className="w-40 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300 p-3">
        <div className="bg-white rounded shadow-sm p-2 mb-2">
          <div className="aspect-[9/16] bg-gray-100 rounded flex items-center justify-center">
            <img 
              src={`https://picsum.photos/seed/${templateType}/120/200`}
              alt="主素材"
              className="w-full h-full object-cover rounded"
            />
          </div>
        </div>
        <div className="text-center">
          <span className="text-xs font-medium text-blue-700">主素材</span>
          <span className="block text-[10px] text-blue-500">{displayName}</span>
        </div>
      </div>

      {/* 连接线 */}
      {linkedComponents.length > 0 && (
        <div className="relative h-8">
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300 -translate-x-1/2" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center">
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </div>
        </div>
      )}

      {/* 组件列表 */}
      {linkedComponents.length > 0 ? (
        <div className="flex flex-col gap-2">
          {linkedComponents.map((comp, index) => (
            <div
              key={index}
              className="w-40 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-300 p-2"
            >
              <div className="bg-white rounded shadow-sm p-1.5 mb-1.5">
                <div className="h-8 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                  <img src={comp.preview} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="text-center">
                <span className="text-xs font-medium text-purple-700 block truncate">
                  {comp.name}
                </span>
                <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-purple-200 text-purple-600 text-[10px] rounded">
                  {comp.triggerRule}
                  {comp.triggerTime && ` · ${comp.triggerTime}s`}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="w-40 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
          <span className="text-sm text-gray-400">暂无关联组件</span>
          <span className="text-xs text-gray-400 mt-1">可点击编辑添加</span>
        </div>
      )}

      {/* 提示信息 */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">广告互动链路预览</p>
        <p className="text-[10px] text-gray-400 mt-0.5">
          主素材 → {linkedComponents.length > 0 ? `触发 ${linkedComponents.length} 个组件` : '暂无关联'}
        </p>
      </div>
    </div>
  );

  // 全屏弹窗预览
  if (showFullscreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col">
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/50">
          <h3 className="text-white font-medium">广告互动链路预览</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="缩小"
            >
              <ZoomOut className="w-4 h-4 text-white" />
            </button>
            <span className="text-white/80 text-sm">{Math.round(scale * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="放大"
            >
              <ZoomIn className="w-4 h-4 text-white" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors ml-4"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        </div>
        
        {/* 预览内容 */}
        <div className="flex-1 overflow-auto flex items-start justify-center py-8">
          <ExpandedPreview />
        </div>

        {/* 图例 */}
        <div className="px-4 py-3 bg-black/50 border-t border-white/20">
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-100 to-blue-200 border border-blue-300 rounded" />
              <span className="text-white/80 text-xs">主素材</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-br from-purple-100 to-purple-200 border border-purple-300 rounded" />
              <span className="text-white/80 text-xs">关联组件</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-gray-300" />
              <span className="text-white/80 text-xs">触发链路</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 展开详情预览
  if (isExpanded) {
    return (
      <div className="absolute inset-0 z-50 bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="h-full overflow-auto">
          <ExpandedPreview />
        </div>
        {/* 展开视图的工具栏 */}
        <div className="absolute top-2 right-2 flex gap-1">
          <button
            onClick={() => setScale(prev => Math.min(prev + 0.2, 2))}
            className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow transition-colors"
            title="放大"
          >
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => setScale(prev => Math.max(prev - 0.2, 0.5))}
            className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow transition-colors"
            title="缩小"
          >
            <ZoomOut className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    );
  }

  // 默认列表预览
  return (
    <div className="relative w-full h-full group">
      <ListPreview />
      
      {/* 悬停操作 */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(true);
          }}
          className="px-2 py-1 bg-white/90 hover:bg-white rounded text-xs font-medium transition-colors"
        >
          预览
        </button>
        {linkedComponents.length > 0 && (
          <span className="px-2 py-1 bg-purple-500/90 text-white rounded text-xs">
            {linkedComponents.length}个组件
          </span>
        )}
      </div>
    </div>
  );
}

// 获取组件预览图
function getComponentPreview(componentType: string, config?: Record<string, unknown>): string {
  if (config) {
    if (config.previewUrl) return config.previewUrl as string;
    if (config.imageUrl) return config.imageUrl as string;
    if (config.redpacketImageUrl) return config.redpacketImageUrl as string;
  }
  const seedMap: Record<string, string> = {
    redpacket_rain: "redpacket",
    flip_card: "flipcard",
    flip_redpacket: "flipred",
    flip_treasure: "fliptreasure",
    treasure_rain: "treasure",
    scratch_card: "scratch",
    smash_egg: "smash",
    popup_redpacket: "popup",
    dual_button: "dualbtn",
    vote: "vote",
    image: "image",
    ecommerce: "ecom",
    coupon: "coupon",
    promotion_card: "promo",
    game_gift: "game",
  };
  const seed = seedMap[componentType] || componentType;
  return `https://picsum.photos/seed/${seed}/120/80`;
}

export default AdInteractionPreview;
