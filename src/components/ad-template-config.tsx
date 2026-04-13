"use client";

import React, { useState, useCallback } from "react";
import {
  Settings2,
  ChevronRight,
  ChevronDown,
  Upload,
  Image as ImageIcon,
  Link2,
  FileText,
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
  AdTemplateConfig,
  AdButtonConfig,
  AdTemplate,
} from "@/components/ad-template";
import { cn } from "@/lib/utils";

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
        输入模式
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
        宏模式
      </button>
    </div>
  );
}

// Character counter
function CharCounter({
  current,
  max,
}: {
  current: number;
  max: number;
}) {
  const isOverLimit = current > max;
  return (
    <span
      className={cn(
        "text-xs",
        isOverLimit ? "text-red-500" : "text-gray-400"
      )}
    >
      {current}/{max}
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

// Image upload area
function ImageUpload({
  value,
  onChange,
  label,
  width = 472,
  height = 164,
  maxSize = 1, // MB
  accept = "image/jpeg,image/png,image/gif,image/webp",
}: {
  value?: string;
  onChange: (url: string) => void;
  onError?: (message: string) => void;
  label?: string;
  width?: number;
  height?: number;
  maxSize?: number;
  accept?: string;
}) {
  const [error, setError] = React.useState<string>("");
  const [previewUrl, setPreviewUrl] = React.useState<string>("");
  const [imageDimensions, setImageDimensions] = React.useState<{width: number, height: number} | null>(null);

  // 验证图片
  const validateImage = (file: File): Promise<{valid: boolean, error?: string, dimensions?: {width: number, height: number}}> => {
    return new Promise((resolve) => {
      // 验证文件类型
      const allowedTypes = accept.split(",").map(t => t.trim());
      const fileType = file.type;
      const isValidType = allowedTypes.some(type => {
        if (type === "image/*") return fileType.startsWith("image/");
        return fileType === type;
      });
      
      if (!isValidType) {
        resolve({ valid: false, error: `不支持的图片格式，请上传 ${accept} 格式` });
        return;
      }

      // 验证文件大小
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSize) {
        resolve({ valid: false, error: `图片大小不能超过 ${maxSize}MB，当前 ${fileSizeMB.toFixed(2)}MB` });
        return;
      }

      // 验证图片尺寸
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          if (img.width !== width || img.height !== height) {
            resolve({ 
              valid: false, 
              error: `图片尺寸应为 ${width}×${height}px，当前 ${img.width}×${img.height}px`,
              dimensions: { width: img.width, height: img.height }
            });
          } else {
            resolve({ valid: true, dimensions: { width: img.width, height: img.height } });
          }
        };
        img.onerror = () => {
          resolve({ valid: false, error: "图片加载失败，请重新上传" });
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        resolve({ valid: false, error: "文件读取失败" });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    
    const result = await validateImage(file);
    if (!result.valid) {
      setError(result.error || "图片验证失败");
      return;
    }

    // 读取并预览图片
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewUrl(dataUrl);
      setImageDimensions(result.dimensions || null);
      onChange(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreviewUrl("");
    setImageDimensions(null);
    setError("");
    onChange("");
  };

  // 显示的图片（优先显示已上传的预览，否则显示新选择的）
  const displayUrl = previewUrl || value;

  if (displayUrl) {
    return (
      <div className="space-y-2">
        <div className="relative rounded-lg border border-gray-200 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayUrl}
            alt={label}
            className="w-full h-32 object-cover"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white text-xs"
          >
            删除
          </button>
          {imageDimensions && (
            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              {imageDimensions.width}×{imageDimensions.height}px
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors">
        <Upload className="w-8 h-8 text-gray-400 mb-2" />
        <span className="text-sm text-gray-500">{label || "点击上传图片"}</span>
        <span className="text-xs text-gray-400 mt-1">
          尺寸: {width}×{height}px, 大小&lt;{maxSize}MB
        </span>
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

// Button configuration section
function ButtonConfigSection({
  title,
  config,
  onChange,
  defaultLandingPageUrl,
  index,
}: {
  title: string;
  config: AdButtonConfig;
  onChange: (config: AdButtonConfig) => void;
  defaultLandingPageUrl?: string;
  index: 1 | 2;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [textMode, setTextMode] = useState<"input" | "macro">("input");
  const [landingPageMode, setLandingPageMode] = useState<"input" | "macro">(
    config.landingPageMacro ? "macro" : "input"
  );

  const handleTextChange = (text: string) => {
    onChange({ ...config, text });
  };

  const handleActionChange = (action: "jump" | "show_image") => {
    onChange({ ...config, action });
  };

  const handleImageChange = (imageUrl: string) => {
    onChange({ ...config, imageUrl });
  };

  const handleImageMacroChange = (imageMacro: string) => {
    onChange({ ...config, imageMacro });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <SectionHeader
        title={title}
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
        required
      />

      {isOpen && (
        <div className="space-y-4 pt-2">
          {/* Button Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-500">
                按钮{index}文案 <span className="text-red-500">*</span>
              </label>
              <CharCounter current={config.text.length} max={24} />
            </div>
            <div className="flex gap-2">
              <Input
                value={config.text}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="请输入按钮文案"
                maxLength={24}
                className="flex-1"
              />
              <ModeToggle value={textMode} onChange={setTextMode} />
            </div>
            {textMode === "macro" && (
              <Input
                placeholder="宏替换变量，如 ${button_text}"
                className="text-sm"
              />
            )}
          </div>

          {/* Action Type */}
          <div className="space-y-2">
            <label className="text-xs text-gray-500">
              点击按钮{index}后显示
            </label>
            <Select
              value={config.action}
              onValueChange={(v) => handleActionChange(v as "jump" | "show_image")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jump">
                  <div className="flex items-center gap-2">
                    <Link2 className="w-4 h-4" />
                    <span>跳转落地页</span>
                  </div>
                </SelectItem>
                <SelectItem value="show_image">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    <span>显示图片</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Config */}
          {config.action === "jump" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500">落地页链接</label>
                <ModeToggle
                  value={landingPageMode}
                  onChange={setLandingPageMode}
                />
              </div>
              {landingPageMode === "input" ? (
                <Input
                  value={config.landingPageUrl || ""}
                  onChange={(e) => onChange({ ...config, landingPageUrl: e.target.value, landingPageMacro: undefined })}
                  placeholder={
                    defaultLandingPageUrl
                      ? `不配置默认使用: ${defaultLandingPageUrl}`
                      : "请输入落地页链接"
                  }
                />
              ) : (
                <Input
                  value={config.landingPageMacro || ""}
                  onChange={(e) => onChange({ ...config, landingPageMacro: e.target.value, landingPageUrl: undefined })}
                  placeholder="请输入落地页宏变量，如 ${landing_page_url}"
                />
              )}
              {!config.landingPageUrl && !config.landingPageMacro && defaultLandingPageUrl && (
                <p className="text-xs text-gray-400">
                  当前将使用广告素材链接: {defaultLandingPageUrl}
                </p>
              )}
            </div>
          )}

          {config.action === "show_image" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-500">结果文案</label>
                <Input
                  value={config.resultText || ""}
                  onChange={(e) =>
                    onChange({ ...config, resultText: e.target.value })
                  }
                  placeholder="请输入结果文案"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-500">
                  图片模式
                </label>
                <Select
                  value={config.imageMacro ? "macro" : "custom"}
                  onValueChange={(v) => {
                    if (v === "custom") {
                      onChange({ ...config, imageMacro: undefined, imageUrl: "" });
                    } else if (v === "macro") {
                      onChange({ 
                        ...config, 
                        imageMacro: "${image_url}",
                        imageUrl: "" 
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">自定义上传</SelectItem>
                    <SelectItem value="macro">图片宏</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {config.imageMacro ? (
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">图片宏变量</label>
                    <Input
                      value={config.imageMacro}
                      onChange={(e) => handleImageMacroChange(e.target.value)}
                      placeholder="请输入图片宏变量，如 ${image_url}"
                    />
                  </div>
                ) : (
                  <ImageUpload
                    value={config.imageUrl || ""}
                    onChange={handleImageChange}
                    label="上传图片 (472x164, <1MB)"
                  />
                )}
              </div>

              {(config.imageUrl || config.imageMacro) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-500">落地页链接</label>
                    <ModeToggle
                      value={landingPageMode}
                      onChange={setLandingPageMode}
                    />
                  </div>
                  {landingPageMode === "input" ? (
                    <Input
                      value={config.landingPageUrl || ""}
                      onChange={(e) => onChange({ ...config, landingPageUrl: e.target.value, landingPageMacro: undefined })}
                      placeholder="点击图片后跳转的链接"
                    />
                  ) : (
                    <Input
                      value={config.landingPageMacro || ""}
                      onChange={(e) => onChange({ ...config, landingPageMacro: e.target.value, landingPageUrl: undefined })}
                      placeholder="请输入落地页宏变量，如 ${landing_page_url}"
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Main configuration panel
export function AdTemplateConfigPanel({
  config,
  onChange,
  onSave,
}: {
  config: AdTemplateConfig;
  onChange: (config: AdTemplateConfig) => void;
  onSave?: () => void;
}) {
  const [isBasicOpen, setIsBasicOpen] = useState(true);
  const [titleMode, setTitleMode] = useState<"input" | "macro">("input");
  const [subtitleMode, setSubtitleMode] = useState<"input" | "macro">("input");

  const handleTitleChange = (title: string) => {
    onChange({ ...config, title });
  };

  const handleSubtitleChange = (subtitle: string) => {
    onChange({ ...config, subtitle });
  };

  const handleActionChange = (action: "open" | "show_image" | "custom") => {
    onChange({ ...config, action });
  };

  const handleButton1Change = (button1: AdButtonConfig) => {
    onChange({ ...config, button1 });
  };

  const handleButton2Change = (button2: AdButtonConfig) => {
    onChange({ ...config, button2 });
  };

  const handleDefaultLandingPageChange = (url: string) => {
    onChange({ ...config, defaultLandingPageUrl: url });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-gray-200">
        <Settings2 className="w-5 h-5 text-gray-500" />
        <h2 className="text-base font-semibold text-gray-900">
          新建选择磁贴
        </h2>
      </div>

      {/* Step indicator */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
              1
            </span>
            <span className="text-gray-600">选择样式</span>
            <ChevronRight className="w-3 h-3 text-gray-400" />
          </div>
          <div className="flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
              2
            </span>
            <span className="text-blue-600 font-medium">填写内容</span>
          </div>
        </div>
      </div>

      {/* Form content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-2xl mx-auto w-full">
        {/* Basic Config */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setIsBasicOpen(!isBasicOpen)}
            className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">
              基础配置
            </span>
            {isBasicOpen ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {isBasicOpen && (
            <div className="px-4 pb-4 space-y-4">
              {/* Action */}
              <div className="space-y-2">
                <label className="text-xs text-gray-500">
                  动作 <span className="text-red-500">*</span>
                </label>
                <Select
                  value={config.action}
                  onValueChange={(v) =>
                    handleActionChange(v as "open" | "show_image" | "custom")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>打开</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="show_image">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        <span>显示图片</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-500">
                    主标题 <span className="text-red-500">*</span>
                  </label>
                  <CharCounter current={config.title.length} max={24} />
                </div>
                <div className="flex gap-2">
                  <Input
                    value={config.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="请输入主标题"
                    maxLength={24}
                    className="flex-1"
                  />
                  <ModeToggle value={titleMode} onChange={setTitleMode} />
                </div>
                {titleMode === "macro" && (
                  <Input
                    placeholder="宏替换变量，如 ${title}"
                    className="text-sm"
                  />
                )}
              </div>

              {/* Subtitle */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-500">
                    副标题 <span className="text-red-500">*</span>
                  </label>
                  <CharCounter current={config.subtitle.length} max={60} />
                </div>
                <div className="flex gap-2">
                  <Input
                    value={config.subtitle}
                    onChange={(e) => handleSubtitleChange(e.target.value)}
                    placeholder="请输入副标题"
                    maxLength={60}
                    className="flex-1"
                  />
                  <ModeToggle value={subtitleMode} onChange={setSubtitleMode} />
                </div>
                {subtitleMode === "macro" && (
                  <Input
                    placeholder="宏替换变量，如 ${subtitle}"
                    className="text-sm"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Button 1 Config */}
        <ButtonConfigSection
          title="按钮1配置"
          config={config.button1}
          onChange={handleButton1Change}
          defaultLandingPageUrl={config.defaultLandingPageUrl}
          index={1}
        />

        {/* Button 2 Config */}
        <ButtonConfigSection
          title="按钮2配置"
          config={config.button2}
          onChange={handleButton2Change}
          defaultLandingPageUrl={config.defaultLandingPageUrl}
          index={2}
        />

        {/* Default Landing Page */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
          <label className="text-xs text-gray-500">
            默认落地页链接（全局）
          </label>
          <Input
            value={config.defaultLandingPageUrl || ""}
            onChange={(e) => handleDefaultLandingPageChange(e.target.value)}
            placeholder="当按钮未配置落地页时使用此链接"
          />
          <p className="text-xs text-gray-400">
            不配置默认使用广告素材链接
          </p>
        </div>

        {/* Component Name */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500">
              组件名称 <span className="text-red-500">*</span>
            </label>
          </div>
          <Input
            value={config.title}
            onChange={(e) => onChange({ ...config, title: e.target.value })}
            placeholder="请输入组件名称"
            maxLength={20}
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-4 bg-white border-t border-gray-200">
        <div className="flex gap-3">
          <button className="flex-1 h-10 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
            取消
          </button>
          <button className="flex-1 h-10 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
            上一步
          </button>
          <button 
            onClick={onSave}
            className="flex-1 h-10 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

// Demo page with split view
export function AdTemplateDemo() {
  const [config, setConfig] = useState<AdTemplateConfig>({
    title: "限时特惠活动",
    subtitle: "新用户首单立减50元，更有超值礼包等你来拿",
    button1: {
      text: "立即领取",
      action: "jump",
      landingPageUrl: "https://example.com/claim",
    },
    button2: {
      text: "查看详情",
      action: "show_image",
      imageUrl: "",
    },
    action: "open",
    defaultLandingPageUrl: "https://example.com/default",
  });

  const handleConfigChange = useCallback((newConfig: AdTemplateConfig) => {
    setConfig(newConfig);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 max-w-7xl mx-auto">
        {/* Config Panel */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[600px]">
          <AdTemplateConfigPanel
            config={config}
            onChange={handleConfigChange}
          />
        </div>

        {/* Preview Panel */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-lg overflow-hidden h-[600px] flex flex-col">
          <div className="px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">效果预览</h3>
          </div>
          <div className="flex-1 relative bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2VjZWNlYyIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] flex items-center justify-center">
            {/* Mobile frame */}
            <div className="w-[320px] h-[580px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
              <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                {/* Status bar */}
                <div className="h-8 bg-white flex items-end justify-between px-6 pb-1">
                  <span className="text-[10px] font-medium text-gray-900">9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-2 border border-gray-900 rounded-sm">
                      <div className="w-3/4 h-full bg-gray-900 rounded-sm" />
                    </div>
                  </div>
                </div>

                {/* App content */}
                <div className="h-[calc(100%-32px)] bg-gray-50 overflow-auto">
                  <AdTemplate
                    config={config}
                    isOpen={true}
                    previewMode={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdTemplateDemo;
