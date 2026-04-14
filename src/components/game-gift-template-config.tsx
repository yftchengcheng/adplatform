"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  ImageIcon,
  Link2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  GameGiftTemplateConfig,
  GameGiftTemplate,
} from "@/components/game-gift-template";
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

// Image Upload Component
function ImageUpload({
  value,
  onChange,
  macroValue,
  macroOnChange,
  mode,
  onModeChange,
}: {
  value: string;
  onChange: (v: string) => void;
  macroValue: string;
  macroOnChange: (v: string) => void;
  mode: "upload" | "macro";
  onModeChange: (v: "upload" | "macro") => void;
  aspectRatio?: string;
  recommendedSize?: string;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);

  // 同步外部 value 变化
  useEffect(() => {
    if (mode === "upload") {
      setPreviewUrl(value || null);
    }
  }, [value, mode]);

  // 切换到宏模式时清空预览
  useEffect(() => {
    if (mode === "macro") {
      setPreviewUrl(null);
      setError(null);
    }
  }, [mode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 校验文件类型
    if (!file.type.startsWith("image/")) {
      setError("请上传图片文件（支持 JPG、PNG、GIF、WebP 等格式）");
      return;
    }

    // 校验文件大小（1MB）
    if (file.size > 1 * 1024 * 1024) {
      setError("图片大小不能超过 1MB，当前文件 " + (file.size / 1024 / 1024).toFixed(2) + "MB");
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setPreviewUrl(url);
      onChange(url);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">图片设置</label>
        <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
          <button
            onClick={() => {
              setError(null);
              onModeChange("upload");
            }}
            className={cn(
              "px-2 py-0.5 text-xs font-medium rounded transition-all",
              mode === "upload" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
            )}
          >
            上传图片
          </button>
          <button
            onClick={() => {
              setError(null);
              onModeChange("macro");
            }}
            className={cn(
              "px-2 py-0.5 text-xs font-medium rounded transition-all",
              mode === "macro" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
            )}
          >
            图片宏
          </button>
        </div>
      </div>

      {mode === "macro" ? (
        <Input
          placeholder="如 ${app_image}"
          value={macroValue || ""}
          onChange={(e) => macroOnChange(e.target.value)}
        />
      ) : (
        <>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg overflow-hidden",
              error ? "border-red-300" : "border-gray-200"
            )}
          >
            {previewUrl ? (
              <div className="relative group">
                <img
                  src={previewUrl}
                  alt="图片预览"
                  className="w-full h-auto object-contain max-h-32 mx-auto"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2">
                  <label className="px-2 py-1 bg-white rounded text-xs cursor-pointer">
                    重新上传
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  <button
                    onClick={() => {
                      setPreviewUrl(null);
                      onChange("");
                    }}
                    className="px-2 py-1 bg-white rounded text-xs text-red-500"
                  >
                    删除
                  </button>
                </div>
              </div>
            ) : (
              <label htmlFor="image-upload" className="flex flex-col items-center justify-center py-6 cursor-pointer hover:bg-gray-50">
                <Plus className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-gray-500">点击上传图片</span>
                {recommendedSize && (
                  <span className="text-xs text-gray-400">{recommendedSize}，最大 1MB</span>
                )}
              </label>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            id="image-upload"
          />
          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}

interface GameGiftTemplateConfigPanelProps {
  initialConfig?: Partial<GameGiftTemplateConfig>;
  onChange?: (config: GameGiftTemplateConfig) => void;
  onSave?: (config: GameGiftTemplateConfig) => void;
  onPreview?: (config: GameGiftTemplateConfig) => void;
  macroVariables?: Record<string, string>;
}

export function GameGiftTemplateConfigPanel({
  initialConfig,
  onChange,
  onSave,
  onPreview,
  macroVariables = {},
}: GameGiftTemplateConfigPanelProps) {
  // 默认图片
  const defaultImages = [
    { id: "1", imageUrl: "" },
  ];

  // 表单配置
  const [config, setConfig] = useState<GameGiftTemplateConfig>(() => ({
    ...{
      images: [...defaultImages],
      logoUrl: "",
      logoMacro: "",
      appName: "游戏名称",
      appNameMacro: "",
      appDescription: "游戏描述内容",
      appDescriptionMacro: "",
      appPackageName: "",
      appPackageMacro: "",
      downloadUrl: "",
      downloadMacro: "",
      giftCode: "",
      giftCodeMacro: "",
    },
    ...initialConfig,
    images: initialConfig?.images?.length 
      ? initialConfig.images 
      : [...defaultImages],
    macroVariables,
  }));

  // 折叠状态
  const [imageOpen, setImageOpen] = useState(true);
  const [basicOpen, setBasicOpen] = useState(true);
  const [downloadOpen, setDownloadOpen] = useState(true);

  // 模式状态
  const [imageMode, setImageMode] = useState<"upload" | "macro">("upload");
  const [appNameMode, setAppNameMode] = useState<"input" | "macro">("input");
  const [appDescMode, setAppDescMode] = useState<"input" | "macro">("input");
  const [downloadMode, setDownloadMode] = useState<"input" | "macro">("input");
  // Logo 模式（true = 上传模式, false = 宏模式）
  const [logoMode, setLogoMode] = useState<boolean>(!config.logoMacro);

  // 更新配置
  const updateConfig = (updates: Partial<GameGiftTemplateConfig>) => {
    const newConfig = { ...config, ...updates, macroVariables };
    setConfig(newConfig);
    onChange?.(newConfig);
  };

  // 添加图片
  const addImage = () => {
    if (config.images.length >= 2) return;
    const newImage = {
      id: Date.now().toString(),
      imageUrl: "",
      imageMacro: "",
    };
    updateConfig({
      images: [...config.images, newImage],
    });
  };

  // 删除图片
  const deleteImage = (id: string) => {
    if (config.images.length <= 1) return;
    updateConfig({
      images: config.images.filter((img) => img.id !== id),
    });
  };

  // 更新图片
  const updateImage = (index: number, updates: Partial<{ imageUrl: string; imageMacro: string }>) => {
    const newImages = [...config.images];
    newImages[index] = { ...newImages[index], ...updates };
    updateConfig({ images: newImages });
  };

  // 处理logo输入
  const handleLogoInput = (value: string, isMacro: boolean) => {
    if (isMacro) {
      updateConfig({ logoMacro: value, logoUrl: "" });
    } else {
      updateConfig({ logoUrl: value, logoMacro: "" });
    }
  };

  // 处理应用名称输入
  const handleAppNameInput = (value: string) => {
    if (appNameMode === "macro") {
      updateConfig({ appNameMacro: value, appName: value });
    } else {
      updateConfig({ appName: value, appNameMacro: "" });
    }
  };

  // 处理应用描述输入
  const handleAppDescInput = (value: string) => {
    if (appDescMode === "macro") {
      updateConfig({ appDescriptionMacro: value, appDescription: value });
    } else {
      updateConfig({ appDescription: value, appDescriptionMacro: "" });
    }
  };

  // 处理下载链接输入
  const handleDownloadInput = (value: string) => {
    if (downloadMode === "macro") {
      updateConfig({ downloadMacro: value, downloadUrl: "" });
    } else {
      updateConfig({ downloadUrl: value, downloadMacro: "" });
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

  // 获取各输入值
  const getAppNameValue = () => appNameMode === "macro" ? (config.appNameMacro || config.appName || "") : (config.appName || "");
  const getAppDescValue = () => appDescMode === "macro" ? (config.appDescriptionMacro || config.appDescription || "") : (config.appDescription || "");
  const getDownloadValue = () => downloadMode === "macro" ? (config.downloadMacro || "") : (config.downloadUrl || "");

  return (
    <div className="space-y-4">
      {/* App Images Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <SectionHeader
            title="应用图片（最多2张）"
            isOpen={imageOpen}
            onToggle={() => setImageOpen(!imageOpen)}
            required
          />
        </div>
        {imageOpen && (
          <div className="p-4 space-y-4">
            {config.images.map((img, index) => (
              <div key={img.id} className="border border-gray-200 rounded-lg bg-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">图片 {index + 1}</span>
                  </div>
                  {config.images.length > 1 && (
                    <button
                      onClick={() => deleteImage(img.id)}
                      className="text-red-500 hover:bg-red-50 p-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <ImageUpload
                  value={img.imageUrl || ""}
                  onChange={(v) => updateImage(index, { imageUrl: v, imageMacro: "" })}
                  macroValue={img.imageMacro || ""}
                  macroOnChange={(v) => updateImage(index, { imageMacro: v, imageUrl: "" })}
                  mode={imageMode}
                  onModeChange={setImageMode}
                  recommendedSize="推荐 1280×720px"
                />
              </div>
            ))}
            
            {config.images.length < 2 && (
              <button
                onClick={addImage}
                className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加图片
              </button>
            )}
            <p className="text-xs text-gray-400">
              支持 JPG、PNG、JPEG 格式，大小不超过 1MB
            </p>
          </div>
        )}
      </div>

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
            {/* 应用Logo */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">应用Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                  {config.logoUrl || config.logoMacro ? (
                    <img
                      src={logoMode ? config.logoMacro : config.logoUrl}
                      alt="Logo预览"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-gray-400 text-xs">Logo</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => {
                        setLogoMode(false);
                        handleLogoInput("", false);
                      }}
                      className={cn(
                        "px-2 py-0.5 text-xs font-medium rounded transition-all",
                        !logoMode ? "bg-white shadow-sm text-gray-900 border border-gray-200" : "text-gray-500"
                      )}
                    >
                      上传
                    </button>
                    <button
                      onClick={() => {
                        setLogoMode(true);
                        handleLogoInput("", true);
                      }}
                      className={cn(
                        "px-2 py-0.5 text-xs font-medium rounded transition-all",
                        logoMode ? "bg-white shadow-sm text-gray-900 border border-gray-200" : "text-gray-500"
                      )}
                    >
                      宏替换
                    </button>
                  </div>
                  {logoMode ? (
                    <Input
                      placeholder="如 ${app_logo}"
                      value={config.logoMacro || ""}
                      onChange={(e) => handleLogoInput(e.target.value, true)}
                    />
                  ) : (
                    <label className="flex items-center justify-center px-3 py-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-gray-500">
                      <Plus className="w-4 h-4 mr-1" />
                      选择文件
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 1 * 1024 * 1024) {
                            alert("图片大小不能超过 1MB");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            handleLogoInput(ev.target?.result as string, false);
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  )}
                  <p className="text-xs text-gray-400 mt-1">推荐 132×132px，最大 1MB</p>
                </div>
              </div>
            </div>

            {/* 应用名称 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">应用名称</label>
                <ModeToggle value={appNameMode} onChange={setAppNameMode} />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="请输入应用名称"
                  value={getAppNameValue()}
                  onChange={(e) => handleAppNameInput(e.target.value)}
                  className="flex-1"
                />
                <CharCounter value={getAppNameValue()} max={18} />
              </div>
            </div>

            {/* 应用描述 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">应用描述</label>
                <ModeToggle value={appDescMode} onChange={setAppDescMode} />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="请输入应用描述"
                  value={getAppDescValue()}
                  onChange={(e) => handleAppDescInput(e.target.value)}
                  className="flex-1"
                />
                <CharCounter value={getAppDescValue()} max={30} />
              </div>
            </div>

            {/* 应用包名 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">应用包名</label>
              <Input
                placeholder="如 com.example.game"
                value={config.appPackageName || ""}
                onChange={(e) => updateConfig({ appPackageName: e.target.value })}
              />
            </div>

            {/* 礼包码 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">礼包码</label>
              <Input
                placeholder="请输入礼包码"
                value={config.giftCode || ""}
                onChange={(e) => updateConfig({ giftCode: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>

      {/* Download Config Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <SectionHeader
            title="下载链接配置"
            isOpen={downloadOpen}
            onToggle={() => setDownloadOpen(!downloadOpen)}
          />
        </div>
        {downloadOpen && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                点击后动作
              </label>
              <ModeToggle
                value={downloadMode}
                onChange={setDownloadMode}
              />
            </div>

            {downloadMode === "macro" ? (
              <div className="space-y-2">
                <Input
                  placeholder="如 ${download_url}"
                  value={getDownloadValue()}
                  onChange={(e) => handleDownloadInput(e.target.value)}
                />
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Link2 className="w-3 h-3" />
                  宏变量将自动替换为实际值
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="请输入下载链接"
                  value={getDownloadValue()}
                  onChange={(e) => handleDownloadInput(e.target.value)}
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
      <GameGiftTemplatePreview config={config} />
    </div>
  );
}

// 预览弹窗状态管理
let previewRef: {
  setConfig: (config: GameGiftTemplateConfig) => void;
  open: () => void;
} | null = null;

function GameGiftTemplatePreview({ config }: { config: GameGiftTemplateConfig }) {
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
    <GameGiftTemplate
      config={previewConfig}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    />
  );
}

// 打开预览的全局方法
export function openGameGiftPreview(config: GameGiftTemplateConfig) {
  previewRef?.setConfig(config);
  previewRef?.open();
}
