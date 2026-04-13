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
const initialComponents: AdComponentItem[] = [
  {
    id: "A100001",
    name: "限时特惠活动",
    category: "static",
    type: "dual_button",
    templateCount: 10,
    status: "enabled",
    editor: "admin@adtalos.com",
    updateTime: "2026-04-13 10:30:00",
  },
  {
    id: "A100002",
    name: "新用户红包雨",
    category: "animation",
    type: "redpacket_rain",
    templateCount: 5,
    status: "enabled",
    editor: "admin@adtalos.com",
    updateTime: "2026-04-12 15:20:00",
  },
  {
    id: "A100003",
    name: "会员专享优惠券",
    category: "static",
    type: "coupon",
    templateCount: 16,
    status: "enabled",
    editor: "yufutang@adtalos.com",
    updateTime: "2026-04-11 09:45:00",
  },
];

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

// 生成唯一ID
async function generateId(client: ReturnType<typeof getSupabaseClient>): Promise<string> {
  const { data, error } = await client.from("ad_components").select("id").order("id", { ascending: false }).limit(1);
  if (error) {
    // 降级：从 localStorage 获取
    const stored = localStorage.getItem("componentIds");
    const existingIds: string[] = stored ? JSON.parse(stored) : [];
    const maxId = existingIds.reduce((max, id) => {
      const num = parseInt(id.replace("A", ""), 10);
      return num > max ? num : max;
    }, 100000);
    return `A${maxId + 1}`;
  }
  
  if (data && data.length > 0) {
    const lastId = data[0].id;
    const num = parseInt(lastId.replace("A", ""), 10);
    return `A${num + 1}`;
  }
  return "A100001";
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

  // 加载数据
  const loadComponents = useCallback(async () => {
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
        setComponents(formatted);
        // 同步到 localStorage 缓存
        localStorage.setItem("ad_components", JSON.stringify(formatted));
      } else {
        // 数据库为空，加载初始数据
        setComponents(initialComponents);
        localStorage.setItem("ad_components", JSON.stringify(initialComponents));
        // 初始化数据库数据
        for (const item of initialComponents) {
          await client.from("ad_components").insert(toDbFormat(item));
        }
      }
      setError(null);
    } catch (err) {
      console.error("数据库加载失败，降级到 localStorage:", err);
      // 降级到 localStorage
      const stored = localStorage.getItem("ad_components");
      if (stored) {
        try {
          setComponents(JSON.parse(stored));
        } catch {
          setComponents(initialComponents);
        }
      } else {
        setComponents(initialComponents);
      }
      setError("数据库连接失败，使用本地缓存");
    }
  }, []);

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
    const client = getSupabaseClient();
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    
    const newId = await generateId(client);
    
    const newComponent: AdComponentItem = {
      ...component,
      id: newId,
      templateCount: 0,
      editor: "admin@adtalos.com",
      updateTime: timeStr,
    };

    // 保存到数据库
    try {
      const { error: dbError } = await client
        .from("ad_components")
        .insert(toDbFormat(newComponent));
      
      if (dbError) {
        throw new Error(`保存失败: ${dbError.message}`);
      }
    } catch (err) {
      console.error("数据库保存失败:", err);
    }

    // 更新本地状态
    setComponents(prev => {
      const updated = [newComponent, ...prev];
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // 更新组件
  const updateComponent = useCallback(async (id: string, updates: Partial<AdComponentItem>) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    
    const client = getSupabaseClient();
    
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
      const { error: dbError } = await client
        .from("ad_components")
        .update(dbUpdates)
        .eq("id", id);
      
      if (dbError) {
        throw new Error(`更新失败: ${dbError.message}`);
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
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // 删除组件
  const deleteComponent = useCallback(async (id: string) => {
    const client = getSupabaseClient();
    
    // 从数据库删除
    try {
      const { error: dbError } = await client
        .from("ad_components")
        .delete()
        .eq("id", id);
      
      if (dbError) {
        throw new Error(`删除失败: ${dbError.message}`);
      }
    } catch (err) {
      console.error("数据库删除失败:", err);
    }

    // 更新本地状态
    setComponents(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // 切换状态
  const toggleStatus = useCallback(async (id: string) => {
    const client = getSupabaseClient();
    
    // 查找当前组件
    const component = components.find(item => item.id === id);
    if (!component) return;

    const newStatus = component.status === "enabled" ? "disabled" : "enabled";
    
    // 更新数据库
    try {
      const { error: dbError } = await client
        .from("ad_components")
        .update({ status: newStatus })
        .eq("id", id);
      
      if (dbError) {
        throw new Error(`状态更新失败: ${dbError.message}`);
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
      saveToStorage(updated);
      return updated;
    });
  }, [components, saveToStorage]);

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
