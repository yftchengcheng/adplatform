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

// Image Upload Component - Integrated into Basic Config

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
  const [basicOpen, setBasicOpen] = useState(true);
  const [downloadOpen, setDownloadOpen] = useState(true);

  // 模式状态
  // 初始值根据配置决定：如果有对应的Macro则宏模式，否则输入模式
  const [imageMode, setImageMode] = useState<"upload" | "macro">(
    config.images[0]?.imageMacro ? "macro" : "upload"
  );
  const [appNameMode, setAppNameMode] = useState<"input" | "macro">(
    config.appNameMacro ? "macro" : "input"
  );
  const [appDescMode, setAppDescMode] = useState<"input" | "macro">(
    config.appDescriptionMacro ? "macro" : "input"
  );
  const [downloadMode, setDownloadMode] = useState<"input" | "macro">(
    config.downloadMacro ? "macro" : "input"
  );
  // 应用包名模式：根据是否有 appPackageMacro 判断
  const [appPackageMode, setAppPackageMode] = useState<"input" | "macro">(
    config.appPackageMacro ? "macro" : "input"
  );
  // 礼包码模式：根据是否有 giftCodeMacro 判断
  const [giftCodeMode, setGiftCodeMode] = useState<"input" | "macro">(
    config.giftCodeMacro ? "macro" : "input"
  );
  // Logo 模式（true = 宏替换模式, false = 上传模式）
  // 初始值根据配置决定：如果有logoMacro且没有logoUrl则宏模式，否则上传模式
  const [logoMode, setLogoMode] = useState<boolean>(!!config.logoMacro && !config.logoUrl);

  // 组件名称模式（true = 宏替换模式, false = 输入模式）
  const [componentNameMode, setComponentNameMode] = useState<boolean>(!!config.componentNameMacro && !config.componentName);

  // Logo 错误状态
  const [logoError, setLogoError] = useState<string | null>(null);
  // 应用图片错误状态
  const [imageErrors, setImageErrors] = useState<Record<string, string | null>>({});

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
      // 宏模式下只设置 appNameMacro，保留 appName 作为默认值
      updateConfig({ appNameMacro: value });
    } else {
      // 输入模式下只设置 appName，清空宏变量
      updateConfig({ appName: value, appNameMacro: "" });
    }
  };

  // 处理组件名称输入
  const handleComponentNameInput = (value: string) => {
    if (componentNameMode) {
      // 宏模式下只设置 componentNameMacro，保留 componentName 作为默认值
      updateConfig({ componentNameMacro: value });
    } else {
      // 输入模式下只设置 componentName，清空宏变量
      updateConfig({ componentName: value, componentNameMacro: "" });
    }
  };

  // 获取组件名称值
  const getComponentNameValue = () => {
    return componentNameMode ? (config.componentNameMacro || "") : (config.componentName || "");
  };

  // 处理应用描述输入
  const handleAppDescInput = (value: string) => {
    if (appDescMode === "macro") {
      // 宏模式下只设置 appDescriptionMacro，保留 appDescription 作为默认值
      updateConfig({ appDescriptionMacro: value });
    } else {
      // 输入模式下只设置 appDescription，清空宏变量
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

  // 处理应用包名输入
  const handleAppPackageInput = (value: string) => {
    if (appPackageMode === "macro") {
      // 宏模式下只设置 appPackageMacro，保留 appPackageName 作为默认值
      updateConfig({ appPackageMacro: value });
    } else {
      // 输入模式下只设置 appPackageName，清空宏变量
      updateConfig({ appPackageName: value, appPackageMacro: "" });
    }
  };

  // 处理礼包码输入
  const handleGiftCodeInput = (value: string) => {
    if (giftCodeMode === "macro") {
      // 宏模式下只设置 giftCodeMacro，保留 giftCode 作为默认值
      updateConfig({ giftCodeMacro: value });
    } else {
      // 输入模式下只设置 giftCode，清空宏变量
      updateConfig({ giftCode: value, giftCodeMacro: "" });
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
  const getAppPackageValue = () => appPackageMode === "macro" ? (config.appPackageMacro || config.appPackageName || "") : (config.appPackageName || "");
  const getGiftCodeValue = () => giftCodeMode === "macro" ? (config.giftCodeMacro || config.giftCode || "") : (config.giftCode || "");

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
                        if (!logoMode) return; // 已经是上传模式
                        setLogoMode(false);
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
                        if (logoMode) return; // 已经是宏替换模式
                        setLogoMode(true);
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
                          // 校验文件大小
                          if (file.size > 1 * 1024 * 1024) {
                            setLogoError(`Logo 图片大小不能超过 1MB，当前 ${(file.size / 1024 / 1024).toFixed(2)}MB`);
                            return;
                          }
                          // 校验宽高比
                          const img = new Image();
                          img.onload = () => {
                            const ratio = img.naturalWidth / img.naturalHeight;
                            if (Math.abs(ratio - 1) > 0.01) {
                              setLogoError(`Logo 图片宽高比需为 1:1，当前 ${img.naturalWidth}×${img.naturalHeight}`);
                              return;
                            }
                            setLogoError(null);
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              handleLogoInput(ev.target?.result as string, false);
                            };
                            reader.readAsDataURL(file);
                          };
                          img.onerror = () => {
                            setLogoError("无法读取图片文件，请选择其他图片");
                          };
                          img.src = URL.createObjectURL(file);
                        }}
                      />
                    </label>
                  )}
                  <p className="text-xs text-gray-400 mt-1">宽高比 1:1，推荐 132×132px，最大 1MB</p>
                  {logoError && (
                    <p className="text-xs text-red-500 mt-1">{logoError}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* 应用图片 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  应用图片（最多2张）
                </label>
                <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => setImageMode("upload")}
                    className={cn(
                      "px-2 py-0.5 text-xs font-medium rounded transition-all",
                      imageMode === "upload" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
                    )}
                  >
                    上传图片
                  </button>
                  <button
                    onClick={() => setImageMode("macro")}
                    className={cn(
                      "px-2 py-0.5 text-xs font-medium rounded transition-all",
                      imageMode === "macro" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"
                    )}
                  >
                    图片宏
                  </button>
                </div>
              </div>

              {imageMode === "macro" ? (
                <div className="space-y-2">
                  {config.images.map((img, index) => (
                    <div key={img.id} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-12">图片{index + 1}</span>
                      <Input
                        placeholder="如 ${app_image}"
                        value={img.imageMacro || ""}
                        onChange={(e) => updateImage(index, { imageMacro: e.target.value, imageUrl: "" })}
                        className="flex-1"
                      />
                      {config.images.length > 1 && (
                        <button
                          onClick={() => deleteImage(img.id)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {config.images.length < 2 && (
                    <button
                      onClick={addImage}
                      className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      添加图片
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {config.images.map((img, index) => (
                    <div key={img.id} className="flex items-center gap-3">
                      <div className="w-16 h-16 border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0">
                        {img.imageUrl ? (
                          <img
                            src={img.imageUrl}
                            alt={`图片${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
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
                              // 校验文件大小
                              if (file.size > 1 * 1024 * 1024) {
                                setImageErrors(prev => ({ ...prev, [index]: `应用图片大小不能超过 1MB，当前 ${(file.size / 1024 / 1024).toFixed(2)}MB` }));
                                return;
                              }
                              // 校验宽高比 16:9
                              const img = new Image();
                              img.onload = () => {
                                const ratio = img.naturalWidth / img.naturalHeight;
                                const targetRatio = 16 / 9;
                                if (Math.abs(ratio - targetRatio) > 0.05) {
                                  setImageErrors(prev => ({ ...prev, [index]: `应用图片宽高比需为 16:9，当前 ${img.naturalWidth}×${img.naturalHeight}` }));
                                  return;
                                }
                                setImageErrors(prev => ({ ...prev, [index]: null }));
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  updateImage(index, { imageUrl: ev.target?.result as string, imageMacro: "" });
                                };
                                reader.readAsDataURL(file);
                              };
                              img.onerror = () => {
                                setImageErrors(prev => ({ ...prev, [index]: "无法读取图片文件，请选择其他图片" }));
                              };
                              img.src = URL.createObjectURL(file);
                            }}
                          />
                        </label>
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
                  ))}
                  {config.images.length < 2 && (
                    <button
                      onClick={addImage}
                      className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-blue-400 hover:text-blue-500 flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      添加图片
                    </button>
                  )}
                  <p className="text-xs text-gray-400">宽高比 16:9，推荐 1280×720px，最大 1MB</p>
                  {Object.values(imageErrors).some(Boolean) && (
                    <p className="text-xs text-red-500 mt-1">
                      {Object.entries(imageErrors).find(([_, error]) => error)?.[1]}
                    </p>
                  )}
                </div>
              )}
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
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">应用包名</label>
                <ModeToggle value={appPackageMode} onChange={setAppPackageMode} />
              </div>
              {appPackageMode === "macro" ? (
                <Input
                  placeholder="如 ${package_name}"
                  value={getAppPackageValue()}
                  onChange={(e) => handleAppPackageInput(e.target.value)}
                />
              ) : (
                <Input
                  placeholder="如 com.example.game"
                  value={getAppPackageValue()}
                  onChange={(e) => handleAppPackageInput(e.target.value)}
                />
              )}
            </div>

            {/* 礼包码 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">礼包码</label>
                <ModeToggle value={giftCodeMode} onChange={setGiftCodeMode} />
              </div>
              {giftCodeMode === "macro" ? (
                <Input
                  placeholder="如 ${gift_code}"
                  value={getGiftCodeValue()}
                  onChange={(e) => handleGiftCodeInput(e.target.value)}
                />
              ) : (
                <Input
                  placeholder="请输入礼包码"
                  value={getGiftCodeValue()}
                  onChange={(e) => handleGiftCodeInput(e.target.value)}
                />
              )}
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

      {/* Component Name Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <SectionHeader
            title="组件名称"
            isOpen={true}
            onToggle={() => {}}
          />
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">组件名称</label>
            <ModeToggle value={componentNameMode ? "macro" : "input"} onChange={(v) => setComponentNameMode(v === "macro")} />
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="请输入组件名称"
              value={getComponentNameValue()}
              onChange={(e) => handleComponentNameInput(e.target.value)}
              className="flex-1"
            />
            <CharCounter value={getComponentNameValue()} max={20} />
          </div>
        </div>
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
