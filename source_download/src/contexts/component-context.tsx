"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ComponentStatus } from "@/lib/component-types";

// 数据库字段映射到前端接口
interface DbAdComponent {
  id: string;
  name: string;
  category: "static" | "animation";
  type: string;
  template_count: number;
  status: "enabled" | "disabled";
  editor: string;
  update_time: string;
  config?: Record<string, unknown>;
}

// 前端组件数据接口
export interface AdComponentItem {
  id: string;
  name: string;
  category: "static" | "animation";
  type: string;
  templateCount: number;
  status: ComponentStatus;
  editor: string;
  updateTime: string;
  config?: Record<string, unknown>;
}

// 初始模拟数据（数据库连接失败时降级使用）
const initialComponents: AdComponentItem[] = [];

// 数据库记录转前端格式
function toFrontendFormat(item: DbAdComponent): AdComponentItem {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    type: item.type,
    templateCount: item.template_count,
    status: item.status,
    editor: item.editor,
    updateTime: item.update_time,
    config: item.config,
  };
}

// 前端格式转数据库格式
function toDbFormat(item: AdComponentItem): Omit<DbAdComponent, "update_time"> & { update_time: string } {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    type: item.type,
    template_count: item.templateCount,
    status: item.status,
    editor: item.editor,
    update_time: item.updateTime,
    config: item.config,
  };
}

// Context 接口
interface ComponentContextType {
  components: AdComponentItem[];
  loading: boolean;
  error: string | null;
  // 当前编辑的组件预览配置（用于组件列表实时预览）
  editingPreviewConfig: Record<string, Record<string, unknown>>;
  setEditingPreviewConfig: (type: string, config: Record<string, unknown>) => void;
  addComponent: (component: Omit<AdComponentItem, "id" | "updateTime" | "templateCount" | "editor">) => Promise<void>;
  updateComponent: (id: string, updates: Partial<AdComponentItem>) => Promise<void>;
  deleteComponent: (id: string) => Promise<void>;
  toggleStatus: (id: string) => Promise<void>;
  getComponent: (id: string) => AdComponentItem | undefined;
  refreshComponents: () => Promise<void>;
}

// 创建 Context
const ComponentContext = createContext<ComponentContextType | undefined>(undefined);

// Provider 组件
export function ComponentProvider({ children }: { children: React.ReactNode }) {
  const [components, setComponents] = useState<AdComponentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // 当前编辑的组件预览配置（用于组件列表实时预览）
  const [editingPreviewConfig, setEditingPreviewConfigState] = useState<Record<string, Record<string, unknown>>>({});
  
  // 包装 setEditingPreviewConfig 以匹配接口
  const setEditingPreviewConfig = useCallback((type: string, config: Record<string, unknown>) => {
    setEditingPreviewConfigState(prev => ({ ...prev, [type]: config }));
  }, []);
  
  // 数据缓存，避免重复加载
  const [lastLoadTime, setLastLoadTime] = useState<number>(0);
  const CACHE_DURATION = 5000; // 5秒缓存

  // 加载数据 - 添加缓存机制
  const loadComponents = useCallback(async (forceRefresh = false) => {
    // 如果缓存有效且不是强制刷新，直接返回
    const now = Date.now();
    if (!forceRefresh && lastLoadTime && now - lastLoadTime < CACHE_DURATION) {
      return;
    }

    // 需要过滤的旧测试ID
    const legacyIds = ["A100001", "A100002", "A100003"];

    // 使用 API 加载数据
    try {
      setLoading(true);
      const response = await fetch("/api/components");
      const result = await response.json();

      if (result.error) {
        throw new Error(`加载失败: ${result.error}`);
      }

      if (result.data && result.data.length > 0) {
        // 一次遍历完成去重和过滤
        const seen = new Set<string>();
        const processed = result.data
          .map(toFrontendFormat)
          .filter((item: AdComponentItem) => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return !legacyIds.includes(item.id);
          });
        setComponents(processed);
        setLastLoadTime(now);
      } else {
        setComponents([]);
        setLastLoadTime(now);
      }
      setError(null);
    } catch (err) {
      console.error("数据库加载失败:", err);
      setComponents([]);
      setError("数据库连接失败");
    } finally {
      setLoading(false);
    }
  }, [lastLoadTime]);

  // 初始化加载 - 添加加载状态检查
  useEffect(() => {
    if (!isInitialized) {
      loadComponents().finally(() => setIsInitialized(true));
    }
  }, [isInitialized, loadComponents]);

  // 生成顺序ID
  const generateSequentialId = useCallback((existingComponents: AdComponentItem[]): string => {
    // 提取所有数字ID并排序
    const ids = existingComponents
      .map(c => {
        const match = c.id.match(/^A(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => n > 0)
      .sort((a, b) => b - a);

    // 下一个ID = 最大ID + 1，最小为 1000000000
    const nextNum = ids.length > 0 ? ids[0] + 1 : 1000000000;
    return `A${nextNum}`;
  }, []);

  // 添加组件
  const addComponent = useCallback(async (
    component: Omit<AdComponentItem, "id" | "updateTime" | "templateCount" | "editor">
  ) => {
    // 使用 ISO 格式时间，确保排序一致
    const timeStr = new Date().toISOString();
    
    // 生成顺序ID
    const newId = generateSequentialId(components);
    
    const newComponent: AdComponentItem = {
      ...component,
      id: newId,
      templateCount: 0,
      editor: "admin@adtalos.com",
      updateTime: timeStr,
    };

    // 保存到数据库
    try {
      const response = await fetch("/api/components", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toDbFormat(newComponent)),
      });
      const result = await response.json();
      if (result.error) {
        console.error("数据库保存失败:", result.error);
      }
    } catch (err) {
      console.error("数据库保存失败:", err);
    }

    // 更新本地状态
    setComponents(prev => {
      const updated = [newComponent, ...prev];
      return updated;
    });
  }, [generateSequentialId, components]);

  // 更新组件
  const updateComponent = useCallback(async (id: string, updates: Partial<AdComponentItem>) => {
    // 使用 ISO 格式时间，确保排序一致
    const timeStr = new Date().toISOString();
    
    // 准备更新数据
    const dbUpdates: Partial<DbAdComponent> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.templateCount !== undefined) dbUpdates.template_count = updates.templateCount;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.config !== undefined) dbUpdates.config = updates.config;
    dbUpdates.update_time = timeStr;

    // 更新数据库
    try {
      const response = await fetch("/api/components", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...dbUpdates }),
      });
      const result = await response.json();
      if (result.error) {
        console.error("数据库更新失败:", result.error);
      }
    } catch (err) {
      console.error("数据库更新失败:", err);
    }

    // 更新本地状态
    setComponents(prev => {
      const updated = prev.map(item =>
        item.id === id
          ? { ...item, ...updates, updateTime: timeStr }
          : item
      );
      return updated;
    });
  }, []);

  // 删除组件
  const deleteComponent = useCallback(async (id: string) => {
    // 从数据库删除
    try {
      const response = await fetch(`/api/components?id=${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.error) {
        console.error("数据库删除失败:", result.error);
      }
    } catch (err) {
      console.error("数据库删除失败:", err);
    }

    // 更新本地状态
    setComponents(prev => {
      const updated = prev.filter(item => item.id !== id);
      return updated;
    });
  }, []);

  // 切换状态
  const toggleStatus = useCallback(async (id: string) => {
    // 查找当前组件
    const component = components.find(item => item.id === id);
    if (!component) return;

    const newStatus = component.status === "enabled" ? "disabled" : "enabled";
    
    // 更新数据库
    try {
      const response = await fetch("/api/components", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const result = await response.json();
      if (result.error) {
        console.error("数据库状态更新失败:", result.error);
      }
    } catch (err) {
      console.error("数据库状态更新失败:", err);
    }

    // 更新本地状态
    setComponents(prev => {
      const updated = prev.map(item =>
        item.id === id
          ? { ...item, status: newStatus as ComponentStatus }
          : item
      );
      return updated;
    });
  }, [components]);

  // 获取单个组件
  const getComponent = useCallback((id: string) => {
    return components.find(item => item.id === id);
  }, [components]);

  // 刷新数据
  const refreshComponents = useCallback(async () => {
    setLoading(true);
    await loadComponents();
    setLoading(false);
  }, [loadComponents]);

  return (
    <ComponentContext.Provider value={{
      components: isInitialized ? components : initialComponents,
      loading,
      error,
      editingPreviewConfig,
      setEditingPreviewConfig,
      addComponent,
      updateComponent,
      deleteComponent,
      toggleStatus,
      getComponent,
      refreshComponents,
    }}>
      {children}
    </ComponentContext.Provider>
  );
}

// Hook
export function useComponents() {
  const context = useContext(ComponentContext);
  if (!context) {
    throw new Error("useComponents must be used within ComponentProvider");
  }
  return context;
}
