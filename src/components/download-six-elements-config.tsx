"use client";

/**
 * 下载六要素 — 配置面板（v7）
 *
 * 变化：
 *  - 6. 产品功能 → "功能"（每条仅 1 个 URL 输入框）
 *  - 备案信息 → "备案"
 *  - 移除了 text/url 双输入，每个功能就是一个 URL
 *  - 兼容旧 config：features: {text,url}[] 或 string[]
 */

import { useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DownloadSixElementsConfig } from "./download-six-elements-template";

interface DownloadSixElementsConfigPanelProps {
  config: DownloadSixElementsConfig;
  onChange: (config: DownloadSixElementsConfig) => void;
  onSave?: () => void;
  onCancel?: () => void;
}

const AGE_RATINGS = ["3+", "4+", "8+", "12+", "16+", "18+"];

/**
 * 归一化 features 字段：兼容 string[] / {text,url}[] / undefined
 */
function normalizeFeatures(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((f) => {
      if (typeof f === "string") return f;
      if (f && typeof f === "object" && "url" in f) {
        return (f as { url?: string }).url || "";
      }
      return "";
    })
    .map((s) => (typeof s === "string" ? s : ""));
}

export function DownloadSixElementsTemplateConfigPanel({
  config,
  onChange,
}: DownloadSixElementsConfigPanelProps) {
  const update = useCallback(
    <K extends keyof DownloadSixElementsConfig>(
      key: K,
      value: DownloadSixElementsConfig[K]
    ) => {
      onChange({ ...config, [key]: value });
    },
    [config, onChange]
  );

  // 防御性兜底 + 归一化（兼容旧版 string[] / {text,url}[]）
  const features = normalizeFeatures(config.features);

  const updateFeatureUrl = useCallback(
    (index: number, url: string) => {
      const next = [...features];
      next[index] = url;
      update("features", next);
    },
    [features, update]
  );

  const addFeature = useCallback(() => {
    update("features", [...features, ""]);
  }, [features, update]);

  const removeFeature = useCallback(
    (index: number) => {
      update(
        "features",
        features.filter((_, i) => i !== index)
      );
    },
    [features, update]
  );

  return (
    <div className="p-6 space-y-6">
      {/* 1. 应用名称 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          1. 应用名称
        </label>
        <Input
          value={config.appName}
          onChange={(e) => update("appName", e.target.value)}
          placeholder="请输入应用名称"
          maxLength={20}
        />
      </div>

      {/* 2. 开发者公司名称 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          2. 开发者公司名称
        </label>
        <Input
          value={config.developer}
          onChange={(e) => update("developer", e.target.value)}
          placeholder="请输入开发者公司名称"
          maxLength={30}
        />
      </div>

      {/* 3. 应用版本 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          3. 应用版本
        </label>
        <Input
          value={config.version}
          onChange={(e) => update("version", e.target.value)}
          placeholder="如 1.0.0"
        />
      </div>

      {/* 4. 隐私协议 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          4. 隐私协议链接
        </label>
        <Input
          value={config.privacyUrl}
          onChange={(e) => update("privacyUrl", e.target.value)}
          placeholder="https://example.com/privacy"
        />
      </div>

      {/* 5. 权限列表 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          5. 权限列表链接
        </label>
        <Input
          value={config.permissionsUrl}
          onChange={(e) => update("permissionsUrl", e.target.value)}
          placeholder="https://example.com/permissions"
        />
      </div>

      {/* 6. 功能（仅 URL 输入） */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            6. 功能
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addFeature}
            className="h-7 px-2 text-xs text-blue-500 hover:text-blue-600"
          >
            <Plus className="w-3 h-3 mr-1" />
            添加
          </Button>
        </div>
        <div className="space-y-2">
          {features.map((url, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={url}
                onChange={(e) => updateFeatureUrl(index, e.target.value)}
                placeholder={`功能 ${index + 1} URL，如 https://example.com/feature/refund`}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeFeature(index)}
                className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {features.length === 0 && (
            <p className="text-xs text-gray-400 py-2">点击右上角"添加"新增功能 URL</p>
          )}
        </div>
      </div>

      {/* 附加：产品 LOGO */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          产品 LOGO URL（可选）
        </label>
        <Input
          value={config.logoUrl ?? ""}
          onChange={(e) => update("logoUrl", e.target.value || undefined)}
          placeholder="留空则显示应用名首字母"
        />
      </div>

      {/* 附加：下载链接 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          下载链接（点击下载按钮跳转）
        </label>
        <Input
          value={config.downloadUrl ?? ""}
          onChange={(e) => update("downloadUrl", e.target.value || undefined)}
          placeholder="https://example.com/download"
        />
      </div>

      {/* 附加：下载按钮文案 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          下载按钮文案
        </label>
        <Input
          value={config.downloadText ?? "立即下载"}
          onChange={(e) => update("downloadText", e.target.value)}
          placeholder="立即下载"
        />
      </div>

      {/* 附加：主色 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          主色（年龄 chip + 下载按钮）
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={config.primaryColor || "#00C06A"}
            onChange={(e) => update("primaryColor", e.target.value)}
            className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
          />
          <Input
            value={config.primaryColor ?? "#00C06A"}
            onChange={(e) => update("primaryColor", e.target.value)}
            placeholder="#00C06A"
            className="flex-1"
          />
        </div>
      </div>

      {/* 附加：适合年龄 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">适合年龄</label>
        <div className="flex flex-wrap gap-2">
          {AGE_RATINGS.map((age) => {
            const selected = (config.ageRating || "4+") === age;
            return (
              <button
                key={age}
                type="button"
                onClick={() => update("ageRating", age)}
                className={`h-8 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  selected
                    ? "border-transparent text-white"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
                style={selected ? { backgroundColor: config.primaryColor || "#00C06A" } : undefined}
              >
                {age}
              </button>
            );
          })}
        </div>
      </div>

      {/* 附加：备案（仅 URL） */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">备案</label>
        <Input
          value={config.icpRecord ?? ""}
          onChange={(e) => update("icpRecord", e.target.value || undefined)}
          placeholder="https://beian.miit.gov.cn/"
        />
      </div>
    </div>
  );
}

export default DownloadSixElementsTemplateConfigPanel;
