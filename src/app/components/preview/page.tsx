"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdTemplate, AdTemplateConfig } from "@/components/ad-template";

function PreviewContent() {
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<AdTemplateConfig | null>(null);
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    const configParam = searchParams.get("config");
    if (configParam) {
      try {
        const decoded = decodeURIComponent(atob(configParam));
        setConfig(JSON.parse(decoded));
      } catch (e) {
        console.error("配置解析失败", e);
      }
    }
  }, [searchParams]);

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">加载配置中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/components/create">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                返回
              </Button>
            </Link>
            <h1 className="text-base font-semibold text-gray-900">组件预览</h1>
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <Home className="w-4 h-4" />
                列表
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Phone Frame */}
      <div className="flex items-center justify-center py-8">
        <div className="w-[375px] h-[700px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
          <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative flex flex-col">
            {/* Status bar */}
            <div className="h-10 bg-white flex items-end justify-between px-6 pb-1">
              <span className="text-[11px] font-medium text-gray-900">9:41</span>
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5">
                  <div className="w-1 h-1.5 bg-gray-900 rounded-full" />
                  <div className="w-1 h-1.5 bg-gray-900 rounded-full" />
                  <div className="w-1 h-1.5 bg-gray-900 rounded-full" />
                  <div className="w-1 h-1.5 bg-gray-900 rounded-full" />
                </div>
                <div className="w-5 h-2.5 border border-gray-900 rounded-sm ml-1">
                  <div className="w-[60%] h-full bg-gray-900 rounded-sm" />
                </div>
              </div>
            </div>

            {/* App content */}
            <div className="flex-1 bg-gradient-to-b from-blue-50 to-indigo-100 overflow-auto">
              {!showAd ? (
                <div className="h-full flex flex-col items-center justify-center p-6">
                  <div className="text-center">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">
                      组件效果预览
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">
                      点击下方按钮预览广告弹窗
                    </p>
                    <Button
                      onClick={() => setShowAd(true)}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      预览广告弹窗
                    </Button>
                  </div>
                </div>
              ) : (
                <AdTemplate
                  config={config}
                  isOpen={showAd}
                  onClose={() => setShowAd(false)}
                  previewMode={false}
                />
              )}
            </div>

            {/* Home indicator */}
            <div className="h-8 bg-white flex items-center justify-center">
              <div className="w-32 h-1 bg-gray-300 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="max-w-lg mx-auto px-4 pb-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">预览说明</h3>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>点击「预览广告弹窗」按钮查看组件效果</li>
            <li>点击弹窗中的按钮可跳转链接或显示图片</li>
            <li>点击弹窗外部可关闭弹窗</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function ComponentPreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    }>
      <PreviewContent />
    </Suspense>
  );
}
