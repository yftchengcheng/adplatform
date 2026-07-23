"use client";

import React, { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdTemplateConfig, AdTemplate } from "@/components/ad-template";
import { AdTemplateConfigPanel } from "@/components/ad-template-config";
import { VoteTemplateConfig, VoteTemplate } from "@/components/vote-template";
import { VoteTemplateConfigPanel } from "@/components/vote-template-config";
import { ImageTemplateConfig, ImageTemplate } from "@/components/image-template";
import { ImageTemplateConfigPanel } from "@/components/image-template-config";
import { EcommerceTemplateConfig, EcommerceTemplate } from "@/components/ecommerce-template";
import { EcommerceTemplateConfigPanel } from "@/components/ecommerce-template-config";
import { CouponTemplateConfig, CouponTemplate } from "@/components/coupon-template";
import { CouponTemplateConfigPanel } from "@/components/coupon-template-config";
import { PromotionTemplateConfig, PromotionTemplate } from "@/components/promotion-template";
import { PromotionTemplateConfigPanel } from "@/components/promotion-template-config";
import { GameGiftTemplateConfig, GameGiftTemplate } from "@/components/game-gift-template";
import { GameGiftTemplateConfigPanel } from "@/components/game-gift-template-config";
import { RedpacketRainTemplateConfig, defaultRedpacketRainConfig, RedpacketRainTemplateConfigPanel } from "@/components/redpacket-rain-template-config";
import { RedpacketRainTemplate } from "@/components/redpacket-rain-template";
import { FlipRedpacketTemplateConfig, defaultFlipRedpacketConfig, FlipRedpacketTemplateConfigPanel } from "@/components/flip-redpacket-template-config";
import { FlipRedpacketTemplate } from "@/components/flip-redpacket-template";
import { TreasureBoxConfig, defaultTreasureBoxConfig, TreasureBoxTemplateConfigPanel } from "@/components/treasurebox-template-config";
import { TreasureBoxTemplate } from "@/components/treasurebox-template";
import { FlipCardConfig, defaultFlipCardConfig, FlipCardTemplateConfigPanel } from "@/components/flip-card-template-config";
import { FlipCardTemplate } from "@/components/flip-card-template";
import { TreasureboxRainTemplateConfig, defaultTreasureboxRainConfig, TreasureboxRainTemplateConfigPanel } from "@/components/treasurebox-rain-template-config";
import { TreasureboxRainTemplate } from "@/components/treasurebox-rain-template";
import { SmashEggConfig, SmashEggTemplateConfigPanel, defaultSmashEggConfig } from "@/components/smash-egg-template-config";
import { SmashEggTemplate } from "@/components/smash-egg-template";
import { ScratchCardConfig, ScratchCardTemplateConfigPanel, defaultScratchCardConfig } from "@/components/scratch-card-config";
import { ScratchCardTemplate } from "@/components/scratch-card-template";
import { PopupRedpacketConfig, PopupRedpacketConfigPanel } from "@/components/popup-redpacket-config";
import PopupRedpacketTemplate from "@/components/popup-redpacket-template";
import { FloatingWindowTemplateConfig, defaultFloatingWindowConfig } from "@/components/floating-window-template";
import { FloatingWindowTemplateConfigPanel } from "@/components/floating-window-template-config";
import { FloatingWindowTemplate } from "@/components/floating-window-template";
import { DownloadSixElementsConfig, defaultDownloadSixElementsConfig } from "@/components/download-six-elements-template";
import { DownloadSixElementsTemplateConfigPanel } from "@/components/download-six-elements-config";
import { DownloadSixElementsTemplate } from "@/components/download-six-elements-template";
import { useComponents } from "@/contexts/component-context";
import { useToast } from "@/components/ui/toast";
import { ComponentType, componentStyleTemplates } from "@/lib/component-types";

// 默认广告组件配置
const defaultAdConfig: AdTemplateConfig = {
  title: "限时特惠活动",
  subtitle: "新用户首单立减50元，更有超值礼包等你来拿",
  button1: {
    text: "立即领取",
    action: "jump",
    landingPageMacro: "${landing_url}",
  },
  button2: {
    text: "查看详情",
    action: "show_image",
    imageMacro: "${image_url}",
    landingPageMacro: "${detail_url}",
  },
  action: "open",
  defaultLandingPageUrl: "",
  macroVariables: {
    image_url: "https://picsum.photos/472/164",
    landing_url: "https://example.com/claim",
    detail_url: "https://example.com/detail",
  },
};

// 默认投票组件配置
const defaultVoteConfig: VoteTemplateConfig = {
  title: "请选择您的偏好",
  subtitle: "感谢您的参与，点击选项查看详情",
  options: [
    { id: "1", buttonText: "选项一" },
    { id: "2", buttonText: "选项二" },
  ],
  action: "jump",
  defaultLandingPageUrl: "",
  macroVariables: {
    title: "投票标题",
    subtitle: "副标题内容",
  },
};

// 默认图片组件配置
const defaultImageConfig: ImageTemplateConfig = {
  images: [],
  defaultLandingPageUrl: "",
  macroVariables: {
    image_url: "https://picsum.photos/640/360",
    landing_url: "https://example.com/landing",
  },
};

// 默认电商组件配置
const defaultEcommerceConfig: EcommerceTemplateConfig = {
  title: "精选好物限时特惠",
  content: "品质保证，价格实惠，错过不再有",
  buttonText: "立即购买",
  defaultLandingPageUrl: "",
  macroVariables: {
    title: "商品标题",
    content: "商品描述内容",
    button_text: "立即购买",
    image_url: "https://picsum.photos/174/174",
    landing_url: "https://example.com/product",
  },
};

// 默认优惠券组件配置
const defaultCouponConfig: CouponTemplateConfig = {
  title: "满减大酬宾",
  discountInfo: "30元",
  discountCondition: "满100立减！",
  buttonText: "立即领取",
  validFrom: "2026-01-01",
  validTo: "2026-12-31",
  landingPageUrl: "",
  macroVariables: {
    title: "活动名称",
    discount_info: "30元",
    discount_condition: "满100立减",
    button_text: "立即领取",
    landing_url: "https://example.com/coupon",
  },
};

// 默认推广卡片组件配置
const defaultPromotionConfig: PromotionTemplateConfig = {
  iconUrl: "",
  title: "卡片标题",
  promotionPoints: [
    { id: "1", text: "推广卖点1" },
    { id: "2", text: "推广卖点2" },
  ],
  buttonText: "行动号召",
  defaultLandingPageUrl: "",
  macroVariables: {
    icon_url: "https://picsum.photos/108/108",
    title: "商品名称",
    point_1: "卖点一",
    point_2: "卖点二",
    button_text: "了解更多",
    landing_url: "https://example.com/promotion",
  },
};

// 默认游戏礼包码组件配置
const defaultGameGiftConfig: GameGiftTemplateConfig = {
  images: [{ id: "1", imageUrl: "https://picsum.photos/640/360" }],
  logoUrl: "",
  appName: "游戏名称",
  appDescription: "游戏描述内容",
  appPackageName: "com.example.game",
  downloadUrl: "",
  giftCode: "",
  defaultLandingPageUrl: "",
  macroVariables: {
    app_image: "https://picsum.photos/640/360",
    app_logo: "https://picsum.photos/132/132",
    app_name: "游戏名称",
    app_desc: "游戏描述内容",
    package_name: "com.example.game",
    download_url: "https://example.com/download",
  },
};

// 组件类型对应的默认配置和名称
type AllConfigTypes = AdTemplateConfig | VoteTemplateConfig | ImageTemplateConfig | EcommerceTemplateConfig | CouponTemplateConfig | PromotionTemplateConfig | GameGiftTemplateConfig | RedpacketRainTemplateConfig | FlipRedpacketTemplateConfig | TreasureBoxConfig | FlipCardConfig | TreasureboxRainTemplateConfig | SmashEggConfig | ScratchCardConfig | PopupRedpacketConfig | FloatingWindowTemplateConfig | DownloadSixElementsConfig;

const componentConfigMap: Record<string, {
  defaultConfig: AllConfigTypes;
  name: string;
  description: string;
}> = {
  dual_button: {
    defaultConfig: defaultAdConfig,
    name: "选择磁贴(双按钮)",
    description: "配置组件内容和样式",
  },
  vote: {
    defaultConfig: defaultVoteConfig,
    name: "投票磁贴",
    description: "配置投票选项和样式",
  },
  image: {
    defaultConfig: defaultImageConfig,
    name: "图片磁贴",
    description: "配置图片内容和样式",
  },
  ecommerce: {
    defaultConfig: defaultEcommerceConfig,
    name: "电商磁贴",
    description: "配置商品图片和购买按钮",
  },
  coupon: {
    defaultConfig: defaultCouponConfig,
    name: "优惠券磁贴",
    description: "配置优惠券信息和领取按钮",
  },
  promotion_card: {
    defaultConfig: defaultPromotionConfig,
    name: "推广卡片",
    description: "配置图标、标题、推广卖点和行动号召",
  },
  game_gift: {
    defaultConfig: defaultGameGiftConfig,
    name: "游戏礼包码",
    description: "配置应用图片、名称、描述和下载链接",
  },
  redpacket_rain: {
    defaultConfig: defaultRedpacketRainConfig,
    name: "红包雨",
    description: "配置红包样式、引导文案和领奖场景",
  },
  flip_redpacket: {
    defaultConfig: defaultFlipRedpacketConfig,
    name: "翻红包",
    description: "点击红包翻出惊喜，领取奖励",
  },
  flip_treasure: {
    defaultConfig: defaultTreasureBoxConfig,
    name: "翻宝箱",
    description: "点击宝箱翻出惊喜，领取奖励",
  },
  flip_card: {
    defaultConfig: defaultFlipCardConfig,
    name: "翻卡",
    description: "点击卡牌翻出惊喜，领取奖励",
  },
  treasure_rain: {
    defaultConfig: defaultTreasureboxRainConfig,
    name: "宝箱雨",
    description: "配置宝箱样式、引导文案和领奖场景",
  },
  smash_egg: {
    defaultConfig: defaultSmashEggConfig,
    name: "砸金蛋得好礼！",
    description: "点击金蛋，领取奖品",
  },
  scratch_card: {
    defaultConfig: defaultScratchCardConfig,
    name: "好运刮出来！",
    description: "刮开涂层，领取奖励",
  },
  popup_redpacket: {
    defaultConfig: {
      guideText: "点击开红包",
      guideTextMacro: "",
      rewardType: "cash",
      cashAmount: "88.88",
      cashAmountMacro: "",
      rewardImageUrl: "",
      rewardImageMacro: "",
      rewardText: "恭喜获得100元优惠券",
      rewardTextMacro: "",
      specialNote: "实际奖品以APP为准",
      specialNoteMacro: "",
      redpacketImageUrl: "",
      redpacketImageMacro: "",
      landingPageUrl: "",
      landingPageMacro: "",
      defaultLandingPageUrl: "",
      componentName: "弹窗红包",
    } as PopupRedpacketConfig,
    name: "恭喜发财！",
    description: "点击红包，领取奖励",
  },
  floating_window: {
    defaultConfig: defaultFloatingWindowConfig,
    name: "浮窗",
    description: "配置图标、标题、推广卖点和行动号召",
  },
  download_six_elements: {
    defaultConfig: defaultDownloadSixElementsConfig,
    name: "下载六要素",
    description: "配置应用名称/开发者/版本/隐私/权限/功能/LOGO/下载按钮",
  },
};

function ConfigContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") || "dual_button") as ComponentType;
  const componentId = searchParams.get("id");
  const { addComponent, updateComponent, components, setEditingPreviewConfig } = useComponents();
  const { showToast } = useToast();

  // 根据类型获取组件名称（优先从配置读取，否则使用静态名称）
  const getComponentName = () => {
    // 如果配置中有 componentName，优先使用
    if ((config as { componentName?: string }).componentName) {
      return (config as { componentName: string }).componentName;
    }
    return componentConfigMap[type]?.name || "选择磁贴(双按钮)";
  };

  // 查找要编辑的组件
  const editingComponent = componentId ? components.find(c => c.id === componentId) : null;

  // 初始化配置（编辑模式加载已有配置，新建模式使用默认配置）
  // 注意：不在 useState 初始化器中读取 sessionStorage，避免 SSR/客户端 hydration 不匹配
  const [config, setConfig] = useState<AllConfigTypes>(() => {
    const fallback = componentConfigMap[type]?.defaultConfig || defaultAdConfig;
    // 优先使用编辑组件的配置，但用 defaultConfig 兜底缺失字段（旧数据/旧版本 config 可能缺字段）
    if (editingComponent?.config) {
      return { ...fallback, ...editingComponent.config } as unknown as AllConfigTypes;
    }
    return fallback;
  });

  // 客户端挂载后从 sessionStorage 恢复配置
  React.useEffect(() => {
    if (!editingComponent?.config) {
      const saved = sessionStorage.getItem("component_config");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as unknown as AllConfigTypes;
          // 同样用 defaultConfig 兜底，避免旧 config 缺字段
          const fallback = componentConfigMap[type]?.defaultConfig || defaultAdConfig;
          setConfig({ ...fallback, ...parsed } as unknown as AllConfigTypes);
        } catch {
          // ignore parse errors
        }
      }
    }
  }, []);

  // 当异步加载的 components 到位、editingComponent 由 null 变为有值时，同步 config
  React.useEffect(() => {
    if (editingComponent?.config) {
      const fallback = componentConfigMap[type]?.defaultConfig || defaultAdConfig;
      setConfig({ ...fallback, ...editingComponent.config } as unknown as AllConfigTypes);
    }
  }, [editingComponent]);

  // 预览重置计数器（用于动态组件如红包雨的重置）
  const [previewResetKey, setPreviewResetKey] = React.useState(0);

  // 保存配置到 sessionStorage
  // 深拷贝函数，处理可能的循环引用
  const deepClone = (obj: unknown): unknown => {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date) return new Date(obj);
    if (Array.isArray(obj)) return obj.map(deepClone);
    
    const seen = new WeakMap();
    const clone = (value: unknown): unknown => {
      if (value === null || typeof value !== "object") return value;
      if (seen.has(value)) return seen.get(value);
      
      if (value instanceof HTMLElement) return undefined; // 跳过 DOM 元素
      if (typeof File !== "undefined" && value instanceof File) return undefined;
      
      const cloneValue: Record<string, unknown> = {};
      seen.set(value, cloneValue);
      
      for (const key of Object.keys(value as Record<string, unknown>)) {
        cloneValue[key] = clone((value as Record<string, unknown>)[key]);
      }
      return cloneValue;
    };
    
    return clone(obj);
  };

  const handleConfigChange = useCallback((newConfig: AllConfigTypes) => {
    setConfig(newConfig);
    // 同步更新到全局预览配置（用于组件列表实时预览）
    if (type) {
      setEditingPreviewConfig(type, newConfig as unknown as Record<string, unknown>);
    }
    try {
      const cleanConfig = deepClone(newConfig);
      sessionStorage.setItem("component_config", JSON.stringify(cleanConfig));
    } catch (e) {
      console.error("配置序列化失败:", e);
    }
  }, [type, setEditingPreviewConfig]);

  // 清空 sessionStorage
  const clearSavedConfig = useCallback(() => {
    sessionStorage.removeItem("component_config");
  }, []);

  // 取消编辑
  const handleCancel = useCallback(() => {
    clearSavedConfig();
    router.back();
  }, [clearSavedConfig, router]);

  const handleSave = async () => {
    try {
      // 获取组件名称（根据不同类型获取）
      let name = "未命名组件";

      if ("componentName" in config && config.componentName) {
        // 游戏礼包码等使用 componentName
        name = config.componentName;
      } else if ("guideText" in config && config.guideText) {
        // 红包雨使用引导文案
        name = config.guideText;
      } else if ("title" in config && config.title) {
        // 广告磁贴和投票磁贴使用 title
        name = config.title;
      } else if ("images" in config && Array.isArray(config.images) && config.images.length > 0) {
        // 图片磁贴使用第一张图片作为名称标识
        name = `图片磁贴-${config.images.length}张`;
      }

      // 根据组件类型获取分类
      const getCategoryForType = (componentType: string): "static" | "animation" => {
        const template = componentStyleTemplates.find(t => t.id === componentType);
        return (template?.category as "static" | "animation") || "static";
      };

      // 编辑模式更新现有组件，新建模式添加新组件
      if (componentId && editingComponent) {
        await updateComponent(componentId, {
          name,
          config: config as unknown as Record<string, unknown>,
        });
      } else {
        await addComponent({
          name: name,
          category: getCategoryForType(type),
          type: type,
          status: "enabled",
          config: config as unknown as Record<string, unknown>,
        });
      }
      clearSavedConfig();
      showToast(componentId ? "组件更新成功！" : "组件保存成功！", "success");
      
      // 等待一小段时间确保数据库写入完成，然后强制刷新列表页
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.href = "/";
    } catch (error) {
      console.error("保存失败:", error);
      showToast("保存失败，请重试", "error");
    }
  };

  const handleBack = () => {
    router.push("/components/create");
  };

  const isVoteComponent = type === "vote";
  const isImageComponent = type === "image";
  const isEcommerceComponent = type === "ecommerce";
  const isCouponComponent = type === "coupon";
  const isPromotionComponent = type === "promotion_card";
  const isGameGiftComponent = type === "game_gift";
  const isRedpacketRainComponent = type === "redpacket_rain";
  const isFlipRedpacketComponent = type === "flip_redpacket";
  const isTreasureBoxComponent = type === "flip_treasure";
  const isFlipCardComponent = type === "flip_card";
  const isTreasureboxRainComponent = type === "treasure_rain";
  const isSmashEggComponent = type === "smash_egg";
  const isScratchCardComponent = type === "scratch_card";
  const isPopupRedpacketComponent = type === "popup_redpacket";
  const isFloatingWindowComponent = type === "floating_window";
  const isDownloadSixElementsComponent = type === "download_six_elements";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">返回</span>
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">
                {editingComponent ? "编辑组件" : getComponentName()}
              </h1>
              <p className="text-sm text-gray-500">
                {editingComponent ? `正在编辑：${editingComponent.name}` : componentConfigMap[type]?.description || "配置组件内容和样式"}
              </p>
            </div>
            <Button variant="outline" onClick={handleBack}>
              取消
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600" onClick={handleSave}>
              保存
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium">
                1
              </div>
              <span className="text-gray-500">选择样式</span>
              <span className="text-gray-400 mx-1">/</span>
              <span className="text-blue-600 font-medium">{getComponentName()}</span>
            </div>
            <div className="flex-1 h-px bg-gray-200 max-w-[80px]" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium">
                2
              </div>
              <span className="text-blue-600 font-medium">填写内容</span>
            </div>
          </div>
        </div>

        {/* Content Grid - 左侧配置 + 右侧固定预览 */}
        <div className="flex gap-8">
          {/* Config Panel - 占据主要宽度 */}
          <div className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden min-h-[600px]">
            {isGameGiftComponent ? (
              <GameGiftTemplateConfigPanel
                initialConfig={config as GameGiftTemplateConfig}
                onChange={handleConfigChange}
                onSave={handleSave}
                macroVariables={(config as GameGiftTemplateConfig).macroVariables}
              />
            ) : isPromotionComponent ? (
              <PromotionTemplateConfigPanel
                initialConfig={config as PromotionTemplateConfig}
                onChange={handleConfigChange}
                onSave={handleSave}
                macroVariables={(config as PromotionTemplateConfig).macroVariables}
              />
            ) : isCouponComponent ? (
              <CouponTemplateConfigPanel
                initialConfig={config as CouponTemplateConfig}
                onChange={handleConfigChange}
                onSave={handleSave}
                macroVariables={(config as CouponTemplateConfig).macroVariables}
              />
            ) : isEcommerceComponent ? (
              <EcommerceTemplateConfigPanel
                config={config as EcommerceTemplateConfig}
                onChange={handleConfigChange}
                onSave={handleSave}
              />
            ) : isVoteComponent ? (
              <VoteTemplateConfigPanel
                config={config as VoteTemplateConfig}
                onChange={handleConfigChange}
                onSave={handleSave}
              />
            ) : isImageComponent ? (
              <ImageTemplateConfigPanel
                config={config as ImageTemplateConfig}
                onChange={handleConfigChange}
                onSave={handleSave}
              />
            ) : isRedpacketRainComponent ? (
              <RedpacketRainTemplateConfigPanel
                config={config as RedpacketRainTemplateConfig}
                onChange={handleConfigChange}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            ) : isFlipRedpacketComponent ? (
              <FlipRedpacketTemplateConfigPanel
                config={config as FlipRedpacketTemplateConfig}
                onChange={handleConfigChange}
                onSave={handleSave}
                onCancel={handleCancel}
                macroVariables={(config as FlipRedpacketTemplateConfig).macroVariables}
              />
            ) : isTreasureBoxComponent ? (
              <TreasureBoxTemplateConfigPanel
                config={config as TreasureBoxConfig}
                onChange={handleConfigChange}
                onSave={handleSave}
                onCancel={handleCancel}
                macroVariables={(config as TreasureBoxConfig).macroVariables}
              />
            ) : isFlipCardComponent ? (
              <FlipCardTemplateConfigPanel
                config={config as FlipCardConfig}
                onChange={handleConfigChange}
                onSave={handleSave}
                macroVariables={(config as FlipCardConfig).macroVariables}
              />
            ) : isTreasureboxRainComponent ? (
              <TreasureboxRainTemplateConfigPanel
                config={config as TreasureboxRainTemplateConfig}
                onChange={handleConfigChange}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            ) : isSmashEggComponent ? (
              <SmashEggTemplateConfigPanel
                config={config as SmashEggConfig}
                onChange={(c) => handleConfigChange(c as unknown as AllConfigTypes)}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            ) : isScratchCardComponent ? (
              <ScratchCardTemplateConfigPanel
                config={config as ScratchCardConfig}
                onChange={(c) => handleConfigChange(c as unknown as AllConfigTypes)}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            ) : isPopupRedpacketComponent ? (
              <PopupRedpacketConfigPanel
                config={config as PopupRedpacketConfig}
                onChange={(c) => handleConfigChange(c as unknown as AllConfigTypes)}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            ) : isFloatingWindowComponent ? (
              <FloatingWindowTemplateConfigPanel
                initialConfig={config as FloatingWindowTemplateConfig}
                onChange={handleConfigChange}
                onSave={handleSave}
                macroVariables={(config as FloatingWindowTemplateConfig).macroVariables}
              />
            ) : isDownloadSixElementsComponent ? (
              <DownloadSixElementsTemplateConfigPanel
                config={config as unknown as DownloadSixElementsConfig}
                onChange={(c) => handleConfigChange(c as unknown as AllConfigTypes)}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            ) : (
              <AdTemplateConfigPanel
                config={config as AdTemplateConfig}
                onChange={handleConfigChange}
                onSave={handleSave}
              />
            )}
          </div>

          {/* Preview Panel - 固定定位 */}
          <div className="w-96 flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* Preview Header */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    效果预览
                  </h3>
                  {(isRedpacketRainComponent || isFlipRedpacketComponent || isTreasureBoxComponent || isFlipCardComponent || isTreasureboxRainComponent || isSmashEggComponent || isScratchCardComponent || isPopupRedpacketComponent) && (
                    <button
                      onClick={() => setPreviewResetKey(k => k + 1)}
                      className="px-2 py-1 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors"
                    >
                      重新预览
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">随滚动固定</p>
              </div>

              {/* Mobile Simulator */}
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-6 flex items-center justify-center relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />

                {/* Phone frame */}
                <div className="relative z-10">
                  <div className="w-[280px] h-[520px] bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
                    <div className={`w-full h-full ${isRedpacketRainComponent ? 'bg-transparent' : 'bg-[#F5F2EC]'} rounded-[2rem] overflow-hidden relative`}>
                      {/* Status bar */}
                      <div className="h-7 bg-white flex items-end justify-between px-5 pb-0.5">
                        <span className="text-[9px] font-medium text-gray-900">9:41</span>
                        <div className="flex items-center gap-0.5">
                          <div className="w-3 h-1.5 border border-gray-900 rounded-sm">
                            <div className="w-2 h-0.5 bg-gray-900 rounded-sm m-px" />
                          </div>
                        </div>
                      </div>

                      {/* App content */}
                      <div className={`h-[calc(100%-28px)] ${isRedpacketRainComponent ? 'flex flex-col items-center justify-center bg-transparent' : isFloatingWindowComponent ? 'relative overflow-hidden' : 'flex items-center justify-center overflow-hidden'}`}>
                        {isRedpacketRainComponent ? (
                          <div className="w-full px-4">
                            <RedpacketRainTemplate
                              key={`redpacket-${previewResetKey}`}
                              config={config as RedpacketRainTemplateConfig}
                              isOpen={true}
                              previewMode={true}
                              onClose={() => setPreviewResetKey(k => k + 1)}
                            />
                          </div>
                        ) : isFlipRedpacketComponent ? (
                          <div className="relative w-full px-4">
                            <FlipRedpacketTemplate
                              key={`flip-${previewResetKey}`}
                              config={config as FlipRedpacketTemplateConfig}
                              isOpen={true}
                              previewMode={true}
                              onClose={() => setPreviewResetKey(k => k + 1)}
                            />
                            {/* 预览关闭按钮 */}
                            <button
                              onClick={() => setPreviewResetKey(k => k + 1)}
                              className="absolute top-2 right-6 z-20 w-6 h-6 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-opacity"
                              style={{ backgroundColor: "rgba(255, 255, 255, 0.25)" }}
                            >
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : isTreasureBoxComponent ? (
                          <div className="relative w-full px-4">
                            <TreasureBoxTemplate
                              key={`treasure-${previewResetKey}`}
                              config={config as TreasureBoxConfig}
                              isOpen={true}
                              previewMode={true}
                              onClose={() => setPreviewResetKey(k => k + 1)}
                            />
                            {/* 预览关闭按钮 */}
                            <button
                              onClick={() => setPreviewResetKey(k => k + 1)}
                              className="absolute top-2 right-6 z-20 w-6 h-6 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-opacity"
                              style={{ backgroundColor: "rgba(255, 255, 255, 0.25)" }}
                            >
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : isFlipCardComponent ? (
                          <div className="relative w-full px-4">
                            <FlipCardTemplate
                              key={`card-${previewResetKey}`}
                              config={config as FlipCardConfig}
                              isOpen={true}
                              previewMode={true}
                              onClose={() => setPreviewResetKey(k => k + 1)}
                            />
                            {/* 预览关闭按钮 */}
                            <button
                              onClick={() => setPreviewResetKey(k => k + 1)}
                              className="absolute top-2 right-6 z-20 w-6 h-6 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity"
                              style={{ backgroundColor: "rgba(255, 255, 255, 0.25)" }}
                            >
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : isSmashEggComponent ? (
                          <SmashEggTemplate
                            key={`smashegg-${previewResetKey}`}
                            config={config as SmashEggConfig}
                            isOpen={true}
                            previewMode={true}
                            onClose={() => setPreviewResetKey(k => k + 1)}
                          />
                        ) : isScratchCardComponent ? (
                          <ScratchCardTemplate
                            key={`scratchcard-${previewResetKey}`}
                            config={config as ScratchCardConfig}
                            isOpen={true}
                            previewMode={true}
                            onClose={() => setPreviewResetKey(k => k + 1)}
                          />
                        ) : isPopupRedpacketComponent ? (
                          <PopupRedpacketTemplate
                            key={`popupredpacket-${previewResetKey}`}
                            config={config as PopupRedpacketConfig}
                            isOpen={true}
                            previewMode={true}
                            onClose={() => setPreviewResetKey(k => k + 1)}
                          />
                        ) : isTreasureboxRainComponent ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <TreasureboxRainTemplate
                              key={`treasureboxrain-${previewResetKey}`}
                              config={config as TreasureboxRainTemplateConfig}
                              isOpen={true}
                              previewMode={true}
                              onClose={() => setPreviewResetKey(k => k + 1)}
                            />
                          </div>
                        ) : isGameGiftComponent ? (
                          <GameGiftTemplate
                            config={config as GameGiftTemplateConfig}
                            isOpen={true}
                            previewMode={true}
                          />
                        ) : isPromotionComponent ? (
                          <PromotionTemplate
                            config={config as PromotionTemplateConfig}
                            isOpen={true}
                            previewMode={true}
                          />
                        ) : isCouponComponent ? (
                          <CouponTemplate
                            config={config as CouponTemplateConfig}
                            isOpen={true}
                            previewMode={true}
                          />
                        ) : isEcommerceComponent ? (
                          <EcommerceTemplate
                            config={config as EcommerceTemplateConfig}
                            isOpen={true}
                            previewMode={true}
                          />
                        ) : isImageComponent ? (
                          <ImageTemplate
                            config={config as ImageTemplateConfig}
                            isOpen={true}
                            previewMode={true}
                          />
                        ) : isVoteComponent ? (
                          <VoteTemplate
                            config={config as VoteTemplateConfig}
                            isOpen={true}
                            previewMode={true}
                          />
                        ) : isFloatingWindowComponent ? (
                          <FloatingWindowTemplate
                            config={config as FloatingWindowTemplateConfig}
                            isOpen={true}
                            previewMode={true}
                          />
                        ) : isDownloadSixElementsComponent ? (
                          <DownloadSixElementsTemplate
                            config={config as unknown as DownloadSixElementsConfig}
                            isOpen={true}
                            previewMode={true}
                          />
                        ) : (
                          <AdTemplate
                            config={config as AdTemplateConfig}
                            isOpen={true}
                            previewMode={true}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature highlights */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3 border border-gray-200">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-900">
                    {isGameGiftComponent ? "游戏礼包码" : isPromotionComponent ? "推广卡片" : isCouponComponent ? "优惠券磁贴" : isEcommerceComponent ? "电商磁贴" : isImageComponent ? "图片磁贴" : isVoteComponent ? "投票选项" : isRedpacketRainComponent ? "红包雨" : isFlipRedpacketComponent ? "翻红包" : isTreasureBoxComponent ? "翻宝箱" : isFlipCardComponent ? "翻卡" : isTreasureboxRainComponent ? "宝箱雨" : isSmashEggComponent ? "砸金蛋" : isScratchCardComponent ? "刮刮卡" : isPopupRedpacketComponent ? "弹窗红包" : isFloatingWindowComponent ? "浮窗" : isDownloadSixElementsComponent ? "下载六要素" : "上文下按钮"}
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {isGameGiftComponent ? "应用图片+Logo+名称+描述+下载" : isPromotionComponent ? "图标+标题+推广卖点+行动号召" : isCouponComponent ? "活动名称+优惠信息+领取按钮" : isEcommerceComponent ? "左图右文电商风格" : isImageComponent ? "单图或多图轮播展示" : isVoteComponent ? "支持多个投票选项" : isRedpacketRainComponent ? "红包飘落+领奖场景" : isFlipRedpacketComponent ? "点击红包+翻出惊喜" : isTreasureBoxComponent ? "点击宝箱+翻出惊喜" : isFlipCardComponent ? "点击卡牌+翻出惊喜" : isTreasureboxRainComponent ? "宝箱飘落+领奖场景" : isSmashEggComponent ? "点击金蛋+领取奖励" : isScratchCardComponent ? "刮开涂层+领取奖励" : isPopupRedpacketComponent ? "点击红包+领取奖励" : isFloatingWindowComponent ? "浮窗展示+卖点轮播+行动号召" : isDownloadSixElementsComponent ? "应用名+开发者+版本+隐私+权限+功能" : "主标题+副标题+双按钮"}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-3 border border-gray-200">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                    </svg>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-900">灵活跳转</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">落地页或图片展示</p>
                </div>

                <div className="bg-white rounded-xl p-3 border border-gray-200">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4z" />
                    </svg>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-900">样式定制</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">输入模式和宏替换</p>
                </div>

                <div className="bg-white rounded-xl p-3 border border-gray-200">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-900">APP适配</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">移动端原生体验</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ComponentConfigPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    }>
      <ConfigContent />
    </Suspense>
  );
}
