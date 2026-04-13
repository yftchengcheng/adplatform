"use client";

import React, { useState, useCallback } from "react";
import { Plus, Trash2, GripVertical, ChevronDown } from "lucide-react";
import { VoteTemplateConfig, VoteOption } from "./vote-template";

// 字符计数器组件
function CharCounter({ current, max }: { current: number; max: number }) {
  const isOver = current > max;
  return (
    <span className={`text-xs ${isOver ? "text-red-500" : "text-gray-400"}`}>
      {current}/{max}
    </span>
  );
}

// 模式选择组件
function ModeSelector({
  value,
  onChange,
  macroPlaceholder,
  inputPlaceholder,
  macroVariables,
  maxLength,
  label,
}: {
  value: string;
  onChange: (value: string, isMacro: boolean) => void;
  macroPlaceholder?: string;
  inputPlaceholder?: string;
  macroVariables?: Record<string, string>;
  maxLength?: number;
  label?: string;
}) {
  const [mode, setMode] = useState<"input" | "macro">(
    value?.startsWith("${") ? "macro" : "input"
  );
  const [inputValue, setInputValue] = useState(value?.startsWith("${") ? "" : value);
  const [macroValue, setMacroValue] = useState(
    value?.startsWith("${") ? value : ""
  );

  const handleModeChange = (newMode: "input" | "macro") => {
    setMode(newMode);
    if (newMode === "input") {
      onChange(inputValue, false);
    } else {
      onChange(macroValue || "${var}", true);
    }
  };

  const handleInputChange = (val: string) => {
    setInputValue(val);
    if (mode === "input") {
      onChange(val, false);
    }
  };

  const handleMacroChange = (val: string) => {
    setMacroValue(val);
    if (mode === "macro") {
      onChange(val, true);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          <div className="flex items-center gap-2">
            <select
              value={mode}
              onChange={(e) => handleModeChange(e.target.value as "input" | "macro")}
              className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600"
            >
              <option value="input">输入模式</option>
              <option value="macro">宏模式</option>
            </select>
          </div>
        </div>
      )}
      
      {mode === "input" ? (
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={inputPlaceholder}
            maxLength={maxLength}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {maxLength && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <CharCounter current={inputValue.length} max={maxLength} />
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            value={macroValue}
            onChange={(e) => handleMacroChange(e.target.value)}
            placeholder={macroPlaceholder || "${变量名}"}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </div>
        </div>
      )}

      {/* 宏变量提示 */}
      {mode === "macro" && macroVariables && Object.keys(macroVariables).length > 0 && (
        <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-2">
          可用变量:{" "}
          {Object.keys(macroVariables).map((key) => (
            <code key={key} className="mx-1 text-blue-500">
              $&#123;{key}&#125;
            </code>
          ))}
        </div>
      )}
    </div>
  );
}

// 投票选项编辑组件
function VoteOptionEditor({
  option,
  onChange,
  onDelete,
  index,
}: {
  option: VoteOption;
  onChange: (option: VoteOption) => void;
  onDelete: () => void;
  index: number;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
          <span className="text-sm font-medium text-gray-600">选项 {index + 1}</span>
        </div>
        <button
          onClick={onDelete}
          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {/* 选项文字 */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">选项文字</label>
          <div className="relative">
            <input
              type="text"
              value={option.text}
              onChange={(e) => onChange({ ...option, text: e.target.value })}
              placeholder="例如：选项一"
              maxLength={20}
              className="w-full h-9 px-3 pr-12 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              {option.text.length}/20
            </span>
          </div>
        </div>

        {/* 按钮文案 */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">按钮文案</label>
          <div className="relative">
            <input
              type="text"
              value={option.buttonText}
              onChange={(e) => onChange({ ...option, buttonText: e.target.value })}
              placeholder="例如：选择"
              maxLength={16}
              className="w-full h-9 px-3 pr-12 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              {option.buttonText.length}/16
            </span>
          </div>
        </div>

        {/* 投票占比 */}
        <div>
          <label className="text-xs text-gray-500 mb-1 block">投票占比 (%)</label>
          <input
            type="number"
            value={option.percentage}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              onChange({ ...option, percentage: Math.min(100, Math.max(0, val)) });
            }}
            min={0}
            max={100}
            className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

// 投票组件配置面板
export function VoteTemplateConfigPanel({
  config,
  onChange,
  onSave,
}: {
  config: VoteTemplateConfig;
  onChange: (config: VoteTemplateConfig) => void;
  onSave?: () => void;
}) {
  const updateConfig = useCallback(
    (updates: Partial<VoteTemplateConfig>) => {
      onChange({ ...config, ...updates });
    },
    [config, onChange]
  );

  const updateOption = useCallback(
    (index: number, option: VoteOption) => {
      const newOptions = [...(config.options || [])];
      newOptions[index] = option;
      updateConfig({ options: newOptions });
    },
    [config.options, updateConfig]
  );

  const addOption = useCallback(() => {
    const newOption: VoteOption = {
      id: Date.now().toString(),
      text: `选项${(config.options?.length || 0) + 1}`,
      percentage: 0,
      buttonText: "选择",
    };
    updateConfig({ options: [...(config.options || []), newOption] });
  }, [config.options, updateConfig]);

  const deleteOption = useCallback(
    (index: number) => {
      const newOptions = (config.options || []).filter((_, i) => i !== index);
      updateConfig({ options: newOptions });
    },
    [config.options, updateConfig]
  );

  return (
    <div className="space-y-6">
      {/* 基础配置 */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2">
          基础配置
        </h3>

        {/* 主标题 */}
        <ModeSelector
          label="主标题"
          value={config.titleMacro || config.title}
          onChange={(value, isMacro) => {
            if (isMacro) {
              updateConfig({ titleMacro: value, title: "" });
            } else {
              updateConfig({ title: value, titleMacro: undefined });
            }
          }}
          macroPlaceholder="${title}"
          inputPlaceholder="请输入主标题"
          macroVariables={config.macroVariables}
          maxLength={24}
        />

        {/* 副标题 */}
        <ModeSelector
          label="副标题"
          value={config.subtitleMacro || config.subtitle}
          onChange={(value, isMacro) => {
            if (isMacro) {
              updateConfig({ subtitleMacro: value, subtitle: "" });
            } else {
              updateConfig({ subtitle: value, subtitleMacro: undefined });
            }
          }}
          macroPlaceholder="${subtitle}"
          inputPlaceholder="请输入副标题"
          macroVariables={config.macroVariables}
          maxLength={60}
        />

        {/* 点击结果文案 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">点击结果文案</label>
          </div>
          <div className="relative">
            <input
              type="text"
              value={config.clickResultText || ""}
              onChange={(e) => updateConfig({ clickResultText: e.target.value })}
              placeholder="例如：投票成功"
              maxLength={16}
              className="w-full h-10 px-3 pr-14 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <CharCounter current={config.clickResultText?.length || 0} max={16} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-1">最多16个字符</p>
        </div>
      </div>

      {/* 投票选项 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">投票选项</h3>
          <button
            onClick={addOption}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加选项
          </button>
        </div>

        <div className="space-y-3">
          {config.options?.map((option, index) => (
            <VoteOptionEditor
              key={option.id}
              option={option}
              index={index}
              onChange={(opt) => updateOption(index, opt)}
              onDelete={() => deleteOption(index)}
            />
          ))}

          {(!config.options || config.options.length === 0) && (
            <div className="text-center py-8 text-gray-400 text-sm">
              暂无投票选项，点击上方按钮添加
            </div>
          )}
        </div>
      </div>

      {/* 落地页配置 */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2">
          落地页配置
        </h3>

        {/* 动作类型 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">点击动作</label>
          <select
            value={config.action}
            onChange={(e) => updateConfig({ action: e.target.value as "jump" | "show_image" })}
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="jump">跳转落地页</option>
            <option value="show_image">显示图片</option>
          </select>
        </div>

        {/* 落地页链接 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            落地页链接
          </label>
          <input
            type="text"
            value={config.landingPageUrl || ""}
            onChange={(e) => updateConfig({ landingPageUrl: e.target.value })}
            placeholder="输入落地页 URL"
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">*不配置默认使用广告(素材)链接</p>
        </div>

        {/* 落地页宏 */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            落地页宏
          </label>
          <input
            type="text"
            value={config.landingPageMacro || ""}
            onChange={(e) => updateConfig({ landingPageMacro: e.target.value })}
            placeholder="${landing_url}"
            className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 宏变量配置 */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-2">
          宏变量配置
        </h3>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="变量名"
                className="flex-1 h-9 px-3 border border-gray-200 rounded-lg text-sm"
              />
              <input
                type="text"
                placeholder="变量值"
                className="flex-1 h-9 px-3 border border-gray-200 rounded-lg text-sm"
              />
              <button className="px-3 py-2 text-blue-500 hover:bg-blue-100 rounded-lg">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {config.macroVariables && Object.keys(config.macroVariables).length > 0 && (
              <div className="space-y-2 pt-2">
                {Object.entries(config.macroVariables).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                      $&#123;{key}&#125;
                    </code>
                    <span className="text-gray-400">=</span>
                    <code className="flex-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded truncate">
                      {value}
                    </code>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-4 bg-white border-t border-gray-200">
        <div className="flex gap-3">
          <button className="flex-1 h-10 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
            取消
          </button>
          <button className="flex-1 h-10 rounded-lg border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
            上一步
          </button>
          <button 
            onClick={onSave}
            className="flex-1 h-10 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
