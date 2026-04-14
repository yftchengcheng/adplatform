"use client";

import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Link2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CouponTemplateConfig,
  CouponTemplate,
} from "@/components/coupon-template";
import { cn, getStringWidth } from "@/lib/utils";

// Tab switch component
function ModeToggle({
  value,
  onChange,
}: {
  value: "input" | "macro";
  onChange: (v: "input" | "macro") => void;
}) {
  return (
    <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
      <button
        onClick={() => onChange("input")}
        className={cn(
          "px-3 py-1 text-xs font-medium rounded-md transition-all",
          value === "input"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        手动输入
      </button>
      <button
        onClick={() => onChange("macro")}
        className={cn(
          "px-3 py-1 text-xs font-medium rounded-md transition-all",
          value === "macro"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        宏替换
      </button>
    </div>
  );
}

// Character counter
function CharCounter({
  value,
  max,
}: {
  value: string;
  max: number;
}) {
  const width = getStringWidth(value);
  const isOverLimit = width > max;
  return (
    <span
      className={cn(
        "text-xs",
        isOverLimit ? "text-red-500" : "text-gray-400"
      )}
    >
      {width}/{max}字符
      {isOverLimit && <span className="text-red-500 ml-1">（超出限制）</span>}
    </span>
  );
}

// Section header with collapse
function SectionHeader({
  title,
  isOpen,
  onToggle,
  required,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  required?: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full text-left py-2 group"
    >
      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
        {title}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      {isOpen ? (
        <ChevronDown className="w-4 h-4 text-gray-400" />
      ) : (
        <ChevronRight className="w-4 h-4 text-gray-400" />
      )}
    </button>
  );
}

// 按钮文案选项
const BUTTON_TEXT_OPTIONS = [
  { value: "立即领取", label: "立即领取" },
  { value: "立即使用", label: "立即使用" },
  { value: "马上抢", label: "马上抢" },
  { value: "去领取", label: "去领取" },
  { value: "点击领取", label: "点击领取" },
];

interface CouponTemplateConfigPanelProps {
  initialConfig?: Partial<CouponTemplateConfig>;
  onSave?: (config: CouponTemplateConfig) => void;
  onPreview?: (config: CouponTemplateConfig) => void;
  macroVariables?: Record<string, string>;
}

export function CouponTemplateConfigPanel({
  initialConfig,
  onSave,
  onPreview,
  macroVariables = {},
}: CouponTemplateConfigPanelProps) {
  // 表单配置
  const [config, setConfig] = useState<CouponTemplateConfig>(() => ({
    ...{
      title: "满减大酬宾",
      discountInfo: "30元",
      discountCondition: "满100立减！",
      buttonText: "立即领取",
      validFrom: "",
      validTo: "",
      landingPageUrl: "",
    },
    ...initialConfig,
    macroVariables,
  }));

  // 折叠状态
  const [basicOpen, setBasicOpen] = useState(true);
  const [dateOpen, setDateOpen] = useState(true);
  const [landingOpen, setLandingOpen] = useState(true);

  // 落地页模式
  const [landingPageMode, setLandingPageMode] = useState<"input" | "macro">(
    config.landingPageMacro ? "macro" : "input"
  );

  // 按钮文案模式
  const [buttonTextMode, setButtonTextMode] = useState<"input" | "macro">(
    config.buttonTextMacro ? "macro" : "input"
  );

  // 更新配置
  const updateConfig = (updates: Partial<CouponTemplateConfig>) => {
    const newConfig = { ...config, ...updates, macroVariables };
    setConfig(newConfig);
  };

  // 处理落地页输入
  const handleLandingPageInput = (value: string) => {
    if (landingPageMode === "macro") {
      updateConfig({ landingPageMacro: value, landingPageUrl: "" });
    } else {
      updateConfig({ landingPageUrl: value, landingPageMacro: "" });
    }
  };

  // 处理按钮文案输入
  const handleButtonTextInput = (value: string) => {
    if (buttonTextMode === "macro") {
      updateConfig({ buttonTextMacro: value, buttonText: value });
    } else {
      updateConfig({ buttonText: value, buttonTextMacro: "" });
    }
  };

  // 预览
  const handlePreview = () => {
    onPreview?.(config);
  };

  // 保存
  const handleSave = () => {
    onSave?.(config);
  };

  // 获取落地页输入值
  const getLandingPageValue = (): string => {
    return landingPageMode === "macro"
      ? (config.landingPageMacro || "")
      : (config.landingPageUrl || "");
  };

  // 获取按钮文案输入值
  const getButtonTextValue = (): string => {
    return buttonTextMode === "macro"
      ? (config.buttonTextMacro || config.buttonText || "")
      : (config.buttonText || "");
  };

  return (
    <div className="space-y-4">
      {/* Basic Config Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <SectionHeader
            title="基础配置"
            isOpen={basicOpen}
            onToggle={() => setBasicOpen(!basicOpen)}
            required
          />
        </div>
        {basicOpen && (
          <div className="p-4 space-y-4">
            {/* 活动名称 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  活动名称
                </label>
                <CharCounter value={config.title || ""} max={14} />
              </div>
              <Input
                placeholder="请输入活动名称"
                value={config.title || ""}
                onChange={(e) => updateConfig({ title: e.target.value })}
              />
            </div>

            {/* 优惠信息 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  优惠信息
                </label>
                <CharCounter value={config.discountInfo || ""} max={6} />
              </div>
              <Input
                placeholder="如：30元、8折"
                value={config.discountInfo || ""}
                onChange={(e) => updateConfig({ discountInfo: e.target.value })}
              />
              <p className="text-xs text-gray-400">建议不超过6个字符，建议格式：30元、8折</p>
            </div>

            {/* 优惠条件 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  优惠条件
                </label>
                <CharCounter value={config.discountCondition || ""} max={16} />
              </div>
              <Input
                placeholder="如：满100立减！"
                value={config.discountCondition || ""}
                onChange={(e) => updateConfig({ discountCondition: e.target.value })}
              />
            </div>

            {/* 按钮文案 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  按钮文案
                </label>
                <ModeToggle
                  value={buttonTextMode}
                  onChange={setButtonTextMode}
                />
              </div>
              {buttonTextMode === "macro" ? (
                <Input
                  placeholder="如 ${button_text}"
                  value={getButtonTextValue()}
                  onChange={(e) => handleButtonTextInput(e.target.value)}
                />
              ) : (
                <Select
                  value={config.buttonText}
                  onValueChange={(value) => updateConfig({ buttonText: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择按钮文案" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUTTON_TEXT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Date Config Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <SectionHeader
            title="有效期设置"
            isOpen={dateOpen}
            onToggle={() => setDateOpen(!dateOpen)}
          />
        </div>
        {dateOpen && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* 开始日期 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  开始日期
                </label>
                <Input
                  type="date"
                  value={config.validFrom || ""}
                  onChange={(e) => updateConfig({ validFrom: e.target.value })}
                />
              </div>

              {/* 结束日期 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  结束日期
                </label>
                <Input
                  type="date"
                  value={config.validTo || ""}
                  onChange={(e) => updateConfig({ validTo: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Landing Page Config Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <SectionHeader
            title="落地页配置"
            isOpen={landingOpen}
            onToggle={() => setLandingOpen(!landingOpen)}
          />
        </div>
        {landingOpen && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                点击后动作
              </label>
              <ModeToggle
                value={landingPageMode}
                onChange={setLandingPageMode}
              />
            </div>

            {landingPageMode === "macro" ? (
              <div className="space-y-2">
                <Input
                  placeholder="如 ${landing_page_url}"
                  value={getLandingPageValue()}
                  onChange={(e) => handleLandingPageInput(e.target.value)}
                />
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Link2 className="w-3 h-3" />
                  宏变量将自动替换为实际值
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="请输入落地页链接"
                  value={getLandingPageValue()}
                  onChange={(e) => handleLandingPageInput(e.target.value)}
                />
                <p className="text-xs text-gray-400">
                  不配置默认使用广告（素材）链接
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview & Save Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={handlePreview}
          className="h-10 px-4 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          预览
        </button>
        <button
          onClick={handleSave}
          className="h-10 px-4 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          保存
        </button>
      </div>

      {/* Preview Modal */}
      <CouponTemplatePreview config={config} />
    </div>
  );
}

// 预览弹窗状态管理
let previewRef: {
  setConfig: (config: CouponTemplateConfig) => void;
  open: () => void;
} | null = null;

function CouponTemplatePreview({ config }: { config: CouponTemplateConfig }) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewConfig, setPreviewConfig] = useState(config);

  // 注册到全局
  React.useEffect(() => {
    previewRef = {
      setConfig: (cfg) => setPreviewConfig(cfg),
      open: () => setIsOpen(true),
    };
    return () => {
      previewRef = null;
    };
  }, []);

  // 监听 config 变化
  React.useEffect(() => {
    setPreviewConfig(config);
  }, [config]);

  return (
    <CouponTemplate
      config={previewConfig}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    />
  );
}

// 打开预览的全局方法
export function openCouponPreview(config: CouponTemplateConfig) {
  previewRef?.setConfig(config);
  previewRef?.open();
}
