"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SDKTemplateStyleCard } from "@/components/sdk-templates-showcase";

export default function SDKPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Ad Platform</h1>
                <p className="text-xs text-gray-500">广告组件管理系统</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
              <Link href="/">
                <button
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-colors text-gray-600 hover:bg-white hover:shadow-sm"
                >
                  模板组件
                </button>
              </Link>
              <button
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-blue-50 text-blue-600 shadow-sm"
              >
                SDK模板
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* SDK模板样式入口 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">SDK模板样式</h2>
              <p className="text-white/80 text-sm">查看7种SDK标准模板的设计规范和视觉样式</p>
            </div>
            <button
              onClick={() => router.push("/sdk/templates")}
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              查看样式规范
            </button>
          </div>
        </div>

        {/* 搜索栏 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="搜索标准模板..."
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 标准模板 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">标准模板</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* 静态开屏 */}
            <div 
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => router.push("/sdk/static_splash")}
            >
              <div className="w-full h-40 flex items-center justify-center mb-3 overflow-hidden">
                <SDKTemplateStyleCard type="static_splash" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">静态开屏</h4>
              <p className="text-xs text-gray-500">静态图片展示，应用启动时展示品牌广告</p>
            </div>

            {/* 视频开屏 */}
            <div 
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => router.push("/sdk/video_splash")}
            >
              <div className="w-full h-40 flex items-center justify-center mb-3 overflow-hidden">
                <SDKTemplateStyleCard type="video_splash" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">视频开屏</h4>
              <p className="text-xs text-gray-500">视频素材播放，应用启动时自动播放</p>
            </div>

            {/* 插屏-半屏 */}
            <div 
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => router.push("/sdk/interstitial_half")}
            >
              <div className="w-full h-40 flex items-center justify-center mb-3 overflow-hidden">
                <SDKTemplateStyleCard type="interstitial_half" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">插屏-半屏</h4>
              <p className="text-xs text-gray-500">半屏展示，覆盖部分屏幕，不影响主流程</p>
            </div>

            {/* 插屏-全屏 */}
            <div 
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => router.push("/sdk/interstitial_full")}
            >
              <div className="w-full h-40 flex items-center justify-center mb-3 overflow-hidden">
                <SDKTemplateStyleCard type="interstitial_full" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">插屏-全屏</h4>
              <p className="text-xs text-gray-500">全屏展示，强制用户观看广告</p>
            </div>

            {/* 横幅 */}
            <div 
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => router.push("/sdk/banner")}
            >
              <div className="w-full h-40 flex items-center justify-center mb-3 overflow-hidden">
                <SDKTemplateStyleCard type="banner" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">横幅</h4>
              <p className="text-xs text-gray-500">顶部或底部横幅，持续展示品牌信息</p>
            </div>

            {/* 原生（信息流） */}
            <div 
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => router.push("/sdk/native")}
            >
              <div className="w-full h-40 flex items-center justify-center mb-3 overflow-hidden">
                <SDKTemplateStyleCard type="native" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">原生（信息流）</h4>
              <p className="text-xs text-gray-500">融入内容的原生广告，不打断用户体验</p>
            </div>

            {/* 激励视频 */}
            <div 
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => router.push("/sdk/rewarded_video")}
            >
              <div className="w-full h-40 flex items-center justify-center mb-3 overflow-hidden">
                <SDKTemplateStyleCard type="rewarded_video" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">激励视频</h4>
              <p className="text-xs text-gray-500">用户主动观看，获取对应奖励</p>
            </div>
          </div>
        </div>

        {/* SDK下载 */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">SDK下载</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-sm">JS</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">JavaScript SDK</h4>
                  <p className="text-xs text-gray-500">Web应用</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">支持React、Vue等主流框架，快速集成广告组件</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">iOS</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">iOS SDK</h4>
                  <p className="text-xs text-gray-500">原生应用</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">支持Swift和Objective-C，适配iPhone和iPad设备</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">A</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Android SDK</h4>
                  <p className="text-xs text-gray-500">原生应用</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">支持Java和Kotlin，兼容各类Android设备</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
