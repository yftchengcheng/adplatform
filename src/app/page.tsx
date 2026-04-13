"use client";

import { useState } from "react";
import { AdTemplateConfig, AdTemplate } from "@/components/ad-template";
import { AdTemplateConfigPanel } from "@/components/ad-template-config";

// Default configuration
const defaultConfig: AdTemplateConfig = {
  title: "限时特惠活动",
  subtitle: "新用户首单立减50元，更有超值礼包等你来拿",
  button1: {
    text: "立即领取",
    action: "jump",
    landingPageUrl: "https://example.com/claim",
  },
  button2: {
    text: "查看详情",
    action: "show_image",
    imageUrl: "",
    resultText: "",
    buttonClickText: "",
  },
  action: "open",
  defaultLandingPageUrl: "https://example.com/default",
};

export default function Home() {
  const [config, setConfig] = useState<AdTemplateConfig>(defaultConfig);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                选择磁贴（双按钮式）
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                APP端广告模板组件 · 上文下按钮结构
              </p>
            </div>
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/25"
            >
              预览效果
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Config Panel */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-[calc(100vh-200px)] min-h-[600px]">
            <AdTemplateConfigPanel
              config={config}
              onChange={setConfig}
              onPreview={() => setIsPreviewOpen(true)}
            />
          </div>

          {/* Preview Panel */}
          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                效果预览
              </h3>
            </div>

            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 flex items-center justify-center min-h-[500px] relative overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />

              {/* Mobile frame */}
              <div className="relative z-10">
                <div className="w-[320px] h-[580px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                    {/* Status bar */}
                    <div className="h-8 bg-white flex items-end justify-between px-6 pb-1">
                      <span className="text-[10px] font-medium text-gray-900">9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-2 border border-gray-900 rounded-sm">
                          <div className="w-3/4 h-full bg-gray-900 rounded-sm" />
                        </div>
                      </div>
                    </div>

                    {/* App content */}
                    <div className="h-[calc(100%-32px)] bg-gradient-to-b from-blue-50 to-indigo-100 overflow-auto">
                      {/* Simulated app content */}
                      <div className="p-4 space-y-4">
                        <div className="h-32 bg-white/50 rounded-xl" />
                        <div className="h-24 bg-white/50 rounded-xl" />
                      </div>

                      {/* Ad Template */}
                      <AdTemplate
                        config={config}
                        isOpen={true}
                        onClose={() => setIsPreviewOpen(false)}
                        previewMode={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-gray-900">上文下按钮</h4>
                <p className="text-xs text-gray-500 mt-1">主标题 + 副标题 + 双按钮结构</p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-gray-900">灵活跳转</h4>
                <p className="text-xs text-gray-500 mt-1">支持落地页或图片展示</p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-gray-900">样式定制</h4>
                <p className="text-xs text-gray-500 mt-1">支持输入模式和宏替换</p>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-gray-900">APP适配</h4>
                <p className="text-xs text-gray-500 mt-1">移动端原生弹窗体验</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Full screen preview modal */}
      {isPreviewOpen && (
        <AdTemplate
          config={config}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
}
