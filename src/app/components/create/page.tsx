"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  LayoutGrid,
  CheckSquare,
  Image as ImageIcon,
  ShoppingBag,
  Ticket,
  Layers,
  Gift,
  DollarSign,
  Layers3,
  CloudRain,
  PenTool,
  Egg,
  Bell,
  Box,
  ChevronRight,
  Sparkles,
  MousePointerClick,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ComponentStyleTemplate,
  componentStyleTemplates,
  ComponentCategory,
} from "@/lib/component-types";

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  "layout-grid": <LayoutGrid className="w-10 h-10" />,
  "check-square": <CheckSquare className="w-10 h-10" />,
  "image": <ImageIcon className="w-10 h-10" />,
  "shopping-bag": <ShoppingBag className="w-10 h-10" />,
  "ticket": <Ticket className="w-10 h-10" />,
  "layers": <Layers className="w-10 h-10" />,
  "gift": <Gift className="w-10 h-10" />,
  "dollar-sign": <DollarSign className="w-10 h-10" />,
  "layers-3": <Layers3 className="w-10 h-10" />,
  "box": <Box className="w-10 h-10" />,
  "cloud-rain": <CloudRain className="w-10 h-10" />,
  "pen-tool": <PenTool className="w-10 h-10" />,
  "egg": <Egg className="w-10 h-10" />,
  "bell": <Bell className="w-10 h-10" />,
  "vote": <CheckSquare className="w-10 h-10" />,
};

export default function ComponentCreatePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | "all">("all");

  // 分类筛选后的模板
  const filteredTemplates = useMemo(() => {
    if (selectedCategory === "all") {
      return componentStyleTemplates;
    }
    return componentStyleTemplates.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  // 静态组件
  const staticTemplates = filteredTemplates.filter((t) => t.category === "static");
  // 动效组件
  const animationTemplates = filteredTemplates.filter((t) => t.category === "animation");

  // 处理选择组件
  const handleSelectTemplate = (template: ComponentStyleTemplate) => {
    // 根据组件类型跳转到对应的配置页面
    if (template.id === "dual_button") {
      router.push("/components/config?type=dual_button");
    } else if (template.id === "vote") {
      router.push("/components/config?type=vote");
    } else if (template.id === "image") {
      router.push("/components/config?type=image");
    } else if (template.id === "ecommerce") {
      router.push("/components/config?type=ecommerce");
    } else if (template.id === "coupon") {
      router.push("/components/config?type=coupon");
    } else if (template.id === "promotion_card") {
      router.push("/components/config?type=promotion_card");
    } else if (template.id === "game_gift") {
      router.push("/components/config?type=game_gift");
    } else {
      // 其他组件类型可以后续扩展
      alert(`您选择了 "${template.name}" 组件，配置页面开发中...`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                返回列表
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">选择组件样式</h1>
              <p className="text-sm text-gray-500">选择适合您业务的组件模板</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium">
                1
              </div>
              <span className="text-blue-600 font-medium">选择样式</span>
            </div>
            <div className="flex-1 h-px bg-gray-200 max-w-[100px]" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-medium">
                2
              </div>
              <span className="text-gray-500">填写内容</span>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === "all"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setSelectedCategory("static")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === "static"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            静态组件
          </button>
          <button
            onClick={() => setSelectedCategory("animation")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === "animation"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            动效组件
          </button>
        </div>

        {/* Description */}
        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <MousePointerClick className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                组件样式
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                组件模板固定展示位置和样式，通过元素配置可生成适合不同场景的组件，用于与基础模版组合，增加广告的互动性，提升流量的变现效率。
              </p>
            </div>
          </div>
        </div>

        {/* Static Components Section */}
        {(selectedCategory === "all" || selectedCategory === "static") &&
          staticTemplates.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                  <Layers className="w-4 h-4 text-gray-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">静态组件</h2>
                <span className="text-sm text-gray-500">标准布局，无动效</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {staticTemplates.map((template) => (
                  <ComponentCard
                    key={template.id}
                    template={template}
                    onSelect={handleSelectTemplate}
                  />
                ))}
              </div>
            </div>
          )}

        {/* Animation Components Section */}
        {(selectedCategory === "all" || selectedCategory === "animation") &&
          animationTemplates.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">动效组件</h2>
                <span className="text-sm text-gray-500">增加动效，提升转化</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {animationTemplates.map((template) => (
                  <ComponentCard
                    key={template.id}
                    template={template}
                    onSelect={handleSelectTemplate}
                  />
                ))}
              </div>
            </div>
          )}

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">暂无可用的组件样式</p>
          </div>
        )}
      </main>
    </div>
  );
}

// 组件卡片组件
function ComponentCard({
  template,
  onSelect,
}: {
  template: ComponentStyleTemplate;
  onSelect: (template: ComponentStyleTemplate) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative bg-white rounded-xl border-2 transition-all duration-200 cursor-pointer overflow-hidden ${
        isHovered
          ? "border-blue-500 shadow-lg shadow-blue-100"
          : "border-gray-200 hover:border-blue-300"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(template)}
    >
      {/* Preview Area */}
      <div className="h-36 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id={`grid-${template.id}`} width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <rect width="100" height="100" fill={`url(#grid-${template.id})`} />
          </svg>
        </div>

        {/* Icon */}
        <div
          className={`transition-all duration-300 ${
            isHovered ? "scale-110 text-blue-500" : "text-gray-400"
          }`}
        >
          {iconMap[template.icon] || <Layers className="w-10 h-10" />}
        </div>

        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
              选择此样式
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>

      {/* Info Area */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{template.name}</h3>
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              template.category === "static"
                ? "bg-gray-100 text-gray-600"
                : "bg-purple-100 text-purple-600"
            }`}
          >
            {template.category === "static" ? "静态" : "动效"}
          </span>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2">{template.description}</p>
      </div>
    </div>
  );
}
