"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Power,
  PowerOff,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ComponentFilters, PaginationState } from "@/lib/component-types";
import { useComponents, AdComponentItem } from "@/contexts/component-context";
import { AdTemplate, AdTemplateConfig } from "@/components/ad-template";
import { VoteTemplate, VoteTemplateConfig } from "@/components/vote-template";
import { ImageTemplate, ImageTemplateConfig } from "@/components/image-template";
import { EcommerceTemplate, EcommerceTemplateConfig } from "@/components/ecommerce-template";
import { CouponTemplate, CouponTemplateConfig } from "@/components/coupon-template";
import { PromotionTemplate, PromotionTemplateConfig } from "@/components/promotion-template";
import { GameGiftTemplate, GameGiftTemplateConfig } from "@/components/game-gift-template";
import { RedpacketRainTemplate, RedpacketRainTemplateConfig } from "@/components/redpacket-rain-template";
import { FlipRedpacketTemplate } from "@/components/flip-redpacket-template";
import { FlipRedpacketTemplateConfig } from "@/components/flip-redpacket-template-config";
import TreasureBoxTemplate from "@/components/treasurebox-template";
import { TreasureBoxConfig } from "@/components/treasurebox-template-config";
import FlipCardTemplate from "@/components/flip-card-template";
import { FlipCardConfig } from "@/components/flip-card-template-config";
import TreasureboxRainTemplate from "@/components/treasurebox-rain-template";
import { TreasureboxRainTemplateConfig } from "@/components/treasurebox-rain-template-config";

import { useRouter } from "next/navigation";

export function ComponentList() {
  const router = useRouter();
  const { components, toggleStatus, deleteComponent } = useComponents();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; templateCount: number } | null>(null);
  const [filters, setFilters] = useState<ComponentFilters>({
    category: "all",
    type: "all",
    status: "all",
    keyword: "",
  });
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const [sortField, setSortField] = useState<string>("updateTime");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [previewComponent, setPreviewComponent] = useState<AdComponentItem | null>(null);

  // 更新 total
  useEffect(() => {
    setPagination(prev => ({ ...prev, total: components.length }));
  }, [components.length]);

  // 筛选和分页后的数据
  const filteredData = useMemo(() => {
    let data = [...components];

    // 关键词筛选
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(keyword) ||
          item.id.toLowerCase().includes(keyword)
      );
    }

    // 分类筛选
    if (filters.category && filters.category !== "all") {
      data = data.filter((item) => item.category === filters.category);
    }

    // 类型筛选
    if (filters.type && filters.type !== "all") {
      data = data.filter((item) => item.type === filters.type);
    }

    // 状态筛选
    if (filters.status && filters.status !== "all") {
      data = data.filter((item) => item.status === filters.status);
    }

    // 排序
    data.sort((a, b) => {
      const aValue = a[sortField as keyof AdComponent];
      const bValue = b[sortField as keyof AdComponent];
      if (aValue === undefined || bValue === undefined) return 0;
      if (sortOrder === "asc") {
        return String(aValue).localeCompare(String(bValue));
      }
      return String(bValue).localeCompare(String(aValue));
    });

    return data;
  }, [components, filters, sortField, sortOrder]);

  // 分页数据
  const paginatedData = useMemo(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, pagination.page, pagination.pageSize]);

  // 总页数
  const totalPages = Math.ceil(filteredData.length / pagination.pageSize);

  // 全选逻辑
  const allSelected = paginatedData.length > 0 && paginatedData.every((item) => selectedIds.has(item.id));

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        paginatedData.forEach((item) => newSet.delete(item.id));
        return newSet;
      });
    } else {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        paginatedData.forEach((item) => newSet.add(item.id));
        return newSet;
      });
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // 排序
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // 筛选更新
  const handleFilterChange = useCallback((key: keyof ComponentFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // 搜索
  const handleSearch = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, keyword: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // 分页
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  // 批量操作
  const handleBatchEnable = () => {
    selectedIds.forEach(id => {
      const comp = components.find(c => c.id === id);
      if (comp && comp.status === "disabled") {
        toggleStatus(id);
      }
    });
    setSelectedIds(new Set());
  };

  const handleBatchDisable = () => {
    selectedIds.forEach(id => {
      const comp = components.find(c => c.id === id);
      if (comp && comp.status === "enabled") {
        toggleStatus(id);
      }
    });
    setSelectedIds(new Set());
  };

  // 单个操作
  const handleToggleStatus = (id: string) => {
    toggleStatus(id);
  };

  // 编辑组件
  const handleEdit = (component: AdComponentItem) => {
    // 跳转到配置页面，传递组件ID
    router.push(`/components/config?type=${component.type}&id=${component.id}`);
  };

  const handleDelete = (id: string) => {
    const component = components.find((item) => item.id === id);
    if (component) {
      setDeleteTarget({
        id: component.id,
        name: component.name,
        templateCount: component.templateCount,
      });
    }
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      if (deleteTarget.templateCount > 0) {
        // 无法删除，显示提示
        setDeleteTarget(null);
        return;
      }
      deleteComponent(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  // 渲染状态徽章
  const renderStatus = (status: "enabled" | "disabled") => (
    <div className="flex items-center gap-2">
      <span
        className={`w-2 h-2 rounded-full ${
          status === "enabled" ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <span className={status === "enabled" ? "text-green-600" : "text-red-600"}>
        {status === "enabled" ? "开启" : "暂停"}
      </span>
    </div>
  );

  // 渲染分类标签
  const renderCategory = (category: "static" | "animation") => (
    <Badge
      variant="secondary"
      className={
        category === "static"
          ? "bg-gray-100 text-gray-700 hover:bg-gray-100"
          : "bg-purple-100 text-purple-700 hover:bg-purple-100"
      }
    >
      {category === "static" ? "静态类" : "动效类"}
    </Badge>
  );

  // 组件类型中文名
  const getTypeName = (type: string): string => {
    const typeMap: Record<string, string> = {
      redpacket_rain: "红包雨",
      flip_card: "翻卡",
      flip_redpacket: "翻红包",
      flip_treasure: "翻宝箱",
      treasurebox_rain: "宝箱雨",
      treasure_rain: "宝箱雨",
      scratch_card: "刮刮卡",
      smash_egg: "砸蛋",
      popup_redpacket: "弹窗(红包)",
      dual_button: "选择磁贴(双按钮)",
      vote: "投票磁贴",
      image: "图片磁贴",
      ecommerce: "电商磁贴",
      coupon: "优惠券磁贴",
      promotion_card: "推广卡片",
      game_gift: "游戏礼包码",
    };
    return typeMap[type] || type;
  };

  // 格式化时间显示
  const formatTime = (timeStr: string): string => {
    if (!timeStr) return "-";
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">组件列表</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                管理和配置您的广告组件
              </p>
            </div>
            <Link href="/components/create">
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                创建
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Left: Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <Select
                value={filters.category}
                onValueChange={(v) => handleFilterChange("category", v)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="组件分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">不限</SelectItem>
                  <SelectItem value="static">静态类</SelectItem>
                  <SelectItem value="animation">动效类</SelectItem>
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select
                value={filters.type}
                onValueChange={(v) => handleFilterChange("type", v)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="组件类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">不限</SelectItem>
                  <SelectItem value="redpacket_rain">红包雨</SelectItem>
                  <SelectItem value="flip_card">翻卡</SelectItem>
                  <SelectItem value="flip_treasure">翻宝箱</SelectItem>
                  <SelectItem value="scratch_card">刮刮卡</SelectItem>
                  <SelectItem value="smash_egg">砸蛋</SelectItem>
                  <SelectItem value="dual_button">双按钮磁贴</SelectItem>
                  <SelectItem value="vote">投票磁贴</SelectItem>
                  <SelectItem value="image">图片磁贴</SelectItem>
                  <SelectItem value="ecommerce">电商磁贴</SelectItem>
                  <SelectItem value="coupon">优惠券磁贴</SelectItem>
                  <SelectItem value="promotion_card">推广卡片</SelectItem>
                  <SelectItem value="game_gift">游戏礼包码</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select
                value={filters.status}
                onValueChange={(v) => handleFilterChange("status", v)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="组件状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">不限</SelectItem>
                  <SelectItem value="enabled">开启</SelectItem>
                  <SelectItem value="disabled">暂停</SelectItem>
                </SelectContent>
              </Select>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="请输入搜索关键字"
                  value={filters.keyword}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-[200px] pl-9"
                />
              </div>
            </div>

            {/* Right: Batch Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBatchEnable}
                disabled={selectedIds.size === 0}
              >
                批量开启
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBatchDisable}
                disabled={selectedIds.size === 0}
              >
                批量暂停
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-[50px]">
                  <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />
                </TableHead>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead className="w-[100px]">组件预览</TableHead>
                <TableHead className="w-[200px]">组件名称</TableHead>
                <TableHead className="w-[100px]">组件分类</TableHead>
                <TableHead className="w-[120px]">组件类型</TableHead>
                <TableHead className="w-[120px]">关联模板数量</TableHead>
                <TableHead
                  className="w-[100px] cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    组件状态
                    {sortField === "status" &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="w-[150px]">编辑人</TableHead>
                <TableHead
                  className="w-[160px] cursor-pointer"
                  onClick={() => handleSort("updateTime")}
                >
                  <div className="flex items-center gap-1">
                    编辑时间
                    {sortField === "updateTime" &&
                      (sortOrder === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead className="w-[140px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((component) => (
                  <TableRow
                    key={component.id}
                    className="hover:bg-gray-50"
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(component.id)}
                        onCheckedChange={() => handleSelectItem(component.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">{component.id}</TableCell>
                    <TableCell>
                      <button 
                        className="text-blue-500 hover:text-blue-600 hover:underline"
                        onClick={() => setPreviewComponent(component)}
                      >
                        查看
                      </button>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium text-gray-900">{component.name}</span>
                        {component.tags && component.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {component.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs px-1.5 py-0"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{renderCategory(component.category)}</TableCell>
                    <TableCell className="text-gray-600">
                      {getTypeName(component.type)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={
                          component.templateCount > 0
                            ? "text-blue-500 font-medium"
                            : "text-gray-500"
                        }
                      >
                        {component.templateCount}
                      </span>
                    </TableCell>
                    <TableCell>{renderStatus(component.status)}</TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {component.editor}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {formatTime(component.updateTime)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(component)}>
                            <Edit className="w-4 h-4 mr-2" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(component.id)}>
                            {component.status === "enabled" ? (
                              <>
                                <PowerOff className="w-4 h-4 mr-2" />
                                暂停
                              </>
                            ) : (
                              <>
                                <Power className="w-4 h-4 mr-2" />
                                开启
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => setPreviewComponent(component)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            预览
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(component.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              共 {filteredData.length} 条记录
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? "default" : "outline"}
                    size="sm"
                    className={
                      pagination.page === pageNum
                        ? "bg-blue-500 hover:bg-blue-600"
                        : ""
                    }
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={pagination.page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Modal - 手机模拟器样式 */}
        <Dialog open={!!previewComponent} onOpenChange={() => setPreviewComponent(null)}>
          <DialogContent className="max-w-2xl p-0 overflow-hidden">
            <DialogTitle className="sr-only">
              组件预览 - {previewComponent?.name}
            </DialogTitle>
            
            {/* 预览区域 - 手机模拟器 */}
            <div className="p-8 bg-gradient-to-b from-gray-100 to-gray-200 flex justify-center">
              <div className="relative">
                {/* 手机边框 */}
                <div className="w-[375px] h-[667px] bg-white rounded-[3rem] shadow-2xl overflow-hidden border-[12px] border-gray-800 relative">
                  {/* 刘海区域 */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-10"></div>
                  
                  {/* 状态栏 */}
                  <div className="h-12 bg-white flex items-end justify-between px-6 pb-1">
                    <span className="text-xs font-medium">9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-2 border border-gray-400 rounded-sm">
                        <div className="w-3 h-1 bg-gray-400 rounded-sm m-px"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 内容区域 */}
                  <div className="h-[calc(100%-96px)] overflow-hidden flex items-center justify-center">
                    {/* 支持所有有 config 的组件类型 */}
                    {previewComponent?.config ? (
                      previewComponent?.type === "promotion_card" ? (
                        <PromotionTemplate
                          config={previewComponent.config as unknown as PromotionTemplateConfig}
                          isOpen={true}
                          previewMode={true}
                        />
                      ) : previewComponent?.type === "coupon" ? (
                        <CouponTemplate
                          config={previewComponent.config as unknown as CouponTemplateConfig}
                          isOpen={true}
                          previewMode={true}
                        />
                      ) : previewComponent?.type === "ecommerce" ? (
                        <EcommerceTemplate
                          config={previewComponent.config as unknown as EcommerceTemplateConfig}
                          isOpen={true}
                          previewMode={true}
                        />
                      ) : previewComponent?.type === "image" ? (
                        <ImageTemplate
                          config={previewComponent.config as unknown as ImageTemplateConfig}
                          isOpen={true}
                          previewMode={true}
                        />
                      ) : previewComponent?.type === "vote" ? (
                        <VoteTemplate
                          config={previewComponent.config as unknown as VoteTemplateConfig}
                          isOpen={true}
                          previewMode={true}
                        />
                      ) : previewComponent?.type === "game_gift" ? (
                        <GameGiftTemplate
                          config={previewComponent.config as unknown as GameGiftTemplateConfig}
                          isOpen={true}
                          previewMode={true}
                        />
                      ) : previewComponent?.type === "redpacket_rain" ? (
                        <div className="w-full px-2">
                          <RedpacketRainTemplate
                            config={previewComponent.config as unknown as RedpacketRainTemplateConfig}
                            isOpen={true}
                            previewMode={true}
                            onClose={() => {}}
                          />
                        </div>
                      ) : previewComponent?.type === "flip_redpacket" ? (
                        <div className="w-full px-2">
                          <FlipRedpacketTemplate
                            config={previewComponent.config as unknown as FlipRedpacketTemplateConfig}
                            isOpen={true}
                            previewMode={true}
                            onClose={() => {}}
                          />
                        </div>
                      ) : previewComponent?.type === "flip_treasure" ? (
                        <div className="w-full px-2">
                          <TreasureBoxTemplate
                            config={previewComponent.config as unknown as TreasureBoxConfig}
                            isOpen={true}
                            previewMode={true}
                            onClose={() => {}}
                          />
                        </div>
                      ) : previewComponent?.type === "flip_card" ? (
                        <div className="w-full px-2">
                          <FlipCardTemplate
                            config={previewComponent.config as unknown as FlipCardConfig}
                            isOpen={true}
                            previewMode={true}
                            onClose={() => {}}
                          />
                        </div>
                      ) : previewComponent?.type === "treasurebox_rain" ? (
                        <div className="w-full px-2">
                          <TreasureboxRainTemplate
                            config={previewComponent.config as unknown as TreasureboxRainTemplateConfig}
                            isOpen={true}
                            previewMode={true}
                            onClose={() => {}}
                          />
                        </div>
                      ) : (
                        // 默认使用 AdTemplate（双按钮磁贴）
                        <AdTemplate
                          config={previewComponent.config as unknown as AdTemplateConfig}
                          isOpen={true}
                          previewMode={true}
                          onClose={() => {}}
                        />
                      )
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400">
                        <div className="text-center p-6">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <Eye className="w-8 h-8" />
                          </div>
                          <p className="text-sm">该组件暂无配置数据</p>
                          <p className="text-xs mt-2 text-gray-400">
                            请先编辑并保存组件配置
                          </p>
                          <p className="text-xs mt-1 text-gray-500">
                            类型: {previewComponent?.type}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Home 指示条 */}
                  <div className="h-8 bg-white flex items-center justify-center">
                    <div className="w-32 h-1 bg-gray-300 rounded-full"></div>
                  </div>
                </div>
                
                {/* 底部标签 */}
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-center">
                  <p className="text-xs text-gray-500">iPhone 尺寸预览 (375×667)</p>
                </div>
              </div>
            </div>
            
            {/* 底部信息 */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-gray-500">
                    <span className="font-medium text-gray-700">{previewComponent?.name}</span>
                    <span className="ml-2 font-mono text-xs text-gray-400">{previewComponent?.id}</span>
                  </span>
                  <Badge variant={previewComponent?.status === "enabled" ? "default" : "secondary"}>
                    {previewComponent?.status === "enabled" ? "已启用" : "已暂停"}
                  </Badge>
                </div>
                <Link
                  href={`/components/config?type=${previewComponent?.type}`}
                  className="text-blue-500 hover:text-blue-600 hover:underline"
                  onClick={() => setPreviewComponent(null)}
                >
                  编辑组件
                </Link>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 删除确认弹窗 */}
        <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {deleteTarget?.templateCount && deleteTarget.templateCount > 0
                  ? "无法删除组件"
                  : "确认删除"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {deleteTarget?.templateCount && deleteTarget.templateCount > 0
                  ? `组件"${deleteTarget?.name}"已被 ${deleteTarget?.templateCount} 个模板使用，无法删除。请先解除关联后再尝试删除。`
                  : `确定要删除组件"${deleteTarget?.name}"吗？此操作不可撤销。`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              {!(deleteTarget?.templateCount && deleteTarget.templateCount > 0) && (
                <AlertDialogAction
                  onClick={handleConfirmDelete}
                  className="bg-red-500 hover:bg-red-600"
                >
                  删除
                </AlertDialogAction>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}

export default ComponentList;
