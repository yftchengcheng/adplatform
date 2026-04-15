"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Settings2,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Image as ImageIcon,
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
  ImageTemplateConfig,
  ImageItem,
} from "./image-template";
import { cn } from "@/lib/utils";

// 图片上传组件（复用）
function ImageUpload({
  value,
  onChange,
  aspectRatio,
  maxSize = 1,
}: {
  value?: string;
  onChange: (url: string) => void;
  aspectRatio?: string;
  maxSize?: number;
}) {
  const [previewUrl, setPreviewUrl] = useState<string>(value || "");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    // 允许的文件类型
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif"];

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      setError("仅支持 JPG、PNG、JPEG、WebP、GIF 格式");
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`图片大小不能超过 ${maxSize}MB，当前 ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    // Validate image dimensions or aspect ratio
    const img = document.createElement("img");
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      
      if (aspectRatio) {
        // 宽高比校验
        const [targetW, targetH] = aspectRatio.split(":").map(Number);
        const targetRatio = targetW / targetH;
        const actualRatio = img.width / img.height;
        const ratioDiff = Math.abs(actualRatio - targetRatio);
        const tolerance = 0.1; // 允许10%误差
        if (ratioDiff > targetRatio * tolerance) {
          setError(`图片宽高比需为 ${aspectRatio}，当前 ${img.width}×${img.height}`);
          return;
        }
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
          <div className={`relative ${aspectRatio ? "bg-transparent" : "aspect-video bg-gray-100"}`} style={aspectRatio ? { aspectRatio } : undefined}>
            <Image
              src={previewUrl || value || ""}
              alt="Preview"
              fill
              className="object-cover"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <label className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium cursor-pointer hover:bg-gray-100">
                重新上传
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              <button
                onClick={handleRemove}
                className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-red-500 hover:bg-red-50"
              >
                删除
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
      <label className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
          <Plus className="w-6 h-6 text-gray-400" />
        </div>
        <span className="text-sm text-gray-500">点击上传图片</span>
        <span className="text-xs text-gray-400 mt-1">
          {aspectRatio ? `宽高比: ${aspectRatio}` : "尺寸 640×360px"}，JPG/PNG/JPEG，最大 {maxSize}MB
        </span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
      {isUploading && (
        <p className="text-xs text-blue-500 mt-2 text-center">上传中...</p>
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

// 单个图片项配置
function ImageItemEditor({
  image,
  index,
  onChange,
  onRemove,
  canRemove = true,
}: {
  image: ImageItem;
  index: number;
  onChange: (image: ImageItem) => void;
  onRemove: () => void;
  canRemove?: boolean;
}) {
  const [landingPageMode, setLandingPageMode] = useState<"input" | "macro">("input");
  const [imageInputMode, setImageInputMode] = useState<"upload" | "macro">("upload");

  return (
    <div className="border border-gray-200 rounded-lg bg-white p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">图片 {index + 1}</span>
        </div>
        {canRemove && (
          <button
            onClick={onRemove}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 图片上传 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-500">图片</label>
          <Select
            value={imageInputMode}
            onValueChange={(v) => {
              const mode = v as "upload" | "macro";
              setImageInputMode(mode);
              if (mode === "upload") {
                onChange({ ...image, imageUrl: undefined, imageMacro: undefined });
              } else {
                onChange({ ...image, imageUrl: undefined, imageMacro: "" });
              }
            }}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upload">上传图片</SelectItem>
              <SelectItem value="macro">图片宏</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {imageInputMode === "macro" ? (
          <Input
            value={image.imageMacro || ""}
            onChange={(e) => onChange({ ...image, imageMacro: e.target.value, imageUrl: undefined })}
            placeholder="如 ${image_url}"
          />
        ) : (
          <ImageUpload
            value={image.imageUrl || ""}
            onChange={(url) => onChange({ ...image, imageUrl: url, imageMacro: undefined })}
            label="上传图片"
            maxSize={1}
            aspectRatio="9:16"
          />
        )}
      </div>

      {/* 落地页 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-gray-500">落地页链接</label>
          <ModeToggle
            value={landingPageMode}
            onChange={setLandingPageMode}
          />
        </div>
        {landingPageMode === "macro" ? (
          <Input
            value={image.landingPageMacro || ""}
            onChange={(e) => onChange({ ...image, landingPageMacro: e.target.value, landingPageUrl: undefined })}
            placeholder="如 ${landing_url}"
          />
        ) : (
          <Input
            value={image.landingPageUrl || ""}
            onChange={(e) => onChange({ ...image, landingPageUrl: e.target.value, landingPageMacro: undefined })}
            placeholder="请输入落地页链接"
          />
        )}
      </div>
    </div>
  );
}

// 主配置面板
export function ImageTemplateConfigPanel({
  config,
  onChange,
  onSave,
}: {
  config: ImageTemplateConfig;
  onChange: (config: ImageTemplateConfig) => void;
  onSave?: () => void;
}) {
  const [isBasicOpen, setIsBasicOpen] = useState(true);
  const [landingPageMode, setLandingPageMode] = useState<"input" | "macro">("input");

  // 确保 images 是数组
  const safeImages: ImageItem[] = Array.isArray(config.images) ? config.images : [];

  // 添加图片
  const handleAddImage = () => {
    if (safeImages.length >= 3) return;
    const newImage: ImageItem = {
      id: `img_${Date.now()}`,
    };
    onChange({ ...config, images: [...safeImages, newImage] });
  };

  // 更新图片
  const handleUpdateImage = (index: number, image: ImageItem) => {
    const newImages = [...safeImages];
    newImages[index] = image;
    onChange({ ...config, images: newImages });
  };

  // 删除图片
  const handleRemoveImage = (index: number) => {
    const newImages = safeImages.filter((_, i) => i !== index);
    onChange({ ...config, images: newImages });
  };

  // 全局落地页配置
  const handleGlobalLandingPageChange = (url: string) => {
    onChange({ ...config, defaultLandingPageUrl: url });
  };

  const handleGlobalLandingPageMacroChange = (macro: string) => {
    onChange({ ...config, landingPageMacro: macro });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-white border-b border-gray-200">
        <Settings2 className="w-5 h-5 text-gray-500" />
        <h2 className="text-base font-semibold text-gray-900">
          新建图片磁贴
        </h2>
      </div>

      {/* Form content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-2xl mx-auto w-full">
        {/* 全局落地页配置 */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setIsBasicOpen(!isBasicOpen)}
            className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">
              全局落地页配置
            </span>
            {isBasicOpen ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {isBasicOpen && (
            <div className="px-4 pb-4 space-y-4">
              <p className="text-xs text-gray-400">
                每张图片可单独配置落地页，未配置时使用全局落地页
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-500">全局落地页</label>
                  <ModeToggle
                    value={landingPageMode}
                    onChange={setLandingPageMode}
                  />
                </div>
                {landingPageMode === "macro" ? (
                  <Input
                    value={config.landingPageMacro || ""}
                    onChange={(e) => handleGlobalLandingPageMacroChange(e.target.value)}
                    placeholder="如 ${landing_url}"
                  />
                ) : (
                  <Input
                    value={config.defaultLandingPageUrl || ""}
                    onChange={(e) => handleGlobalLandingPageChange(e.target.value)}
                    placeholder="请输入全局落地页链接"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* 图片列表 */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium text-gray-700">
              图片列表 ({safeImages.length}/3)
            </span>
            <button
              onClick={handleAddImage}
              disabled={safeImages.length >= 3}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                safeImages.length >= 3
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              )}
            >
              <Plus className="w-3 h-3" />
              添加图片
            </button>
          </div>

          <div className="px-4 pb-4 space-y-4">
            {safeImages.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                暂无图片，请点击上方按钮添加
              </div>
            ) : (
              safeImages.map((image, index) => (
                <ImageItemEditor
                  key={image.id || index}
                  image={image}
                  index={index}
                  onChange={(img) => handleUpdateImage(index, img)}
                  onRemove={() => handleRemoveImage(index)}
                  canRemove={safeImages.length > 1}
                />
              ))
            )}
          </div>
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

export { ImageTemplateConfigPanel as default };
