"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// 配置接口
export interface VoteOption {
  id: string;
  text: string;
  percentage: number;
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
    { id: "1", text: "选项一", percentage: 75, buttonText: "选择" },
    { id: "2", text: "选项二", percentage: 25, buttonText: "选择" },
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
  onSelect,
  selected,
  showResult,
}: {
  option: VoteOption;
  onSelect: () => void;
  selected: boolean;
  showResult: boolean;
}) {
  const progressWidth = Math.max(10, Math.min(100, option.percentage));
  
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
        
        {/* 中间：选项文本 */}
        <span className={cn(
          "font-medium text-sm flex-1 text-center",
          selected ? "text-white" : "text-gray-800"
        )}>
          {option.text}
        </span>
        
        {/* 右侧：百分比 */}
        {showResult && (
          <span className={cn(
            "text-sm font-semibold",
            selected ? "text-white" : "text-gray-600"
          )}>
            {option.percentage}%
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

  // 处理选项选择
  const handleSelect = (option: VoteOption) => {
    if (previewMode) return;
    setSelectedOption(option.id);
    setTimeout(() => {
      setShowResultText(true);
    }, 300);
  };

  // 处理按钮点击
  const handleButtonClick = (option: VoteOption) => {
    let url = landingPageUrl;
    if (landingPageMacro && macroVariables) {
      url = resolveMacro(landingPageMacro, macroVariables);
    }
    if (url && !previewMode) {
      window.open(url, "_blank");
    }
    onButtonClick?.(option);
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
            {options.map((option) => (
              <VoteOptionBar
                key={option.id}
                option={option}
                onSelect={() => handleSelect(option)}
                selected={selectedOption === option.id}
                showResult={previewMode}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="px-5 pb-6 space-y-3">
            {/* Vote Result Text */}
            {showResultText && clickResultText && (
              <div 
                className={cn(
                  "text-center text-sm font-medium text-green-600 mb-3",
                  "transition-opacity duration-300",
                  showResultText ? "opacity-100" : "opacity-0"
                )}
              >
                {clickResultText}
              </div>
            )}
            
            {/* Primary Button */}
            {selectedOption && !previewMode && (
              <button
                onClick={() => {
                  const option = options.find(o => o.id === selectedOption);
                  if (option) handleButtonClick(option);
                }}
                className={cn(
                  "w-full h-12 rounded-xl text-white font-medium text-base",
                  "bg-gradient-to-r from-blue-500 to-blue-600",
                  "hover:from-blue-600 hover:to-blue-700",
                  "active:scale-[0.98] transition-all duration-150",
                  "shadow-lg shadow-blue-500/25"
                )}
              >
                查看详情
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
