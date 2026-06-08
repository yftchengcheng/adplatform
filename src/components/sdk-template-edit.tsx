"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  ChevronRight,
  Plus,
  X,
  Eye,
  Play,
  MousePointer,
  RotateCcw,
  Hand,
  Zap,
  Clock,
  Trash2,
  ImageIcon,
  Loader2,
  LayoutGrid,
  CheckSquare,
  ShoppingBag,
  Ticket,
  Layers,
  Gift,
  DollarSign,
  Box,
  CloudRain,
  PenTool,
  Bell,
  Sparkles,
  PanelTop
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useComponents } from "@/contexts/component-context";
import { RealAdPreview } from "./real-ad-preview";
import { InteractionPreview } from "./interaction-preview";

// 组件类型图标映射（与创建组件页面一致）
const COMPONENT_TYPE_ICON_MAP: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  dual_button:    { icon: <LayoutGrid className="w-5 h-5" />,  color: "text-blue-600",   bg: "bg-blue-50" },
  vote:           { icon: <CheckSquare className="w-5 h-5" />, color: "text-violet-600",  bg: "bg-violet-50" },
  image:          { icon: <ImageIcon className="w-5 h-5" />,   color: "text-emerald-600", bg: "bg-emerald-50" },
  ecommerce:      { icon: <ShoppingBag className="w-5 h-5" />, color: "text-orange-600",  bg: "bg-orange-50" },
  coupon:         { icon: <Ticket className="w-5 h-5" />,      color: "text-red-600",     bg: "bg-red-50" },
  promotion_card: { icon: <Layers className="w-5 h-5" />,      color: "text-cyan-600",    bg: "bg-cyan-50" },
  game_gift:      { icon: <Gift className="w-5 h-5" />,        color: "text-pink-600",    bg: "bg-pink-50" },
  redpacket_rain: { icon: <DollarSign className="w-5 h-5" />,  color: "text-red-600",     bg: "bg-red-50" },
  flip_card:      { icon: <Sparkles className="w-5 h-5" />,    color: "text-indigo-600",  bg: "bg-indigo-50" },
  flip_redpacket: { icon: <Gift className="w-5 h-5" />,        color: "text-rose-600",    bg: "bg-rose-50" },
  flip_treasure:  { icon: <Box className="w-5 h-5" />,         color: "text-amber-600",   bg: "bg-amber-50" },
  treasure_rain:  { icon: <CloudRain className="w-5 h-5" />,   color: "text-teal-600",    bg: "bg-teal-50" },
  scratch_card:   { icon: <PenTool className="w-5 h-5" />,     color: "text-purple-600",  bg: "bg-purple-50" },
  smash_egg:      { icon: <Sparkles className="w-5 h-5" />,    color: "text-yellow-600",  bg: "bg-yellow-50" },
  popup_redpacket:{ icon: <Bell className="w-5 h-5" />,        color: "text-rose-600",    bg: "bg-rose-50" },
  floating_window: { icon: <PanelTop className="w-5 h-5" />,   color: "text-sky-600",     bg: "bg-sky-50" },
};

function getComponentTypeIcon(typeKey: string): { icon: React.ReactNode; color: string; bg: string } {
  return COMPONENT_TYPE_ICON_MAP[typeKey] || { icon: <Layers className="w-5 h-5" />, color: "text-gray-600", bg: "bg-gray-50" };
}

// 获取触发规则图标（组件外定义，供 InteractionFlowChart 和 SDKTemplateEdit 共用）
function getTriggerRuleIcon(rule: TriggerRule): React.ReactNode {
  return TRIGGER_RULES[rule]?.icon || <Zap className="w-4 h-4" />;
}

// 交互链路节点类型
interface FlowNode {
  id: string;
  name: string;
  type: "template" | "component";
  subtitle?: string;
  preview?: string;
  componentTypeKey?: string;
  status?: "enabled" | "disabled";
  triggerRule?: TriggerRule;
  triggerTime?: number;
  children: FlowNode[];
}

// 构建交互链路树
function buildFlowTree(
  templateType: SDKTemplateType,
  templateName: string,
  links: ComponentLinkConfig[]
): FlowNode {
  const info = SDK_TEMPLATE_INFO[templateType];
  const size = SDK_TEMPLATE_SIZES[templateType];

  const root: FlowNode = {
    id: "main",
    name: templateName,
    type: "template",
    subtitle: `${size.width}×${size.height} · ${size.ratio}`,
    children: [],
  };

  // 找出直接子节点（parentId === "main"）
  const linkMap = new Map<string, ComponentLinkConfig>();
  links.forEach((link) => linkMap.set(link.id, link));

  const nodeMap = new Map<string, FlowNode>();

  // 递归构建子节点
  function buildNode(link: ComponentLinkConfig): FlowNode {
    const triggerLabel = TRIGGER_RULES[link.triggerRule]?.label || link.triggerRule;
    const node: FlowNode = {
      id: link.id,
      name: link.componentName,
      type: "component",
      subtitle: `${triggerLabel}${link.triggerRule === "show_time" ? ` ${link.triggerTime}s` : ""}`,
      preview: link.componentPreview,
      componentTypeKey: link.componentTypeKey,
      status: link.status,
      triggerRule: link.triggerRule,
      triggerTime: link.triggerTime,
      children: [],
    };
    // 找到以此 link 为父级的子 links
    links
      .filter((l) => l.parentId === link.id)
      .forEach((childLink) => {
        node.children.push(buildNode(childLink));
      });
    return node;
  }

  // 先添加直接挂在主素材下的组件
  links
    .filter((l) => l.parentId === "main")
    .forEach((link) => {
      root.children.push(buildNode(link));
    });

  return root;
}

// SDK模板类型
type SDKTemplateType = 
  | "static_splash"      // 静态开屏
  | "video_splash"        // 视频开屏
  | "interstitial_half"   // 插屏-半屏
  | "interstitial_full"   // 插屏-全屏
  | "banner"              // 横幅
  | "native"              // 原生（信息流）
  | "rewarded_video";     // 激励视频

// 触发规则类型
type TriggerRule = 
  | "video_complete"      // 视频播放完毕
  | "show_time"           // 出现时间
  | "click_close"         // 点击广告关闭按钮
  | "back_from_media"     // 跳转后返回媒体
  | "click_other_ad"      // 点击其他(匿名)广告
  | "in_app_interaction"; // 应用内非广告互动

// 触发规则配置
const TRIGGER_RULES: Record<TriggerRule, { label: string; icon: React.ReactNode; desc: string }> = {
  video_complete: {
    label: "视频播放完毕",
    icon: <Play className="w-4 h-4" />,
    desc: "视频广告播放完毕，即组件弹出展示"
  },
  show_time: {
    label: "出现时间",
    icon: <Clock className="w-4 h-4" />,
    desc: "广告展示指定时间后组件弹出"
  },
  click_close: {
    label: "点击关闭按钮",
    icon: <X className="w-4 h-4" />,
    desc: "点击广告关闭按钮后触发组件展示"
  },
  back_from_media: {
    label: "跳转后返回",
    icon: <RotateCcw className="w-4 h-4" />,
    desc: "跳转后返回媒体时触发组件展示"
  },
  click_other_ad: {
    label: "点击其他广告",
    icon: <MousePointer className="w-4 h-4" />,
    desc: "点击其他(匿名)广告后触发"
  },
  in_app_interaction: {
    label: "应用内互动",
    icon: <Hand className="w-4 h-4" />,
    desc: "应用内非广告互动，如滑动、点击文章等"
  }
};

// 组件关联配置
interface ComponentLinkConfig {
  id: string;
  componentId: string;        // 关联的组件ID
  componentName: string;      // 关联的组件名称
  componentType: string;      // 组件类型（中文显示名）
  componentTypeKey: string;   // 组件类型原始key（如 redpacket_rain）
  componentPreview: string;    // 组件预览图
  componentConfig?: Record<string, unknown>; // 组件配置数据
  triggerRule: TriggerRule;    // 触发规则
  triggerTime?: number;       // 触发时间（秒），仅show_time类型使用
  parentId?: string;          // 上一级ID（主素材或已添加的组件）
  parentName?: string;        // 上一级名称
  status: "enabled" | "disabled";
}

// SDK模板信息
const SDK_TEMPLATE_INFO: Record<SDKTemplateType, { name: string; desc: string }> = {
  static_splash: { name: "静态开屏", desc: "静态图片展示，应用启动时展示品牌广告" },
  video_splash: { name: "视频开屏", desc: "视频素材播放，应用启动时自动播放" },
  interstitial_half: { name: "插屏-半屏", desc: "半屏展示，覆盖部分屏幕" },
  interstitial_full: { name: "插屏-全屏", desc: "全屏展示，强制用户观看" },
  banner: { name: "横幅", desc: "顶部或底部横幅，持续展示" },
  native: { name: "原生（信息流）", desc: "融入内容的原生广告" },
  rewarded_video: { name: "激励视频", desc: "用户主动观看获取奖励" },
};

// 模版尺寸配置
const SDK_TEMPLATE_SIZES: Record<SDKTemplateType, { width: number; height: number; ratio: string }> = {
  static_splash: { width: 540, height: 960, ratio: "9:16" },
  video_splash: { width: 540, height: 960, ratio: "9:16" },
  interstitial_half: { width: 600, height: 500, ratio: "6:5" },
  interstitial_full: { width: 1080, height: 1920, ratio: "9:16" },
  banner: { width: 1080, height: 120, ratio: "9:1" },
  native: { width: 1080, height: 540, ratio: "2:1" },
  rewarded_video: { width: 1080, height: 1920, ratio: "9:16" },
};

// 组件类型对应的中文名称
const COMPONENT_TYPE_NAMES: Record<string, string> = {
  redpacket_rain: "红包雨",
  flip_card: "翻卡",
  flip_redpacket: "翻红包",
  flip_treasure: "翻宝箱",
  treasure_rain: "宝箱雨",
  scratch_card: "刮刮卡",
  smash_egg: "砸蛋",
  popup_redpacket: "弹窗红包",
  dual_button: "双按钮",
  vote: "投票磁贴",
  image: "图片磁贴",
  ecommerce: "电商磁贴",
  coupon: "优惠券磁贴",
  promotion_card: "推广卡片",
  game_gift: "游戏礼包码",
};

// 获取组件预览图
function getComponentPreview(componentType: string, config?: Record<string, unknown>): string {
  // 根据组件类型和配置获取预览图
  if (config) {
    // 优先使用配置的预览图
    if (config.previewUrl) return config.previewUrl as string;
    if (config.imageUrl) return config.imageUrl as string;
    if (config.redpacketImageUrl) return config.redpacketImageUrl as string;
    // 电商磁贴
    if ((config as { imageUrl?: string }).imageUrl) {
      return (config as { imageUrl: string }).imageUrl;
    }
  }
  // 使用组件类型生成默认预览图
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

// 获取组件类型中文名称
function getComponentTypeName(componentType: string): string {
  return COMPONENT_TYPE_NAMES[componentType] || componentType;
}

// 交互链路流程图组件
function InteractionFlowChart({
  templateType,
  templateName,
  componentLinks,
}: {
  templateType: SDKTemplateType;
  templateName: string;
  componentLinks: ComponentLinkConfig[];
}) {
  const tree = buildFlowTree(templateType, templateName, componentLinks);

  // 获取触发规则对应的颜色和图标
  const getTriggerStyle = (rule?: TriggerRule) => {
    const styles: Record<string, { color: string; bg: string; border: string }> = {
      video_complete: { color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
      show_time: { color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
      click_close: { color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
      back_from_media: { color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
      click_other_ad: { color: "text-pink-700", bg: "bg-pink-50", border: "border-pink-200" },
      in_app_interaction: { color: "text-teal-700", bg: "bg-teal-50", border: "border-teal-200" },
    };
    return styles[rule || "show_time"] || styles.show_time;
  };

  // 渲染节点卡片
  const renderNode = (node: FlowNode, depth: number = 0) => {
    const isTemplate = node.type === "template";
    const isDisabled = node.status === "disabled";
    const triggerStyle = getTriggerStyle(node.triggerRule);

    return (
      <div key={node.id} className="flex flex-col items-center">
        {/* 节点卡片 */}
        <div
          className={`
            relative rounded-lg border-2 px-4 py-3 min-w-[160px] max-w-[220px] transition-all
            ${isTemplate
              ? "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400 shadow-md shadow-blue-200"
              : isDisabled
                ? "bg-gray-50 border-gray-200 opacity-50"
                : "bg-white border-gray-200 shadow-sm hover:shadow-md"
            }
          `}
        >
          {/* 顶部：图标+名称 */}
          <div className="flex items-center gap-2.5">
            {isTemplate ? (
              <div className="w-9 h-9 rounded bg-white/20 flex items-center justify-center flex-shrink-0">
                <Play className="w-4 h-4 text-white" />
              </div>
            ) : (() => {
              const iconInfo = getComponentTypeIcon(node.componentTypeKey || "");
              const IconComponent = (() => {
                const key = node.componentTypeKey || "";
                const map: Record<string, typeof LayoutGrid> = {
                  dual_button: LayoutGrid,
                  vote: CheckSquare,
                  image: ImageIcon,
                  ecommerce: ShoppingBag,
                  coupon: Ticket,
                  promotion_card: Layers,
                  game_gift: Gift,
                  redpacket_rain: DollarSign,
                  flip_card: Sparkles,
                  flip_redpacket: Gift,
                  flip_treasure: Box,
                  treasure_rain: CloudRain,
                  scratch_card: PenTool,
                  smash_egg: Sparkles,
                  popup_redpacket: Bell,
                };
                return map[key] || Layers;
              })();
              return (
                <div className={`w-9 h-9 rounded-lg ${iconInfo.bg} flex items-center justify-center flex-shrink-0 ${iconInfo.color}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
              );
            })()}
            <div className="min-w-0 flex-1">
              <div
                className={`text-sm font-semibold truncate ${
                  isTemplate ? "text-white" : isDisabled ? "text-gray-400" : "text-gray-900"
                }`}
              >
                {node.name}
              </div>
              {node.subtitle && (
                <div
                  className={`text-xs mt-0.5 truncate ${
                    isTemplate ? "text-blue-100" : isDisabled ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {node.subtitle}
                </div>
              )}
            </div>
          </div>

          {/* 状态标签 */}
          {!isTemplate && node.triggerRule && (
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${triggerStyle.color} ${triggerStyle.bg} border ${triggerStyle.border}`}
              >
                {getTriggerRuleIcon(node.triggerRule)}
                {TRIGGER_RULES[node.triggerRule]?.label}
              </span>
              {node.triggerRule === "show_time" && node.triggerTime && (
                <span className="text-[10px] text-gray-400">{node.triggerTime}s</span>
              )}
            </div>
          )}

          {/* 禁用标签 */}
          {isDisabled && (
            <div className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-gray-400 text-white text-[9px] rounded-full">
              已禁用
            </div>
          )}
        </div>

        {/* 子节点 */}
        {node.children.length > 0 && (
          <div className="flex flex-col items-center mt-0">
            {/* 连接线（竖线） */}
            <div className="w-px h-5 bg-gray-300" />
            {/* 横向分支 */}
            {node.children.length === 1 ? (
              <div className="flex flex-col items-center">
                <div className="w-px h-4 bg-gray-300" />
                {renderNode(node.children[0], depth + 1)}
              </div>
            ) : (
              <div className="relative">
                {/* 横线连接 */}
                <div
                  className="absolute top-0 bg-gray-300"
                  style={{
                    left: `${(0.5 / node.children.length) * 100}%`,
                    right: `${(0.5 / node.children.length) * 100}%`,
                    height: "1px",
                  }}
                />
                <div className="flex gap-6">
                  {node.children.map((child, idx) => (
                    <div key={child.id} className="flex flex-col items-center">
                      {/* 竖线连接到横线 */}
                      <div className="w-px h-4 bg-gray-300" />
                      {/* 箭头 */}
                      <svg width="12" height="8" className="text-gray-300">
                        <polygon points="6,8 0,0 12,0" fill="currentColor" />
                      </svg>
                      {renderNode(child, depth + 1)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 rounded-lg overflow-auto p-6" style={{ minHeight: "400px" }}>
      {componentLinks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Zap className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">暂无交互链路</p>
          <p className="text-xs mt-1">添加组件后将自动生成交互链路图</p>
        </div>
      ) : (
        <div className="flex justify-center">
          {renderNode(tree)}
        </div>
      )}
    </div>
  );
}

interface SDKTemplateEditProps {
  type: SDKTemplateType;
  templateId?: string;
}

export function SDKTemplateEdit({ type, templateId }: SDKTemplateEditProps) {
  const router = useRouter();
  const { components, loading } = useComponents();
  const info = SDK_TEMPLATE_INFO[type];
  const sizeConfig = SDK_TEMPLATE_SIZES[type];
  
  // 基础配置状态
  const [templateName, setTemplateName] = useState(`${info.name}模板1`);
  const [adSlot, setAdSlot] = useState("slot_static_0001");
  
  // 组件关联配置列表（初始为空）
  const [componentLinks, setComponentLinks] = useState<ComponentLinkConfig[]>([]);

  // 数据加载/保存状态
  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // 页面加载时从API获取模板数据
  useEffect(() => {
    async function loadTemplate() {
      if (!templateId) {
        setDataLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/sdk/templates/${templateId}`);
        const json = await res.json();
        if (json.success && json.data) {
          // 恢复基础配置
          if (json.data.name) setTemplateName(json.data.name);
          if (json.data.ad_slot) setAdSlot(json.data.ad_slot);
          // 恢复组件关联配置
          if (json.data.componentLinks && Array.isArray(json.data.componentLinks)) {
            const links: ComponentLinkConfig[] = json.data.componentLinks.map(
              (row: {
                id: string;
                component_id: string;
                component_type_key: string;
                component_config: Record<string, unknown>;
                parent_id: string;
                parent_name: string;
                trigger_rule: string;
                trigger_time: number;
                status: string;
              }) => {
                // 从组件列表中查找组件名称和类型
                const comp = components.find(c => c.id === row.component_id);
                return {
                  id: row.id,
                  componentId: row.component_id,
                  componentName: comp?.name || row.component_id,
                  componentType: comp ? getComponentTypeName(comp.type) : (COMPONENT_TYPE_NAMES[row.component_type_key] || row.component_type_key),
                  componentTypeKey: row.component_type_key || comp?.type || "",
                  componentPreview: comp ? getComponentPreview(comp.type, comp.config) : getComponentPreview(row.component_type_key, row.component_config),
                  componentConfig: row.component_config || comp?.config,
                  triggerRule: (row.trigger_rule || "show_time") as TriggerRule,
                  triggerTime: row.trigger_time || undefined,
                  parentId: row.parent_id || "main",
                  parentName: row.parent_name || "主素材",
                  status: (row.status === "enabled" ? "enabled" : "disabled") as "enabled" | "disabled",
                };
              }
            );
            setComponentLinks(links);
          }
        }
      } catch (err) {
        console.error("Failed to load template data:", err);
      } finally {
        setDataLoading(false);
      }
    }
    // 等待 components 加载完成后再加载模板（因为需要组件名称映射）
    if (!loading) {
      loadTemplate();
    }
  }, [templateId, loading, components]);

  // Toast 自动消失
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);
  
  // 将组件列表转换为选择器需要的格式
  const availableComponents = components.map(comp => ({
    id: comp.id,
    name: comp.name,
    type: comp.type,
    preview: getComponentPreview(comp.type, comp.config),
  }));

  // 选择组件弹窗
  const [showComponentPicker, setShowComponentPicker] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  
  // 触发时间弹窗
  const [showTimeDialog, setShowTimeDialog] = useState<string | null>(null);
  const [timeValue, setTimeValue] = useState(5);

  // 选择上一级弹窗
  const [showParentPicker, setShowParentPicker] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<SelectableComponent | null>(null);

  // 全屏预览
  const [showFullscreenPreview, setShowFullscreenPreview] = useState(false);

  // 上一级选项类型
  interface ParentOption {
    id: string;
    name: string;
    type: "main" | "component";
    preview?: string;
    componentTypeKey?: string;
  }

  // 获取上一级选项列表
  const getParentOptions = (): ParentOption[] => {
    const options: ParentOption[] = [
      { id: "main", name: "主素材", type: "main" }
    ];
    // 添加已配置的组件
    componentLinks
      .filter(link => link.status === "enabled")
      .forEach(link => {
        options.push({
          id: link.id,
          name: link.componentName,
          type: "component",
          preview: link.componentPreview,
          componentTypeKey: link.componentTypeKey,
        });
      });
    return options;
  };

  // 返回列表
  const handleBack = () => {
    router.push(`/sdk/${type}`);
  };

  // 保存模板（插入新记录）
  const handleSave = async () => {
    if (saving) return;

    // 校验
    if (!templateName.trim()) {
      setToastMessage({ text: "请输入模板名称", type: "error" });
      return;
    }

    setSaving(true);
    try {
      const formatMap: Record<string, string> = {
        static_splash: "图片",
        video_splash: "视频",
        interstitial_half: "图片+文字",
        interstitial_full: "图片",
        banner: "图片+文字",
        native: "图片+文字",
        rewarded_video: "视频",
      };

      const payload = {
        type,
        name: templateName.trim(),
        format: formatMap[type] || "图片",
        adSlot: adSlot.trim(),
        width: sizeConfig.width,
        height: sizeConfig.height,
        ratio: sizeConfig.ratio,
        componentLinks: componentLinks.map((link, index) => ({
          id: link.id,
          componentId: link.componentId,
          componentTypeKey: link.componentTypeKey,
          componentConfig: link.componentConfig,
          parentId: link.parentId || "main",
          parentName: link.parentName || "主素材",
          triggerRule: link.triggerRule,
          triggerTime: link.triggerTime,
          status: link.status,
          sortOrder: index,
        })),
      };

      // 编辑模式（有templateId）使用PUT更新，新增模式使用POST
      const url = templateId ? `/api/sdk/templates/${templateId}` : "/api/sdk/templates";
      const method = templateId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        // 保存成功后返回模板列表
        router.push(`/sdk/${type}`);
      } else {
        setToastMessage({ text: json.error || "保存失败", type: "error" });
      }
    } catch (err) {
      console.error("Save failed:", err);
      setToastMessage({ text: "保存失败，请重试", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // 添加组件关联
  const handleAddComponent = () => {
    setShowComponentPicker(true);
    setSelectedComponent(null);
    setEditingLinkId(null);
  };

  // 选择组件（打开上一级选择）
  interface SelectableComponent {
    id: string;
    name: string;
    type: string;
    preview: string;
  }
  const handleSelectComponent = (component: SelectableComponent) => {
    setSelectedComponent(component);
    setShowComponentPicker(false);
    setShowParentPicker(true);
  };

  // 选择上一级后添加/修改组件
  const handleSelectParent = (parent: ParentOption) => {
    if (editingLinkId) {
      // 编辑模式：修改已有组件的上一级，校验新父级的规则冲突
      setComponentLinks(prev => {
        const target = prev.find(l => l.id === editingLinkId);
        if (!target) return prev;
        const parentId = parent.id;
        const siblingUsed = new Set<TriggerRule>();
        prev.forEach(l => {
          if (l.parentId === parentId && l.id !== editingLinkId && l.status === "enabled") {
            siblingUsed.add(l.triggerRule);
          }
        });
        let newRule = target.triggerRule;
        let newTime = target.triggerTime;
        if (siblingUsed.has(target.triggerRule)) {
          const allRules = Object.keys(TRIGGER_RULES) as TriggerRule[];
          const available = allRules.find(r => !siblingUsed.has(r));
          if (available) {
            newRule = available;
            newTime = available === "show_time" ? 5 : undefined;
          }
        }
        return prev.map(link => {
          if (link.id === editingLinkId) {
            return { ...link, parentId: parent.id, parentName: parent.name, triggerRule: newRule, triggerTime: newTime };
          }
          return link;
        });
      });
      setShowParentPicker(false);
      setSelectedComponent(null);
      setEditingLinkId(null);
    } else if (selectedComponent) {
      // 新增模式：添加新组件，自动选择第一个同级可用的触发规则
      const autoRule = getFirstAvailableRule(parent.id);
      const newLink: ComponentLinkConfig = {
        id: `link_${Date.now()}`,
        componentId: selectedComponent.id,
        componentName: selectedComponent.name,
        componentType: getComponentTypeName(selectedComponent.type),
        componentTypeKey: selectedComponent.type,
        componentPreview: selectedComponent.preview,
        componentConfig: components.find(c => c.id === selectedComponent.id)?.config,
        triggerRule: autoRule,
        triggerTime: autoRule === "show_time" ? 5 : undefined,
        parentId: parent.id,
        parentName: parent.name,
        status: "enabled"
      };
      setComponentLinks(prev => [...prev, newLink]);
      setShowParentPicker(false);
      setSelectedComponent(null);
    }
  };

  // 修改组件的上一级
  const handleChangeParent = (linkId: string, parent: ParentOption) => {
    setComponentLinks(prev => prev.map(link => {
      if (link.id === linkId) {
        return { ...link, parentId: parent.id, parentName: parent.name };
      }
      return link;
    }));
  };

  // 更新触发规则（带同级唯一性校验）
  const handleUpdateTriggerRule = (linkId: string, rule: TriggerRule) => {
    setComponentLinks(prev => {
      const target = prev.find(l => l.id === linkId);
      if (!target) return prev;
      // 校验同级唯一性
      const parentId = target.parentId || "main";
      const siblingUsed = new Set<TriggerRule>();
      prev.forEach(l => {
        if (l.parentId === parentId && l.id !== linkId && l.status === "enabled") {
          siblingUsed.add(l.triggerRule);
        }
      });
      if (siblingUsed.has(rule)) return prev; // 规则已被使用，不更新
      return prev.map(link => {
        if (link.id === linkId) {
          return { ...link, triggerRule: rule, triggerTime: rule === "show_time" ? (link.triggerTime || 5) : undefined };
        }
        return link;
      });
    });
  };

  // 更新触发时间
  const handleUpdateTriggerTime = (linkId: string) => {
    setComponentLinks(prev => prev.map(link => {
      if (link.id === linkId) {
        return { ...link, triggerTime: timeValue };
      }
      return link;
    }));
    setShowTimeDialog(null);
  };

  // 删除组件关联
  const handleDeleteLink = (linkId: string) => {
    setComponentLinks(prev => prev.filter(link => link.id !== linkId));
  };

  // 切换组件状态（启用时校验同级规则冲突）
  const handleToggleStatus = (linkId: string) => {
    setComponentLinks(prev => {
      const target = prev.find(l => l.id === linkId);
      if (!target) return prev;
      if (target.status === "disabled") {
        // 启用时校验同级规则冲突
        const parentId = target.parentId || "main";
        const siblingUsed = new Set<TriggerRule>();
        prev.forEach(l => {
          if (l.parentId === parentId && l.id !== linkId && l.status === "enabled") {
            siblingUsed.add(l.triggerRule);
          }
        });
        // 如果当前规则已被同级使用，自动切换到第一个可用规则
        let newRule = target.triggerRule;
        let newTime = target.triggerTime;
        if (siblingUsed.has(target.triggerRule)) {
          const allRules = Object.keys(TRIGGER_RULES) as TriggerRule[];
          const available = allRules.find(r => !siblingUsed.has(r));
          if (available) {
            newRule = available;
            newTime = available === "show_time" ? 5 : undefined;
          }
        }
        return prev.map(link => {
          if (link.id === linkId) {
            return { ...link, status: "enabled", triggerRule: newRule, triggerTime: newTime };
          }
          return link;
        });
      } else {
        // 禁用无需校验
        return prev.map(link => {
          if (link.id === linkId) {
            return { ...link, status: "disabled" };
          }
          return link;
        });
      }
    });
  };

  // 获取同级已使用的触发规则
  const getSiblingUsedRules = (linkId: string, parentId: string): Set<TriggerRule> => {
    const usedRules = new Set<TriggerRule>();
    componentLinks.forEach(l => {
      if (l.parentId === parentId && l.id !== linkId && l.status === "enabled") {
        usedRules.add(l.triggerRule);
      }
    });
    return usedRules;
  };

  // 获取同级第一个可用的触发规则（用于新增组件时自动选择）
  const getFirstAvailableRule = (parentId: string): TriggerRule => {
    const usedRules = new Set<TriggerRule>();
    componentLinks.forEach(l => {
      if (l.parentId === parentId && l.status === "enabled") {
        usedRules.add(l.triggerRule);
      }
    });
    const allRules = Object.keys(TRIGGER_RULES) as TriggerRule[];
    const available = allRules.find(r => !usedRules.has(r));
    return available || "show_time";
  };

  // 渲染触发规则选择器
  const renderTriggerRuleSelector = (link: ComponentLinkConfig) => {
    const siblingUsedRules = getSiblingUsedRules(link.id, link.parentId || "main");
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {(Object.keys(TRIGGER_RULES) as TriggerRule[]).map(rule => {
          const isSelected = link.triggerRule === rule;
          const isUsedBySibling = siblingUsedRules.has(rule);
          const isDisabled = isUsedBySibling && !isSelected;
          return (
            <button
              key={rule}
              onClick={() => !isDisabled && handleUpdateTriggerRule(link.id, rule)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all ${
                isSelected
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : isDisabled
                    ? "bg-gray-50 text-gray-300 border border-gray-100 cursor-not-allowed line-through"
                    : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
              }`}
              title={isDisabled ? `该规则已被同级组件使用` : TRIGGER_RULES[rule].desc}
            >
              {getTriggerRuleIcon(rule)}
              <span>{TRIGGER_RULES[rule].label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">编辑模板</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  {info.name} · {sizeConfig.width}×{sizeConfig.height} · {sizeConfig.ratio}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleBack}>
                取消
              </Button>
              <Button 
                className="bg-blue-500 hover:bg-blue-600"
                onClick={handleSave}
                disabled={saving || dataLoading}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    保存中...
                  </>
                ) : "保存"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ minHeight: '600px' }}>
          {/* 左侧：配置面板 */}
          <div className="space-y-4">
            {/* 基础配置 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4">基础配置</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">模板ID</label>
                  <Input 
                    value={templateId || "sdk_static_splash_000001"} 
                    disabled 
                    className="bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">模板名称</label>
                  <Input 
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="请输入模板名称"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">广告位ID</label>
                  <Input 
                    value={adSlot}
                    onChange={(e) => setAdSlot(e.target.value)}
                    placeholder="请输入广告位ID"
                  />
                </div>
              </div>
            </div>

            {/* 组件关联配置 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">组件关联配置</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddComponent}
                  className="h-8"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  添加组件
                </Button>
              </div>
              
              {/* 组件列表 */}
              <div className="space-y-3">
                {componentLinks.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">暂未关联组件</p>
                    <p className="text-xs mt-1">点击上方按钮添加组件</p>
                  </div>
                ) : (
                  componentLinks.map((link) => (
                    <div 
                      key={link.id}
                      className={`border rounded-lg p-3 transition-all ${
                        link.status === "enabled" 
                          ? "border-blue-200 bg-blue-50/50" 
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      {/* 组件信息 */}
                      <div className="flex items-start gap-3">
                        {(() => {
                          const iconInfo = getComponentTypeIcon(link.componentTypeKey);
                          return (
                            <div className={`w-10 h-10 rounded-lg ${iconInfo.bg} flex items-center justify-center flex-shrink-0 ${iconInfo.color}`}>
                              {iconInfo.icon}
                            </div>
                          );
                        })()}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {link.componentName}
                            </span>
                            <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                              {link.componentType}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedComponent({
                                id: link.componentId,
                                name: link.componentName,
                                type: link.componentType,
                                preview: link.componentPreview
                              });
                              setEditingLinkId(link.id);
                              setShowParentPicker(true);
                            }}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                          >
                            <span className="text-gray-500">上一级：</span>
                            <span className="font-medium">{link.parentName}</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggleStatus(link.id)}
                            className={`p-1.5 rounded transition-colors ${
                              link.status === "enabled"
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-400"
                            }`}
                            title={link.status === "enabled" ? "已启用" : "已禁用"}
                          >
                            {link.status === "enabled" ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteLink(link.id)}
                            className="p-1.5 rounded bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* 触发规则 */}
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">触发规则</p>
                        {renderTriggerRuleSelector(link)}
                        
                        {/* 出现时间输入 */}
                        {link.triggerRule === "show_time" && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">延迟</span>
                            <button
                              onClick={() => {
                                setTimeValue(link.triggerTime || 5);
                                setShowTimeDialog(link.id);
                              }}
                              className="px-2 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50"
                            >
                              {link.triggerTime}s
                            </button>
                            <span className="text-xs text-gray-500">后弹出</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* 提示信息 */}
              {componentLinks.length > 0 && (
                <p className="text-xs text-gray-400 mt-3">
                  提示：同层级相同触发规则只能配置一次
                </p>
              )}
            </div>
          </div>

          {/* 右侧：预览区域 */}
          <div className="space-y-4">
            {/* 广告互动链路示意图 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-900">广告互动链路示意图</h3>
                  <span className="text-xs text-gray-400">展示模版与组件的交互关系</span>
                </div>
                <button
                  onClick={() => setShowFullscreenPreview(true)}
                  className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  全屏预览
                </button>
              </div>
              <InteractionFlowChart
                templateType={type}
                templateName={info.name}
                componentLinks={componentLinks}
              />
            </div>

            {/* 组件预览 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4">组件预览</h3>
              {loading ? (
                <div className="flex items-center justify-center py-8 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span className="text-sm">加载中...</span>
                </div>
              ) : availableComponents.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">暂无组件</p>
                  <p className="text-xs mt-1">请先在「组件管理」中创建组件</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableComponents.map((comp) => {
                    const iconInfo = getComponentTypeIcon(comp.type);
                    return (
                      <div 
                        key={comp.id}
                        className="group flex flex-col items-center justify-center w-20 h-16 rounded-lg border border-gray-200 bg-white cursor-pointer hover:border-blue-400 hover:shadow-md transition-all"
                        onClick={() => {
                          handleSelectComponent(comp);
                        }}
                        title={comp.name + '（' + getComponentTypeName(comp.type) + '）'}
                      >
                        <div className={"w-8 h-8 rounded-lg flex items-center justify-center " + iconInfo.bg + " " + iconInfo.color}>
                          {iconInfo.icon}
                        </div>
                        <p className="text-[10px] text-gray-600 mt-1 truncate max-w-full px-1">{comp.name}</p>
                      </div>
                    );
                  })}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">点击组件卡片可快速添加到关联列表</p>
            </div>
          </div>
        </div>
      </main>

      {/* Toast 消息 */}
      {toastMessage && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium transition-all ${
          toastMessage.type === "success"
            ? "bg-green-500 text-white"
            : "bg-red-500 text-white"
        }`}>
          {toastMessage.text}
        </div>
      )}

      {/* 数据加载中 */}
      {dataLoading && (
        <div className="fixed inset-0 z-[60] bg-white/80 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-sm text-gray-500">加载模板数据...</span>
          </div>
        </div>
      )}

      {/* 选择组件弹窗 */}
      {showComponentPicker && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">选择组件</h3>
                <button
                  onClick={() => setShowComponentPicker(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">请选择要关联的组件</p>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {loading ? (
                <div className="flex items-center justify-center py-8 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span className="text-sm">加载中...</span>
                </div>
              ) : availableComponents.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">暂无组件可关联</p>
                  <p className="text-xs mt-1">请先在「组件管理」中创建组件</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableComponents.map((comp) => {
                    const linkedCount = componentLinks.filter(l => l.componentId === comp.id).length;
                    return (
                      <div
                        key={comp.id}
                        onClick={() => handleSelectComponent(comp)}
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all"
                      >
                        <div className={`w-10 h-10 rounded-lg ${getComponentTypeIcon(comp.type).bg} flex items-center justify-center flex-shrink-0 ${getComponentTypeIcon(comp.type).color}`}>
                          {getComponentTypeIcon(comp.type).icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {comp.name}
                            </span>
                            {linkedCount > 0 && (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">
                                已关联{linkedCount}次
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{getComponentTypeName(comp.type)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 选择上一级弹窗 */}
      {showParentPicker && selectedComponent && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">选择上一级</h3>
                <button
                  onClick={() => {
                    setShowParentPicker(false);
                    setSelectedComponent(null);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">请选择触发该组件的上一级</p>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {/* 已选组件预览 */}
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                <div className={`w-10 h-10 rounded-lg ${getComponentTypeIcon(selectedComponent.type).bg} flex items-center justify-center flex-shrink-0 ${getComponentTypeIcon(selectedComponent.type).color}`}>
                  {getComponentTypeIcon(selectedComponent.type).icon}
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900 block">
                    {selectedComponent.name}
                  </span>
                  <span className="text-xs text-gray-500">{selectedComponent.type}</span>
                </div>
              </div>
              
              {/* 上一级选项 */}
              <div className="space-y-2">
                {getParentOptions().map((parent) => (
                  <div
                    key={parent.id}
                    onClick={() => handleSelectParent(parent)}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      parent.type === "main" 
                        ? "bg-blue-50 text-blue-600" 
                        : (() => { const ic = getComponentTypeIcon(parent.componentTypeKey || ""); return `${ic.bg} ${ic.color}`; })()
                    }`}>
                      {parent.type === "main" ? (
                        <Play className="w-5 h-5" />
                      ) : (
                        getComponentTypeIcon(parent.componentTypeKey || "").icon
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900 block">
                        {parent.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {parent.type === "main" ? "广告主素材" : "已添加的组件"}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 触发时间设置弹窗 */}
      {showTimeDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">设置出现时间</h3>
              <p className="text-sm text-gray-500 mt-1">组件弹出的延迟时间（秒）</p>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setTimeValue(Math.max(1, timeValue - 1))}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-xl font-bold"
                >
                  -
                </button>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={timeValue}
                    onChange={(e) => setTimeValue(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 h-12 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    min="1"
                  />
                  <span className="text-lg text-gray-600">秒</span>
                </div>
                <button
                  onClick={() => setTimeValue(timeValue + 1)}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-xl font-bold"
                >
                  +
                </button>
              </div>
            </div>
            <div className="px-5 pb-5 flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowTimeDialog(null)}
              >
                取消
              </Button>
              <Button 
                className="flex-1 bg-blue-500 hover:bg-blue-600"
                onClick={() => handleUpdateTriggerTime(showTimeDialog)}
              >
                确认
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 全屏预览弹窗 */}
      {showFullscreenPreview && (
        <InteractionPreview
          templateType={type}
          templateName={info.name}
          componentLinks={componentLinks}
          onClose={() => setShowFullscreenPreview(false)}
        />
      )}
    </div>
  );
}

export default SDKTemplateEdit;
