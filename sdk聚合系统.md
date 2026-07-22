广告SDK聚合平台 - 完整实施方案（PRD + 技术设计 V2.0）

本文档整合了先前所有讨论内容（含Taku/GroMore优势借鉴、MVP修正策略、五种广告容器适配器定义及三级Token规范），输出一份可直接指导开发的最终完整方案。
文档信息

项目	内容
文档名称	广告SDK聚合平台完整实施方案
版本	V2.0（最终整合版）
目标上线周期	12周（3个月）
团队配置	后端2人 + Android 1人 + iOS 1人 + 前端1人（共5人）
核心设计原则	服务端只做配置分发与数据收集，策略排序在客户端完成
第一部分：唯一标识符（Token）体系规范（最高优先级）

设计原则：开发者、应用、广告位三级Token构成全链路数据血缘的基础，所有请求、上报、报表、定向均围绕此体系展开。
1.1 三级Token定义

主体	标识符名称	格式规范	长度	用途	生成时机
开发者	developer_id	dev_ + 16位Base62	20字符	顶层数据隔离、API鉴权、跨应用汇总	注册邮箱验证通过
应用	app_key	app_ + 16位Base62	20字符	SDK初始化凭证、数据上报必填维度、流量分组一级键	创建应用时
广告位	placement_id	pl_ + 16位Base62	20字符	广告加载定位、瀑布流关联键、精细化统计维度	创建广告位时
API调用	api_access_token	api_ + 32位Base62	36字符	Open API调用鉴权（独立于developer_id）	开发者主动生成/刷新
Base62字符集：ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789（共62个），16位长度碰撞概率 ≈ 1/4.7×10²⁸，完全满足全局唯一性。

1.2 生成算法（服务端强制标准）

java
// IdGenerator.java - 所有Token统一生成入口
@Component
public class IdGenerator {
    private static final String BASE62 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int TOKEN_LENGTH = 16;
    private static final int API_TOKEN_LENGTH = 32;

    public String genDeveloperId() {
        return "dev_" + generateRandomString(TOKEN_LENGTH);
    }
    public String genAppKey() {
        return "app_" + generateRandomString(TOKEN_LENGTH);
    }
    public String genPlacementId() {
        return "pl_" + generateRandomString(TOKEN_LENGTH);
    }
    public String genApiAccessToken() {
        return "api_" + generateRandomString(API_TOKEN_LENGTH);
    }

    private String generateRandomString(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(BASE62.charAt(RANDOM.nextInt(BASE62.length())));
        }
        return sb.toString();
    }
}
1.3 Token在数据链路中的强制流转

text
┌─────────────────────────────────────────────────────────────────────────┐
│                    全链路Token强制携带规范                              │
├─────────────────────────────────────────────────────────────────────────┤
│  SDK初始化   →  必须携带 app_key                                       │
│  配置下发     →  响应必须返回 developer_id + app_key + placement_id     │
│  广告加载     →  必须携带 placement_id（SDK从缓存读取）                │
│  事件上报     →  必须携带 developer_id + app_key + placement_id（缺一不可）│
│  日报表聚合   →  按 developer_id → app_key → placement_id 逐级汇总     │
│  管理后台     →  以 developer_id 为顶层隔离，开发者仅见自己的数据       │
└─────────────────────────────────────────────────────────────────────────┘
第二部分：服务端完整PRD

2.1 登录与注册

2.1.1 注册流程

步骤	操作	说明
1	填写注册信息	邮箱、密码、公司名称、联系人、电话
2	选择接入方式	SDK接入 / API接入（单选）
3	邮箱验证	发送验证邮件，点击链接激活
4	生成developer_id	验证通过后系统自动生成（dev_ + 16位随机）
5	注册成功	进入控制台，developer_id在个人中心展示
注册字段：

字段	类型	必填	约束
邮箱	String	是	邮箱格式，唯一索引
密码	String	是	8-20位，含字母+数字
公司名称	String	是	≤50字符
联系人姓名	String	是	≤20字符
联系电话	String	是	手机号格式校验
接入方式	Enum	是	SDK接入 / API接入
2.1.2 登录功能

功能	说明
邮箱+密码登录	标准登录，失败5次锁定15分钟
JWT Token	有效期7天，支持Refresh Token续期
记住密码	前端存储加密凭证
忘记密码	通过邮箱发送重置链接
登出	清除服务端Session + 客户端Token
2.2 Dashboard（数据看板）

2.2.1 核心指标卡片（6项）

指标	计算逻辑	数据来源
今日预估收益	SUM(展示量 × eCPM / 1000)	SDK上报事实表实时计算
今日展示量	COUNT(event_type='impression')	SDK上报事实表
今日填充率	fills / requests × 100%	SDK上报事实表
今日eCPM	收益 / 展示量 × 1000	SDK上报事实表
活跃广告位	当日有展示的广告位去重计数	SDK上报事实表
7日ROI	(7日收益 - 7日成本) / 7日成本	需对接投放成本数据
2.2.2 趋势图表（4张）

图表	类型	指标	交互
收益趋势	折线图	日收益 / 累计收益	支持按app_key下钻
展示与填充率	双轴图（柱+线）	展示量（柱）+ 填充率（线）	支持按placement_id下钻
eCPM趋势	折线图	各广告位/广告源eCPM	支持筛选广告网络
广告位排行	水平柱状图	Top 10广告位按收益排序	点击跳转广告位详情
2.2.3 数据筛选条件

筛选项	类型	说明
时间范围	快捷+自定义	今日/昨日/近7日/近30日/自定义区间
应用	下拉多选	展示该开发者名下所有app_key列表
广告位	下拉多选	依赖应用筛选结果
广告网络	下拉多选	CSJ/YLH/KS/BD/SIGMOB
2.3 应用管理

2.3.1 应用管理（CRUD）

功能	操作说明	Token相关
创建应用	填写应用名称、包名、选择平台（Android/iOS）	自动生成app_key
应用列表	表格展示：应用名称、app_key、平台、状态、创建时间	app_key可复制
应用详情	展示应用完整信息 + 关联广告位列表	展示app_key并支持重新生成（需二次确认）
编辑	修改应用名称、分类、图标	不修改app_key
禁用/启用	切换应用状态	禁用后SDK初始化返回错误
删除	仅当应用下无广告位时可删除	删除后app_key永久失效
创建应用表单：

字段	必填	说明
应用名称	是	≤50字符
包名	是	Android包名 或 iOS Bundle ID
平台	是	Android / iOS
应用分类	否	游戏/工具/社交/电商/教育/娱乐/其他
应用图标	否	上传图片，自动裁剪为114×114
2.3.2 广告位管理（CRUD）

功能	操作说明	Token相关
创建广告位	选择所属应用、填写名称、选择广告格式	自动生成placement_id
广告位列表	展示：placement_id、名称、所属应用、格式、状态、今日数据	placement_id可复制
广告位详情	展示完整信息 + 关联瀑布流配置 + 数据概览	展示placement_id
编辑	修改名称、状态	不修改placement_id
禁用/启用	切换广告位状态	禁用后SDK加载该广告位返回错误
广告格式枚举：1:Banner / 2:插屏(Interstitial) / 3:激励视频(Rewarded) / 4:原生(Native) / 5:开屏(Splash)

2.4 瀑布流配置

2.4.1 广告源管理（先决条件）

广告源字段：

字段	必填	说明
广告网络	是	下拉选择：穿山甲/优量汇/快手/百度/Sigmob
广告源名称	是	自定义标识，如“穿山甲-激励视频-主”
三方App ID	是	在广告平台注册的应用ID
三方代码位ID	是	在广告平台申请的代码位/广告位ID
额外配置	否	JSON格式，各平台特殊参数
状态	-	默认启用
2.4.2 瀑布流三层模型

text
┌─────────────────────────────────────────────────────────────┐
│              第1层：Bidding（并行竞价层）                   │
│  所有竞价代码位同时请求，取实时出价最高者                    │
│  ↓ 若全部失败或无填充                                       │
├─────────────────────────────────────────────────────────────┤
│           第2层：Standard（标准价格层）                     │
│  按sort_price从高到低串行请求，成功即返回                   │
│  ↓ 若全部失败或无填充                                       │
├─────────────────────────────────────────────────────────────┤
│           第3层：Fallback（兜底层）                         │
│  无价格预期，按顺序请求，保填充率                           │
└─────────────────────────────────────────────────────────────┘
2.4.3 配置操作界面

操作	说明
添加代码位	从广告源列表选择，拖入对应层级
拖拽排序	标准层按期望价格从高到低排序（支持拖拽调整）
编辑排序价格	标准层每个代码位可设置sort_price（单位：元）
编辑超时时间	每个代码位单独设置超时（默认3000ms）
Bidding并行数	配置Bidding层最大并行数量（默认5）
保存	每次保存生成新version，SDK增量更新
复制	复制当前配置生成新版本
2.4.4 配置下发接口返回示例

json
{
  "code": 0,
  "data": {
    "developerId": "dev_aB3dEf9GhIjKlMnQ",
    "appKey": "app_XyZ9wKlMnOpQrStU",
    "placementId": "pl_PqRsT2uVwXyZ3aBc",
    "configVersion": 5,
    "isFullUpdate": true,
    "strategy": {
      "type": "hybrid",
      "parallelCount": 3,
      "layers": [
        {
          "layerId": "l1",
          "type": "bidding",
          "sources": [
            {"adSourceId": "src_001", "network": "CSJ", "timeout": 2500},
            {"adSourceId": "src_002", "network": "YLH", "timeout": 2500}
          ]
        },
        {
          "layerId": "l2",
          "type": "standard",
          "sources": [
            {"adSourceId": "src_003", "network": "KS", "sortPrice": 3.5, "timeout": 3000},
            {"adSourceId": "src_004", "network": "BD", "sortPrice": 2.0, "timeout": 3000}
          ]
        },
        {
          "layerId": "l3",
          "type": "fallback",
          "sources": [
            {"adSourceId": "src_005", "network": "SIGMOB", "sortPrice": 0, "timeout": 3500}
          ]
        }
      ]
    },
    "frequency": {
      "placementLimit": 5,
      "adSourceLimit": 3
    },
    "cacheConfig": {"preloadCount": 1, "cacheExpireSec": 1800},
    "reportUrl": "https://api.yourdomain.com/api/v1/report"
  }
}
2.5 流量分组

2.5.1 分组维度

维度	匹配方式	示例
国家/地区	IN / NOT IN	["CN","US","JP"]
省份/城市	IN / NOT IN	["广东","浙江"]
网络类型	IN	["WiFi","5G"]
APP版本	>= / <= / BETWEEN	"2.3.0"
SDK版本	>= / <=	"1.0.0"
操作系统版本	>= / <=	"12.0"
设备类型	IN	["phone","pad"]
设备品牌	IN	["Apple","Xiaomi","Huawei"]
渠道	IN	需SDK回传channel字段
自定义参数	EQ / IN	需SDK回传自定义Key-Value
2.5.2 分组配置流程

text
1. 瀑布流管理页 → 高级工具 → 添加流量分组
2. 填写分组名称（≤30字符）
3. 添加规则（多个规则为AND关系）
4. 为该分组选择独立的瀑布流配置（支持从默认分组复制）
5. 设置优先级（数字越小越优先）
6. 启用分组
7. SDK下次拉取配置时约30分钟内生效（受配置刷新周期控制）
2.5.3 分组匹配优先级

SDK上报用户设备信息 → 服务端按priority升序逐条匹配
首次匹配成功的分组生效 → 返回该分组绑定的瀑布流
全部未命中 → 返回默认分组的瀑布流
2.6 对账管理

2.6.1 数据来源

来源	说明	时效
SDK上报	客户端事件上报，实时收集	实时（T+0）
平台API拉取	各广告平台（穿山甲/优量汇等）报表API	T+1（次日凌晨拉取）
2.6.2 对账维度与字段

汇总视图（按开发者）：

字段	说明
广告平台	穿山甲/优量汇/快手/百度/Sigmob
广告位名称	聚合平台自定义名称
SDK展示量	聚合SDK上报的展示数
API展示量	广告平台API返回的展示数
SDK预估收益	聚合SDK上报计算收益
API实际结算	广告平台API返回结算金额
展示差异率	(SDK - API) / API × 100%
收益差异率	(SDK - API) / API × 100%
对账状态	✅一致 / ⚠️异常 / ⏳待确认
2.6.3 报表导出

格式：Excel (.xlsx)
支持按时间区间（月度/自定义）导出
导出字段与列表展示一致
2.7 个人中心

2.7.1 子模块

模块	功能
个人信息	姓名、公司、电话（可编辑）；developer_id、邮箱（不可编辑，展示并支持复制）
安全设置	修改密码（需验证旧密码）、绑定备用邮箱、登录记录（IP/时间/设备）
接入信息	展示developer_id、所有app_key列表、placement_id列表；支持一键复制
API管理（API接入用户）	生成api_access_token、刷新Token（旧Token立即失效）、查看调用日志
通知设置	消息接收方式（站内信/邮件）、接收类别（系统/公告/收益/告警）
2.8 文档与FAQ

2.8.1 文档分类

分类	文档列表
快速开始	5分钟接入指南、控制台操作导览
集成文档	Android SDK集成、iOS SDK集成、HarmonyOS SDK集成
配置指南	瀑布流配置最佳实践、流量分组策略、Bidding接入指南
API文档	服务端Open API接口文档（含签名机制）
适配器指南	各广告网络（CSJ/YLH/KS/BD/SIGMOB）接入配置说明
2.8.2 FAQ分类

分类	示例问题
接入问题	APP_KEY在哪获取？SDK初始化失败如何排查？
配置问题	Bidding层和标准层如何选择？为什么填充率低？
数据问题	数据延迟多久？为什么展示量和收益对不上？
结算问题	收益何时结算？如何提现？
技术问题	如何开启调试模式？错误码1001代表什么？
2.9 消息中心

2.9.1 消息类型

类型	Code	说明	推送方式
系统通知	1	平台系统级通知	站内信 + 邮件
运营公告	2	功能更新、运营活动	站内信
收益提醒	3	结算完成、对账异常	站内信 + 邮件
异常告警	4	填充率骤降、广告位异常	站内信 + 邮件（紧急）
2.9.2 功能列表

功能	说明
消息列表	按时间倒序，展示标题、类型、时间、已读/未读状态
分类筛选	全部 / 系统 / 公告 / 收益 / 告警
标记已读	单条标记 / 全部标记
消息详情	点击进入详情页，展示完整内容
红点提醒	未读消息数在顶部导航显示
第三部分：数据库设计（最终DDL）

3.1 核心表结构

sql
-- =====================================================
-- 1. 开发者表
-- =====================================================
CREATE TABLE `developer` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '内部自增主键',
    `developer_id` VARCHAR(32) UNIQUE NOT NULL COMMENT 'dev_xxx 对外唯一标识',
    `email` VARCHAR(100) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL COMMENT 'BCrypt加密',
    `company` VARCHAR(100),
    `contact_name` VARCHAR(50),
    `phone` VARCHAR(20),
    `access_type` TINYINT DEFAULT 1 COMMENT '1:SDK接入 2:API接入',
    `api_access_token` VARCHAR(64) UNIQUE DEFAULT NULL COMMENT 'api_xxx',
    `api_token_expire` DATETIME DEFAULT NULL,
    `status` TINYINT DEFAULT 1 COMMENT '1:正常 2:冻结',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_developer_id (`developer_id`),
    INDEX idx_email (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 2. 应用表
-- =====================================================
CREATE TABLE `app` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `developer_id` VARCHAR(32) NOT NULL COMMENT '关联developer.developer_id',
    `app_key` VARCHAR(32) UNIQUE NOT NULL COMMENT 'app_xxx',
    `app_name` VARCHAR(100) NOT NULL,
    `package_name` VARCHAR(200) NOT NULL,
    `platform` TINYINT NOT NULL COMMENT '1:Android 2:iOS',
    `category` VARCHAR(20) DEFAULT NULL COMMENT '游戏/工具/社交/电商/教育/娱乐/其他',
    `icon_url` VARCHAR(255) DEFAULT NULL,
    `status` TINYINT DEFAULT 1 COMMENT '1:启用 2:禁用',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_developer (`developer_id`),
    INDEX idx_app_key (`app_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 3. 广告位表
-- =====================================================
CREATE TABLE `placement` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `app_key` VARCHAR(32) NOT NULL COMMENT '关联app.app_key',
    `placement_id` VARCHAR(32) UNIQUE NOT NULL COMMENT 'pl_xxx',
    `name` VARCHAR(100) NOT NULL,
    `format` TINYINT NOT NULL COMMENT '1:Banner 2:插屏 3:激励视频 4:原生 5:开屏',
    `status` TINYINT DEFAULT 1 COMMENT '1:启用 2:禁用',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_app_key (`app_key`),
    INDEX idx_placement_id (`placement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 4. 广告网络源表
-- =====================================================
CREATE TABLE `ad_source` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `network_code` VARCHAR(20) NOT NULL COMMENT 'CSJ/YLH/KS/BD/SIGMOB',
    `network_name` VARCHAR(50) NOT NULL,
    `app_id` VARCHAR(100) NOT NULL COMMENT '三方平台AppID',
    `placement_id` VARCHAR(100) NOT NULL COMMENT '三方代码位ID',
    `extra` JSON COMMENT '各平台特殊参数',
    `status` TINYINT DEFAULT 1,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_network (`network_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 5. 瀑布流配置主表
-- =====================================================
CREATE TABLE `waterfall_config` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `placement_id` VARCHAR(32) NOT NULL,
    `version` INT DEFAULT 1,
    `traffic_group_id` BIGINT DEFAULT 0 COMMENT '0表示默认分组',
    `ab_test_id` BIGINT DEFAULT 0,
    `status` TINYINT DEFAULT 1,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_placement_version_group` (`placement_id`, `version`, `traffic_group_id`, `ab_test_id`),
    INDEX idx_placement (`placement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 6. 瀑布流层级明细表
-- =====================================================
CREATE TABLE `waterfall_layer` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `config_id` BIGINT NOT NULL,
    `layer_type` TINYINT NOT NULL COMMENT '1:Bidding 2:Standard 3:Fallback',
    `ad_source_id` BIGINT NOT NULL,
    `sort_price` DECIMAL(10,2) DEFAULT 0.00,
    `timeout_ms` INT DEFAULT 3000,
    `priority` INT DEFAULT 0,
    `status` TINYINT DEFAULT 1,
    INDEX idx_config (`config_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 7. 流量分组表
-- =====================================================
CREATE TABLE `traffic_group` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `placement_id` VARCHAR(32) NOT NULL,
    `group_name` VARCHAR(50) NOT NULL,
    `conditions` JSON NOT NULL,
    `priority` INT DEFAULT 0,
    `waterfall_config_id` BIGINT NOT NULL,
    `status` TINYINT DEFAULT 1,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_placement (`placement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 8. 日报表聚合表
-- =====================================================
CREATE TABLE `report_daily` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `developer_id` VARCHAR(32) NOT NULL,
    `app_key` VARCHAR(32) NOT NULL,
    `placement_id` VARCHAR(32) NOT NULL,
    `ad_source_id` BIGINT NOT NULL,
    `stat_date` DATE NOT NULL,
    `requests` INT DEFAULT 0,
    `fills` INT DEFAULT 0,
    `impressions` INT DEFAULT 0,
    `clicks` INT DEFAULT 0,
    `revenue` DECIMAL(10,4) DEFAULT 0.0000,
    `fill_rate` DECIMAL(5,2) GENERATED ALWAYS AS (IF(requests=0,0, fills/requests*100)) STORED,
    `ctr` DECIMAL(5,2) GENERATED ALWAYS AS (IF(impressions=0,0, clicks/impressions*100)) STORED,
    `ecpm` DECIMAL(10,2) GENERATED ALWAYS AS (IF(impressions=0,0, revenue/impressions*1000)) STORED,
    UNIQUE KEY `uk_source_date` (`developer_id`, `app_key`, `placement_id`, `ad_source_id`, `stat_date`),
    INDEX idx_developer_date (`developer_id`, `stat_date`),
    INDEX idx_placement_date (`placement_id`, `stat_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 9. 消息表
-- =====================================================
CREATE TABLE `message` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `developer_id` VARCHAR(32) NOT NULL,
    `type` TINYINT NOT NULL COMMENT '1:系统 2:公告 3:收益 4:告警',
    `title` VARCHAR(200) NOT NULL,
    `content` TEXT NOT NULL,
    `is_read` TINYINT DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_developer (`developer_id`),
    INDEX idx_read (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
第四部分：客户端SDK概要设计

4.1 SDK整体架构

text
┌─────────────────────────────────────────────────────────────────────┐
│                   开发者接入层 (对外API)                           │
│  OMAdSdk.init(context, appKey)                                    │
│  AdLoader.load(placementId, listener)                             │
│  AdLoader.show(placementId)                                       │
│  OMAdSdk.Debugger.enable(placementId)                             │
└───────────────────────────┬───────────────────────────────────────┘
                            │
┌───────────────────────────▼───────────────────────────────────────┐
│                      核心调度层                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│  │ ConfigManager│  │HybridExecutor│  │ InventoryEngine│            │
│  │(配置拉取缓存)│  │(三层策略执行) │  │(预加载/缓存)  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │
│  │FrequencyCtrl│  │  Debugger   │  │ ReportManager│               │
│  │(频次控制)   │  │(调试模式)   │  │(批量上报)    │               │
│  └─────────────┘  └─────────────┘  └─────────────┘               │
└───────────────────────────┬───────────────────────────────────────┘
                            │
┌───────────────────────────▼───────────────────────────────────────┐
│                    适配器层 (Adapter)                             │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐         │
│  │穿山甲   │ │优量汇   │ │快手    │ │百度    │ │Sigmob  │         │
│  │Adapter │ │Adapter │ │Adapter │ │Adapter │ │Adapter │         │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘         │
│  ┌────────────────────────────────────────────────┐               │
│  │     Custom Adapter (自定义扩展)                │               │
│  └────────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
4.2 适配器接口定义（五种广告容器统一封装）

4.2.1 基础接口

kotlin
// BaseAdapter.kt
interface BaseAdapter {
    fun initialize(context: Context, extra: Map<String, String>)
    fun getSdkVersion(): String
    fun destroy()
}

// AdRequestParams.kt
data class AdRequestParams(
    val adSourceId: String,
    val networkCode: String,
    val timeoutMs: Int = 3000,
    val isBidding: Boolean = false,
    val userId: String = "",
    val extra: Map<String, Any> = emptyMap()
)

// AdError.kt
data class AdError(val code: Int, val message: String) {
    companion object {
        val NO_FILL = AdError(1001, "No ad fill")
        val TIMEOUT = AdError(1002, "Request timeout")
        val NETWORK_ERROR = AdError(1003, "Network error")
        val INTERNAL_ERROR = AdError(1004, "Internal SDK error")
        val FREQUENCY_LIMIT = AdError(1005, "Frequency limit reached")
    }
}
4.2.2 五种容器适配器接口

kotlin
// 1. BannerAdapter.kt
interface BannerAdapter : BaseAdapter {
    fun loadBanner(context: Context, container: ViewGroup, params: AdRequestParams, listener: BannerLoadListener)
    fun destroyBanner()
    fun pauseBanner()
    fun resumeBanner()
}
interface BannerLoadListener {
    fun onBannerLoaded(bannerView: View, price: Double)
    fun onBannerFailed(error: AdError)
    fun onBannerClicked()
    fun onBannerShown()
}

// 2. InterstitialAdapter.kt
interface InterstitialAdapter : BaseAdapter {
    fun loadInterstitial(context: Context, params: AdRequestParams, listener: InterstitialLoadListener)
    fun showInterstitial(context: Context)
    fun isInterstitialReady(): Boolean
    fun destroyInterstitial()
}
interface InterstitialLoadListener {
    fun onInterstitialLoaded(price: Double)
    fun onInterstitialFailed(error: AdError)
    fun onInterstitialShown()
    fun onInterstitialClicked()
    fun onInterstitialClosed()
    fun onInterstitialShowFailed(error: AdError)
}

// 3. RewardedAdapter.kt
interface RewardedAdapter : BaseAdapter {
    fun loadRewarded(context: Context, params: AdRequestParams, listener: RewardedLoadListener)
    fun showRewarded(context: Context)
    fun isRewardedReady(): Boolean
    fun destroyRewarded()
}
interface RewardedLoadListener {
    fun onRewardedLoaded(price: Double)
    fun onRewardedFailed(error: AdError)
    fun onRewardedShown()
    fun onRewardedClicked()
    fun onRewardedClosed()
    fun onRewardEarned(rewardName: String, rewardAmount: Int)
    fun onRewardedShowFailed(error: AdError)
}

// 4. NativeAdapter.kt
interface NativeAdapter : BaseAdapter {
    fun loadNative(context: Context, params: AdRequestParams, listener: NativeLoadListener)
    fun renderNative(container: ViewGroup, nativeAd: NativeAdObject, layoutResId: Int = 0)
    fun destroyNative(nativeAd: NativeAdObject)
}
data class NativeAdObject(
    val title: String, val desc: String, val iconUrl: String,
    val imageUrls: List<String>, val ctaText: String,
    val rating: Double, val adSourceId: String, val rawAd: Any
)
interface NativeLoadListener {
    fun onNativeLoaded(nativeAd: NativeAdObject, price: Double)
    fun onNativeFailed(error: AdError)
    fun onNativeClicked()
    fun onNativeShown()
}

// 5. SplashAdapter.kt
interface SplashAdapter : BaseAdapter {
    fun loadAndShowSplash(activity: Activity, container: ViewGroup, params: AdRequestParams, listener: SplashLoadListener)
    fun destroySplash()
}
interface SplashLoadListener {
    fun onSplashShown(price: Double)
    fun onSplashFailed(error: AdError)
    fun onSplashClicked()
    fun onSplashSkipped()
    fun onSplashDismissed()
}
4.2.3 适配器工厂

kotlin
// AdapterFactory.kt
object AdapterFactory {
    private val adapterMap = mutableMapOf(
        "CSJ" to CsjAdapter::class.java,
        "YLH" to YlhAdapter::class.java,
        "KS" to KsAdapter::class.java,
        "BD" to BdAdapter::class.java,
        "SIGMOB" to SigmobAdapter::class.java
    )
    fun getAdapter(networkCode: String): BaseAdapter { /* 单例缓存返回 */ }
    fun registerAdapter(networkCode: String, clazz: Class<out BaseAdapter>) { /* 扩展 */ }
}
4.3 SDK初始化与配置拉取时序

text
开发者App          OMAdSdk           服务端           Adapter层       第三方SDK
    │                 │                 │                │              │
    │  init(appKey)   │                 │                │              │
    │────────────────>│                 │                │              │
    │                 │  GET /config    │                │              │
    │                 │  (appKey+设备信息)               │              │
    │                 │────────────────>│                │              │
    │                 │  ← 配置JSON     │                │              │
    │                 │  (含devId/appKey/plId)          │              │
    │                 │<────────────────│                │              │
    │                 │  缓存Token三元组 │                │              │
    │                 │  初始化各Adapter │                │              │
    │                 │────────────────>│                │              │
    │                 │                 │    init()      │              │
    │                 │                 │───────────────>│              │
    │                 │                 │                │  init()      │
    │                 │                 │                │─────────────>│
    │                 │  ← 初始化完成   │                │              │
    │<────────────────│                 │                │              │
    │                 │                 │                │              │
    │  load(plId)     │                 │                │              │
    │────────────────>│                 │                │              │
    │                 │  检查缓存       │                │              │
    │                 │  → 命中则直接返回               │              │
    │                 │  未命中→执行Hybrid策略           │              │
    │                 │  (Bidding并行→标准串行→兜底)    │              │
    │                 │────────────────>│                │              │
    │                 │                 │  loadAd()      │              │
    │                 │                 │───────────────>│              │
    │                 │                 │                │  loadAd()    │
    │                 │                 │                │─────────────>│
    │                 │  ← onAdLoaded   │                │              │
    │<────────────────│                 │                │              │
    │                 │                 │                │              │
    │  show()         │                 │                │              │
    │────────────────>│                 │                │              │
    │                 │  show()         │                │              │
    │                 │────────────────>│                │              │
    │                 │                 │  show()        │              │
    │                 │                 │───────────────>│              │
    │  ← 展示广告     │                 │                │              │
    │<────────────────│                 │                │              │
    │                 │  上报事件       │                │              │
    │                 │  (含devId/appKey/plId)          │              │
    │                 │────────────────>│                │              │
第五部分：核心接口清单

接口	方法	说明	Token携带
/api/v1/auth/register	POST	开发者注册	无（注册成功后返回developer_id）
/api/v1/auth/login	POST	登录	无（登录成功后返回JWT）
/api/v1/auth/logout	POST	登出	JWT（含developer_id）
/api/v1/console/app/list	GET	应用列表	JWT（developer_id）
/api/v1/console/app/create	POST	创建应用	JWT（自动生成app_key）
/api/v1/console/placement/create	POST	创建广告位	JWT（自动生成placement_id）
/api/v1/console/waterfall/get	GET	获取瀑布流配置	JWT
/api/v1/console/waterfall/update	POST	更新瀑布流配置	JWT
/api/v1/sdk/config	GET	SDK配置下发	app_key（Query参数） ，响应返回developer_id+app_key+placement_id
/api/v1/report	POST	数据批量上报	Body强制含developer_id+app_key+placement_id
/api/v1/console/report/daily	GET	日报表查询	JWT（developer_id）
/api/v1/console/reconciliation	GET	对账数据查询	JWT（developer_id）
/api/v1/console/message/list	GET	消息列表	JWT（developer_id）
第六部分：综合开发Prompt（供AI编程助手使用）

text
你是一个广告SDK聚合平台的全栈开发专家。请严格遵循以下Token规范实现完整系统：

## 一、Token生成规范（最高优先级，必须严格执行）

所有ID生成器统一使用 SecureRandom + Base62 编码：

```java
public class IdGenerator {
    private static final String BASE62 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();
    
    public String genDeveloperId() { return "dev_" + random(16); }
    public String genAppKey() { return "app_" + random(16); }
    public String genPlacementId() { return "pl_" + random(16); }
    public String genApiAccessToken() { return "api_" + random(32); }
    private String random(int len) { /* Base62随机字符串 */ }
}
强制约束：

开发者注册成功后立即生成 developer_id
创建应用时立即生成 app_key（唯一索引）
创建广告位时立即生成 placement_id（唯一索引）
SDK配置下发接口 /api/v1/sdk/config 的响应中必须同时返回 developer_id、app_key、placement_id 三个字段
数据上报接口 /api/v1/report 的请求Body中必须强制校验 developer_id、app_key、placement_id 三者均非空，缺一则拒绝
日报表聚合必须按 developer_id → app_key → placement_id → ad_source_id 四级维度逐级汇总
管理后台所有数据查询均以 developer_id 为顶层隔离条件，开发者只能查看自己的数据
二、技术栈

后端：Spring Boot 3.x + MyBatis-Plus + MySQL 5.7+ + Redis
前端：Vue3 + Element Plus
Android SDK：Kotlin + minSdk 16
iOS SDK：Swift + iOS 10.0+
三、必须实现的完整模块

服务端（Spring Boot）

认证模块：注册（含邮箱验证、接入方式选择、developer_id生成）、登录（JWT 7天有效期）、忘记密码
应用管理：应用CRUD（创建时生成app_key）、广告位CRUD（创建时生成placement_id）
瀑布流配置：广告源管理、三层模型（Bidding/Standard/Fallback）配置、版本管理、配置下发接口
流量分组：多维度规则配置（国家/网络/版本等）、优先级匹配
数据看板：6大核心指标、4张趋势图表接口（按app_key/placement_id下钻）
数据上报：批量接收接口（强制Token校验）、日报表定时聚合
对账管理：多平台收益汇总、对账明细、Excel导出
消息中心：消息推送、已读/未读管理
个人中心：信息管理、安全设置、Token展示与复制
数据库（完整建表SQL）

严格按上述第三部分DDL执行，确保app_key和placement_id为全局唯一索引，developer_id为唯一索引。

Android SDK（Kotlin）

入口类 OMAdSdk.init(context, appKey)：拉取配置、缓存Token三元组
ConfigManager：配置拉取、版本管理、定时刷新
HybridExecutor：三层混合策略执行（Bidding并行→标准串行→兜底串行）
适配器层：BaseAdapter + 5种容器接口（Banner/Interstitial/Rewarded/Native/Splash），全部支持Bidding和Standard双模式
AdapterFactory：工厂模式获取适配器，支持扩展
频次控制：广告位+广告源双维度
调试模式：详细日志
数据上报：批量上报，强制携带developer_id+app_key+placement_id
四、输出要求

完整的Spring Boot项目结构（含pom.xml依赖）
所有Controller、Service、Mapper、Entity、DTO代码
IdGenerator工具类
配置下发接口的完整实现（含流量分组匹配逻辑）
数据上报接口的完整实现（含Token校验和Kafka/异步落库）
Android SDK核心类的完整代码（含HybridExecutor和至少一个Adapter实现）
接口文档（Swagger注解完备）
开始实现。

text


# 第七部分：3个月实施路线图

| 阶段 | 周次 | 后端任务 | Android SDK | iOS SDK | 前端任务 |
|------|------|---------|------------|---------|---------|
| **第一阶段**<br>基础骨架 | W1-W2 | Spring Boot框架、数据库DDL、IdGenerator、注册登录（含`developer_id`生成）、JWT | 搭建工程、定义对外API（init/load/show） | 搭建工程、定义对外API | 登录/注册页面 |
| | W3-W4 | 应用CRUD（生成`app_key`）、广告位CRUD（生成`placement_id`）、配置下发接口（返回Token三元组） | ConfigManager（拉取/解析/缓存Token） | ConfigManager | 应用/广告位管理页面 |
| **第二阶段**<br>策略核心 | W5-W6 | 广告源管理、瀑布流配置CRUD、三层模型数据组装 | AdapterFactory + 穿山甲/优量汇Adapter（2家验证） | 双端对齐Adapter接口 | 瀑布流配置编辑页面 |
| | W7-W8 | 流量分组配置、配置下发接口增加分组匹配逻辑 | HybridExecutor完整实现（Bidding+Standard+Fallback） | 同步实现HybridExecutor | 流量分组配置页面 |
| **第三阶段**<br>数据与工具 | W9-W10 | 数据上报接口（强制Token校验）、日报表定时聚合 | 数据上报模块（批量+重试）、频次控制 | 同步实现 | 数据看板页面（6指标+4图表） |
| | W11-W12 | 对账管理、消息中心、个人中心、文档与FAQ接口 | 调试模式、预加载、端到端测试 | 双端功能对齐、联调 | 对账管理/消息/个人中心/文档页面 |

**上线交付物**：
- 服务端：Spring Boot Jar + 初始化SQL + Swagger文档
- Android SDK：AAR + Maven仓库 + Demo + 接入文档
- iOS SDK：Framework + CocoaPods + Demo + 接入文档
- Web控制台：静态资源包 + 操作手册
- 运维：Docker Compose一键部署脚本


# 第八部分：附录 - 核心错误码表

| 错误码 | 说明 | 处理建议 |
|--------|------|---------|
| 0 | 成功 | - |
| 1001 | 无广告填充 | 检查广告源配置是否正确 |
| 1002 | 请求超时 | 适当增加timeout_ms |
| 1003 | 网络异常 | 检查设备网络连接 |
| 1004 | SDK内部错误 | 查看详细日志定位 |
| 1005 | 频次限制 | 当日展示次数已达上限 |
| 2001 | APP_KEY无效 | 检查初始化传入的app_key |
| 2002 | PLACEMENT_ID无效 | 检查load传入的placement_id |
| 2003 | 应用已被禁用 | 联系平台管理员 |
| 2004 | 广告位已被禁用 | 在控制台检查广告位状态 |
| 3001 | Token缺失 | 数据上报必须携带developer_id/app_key/placement_id |
| 3002 | Token不匹配 | 检查上报的Token关联关系是否一致 |
| 4001 | 开发者不存在 | 检查developer_id是否正确 |
| 4002 | 权限不足 | 联系管理员开通权限 |
| 5001 | 服务端内部错误 | 查看服务端日志 |

---

以上即为**广告SDK聚合平台完整实施方案V2.0**，整合了Token体系、服务端PRD、客户端SDK设计、数据库DDL及完整开发Prompt，可直接进入编码阶段。如需进一步细化某个模块的实现细节（如流量分组匹配的具体算法、Adapter中Bidding价格获取实现等），随时可继续展开。



被聚合SDK线上对接流程 - 完整方案

一、 概述与整体架构

“被聚合SDK的线上对接流程”是指第三方广告网络（ADN）或开发者自有的广告平台，通过自助方式接入聚合平台的全过程。该流程的核心目标是将接入能力从平台方转移到开发者或ADN自身，实现生态的快速扩展。

1.1 整体架构图

text
+-------------------+       +---------------------------------------------------+
|   第三方ADN/开发者  |       |             广告SDK聚合平台 (服务端)                |
|                   |       |  +-------------------+  +------------------------+ |
|  1. 注册/登录     |------>|  |  广告网络管理模块  |  | 自定义Adapter上传与审核 | |
|  2. 创建网络      |       |  +-------------------+  +------------------------+ |
|  3. 开发Adapter   |       |  +-------------------+  +------------------------+ |
|  4. 上传/测试     |<----->|  |  应用关联与配置    |  |  数据API与报表整合    | |
|  5. 上线运营      |       |  +-------------------+  +------------------------+ |
+-------------------+       +---------------------------------------------------+
                                        |
                                        | 配置下发 & 动态加载
                                        v
+-------------------------------------------------------------------------------+
|                           客户端SDK (Android/iOS/HarmonyOS)                    |
|  +---------------------+  +---------------------+  +------------------------+ |
|  |  预置Adapter (5家)  |  | 动态Adapter加载器   |  |  自定义Adapter执行环境  | |
|  +---------------------+  +---------------------+  +------------------------+ |
+-------------------------------------------------------------------------------+
1.2 核心设计原则

原则	说明
自助化	开发者/ADN可自行在平台创建网络、上传Adapter，无需平台方介入
标准化	提供统一的Adapter接口规范、类命名规范、回调规范
动态化	SDK支持运行时动态下载并加载自定义Adapter，无需发版
可审核	所有自定义Adapter需经过平台审核，确保安全与质量
可度量	支持通过API手动上传数据或授权自动拉取，完成数据闭环
二、 角色与职责

角色	职责
聚合平台方	提供Adapter接口规范、后台管理功能、审核机制、配置下发服务
第三方ADN	实现符合规范的Adapter、提交审核、维护版本更新
App开发者	在平台创建自定义网络、关联到应用、在瀑布流中使用
三、 详细对接流程（分阶段）

第一阶段：平台侧准备（聚合平台方）

3.1 发布Adapter接入规范文档

平台需对外发布详细的Adapter接入规范，包含以下内容：

支持广告类型：激励视频、横幅、插屏、原生、开屏
类命名规范：建议路径名使用媒体常规名称，避免使用与字节跳动、穿山甲等相关的命名
接口协议定义：各广告类型的Adapter必须实现的接口/协议
初始化要求：必须实现初始化类，并正确回调初始化成功/失败
加载与展示规范：load成功或失败只能调用一次
线程要求：所有调用自定义Adapter的方法均在主线程，请勿进行耗时操作
版本号要求：network版本号和Adapter版本号均不能为空
3.2 开放后台“自定义广告网络”管理功能

平台需在Web控制台开放以下功能：

功能	说明
创建自定义网络	填写网络名称、账号名称、各广告类型的Adapter类全路径
Adapter上传	支持上传JAR/AAR（Android）或Framework（iOS）文件
审核管理	平台运营审核Adapter，通过/拒绝/打回
版本管理	支持Adapter多版本并存，SDK按配置拉取指定版本
关联应用	将自定义网络绑定到具体应用，填写应用维度参数
3.3 提供Demo与模板

平台需提供：

各广告类型的Adapter实现Demo
项目工程配置模板（build.gradle、AndroidManifest.xml等）
线程池工具类参考实现
第二阶段：ADN/开发者接入（外部）

3.4 Step 1：注册与登录

第三方ADN或开发者在聚合平台注册账号（如已有账号则直接登录），获取developer_id。

3.5 Step 2：创建自定义广告网络

在聚合平台Web控制台，进入 应用管理 → 管理广告网络 → 自定义广告网络。

填写以下信息：

字段	必填	说明
广告网络名称	是	如“MyAdNetwork”，在瀑布流中展示
账号名称	是	用于标识该网络下的不同账号
初始化Adapter类名	是	实现BaseAdapter/初始化协议的全路径类名
Banner Adapter类名	否	如不填，则该网络不支持Banner广告
插屏Adapter类名	否	同上
激励视频Adapter类名	否	同上
原生Adapter类名	否	同上
开屏Adapter类名	否	同上
是否支持Client Bidding	否	如支持，需额外实现Bidding接口
⚠️ 重要：未填写Adapter类名的广告类型，在瀑布流中不可选择该网络。
3.6 Step 3：开发自定义Adapter

开发者根据平台提供的接入规范，实现各广告类型的Adapter类。

3.6.1 初始化Adapter实现示例（Android Kotlin）

kotlin
// 1. 继承初始化基类，实现必需方法
class MyCustomInitAdapter : BaseCustomAdapter() {
    
    override fun initializeADN(context: Context, serverExtra: Map<String, Any>) {
        // 在此实现第三方ADN的SDK初始化
        // 参数说明：context为上下文，serverExtra为后台配置的自定义参数[reference:29]
        MyAdNetworkSdk.init(context, serverExtra["appId"] as String)
        // 初始化成功后必须回调
        callInitSuccess()
    }
    
    override fun getNetworkSdkVersion(): String {
        // 返回ADN渠道SDK的版本号，不能为空[reference:30]
        return MyAdNetworkSdk.getVersion()
    }
    
    override fun baseOnCustomAdapterVersion(): Int {
        // 返回自定义适配器接口版本号[reference:31]
        return WMConstants.CUSTOM_ADAPTER_VERSION_1
    }
    
    override fun notifyPrivacyStatusChange() {
        // 当隐私状态改变时触发[reference:32]
        // 首次初始化后也会调用一次
    }
}
3.6.2 激励视频Adapter实现示例（Android Kotlin）

kotlin
// 2. 继承激励视频Adapter基类，实现广告加载与展示
class MyCustomRewardedAdapter : BaseCustomRewardedAdapter() {
    
    private var rewardedAd: MyAdNetworkRewardedAd? = null
    private var isLoaded = false
    
    override fun loadAd(context: Context, localExtra: Map<String, Any>, 
                        serverExtra: Map<String, Any>) {
        // 建议在子线程中进行广告加载[reference:33]
        MyAdNetworkSdk.loadRewardedAd(
            adUnitId = serverExtra["slot_id"] as String,
            listener = object : MyAdNetworkRewardedListener {
                override fun onAdLoaded(ad: MyAdNetworkRewardedAd) {
                    rewardedAd = ad
                    isLoaded = true
                    // 加载成功回调，必须带上价格（如果是Bidding模式）[reference:34]
                    notifyAdLoaded(price = ad.getEcpm())
                }
                override fun onAdFailed(error: String) {
                    isLoaded = false
                    notifyAdFailed(errorCode = 1001, errorMsg = error)
                }
            }
        )
    }
    
    override fun isReady(): Boolean {
        // 检查广告是否已加载完成[reference:35]
        return isLoaded && rewardedAd != null && rewardedAd?.isValid() == true
    }
    
    override fun showAd(context: Context) {
        // 自定义ADN不支持在子线程中进行广告展示[reference:36]
        // 需切到主线程
        runOnUiThread {
            rewardedAd?.show(context)
        }
    }
    
    override fun onAdShown() {
        // 广告展示回调，用于统计展示量
        notifyAdShown()
    }
    
    override fun onAdClicked() {
        notifyAdClicked()
    }
    
    override fun onRewardEarned(rewardName: String, rewardAmount: Int) {
        // 用户观看完成，发放奖励[reference:37]
        notifyRewardEarned(rewardName, rewardAmount)
    }
    
    override fun onAdClosed() {
        isLoaded = false
        rewardedAd = null
        notifyAdClosed()
    }
    
    override fun destroy() {
        rewardedAd?.destroy()
        rewardedAd = null
        isLoaded = false
    }
}
3.6.3 Client Bidding支持（可选）

如果自定义广告网络支持客户端实时出价，需额外实现Bidding接口：

kotlin
// 3. 实现Client Bidding接口（如支持）
class MyCustomBiddingAdapter : BaseCustomBiddingAdapter() {
    
    override fun loadBiddingAd(context: Context, serverExtra: Map<String, Any>) {
        // 并行请求广告，获取实时价格
        MyAdNetworkSdk.loadBiddingAd(
            adUnitId = serverExtra["slot_id"] as String,
            listener = object : MyAdNetworkBiddingListener {
                override fun onBidResult(ad: MyAdNetworkAd, price: Double) {
                    // 返回广告素材 + 实时价格，供聚合SDK比价[reference:40]
                    notifyBiddingResult(ad, price)
                }
                override fun onBidFailed(error: String) {
                    notifyBiddingFailed(error)
                }
            }
        )
    }
}
3.6.4 工程配置要求

开发者需在项目中正确配置自定义Adapter的依赖：

text
项目结构：
├── libs/
│   ├── myadnetwork-sdk.aar        # 第三方ADN的SDK
│   └── myadnetwork-adapter.aar    # 自定义Adapter实现
├── build.gradle                   # 添加依赖配置
├── AndroidManifest.xml            # 合并必要权限和组件
├── res/                           # 合并必要资源
└── proguard-android.txt           # 混淆配置
Gradle依赖配置示例：

gradle
dependencies {
    // 聚合平台核心SDK
    implementation 'com.yourplatform:mediation-sdk:1.0.0'
    // 自定义Adapter（本地或Maven）
    implementation project(':myadnetwork-adapter')
    // 或 implementation 'com.myadnetwork:adapter:1.0.0'
}

// HarmonyOS需在build-profile.json5中正确添加runtimeOnly配置[reference:43]
3.7 Step 4：上传与提交审核

将开发完成的Adapter打包（JAR/AAR/Framework）
在聚合平台后台上传文件，系统自动校验：

文件格式是否正确
是否包含必要的类（与创建时填写的类名匹配）
MD5校验，防止文件损坏
提交审核，状态变为“审核中”
3.8 Step 5：审核与发布（聚合平台方）

平台运营人员审核Adapter：

审核项	检查内容
代码安全	是否存在恶意代码、敏感权限滥用
规范符合性	是否遵循Adapter接口规范、类命名规范
功能完整性	各广告类型是否正确实现、回调是否完整
版本信息	network版本号、Adapter版本号是否填写
审核结果：

通过：Adapter状态变为“已上线”，可被开发者使用
拒绝：返回拒绝原因，开发者修改后重新提交
打回：需补充材料或修改后重新提交
3.9 Step 6：关联应用到自定义网络

App开发者在聚合平台操作：

进入 应用管理 → 选择应用 → 关联广告平台
选择已创建并审核通过的自定义广告网络及账号
填写应用维度参数（如该平台的App ID）
确认所需广告类型的Adapter类全路径已配置
3.10 Step 7：添加代码位

App开发者在瀑布流配置中：

进入 瀑布流管理 → 选择广告位 → 添加代码位
广告网络下拉列表中选择自定义网络
填写该网络下的代码位ID（slot_id）
如该网络支持Bidding，可选择放入Bidding层
保存配置，生成新版本
3.11 Step 8：SDK集成与测试

App开发者集成聚合SDK：

下载集成聚合SDK（已包含自定义Adapter的动态加载能力）
SDK启动时拉取配置，自动获取自定义Adapter下载地址
SDK动态下载并加载自定义Adapter
在测试环境中验证广告加载与展示
3.12 Step 9：数据接入（可选）

方式一：手动上传数据API

如自定义广告网络未开放报表API，可通过API手动上传数据：

text
POST /api/v1/custom/upload
{
  "developerId": "dev_xxx",
  "appKey": "app_xxx",
  "placementId": "pl_xxx",
  "networkCode": "CUSTOM_MYAD",
  "statDate": "2026-01-15",
  "impressions": 10000,
  "clicks": 500,
  "revenue": 25.50
}
方式二：授权自动拉取

如自定义广告网络已开放Report API，可在平台授权后自动拉取数据：

在自定义网络配置中开启“报表API授权”
填写API Key、Secret等凭证
平台定时任务自动拉取数据，完成对账
四、 服务端数据表设计（新增）

sql
-- =====================================================
-- 10. 广告网络定义表（通用+自定义）
-- =====================================================
CREATE TABLE `ad_network_def` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `network_code` VARCHAR(32) UNIQUE NOT NULL COMMENT 'CSJ/YLH/KS/BD/SIGMOB/CUSTOM_xxx',
    `network_name` VARCHAR(50) NOT NULL,
    `network_type` TINYINT NOT NULL COMMENT '1:通用(平台预置) 2:自定义(开发者创建)',
    `adapter_class_init` VARCHAR(255) COMMENT '初始化Adapter类全路径',
    `adapter_class_banner` VARCHAR(255) COMMENT 'Banner Adapter类全路径',
    `adapter_class_interstitial` VARCHAR(255) COMMENT '插屏Adapter类全路径',
    `adapter_class_rewarded` VARCHAR(255) COMMENT '激励视频Adapter类全路径',
    `adapter_class_native` VARCHAR(255) COMMENT '原生Adapter类全路径',
    `adapter_class_splash` VARCHAR(255) COMMENT '开屏Adapter类全路径',
    `supports_bidding` TINYINT DEFAULT 0 COMMENT '是否支持Client Bidding',
    `status` TINYINT DEFAULT 1 COMMENT '1:启用 2:禁用',
    `created_by` VARCHAR(32) COMMENT '创建者developer_id（自定义网络）',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_developer (`created_by`),
    INDEX idx_type (`network_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 11. 自定义Adapter版本表
-- =====================================================
CREATE TABLE `custom_adapter_version` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `network_def_id` BIGINT NOT NULL COMMENT '关联ad_network_def.id',
    `developer_id` VARCHAR(32) NOT NULL,
    `version` VARCHAR(20) NOT NULL COMMENT 'Adapter版本号，如1.0.0',
    `file_name` VARCHAR(200) NOT NULL,
    `file_url` VARCHAR(500) NOT NULL COMMENT 'CDN存储地址',
    `file_size` BIGINT COMMENT '文件大小（字节）',
    `file_md5` VARCHAR(32) COMMENT '文件MD5校验',
    `sdk_min_version` VARCHAR(20) COMMENT '最低支持的聚合SDK版本',
    `changelog` TEXT COMMENT '版本更新说明',
    `status` TINYINT DEFAULT 1 COMMENT '1:待审核 2:审核通过 3:审核拒绝 4:已上线 5:已下架',
    `review_comment` VARCHAR(500) COMMENT '审核意见',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `reviewed_at` DATETIME,
    `reviewed_by` VARCHAR(32),
    `online_at` DATETIME COMMENT '上线时间',
    `offline_at` DATETIME COMMENT '下架时间',
    INDEX idx_network (`network_def_id`),
    INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 12. 应用关联广告网络表
-- =====================================================
CREATE TABLE `app_network_binding` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `app_key` VARCHAR(32) NOT NULL,
    `network_def_id` BIGINT NOT NULL,
    `adapter_version_id` BIGINT NOT NULL COMMENT '关联custom_adapter_version.id',
    `network_app_id` VARCHAR(100) NOT NULL COMMENT '在该广告网络的App ID',
    `extra_params` JSON COMMENT '应用维度额外参数',
    `status` TINYINT DEFAULT 1 COMMENT '1:启用 2:禁用',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_app_network` (`app_key`, `network_def_id`),
    INDEX idx_app (`app_key`),
    INDEX idx_network (`network_def_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- 13. 自定义网络数据手动上传表
-- =====================================================
CREATE TABLE `custom_network_report` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `developer_id` VARCHAR(32) NOT NULL,
    `app_key` VARCHAR(32) NOT NULL,
    `placement_id` VARCHAR(32) NOT NULL,
    `network_def_id` BIGINT NOT NULL,
    `stat_date` DATE NOT NULL,
    `impressions` INT DEFAULT 0,
    `clicks` INT DEFAULT 0,
    `revenue` DECIMAL(10,4) DEFAULT 0.0000,
    `upload_type` TINYINT DEFAULT 1 COMMENT '1:API手动上传 2:API自动拉取',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_network_date` (`developer_id`, `app_key`, `placement_id`, `network_def_id`, `stat_date`),
    INDEX idx_developer_date (`developer_id`, `stat_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
五、 服务端接口清单（新增）

接口	方法	说明
/api/console/network/custom/create	POST	创建自定义广告网络
/api/console/network/custom/update	POST	更新自定义网络信息
/api/console/network/custom/detail	GET	获取自定义网络详情
/api/console/network/custom/list	GET	获取开发者创建的自定义网络列表
/api/console/network/custom/adapter/upload	POST	上传自定义Adapter文件
/api/console/network/custom/adapter/versions	GET	获取Adapter版本列表
/api/console/network/custom/adapter/status	PUT	更新Adapter状态（审核通过/拒绝/下架）
/api/console/app/network/bind	POST	将广告网络关联到应用
/api/console/app/network/unbind	POST	解除关联
/api/console/app/network/list	GET	获取应用已关联的网络列表
/api/console/custom/report/upload	POST	手动上传自定义网络数据
/api/console/custom/report/query	GET	查询自定义网络数据
六、 配置下发接口改造

SDK拉取配置时，增加自定义Adapter信息：

json
// GET /api/v1/sdk/config 响应
{
  "code": 0,
  "data": {
    "developerId": "dev_xxx",
    "appKey": "app_xxx",
    "placementId": "pl_xxx",
    "configVersion": 5,
    "customAdapters": [
      {
        "networkCode": "CUSTOM_MYAD",
        "networkName": "MyAdNetwork",
        "adapterVersion": "1.0.0",
        "downloadUrl": "https://cdn.yourdomain.com/adapters/myadapter-1.0.0.aar",
        "md5": "a1b2c3d4e5f67890...",
        "adapterClasses": {
          "init": "com.myadapter.MyCustomInitAdapter",
          "rewarded": "com.myadapter.MyCustomRewardedAdapter",
          "interstitial": "com.myadapter.MyCustomInterstitialAdapter",
          "banner": "com.myadapter.MyCustomBannerAdapter"
        },
        "supportsBidding": true
      }
    ],
    "strategy": { ... }
  }
}
七、 SDK侧动态加载机制

7.1 动态Adapter加载器

kotlin
// DynamicAdapterLoader.kt
class DynamicAdapterLoader(private val context: Context) {
    
    companion object {
        private const val ADAPTER_CACHE_DIR = "custom_adapters"
    }
    
    /**
     * 下载并加载自定义Adapter
     */
    fun loadCustomAdapter(
        adapterInfo: CustomAdapterInfo,
        callback: (BaseAdapter?) -> Unit
    ) {
        // 1. 检查本地是否已有该版本Adapter
        val cached = getCachedAdapter(adapterInfo.networkCode, adapterInfo.adapterVersion)
        if (cached != null) {
            callback(cached)
            return
        }
        
        // 2. 从CDN下载Adapter文件
        downloadAdapter(adapterInfo.downloadUrl, adapterInfo.md5) { file ->
            if (file == null) {
                callback(null)
                return@downloadAdapter
            }
            
            // 3. 使用DexClassLoader动态加载
            try {
                val adapter = instantiateAdapter(file, adapterInfo)
                // 4. 缓存到本地
                cacheAdapter(adapterInfo.networkCode, adapterInfo.adapterVersion, adapter)
                callback(adapter)
            } catch (e: Exception) {
                Logger.e("Failed to instantiate adapter: ${e.message}")
                callback(null)
            }
        }
    }
    
    /**
     * 通过DexClassLoader实例化Adapter
     */
    private fun instantiateAdapter(
        file: File, 
        adapterInfo: CustomAdapterInfo
    ): BaseAdapter {
        val classLoader = DexClassLoader(
            file.absolutePath,
            File(context.cacheDir, ADAPTER_CACHE_DIR).absolutePath,
            null,
            context.classLoader
        )
        
        // 根据网络代码获取对应的初始化类名
        val initClassName = adapterInfo.adapterClasses["init"]
            ?: throw IllegalArgumentException("Init class not found")
            
        val clazz = classLoader.loadClass(initClassName)
        return clazz.newInstance() as BaseAdapter
    }
}
7.2 AdapterFactory改造

kotlin
// AdapterFactory.kt（改造后）
object AdapterFactory {
    // 预置通用Adapter（编译时打包）
    private val builtinAdapters = mutableMapOf<String, Class<out BaseAdapter>>()
    
    // 动态加载的自定义Adapter缓存
    private val dynamicAdapters = mutableMapOf<String, BaseAdapter>()
    
    // 动态加载器
    private lateinit var dynamicLoader: DynamicAdapterLoader
    
    fun init(context: Context) {
        dynamicLoader = DynamicAdapterLoader(context)
        // 注册预置Adapter
        registerBuiltin("CSJ", CsjAdapter::class.java)
        registerBuiltin("YLH", YlhAdapter::class.java)
        // ...
    }
    
    fun getAdapter(networkCode: String): BaseAdapter? {
        // 1. 优先从内置适配器获取
        builtinAdapters[networkCode]?.let { 
            return getOrCreateInstance(it) 
        }
        
        // 2. 从动态加载缓存获取
        dynamicAdapters[networkCode]?.let { 
            return it 
        }
        
        // 3. 如果尚未加载，返回null（由上层触发加载流程）
        return null
    }
    
    /**
     * 预加载所有自定义Adapter（SDK初始化时调用）
     */
    fun preloadCustomAdapters(adapters: List<CustomAdapterInfo>) {
        adapters.forEach { info ->
            dynamicLoader.loadCustomAdapter(info) { adapter ->
                if (adapter != null) {
                    dynamicAdapters[info.networkCode] = adapter
                    // 初始化Adapter
                    adapter.initialize(context, info.initParams)
                }
            }
        }
    }
}
八、 Web控制台新增页面

8.1 广告网络管理页面

区域	内容
通用网络列表	展示平台预置的5家网络，状态为“已预置”，不可编辑
自定义网络列表	展示开发者创建的所有自定义网络，含状态标签（待审核/已通过/已拒绝/已上线/已下架）
创建自定义网络	弹窗表单，填写网络名称、各广告格式Adapter类全路径
Adapter版本管理	展示某网络的所有版本，支持上传新版本、查看历史、切换默认版本
审核操作	（平台运营）通过/拒绝/打回，填写审核意见
8.2 应用关联页面

功能	说明
关联广告平台	选择已创建并审核通过的自定义网络，填写应用维度参数
已关联列表	展示该应用已关联的所有广告网络（通用+自定义）
解除关联	解除后瀑布流中不可再使用该网络的代码位
8.3 瀑布流配置改造

在“添加代码位”弹窗中：

广告网络下拉列表动态展示：通用网络 + 该应用已关联的自定义网络
自定义网络标注“自定义”标签
选择网络后，自动过滤出该网络支持的广告格式
九、 完整时序图

text
第三方ADN/开发者          聚合平台Web控制台          聚合平台服务端           客户端SDK            App开发者
        │                       │                       │                    │                   │
        │  1.注册/登录          │                       │                    │                   │
        │──────────────────────>│                       │                    │                   │
        │                       │  2.创建自定义网络      │                    │                   │
        │──────────────────────>│──────────────────────>│                    │                   │
        │                       │                       │  存储网络配置       │                   │
        │                       │<──────────────────────│                    │                   │
        │                       │                       │                    │                   │
        │  3.开发Adapter        │                       │                    │                   │
        │  (按规范实现)         │                       │                    │                   │
        │                       │                       │                    │                   │
        │  4.上传Adapter        │                       │                    │                   │
        │──────────────────────>│──────────────────────>│                    │                   │
        │                       │                       │  存储文件、发起审核  │                   │
        │                       │<──────────────────────│                    │                   │
        │                       │                       │                    │                   │
        │  5.审核通过           │                       │                    │                   │
        │<──────────────────────│<──────────────────────│                    │                   │
        │                       │                       │                    │                   │
        │                       │  6.关联应用到网络      │                    │                   │
        │                       │<──────────────────────────────────────────────────────────────│
        │                       │──────────────────────>│  存储关联关系      │                   │
        │                       │                       │                    │                   │
        │                       │  7.添加代码位         │                    │                   │
        │                       │<──────────────────────────────────────────────────────────────│
        │                       │──────────────────────>│  更新瀑布流配置    │                   │
        │                       │                       │                    │                   │
        │                       │                       │  8.SDK拉取配置     │                   │
        │                       │                       │<───────────────────│                   │
        │                       │                       │  返回含自定义Adapter│                   │
        │                       │                       │───────────────────>│                   │
        │                       │                       │                    │  9.动态下载加载   │
        │                       │                       │                    │  10.加载广告      │
        │                       │                       │                    │<──────────────────│
        │                       │                       │                    │  11.展示广告      │
        │                       │                       │                    │──────────────────>│
        │                       │                       │                    │                   │
        │                       │  12.数据上报/对账     │                    │                   │
        │                       │<──────────────────────────────────────────────────────────────│
十、 附录：核心检查清单

开发者/ADN接入检查清单

检查项	说明
✅ 已在聚合平台注册账号	获取developer_id
✅ 已创建自定义广告网络	填写网络名称和各广告类型Adapter类全路径
✅ 已实现初始化Adapter	继承基类，实现initializeADN、getNetworkSdkVersion等方法
✅ 已实现各广告类型Adapter	至少实现一种广告类型
✅ 已实现Client Bidding（可选）	如需支持Bidding，需额外实现
✅ load成功/失败只回调一次	避免重复回调导致异常
✅ network版本号不为空	SDK校验必填项
✅ 已上传Adapter文件	通过后台上传，等待审核
✅ 已通过审核	状态变为“已上线”
✅ 已关联到应用	在应用管理中完成关联
✅ 已添加代码位	在瀑布流中添加自定义网络代码位
✅ 已集成并测试	SDK集成后验证广告加载与展示
✅ 已配置数据上报	通过API手动上传或授权自动拉取
聚合平台方检查清单

检查项	说明
✅ 已发布Adapter接入规范	含接口定义、类命名规范、Demo
✅ 已开放后台管理功能	创建网络、上传Adapter、审核、关联应用
✅ 已实现审核流程	代码安全、规范符合性、功能完整性检查
✅ 已实现动态加载机制	SDK支持运行时下载并加载自定义Adapter
✅ 已实现配置下发改造	配置中含自定义Adapter下载地址和类名
✅ 已实现数据接入能力	手动上传API + 自动拉取授权
✅ 已提供Demo与模板	各广告类型Adapter实现示例
以上即为被聚合SDK线上对接流程的完整详细方案，涵盖平台侧、ADN/开发者侧、App开发者侧的全链路设计与实现细节，可直接作为开发文档使用。