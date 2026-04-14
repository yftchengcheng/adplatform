"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ComponentStatus } from "@/lib/component-types";
import { getSupabaseClient } from "@/storage/database/supabase-client-browser";

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

    // 检查 Supabase 是否可用
    if (!isSupabaseAvailable()) {
      console.log("Supabase 不可用，降级到 localStorage");
      const stored = localStorage.getItem("ad_components");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // 过滤旧数据并去重
          const filtered = filterLegacyData(parsed);
          const deduplicated = deduplicate(filtered);
          setComponents(deduplicated);
          localStorage.setItem("ad_components", JSON.stringify(deduplicated));
        } catch {
          const filtered = filterLegacyData(initialComponents);
          const deduplicated = deduplicate(filtered);
          setComponents(deduplicated);
          localStorage.setItem("ad_components", JSON.stringify(deduplicated));
        }
      } else {
        const filtered = filterLegacyData(initialComponents);
        const deduplicated = deduplicate(filtered);
        setComponents(deduplicated);
        localStorage.setItem("ad_components", JSON.stringify(deduplicated));
      }
      setError("数据库连接不可用，使用本地缓存");
      return;
    }

    try {
      const client = getSupabaseClient();
      const { data, error: dbError } = await client
        .from("ad_components")
        .select("*")
        .order("update_time", { ascending: false });

      if (dbError) {
        throw new Error(`加载失败: ${dbError.message}`);
      }

      if (data && data.length > 0) {
        const formatted = data.map(toFrontendFormat);
        // 去重：以 id 为 key，保持第一个出现的记录
        const seen = new Set<string>();
        const deduplicated = formatted.filter(item => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
        // 过滤旧测试数据
        const filtered = filterLegacyData(deduplicated);
        setComponents(filtered);
        // 同步到 localStorage 缓存
        localStorage.setItem("ad_components", JSON.stringify(filtered));
      } else {
        // 数据库为空，加载初始数据（去重）
        const seen = new Set<string>();
        const deduplicated = initialComponents.filter(item => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
        // 过滤旧测试数据
        const filtered = filterLegacyData(deduplicated);
        setComponents(filtered);
        localStorage.setItem("ad_components", JSON.stringify(filtered));
        // 初始化数据库数据
        for (const item of filtered) {
          await client.from("ad_components").insert(toDbFormat(item));
        }
      }
      setError(null);
    } catch (err) {
      console.error("数据库加载失败，降级到 localStorage:", err);
      // 降级到 localStorage（去重 + 过滤旧数据）
      const stored = localStorage.getItem("ad_components");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const filtered = filterLegacyData(parsed);
          const seen = new Set<string>();
          const deduplicated = filtered.filter((item: AdComponentItem) => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          });
          setComponents(deduplicated);
          localStorage.setItem("ad_components", JSON.stringify(deduplicated));
        } catch {
          const filtered = filterLegacyData(initialComponents);
          const seen = new Set<string>();
          const deduplicated = filtered.filter(item => {
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
          });
          setComponents(deduplicated);
        }
      } else {
        const filtered = filterLegacyData(initialComponents);
        const seen = new Set<string>();
        const deduplicated = filtered.filter(item => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
        setComponents(deduplicated);
      }
      setError("数据库连接失败，使用本地缓存");
    }
  }, [isSupabaseAvailable]);

  // 初始化加载
  useEffect(() => {
    loadComponents().finally(() => setIsInitialized(true));
  }, [loadComponents]);

  // 保存数据到 localStorage
  const saveToStorage = useCallback((data: AdComponentItem[]) => {
    localStorage.setItem("ad_components", JSON.stringify(data));
  }, []);

  // 添加组件
  const addComponent = useCallback(async (
    component: Omit<AdComponentItem, "id" | "updateTime" | "templateCount" | "editor">
  ) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    
    // 生成新ID - 使用时间戳确保唯一性
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000);
    const newId = `A${timestamp}${randomSuffix}`.slice(-12);
    
    const newComponent: AdComponentItem = {
      ...component,
      id: newId,
      templateCount: 0,
      editor: "admin@adtalos.com",
      updateTime: timeStr,
    };

    // 尝试保存到数据库
    if (isSupabaseAvailable()) {
      try {
        const client = getSupabaseClient();
        const { error: dbError } = await client
          .from("ad_components")
          .insert(toDbFormat(newComponent));
        
        if (dbError) {
          console.error("数据库保存失败:", dbError);
        }
      } catch (err) {
        console.error("数据库保存失败:", err);
      }
    }

    // 更新本地状态
    setComponents(prev => {
      const updated = [newComponent, ...prev];
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage, isSupabaseAvailable]);

  // 更新组件
  const updateComponent = useCallback(async (id: string, updates: Partial<AdComponentItem>) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    
    // 准备更新数据
    const dbUpdates: Partial<DbAdComponent> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.templateCount !== undefined) dbUpdates.template_count = updates.templateCount;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.config !== undefined) dbUpdates.config = updates.config;
    dbUpdates.update_time = timeStr;

    // 尝试更新数据库
    if (isSupabaseAvailable()) {
      try {
        const client = getSupabaseClient();
        const { error: dbError } = await client
          .from("ad_components")
          .update(dbUpdates)
          .eq("id", id);
        
        if (dbError) {
          console.error("数据库更新失败:", dbError);
        }
      } catch (err) {
        console.error("数据库更新失败:", err);
      }
    }

    // 更新本地状态
    setComponents(prev => {
      const updated = prev.map(item =>
        item.id === id
          ? { ...item, ...updates, updateTime: timeStr }
          : item
      );
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage, isSupabaseAvailable]);

  // 删除组件
  const deleteComponent = useCallback(async (id: string) => {
    // 尝试从数据库删除
    if (isSupabaseAvailable()) {
      try {
        const client = getSupabaseClient();
        const { error: dbError } = await client
          .from("ad_components")
          .delete()
          .eq("id", id);
        
        if (dbError) {
          console.error("数据库删除失败:", dbError);
        }
      } catch (err) {
        console.error("数据库删除失败:", err);
      }
    }

    // 更新本地状态
    setComponents(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage, isSupabaseAvailable]);

  // 切换状态
  const toggleStatus = useCallback(async (id: string) => {
    // 查找当前组件
    const component = components.find(item => item.id === id);
    if (!component) return;

    const newStatus = component.status === "enabled" ? "disabled" : "enabled";
    
    // 尝试更新数据库
    if (isSupabaseAvailable()) {
      try {
        const client = getSupabaseClient();
        const { error: dbError } = await client
          .from("ad_components")
          .update({ status: newStatus })
          .eq("id", id);
        
        if (dbError) {
          console.error("数据库状态更新失败:", dbError);
        }
      } catch (err) {
        console.error("数据库状态更新失败:", err);
      }
    }

    // 更新本地状态
    setComponents(prev => {
      const updated = prev.map(item =>
        item.id === id
          ? { ...item, status: newStatus }
          : item
      );
      saveToStorage(updated);
      return updated;
    });
  }, [components, saveToStorage, isSupabaseAvailable]);

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
