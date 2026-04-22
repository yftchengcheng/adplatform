"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Search, 
  Eye, 
  Copy, 
  Trash2, 
  Edit, 
  Play, 
  Pause
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RealAdPreview } from "./real-ad-preview";

// SDK模板类型
type SDKTemplateType = 
  | "static_splash"      // 静态开屏
  | "video_splash"       // 视频开屏
  | "interstitial_half"  // 插屏-半屏
  | "interstitial_full"  // 插屏-全屏
  | "banner"             // 横幅
  | "native"             // 原生（信息流）
  | "rewarded_video";    // 激励视频

// SDK模板信息
const SDK_TEMPLATE_INFO: Record<SDKTemplateType, { name: string; desc: string }> = {
  static_splash: { name: "静态开屏", desc: "静态图片展示，应用启动时展示品牌广告" },
  video_splash: { name: "视频开屏", desc: "视频素材播放，应用启动时自动播放" },
  interstitial_half: { name: "插屏-半屏", desc: "半屏展示，覆盖部分屏幕" },
  interstitial_full: { name: "插屏-全屏", desc: "全屏展示，强制用户观看" },
  banner: { name: "横幅", desc: "顶部或底部横幅，持续展示" },
  native: { name: "原生（信息流）", desc: "融入内容的原生广告" },
  rewarded_video: { name: "激励视频", desc: "用户主动观看获取奖励" },
};

// SDK模板尺寸配置
const SDK_TEMPLATE_SIZES: Record<SDKTemplateType, { width: number; height: number; ratio: string }> = {
  static_splash: { width: 1080, height: 1920, ratio: "9:16" },     // 9:16
  video_splash: { width: 1080, height: 1920, ratio: "9:16" },      // 9:16
  interstitial_half: { width: 600, height: 500, ratio: "6:5" },
  interstitial_full: { width: 1080, height: 1920, ratio: "9:16" },
  banner: { width: 320, height: 50, ratio: "32:5" },
  native: { width: 1080, height: 540, ratio: "2:1" },
  rewarded_video: { width: 1080, height: 1920, ratio: "9:16" },
};

// 模拟数据
const generateMockData = (type: SDKTemplateType, count: number) => {
  const templates = [];
  const sizeConfig = SDK_TEMPLATE_SIZES[type];
  for (let i = 1; i <= count; i++) {
    const isEnabled = Math.random() > 0.3;
    templates.push({
      id: `sdk_${type}_${String(i).padStart(6, "0")}`,
      name: `${SDK_TEMPLATE_INFO[type].name}模板${i}`,
      status: isEnabled ? "enabled" : "paused",
      preview: `https://picsum.photos/seed/${type}${i}/320/180`,
      linkedComponents: Math.floor(Math.random() * 5),
      creator: ["张三", "李四", "王五", "赵六"][Math.floor(Math.random() * 4)],
      createTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleString("zh-CN"),
      adSlot: `slot_${type}_${String(i).padStart(4, "0")}`,
      format: ["图片", "图片+文字", "视频"][Math.floor(Math.random() * 3)],
      size: `${sizeConfig.width}×${sizeConfig.height}`,
      ratio: sizeConfig.ratio,
    });
  }
  return templates;
};

interface SDKTemplateListProps {
  type: SDKTemplateType;
}

export function SDKTemplateList({ type }: SDKTemplateListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [data] = useState(() => generateMockData(type, 12));

  const info = SDK_TEMPLATE_INFO[type];

  // 过滤数据
  const filteredData = data.filter(item =>
    item.name.includes(searchQuery) || 
    item.id.includes(searchQuery) ||
    item.creator.includes(searchQuery)
  );

  // 全选
  const handleSelectAll = () => {
    if (selectedIds.size === filteredData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredData.map(item => item.id)));
    }
  };

  // 单选
  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // 返回列表
  const handleBack = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{info.name}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{info.desc}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* 搜索和筛选 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="搜索模板ID、名称、创建人..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <span className="text-sm text-gray-500">
                  已选择 {selectedIds.size} 项
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 列表 */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-10 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredData.length && filteredData.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">模板ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">模板名称</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">规格</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">预览</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">关联组件</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建人</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.id)}
                      onChange={() => handleSelect(item.id)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-mono">{item.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.status === "enabled"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {item.status === "enabled" ? "开启" : "暂停"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <div>{item.size}</div>
                    <div className="text-xs text-blue-600">{item.ratio}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-24 h-16 bg-gray-100 rounded overflow-hidden">
                      <RealAdPreview
                        templateType={type}
                        templateName={item.name}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-600">{item.linkedComponents}个</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.creator}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.createTime}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 hover:bg-gray-100 rounded" title="预览">
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded" title="复制">
                        <Copy className="w-4 h-4 text-gray-500" />
                      </button>
                      <button 
                        className="p-1.5 hover:bg-gray-100 rounded" 
                        title="编辑"
                        onClick={() => router.push(`/sdk/${type}/${item.id}`)}
                      >
                        <Edit className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        className="p-1.5 hover:bg-gray-100 rounded"
                        title={item.status === "enabled" ? "暂停" : "开启"}
                      >
                        {item.status === "enabled" ? (
                          <Pause className="w-4 h-4 text-gray-500" />
                        ) : (
                          <Play className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded" title="删除">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">暂无数据</p>
            </div>
          )}
        </div>

        {/* 分页 */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            共 {filteredData.length} 条数据
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              上一页
            </Button>
            <span className="px-3 py-1 text-sm text-gray-700">1 / 1</span>
            <Button variant="outline" size="sm" disabled>
              下一页
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SDKTemplateList;
