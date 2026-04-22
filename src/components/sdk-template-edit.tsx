"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Eye,
  Loader2,
  Check,
  Image as ImageIcon,
  Trash2,
  GripVertical,
  Upload,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useComponents } from "@/contexts/component-context";
import { AdInteractionPreview } from "./ad-interaction-preview";
import { ComponentPickerModal } from "./component-picker-modal";
import { Select } from "@/components/ui/select";

// 触发规则选项
const TRIGGER_RULES = [
  { value: "video_complete", label: "视频播放完毕", timeLabel: "无需设置" },
  { value: "show_time", label: "展示X秒后", timeLabel: "单位：秒" },
  { value: "click_close", label: "点击关闭按钮", timeLabel: "无需设置" },
  { value: "back_from_media", label: "从素材页返回", timeLabel: "无需设置" },
  { value: "click_other_ad", label: "点击其他广告", timeLabel: "无需设置" },
  { value: "in_app_interaction", label: "App内交互", timeLabel: "单位：次数" },
];

// SDK模板类型
type SDKTemplateType = 
  | "static_splash"      
  | "video_splash"       
  | "interstitial_half"   
  | "interstitial_full"   
  | "banner"             
  | "native"             
  | "rewarded_video";    

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

// SDK模板尺寸配置
const SDK_TEMPLATE_SIZES: Record<SDKTemplateType, { width: number; height: number; ratio: string }> = {
  static_splash: { width: 540, height: 960, ratio: "9:16" },
  video_splash: { width: 540, height: 960, ratio: "9:16" },
  interstitial_half: { width: 600, height: 500, ratio: "6:5" },
  interstitial_full: { width: 1080, height: 1920, ratio: "9:16" },
  banner: { width: 1080, height: 120, ratio: "9:1" },
  native: { width: 1080, height: 540, ratio: "2:1" },
  rewarded_video: { width: 1080, height: 1920, ratio: "9:16" },
};

// 组件关联配置
interface ComponentLinkConfig {
  id: string;
  componentId: string;
  componentName: string;
  componentType: string;
  componentPreview: string;
  parentId: string;
  parentName: string;
  triggerRule: string;
  triggerTime?: number;
  status: string;
}

// 模板配置
interface TemplateConfig {
  id?: string;
  name: string;
  type: string;
  adSlot: string;
  componentLinks: ComponentLinkConfig[];
}

interface SDKTemplateEditProps {
  type: SDKTemplateType;
  templateId?: string;
}

export function SDKTemplateEdit({ type, templateId }: SDKTemplateEditProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCopy = searchParams.get("action") === "copy";
  const { components, loading: componentsLoading } = useComponents();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!templateId);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const info = SDK_TEMPLATE_INFO[type];
  const sizeInfo = SDK_TEMPLATE_SIZES[type];

  // 配置数据
  const [config, setConfig] = useState<TemplateConfig>({
    name: "",
    type,
    adSlot: "",
    componentLinks: [],
  });

  // 组件选择弹窗
  const [showComponentPicker, setShowComponentPicker] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["basic", "components"])
  );

  // 可选的父级选项
  const getParentOptions = useCallback(() => {
    const options: { id: string; name: string }[] = [];
    
    // 主素材
    options.push({
      id: "main_material",
      name: `${info.name}主素材`,
    });

    // 已添加的组件
    config.componentLinks.forEach((link) => {
      options.push({
        id: link.componentId,
        name: link.componentName,
      });
    });

    return options;
  }, [config.componentLinks, info.name]);

  // 获取组件预览图
  const getComponentPreview = (componentId: string): string => {
    const component = components.find((c) => c.id === componentId);
    if (!component?.config) return "";
    
    const cfg = component.config as any;
    if (cfg.previewUrl) return cfg.previewUrl;
    if (cfg.imageUrl) return cfg.imageUrl;
    if (cfg.images?.[0]?.imageUrl) return cfg.images[0].imageUrl;
    if (cfg.redpacketImageUrl) return cfg.redpacketImageUrl;
    if (cfg.logoUrl) return cfg.logoUrl;
    
    return "";
  };

  // 加载模板数据
  useEffect(() => {
    if (templateId) {
      const fetchTemplate = async () => {
        setInitialLoading(true);
        try {
          const response = await fetch(`/api/sdk/${type}/${templateId}`);
          const result = await response.json();
          if (result.success && result.data) {
            const data = result.data;
            setConfig({
              id: isCopy ? undefined : data.id,
              name: isCopy ? `${data.name} (副本)` : data.name,
              type: data.type,
              adSlot: data.adSlot || "",
              componentLinks: data.componentLinks || [],
            });
          }
        } catch (error) {
          console.error("加载模板失败:", error);
        } finally {
          setInitialLoading(false);
        }
      };
      fetchTemplate();
    }
  }, [templateId, type, isCopy]);

  // 切换折叠
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // 添加组件
  const handleAddComponent = (componentId: string) => {
    const component = components.find((c) => c.id === componentId);
    if (!component) return;

    const newLink: ComponentLinkConfig = {
      id: `link_${Date.now()}`,
      componentId: component.id,
      componentName: component.name,
      componentType: component.type,
      componentPreview: getComponentPreview(componentId),
      parentId: "main_material",
      parentName: `${info.name}主素材`,
      triggerRule: TRIGGER_RULES[0].value,
      triggerTime: undefined,
      status: "enabled",
    };

    setConfig((prev) => ({
      ...prev,
      componentLinks: [...prev.componentLinks, newLink],
    }));
    setShowComponentPicker(false);
    setEditingLinkId(null);
  };

  // 移除组件
  const handleRemoveComponent = (linkId: string) => {
    setConfig((prev) => ({
      ...prev,
      componentLinks: prev.componentLinks.filter((l) => l.id !== linkId),
    }));
  };

  // 更新组件关联
  const handleUpdateLink = (linkId: string, updates: Partial<ComponentLinkConfig>) => {
    setConfig((prev) => ({
      ...prev,
      componentLinks: prev.componentLinks.map((l) =>
        l.id === linkId ? { ...l, ...updates } : l
      ),
    }));
  };

  // 保存
  const handleSave = async () => {
    if (!config.name.trim()) {
      alert("请输入模板名称");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: config.name,
        adSlot: config.adSlot,
        componentLinks: config.componentLinks,
      };

      let response;
      if (templateId && !isCopy) {
        // 更新
        response = await fetch(`/api/sdk/${type}/${templateId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // 创建
        response = await fetch(`/api/sdk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const result = await response.json();
      if (result.success) {
        alert("保存成功");
        router.push(`/sdk/${type}`);
      } else {
        alert(result.error || "保存失败");
      }
    } catch (error) {
      console.error("保存失败:", error);
      alert("保存失败");
    } finally {
      setSaving(false);
    }
  };

  // 返回
  const handleBack = () => {
    router.push(`/sdk/${type}`);
  };

  // 切换预览
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  if (initialLoading || componentsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

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
                <h1 className="text-xl font-bold text-gray-900">
                  {templateId ? (isCopy ? "复制模板" : "编辑模板") : "创建模板"}
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">{info.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={togglePreview}
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? "隐藏预览" : "预览"}
              </Button>
              <Button
                className="bg-blue-500 hover:bg-blue-600"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    保存
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* 左侧表单 */}
          <div className="flex-1 space-y-4">
            {/* 步骤指示器 */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                    step >= 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
                  }`}>1</span>
                  <span className={step >= 1 ? "text-gray-900" : "text-gray-500"}>选择样式</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-1">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                    step >= 2 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
                  }`}>2</span>
                  <span className={step >= 2 ? "text-blue-600 font-medium" : "text-gray-500"}>填写内容</span>
                </div>
              </div>
            </div>

            {/* 基础配置 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50"
                onClick={() => toggleSection("basic")}
              >
                <span className="text-sm font-medium text-gray-700">基础配置</span>
                {expandedSections.has("basic") ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {expandedSections.has("basic") && (
                <div className="px-4 pb-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      模板名称 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="请输入模板名称"
                      value={config.name}
                      onChange={(e) => setConfig((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      广告位
                    </label>
                    <Input
                      placeholder="请输入广告位ID"
                      value={config.adSlot}
                      onChange={(e) => setConfig((prev) => ({ ...prev, adSlot: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        规格
                      </label>
                      <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                        {sizeInfo.width}×{sizeInfo.height}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        比例
                      </label>
                      <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-blue-600">
                        {sizeInfo.ratio}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 组件关联配置 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50"
                onClick={() => toggleSection("components")}
              >
                <span className="text-sm font-medium text-gray-700">
                  组件关联配置 ({config.componentLinks.length})
                </span>
                {expandedSections.has("components") ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {expandedSections.has("components") && (
                <div className="px-4 pb-4 space-y-4">
                  <p className="text-xs text-gray-500">
                    点击下方按钮添加组件，并设置触发规则
                  </p>
                  
                  {/* 已添加的组件列表 */}
                  {config.componentLinks.map((link, index) => (
                    <div
                      key={link.id}
                      className="border border-gray-200 rounded-lg bg-white p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                          <span className="text-sm font-medium text-gray-700">
                            {link.componentName}
                          </span>
                          <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 rounded">
                            {link.componentType}
                          </span>
                        </div>
                        <button
                          className="text-red-500 hover:bg-red-50 p-1.5 rounded"
                          onClick={() => handleRemoveComponent(link.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* 组件预览图 */}
                      {link.componentPreview && (
                        <div className="mb-3">
                          <img
                            src={link.componentPreview}
                            alt={link.componentName}
                            className="h-20 object-contain rounded border border-gray-200 bg-gray-50"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        {/* 上一级 */}
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            上一级
                          </label>
                          <Select
                            value={link.parentId}
                            onChange={(e) => {
                              const parent = getParentOptions().find(p => p.id === e.target.value);
                              handleUpdateLink(link.id, {
                                parentId: e.target.value,
                                parentName: parent?.name || "",
                              });
                            }}
                            className="w-full"
                          >
                            {getParentOptions().map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.name}
                              </option>
                            ))}
                          </Select>
                        </div>

                        {/* 触发规则 */}
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            触发规则
                          </label>
                          <Select
                            value={link.triggerRule}
                            onChange={(e) => handleUpdateLink(link.id, { triggerRule: e.target.value })}
                            className="w-full"
                          >
                            {TRIGGER_RULES.map((rule) => (
                              <option key={rule.value} value={rule.value}>
                                {rule.label}
                              </option>
                            ))}
                          </Select>
                        </div>
                      </div>

                      {/* 触发时间（仅部分规则需要） */}
                      {link.triggerRule === "show_time" || link.triggerRule === "in_app_interaction" ? (
                        <div className="mt-3">
                          <label className="block text-xs text-gray-500 mb-1">
                            {TRIGGER_RULES.find((r) => r.value === link.triggerRule)?.timeLabel}
                          </label>
                          <Input
                            type="number"
                            min="1"
                            placeholder="请输入"
                            value={link.triggerTime || ""}
                            onChange={(e) => handleUpdateLink(link.id, { 
                              triggerTime: parseInt(e.target.value) || undefined 
                            })}
                            className="w-full"
                          />
                        </div>
                      ) : null}
                    </div>
                  ))}

                  {/* 添加按钮 */}
                  <button
                    className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
                    onClick={() => setShowComponentPicker(true)}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">添加组件</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 右侧预览 */}
          {showPreview && (
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-20">
                <h3 className="text-sm font-medium text-gray-700 mb-3">预览效果</h3>
                <div className="relative">
                  <AdInteractionPreview
                    templateType={type}
                    templateName={config.name || info.name}
                    componentLinks={config.componentLinks}
                    isFullPreview
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 组件选择弹窗 */}
      {showComponentPicker && (
        <ComponentPickerModal
          components={components.filter(c => !config.componentLinks.some(l => l.componentId === c.id))}
          onSelect={handleAddComponent}
          onClose={() => {
            setShowComponentPicker(false);
            setEditingLinkId(null);
          }}
        />
      )}
    </div>
  );
}

export default SDKTemplateEdit;
