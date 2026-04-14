"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdTemplate, AdTemplateConfig } from "@/components/ad-template";
import { GameGiftTemplate, GameGiftTemplateConfig } from "@/components/game-gift-template";

type ComponentType = "dual_button" | "vote" | "image" | "ecommerce" | "coupon" | "promotion_card" | "game_gift";

interface ComponentConfig {
  defaultConfig: AdTemplateConfig | GameGiftTemplateConfig;
  name: string;
  description: string;
}

// 默认配置
const defaultConfigs: Record<ComponentType, ComponentConfig> = {
  dual_button: {
    defaultConfig: {
      title: "限时特惠活动",
      subtitle: "新用户首单立减50元，更有超值礼包等你来拿",
      button1: {
        text: "立即领取",
        action: "jump",
        landingPageUrl: "",
      },
      button2: {
        text: "查看详情",
        action: "show_image",
        imageUrl: "",
        resultText: "",
        buttonClickText: "",
      },
      action: "open",
      defaultLandingPageUrl: "",
    },
    name: "双按钮",
    description: "配置主副标题和两个按钮的跳转链接",
  },
  vote: {
    defaultConfig: {
      title: "限时特惠活动",
      subtitle: "新用户首单立减50元",
      options: [
        { id: "1", buttonText: "选项A", jumpUrl: "" },
        { id: "2", buttonText: "选项B", jumpUrl: "" },
      ],
      defaultLandingPageUrl: "",
    },
    name: "投票",
    description: "配置标题、副标题和投票选项",
  },
  image: {
    defaultConfig: {
      images: [{ id: "1", imageUrl: "https://picsum.photos/640/360" }],
      defaultLandingPageUrl: "",
    },
    name: "图片",
    description: "配置图片内容",
  },
  ecommerce: {
    defaultConfig: {
      title: "商品名称",
      content: "商品描述内容",
      buttonText: "立即购买",
      imageUrl: "",
      landingPageUrl: "",
      defaultLandingPageUrl: "",
    },
    name: "电商",
    description: "配置商品图片、标题和购买按钮",
  },
  coupon: {
    defaultConfig: {
      title: "限时优惠活动",
      discountInfo: "30元",
      discountCondition: "满100立减！",
      buttonText: "立即领取",
      validFrom: "2024-01-01",
      validTo: "2024-12-31",
      landingPageUrl: "",
      defaultLandingPageUrl: "",
    },
    name: "优惠券",
    description: "配置优惠券信息",
  },
  promotion_card: {
    defaultConfig: {
      iconUrl: "",
      title: "官方推广",
      promotionPoints: [
        { id: "1", text: "官方正版授权" },
        { id: "2", text: "安全无毒无插件" },
      ],
      buttonText: "立即下载",
      landingPageUrl: "",
      defaultLandingPageUrl: "",
    },
    name: "推广卡片",
    description: "配置图标、标题、推广卖点和行动号召",
  },
  game_gift: {
    defaultConfig: {
      images: [{ id: "1", imageUrl: "https://picsum.photos/640/360" }],
      logoUrl: "",
      appName: "游戏名称",
      appDescription: "游戏描述内容",
      appPackageName: "com.example.game",
      downloadUrl: "",
      giftCode: "ABCD123456",
      defaultLandingPageUrl: "",
    },
    name: "游戏礼包码",
    description: "配置应用图片、名称、描述和下载链接",
  },
};

function PreviewContent() {
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<AdTemplateConfig | GameGiftTemplateConfig | null>(null);
  const [componentType, setComponentType] = useState<ComponentType>("dual_button");
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    const configParam = searchParams.get("config");
    const type = (searchParams.get("type") || "dual_button") as ComponentType;
    setComponentType(type);

    if (configParam) {
      try {
        const decoded = decodeURIComponent(atob(configParam));
        setConfig(JSON.parse(decoded));
      } catch (e) {
        console.error("配置解析失败", e);
        // 使用默认配置
        setConfig(defaultConfigs[type].defaultConfig);
      }
    } else {
      setConfig(defaultConfigs[type].defaultConfig);
    }
  }, [searchParams]);

  // 根据组件类型渲染对应的模板
  const renderTemplate = () => {
    if (componentType === "game_gift") {
      const gameConfig = config as GameGiftTemplateConfig;
      return (
        <GameGiftTemplate
          config={gameConfig}
          isOpen={showAd}
          onClose={() => setShowAd(false)}
          previewMode={false}
        />
      );
    }

    // 其他组件类型使用 AdTemplate
    const adConfig = config as AdTemplateConfig;
    return (
      <AdTemplate
        config={adConfig}
        isOpen={showAd}
        onClose={() => setShowAd(false)}
        previewMode={false}
      />
    );
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">加载配置中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/components/create">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                返回
              </Button>
            </Link>
            <h1 className="text-base font-semibold text-gray-900">组件预览</h1>
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="w-4 h-4" />
                列表
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Phone Frame */}
      <div className="flex items-center justify-center py-8">
        <div className="w-[375px] h-[700px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
          <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative flex flex-col">
            {/* Status bar */}
            <div className="h-10 bg-white flex items-end justify-between px-6 pb-1">
              <span className="text-[11px] font-medium text-gray-900">9:41</span>
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5">
                  <div className="w-1 h-1.5 bg-gray-900 rounded-full" />
                  <div className="w-1 h-1.5 bg-gray-900 rounded-full" />
                  <div className="w-1 h-1.5 bg-gray-900 rounded-full" />
                  <div className="w-1 h-1.5 bg-gray-900 rounded-full" />
                </div>
                <div className="w-5 h-2.5 border border-gray-900 rounded-sm ml-1">
                  <div className="w-[60%] h-full bg-gray-900 rounded-sm" />
                </div>
              </div>
            </div>

            {/* App content */}
            <div className="flex-1 bg-gradient-to-b from-blue-50 to-indigo-100 overflow-auto">
              {!showAd ? (
                <div className="h-full flex flex-col items-center justify-center p-6">
                  <div className="text-center">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">
                      组件效果预览
                    </h2>
                    <p className="text-sm text-gray-500 mb-2">
                      {defaultConfigs[componentType]?.name || "组件"}
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      点击下方按钮预览{defaultConfigs[componentType]?.name}弹窗
                    </p>
                    <Button
                      onClick={() => setShowAd(true)}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      预览{defaultConfigs[componentType]?.name}弹窗
                    </Button>
                  </div>
                </div>
              ) : (
                renderTemplate()
              )}
            </div>

            {/* Home indicator */}
            <div className="h-8 bg-white flex items-center justify-center">
              <div className="w-32 h-1 bg-gray-300 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="max-w-lg mx-auto px-4 pb-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">预览说明</h3>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>点击「预览{defaultConfigs[componentType]?.name}弹窗」按钮查看组件效果</li>
            <li>点击弹窗中的按钮可跳转链接或显示图片</li>
            <li>点击弹窗外部可关闭弹窗</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function ComponentPreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    }>
      <PreviewContent />
    </Suspense>
  );
}
