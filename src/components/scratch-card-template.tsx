"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScratchCardConfig } from "./scratch-card-config";

interface ScratchCardTemplateProps {
  config?: Partial<ScratchCardConfig>;
  isOpen?: boolean;
  onClose?: () => void;
  previewMode?: boolean;
}

// 解析宏变量
function resolveMacro(macro: string, variables?: Record<string, string>): string {
  if (!macro || !variables) return macro;
  let result = macro;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
    result = result.replace(new RegExp(`\\$${key}`, 'g'), value);
  });
  return result;
}

// 金币飘落元素类型
interface FallingElement {
  id: number;
  x: number;
  delay: number;
  duration: number;
  scale: number;
  rotation: number;
  type: 'yuanbao1' | 'yuanbao2' | 'yuanbao3' | 'yuanbao4' | 'yuanbao5' | 'yuanbao6';
}

export function ScratchCardTemplate({
  config,
  isOpen = true,
  onClose,
  previewMode = false,
}: ScratchCardTemplateProps) {
  // 状态
  const [isScratched, setIsScratched] = useState(false);
  const [fallingElements, setFallingElements] = useState<FallingElement[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 默认配置
  const defaultConfig: ScratchCardConfig = {
    componentName: "好运刮出来！",
    guideText: "恭喜获得",
    guideTextMacro: "",
    rewardType: "cash",
    cashAmount: "88.88",
    cashAmountMacro: "",
    rewardImageUrl: "",
    rewardImageMacro: "",
    rewardText: "50元优惠券",
    rewardTextMacro: "",
    specialNote: "实际奖品以APP为准！",
    specialNoteMacro: "",
    landingPageUrl: "",
    landingPageMacro: "",
    defaultLandingPageUrl: "",
    macroVariables: {},
  };

  const finalConfig = { ...defaultConfig, ...config };

  // 解析宏变量
  const resolveMacroText = useCallback(
    (text?: string, macroText?: string) => {
      if (macroText) {
        const resolved = resolveMacro(macroText, finalConfig.macroVariables);
        if (resolved.includes("${") || resolved.startsWith("$")) {
          return text || "";
        }
        return resolved;
      }
      return text || "";
    },
    [finalConfig.macroVariables]
  );

  const resolveGuideText = useCallback(() => {
    return resolveMacroText(finalConfig.guideText, finalConfig.guideTextMacro);
  }, [finalConfig.guideText, finalConfig.guideTextMacro, resolveMacroText]);

  const resolveCashAmount = useCallback(() => {
    return resolveMacroText(finalConfig.cashAmount, finalConfig.cashAmountMacro);
  }, [finalConfig.cashAmount, finalConfig.cashAmountMacro, resolveMacroText]);

  const resolveRewardText = useCallback(() => {
    return resolveMacroText(finalConfig.rewardText, finalConfig.rewardTextMacro);
  }, [finalConfig.rewardText, finalConfig.rewardTextMacro, resolveMacroText]);

  const resolveSpecialNote = useCallback(() => {
    return resolveMacroText(finalConfig.specialNote, finalConfig.specialNoteMacro);
  }, [finalConfig.specialNote, finalConfig.specialNoteMacro, resolveMacroText]);

  const resolveRewardImage = useCallback(() => {
    if (finalConfig.rewardImageMacro) {
      const resolved = resolveMacro(finalConfig.rewardImageMacro, finalConfig.macroVariables);
      if (!resolved.includes("${") && !resolved.startsWith("$")) {
        return resolved;
      }
    }
    return finalConfig.rewardImageUrl;
  }, [finalConfig.rewardImageUrl, finalConfig.rewardImageMacro, finalConfig.macroVariables]);

  // 获取落地页链接
  const getLandingPageUrl = useCallback(() => {
    if (finalConfig.landingPageMacro) {
      const resolved = resolveMacro(finalConfig.landingPageMacro, finalConfig.macroVariables);
      if (!resolved.includes("${") && !resolved.startsWith("$")) {
        return resolved;
      }
    }
    if (finalConfig.landingPageUrl) {
      return finalConfig.landingPageUrl;
    }
    return finalConfig.defaultLandingPageUrl || "#";
  }, [finalConfig.landingPageUrl, finalConfig.landingPageMacro, finalConfig.defaultLandingPageUrl, finalConfig.macroVariables]);

  // 飘落元素计数器
  const elementCounterRef = useRef(0);

  // 生成飘落元素
  const generateFallingElements = useCallback(() => {
    const elements: FallingElement[] = [];
    const types: FallingElement['type'][] = ['yuanbao1', 'yuanbao2', 'yuanbao3', 'yuanbao4', 'yuanbao5', 'yuanbao6'];
    const count = 8; // 降低50%: 从15个减少到8个
    
    for (let i = 0; i < count; i++) {
      elements.push({
        id: elementCounterRef.current++,
        x: Math.random() * 90 + 5,
        delay: Math.random() * 4000, // 延迟范围扩大，分散飘落
        duration: 4000 + Math.random() * 2000, // 飘落时长增加
        scale: 0.8 + Math.random() * 0.4,
        rotation: -15 + Math.random() * 30,
        type: types[Math.floor(Math.random() * types.length)],
      });
    }
    return elements;
  }, []);

  // 处理刮卡点击
  const handleScratch = useCallback(() => {
    if (isScratched) return;
    setIsScratched(true);
  }, [isScratched]);

  // 处理领取
  const handleClaim = useCallback(() => {
    const url = getLandingPageUrl();
    if (url && url !== "#") {
      window.open(url, "_blank");
    }
  }, [getLandingPageUrl]);

  // 重置状态
  useEffect(() => {
    setIsScratched(false);
    // 只生成一次飘落元素，持续飘落
    setFallingElements(generateFallingElements());
  }, [generateFallingElements]);

  // 渲染飘落金币
  const renderFallingElements = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {fallingElements.map((element) => (
        <img
          key={element.id}
          src={`/${element.type}.png`}
          alt=""
          className="absolute"
          style={{
            left: `${element.x}%`,
            top: '0px',
            width: '30px',
            height: 'auto',
            transform: `scale(${element.scale}) rotate(${element.rotation}deg)`,
            animation: `fallDownRelative ${element.duration}ms ease-in forwards`,
            animationDelay: `${element.delay}ms`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleScratch();
          }}
          draggable={false}
        />
      ))}
    </div>
  );

  // 渲染刮刮卡场景
  const renderScratchScene = () => (
    <div 
      className="relative w-full h-full flex flex-col overflow-hidden cursor-pointer"
      style={{
        backgroundImage: "url('/scratch-card-page.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onClick={handleScratch}
    >
      {/* 上方刮刮卡区域 */}
      <div className="flex-1 flex items-center justify-center relative">
        {/* 手势提示 */}
        <div className="absolute left-[calc(2rem+30px)] top-[calc(110%+20px)] -translate-y-1/2 gesture-slide">
          <img
            src="/gesture-hand.png"
            alt="手势"
            className="w-10 h-auto"
            draggable={false}
          />
        </div>
      </div>

      {/* 下方飘落动效区 - 改为相对定位容器 */}
      <div className="relative" style={{ height: "30%" }}>
        {renderFallingElements()}
      </div>

      {/* 好运刮出来提示 */}
      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
        <p className="text-white text-sm font-bold drop-shadow-lg scale-pulse animate-pulse">
          好运刮出来
        </p>
      </div>
    </div>
  );

  // 渲染领奖场景
  const renderRewardScene = () => (
    <div 
      className="relative w-full h-full flex flex-col items-center justify-center cursor-pointer"
      style={{
        backgroundImage: "url('/scratch-card-reward-page.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onClick={handleClaim}
    >
      {/* 引导文案 */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 text-center">
        <p className="text-white text-xl font-bold drop-shadow-lg">
          {resolveGuideText()}
        </p>
      </div>

      {/* 奖励展示 */}
      <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-3/4 flex flex-col items-center reward-pop">
        {finalConfig.rewardType === "cash" ? (
          <div className="flex flex-col items-center">
            <p className="text-2xl font-bold text-yellow-400 mb-1">¥{resolveCashAmount()}</p>
          </div>
        ) : resolveRewardImage() ? (
          <img
            src={resolveRewardImage()}
            alt="奖励"
            className="max-w-full max-h-20 object-contain rounded-xl shadow-lg"
            draggable={false}
          />
        ) : null}
      </div>

      {/* 奖品文案 */}
      <div className="absolute top-[50%] left-1/2 -translate-x-1/2 w-3/4 flex flex-col items-center">
        <p className="text-white text-base font-semibold drop-shadow-lg text-center">
          {resolveRewardText()}
        </p>
      </div>

      {/* 特殊说明 */}
      <div className="absolute top-[62%] left-1/2 -translate-x-1/2 w-3/4 flex flex-col items-center">
        <p className="text-yellow-200/80 text-xs drop-shadow-lg text-center">
          {resolveSpecialNote()}
        </p>
      </div>

      {/* 领取按钮区域 */}
      <div 
        className="absolute bottom-[12%] left-1/2 -translate-x-1/2 w-[55%] aspect-[120/35] cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          handleClaim();
        }}
      />
    </div>
  );

  // 预览模式
  if (previewMode) {
    return (
      <div className="w-full h-full rounded-t-2xl shadow-lg relative overflow-hidden" style={{ minHeight: "500px" }}>
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-20 w-7 h-7 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
          >
            <X className="w-4 h-4 text-white" />
          </button>
        )}

        {!isScratched ? renderScratchScene() : renderRewardScene()}
      </div>
    );
  }

  // 全屏模式
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.3)" }}
        >
          <X className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Main Content */}
      <div className="flex-1">
        {isScratched ? renderRewardScene() : renderScratchScene()}
      </div>
    </div>
  );
}
