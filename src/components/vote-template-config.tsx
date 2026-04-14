"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Settings2,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  GripVertical,
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
import { cn } from "@/lib/utils";

// Image Upload Component
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("请上传图片文件");
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`图片大小不能超过 ${maxSize}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Simulate upload (in production, replace with actual upload API)
    setIsUploading(true);
    setTimeout(() => {
      // Use data URL for demo
      setIsUploading(false);
      // In production, call actual upload API
      const dataUrl = reader.result as string;
      onChange(dataUrl);
    }, 1000);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs text-gray-500">{label}</label>
      )}
      <div className="border-2 border-dashed border-gray-200 rounded-lg overflow-hidden">
        {previewUrl ? (
          <div className="relative group">
            <Image
              src={previewUrl}
              alt="Preview"
              width={300}
              height={150}
              className="w-full h-auto max-h-[150px] object-contain"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <label className="cursor-pointer px-4 py-2 bg-white rounded-lg text-sm font-medium hover:bg-gray-100">
                重新上传
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center py-8 cursor-pointer hover:bg-gray-50 transition-colors">
            {isUploading ? (
              <div className="text-sm text-gray-500">上传中...</div>
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

// Vote option editor
function VoteOptionEditor({
  option,
  onChange,
  onRemove,
  canRemove,
}: {
  option: VoteOption;
  onChange: (option: VoteOption) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
          <span className="text-sm font-medium text-gray-700">
            选项 {option.id.replace("option_", "")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>
          {canRemove && (
            <button
              onClick={onRemove}
              className="p-1 hover:bg-red-100 rounded transition-colors text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="p-3 space-y-3">
          {/* Option Text */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-500">选项文本</label>
              <CharCounter current={option.text.length} max={20} />
            </div>
            <Input
              value={option.text}
              onChange={(e) => onChange({ ...option, text: e.target.value })}
              placeholder="请输入选项文本"
              maxLength={20}
            />
          </div>

          {/* Button Text */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-500">按钮文本</label>
              <CharCounter current={option.buttonText.length} max={16} />
            </div>
            <Input
              value={option.buttonText}
              onChange={(e) => onChange({ ...option, buttonText: e.target.value })}
              placeholder="请输入按钮文本"
              maxLength={16}
            />
          </div>
        </div>
      )}
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

  const handleAddOption = () => {
    const newOption: VoteOption = {
      id: `option_${Date.now()}`,
      text: "",
      voteCount: 0,
      buttonText: "",
    };
    onChange({ ...config, options: [...(config.options || []), newOption] });
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = [...(config.options || [])];
    newOptions.splice(index, 1);
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

  const handleClickResultTextChange = (text: string) => {
    onChange({ ...config, clickResultText: text });
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
                  <CharCounter current={config.subtitle?.length || 0} max={60} />
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
                {subtitleMode === "macro" && (
                  <Input
                    placeholder="宏替换变量，如 ${subtitle}"
                    className="text-sm"
                  />
                )}
              </div>

              {/* Click Result Text */}
              <div className="space-y-2">
                <label className="text-xs text-gray-500">
                  点击结果文案
                </label>
                <Input
                  value={config.clickResultText || ""}
                  onChange={(e) => handleClickResultTextChange(e.target.value)}
                  placeholder="投票后显示的提示文案"
                />
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
              {/* Options List */}
              <div className="space-y-3">
                {(config.options || []).map((option, index) => (
                  <VoteOptionEditor
                    key={option.id}
                    option={option}
                    onChange={(opt) => handleOptionChange(index, opt)}
                    onRemove={() => handleRemoveOption(index)}
                    canRemove={(config.options?.length || 0) > 1}
                  />
                ))}
              </div>

              {/* Add Button */}
              <button
                onClick={handleAddOption}
                className="w-full h-10 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">添加投票选项</span>
              </button>
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
                    <SelectItem value="show_image">
                      <div className="flex items-center gap-2">
                        <span>显示图片</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Image Upload - Only show when action is "show_image" */}
              {config.action === "show_image" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-500">
                      图片设置
                    </label>
                    <Select
                      value={config.imageMacro ? "macro" : "upload"}
                      onValueChange={(v) => {
                        if (v === "upload") {
                          handleImageChange("");
                        } else {
                          handleImageMacroChange("");
                        }
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upload">上传图片</SelectItem>
                        <SelectItem value="macro">图片宏</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {config.imageMacro ? (
                    <Input
                      value={config.imageMacro || ""}
                      onChange={(e) => handleImageMacroChange(e.target.value)}
                      placeholder="如 ${image_url}"
                    />
                  ) : (
                    <ImageUpload
                      value={config.imageUrl || ""}
                      onChange={handleImageChange}
                      label="上传图片"
                      width={300}
                      height={150}
                      maxSize={2}
                    />
                  )}
                </div>
              )}

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
