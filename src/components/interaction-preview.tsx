"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  X,
  Clock,
  MousePointer,
  RotateCcw,
} from "lucide-react";
import { AdTemplate, AdTemplateConfig } from "./ad-template";
import { VoteTemplate, VoteTemplateConfig } from "./vote-template";
import { ImageTemplate, ImageTemplateConfig } from "./image-template";
import { EcommerceTemplate, EcommerceTemplateConfig } from "./ecommerce-template";
import { CouponTemplate, CouponTemplateConfig } from "./coupon-template";
import { PromotionTemplate, PromotionTemplateConfig } from "./promotion-template";
import { GameGiftTemplate, GameGiftTemplateConfig } from "./game-gift-template";
import { RedpacketRainTemplate, RedpacketRainTemplateConfig } from "./redpacket-rain-template";
import { FlipRedpacketTemplateConfig } from "./flip-redpacket-template-config";
import { FlipRedpacketTemplate as FlipRedpacketTemplateComp } from "./flip-redpacket-template";
import TreasureBoxTemplate from "./treasurebox-template";
import { TreasureBoxConfig } from "./treasurebox-template-config";
import FlipCardTemplate from "./flip-card-template";
import { FlipCardConfig } from "./flip-card-template-config";
import { TreasureboxRainTemplate } from "./treasurebox-rain-template";
import { TreasureboxRainTemplateConfig } from "./treasurebox-rain-template-config";
import { SmashEggConfig } from "./smash-egg-template-config";
import { SmashEggTemplate } from "./smash-egg-template";
import { ScratchCardConfig } from "./scratch-card-config";
import { ScratchCardTemplate } from "./scratch-card-template";
import { PopupRedpacketTemplateConfig } from "./popup-redpacket-template";
import PopupRedpacketTemplate from "./popup-redpacket-template";

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
  componentTypeKey: string;
  componentPreview: string;
  componentConfig?: Record<string, unknown>;
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

// ---- 组件类型默认配置 ----

const DEFAULT_COMPONENT_CONFIGS: Record<string, Record<string, unknown>> = {
  dual_button: {
    title: "限时特惠活动",
    subtitle: "新用户首单立减50元，更有超值礼包等你来拿",
    button1: { text: "立即领取", action: "jump", landingPageUrl: "" },
    button2: { text: "查看详情", action: "show_image", imageUrl: "", resultText: "", buttonClickText: "" },
    action: "open",
    defaultLandingPageUrl: "",
  },
  vote: {
    title: "限时特惠活动",
    subtitle: "新用户首单立减50元",
    options: [{ id: "1", buttonText: "选项A" }, { id: "2", buttonText: "选项B" }],
    action: "jump",
    defaultLandingPageUrl: "",
  },
  image: {
    images: [{ id: "1", imageUrl: "https://picsum.photos/640/360" }],
    defaultLandingPageUrl: "",
  },
  ecommerce: {
    title: "商品名称",
    content: "商品描述内容",
    buttonText: "立即购买",
    imageUrl: "",
    landingPageUrl: "",
    defaultLandingPageUrl: "",
  },
  coupon: {
    title: "限时优惠活动",
    discountInfo: "30元",
    discountCondition: "满100立减！",
    buttonText: "立即领取",
    validFrom: "2024-01-01",
    validTo: "2024-12-31",
    landingPageUrl: "",
    defaultLandingPageUrl: "",
  },
  promotion_card: {
    iconUrl: "",
    title: "官方推广",
    promotionPoints: [{ id: "1", text: "官方正版授权" }, { id: "2", text: "安全无毒无插件" }],
    buttonText: "立即下载",
    landingPageUrl: "",
    defaultLandingPageUrl: "",
  },
  game_gift: {
    componentName: "游戏礼包码",
    images: [{ id: "1", imageUrl: "https://picsum.photos/640/360" }],
    logoUrl: "",
    appName: "游戏名称",
    appDescription: "游戏描述内容",
    appPackageName: "com.example.game",
    downloadUrl: "",
    giftCode: "ABCD123456",
    defaultLandingPageUrl: "",
  },
  redpacket_rain: {
    guideText: "点击红包，领取奖品",
    guideTextMacro: "",
    rewardType: "cash",
    cashAmount: "88.88",
    cashAmountMacro: "",
    rewardImageUrl: "",
    rewardImageMacro: "",
    rewardText: "恭喜发财",
    rewardTextMacro: "",
    specialNote: "实际奖品以APP为准！",
    specialNoteMacro: "",
    redpacketImageUrl: "",
    redpacketImageMacro: "",
    landingPageUrl: "",
    landingPageMacro: "",
    defaultLandingPageUrl: "",
  },
  flip_card: {
    title: "翻转卡片",
    subtitle: "点击卡片查看惊喜",
    button1: { text: "翻转", action: "jump", landingPageUrl: "" },
    button2: { text: "关闭", action: "jump", landingPageUrl: "" },
    action: "open",
    defaultLandingPageUrl: "",
  },
  flip_redpacket: {
    guideText: "点击红包，领取奖品",
    guideTextMacro: "",
    rewardType: "cash",
    cashAmount: "6.66",
    cashAmountMacro: "",
    rewardImageUrl: "",
    rewardImageMacro: "",
    rewardText: "恭喜发财",
    rewardTextMacro: "",
    specialNote: "实际奖品以APP为准！",
    specialNoteMacro: "",
    redpacketImageUrl: "",
    redpacketImageMacro: "",
    landingPageUrl: "",
    landingPageMacro: "",
    defaultLandingPageUrl: "",
  },
  flip_treasure: {
    guideText: "点击宝箱，领取奖品",
    guideTextMacro: "",
    rewardType: "cash",
    cashAmount: "8.88",
    cashAmountMacro: "",
    rewardImageUrl: "",
    rewardImageMacro: "",
    rewardText: "恭喜发财",
    rewardTextMacro: "",
    specialNote: "实际奖品以APP为准！",
    specialNoteMacro: "",
    redpacketImageUrl: "",
    redpacketImageMacro: "",
    landingPageUrl: "",
    landingPageMacro: "",
    defaultLandingPageUrl: "",
  },
  treasure_rain: {
    guideText: "点击宝箱，领取奖品",
    guideTextMacro: "",
    rewardType: "cash",
    cashAmount: "18.88",
    cashAmountMacro: "",
    rewardImageUrl: "",
    rewardImageMacro: "",
    rewardText: "恭喜发财",
    rewardTextMacro: "",
    specialNote: "实际奖品以APP为准！",
    specialNoteMacro: "",
    redpacketImageUrl: "",
    redpacketImageMacro: "",
    landingPageUrl: "",
    landingPageMacro: "",
    defaultLandingPageUrl: "",
  },
  scratch_card: {
    title: "刮刮卡",
    subtitle: "刮开涂层查看惊喜",
    button1: { text: "刮一刮", action: "jump", landingPageUrl: "" },
    button2: { text: "关闭", action: "jump", landingPageUrl: "" },
    action: "open",
    defaultLandingPageUrl: "",
  },
  smash_egg: {
    title: "砸蛋",
    subtitle: "砸开金蛋查看惊喜",
    button1: { text: "砸一砸", action: "jump", landingPageUrl: "" },
    button2: { text: "关闭", action: "jump", landingPageUrl: "" },
    action: "open",
    defaultLandingPageUrl: "",
  },
  popup_redpacket: {
    title: "弹窗红包",
    subtitle: "点击领取红包",
    button1: { text: "立即领取", action: "jump", landingPageUrl: "" },
    button2: { text: "关闭", action: "jump", landingPageUrl: "" },
    action: "open",
    defaultLandingPageUrl: "",
  },
};

// ---- 真实组件渲染 ----

function RealComponentPreview({
  componentTypeKey,
  componentConfig,
  onDismiss,
}: {
  componentTypeKey: string;
  componentConfig?: Record<string, unknown>;
  onDismiss: () => void;
}) {
  const config = componentConfig || DEFAULT_COMPONENT_CONFIGS[componentTypeKey] || DEFAULT_COMPONENT_CONFIGS.dual_button;

  // 投票组件
  if (componentTypeKey === "vote") {
    return (
      <VoteTemplate
        config={config as unknown as VoteTemplateConfig}
        isOpen={true}
        onClose={onDismiss}
        previewMode={true}
      />
    );
  }

  // 图片磁贴
  if (componentTypeKey === "image") {
    return (
      <ImageTemplate
        config={config as unknown as ImageTemplateConfig}
        isOpen={true}
        onClose={onDismiss}
        previewMode={true}
      />
    );
  }

  // 电商磁贴
  if (componentTypeKey === "ecommerce") {
    return (
      <EcommerceTemplate
        config={config as unknown as EcommerceTemplateConfig}
        isOpen={true}
        onClose={onDismiss}
        previewMode={true}
      />
    );
  }

  // 优惠券磁贴
  if (componentTypeKey === "coupon") {
    return (
      <CouponTemplate
        config={config as unknown as CouponTemplateConfig}
        isOpen={true}
        onClose={onDismiss}
        previewMode={true}
      />
    );
  }

  // 推广卡片
  if (componentTypeKey === "promotion_card") {
    return (
      <PromotionTemplate
        config={config as unknown as PromotionTemplateConfig}
        isOpen={true}
        onClose={onDismiss}
        previewMode={true}
      />
    );
  }

  // 红包雨
  if (componentTypeKey === "redpacket_rain") {
    return (
      <RedpacketRainTemplate
        config={config as unknown as RedpacketRainTemplateConfig}
        isOpen={true}
        onClose={onDismiss}
        previewMode={true}
      />
    );
  }

  // 游戏礼包码
  if (componentTypeKey === "game_gift") {
    return (
      <GameGiftTemplate
        config={config as unknown as GameGiftTemplateConfig}
        isOpen={true}
        onClose={onDismiss}
        previewMode={true}
      />
    );
  }

  // 翻转红包
  if (componentTypeKey === "flip_redpacket") {
    return (
      <FlipRedpacketTemplateComp
        config={config as unknown as FlipRedpacketTemplateConfig}
        isOpen={true}
        onClose={onDismiss}
        previewMode={true}
      />
    );
  }

  // 翻转宝箱
  if (componentTypeKey === "flip_treasure") {
    return (
      <TreasureBoxTemplate
        config={config as unknown as TreasureBoxConfig}
        isOpen={true}
        onClose={onDismiss}
        previewMode={true}
      />
    );
  }

  // 翻转卡牌
  if (componentTypeKey === "flip_card") {
    return (
      <FlipCardTemplate
        config={config as unknown as FlipCardConfig}
        isOpen={true}
        onClose={onDismiss}
        previewMode={true}
      />
    );
  }

  // 宝箱雨
  if (componentTypeKey === "treasure_rain") {
    return (
      <TreasureboxRainTemplate
        config={config as unknown as TreasureboxRainTemplateConfig}
        isOpen={true}
        onClose={onDismiss}
        previewMode={true}
      />
    );
  }

  // 砸金蛋
  if (componentTypeKey === "smash_egg") {
    return (
      <SmashEggTemplate
        config={config as unknown as SmashEggConfig}
        isOpen={true}
        onClose={onDismiss}
        previewMode={true}
      />
    );
  }

  // 刮刮卡
  if (componentTypeKey === "scratch_card") {
    return (
      <ScratchCardTemplate
        config={config as unknown as ScratchCardConfig}
        isOpen={true}
        onClose={onDismiss}
        previewMode={true}
      />
    );
  }

  // 弹窗红包
  if (componentTypeKey === "popup_redpacket") {
    return (
      <PopupRedpacketTemplate
        config={config as unknown as PopupRedpacketTemplateConfig}
        isOpen={true}
        onClose={onDismiss}
        previewMode={true}
      />
    );
  }

  // 双按钮等其他类型使用 AdTemplate
  return (
    <AdTemplate
      config={config as unknown as AdTemplateConfig}
      isOpen={true}
      onClose={onDismiss}
      previewMode={true}
    />
  );
}

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

  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!["static_splash", "video_splash"].includes(templateType)) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 0 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [templateType]);

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

  if (templateType === "rewarded_video") {
    return <RewardedVideoPhonePreview defaultImage={defaultImage} onCloseClick={onCloseClick} />;
  }

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
      {onCloseClick && !["static_splash", "video_splash"].includes(templateType) && (
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

      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-300/50 via-yellow-300/50 to-amber-400/50 rounded-full blur-sm" />
          <div className="relative bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-white text-center py-1.5 px-5 rounded-full shadow-lg border border-amber-300/30">
            <p className="text-[9px] font-semibold whitespace-nowrap">观看视频以领取双倍金币奖励</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-20 right-3 z-20">
        <div className="bg-white/90 backdrop-blur-md rounded-lg px-2.5 py-1 shadow-lg border border-white/50">
          <p className="text-gray-800 text-[9px] font-medium">
            {isCompleted ? "可领取" : `${currentSeconds}s后可领取`}
          </p>
        </div>
      </div>

      <div className="absolute bottom-6 left-3 z-20">
        <div className="bg-white/25 backdrop-blur-md rounded-xl px-2.5 py-1.5 shadow-lg border border-white/30">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">💎</span>
            <span className="text-white text-xs font-bold drop-shadow-md tabular-nums">x{diamondCount}</span>
          </div>
        </div>
      </div>

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
  const [triggeredComponents, setTriggeredComponents] = useState<Set<string>>(new Set());

  // 自动触发计时器
  const triggerTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  // 用 ref 跟踪状态，避免闭包陈旧引用
  const triggeredRef = useRef<Set<string>>(new Set());
  const dismissedRef = useRef<Set<string>>(new Set());

  const clearAllTimers = useCallback(() => {
    triggerTimersRef.current.forEach((timer) => clearTimeout(timer));
    triggerTimersRef.current.clear();
  }, []);

  // 获取某个组件的所有子组件（parentId 等于该组件 id 的组件）
  const getChildren = useCallback((parentId: string) => {
    return enabledLinks.filter((l) => l.parentId === parentId);
  }, [enabledLinks]);

  // 触发组件弹出
  const triggerComponent = useCallback((link: ComponentLinkConfig) => {
    triggeredRef.current.add(link.id);
    setTriggeredComponents(new Set(triggeredRef.current));
    setActiveComponents((prev) => {
      if (prev.find((l) => l.id === link.id)) return prev;
      return [...prev, link];
    });
  }, []);

  // 启动某个父级下子组件的自动触发计时器
  const startChildAutoTriggers = useCallback((parentId: string) => {
    const children = getChildren(parentId);
    children.forEach((link) => {
      // 跳过已触发或已关闭的
      if (triggeredRef.current.has(link.id) || dismissedRef.current.has(link.id)) return;

      const rule = TRIGGER_RULES[link.triggerRule];
      if (!rule) return;

      if (rule.autoDelay > 0) {
        // 自动触发类规则：show_time, video_complete, back_from_media, in_app_interaction
        const actualDelay = link.triggerRule === "show_time" && link.triggerTime
          ? link.triggerTime * 1000
          : rule.autoDelay;
        const timer = setTimeout(() => {
          // 再次检查是否已被其他路径触发
          if (triggeredRef.current.has(link.id)) return;
          triggerComponent(link);
        }, actualDelay);
        triggerTimersRef.current.set(link.id, timer);
      }
      // 手动触发类规则（click_close, click_other_ad）需要用户操作，不在此启动
    });
  }, [getChildren, triggerComponent]);

  // 关闭组件弹出
  const dismissComponent = useCallback((linkId: string) => {
    dismissedRef.current.add(linkId);
    setDismissedComponents(new Set(dismissedRef.current));
    setActiveComponents((prev) => prev.filter((l) => l.id !== linkId));

    // 关闭组件后，触发其所有子组件中需要父组件关闭才能触发的规则
    const children = getChildren(linkId);
    children.forEach((link) => {
      if (triggeredRef.current.has(link.id) || dismissedRef.current.has(link.id)) return;
      const rule = TRIGGER_RULES[link.triggerRule];
      if (!rule) return;

      if (rule.autoDelay > 0) {
        // back_from_media 等：父组件关闭后延迟触发
        const timer = setTimeout(() => {
          if (triggeredRef.current.has(link.id)) return;
          triggerComponent(link);
        }, rule.autoDelay);
        triggerTimersRef.current.set(link.id, timer);
      }
      // click_close 等手动触发类：需要用户再次点击关闭
    });
  }, [getChildren, triggerComponent]);

  // 启动根级自动触发逻辑
  const startAutoTriggers = useCallback(() => {
    clearAllTimers();
    // 启动主素材下的子组件触发
    startChildAutoTriggers("main");
  }, [clearAllTimers, startChildAutoTriggers]);

  // 处理关闭按钮点击（click_close 类型触发）
  const handleCloseClick = useCallback((parentId: string) => {
    const clickCloseLinks = enabledLinks.filter(
      (l) => l.triggerRule === "click_close" && l.parentId === parentId && !triggeredRef.current.has(l.id) && !dismissedRef.current.has(l.id)
    );
    clickCloseLinks.forEach((link) => {
      triggerComponent(link);
    });
  }, [enabledLinks, triggerComponent]);

  // 组件被触发后，启动其子组件的触发计时器
  useEffect(() => {
    if (activeComponents.length === 0) return;
    // 对最新激活的组件，启动其子组件的触发计时器
    const latest = activeComponents[activeComponents.length - 1];
    startChildAutoTriggers(latest.id);
  }, [activeComponents, startChildAutoTriggers]);

  // 重置预览
  const handleReset = useCallback(() => {
    clearAllTimers();
    triggeredRef.current = new Set();
    dismissedRef.current = new Set();
    setActiveComponents([]);
    setDismissedComponents(new Set());
    setTriggeredComponents(new Set());
    // 延迟启动，确保状态已清除
    setTimeout(() => {
      startAutoTriggers();
    }, 100);
  }, [clearAllTimers, startAutoTriggers]);

  // 初始启动
  useEffect(() => {
    startAutoTriggers();
    return () => clearAllTimers();
  }, []);

  // 计算链路描述
  const getChainDescription = () => {
    if (activeComponents.length === 0 && triggeredComponents.size === 0) {
      const pendingRoots = enabledLinks.filter((l) => l.parentId === "main");
      if (pendingRoots.length === 0) return "模版展示中";
      const next = pendingRoots[0];
      const rule = TRIGGER_RULES[next.triggerRule];
      return rule ? `模版展示 → ${rule.label}后弹出「${next.componentName}」` : "模版展示中";
    }
    if (activeComponents.length === 0 && triggeredComponents.size > 0) {
      return "所有组件已关闭";
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
                onCloseClick={() => handleCloseClick("main")}
              />

              {/* 上层：组件真实预览弹出（逐层覆盖） */}
              {activeComponents.map((link, idx) => (
                <div
                  key={link.id}
                  className="absolute inset-0 z-40"
                  style={{ zIndex: 40 + idx }}
                >
                  <RealComponentPreview
                    componentTypeKey={link.componentTypeKey}
                    componentConfig={link.componentConfig}
                    onDismiss={() => {
                      dismissComponent(link.id);
                      // 同时检查该组件的子组件中是否有 click_close 类型需要触发
                      handleCloseClick(link.id);
                    }}
                  />
                </div>
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
          <p className="text-white/70 text-xs">{getChainDescription()}</p>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              重置
            </button>
          </div>

          {/* 交互提示 - 完整链路 */}
          <div className="space-y-1">
            {enabledLinks.map((link) => {
              const rule = TRIGGER_RULES[link.triggerRule];
              if (!rule) return null;
              const isAuto = rule.autoDelay > 0;
              const isTriggered = triggeredComponents.has(link.id);
              const isDismissed = dismissedComponents.has(link.id);
              const isActive = activeComponents.some((c) => c.id === link.id);
              // 确定父级名称
              const parentLabel = link.parentId === "main" ? "模版" : enabledLinks.find(l => l.id === link.parentId)?.componentName || link.parentName;
              const indent = link.parentId === "main" ? "" : "  └ ";

              return (
                <div
                  key={link.id}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] mx-0.5 ${
                    isDismissed
                      ? "bg-gray-500/20 text-gray-400"
                      : isActive
                        ? "bg-amber-500/20 text-amber-300"
                        : isTriggered
                          ? "bg-green-500/20 text-green-300"
                          : isAuto
                            ? "bg-blue-500/20 text-blue-300"
                            : "bg-amber-500/20 text-amber-300"
                  }`}
                >
                  {isDismissed ? (
                    <span className="text-gray-400">✓</span>
                  ) : isActive ? (
                    <span className="text-amber-400 animate-pulse">●</span>
                  ) : isTriggered ? (
                    <span className="text-green-400">✓</span>
                  ) : isAuto ? (
                    <Clock className="w-3 h-3" />
                  ) : (
                    <MousePointer className="w-3 h-3" />
                  )}
                  <span>
                    {indent}{parentLabel} → {rule.label}{isAuto ? "后" : ""} → {link.componentName}
                    {isActive && " (展示中)"}
                    {isDismissed && " (已关闭)"}
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
