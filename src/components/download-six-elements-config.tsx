"use client";

/**
 * 下载六要素 — 配置面板
 * 最简版：扁平 Input 列表 + 增删功能条目
 * 后续可升级为 SectionCollapse 折叠分组
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

export function DownloadSixElementsTemplateConfigPanel({
  config,
  onChange,
  onSave,
  onCancel,
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

  // 防御性兜底：从 sessionStorage / Supabase 恢复的旧 config 可能缺少 features 字段
  const features = config.features ?? [];

  const updateFeatureText = useCallback(
    (index: number, text: string) => {
      const next = [...features];
      const current = next[index];
      next[index] = typeof current === "string"
        ? { text: current, url: "" }
        : { text, url: current.url };
      update("features", next);
    },
    [features, update]
  );

  const updateFeatureUrl = useCallback(
    (index: number, url: string) => {
      const next = [...features];
      const current = next[index];
      next[index] = typeof current === "string"
        ? { text: current, url }
        : { text: current.text, url };
      update("features", next);
    },
    [features, update]
  );

  const addFeature = useCallback(() => {
    update("features", [...features, { text: "", url: "" }]);
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

      {/* 6. 产品功能 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            6. 产品功能
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
          {features.map((feature, index) => {
            const f = typeof feature === "string" ? { text: feature, url: "" } : feature;
            return (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={f.text}
                  onChange={(e) => updateFeatureText(index, e.target.value)}
                  placeholder={`功能 ${index + 1}`}
                  maxLength={30}
                  className="flex-1"
                />
                <Input
                  value={f.url}
                  onChange={(e) => updateFeatureUrl(index, e.target.value)}
                  placeholder="https://..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFeature(index)}
                  className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            );
          })}
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

      {/* 附加：下载按钮 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          下载链接
        </label>
        <Input
          value={config.downloadUrl ?? ""}
          onChange={(e) => update("downloadUrl", e.target.value || undefined)}
          placeholder="https://example.com/download"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          下载按钮文案
        </label>
        <Input
          value={config.downloadText ?? "立即下载"}
          onChange={(e) => update("downloadText", e.target.value)}
          placeholder="立即下载"
          maxLength={8}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          主色（按钮/年龄 chip 颜色）
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={config.primaryColor ?? "#00C06A"}
            onChange={(e) => update("primaryColor", e.target.value)}
            className="w-10 h-9 rounded border border-gray-200 cursor-pointer"
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
        <label className="text-sm font-medium text-gray-700">
          适合年龄
        </label>
        <div className="flex flex-wrap gap-2">
          {AGE_RATINGS.map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => update("ageRating", rating)}
              className={`px-3 h-8 text-xs rounded-lg border transition-colors ${
                config.ageRating === rating
                  ? "border-blue-500 bg-blue-50 text-blue-600"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {rating}
            </button>
          ))}
        </div>
      </div>

      {/* 附加：备案信息 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          备案信息（可选）
        </label>
        <Input
          value={config.icpRecord ?? ""}
          onChange={(e) => update("icpRecord", e.target.value || undefined)}
          placeholder="如 京ICP备12345678号-1"
          maxLength={40}
        />
        <p className="text-xs text-gray-400">
          留空则不展示。建议填写完整的 ICP 备案号。
        </p>
      </div>

      {/* Footer */}
      {(onSave || onCancel) && (
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              取消
            </Button>
          )}
          {onSave && (
            <Button onClick={onSave} className="bg-blue-500 hover:bg-blue-600">
              保存
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
