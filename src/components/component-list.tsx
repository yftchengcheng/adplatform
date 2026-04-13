"use client";

import React, { useState, useMemo, useCallback } from "react";
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
import { AdComponent, ComponentFilters, PaginationState } from "@/lib/component-types";
import { mockComponents } from "@/lib/component-types";

export function ComponentList() {
  // 状态
  const [components, setComponents] = useState<AdComponent[]>(mockComponents);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<ComponentFilters>({
    category: "all",
    type: "all",
    status: "all",
    keyword: "",
  });
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: mockComponents.length,
  });
  const [sortField, setSortField] = useState<string>("updateTime");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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
    setComponents((prev) =>
      prev.map((item) =>
        selectedIds.has(item.id) ? { ...item, status: "enabled" } : item
      )
    );
    setSelectedIds(new Set());
  };

  const handleBatchDisable = () => {
    setComponents((prev) =>
      prev.map((item) =>
        selectedIds.has(item.id) ? { ...item, status: "disabled" } : item
      )
    );
    setSelectedIds(new Set());
  };

  // 单个操作
  const handleToggleStatus = (id: string) => {
    setComponents((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "enabled" ? "disabled" : "enabled" }
          : item
      )
    );
  };

  const handleDelete = (id: string) => {
    const component = components.find((item) => item.id === id);
    if (component && component.templateCount > 0) {
      alert(`组件"${component.name}"已被 ${component.templateCount} 个模板使用，无法删除`);
      return;
    }
    if (confirm(`确定要删除组件"${component?.name}"吗？`)) {
      setComponents((prev) => prev.filter((item) => item.id !== id));
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
      treasure_rain: "宝箱雨",
      scratch_card: "刮刮卡",
      smash_egg: "砸蛋",
      popup_redpacket: "弹窗(红包)",
      dual_button: "双按钮磁贴",
      vote: "投票磁贴",
      image: "图片磁贴",
      ecommerce: "电商磁贴",
      coupon: "优惠券磁贴",
      promotion_card: "推广卡片",
      game_gift: "游戏礼包码",
    };
    return typeMap[type] || type;
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
                      <button className="text-blue-500 hover:text-blue-600 hover:underline">
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
                      {component.updateTime}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
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
                          <DropdownMenuItem>
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
      </main>
    </div>
  );
}

export default ComponentList;
