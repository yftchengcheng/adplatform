"use client";

import React, { useState, useCallback, useRef } from "react";
import { X, Upload, ImageIcon, Link2, Plus, Trash2, ChevronDown, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, getStringWidth } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// 配置数据类型
export interface PopupRedpacketConfig {
  // 红包元素
  redpacketImageUrl?: string;
  redpacketImageMacro?: string;
  // 引导文案
  guideText: string;
  guideTextMacro?: string;
  // 奖励类型
  rewardType: "cash" | "custom";
  // 现金奖励
  cashAmount?: string;
  cashAmountMacro?: string;
  // 自定义奖励图片
  rewardImageUrl?: string;
  rewardImageMacro?: string;
  // 奖品文案
  rewardText: string;
  rewardTextMacro?: string;
  // 特殊说明
  specialNote: string;
  specialNoteMacro?: string;
  // 落地页
  landingPageUrl?: string;
  landingPageMacro?: string;
  // 默认落地页
  defaultLandingPageUrl?: string;
  // 宏变量
  macroVariables?: Record<string, string>;
  // 组件名称
  componentName?: string;
}

// Tab切换组件
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

// 字符计数器
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

// Section可折叠区块
function SectionCollapse({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700">{title}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-400 transition-transform",
            !isOpen && "-rotate-90"
          )}
        />
      </button>
      {isOpen && <div className="px-4 pb-4 space-y-4">{children}</div>}
    </div>
  );
}

// 图片上传组件
function ImageUpload({
  value,
  onChange,
  onMacroChange,
  onClear,
  mode,
  onModeChange,
  aspectRatio,
  maxSize = 1,
  title,
  placeholder,
}: {
  value: string;
  onChange: (url: string) => void;
  onMacroChange: (macro: string) => void;
  onClear: () => void;
  mode: "upload" | "macro";
  onModeChange: (mode: "upload" | "macro") => void;
  aspectRatio?: string;
  maxSize?: number;
  title: string;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 校验文件类型
    if (!file.type.startsWith("image/")) {
      setError("请上传图片文件（支持 JPG、PNG、GIF、WebP 等格式）");
      return;
    }

    // 校验文件大小
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`图片大小不能超过 ${maxSize}MB，当前文件 ${fileSizeMB.toFixed(2)}MB`);
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // 转换为base64
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        onChange(base64);
        setIsUploading(false);
      };
      reader.onerror = () => {
        setError("图片读取失败");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("图片上传失败");
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">{title}</span>
        <ModeToggle value={mode} onChange={onModeChange} />
      </div>

      {mode === "upload" ? (
        <div>
          {value ? (
            <div className="relative group">
              <img
                src={value}
                alt={title}
                className={cn(
                  "w-full object-contain rounded-lg border border-gray-200",
                  aspectRatio === "9/16" ? "aspect-[9/16]" : "aspect-video"
                )}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => inputRef.current?.click()}
                  className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium hover:bg-gray-100"
                >
                  重新上传
                </button>
                <button
                  onClick={onClear}
                  className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-red-500 hover:bg-red-50"
                >
                  删除
                </button>
              </div>
            </div>
          ) : (
            <label
              className={cn(
                "flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors",
                isUploading && "opacity-50 cursor-not-allowed"
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
              <Upload className="w-6 h-6 text-gray-400 mt-4" />
              <span className="text-sm text-gray-500 mt-2">点击上传图片</span>
              <span className="text-xs text-gray-400 mb-4">
                {aspectRatio ? `推荐比例 ${aspectRatio}，` : ""}最大 {maxSize}MB
              </span>
            </label>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <Input
            placeholder="输入图片宏变量，如 ${image_url}"
            value={value}
            onChange={(e) => onMacroChange(e.target.value)}
            className="text-sm"
          />
          <p className="text-xs text-gray-400">支持 ${变量名} 格式的宏变量</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1 text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}
    </div>
  );
}

// 配置组件Props
interface PopupRedpacketConfigPanelProps {
  config: PopupRedpacketConfig;
  onChange: (config: PopupRedpacketConfig) => void;
  onSave: () => void;
  onCancel: () => void;
  previewComponent?: { type: string; config: PopupRedpacketConfig } | null;
  onPreviewChange?: (config: PopupRedpacketConfig) => void;
}

export function PopupRedpacketConfigPanel({
  config,
  onChange,
  onSave,
  onCancel,
  previewComponent,
  onPreviewChange,
}: PopupRedpacketConfigPanelProps) {
  const [activeSection, setActiveSection] = useState<string[]>(["红包样式", "领奖配置"]);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  // 红包图片上传模式
  const [redpacketMode, setRedpacketMode] = useState<"upload" | "macro">(
    config.redpacketImageMacro ? "macro" : "upload"
  );
  // 奖励图片上传模式
  const [rewardMode, setRewardMode] = useState<"upload" | "macro">(
    config.rewardImageMacro ? "macro" : "upload"
  );

  // 落地页输入模式
  const [landingPageMode, setLandingPageMode] = useState<"input" | "macro">(
    config.landingPageMacro ? "macro" : "input"
  );

  // 更新配置
  const updateConfig = useCallback(
    (updates: Partial<PopupRedpacketConfig>) => {
      const newConfig = { ...config, ...updates };
      onChange(newConfig);
      if (previewComponent?.type === "popup_redpacket" && onPreviewChange) {
        onPreviewChange(newConfig);
      }
    },
    [config, onChange, previewComponent, onPreviewChange]
  );

  // 切换Section
  const toggleSection = (title: string) => {
    setActiveSection((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  // 取消并重置
  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelDialog(false);
    onCancel();
  };

  // 预览
  const handlePreview = () => {
    setPreviewKey((k) => k + 1);
    setShowPreview(true);
  };

  // 关闭预览
  const handleClosePreview = () => {
    setShowPreview(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold text-gray-900">弹窗红包</span>
        </div>
        <Button size="sm" onClick={handlePreview}>
          预览
        </Button>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* 红包样式配置 */}
        <SectionCollapse
          title="红包样式"
          isOpen={activeSection.includes("红包样式")}
          onToggle={() => toggleSection("红包样式")}
        >
          <ImageUpload
            value={config.redpacketImageUrl || ""}
            onChange={(url) => updateConfig({ redpacketImageUrl: url })}
            onMacroChange={(macro) => updateConfig({ redpacketImageMacro: macro })}
            onClear={() => updateConfig({ redpacketImageUrl: "" })}
            mode={redpacketMode}
            onModeChange={setRedpacketMode}
            aspectRatio="9:16"
            maxSize={1}
            title="红包图片"
            placeholder="推荐 9:16 比例，最大 1MB"
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">引导文案</label>
              <CharCounter value={config.guideText} max={20} />
            </div>
            <Input
              placeholder="如：点击开红包"
              value={config.guideText}
              onChange={(e) => updateConfig({ guideText: e.target.value })}
              maxLength={50}
              className="text-sm"
            />
          </div>
        </SectionCollapse>

        {/* 领奖配置 */}
        <SectionCollapse
          title="领奖配置"
          isOpen={activeSection.includes("领奖配置")}
          onToggle={() => toggleSection("领奖配置")}
        >
          {/* 奖励类型 */}
          <div className="space-y-2">
            <label className="text-sm text-gray-700">奖励类型</label>
            <div className="flex gap-2">
              <button
                onClick={() => updateConfig({ rewardType: "cash" })}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors",
                  config.rewardType === "cash"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                )}
              >
                现金
              </button>
              <button
                onClick={() => updateConfig({ rewardType: "custom" })}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors",
                  config.rewardType === "custom"
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                )}
              >
                自定义
              </button>
            </div>
          </div>

          {/* 现金金额 */}
          {config.rewardType === "cash" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700">现金金额</label>
                <CharCounter value={config.cashAmount || ""} max={20} />
              </div>
              <Input
                placeholder="如：88.88"
                value={config.cashAmount || ""}
                onChange={(e) => updateConfig({ cashAmount: e.target.value })}
                className="text-sm"
              />
            </div>
          )}

          {/* 自定义奖励图片 */}
          {config.rewardType === "custom" && (
            <ImageUpload
              value={config.rewardImageUrl || ""}
              onChange={(url) => updateConfig({ rewardImageUrl: url })}
              onMacroChange={(macro) => updateConfig({ rewardImageMacro: macro })}
              onClear={() => updateConfig({ rewardImageUrl: "" })}
              mode={rewardMode}
              onModeChange={setRewardMode}
              aspectRatio="16:9"
              maxSize={0.3}
              title="奖励图片"
              placeholder="推荐 16:9 比例，最大 300KB"
            />
          )}

          {/* 奖品文案 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">奖品文案</label>
              <CharCounter value={config.rewardText} max={30} />
            </div>
            <Input
              placeholder="如：恭喜获得100元优惠券"
              value={config.rewardText}
              onChange={(e) => updateConfig({ rewardText: e.target.value })}
              maxLength={50}
              className="text-sm"
            />
          </div>

          {/* 特殊说明 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">特殊说明</label>
              <CharCounter value={config.specialNote} max={20} />
            </div>
            <Input
              placeholder="如：实际奖品以APP为准"
              value={config.specialNote}
              onChange={(e) => updateConfig({ specialNote: e.target.value })}
              maxLength={30}
              className="text-sm"
            />
          </div>
        </SectionCollapse>

        {/* 落地页配置 */}
        <SectionCollapse
          title="落地页配置"
          isOpen={activeSection.includes("落地页配置")}
          onToggle={() => toggleSection("落地页配置")}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">落地页链接</label>
              <ModeToggle
                value={landingPageMode}
                onChange={setLandingPageMode}
              />
            </div>
            {landingPageMode === "input" ? (
              <Input
                placeholder="输入落地页链接"
                value={config.landingPageUrl || ""}
                onChange={(e) => updateConfig({ landingPageUrl: e.target.value })}
                className="text-sm"
              />
            ) : (
              <Input
                placeholder="输入落地页宏变量，如 ${landing_url}"
                value={config.landingPageMacro || ""}
                onChange={(e) => updateConfig({ landingPageMacro: e.target.value })}
                className="text-sm"
              />
            )}
            <p className="text-xs text-gray-400">
              不配置默认使用广告（素材）链接
            </p>
          </div>
        </SectionCollapse>

        {/* 组件名称 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">组件名称</label>
            <CharCounter value={config.componentName || ""} max={20} />
          </div>
          <Input
            placeholder="输入组件名称"
            value={config.componentName || ""}
            onChange={(e) => updateConfig({ componentName: e.target.value })}
            maxLength={30}
            className="text-sm"
          />
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-end gap-3">
        <Button variant="outline" onClick={handleCancel}>
          取消
        </Button>
        <Button onClick={onSave}>保存</Button>
      </div>

      {/* 取消确认弹窗 */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>确认取消</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            确定要取消吗？取消后将不会保存您的修改。
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              继续编辑
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancel}>
              确认取消
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 预览弹窗 */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleClosePreview}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          {/* 动态导入预览组件 */}
          <PreviewWrapper
            config={config}
            key={previewKey}
            onClose={handleClosePreview}
          />
        </div>
      )}
    </div>
  );
}

// 预览组件包装器
function PreviewWrapper({
  config,
  onClose,
}: {
  config: PopupRedpacketConfig;
  onClose: () => void;
}) {
  const [PopupRedpacketTemplate, setPopupRedpacketTemplate] = useState<any>(null);

  React.useEffect(() => {
    import("./popup-redpacket-template").then((mod) => {
      setPopupRedpacketTemplate(() => mod.PopupRedpacketTemplate);
    });
  }, []);

  if (!PopupRedpacketTemplate) {
    return (
      <div className="text-white flex items-center justify-center">
        加载中...
      </div>
    );
  }

  return (
    <PopupRedpacketTemplate
      config={config}
      isOpen={true}
      onClose={onClose}
      previewMode={true}
    />
  );
}

export { PopupRedpacketConfigPanel as default };
export type { PopupRedpacketConfig };
