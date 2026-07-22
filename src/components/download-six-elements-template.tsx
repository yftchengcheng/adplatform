"use client";

import { useState, useCallback } from "react";
import {
  Download,
  Package,
  X,
  ShieldCheck,
  KeyRound,
  Sparkles,
  Building2,
  Globe,
  Info,
} from "lucide-react";

/**
 * DownloadSixElementsTemplate - 应用商店下载六要素（Banner 风格）
 *
 * 仿应用商店详情页底部下载条，包含：
 *  1. 应用名称
 *  2. 开发者公司名称
 *  3. 应用版本
 *  4. 隐私协议超链
 *  5. 权限列表超链
 *  6. 产品功能（每条 = text + url）
 *
 * 附加：产品 LOGO（可选，无 URL 时显示占位图标）、下载按钮、适合年龄、备案信息
 *
 * 设计原则：
 *  - 贴边 Smart App Banner（核心 1 行 ~56px，6 要素收纳在 ⓘ 折叠面板）
 *  - 默认不展开时总体高度 60-80px，远小于屏幕高度，不遮挡广告主体
 *  - 横向布局：LOGO + 名称 + 年龄 + 详情按钮 + 下载按钮
 *  - 有/无 LOGO 自适应（无 LOGO 时显示 Package 占位图标，保持布局稳定）
 *  - 背景透明，内层毛玻璃白底
 *  - 6 要素点击 ⓘ 才展开，不影响主视觉
 */

export interface DownloadSixElementsFeature {
  text: string;
  url?: string;
}

export interface DownloadSixElementsConfig {
  // 6 要素
  appName: string;            // 1. 应用名称
  developer: string;          // 2. 开发者公司名称
  version: string;            // 3. 应用版本
  privacyUrl: string;         // 4. 隐私协议超链
  permissionsUrl: string;     // 5. 权限列表超链
  features: DownloadSixElementsFeature[];  // 6. 产品功能

  // 附加
  logoUrl?: string;           // 产品 LOGO（可选）
  downloadUrl?: string;       // 下载链接
  downloadText?: string;      // 下载按钮文案
  primaryColor?: string;      // 主色（默认 #00C06A）
  ageRating?: string;         // 适合年龄（3+ / 4+ / 8+ / 12+ / 16+ / 18+）
  icpRecord?: string;         // 备案信息（URL）

  // 系统
  macroVariables?: Record<string, string>;
}

export const defaultDownloadSixElementsConfig: DownloadSixElementsConfig = {
  appName: "智行火车票",
  developer: "北京铁路信息技术中心",
  version: "1.0.0",
  privacyUrl: "https://example.com/privacy",
  permissionsUrl: "https://example.com/permissions",
  features: [
    { text: "全国高铁、动车票务查询", url: "https://example.com/feature/ticket" },
    { text: "30 天内改签退票", url: "https://example.com/feature/refund" },
    { text: "多证件购票支持", url: "https://example.com/feature/id" },
    { text: "学生票资质核验", url: "https://example.com/feature/student" },
  ],
  logoUrl: "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=200&h=200&fit=crop",
  downloadUrl: "https://example.com/download",
  downloadText: "立即下载",
  primaryColor: "#00C06A",
  ageRating: "4+",
  icpRecord: "https://beian.miit.gov.cn/",
};

interface DownloadSixElementsTemplateProps {
  config?: Partial<DownloadSixElementsConfig>;
  previewMode?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export function DownloadSixElementsTemplate({
  config: rawConfig,
  previewMode = false,
  onClose,
}: DownloadSixElementsTemplateProps) {
  const config: DownloadSixElementsConfig = {
    ...defaultDownloadSixElementsConfig,
    ...rawConfig,
  };

  const {
    appName,
    developer,
    version,
    privacyUrl,
    permissionsUrl,
    features,
    logoUrl,
    downloadUrl,
    downloadText = "立即下载",
    primaryColor = "#00C06A",
    ageRating,
    icpRecord,
  } = config;

  const [pressed, setPressed] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  // 解析宏变量
  const resolve = (text: string): string => {
    if (!text || !config.macroVariables) return text;
    let r = text;
    Object.entries(config.macroVariables).forEach(([k, v]) => {
      r = r.replace(new RegExp(`\\$\\{${k}\\}`, "g"), v);
      r = r.replace(new RegExp(`$${k}`, "g"), v);
    });
    return r;
  };

  const handleDownload = useCallback(() => {
    if (previewMode) return;
    const url = resolve(downloadUrl || "");
    if (url) {
      try { window.open(url, "_blank"); } catch {}
    }
  }, [downloadUrl, previewMode]);

  const hasLogo = Boolean(logoUrl && logoUrl.trim());
  const hasFeatures = features && features.length > 0;

  return (
    <div className="w-full max-w-[420px] mx-auto">
      {/* 关闭按钮 - 仅 preview 模式 */}
      {previewMode && onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-30 w-6 h-6 flex items-center justify-center rounded-full hover:opacity-80 transition-opacity"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.25)" }}
          aria-label="关闭预览"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      )}

      {/* Smart App Banner 主体 - 总高 ~76px */}
      <div data-d6e-root className="relative bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-lg overflow-hidden">
        {/* 单行主条: LOGO + 名称 + 副标 + 年龄 + 详情按钮 + 下载 */}
        <div data-d6e-top-row className="flex items-center gap-2.5 p-2.5">
          {/* LOGO - 有/无 LOGO 自适应（容器固定 44x44） */}
          <div
            className="flex-shrink-0 w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center"
            style={{
              backgroundColor: hasLogo ? "transparent" : `${primaryColor}1A`,
            }}
          >
            {hasLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={appName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <Package className="w-5 h-5" style={{ color: primaryColor }} />
            )}
          </div>

          {/* 名称 + 副标 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-[13px] font-semibold text-gray-900 truncate">
                {resolve(appName)}
              </h2>
              {ageRating && (
                <span
                  className="px-1 h-[15px] inline-flex items-center rounded text-[9px] font-semibold text-white flex-shrink-0"
                  style={{ backgroundColor: primaryColor }}
                >
                  {ageRating}
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-500 truncate mt-0.5">
              {resolve(developer) || "—"}
              {version ? ` · v${resolve(version)}` : ""}
            </p>
          </div>

          {/* ⓘ 详情按钮（点击展开 6 要素面板） */}
          <button
            type="button"
            onClick={() => setDetailOpen((v) => !v)}
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="查看下载六要素"
            aria-expanded={detailOpen}
            data-d6e-toggle
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          {/* 下载按钮 */}
          <button
            type="button"
            onClick={handleDownload}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            onMouseLeave={() => setPressed(false)}
            className="flex-shrink-0 h-7 px-3 rounded-lg text-white text-xs font-semibold flex items-center gap-1 transition-transform"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
              boxShadow: `0 2px 6px ${primaryColor}40`,
              transform: pressed ? "scale(0.96)" : "scale(1)",
            }}
          >
            <Download className="w-3 h-3" />
            {downloadText}
          </button>
        </div>

        {/* 6 要素详情面板 - 默认折叠，展开后高度自适应 */}
        {detailOpen && (
          <div
            data-d6e-detail
            className="border-t border-gray-100 bg-gray-50/60 px-3 py-2.5 space-y-1.5"
          >
            {/* 产品功能 - 链接 chip 列表 */}
            {hasFeatures && (
              <div className="flex items-start gap-1.5">
                <Sparkles
                  className="w-3 h-3 mt-0.5 flex-shrink-0"
                  style={{ color: primaryColor }}
                />
                <div className="flex flex-wrap gap-x-2 gap-y-1 flex-1 min-w-0">
                  {features.slice(0, 4).map((f, i) => {
                    const hasUrl = Boolean(f.url && f.url.trim());
                    const text = (
                      <span className="inline-flex items-center gap-0.5">
                        <span className="truncate max-w-[160px]">
                          {resolve(f.text)}
                        </span>
                      </span>
                    );
                    if (hasUrl && !previewMode) {
                      return (
                        <a
                          key={i}
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-gray-600 hover:text-gray-900 hover:underline"
                        >
                          {text}
                        </a>
                      );
                    }
                    return (
                      <span
                        key={i}
                        className="text-[10px] text-gray-600"
                      >
                        {text}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 隐私协议 / 权限列表 / 备案 - 单行链接条 */}
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-[10px] text-gray-500">
              {privacyUrl && (
                <a
                  href={privacyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 hover:text-gray-900 transition-colors"
                >
                  <ShieldCheck className="w-2.5 h-2.5" />
                  隐私协议
                </a>
              )}
              {permissionsUrl && (
                <>
                  <span className="text-gray-300">|</span>
                  <a
                    href={permissionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 hover:text-gray-900 transition-colors"
                  >
                    <KeyRound className="w-2.5 h-2.5" />
                    权限列表
                  </a>
                </>
              )}
              {icpRecord && icpRecord.trim() && (
                <>
                  <span className="text-gray-300">|</span>
                  <a
                    href={icpRecord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-gray-400 hover:text-gray-700 transition-colors truncate max-w-[140px]"
                    title={icpRecord}
                  >
                    <Building2 className="w-2.5 h-2.5" />
                    备案
                  </a>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* preview 模式下提示水印 - 6 要素在小卡片里以平铺 chip 形式展示（不点开也能看到） */}
      {previewMode && !detailOpen && hasFeatures && (
        <div
          data-d6e-feature-strip
          className="mt-1.5 px-3 py-1 flex items-center gap-1.5 text-[10px] text-gray-500 overflow-hidden"
        >
          <Globe className="w-2.5 h-2.5 flex-shrink-0" />
          <span className="truncate">
            {features
              .slice(0, 3)
              .map((f) => resolve(f.text))
              .filter(Boolean)
              .join(" · ")}
          </span>
        </div>
      )}
    </div>
  );
}

export default DownloadSixElementsTemplate;
