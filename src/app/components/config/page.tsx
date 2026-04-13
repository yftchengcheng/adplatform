"use client";

import React, { useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdTemplateConfig, AdTemplate } from "@/components/ad-template";
import { AdTemplateConfigPanel } from "@/components/ad-template-config";
import { useComponents } from "@/contexts/component-context";
import { useToast } from "@/components/ui/toast";
import { ComponentType } from "@/lib/component-types";

function ConfigContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") || "dual_button") as ComponentType;
  const { addComponent } = useComponents();
  const { showToast } = useToast();

  // 默认配置
  const defaultConfig: AdTemplateConfig = {
    title: "限时特惠活动",
    subtitle: "新用户首单立减50元，更有超值礼包等你来拿",
    button1: {
      text: "立即领取",
      action: "jump",
      landingPageMacro: "${landing_url}",
    },
    button2: {
      text: "查看详情",
      action: "show_image",
      imageMacro: "${image_url}",
      landingPageMacro: "${detail_url}",
    },
    action: "open",
    defaultLandingPageUrl: "",
    macroVariables: {
      image_url: "https://picsum.photos/472/164",
      landing_url: "https://example.com/claim",
      detail_url: "https://example.com/detail",
    },
  };

  // 使用 useState 初始化为空配置，避免 SSR/CSR 不一致
  const [config, setConfig] = useState<AdTemplateConfig>(defaultConfig);

  // 客户端挂载后从 sessionStorage 恢复配置
  React.useEffect(() => {
    const saved = sessionStorage.getItem("component_config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig(parsed);
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // 保存配置到 sessionStorage
  const handleConfigChange = useCallback((newConfig: AdTemplateConfig) => {
    setConfig(newConfig);
    sessionStorage.setItem("component_config", JSON.stringify(newConfig));
  }, []);

  // 清空 sessionStorage
  const clearSavedConfig = useCallback(() => {
    sessionStorage.removeItem("component_config");
  }, []);

  const handleSave = async () => {
    try {
      // 保存到全局状态（异步写入数据库）
      await addComponent({
        name: config.title || "未命名组件",
        category: "static",
        type: type,
        status: "enabled",
        config: config as unknown as Record<string, unknown>,
      });
      clearSavedConfig();
      showToast("组件保存成功！", "success");
      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      console.error("保存失败:", error);
      showToast("保存失败，请重试", "error");
    }
  };

  const handleBack = () => {
    router.push("/components/create");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">返回</span>
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">选择磁贴(双按钮)</h1>
              <p className="text-sm text-gray-500">配置组件内容和样式</p>
            </div>
            <Button variant="outline" onClick={handleBack}>
              取消
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600" onClick={handleSave}>
              保存
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium">
                1
              </div>
              <span className="text-gray-500">选择样式</span>
              <span className="text-gray-400 mx-1">/</span>
              <span className="text-blue-600 font-medium">选择磁贴(双按钮)</span>
            </div>
            <div className="flex-1 h-px bg-gray-200 max-w-[80px]" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-medium">
                2
              </div>
              <span className="text-blue-600 font-medium">填写内容</span>
            </div>
          </div>
        </div>

        {/* Content Grid - 左侧配置 + 右侧固定预览 */}
        <div className="flex gap-8">
          {/* Config Panel - 占据主要宽度 */}
          <div className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden min-h-[600px]">
            <AdTemplateConfigPanel
              config={config}
              onChange={handleConfigChange}
            />
          </div>

          {/* Preview Panel - 固定定位 */}
          <div className="w-96 flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* Preview Header */}
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
                  <span className="text-xs text-gray-400 ml-auto">随滚动固定</span>
                </h3>
              </div>

              {/* Mobile Simulator */}
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-6 flex items-center justify-center relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />

                {/* Phone frame */}
                <div className="relative z-10">
                  <div className="w-[280px] h-[520px] bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
                    <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
                      {/* Status bar */}
                      <div className="h-7 bg-white flex items-end justify-between px-5 pb-0.5">
                        <span className="text-[9px] font-medium text-gray-900">9:41</span>
                        <div className="flex items-center gap-0.5">
                          <div className="w-3 h-1.5 border border-gray-900 rounded-sm">
                            <div className="w-2 h-0.5 bg-gray-900 rounded-sm m-px" />
                          </div>
                        </div>
                      </div>

                      {/* App content */}
                      <div className="h-[calc(100%-28px)] overflow-auto">
                        <AdTemplate
                          config={config}
                          isOpen={true}
                          previewMode={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature highlights */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3 border border-gray-200">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
                    </svg>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-900">上文下按钮</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">主标题+副标题+双按钮</p>
                </div>

                <div className="bg-white rounded-xl p-3 border border-gray-200">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                    </svg>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-900">灵活跳转</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">落地页或图片展示</p>
                </div>

                <div className="bg-white rounded-xl p-3 border border-gray-200">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4z" />
                    </svg>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-900">样式定制</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">输入模式和宏替换</p>
                </div>

                <div className="bg-white rounded-xl p-3 border border-gray-200">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-900">APP适配</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">移动端原生体验</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ComponentConfigPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    }>
      <ConfigContent />
    </Suspense>
  );
}
