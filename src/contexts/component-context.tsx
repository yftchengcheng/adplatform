"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ComponentStatus } from "@/lib/component-types";

// 生成唯一ID
const generateId = (): string => {
  const existingIds = typeof window !== "undefined" 
    ? JSON.parse(localStorage.getItem("componentIds") || "[]")
    : [];
  const maxId = existingIds.reduce((max, id) => {
    const num = parseInt(id.replace("A", ""), 10);
    return num > max ? num : max;
  }, 100000);
  const newId = `A${maxId + 1}`;
  if (typeof window !== "undefined") {
    localStorage.setItem("componentIds", JSON.stringify([...existingIds, newId]));
  }
  return newId;
};

// 组件数据接口
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

// 初始模拟数据
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

// Context 接口
interface ComponentContextType {
  components: AdComponentItem[];
  addComponent: (component: Omit<AdComponentItem, "id" | "updateTime" | "templateCount" | "editor">) => void;
  updateComponent: (id: string, updates: Partial<AdComponentItem>) => void;
  deleteComponent: (id: string) => void;
  toggleStatus: (id: string) => void;
  getComponent: (id: string) => AdComponentItem | undefined;
}

// 创建 Context
const ComponentContext = createContext<ComponentContextType | undefined>(undefined);

// Provider 组件
export function ComponentProvider({ children }: { children: React.ReactNode }) {
  const [components, setComponents] = useState<AdComponentItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化加载数据
  useEffect(() => {
    const stored = localStorage.getItem("ad_components");
    if (stored) {
      try {
        setComponents(JSON.parse(stored));
      } catch {
        setComponents(initialComponents);
        localStorage.setItem("ad_components", JSON.stringify(initialComponents));
      }
    } else {
      setComponents(initialComponents);
      localStorage.setItem("ad_components", JSON.stringify(initialComponents));
    }
    setIsInitialized(true);
  }, []);

  // 保存数据到 localStorage
  const saveToStorage = useCallback((data: AdComponentItem[]) => {
    localStorage.setItem("ad_components", JSON.stringify(data));
  }, []);

  // 添加组件
  const addComponent = useCallback((
    component: Omit<AdComponentItem, "id" | "updateTime" | "templateCount" | "editor">
  ) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    
    const newComponent: AdComponentItem = {
      ...component,
      id: generateId(),
      templateCount: 0,
      editor: "admin@adtalos.com",
      updateTime: timeStr,
    };

    setComponents(prev => {
      const updated = [newComponent, ...prev];
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // 更新组件
  const updateComponent = useCallback((id: string, updates: Partial<AdComponentItem>) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    
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
  const deleteComponent = useCallback((id: string) => {
    setComponents(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // 切换状态
  const toggleStatus = useCallback((id: string) => {
    setComponents(prev => {
      const updated = prev.map(item =>
        item.id === id
          ? { ...item, status: item.status === "enabled" ? "disabled" : "enabled" as ComponentStatus }
          : item
      );
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // 获取单个组件
  const getComponent = useCallback((id: string) => {
    return components.find(item => item.id === id);
  }, [components]);

  return (
    <ComponentContext.Provider value={{
      components: isInitialized ? components : initialComponents,
      addComponent,
      updateComponent,
      deleteComponent,
      toggleStatus,
      getComponent,
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
