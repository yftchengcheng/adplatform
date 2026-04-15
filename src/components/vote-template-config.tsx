"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Settings2,
  ChevronRight,
  ChevronDown,
  Plus,
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
  VoteTemplateConfig,
  VoteOption,
  VoteTemplate,
} from "./vote-template";
import { cn, getStringWidth, isOverWidth } from "@/lib/utils";

// Image Upload Component with validation
function ImageUpload({
  value,
  onChange,
  label,
  width = 300,
  height = 150,
  maxSize = 1,
}: {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  width?: number;
  height?: number;
  maxSize?: number;
}) {
  const [previewUrl, setPreviewUrl] = useState<string>(value || "");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear previous error
    setError("");

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("请上传图片文件（支持 JPG、PNG、GIF、WebP 等格式）");
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`图片大小不能超过 ${maxSize}MB，当前文件 ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    // Validate image dimensions
    const img = document.createElement("img");
    img.onload = async () => {
      URL.revokeObjectURL(img.src);
      if (img.width > width || img.height > height) {
        setError(`图片尺寸不能超过 ${width}×${height}px，当前 ${img.width}×${img.height}px`);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setPreviewUrl(dataUrl);
      };
      reader.readAsDataURL(file);

      // Simulate upload (in production, replace with actual upload API)
      setIsUploading(true);
      try {
        // Simulate upload delay
        await new Promise<void>((resolve) => setTimeout(resolve, 500));
        setIsUploading(false);
        // Use data URL for demo, in production call actual upload API
        onChange(reader.result as string);
      } catch {
        setIsUploading(false);
        setError("图片上传失败，请重试");
      }
    };
    img.onerror = () => {
      setError("无法读取图片文件，请选择其他图片");
    };
    img.src = URL.createObjectURL(file);
  };

  const handleRemove = () => {
    setPreviewUrl("");
    setError("");
    onChange("");
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs text-gray-500">{label}</label>
      )}
      
      {/* Error message */}
      {error && (
        <div className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}
      
      <div className={cn(
        "border-2 border-dashed rounded-lg overflow-hidden",
        error ? "border-red-300 bg-red-50" : "border-gray-200"
      )}>
        {previewUrl ? (
          <div className="relative group">
            <Image
              src={previewUrl}
              alt="Preview"
              width={300}
              height={150}
              className="w-full h-auto max-h-[150px] object-contain"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <label className="cursor-pointer px-3 py-1.5 bg-white rounded-lg text-xs font-medium hover:bg-gray-100">
                重新上传
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleRemove}
                className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium hover:bg-gray-100 text-red-500"
              >
                删除
              </button>
            </div>
            <div className="absolute bottom-1 left-1 right-1 text-center">
              <span className="text-xs text-white bg-black/50 px-2 py-0.5 rounded">
                {width}×{height}px | 最大 {maxSize}MB
              </span>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center py-8 cursor-pointer hover:bg-gray-50 transition-colors">
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-500">上传中...</span>
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                  <Plus className="w-5 h-5 text-gray-400" />
                </div>
                <span className="text-sm text-gray-500">点击上传图片</span>
                <span className="text-xs text-gray-400 mt-1">
                  推荐 {width}×{height}px，最大 {maxSize}MB
                </span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        )}
      </div>
    </div>
  );
}

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

// Vote option editor (简化版 - 只有两个固定选项)
function VoteOptionEditor({
  option,
  index,
  onChange,
}: {
  option: VoteOption;
  index: number;
  onChange: (option: VoteOption) => void;
}) {
  const fixedPercentage = index === 0 ? 75 : 25;

  return (
    <div className="border border-gray-200 rounded-lg bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            选项 {index + 1}
          </span>
          <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 rounded">
            {fixedPercentage}%
          </span>
        </div>
      </div>
      
      {/* Button Text */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-500">按钮文本</label>
          <CharCounter value={option.buttonText} max={16} />
        </div>
        <Input
          value={option.buttonText}
          onChange={(e) => onChange({ ...option, buttonText: e.target.value })}
          placeholder="请输入按钮文本"
          maxLength={16}
        />
      </div>
    </div>
  );
}

// Main configuration panel
export function VoteTemplateConfigPanel({
  config,
  onChange,
  onSave,
}: {
  config: VoteTemplateConfig;
  onChange: (config: VoteTemplateConfig) => void;
  onSave?: () => void;
}) {
  const [isBasicOpen, setIsBasicOpen] = useState(true);
  const [isOptionsOpen, setIsOptionsOpen] = useState(true);
  const [isLandingOpen, setIsLandingOpen] = useState(true);
  const [titleMode, setTitleMode] = useState<"input" | "macro">("input");
  const [subtitleMode, setSubtitleMode] = useState<"input" | "macro">("input");
  const [landingPageMode, setLandingPageMode] = useState<"input" | "macro">("input");
  const [imageInputMode, setImageInputMode] = useState<"upload" | "macro">("upload");

  const handleTitleChange = (title: string) => {
    onChange({ ...config, title });
  };

  const handleSubtitleChange = (subtitle: string) => {
    onChange({ ...config, subtitle });
  };

  const handleOptionChange = (index: number, option: VoteOption) => {
    const newOptions = [...(config.options || [])];
    newOptions[index] = option;
    onChange({ ...config, options: newOptions });
  };

  const handleLandingPageChange = (url: string) => {
    onChange({ ...config, landingPageUrl: url });
  };

  const handleLandingPageMacroChange = (macro: string) => {
    onChange({ ...config, landingPageMacro: macro });
  };

  const handleActionChange = (action: "jump" | "show_image") => {
    // Reset image settings when switching actions
    if (action === "jump") {
      onChange({ ...config, action, imageUrl: undefined, imageMacro: undefined });
    } else {
      onChange({ ...config, action });
    }
  };

  const handleImageChange = (url: string) => {
    onChange({ ...config, imageUrl: url, imageMacro: undefined });
  };

  const handleImageMacroChange = (macro: string) => {
    onChange({ ...config, imageMacro: macro, imageUrl: undefined });
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
          新建投票磁贴
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
              {/* Title */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-500">
                    主标题 <span className="text-red-500">*</span>
                  </label>
                  <CharCounter current={config.title?.length || 0} max={24} />
                </div>
                <div className="flex gap-2">
                  <Input
                    value={config.title || ""}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="请输入主标题"
                    maxLength={24}
                    className="flex-1"
                  />
                  <ModeToggle value={titleMode} onChange={setTitleMode} />
                </div>
                <p className="text-xs text-gray-400 text-right">
                  {getStringWidth(config.title || "")}/24字符
                  {isOverWidth(config.title || "", 24) && <span className="text-red-500 ml-1">（超出限制）</span>}
                </p>
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
                    副标题
                  </label>
                  <span className="text-xs text-gray-400">
                    {getStringWidth(config.subtitle || "")}/60字符
                  </span>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={config.subtitle || ""}
                    onChange={(e) => handleSubtitleChange(e.target.value)}
                    placeholder="请输入副标题"
                    maxLength={60}
                    className="flex-1"
                  />
                  <ModeToggle value={subtitleMode} onChange={setSubtitleMode} />
                </div>
                <p className="text-xs text-gray-400 text-right">
                  {getStringWidth(config.subtitle || "")}/60字符
                  {isOverWidth(config.subtitle || "", 60) && <span className="text-red-500 ml-1">（超出限制）</span>}
                </p>
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

        {/* Vote Options Config */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
            className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">
              投票选项配置
            </span>
            {isOptionsOpen ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {isOptionsOpen && (
            <div className="px-4 pb-4 space-y-3">
              {/* Fixed two options with percentages */}
              <div className="space-y-3">
                {(config.options || []).slice(0, 2).map((option, index) => (
                  <VoteOptionEditor
                    key={option.id}
                    option={option}
                    index={index}
                    onChange={(opt) => handleOptionChange(index, opt)}
                  />
                ))}
              </div>
              {/* Fixed percentage note */}
              <p className="text-xs text-gray-400 text-center">
                投票统计：选项1占75%，选项2占25%
              </p>
            </div>
          )}
        </div>

        {/* Landing Page Config */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setIsLandingOpen(!isLandingOpen)}
            className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">
              落地页配置
            </span>
            {isLandingOpen ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {isLandingOpen && (
            <div className="px-4 pb-4 space-y-4">
              {/* Action */}
              <div className="space-y-2">
                <label className="text-xs text-gray-500">
                  点击后动作 <span className="text-red-500">*</span>
                </label>
                <Select
                  value={config.action || "jump"}
                  onValueChange={(v) => handleActionChange(v as "jump" | "show_image")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jump">
                      <div className="flex items-center gap-2">
                        <span>跳转落地页</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Landing Page URL - Show for both actions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-500">
                    落地页链接
                  </label>
                  <ModeToggle 
                    value={landingPageMode} 
                    onChange={(v) => {
                      setLandingPageMode(v);
                      if (v === "macro") {
                        handleLandingPageChange("");
                      } else {
                        handleLandingPageMacroChange("");
                      }
                    }} 
                  />
                </div>
                {landingPageMode === "input" ? (
                  <Input
                    value={config.landingPageUrl || ""}
                    onChange={(e) => handleLandingPageChange(e.target.value)}
                    placeholder={
                      config.defaultLandingPageUrl
                        ? `不配置默认使用: ${config.defaultLandingPageUrl}`
                        : "请输入落地页链接"
                    }
                  />
                ) : (
                  <Input
                    value={config.landingPageMacro || ""}
                    onChange={(e) => handleLandingPageMacroChange(e.target.value)}
                    placeholder="如 ${landing_page_url}"
                  />
                )}
              </div>

              {/* Default Landing Page */}
              <div className="space-y-2">
                <label className="text-xs text-gray-500">
                  默认落地页链接（全局）
                </label>
                <Input
                  value={config.defaultLandingPageUrl || ""}
                  onChange={(e) => handleDefaultLandingPageChange(e.target.value)}
                  placeholder="当选项未配置落地页时使用此链接"
                />
              </div>
            </div>
          )}
        </div>

        {/* Component Name */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-500">
              组件名称 <span className="text-red-500">*</span>
            </label>
          </div>
          <Input
            value={config.title || ""}
            onChange={(e) => handleTitleChange(e.target.value)}
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
export function VoteTemplateDemo() {
  const [config, setConfig] = useState<VoteTemplateConfig>({
    title: "请选择您的偏好",
    subtitle: "感谢您的参与，点击选择您喜欢的选项",
    clickResultText: "投票成功，感谢您的参与！",
    options: [
      { id: "option_1", text: "选项A", voteCount: 120, buttonText: "A" },
      { id: "option_2", text: "选项B", voteCount: 80, buttonText: "B" },
    ],
    action: "jump",
    landingPageUrl: "",
    defaultLandingPageUrl: "",
  });

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Config Panel */}
      <div className="w-[480px] border-r border-gray-200 bg-white">
        <VoteTemplateConfigPanel
          config={config}
          onChange={setConfig}
        />
      </div>

      {/* Preview */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-[375px] transform scale-100">
          <VoteTemplate
            config={config}
            isOpen={true}
            previewMode={true}
          />
        </div>
      </div>
    </div>
  );
}
