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
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RealAdPreview, FullscreenPreviewModal } from "./real-ad-preview";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [data, setData] = useState<SDKTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 预览弹窗状态
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<SDKTemplate | null>(null);
  
  // 编辑弹窗状态
  const [editOpen, setEditOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<SDKTemplate | null>(null);
  const [editName, setEditName] = useState("");
  const [editAdSlot, setEditAdSlot] = useState("");
  const [editFormat, setEditFormat] = useState("");
  const [saving, setSaving] = useState(false);

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

  // 预览
  const handlePreview = (item: SDKTemplate) => {
    setPreviewTemplate(item);
    setPreviewOpen(true);
  };

  // 复制ID
  const handleCopy = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      // 可以添加一个提示
      alert("已复制模板ID: " + id);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // 编辑
  const handleEdit = (item: SDKTemplate) => {
    setEditTemplate(item);
    setEditName(item.name);
    setEditAdSlot(item.ad_slot || "");
    setEditFormat(item.format || "");
    setEditOpen(true);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editTemplate) return;
    
    setSaving(true);
    try {
      const res = await fetch(`/api/sdk/templates/${editTemplate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          adSlot: editAdSlot,
          format: editFormat,
        }),
      });
      const json = await res.json();
      
      if (json.success) {
        setData(prev => prev.map(d => 
          d.id === editTemplate.id ? { ...d, name: editName, ad_slot: editAdSlot, format: editFormat } : d
        ));
        setEditOpen(false);
      } else {
        alert(json.error || "保存失败");
      }
    } catch (err) {
      console.error("Error saving edit:", err);
      alert("保存失败，请重试");
    } finally {
      setSaving(false);
    }
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
                          title="复制"
                          onClick={() => handleCopy(item.id)}
                        >
                          <Copy className="w-4 h-4 text-gray-500" />
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

      {/* 预览弹窗 */}
      <FullscreenPreviewModal
        templateType={type}
        templateName={previewTemplate?.name}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />

      {/* 编辑弹窗 */}
      {editOpen && editTemplate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-gray-900">编辑模板</h3>
              <button 
                onClick={() => setEditOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">模板名称</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="请输入模板名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">广告位</label>
                <Input
                  value={editAdSlot}
                  onChange={(e) => setEditAdSlot(e.target.value)}
                  placeholder="请输入广告位"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">格式</label>
                <Input
                  value={editFormat}
                  onChange={(e) => setEditFormat(e.target.value)}
                  placeholder="请输入格式"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setEditOpen(false)}
                >
                  取消
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleSaveEdit}
                  disabled={saving}
                >
                  {saving ? "保存中..." : "保存"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SDKTemplateList;
