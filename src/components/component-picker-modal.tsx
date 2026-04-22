"use client";

import React, { useState, useMemo } from "react";
import { X, Search, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AdComponent {
  id: string;
  name: string;
  type: string;
  config?: any;
  createTime?: string;
  status?: string;
}

interface ComponentPickerModalProps {
  components: AdComponent[];
  onSelect: (componentId: string) => void;
  onClose: () => void;
}

export function ComponentPickerModal({
  components,
  onSelect,
  onClose,
}: ComponentPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 过滤组件
  const filteredComponents = useMemo(() => {
    return components.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [components, searchQuery]);

  // 获取组件预览图
  const getComponentPreview = (component: AdComponent): string => {
    if (!component?.config) return "";
    
    const cfg = component.config as any;
    if (cfg.previewUrl) return cfg.previewUrl;
    if (cfg.imageUrl) return cfg.imageUrl;
    if (cfg.images?.[0]?.imageUrl) return cfg.images[0].imageUrl;
    if (cfg.redpacketImageUrl) return cfg.redpacketImageUrl;
    if (cfg.logoUrl) return cfg.logoUrl;
    
    return "";
  };

  // 获取组件缩略图
  const getComponentThumb = (component: AdComponent): string => {
    const preview = getComponentPreview(component);
    return preview;
  };

  const selectedComponent = components.find((c) => c.id === selectedId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[90%] max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">选择组件</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* 左侧列表 */}
          <div className="w-1/2 border-r border-gray-200 flex flex-col">
            {/* 搜索 */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="搜索组件名称或类型"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* 列表 */}
            <div className="flex-1 overflow-y-auto p-4">
              {filteredComponents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">未找到匹配的组件</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredComponents.map((component) => (
                    <div
                      key={component.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedId === component.id
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-gray-50 border border-transparent"
                      }`}
                      onClick={() => setSelectedId(component.id)}
                    >
                      {/* 缩略图 */}
                      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {getComponentThumb(component) ? (
                          <img
                            src={getComponentThumb(component)}
                            alt={component.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* 信息 */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {component.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {component.type}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右侧预览 */}
          <div className="w-1/2 flex flex-col bg-gray-50">
            {selectedComponent ? (
              <>
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-4">
                    {/* 预览图 */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      {getComponentPreview(selectedComponent) ? (
                        <img
                          src={getComponentPreview(selectedComponent)}
                          alt={selectedComponent.name}
                          className="w-full object-contain"
                        />
                      ) : (
                        <div className="aspect-video flex items-center justify-center bg-gray-100">
                          <div className="text-center">
                            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">暂无预览图</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 组件信息 */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">组件ID</p>
                        <p className="text-sm font-mono text-gray-900">{selectedComponent.id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">组件名称</p>
                        <p className="text-sm text-gray-900">{selectedComponent.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">组件类型</p>
                        <p className="text-sm text-gray-900">{selectedComponent.type}</p>
                      </div>
                      {selectedComponent.createTime && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">创建时间</p>
                          <p className="text-sm text-gray-900">{selectedComponent.createTime}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 底部按钮 */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <Button
                    className="w-full bg-blue-500 hover:bg-blue-600"
                    onClick={() => onSelect(selectedComponent.id)}
                  >
                    添加此组件
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">请选择一个组件</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComponentPickerModal;
