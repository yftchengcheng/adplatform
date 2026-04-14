"use client";

import React, { useState } from "react";
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
  EcommerceTemplateConfig,
} from "./ecommerce-template";
import { cn, getStringWidth, isOverWidth } from "@/lib/utils";

// 按钮文案选项
const BUTTON_TEXT_OPTIONS = [
  { value: "立即下单", label: "立即下单" },
  { value: "立即购买", label: "立即购买" },
  { value: "立即下载", label: "立即下载" },
];

// 图片上传组件
function ImageUpload({
  value,
  onChange,
}: {
  value?: string;
  onChange: (url: string) => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string>(value || "");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    // 允许的文件类型
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      setError("仅支持 JPG、PNG、JPEG 格式");
      return;
    }

    // Validate file size (小于1M)
    if (file.size > 1 * 1024 * 1024) {
      setError(`图片大小不能超过 1MB，当前 ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    // Validate image dimensions (必须为 174×174)
    const img = document.createElement("img");
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      if (img.width !== 174 || img.height !== 174) {
        setError(`图片尺寸必须为 174×174px，当前 ${img.width}×${img.height}px`);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setPreviewUrl(dataUrl);
      };
      reader.readAsDataURL(file);

      // Simulate upload
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        onChange(reader.result as string);
      }, 500);
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

  // 有预览图时显示预览
  if (previewUrl || value) {
    return (
      <div className="relative group">
        <div className="border-2 border-dashed border-gray-200 rounded-lg overflow-hidden">
          <div className="relative w-[87px] h-[87px] bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl || value || ""}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
              <label className="px-2 py-1 bg-white rounded text-xs font-medium cursor-pointer hover:bg-gray-100">
                改
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              <button
                onClick={handleRemove}
                className="px-2 py-1 bg-white rounded text-xs font-medium text-red-500 hover:bg-red-50"
              >
                删
              </button>
            </div>
          </div>
        </div>
        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>
    );
  }

  // 上传区域
  return (
    <div>
      <label className="flex flex-col items-center justify-center w-[87px] h-[87px] border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-1">
          <Plus className="w-4 h-4 text-gray-400" />
        </div>
        <span className="text-xs text-gray-400 text-center leading-tight">
          174×174
          <br />
          JPG/PNG
        </span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
      {isUploading && (
        <p className="text-xs text-blue-500 mt-1 text-center">上传中...</p>
      )}
      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
}

// 模式切换组件
function ModeToggle({
  value,
  onChange,
}: {
  value: "input" | "macro";
  onChange: (value: "input" | "macro") => void;
}) {
  return (
    <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
      <button
        onClick={() => onChange("input")}
        className={cn(
          "px-3 py-1 text-xs font-medium rounded-md transition-all",
          value === "input"
            ? "bg-white shadow-sm text-gray-900"
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
            ? "bg-white shadow-sm text-gray-900"
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        宏模式
      </button>
    </div>
  );
}

// 主配置面板
export function EcommerceTemplateConfigPanel({
  config,
  onChange,
  onSave,
}: {
  config: EcommerceTemplateConfig;
  onChange: (config: EcommerceTemplateConfig) => void;
  onSave?: () => void;
}) {
  const [isBasicOpen, setIsBasicOpen] = useState(true);
  const [isImageOpen, setIsImageOpen] = useState(true);

  // 标题宏模式
  const [titleMode, setTitleMode] = useState<"input" | "macro">("input");
  // 内容宏模式
  const [contentMode, setContentMode] = useState<"input" | "macro">("input");
  // 按钮文案宏模式
  const [buttonTextMode, setButtonTextMode] = useState<"input" | "macro">("input");
  // 图片模式
  const [imageMode, setImageMode] = useState<"upload" | "macro">("upload");
  // 落地页模式
  const [landingPageMode, setLandingPageMode] = useState<"input" | "macro">("macro");

  // 处理标题变化
  const handleTitleChange = (value: string) => {
    if (titleMode === "macro") {
      onChange({ ...config, titleMacro: value, title: value });
    } else {
      onChange({ ...config, title: value, titleMacro: undefined });
    }
  };

  // 处理内容变化
  const handleContentChange = (value: string) => {
    if (contentMode === "macro") {
      onChange({ ...config, contentMacro: value, content: value });
    } else {
      onChange({ ...config, content: value, contentMacro: undefined });
    }
  };

  // 处理按钮文案变化
  const handleButtonTextChange = (value: string) => {
    if (buttonTextMode === "macro") {
      onChange({ ...config, buttonTextMacro: value, buttonText: value });
    } else {
      onChange({ ...config, buttonText: value, buttonTextMacro: undefined });
    }
  };

  // 处理图片变化
  const handleImageChange = (url: string) => {
    if (imageMode === "macro") {
      onChange({ ...config, imageMacro: url, imageUrl: undefined });
    } else {
      onChange({ ...config, imageUrl: url, imageMacro: undefined });
    }
  };

  // 处理落地页变化
  const handleLandingPageChange = (value: string) => {
    if (landingPageMode === "macro") {
      onChange({ ...config, landingPageMacro: value, landingPageUrl: undefined });
    } else {
      onChange({ ...config, landingPageUrl: value, landingPageMacro: undefined });
    }
  };

  // 获取当前标题值
  const getTitleValue = (): string => {
    if (titleMode === "macro") {
      return config.titleMacro || "";
    }
    return config.title || "";
  };

  // 获取当前内容值
  const getContentValue = (): string => {
    if (contentMode === "macro") {
      return config.contentMacro || "";
    }
    return config.content || "";
  };

  // 获取当前按钮文案值
  const getButtonTextValue = (): string => {
    if (buttonTextMode === "macro") {
      return config.buttonTextMacro || "";
    }
    return config.buttonText || "";
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-gray-200">
        <Settings2 className="w-5 h-5 text-gray-500" />
        <h2 className="text-base font-semibold text-gray-900">
          新建电商磁贴
        </h2>
      </div>

      {/* Form content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-2xl mx-auto w-full">
        {/* 基础配置 */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setIsBasicOpen(!isBasicOpen)}
            className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">基础配置</span>
            {isBasicOpen ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {isBasicOpen && (
            <div className="px-4 pb-4 space-y-4">
              {/* 标题 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-500">标题</label>
                  <ModeToggle
                    value={titleMode}
                    onChange={setTitleMode}
                  />
                </div>
                <Input
                  value={getTitleValue()}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder={titleMode === "macro" ? "如 ${title}" : "请输入标题"}
                  maxLength={20}
                />
                <p className="text-xs text-gray-400 text-right">
                  {getStringWidth(getTitleValue())}/20字符
                  {isOverWidth(getTitleValue(), 20) && <span className="text-red-500 ml-1">（超出限制）</span>}
                </p>
              </div>

              {/* 文案内容 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-500">文案内容</label>
                  <ModeToggle
                    value={contentMode}
                    onChange={setContentMode}
                  />
                </div>
                <Input
                  value={getContentValue()}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder={contentMode === "macro" ? "如 ${content}" : "请输入文案内容"}
                  maxLength={30}
                />
                <p className="text-xs text-gray-400 text-right">
                  {getStringWidth(getContentValue())}/30字符
                  {isOverWidth(getContentValue(), 30) && <span className="text-red-500 ml-1">（超出限制）</span>}
                </p>
              </div>

              {/* 按钮文案 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-500">按钮文案</label>
                  <ModeToggle
                    value={buttonTextMode}
                    onChange={setButtonTextMode}
                  />
                </div>
                {buttonTextMode === "macro" ? (
                  <Input
                    value={getButtonTextValue()}
                    onChange={(e) => handleButtonTextChange(e.target.value)}
                    placeholder="如 ${button_text}"
                  />
                ) : (
                  <Select
                    value={config.buttonText}
                    onValueChange={handleButtonTextChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择按钮文案" />
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

        {/* 图片配置 */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setIsImageOpen(!isImageOpen)}
            className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">图片配置</span>
            {isImageOpen ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {isImageOpen && (
            <div className="px-4 pb-4 space-y-4">
              <p className="text-xs text-gray-400">
                图片要求：174×174px，JPG/PNG/JPEG，最大 1MB
              </p>
              
              {/* 图片上传/宏选择 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-500">商品图片</label>
                  <Select
                    value={imageMode}
                    onValueChange={(v) => {
                      const mode = v as "upload" | "macro";
                      setImageMode(mode);
                      if (mode === "upload") {
                        onChange({ ...config, imageUrl: undefined, imageMacro: undefined });
                      } else {
                        onChange({ ...config, imageUrl: undefined, imageMacro: "" });
                      }
                    }}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upload">自定义上传</SelectItem>
                      <SelectItem value="macro">图片宏</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {imageMode === "macro" ? (
                  <Input
                    value={config.imageMacro || ""}
                    onChange={(e) => onChange({ ...config, imageMacro: e.target.value })}
                    placeholder="如 ${image_url}"
                  />
                ) : (
                  <ImageUpload
                    value={config.imageUrl || ""}
                    onChange={handleImageChange}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* 落地页配置 */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setIsBasicOpen(!isBasicOpen)}
            className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">落地页配置</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {isBasicOpen && (
            <div className="px-4 pb-4 space-y-4">
              <p className="text-xs text-gray-400">
                支持手动输入、宏替换，默认使用广告（素材）链接
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-500">落地页链接</label>
                  <ModeToggle
                    value={landingPageMode}
                    onChange={setLandingPageMode}
                  />
                </div>
                <Input
                  value={
                    landingPageMode === "macro"
                      ? (config.landingPageMacro || "")
                      : (config.landingPageUrl || "")
                  }
                  onChange={(e) => handleLandingPageChange(e.target.value)}
                  placeholder={landingPageMode === "macro" ? "如 ${landing_url}" : "请输入落地页链接"}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 bg-white border-t border-gray-200">
        <button
          onClick={onSave}
          className="w-full h-10 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          保存
        </button>
      </div>
    </div>
  );
}

export { EcommerceTemplateConfigPanel as default };
