"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Search, 
  Eye, 
  Copy, 
  Trash2, 
  Edit, 
  Play, 
  Pause,
  Loader2,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdInteractionPreview } from "./ad-interaction-preview";

// SDK模板类型
type SDKTemplateType = 
  | "static_splash"      
  | "video_splash"       
  | "interstitial_half"   
  | "interstitial_full"   
  | "banner"             
  | "native"             
  | "rewarded_video";    

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
  static_splash: { width: 540, height: 960, ratio: "9:16" },
  video_splash: { width: 540, height: 960, ratio: "9:16" },
  interstitial_half: { width: 600, height: 500, ratio: "6:5" },
  interstitial_full: { width: 1080, height: 1920, ratio: "9:16" },
  banner: { width: 1080, height: 120, ratio: "9:1" },
  native: { width: 1080, height: 540, ratio: "2:1" },
  rewarded_video: { width: 1080, height: 1920, ratio: "9:16" },
};

// 列表项数据结构
interface SDKTemplateListItem {
  id: string;
  name: string;
  type: string;
  adSlot?: string;
  format?: string;
  size?: string;
  ratio?: string;
  status: string;
  linkedComponentCount: number;
  creator: string;
  createTime: string;
  componentLinks: Array<{
    id: string;
    componentId: string;
    componentName: string;
    componentType: string;
    componentPreview: string;
    parentId: string;
    parentName: string;
    triggerRule: string;
    triggerTime?: number;
    status: string;
  }>;
}

interface SDKTemplateListProps {
  type: SDKTemplateType;
}

export function SDKTemplateList({ type }: SDKTemplateListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [data, setData] = useState<SDKTemplateListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const info = SDK_TEMPLATE_INFO[type];

  // 获取模板列表数据
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/sdk?type=${type}`);
      const result = await response.json();
      if (result.success) {
        setData(result.data || []);
      }
    } catch (error) {
      console.error("获取模板列表失败:", error);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

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

  // 删除模板
  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个模板吗？")) return;
    
    try {
      const response = await fetch(`/api/sdk/${type}/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (result.success) {
        setData(prev => prev.filter(item => item.id !== id));
      } else {
        alert("删除失败");
      }
    } catch (error) {
      console.error("删除模板失败:", error);
      alert("删除失败");
    }
  };

  // 切换状态
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "enabled" ? "paused" : "enabled";
    
    try {
      const response = await fetch(`/api/sdk/${type}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();
      if (result.success) {
        setData(prev => prev.map(item => 
          item.id === id ? { ...item, status: newStatus } : item
        ));
      }
    } catch (error) {
      console.error("切换状态失败:", error);
    }
  };

  // 复制模板
  const handleCopy = (id: string) => {
    // 跳转到编辑页面并复制数据
    router.push(`/sdk/${type}/${id}?action=copy`);
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400 mr-2" />
              <span className="text-gray-500">加载中...</span>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">暂无数据</p>
              <Button 
                className="mt-4 bg-blue-500 hover:bg-blue-600"
                onClick={() => router.push(`/sdk/${type}/new`)}
              >
                <Plus className="w-4 h-4 mr-2" />
                创建模板
              </Button>
            </div>
          ) : (
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
                      <div>{item.size || `${SDK_TEMPLATE_SIZES[type].width}×${SDK_TEMPLATE_SIZES[type].height}`}</div>
                      <div className="text-xs text-blue-600">{item.ratio || SDK_TEMPLATE_SIZES[type].ratio}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-20 h-12 bg-gray-100 rounded overflow-hidden">
                        <AdInteractionPreview
                          templateType={type}
                          templateName={item.name}
                          componentLinks={item.componentLinks}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-blue-600">{item.linkedComponentCount}个</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.creator}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.createTime}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button 
                          className="p-1.5 hover:bg-gray-100 rounded" 
                          title="预览"
                          onClick={() => router.push(`/sdk/${type}/${item.id}?mode=preview`)}
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        <button 
                          className="p-1.5 hover:bg-gray-100 rounded" 
                          title="复制"
                          onClick={() => handleCopy(item.id)}
                        >
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
                          onClick={() => handleToggleStatus(item.id, item.status)}
                        >
                          {item.status === "enabled" ? (
                            <Pause className="w-4 h-4 text-gray-500" />
                          ) : (
                            <Play className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                        <button 
                          className="p-1.5 hover:bg-gray-100 rounded" 
                          title="删除"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 分页 */}
        {!loading && filteredData.length > 0 && (
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
        )}
      </main>
    </div>
  );
}

export default SDKTemplateList;
