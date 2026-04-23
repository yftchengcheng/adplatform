"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
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
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RealAdPreview } from "./real-ad-preview";
import { InteractionPreview, ComponentLinkConfig } from "./interaction-preview";

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
  static_splash: { width: 1080, height: 1920, ratio: "9:16" },
  video_splash: { width: 1080, height: 1920, ratio: "9:16" },
  interstitial_half: { width: 600, height: 500, ratio: "6:5" },
  interstitial_full: { width: 1080, height: 1920, ratio: "9:16" },
  banner: { width: 320, height: 50, ratio: "32:5" },
  native: { width: 540, height: 200, ratio: "自适应" },
  rewarded_video: { width: 1080, height: 1920, ratio: "9:16" },
};

// 数据接口
interface SDKTemplate {
  id: string;
  type: string;
  name: string;
  ad_slot: string | null;
  format: string | null;
  width: number | null;
  height: number | null;
  ratio: string | null;
  status: string;
  creator: string;
  create_time: string;
  update_time: string;
  linked_component_count: number;
}

interface SDKTemplateListProps {
  type: SDKTemplateType;
}

export function SDKTemplateList({ type }: SDKTemplateListProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [data, setData] = useState<SDKTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 预览弹窗状态
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<SDKTemplate | null>(null);
  const [previewLinks, setPreviewLinks] = useState<ComponentLinkConfig[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  


  const info = SDK_TEMPLATE_INFO[type];
  const sizeConfig = SDK_TEMPLATE_SIZES[type];

  // 获取数据
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/sdk/templates?type=${type}`);
      const json = await res.json();
      
      if (json.success) {
        setData(json.data || []);
      } else {
        setError(json.error || "获取数据失败");
      }
    } catch (err) {
      setError("网络错误，请重试");
      console.error("Error fetching SDK templates:", err);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  // 预览（全屏交互预览）
  const handlePreview = async (item: SDKTemplate) => {
    setPreviewTemplate(item);
    setPreviewOpen(true);
    setPreviewLinks([]);
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/sdk/templates/${item.id}`);
      const json = await res.json();
      if (json.success && json.data?.componentLinks) {
        // 将数据库行转换为 ComponentLinkConfig
        const links: ComponentLinkConfig[] = json.data.componentLinks.map(
          (row: {
            id: string;
            component_id: string;
            component_type_key: string;
            parent_id: string;
            parent_name: string;
            trigger_rule: string;
            trigger_time: number;
            status: string;
          }) => ({
            id: row.id,
            componentId: row.component_id,
            componentName: row.component_id,
            componentType: row.component_type_key || "",
            componentTypeKey: row.component_type_key || "",
            componentConfig: (json.data.componentLinks.find(
              (r: { id: string }) => r.id === row.id
            )?.component_config) as Record<string, unknown> | undefined,
            triggerRule: (row.trigger_rule || "show_time") as ComponentLinkConfig["triggerRule"],
            triggerTime: row.trigger_time || undefined,
            parentId: row.parent_id || "main",
            parentName: row.parent_name || "主素材",
            status: (row.status === "enabled" ? "enabled" : "disabled") as "enabled" | "disabled",
          })
        );
        setPreviewLinks(links);
      }
    } catch (err) {
      console.error("Failed to load component links for preview:", err);
    } finally {
      setPreviewLoading(false);
    }
  };

  // 复制ID
  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      // 可以添加一个提示
      showToast("已复制模板ID", "success");
    } catch (err) {
      console.error("Failed to copy:", err);
      showToast("复制失败", "error");
    }
  };

  // 克隆模板
  const handleClone = async (item: SDKTemplate) => {
    try {
      const response = await fetch("/api/sdk/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cloneFrom: item.id,
          type: item.type,
          name: `${item.name} (副本)`,
          format: item.format,
          adSlot: item.ad_slot,
          width: item.width,
          height: item.height,
          ratio: item.ratio,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        // 将新克隆的数据添加到列表开头
        setData([result.data, ...data]);
        showToast("克隆成功", "success");
      } else {
        showToast(result.error || "克隆失败", "error");
      }
    } catch (err) {
      console.error("Failed to clone:", err);
      showToast("克隆失败", "error");
    }
  };

  // 编辑 - 跳转至组件关联设置页面
  const handleEdit = (item: SDKTemplate) => {
    router.push(`/sdk/${type}/${item.id}`);
  };

  // 切换状态
  const handleToggleStatus = async (item: SDKTemplate) => {
    const newStatus = item.status === "enabled" ? "disabled" : "enabled";
    try {
      const res = await fetch(`/api/sdk/templates/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      
      if (json.success) {
        setData(prev => prev.map(d => 
          d.id === item.id ? { ...d, status: newStatus } : d
        ));
      }
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  // 删除
  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除此模板吗？")) return;
    
    try {
      const res = await fetch(`/api/sdk/templates/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      
      if (json.success) {
        setData(prev => prev.filter(d => d.id !== id));
      }
    } catch (err) {
      console.error("Error deleting template:", err);
    }
  };

  // 返回SDK模版入口页面
  const handleBack = () => {
    router.push("/sdk");
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

        {/* 加载状态 */}
        {loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
            <p className="text-gray-500 mt-2">加载中...</p>
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="bg-white rounded-lg border border-red-200 p-6 text-center">
            <p className="text-red-500">{error}</p>
            <Button onClick={fetchData} className="mt-4">
              重试
            </Button>
          </div>
        )}

        {/* 列表 */}
        {!loading && !error && (
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
                      <div>{item.width}×{item.height}</div>
                      <div className="text-xs text-blue-600">{item.ratio}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div 
                        className="w-24 h-16 bg-gray-100 rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                        onClick={() => handlePreview(item)}
                      >
                        <RealAdPreview
                          templateType={type}
                          templateName={item.name}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-blue-600">{item.linked_component_count}个</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{item.creator}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(item.create_time).toLocaleString("zh-CN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button 
                          className="p-1.5 hover:bg-gray-100 rounded" 
                          title="预览"
                          onClick={() => handlePreview(item)}
                        >
                          <Eye className="w-4 h-4 text-gray-500" />
                        </button>
                        <button 
                          className="p-1.5 hover:bg-gray-100 rounded" 
                          title="克隆"
                          onClick={() => handleClone(item)}
                        >
                          <Copy className="w-4 h-4 text-green-500" />
                        </button>
                        <button 
                          className="p-1.5 hover:bg-gray-100 rounded" 
                          title="编辑"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-gray-100 rounded"
                          title={item.status === "enabled" ? "暂停" : "开启"}
                          onClick={() => handleToggleStatus(item)}
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

            {filteredData.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">暂无数据</p>
              </div>
            )}
          </div>
        )}

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

      {/* 全屏交互预览 */}
      {previewOpen && (
        <InteractionPreview
          templateType={type}
          templateName={previewTemplate?.name || ""}
          componentLinks={previewLinks}
          onClose={() => setPreviewOpen(false)}
        />
      )}

    </div>
  );
}

export default SDKTemplateList;
