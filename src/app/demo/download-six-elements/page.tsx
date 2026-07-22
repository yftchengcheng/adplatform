"use client";

import { useState } from "react";
import { DownloadSixElementsTemplate, type DownloadSixElementsConfig } from "@/components/download-six-elements-template";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings2, Trash2, Plus } from "lucide-react";

export default function DownloadSixElementsDemoPage() {
  // 默认数据：仿应用商店下载页
  const [config, setConfig] = useState<DownloadSixElementsConfig>({
    appName: "智行火车票",
    developer: "北京智行科技有限公司",
    version: "8.6.2",
    privacyUrl: "https://example.com/privacy",
    permissionsUrl: "https://example.com/permissions",
    features: [
      { text: "全国高铁、动车、普速列车余票实时查询", url: "https://example.com/feature/ticket" },
      { text: "在线选座、改签、退票一键办理", url: "https://example.com/feature/refund" },
      { text: "智能中转方案推荐，复杂行程省心", url: "https://example.com/feature/transfer" },
      { text: "支持微信/支付宝快捷支付，自动出票", url: "https://example.com/feature/pay" },
    ],
    logoUrl: "",
    downloadUrl: "https://example.com/download",
    downloadText: "立即下载",
    primaryColor: "#00C06A",
    ageRating: "4+",
    icpRecord: "https://beian.miit.gov.cn/",
  });

  const updateField = <K extends keyof DownloadSixElementsConfig>(
    key: K,
    value: DownloadSixElementsConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const addFeature = () => {
    setConfig((prev) => ({
      ...prev,
      features: [
        ...(prev.features || []),
        { id: `feat-${Date.now()}-${(prev.features || []).length}`, text: `新功能 ${(prev.features || []).length + 1}`, url: "" },
      ],
    }));
  };

  const removeFeature = (idx: number) => {
    setConfig((prev) => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* 顶部说明 */}
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          下载六要素组件
        </h1>
        <p className="text-sm text-gray-500">
          仿应用商店下载落地页 · 6 要素 + LOGO + 下载按钮 · 透明背景
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：预览 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              实时预览
            </h2>
            <span className="text-xs text-gray-400">背景透明 · 容器白底</span>
          </div>

          {/* 模拟手机落地页背景：渐变色 */}
          <div
            className="rounded-2xl p-6"
            style={{
              background:
                "linear-gradient(135deg, #FFE9D6 0%, #FFD1B0 40%, #FFB890 100%)",
              minHeight: 280,
            }}
          >
            <DownloadSixElementsTemplate
              config={config}
              previewMode={true}
              isOpen={true}
            />
          </div>

          <p className="text-xs text-gray-400 mt-3 text-center">
            落地页实际场景：背景可换任意色或图片，组件保持透明
          </p>
        </div>

        {/* 右侧：配置面板 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
            <Settings2 className="w-4 h-4" />
            配置面板
          </h2>

          {/* 应用名称 */}
          <div>
            <Label className="text-xs text-gray-600">1. 应用名称</Label>
            <Input
              value={config.appName}
              onChange={(e) => updateField("appName", e.target.value)}
              placeholder="请输入应用名称"
              maxLength={20}
              className="mt-1.5"
            />
          </div>

          {/* 开发者公司 */}
          <div>
            <Label className="text-xs text-gray-600">2. 开发者公司名称</Label>
            <Input
              value={config.developer}
              onChange={(e) => updateField("developer", e.target.value)}
              placeholder="请输入公司名称"
              className="mt-1.5"
            />
          </div>

          {/* 应用版本 */}
          <div>
            <Label className="text-xs text-gray-600">3. 应用版本</Label>
            <Input
              value={config.version}
              onChange={(e) => updateField("version", e.target.value)}
              placeholder="例如 1.0.0"
              className="mt-1.5"
            />
          </div>

          {/* 适合年龄 */}
          <div>
            <Label className="text-xs text-gray-600">适合年龄（应用名称旁 chip）</Label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {["3+", "4+", "8+", "12+", "16+", "18+"].map((age) => (
                <button
                  key={age}
                  onClick={() => updateField("ageRating", age)}
                  className={`h-7 px-2.5 rounded-lg text-xs font-medium transition-all ${
                    (config.ageRating || "4+") === age
                      ? "text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  style={
                    (config.ageRating || "4+") === age
                      ? { backgroundColor: config.primaryColor || "#00C06A" }
                      : undefined
                  }
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          {/* 隐私协议链接 */}
          <div>
            <Label className="text-xs text-gray-600">4. 隐私协议超链</Label>
            <Input
              value={config.privacyUrl}
              onChange={(e) => updateField("privacyUrl", e.target.value)}
              placeholder="https://example.com/privacy"
              className="mt-1.5"
            />
          </div>

          {/* 权限列表链接 */}
          <div>
            <Label className="text-xs text-gray-600">5. 权限列表超链</Label>
            <Input
              value={config.permissionsUrl}
              onChange={(e) => updateField("permissionsUrl", e.target.value)}
              placeholder="https://example.com/permissions"
              className="mt-1.5"
            />
          </div>

          {/* 产品功能（多条） */}
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-gray-600">6. 产品功能（多条）</Label>
              <button
                onClick={addFeature}
                className="h-6 px-2 rounded text-[11px] text-blue-500 hover:text-blue-600 hover:bg-blue-50 flex items-center gap-0.5"
                aria-label="添加功能"
              >
                <Plus className="w-3 h-3" />
                添加
              </button>
            </div>
            <div className="mt-1.5 space-y-1.5">
              {(config.features || []).map((f, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <Input
                    value={f.text}
                    onChange={(e) => {
                      const next = [...(config.features || [])];
                      next[i] = { ...next[i], text: e.target.value };
                      setConfig((prev) => ({ ...prev, features: next }));
                    }}
                    placeholder={`功能 ${i + 1} 名称`}
                    maxLength={30}
                    className="h-8 text-xs flex-1"
                  />
                  <Input
                    value={f.url}
                    onChange={(e) => {
                      const next = [...(config.features || [])];
                      next[i] = { ...next[i], url: e.target.value };
                      setConfig((prev) => ({ ...prev, features: next }));
                    }}
                    placeholder="功能链接（可选）"
                    className="h-8 text-xs flex-1"
                  />
                  <button
                    onClick={() => removeFeature(i)}
                    className="w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded flex-shrink-0"
                    aria-label="删除该功能"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 高级配置 */}
          <div className="pt-2 border-t border-gray-100">
            <h3 className="text-xs font-medium text-gray-500 mb-2">
              附加配置
            </h3>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-gray-600">产品 LOGO URL</Label>
                <Input
                  value={config.logoUrl || ""}
                  onChange={(e) => updateField("logoUrl", e.target.value)}
                  placeholder="留空则显示首字母占位"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">下载按钮文案</Label>
                <Input
                  value={config.downloadText || ""}
                  onChange={(e) => updateField("downloadText", e.target.value)}
                  placeholder="立即下载"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">下载链接</Label>
                <Input
                  value={config.downloadUrl || ""}
                  onChange={(e) => updateField("downloadUrl", e.target.value)}
                  placeholder="https://example.com/download"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">备案信息（底部 ICP）</Label>
                <Input
                  value={config.icpRecord || ""}
                  onChange={(e) => updateField("icpRecord", e.target.value)}
                  placeholder="如 京ICP备12345678号-1（留空不展示）"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">主色</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <input
                    type="color"
                    value={config.primaryColor || "#00C06A"}
                    onChange={(e) => updateField("primaryColor", e.target.value)}
                    className="w-10 h-9 rounded-lg border border-gray-200 cursor-pointer"
                  />
                  <Input
                    value={config.primaryColor || ""}
                    onChange={(e) => updateField("primaryColor", e.target.value)}
                    placeholder="#00C06A"
                    className="flex-1"
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
