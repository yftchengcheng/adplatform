"use client";

import { useState, useCallback } from "react";
import { Check, Download, Shield } from "lucide-react";

/**
 * DownloadSixElementsTemplate - 应用商店下载六要素
 *
 * 仿应用商店下载落地页结构，包含：
 *  1. 应用名称
 *  2. 开发者公司名称
 *  3. 应用版本
 *  4. 隐私协议超链
 *  5. 权限列表超链
 *  6. 产品功能（多条）
 *
 * 附加：产品 LOGO + 主下载按钮 + 适合年龄 + 备案信息
 * 背景：透明（与落地页背景融合）
 */

export interface DownloadSixElementsConfig {
  appName: string;              // 应用名称
  developer: string;            // 开发者公司名称
  version: string;              // 应用版本
  privacyUrl: string;           // 隐私协议超链
  permissionsUrl: string;       // 权限列表超链
  features: string[];           // 产品功能（多条，建议 3-5 条）
  logoUrl?: string;             // 产品 LOGO（可缺省，默认用首字母占位）
  downloadUrl?: string;         // 下载按钮跳转链接
  downloadText?: string;        // 下载按钮文案（默认"立即下载"）
  primaryColor?: string;        // 主色（默认绿色 #00C06A，模拟应用商店 CTA）
  ageRating?: string;           // 适合年龄（如 "3+"/"8+"/"12+"/"16+"/"18+"），默认 "4+"
  icpRecord?: string;           // 备案信息（如 "京ICP备12345678号-1"）
}

export interface DownloadSixElementsTemplateProps {
  config: DownloadSixElementsConfig;
  previewMode?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export function DownloadSixElementsTemplate({
  config,
  previewMode = false,
  isOpen = true,
  onClose,
}: DownloadSixElementsTemplateProps) {
  const [showAdLabel, setShowAdLabel] = useState(true);

  const handleDownload = useCallback(() => {
    if (config.downloadUrl) {
      window.open(config.downloadUrl, "_blank", "noopener,noreferrer");
    }
  }, [config.downloadUrl]);

  const handlePrivacy = useCallback(
    (e: React.MouseEvent) => {
      if (previewMode) {
        e.preventDefault();
        return;
      }
      if (config.privacyUrl) {
        window.open(config.privacyUrl, "_blank", "noopener,noreferrer");
      }
    },
    [config.privacyUrl, previewMode]
  );

  const handlePermissions = useCallback(
    (e: React.MouseEvent) => {
      if (previewMode) {
        e.preventDefault();
        return;
      }
      if (config.permissionsUrl) {
        window.open(config.permissionsUrl, "_blank", "noopener,noreferrer");
      }
    },
    [config.permissionsUrl, previewMode]
  );

  if (!isOpen) return null;

  const {
    appName,
    developer,
    version,
    features,
    logoUrl,
    downloadText = "立即下载",
    primaryColor = "#00C06A",
    ageRating = "4+",
    icpRecord,
  } = config;

  return (
    <div
      className="relative w-full max-w-[420px] mx-auto"
      style={{ backgroundColor: "transparent" }}
    >
      {/* 关闭按钮（预览模式/全屏模式显示） */}
      {(previewMode || onClose) && (
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-30 w-7 h-7 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
          aria-label="关闭"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {/* 顶部 LOGO + 应用名称 */}
      <div className="flex items-center gap-4 px-4 pt-5 pb-4">
        {/* LOGO 容器：64×64 圆角 */}
        <div
          className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden"
          style={{
            backgroundColor: logoUrl ? "transparent" : `${primaryColor}1A`,
            border: logoUrl ? "1px solid rgba(0,0,0,0.05)" : "none",
          }}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={`${appName} logo`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span
              className="text-2xl font-semibold"
              style={{ color: primaryColor }}
            >
              {appName?.charAt(0) || "A"}
            </span>
          )}
        </div>

        {/* 应用名称 + 年龄 + 副标识 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-gray-900 truncate">
              {appName || "应用名称"}
            </h2>
            {/* 适合年龄 chip */}
            {ageRating && (
              <span
                className="flex-shrink-0 px-1.5 h-4 inline-flex items-center justify-center rounded text-[10px] font-semibold text-white"
                style={{ backgroundColor: primaryColor }}
              >
                {ageRating}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">应用下载</span>
            <span className="w-1 h-1 rounded-full bg-gray-300" />
            <span className="text-xs text-gray-500">官方正版</span>
          </div>
        </div>
      </div>

      {/* 分割线 */}
      <div className="h-px bg-gray-100 mx-4" />

      {/* 产品功能列表（六要素 #6） */}
      <div className="px-4 py-3 space-y-2.5">
        {features && features.length > 0 ? (
          features.slice(0, 6).map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2.5">
              <div
                className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5"
                style={{ backgroundColor: `${primaryColor}1A` }}
              >
                <Check
                  className="w-2.5 h-2.5"
                  style={{ color: primaryColor }}
                  strokeWidth={3}
                />
              </div>
              <span className="text-sm text-gray-700 leading-relaxed flex-1">
                {feature}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">暂无功能介绍</p>
        )}
      </div>

      {/* 分割线 */}
      <div className="h-px bg-gray-100 mx-4" />

      {/* 下载按钮 */}
      <div className="px-4 py-4">
        <button
          onClick={handleDownload}
          disabled={!config.downloadUrl && !previewMode}
          className="w-full h-12 rounded-xl text-white text-base font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}E6 100%)`,
            boxShadow: `0 4px 12px ${primaryColor}40, inset 0 1px 0 rgba(255,255,255,0.2)`,
          }}
        >
          <Download className="w-4 h-4" strokeWidth={2.5} />
          {downloadText}
        </button>

        {/* 安全提示（贴近应用商店规范） */}
        <div className="flex items-center justify-center gap-1.5 mt-2.5">
          <Shield className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-400">
            已通过安全检测 · 无病毒 · 无广告
          </span>
        </div>
      </div>

      {/* 底部开发者信息 + 超链（六要素 #1-5） */}
      <div className="px-4 pb-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-2">
          <span className="truncate max-w-[180px]">{developer || "开发者公司"}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="text-gray-400">v{version || "1.0.0"}</span>
        </div>
        <div className="flex items-center justify-center gap-4 text-xs">
          <button
            onClick={handlePrivacy}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            隐私协议
          </button>
          <span className="w-px h-3 bg-gray-200" />
          <button
            onClick={handlePermissions}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            权限列表
          </button>
        </div>
        {/* 备案信息（最底部） */}
        {icpRecord && (
          <div className="mt-2 text-center">
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => previewMode && e.preventDefault()}
              className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              {icpRecord}
            </a>
          </div>
        )}
      </div>

      {/* 广告标识（点击收起/展开） - 仿应用商店顶栏 */}
      {showAdLabel && !previewMode && (
        <div className="absolute -top-9 left-0 right-0 flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-medium text-white"
              style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
            >
              广告
            </span>
            <span className="text-[10px] text-gray-600">|</span>
            <button className="text-[10px] text-gray-600 hover:text-gray-800">
              反馈
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-600">
              28<span className="ml-0.5">秒后可领奖励</span>
            </span>
            <button
              onClick={() => setShowAdLabel(false)}
              className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-black/5"
              aria-label="关闭广告标识"
            >
              <svg
                className="w-2.5 h-2.5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DownloadSixElementsTemplate;
