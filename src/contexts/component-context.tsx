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

  // 检查 Supabase 是否可用
  const isSupabaseAvailable = useCallback((): boolean => {
    try {
      getSupabaseClient();
      return true;
    } catch {
      return false;
    }
  }, []);

  // 加载数据
  const loadComponents = useCallback(async () => {
    // 需要过滤的旧测试ID
    const legacyIds = ["A100001", "A100002", "A100003"];

    // 过滤掉旧测试数据
    const filterLegacyData = (items: AdComponentItem[]): AdComponentItem[] => {
      return items.filter(item => !legacyIds.includes(item.id));
    };

    // 去重辅助函数
    const deduplicate = (items: AdComponentItem[]): AdComponentItem[] => {
      const seen = new Set<string>();
      return items.filter(item => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
    };

    // 使用 API 加载数据
    try {
      const response = await fetch("/api/components");
      const result = await response.json();

      if (result.error) {
        throw new Error(`加载失败: ${result.error}`);
      }

      if (result.data && result.data.length > 0) {
        const formatted = result.data.map(toFrontendFormat);
        // 去重：以 id 为 key，保持第一个出现的记录
        const seen = new Set<string>();
        const deduplicated = formatted.filter((item: AdComponentItem) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
        // 过滤旧测试数据
        const filtered = filterLegacyData(deduplicated);
        setComponents(filtered);
      } else {
        // 数据库为空，使用空数组
        setComponents([]);
      }
      setError(null);
    } catch (err) {
      console.error("数据库加载失败:", err);
      // 数据库失败时使用空数组，避免使用 localStorage
      setComponents([]);
      setError("数据库连接失败");
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    loadComponents().finally(() => setIsInitialized(true));
  }, [loadComponents]);

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
          ? { ...item, status: newStatus }
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
