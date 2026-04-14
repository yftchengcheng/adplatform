"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// 配置接口
export interface VoteOption {
  id: string;
  text: string;
  voteCount: number;
  buttonText: string;
}

export interface VoteTemplateConfig {
  title: string;
  titleMacro?: string;
  subtitle?: string;
  subtitleMacro?: string;
  options: VoteOption[];
  clickResultText?: string;
  action: "jump" | "show_image";
  landingPageUrl?: string;
  landingPageMacro?: string;
  imageUrl?: string;
  imageMacro?: string;
  defaultLandingPageUrl?: string;
  macroVariables?: Record<string, string>;
  onVote?: (optionId: string) => void;
}

interface VoteTemplateProps {
  config: VoteTemplateConfig;
  isOpen?: boolean;
  onClose?: () => void;
  onButtonClick?: (option: VoteOption) => void;
  previewMode?: boolean;
}

// 默认配置
const defaultConfig: VoteTemplateConfig = {
  title: "请选择您的偏好",
  subtitle: "感谢您的参与，点击选项查看详情",
  options: [
    { id: "1", text: "选项一", voteCount: 120, buttonText: "选择" },
    { id: "2", text: "选项二", voteCount: 80, buttonText: "选择" },
  ],
  clickResultText: "投票成功",
  action: "jump",
  defaultLandingPageUrl: "",
};

// 宏替换函数
function resolveMacro(text: string, macroVariables?: Record<string, string>): string {
  if (!macroVariables) return text;
  return text.replace(/\$\{([^}]+)\}/g, (match, key) => {
    return macroVariables[key.trim()] || match;
  });
}

// 获取解析后的文本
function getResolvedText(
  text: string,
  useMacro: boolean | undefined,
  macroVariables?: Record<string, string>
): string {
  if (useMacro && macroVariables) {
    return resolveMacro(text, macroVariables);
  }
  return text;
}

// 投票选项组件
function VoteOptionBar({
  option,
  percentage,
  onSelect,
  selected,
  showResult,
}: {
  option: VoteOption;
  percentage: number;
  onSelect: () => void;
  selected: boolean;
  showResult: boolean;
}) {
  const progressWidth = Math.max(5, Math.min(100, percentage));
  
  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative w-full h-14 rounded-xl border-2 overflow-hidden transition-all duration-300",
        selected 
          ? "border-blue-500 bg-blue-50" 
          : "border-blue-500 bg-white hover:bg-blue-50"
      )}
    >
      {/* 进度条背景 */}
      <div 
        className={cn(
          "absolute inset-y-0 left-0 transition-all duration-500 ease-out",
          selected ? "bg-blue-500" : "bg-blue-200"
        )}
        style={{ width: `${progressWidth}%` }}
      />
      
      {/* 内容 */}
      <div className="relative flex items-center justify-between h-full px-4">
        {/* 左侧：按钮文字 */}
        <span className={cn(
          "font-medium text-sm",
          selected ? "text-white" : "text-blue-600"
        )}>
          {option.buttonText}
        </span>
        
        {/* 右侧：百分比 */}
        {showResult ? (
          <span className={cn(
            "font-semibold text-sm",
            selected ? "text-white" : "text-gray-600"
          )}>
            {percentage}%
          </span>
        ) : (
          <span className={cn(
            "text-sm",
            selected ? "text-white" : "text-gray-400"
          )}>
            点击选择
          </span>
        )}
      </div>
    </button>
  );
}

// 投票组件主组件
export function VoteTemplate({
  config,
  isOpen = true,
  onClose,
  onButtonClick,
  previewMode = false,
}: VoteTemplateProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResultText, setShowResultText] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");

  // 解析宏变量 - 使用 useMemo 避免每次渲染重新计算
  const resolvedTitle = getResolvedText(
    config?.title || defaultConfig.title,
    false,
    config?.macroVariables
  );
  
  const resolvedSubtitle = config?.subtitle 
    ? getResolvedText(config.subtitle, false, config.macroVariables)
    : defaultConfig.subtitle;

  const options = config?.options?.length ? config.options : defaultConfig.options;
  const clickResultText = config?.clickResultText || defaultConfig.clickResultText;
  const landingPageUrl = config?.landingPageUrl || config?.defaultLandingPageUrl || defaultConfig.defaultLandingPageUrl;
  const landingPageMacro = config?.landingPageMacro;
  const macroVariables = config?.macroVariables;
  const action = config?.action || "jump";
  const imageUrl = config?.imageUrl;
  const imageMacro = config?.imageMacro;

  // 获取选项的固定百分比（选项1为75%，选项2为25%）
  const getFixedPercentage = (index: number): number => {
    return index === 0 ? 75 : 25;
  };

  // 处理选项选择并投票
  const handleSelect = (option: VoteOption) => {
    // 记录已选择的选项
    setSelectedOption(option.id);
    
    // 显示投票成功提示
    setShowResultText(true);
    
    // 预览模式下不执行实际动作
    if (previewMode) return;
    
    // 延迟执行动作，让用户看到投票成功
    setTimeout(() => {
      // 解析落地页URL
      let url = landingPageUrl;
      if (landingPageMacro && macroVariables) {
        url = resolveMacro(landingPageMacro, macroVariables);
      }

      // 解析图片URL
      let imgUrl = imageUrl || "";
      if (imageMacro) {
        // 优先使用 imageMacro（直接替换宏变量）
        imgUrl = resolveMacro(imageMacro, macroVariables);
      }

      if (action === "show_image") {
        // 显示图片模式
        setCurrentImageUrl(imgUrl);
        setShowImageModal(true);
      } else {
        // 跳转落地页模式
        if (url) {
          window.open(url, "_blank");
        }
      }
      onButtonClick?.(option);
    }, 500);
  };

  // 关闭图片预览
  const closeImageModal = () => {
    setShowImageModal(false);
    setCurrentImageUrl("");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0",
          previewMode ? "relative" : ""
        )}
        onClick={!previewMode ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 -translate-y-1/2",
          "transition-all duration-300",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0",
          previewMode ? "relative static -translate-x-0 -translate-y-0 scale-100 opacity-100" : ""
        )}
      >
        <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
            aria-label="关闭"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>

          {/* Content */}
          <div className="px-5 pt-6 pb-4">
            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 pr-8 leading-tight">
              {resolvedTitle}
            </h2>

            {/* Subtitle */}
            {resolvedSubtitle && (
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                {resolvedSubtitle}
              </p>
            )}
          </div>

          {/* Vote Options */}
          <div className="px-5 pb-4 space-y-3">
            {options.map((option, index) => (
              <VoteOptionBar
                key={option.id}
                option={option}
                percentage={getFixedPercentage(index)}
                onSelect={() => handleSelect(option)}
                selected={selectedOption === option.id}
                showResult={previewMode || showResultText}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="px-5 pb-6">
            {/* Vote Result Text - 选择后显示 */}
            {showResultText && clickResultText && (
              <div className="text-center py-2">
                <span className="text-sm font-medium text-green-600">
                  {clickResultText}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showImageModal && currentImageUrl && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-[60] bg-black/70"
            onClick={closeImageModal}
          />
          {/* Modal */}
          <div className="fixed left-1/2 top-1/2 z-[60] -translate-x-1/2 -translate-y-1/2 max-w-lg w-[90%]">
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
              <button
                onClick={closeImageModal}
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
              <div className="relative cursor-pointer group">
                <Image
                  src={currentImageUrl}
                  alt="Preview"
                  width={300}
                  height={150}
                  className="w-full h-auto"
                  onClick={() => {
                    // 点击图片跳转到落地页
                    let url = landingPageUrl;
                    if (landingPageMacro && macroVariables) {
                      url = resolveMacro(landingPageMacro, macroVariables);
                    }
                    if (url) {
                      window.open(url, "_blank");
                    }
                  }}
                />
                {/* 点击提示 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-3 py-1.5 rounded-full text-xs font-medium text-gray-700">
                    点击图片跳转落地页
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
