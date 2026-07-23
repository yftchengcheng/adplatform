"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Download,
  Package,
  X,
  ShieldCheck,
  KeyRound,
  Sparkles,
  Building2,
  ArrowLeft,
  ExternalLink,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

/**
 * DownloadSixElementsTemplate - 应用商店下载六要素
 *
 * 6 要素：
 *  1. 应用名称
 *  2. 开发者公司名称
 *  3. 应用版本
 *  4. 隐私协议 URL
 *  5. 权限列表 URL
 *  6. 功能 URL 列表（每个功能就是一个 URL）
 *
 * 附加：LOGO（可选）、下载按钮、适合年龄 chip、备案 URL
 *
 * 交互：
 *  - 主条平铺全部要素（不留折叠）
 *  - 点击 隐私/权限/备案/任一功能 → 在「内部浏览器视图」打开
 *  - 内部浏览器视图：顶部返回 + URL 标题 + iframe + 底部下载按钮
 *  - iframe 加载失败（X-Frame-Options 拒绝）时降级为「外链打开 + 返回」
 *
 * 视觉：
 *  - 顶部 1 行（LOGO + 名称 + 年龄 + 下载按钮）
 *  - 底部 1 行（功能 chip × N | 隐私 | 权限 | 备案）
 *  - 总高 ~110px，贴边窄条，不遮挡广告主体
 */

export interface DownloadSixElementsConfig {
  // 6 要素
  appName: string;
  developer: string;
  version: string;
  privacyUrl: string;
  permissionsUrl: string;
  features: string[];           // 6. 功能 URL 列表

  // 附加
  logoUrl?: string;
  downloadUrl?: string;
  downloadText?: string;
  primaryColor?: string;
  ageRating?: string;
  icpRecord?: string;           // 备案 URL

  // 系统
  componentName?: string;       // 组件名称（SDK 内部标识，不渲染到组件视觉）
  macroVariables?: Record<string, string>;
}

export const defaultDownloadSixElementsConfig: DownloadSixElementsConfig = {
  // —— 具体公司信息 ——
  appName: "铁路12306",
  developer: "中国铁道科学研究院集团有限公司",
  version: "5.7.0",
  // —— 6 要素 ——
  privacyUrl: "https://www.12306.cn/index/about/privacy/index.html",
  permissionsUrl: "https://www.12306.cn/index/about/permission/index.html",
  // —— 功能 URL（路径各异以产生有意义的 label）——
  features: [
    "https://www.12306.cn/index/",                                    // 首页 → 12306.cn
    "https://www.12306.cn/mormhweb/",                                 // 学生票 → 12306.cn（path 拼音）
    "https://www.12306.cn/index/about/help/index.html",               // 帮助中心 → "help"
    "https://www.12306.cn/动车票务",                                  // 动车票务（中文 path）
  ],
  // —— 附加 ——
  logoUrl: "",
  downloadUrl: "https://www.12306.cn/index/download.html",
  downloadText: "立即下载",
  primaryColor: "#00C06A",
  ageRating: "3+",
  icpRecord: "https://beian.miit.gov.cn/",
  componentName: "下载六要素-底部",
};

interface DownloadSixElementsTemplateProps {
  config?: Partial<DownloadSixElementsConfig>;
  previewMode?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * 从 URL 提取可读的展示文字
 *  - 优先用 URL 末段（去掉后缀）作为 chip 标签
 *  - 退化到 host
 *  - 都没有就用整段 URL
 */
function labelFromUrl(rawUrl: string): string {
  const url = (rawUrl || "").trim();
  if (!url) return "";
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    const parts = u.pathname.split("/").filter(Boolean);
    const last = (parts.pop() || "").replace(/\.(html?|php|aspx?|jsp)$/i, "");
    // 末段是纯英文字母 / 拼音（无中文）→ 视为不可读，fallback 到 host
    // 含中文 / 数字混合 / 短下划线连字符 → 保留
    if (last && !/[\u4e00-\u9fa5]/.test(last) && /^[a-z0-9_-]+$/i.test(last)) {
      // 末段是常见 index/about/init/login/help 等系统页 → 用 path 上一层
      const systemPages = ["index", "init", "default", "home", "list"];
      if (systemPages.includes(last.toLowerCase())) {
        const parent = parts.filter(Boolean).pop();
        if (parent) return `${parent}`;
      }
      return host;
    }
    return last || host;
  } catch {
    // 不是合法 URL，原样展示（截断）
    return url.length > 18 ? url.slice(0, 16) + "…" : url;
  }
}

export function DownloadSixElementsTemplate({
  config: rawConfig,
  previewMode = false,
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
    ageRating = "4+",
    icpRecord,
  } = config;

  const [pressed, setPressed] = useState(false);
  // 内部浏览器视图状态
  const [webView, setWebView] = useState<{ url: string; title: string } | null>(null);
  // 功能下拉菜单开关
  const [featureMenuOpen, setFeatureMenuOpen] = useState(false);
  // iframe 加载状态
  const [iframeError, setIframeError] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  // 进场动画：mounted = true 后从 translateY(100%) 滑入到 0
  const [mounted, setMounted] = useState(false);

  // 进场动画：下一帧触发上浮过渡
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  // 打开内部浏览器时重置错误
  useEffect(() => {
    if (webView) {
      setIframeError(false);
      setIframeLoading(true);
    }
  }, [webView]);

  // iframe 加载超时（5 秒）→ 强制显示 fallback
  useEffect(() => {
    if (!webView) return;
    const t = setTimeout(() => {
      setIframeLoading(false);
      setIframeError(true);
    }, 5000);
    return () => clearTimeout(t);
  }, [webView]);

  // ESC 键关闭 webview
  useEffect(() => {
    if (!webView) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setWebView(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [webView]);

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

  const openWebView = useCallback((url: string, title: string) => {
    const resolved = resolve(url);
    if (resolved && resolved.trim()) {
      setWebView({ url: resolved, title });
    }
  }, [resolve]);

  const closeWebView = useCallback(() => setWebView(null), []);

  const hasLogo = Boolean(logoUrl && logoUrl.trim());
  // 兼容旧数据 features: {text,url}[] / string[] / 缺失
  const validFeatures: string[] = (Array.isArray(features) ? features : [])
    .map((f: unknown) => {
      if (typeof f === "string") return f;
      if (f && typeof f === "object" && "url" in (f as Record<string, unknown>)) {
        return String((f as { url: unknown }).url ?? "");
      }
      return "";
    })
    .filter((u) => u && u.trim());

  return (
    <>
      <div
        data-d6e-root
        className={
          previewMode
            ? "w-full max-w-[420px] mx-auto bg-transparent absolute bottom-0 left-0 right-0 z-10"
            : "fixed bottom-0 left-0 right-0 z-50 bg-transparent pointer-events-none"
        }
        style={{
          transform: mounted ? "translateY(0)" : "translateY(100%)",
          opacity: mounted ? 1 : 0,
          transition:
            "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease-out",
        }}
      >
        <div className="w-full max-w-[420px] mx-auto pointer-events-auto overflow-hidden">
        {/* 顶部行: LOGO + (应用名称 + 公司·版本·年龄) + 下载按钮（核心信息），背景透明 */}
        <div data-d6e-top-row className="flex items-center gap-2.5 p-3 bg-transparent">
          {/* LOGO - 有/无 LOGO 自适应（容器固定 40x40） */}
          <div className="flex-shrink-0 relative w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center"
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
            {/* 年龄 chip 浮在 LOGO 右上角，不挤占 subline 空间 */}
            {ageRating && (
              <span
                data-d6e-age
                className="absolute -top-1 -right-1 px-1 h-[14px] inline-flex items-center rounded text-[8px] font-bold text-white shadow-md ring-1 ring-white"
                style={{ backgroundColor: primaryColor }}
              >
                {ageRating}
              </span>
            )}
          </div>

          {/* LOGO 右侧：应用名称（主），在 LOGO 右侧显示 */}
          <h2
            data-d6e-appname
            className="flex-1 min-w-0 text-[15px] font-semibold text-gray-900 truncate"
            title={resolve(appName)}
          >
            {resolve(appName)}
          </h2>

          {/* 下载按钮 - 主条核心 CTA */}
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
            data-d6e-download
          >
            <Download className="w-3 h-3" />
            {downloadText}
          </button>
        </div>

        {/* 独立 subline 行：公司 · 版本 · 年龄（全宽，完整展示不被挤压） */}
        <div
          data-d6e-subline
          className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent border-t border-gray-200/40 text-[10px] text-gray-500 min-w-0"
        >
          <span
            data-d6e-developer
            className="flex-1 min-w-0 truncate"
            title={resolve(developer)}
          >
            {resolve(developer)}
          </span>
          <span className="flex-shrink-0 text-gray-300">·</span>
          <span
            data-d6e-version
            className="flex-shrink-0"
          >
            v{resolve(version)}
          </span>
          {ageRating && (
            <>
              <span className="flex-shrink-0 text-gray-300">·</span>
              <span
                data-d6e-age
                className="px-1.5 h-[15px] inline-flex items-center rounded text-[9px] font-bold text-white flex-shrink-0 shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                {ageRating}
              </span>
            </>
          )}
        </div>

        {/* 链接条 */}

        {/* 底部链接条：所有要素平铺展示 - 功能 + 隐私 + 权限 + 备案 */}
        <div
          data-d6e-link-bar
          className="flex items-center flex-wrap gap-x-2.5 gap-y-1.5 px-3 py-2 bg-transparent border-t border-gray-200/40 text-[11px]"
        >
          {/* 功能 chips（全部展示，flex-wrap 自动换行） */}
          {validFeatures.length > 0 ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  // 和"权限"一致：1 个功能时单击直接打开内部浏览器；多个才开下拉
                  if (validFeatures.length === 1) {
                    const u = validFeatures[0];
                    const label = labelFromUrl(u);
                    openWebView(u, label || "功能");
                  } else {
                    setFeatureMenuOpen((v) => !v);
                  }
                }}
                className="inline-flex items-center gap-0.5 text-gray-600 hover:text-gray-900 transition-colors"
                data-d6e-feature-btn
              >
                <Sparkles className="w-2.5 h-2.5 flex-shrink-0" style={{ color: primaryColor }} />
                <span>功能</span>
                {validFeatures.length > 1 && <ChevronDown className="w-2.5 h-2.5 ml-0.5 opacity-60" />}
              </button>
              {featureMenuOpen && (
                <>
                  {/* 点击外部关闭 */}
                  <div
                    className="fixed inset-0 z-[110]"
                    onClick={() => setFeatureMenuOpen(false)}
                  />
                  <div
                    data-d6e-feature-menu
                    className="absolute left-0 bottom-full mb-1.5 min-w-[160px] max-w-[260px] bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[120]"
                  >
                    {validFeatures.map((u, i) => {
                      const label = labelFromUrl(u);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setFeatureMenuOpen(false);
                            openWebView(u, label || `功能 ${i + 1}`);
                          }}
                          className="w-full text-left px-3 py-1.5 text-[11px] text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
                          data-d6e-feature-item
                        >
                          <Sparkles className="w-2.5 h-2.5 flex-shrink-0" style={{ color: primaryColor }} />
                          <span className="truncate">{label || `功能 ${i + 1}`}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ) : (
            <span className="text-[10px] text-gray-300" data-d6e-feature-empty>暂无功能</span>
          )}

          {/* 分割 */}
          {validFeatures.length > 0 && (privacyUrl || permissionsUrl) && (
            <span className="text-gray-200">|</span>
          )}

          {/* 隐私协议 */}
          {privacyUrl && privacyUrl.trim() && (
            <button
              type="button"
              onClick={() => openWebView(privacyUrl, "隐私协议")}
              className="inline-flex items-center gap-0.5 text-gray-500 hover:text-gray-900 transition-colors"
              data-d6e-privacy
            >
              <ShieldCheck className="w-2.5 h-2.5" />
              隐私
            </button>
          )}

          {/* 权限列表 */}
          {permissionsUrl && permissionsUrl.trim() && (
            <>
              <span className="text-gray-200">|</span>
              <button
                type="button"
                onClick={() => openWebView(permissionsUrl, "权限列表")}
                className="inline-flex items-center gap-0.5 text-gray-500 hover:text-gray-900 transition-colors"
                data-d6e-permissions
              >
                <KeyRound className="w-2.5 h-2.5" />
                权限
              </button>
            </>
          )}

          {/* 备案 */}
          {icpRecord && icpRecord.trim() && (
            <>
              <span className="text-gray-200">|</span>
              <button
                type="button"
                onClick={() => openWebView(icpRecord, "备案信息")}
                className="inline-flex items-center gap-0.5 text-gray-400 hover:text-gray-700 transition-colors"
                data-d6e-icp
                title={icpRecord}
              >
                <Building2 className="w-2.5 h-2.5" />
                备案
              </button>
            </>
          )}
        </div>
        </div>
      </div>

      {/* 内部浏览器视图 Modal */}
      {webView && (
        <div
          data-d6e-webview
          className="fixed inset-0 z-[100] bg-white flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          {/* 顶部栏：返回 + 标题 + URL */}
          <div className="flex items-center gap-2 px-2 py-2 border-b border-gray-200 bg-white flex-shrink-0">
            <button
              type="button"
              onClick={closeWebView}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium"
              data-d6e-webview-back
            >
              <ArrowLeft className="w-4 h-4" />
              返回
            </button>
            <div className="flex-1 min-w-0 text-center">
              <p className="text-sm font-medium text-gray-900 truncate">{webView.title}</p>
              <p className="text-[10px] text-gray-400 truncate">{webView.url}</p>
            </div>
            <a
              href={webView.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 text-xs"
              title="在外部浏览器打开"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* iframe 主体（flex-1 占满剩余空间） */}
          <div className="flex-1 relative bg-gray-50">
            {/* 加载中（5 秒超时）→ 强制显示 fallback */}
            {iframeLoading && !iframeError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-gray-50">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-3" />
                <p className="text-sm text-gray-500">正在加载 {webView.title}...</p>
                <button
                  type="button"
                  onClick={closeWebView}
                  className="mt-4 px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-white"
                >
                  取消加载
                </button>
              </div>
            )}

            {!iframeError ? (
              <iframe
                src={webView.url}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                referrerPolicy="no-referrer"
                title={webView.title}
                onError={() => {
                  setIframeError(true);
                  setIframeLoading(false);
                }}
                onLoad={() => {
                  // 5 秒超时机制会自动切 fallback；onLoad 后短暂延迟清 loading
                  // 若页面视觉上有内容（通过 doc.body 检测），立即清 loading
                  // 否则保持 loading 状态直到 5s 超时强制 fallback
                  setTimeout(() => {
                    const iframe = document.querySelector('[data-d6e-iframe]') as HTMLIFrameElement | null;
                    try {
                      const doc = iframe?.contentDocument;
                      if (doc && doc.body && doc.body.children.length > 0) {
                        setIframeLoading(false);
                      }
                    } catch {
                      // 跨域读取被拒——可能是正常加载，保持 loading 直到超时
                    }
                  }, 800);
                }}
                data-d6e-iframe
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gray-50">
                <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-600 mb-1">该页面不允许嵌入预览</p>
                <p className="text-xs text-gray-400 mb-4">您可以在外部浏览器打开，或返回广告页面</p>
                <div className="flex gap-2">
                  <a
                    href={webView.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium"
                    style={{ backgroundColor: primaryColor }}
                  >
                    外部打开
                  </a>
                  <button
                    type="button"
                    onClick={closeWebView}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50"
                  >
                    返回
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 底部固定下载栏：居中下载按钮 */}
          <div className="flex-shrink-0 border-t border-gray-200 bg-white p-3 flex items-center justify-center">
            <button
              type="button"
              onClick={handleDownload}
              className="w-full max-w-md h-10 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
                boxShadow: `0 2px 8px ${primaryColor}40`,
              }}
              data-d6e-webview-download
            >
              <Download className="w-4 h-4" />
              {downloadText}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default DownloadSixElementsTemplate;
