// 组件类型枚举
export type ComponentCategory = "static" | "animation";
export type ComponentType = 
  | "redpacket_rain"    // 红包雨
  | "flip_card"          // 翻卡
  | "flip_redpacket"     // 翻红包
  | "flip_treasure"      // 翻宝箱
  | "treasure_rain"      // 宝箱雨
  | "scratch_card"       // 刮刮卡
  | "smash_egg"          // 砸蛋
  | "popup_redpacket"    // 弹窗(红包)
  | "dual_button"        // 双按钮磁贴
  | "vote"               // 投票磁贴
  | "image"              // 图片磁贴
  | "ecommerce"          // 电商磁贴
  | "coupon"            // 优惠券磁贴
  | "promotion_card"    // 推广卡片
  | "game_gift"         // 游戏礼包码
  | "floating_window"   // 浮窗
  | "download_six_elements"; // 下载六要素

// 组件样式模板（用于选择页面）
export interface ComponentStyleTemplate {
  id: ComponentType;
  name: string;
  category: ComponentCategory;
  description: string;
  icon: string;
  preview?: string;
}

// 组件样式模板列表
export const componentStyleTemplates: ComponentStyleTemplate[] = [
  // 静态组件
  {
    id: "dual_button",
    name: "选择磁贴(双按钮)",
    category: "static",
    description: "上文下按钮结构，支持跳转落地页或显示图片",
    icon: "layout-grid",
  },
  {
    id: "vote",
    name: "投票磁贴",
    category: "static",
    description: "用于留资收集，收集用户投票信息",
    icon: "check-square",
  },
  {
    id: "image",
    name: "图片磁贴",
    category: "static",
    description: "纯图片展示，支持点击跳转",
    icon: "image",
  },
  {
    id: "ecommerce",
    name: "电商磁贴",
    category: "static",
    description: "电商场景专用，展示商品信息",
    icon: "shopping-bag",
  },
  {
    id: "coupon",
    name: "优惠券磁贴",
    category: "static",
    description: "优惠券领取组件",
    icon: "ticket",
  },
  {
    id: "promotion_card",
    name: "推广卡片",
    category: "static",
    description: "推广信息展示，最多叠加10个",
    icon: "layers",
  },
  {
    id: "game_gift",
    name: "游戏礼包码",
    category: "static",
    description: "游戏礼包码领取组件",
    icon: "gift",
  },
  {
    id: "floating_window",
    name: "浮窗",
    category: "animation",
    description: "左图右文浮窗，支持推广卖点轮播",
    icon: "panel-top",
  },
  // 动效组件
  {
    id: "redpacket_rain",
    name: "红包雨",
    category: "animation",
    description: "红包从顶部降落，吸引用户点击",
    icon: "dollar-sign",
  },
  {
    id: "flip_card",
    name: "翻卡",
    category: "animation",
    description: "翻牌互动，揭晓隐藏奖励",
    icon: "layers-3",
  },
  {
    id: "flip_redpacket",
    name: "翻红包",
    category: "animation",
    description: "翻动红包获取奖励",
    icon: "gift",
  },
  {
    id: "flip_treasure",
    name: "翻宝箱",
    category: "animation",
    description: "开启宝箱获取惊喜奖励",
    icon: "box",
  },
  {
    id: "treasure_rain",
    name: "宝箱雨",
    category: "animation",
    description: "宝箱从顶部降落",
    icon: "cloud-rain",
  },
  {
    id: "scratch_card",
    name: "刮刮卡",
    category: "animation",
    description: "刮开涂层揭晓奖励",
    icon: "pen-tool",
  },
  {
    id: "smash_egg",
    name: "砸蛋",
    category: "animation",
    description: "砸碎金蛋获取奖励",
    icon: "egg",
  },
  {
    id: "popup_redpacket",
    name: "弹窗(红包)",
    category: "animation",
    description: "弹窗形式展示红包",
    icon: "bell",
  },
  {
    id: "download_six_elements",
    name: "下载六要素",
    category: "static",
    description: "应用商店下载落地页（应用名称/开发者/版本/隐私/权限/功能）",
    icon: "package",
  },
];
export type ComponentStatus = "enabled" | "disabled";

// 组件分类映射
export const ComponentCategoryMap: Record<ComponentCategory, string> = {
  static: "静态类",
  animation: "动效类",
};

// 组件类型映射
export const ComponentTypeMap: Record<ComponentType, string> = {
  redpacket_rain: "红包雨",
  flip_card: "翻卡",
  flip_redpacket: "翻红包",
  flip_treasure: "翻宝箱",
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
  floating_window: "浮窗",
  download_six_elements: "下载六要素",
};

// 组件状态映射
export const ComponentStatusMap: Record<ComponentStatus, string> = {
  enabled: "开启",
  disabled: "暂停",
};

// 组件数据接口
export interface AdComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  type: ComponentType;
  templateCount: number;
  status: ComponentStatus;
  editor: string;
  updateTime: string;
  tags?: string[];
  previewUrl?: string;
}

// 筛选条件接口
export interface ComponentFilters {
  category?: ComponentCategory | "all";
  type?: ComponentType | "all";
  status?: ComponentStatus | "all";
  keyword?: string;
}

// 分页接口
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

// 模拟数据
export const mockComponents: AdComponent[] = [
  {
    id: "100001",
    name: "限时特惠活动",
    category: "static",
    type: "dual_button",
    templateCount: 10,
    status: "enabled",
    editor: "yufutang@adtalos.com",
    updateTime: "2026-04-13 10:30:00",
    tags: ["电商", "促销"],
  },
  {
    id: "100002",
    name: "新用户红包雨",
    category: "animation",
    type: "redpacket_rain",
    templateCount: 5,
    status: "enabled",
    editor: "admin@adtalos.com",
    updateTime: "2026-04-12 15:20:00",
    tags: ["游戏", "红包"],
  },
  {
    id: "100003",
    name: "会员专享优惠券",
    category: "static",
    type: "coupon",
    templateCount: 16,
    status: "enabled",
    editor: "yufutang@adtalos.com",
    updateTime: "2026-04-11 09:45:00",
    tags: ["电商", "会员"],
  },
  {
    id: "100004",
    name: "翻宝箱抽奖",
    category: "animation",
    type: "flip_treasure",
    templateCount: 8,
    status: "disabled",
    editor: "editor@adtalos.com",
    updateTime: "2026-04-10 14:30:00",
    tags: ["游戏", "抽奖"],
  },
  {
    id: "100005",
    name: "图片展示卡片",
    category: "static",
    type: "image",
    templateCount: 12,
    status: "enabled",
    editor: "yufutang@adtalos.com",
    updateTime: "2026-04-09 11:00:00",
    tags: ["展示"],
  },
  {
    id: "100006",
    name: "电商促销推广",
    category: "static",
    type: "promotion_card",
    templateCount: 20,
    status: "enabled",
    editor: "marketing@adtalos.com",
    updateTime: "2026-04-08 16:45:00",
    tags: ["电商", "推广"],
  },
  {
    id: "100007",
    name: "刮刮卡惊喜",
    category: "animation",
    type: "scratch_card",
    templateCount: 3,
    status: "enabled",
    editor: "admin@adtalos.com",
    updateTime: "2026-04-07 10:15:00",
    tags: ["游戏", "惊喜"],
  },
  {
    id: "100008",
    name: "投票收集表单",
    category: "static",
    type: "vote",
    templateCount: 7,
    status: "disabled",
    editor: "yufutang@adtalos.com",
    updateTime: "2026-04-06 13:30:00",
    tags: ["留资"],
  },
  {
    id: "100009",
    name: "游戏礼包码",
    category: "static",
    type: "game_gift",
    templateCount: 15,
    status: "enabled",
    editor: "game@adtalos.com",
    updateTime: "2026-04-05 09:00:00",
    tags: ["游戏", "礼包"],
  },
  {
    id: "100010",
    name: "翻卡互动",
    category: "animation",
    type: "flip_card",
    templateCount: 6,
    status: "enabled",
    editor: "admin@adtalos.com",
    updateTime: "2026-04-04 15:30:00",
    tags: ["游戏", "互动"],
  },
];
