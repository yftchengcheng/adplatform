import { pgTable, serial, timestamp, index, pgPolicy, varchar, integer, jsonb, foreignKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const adComponents = pgTable("ad_components", {
	id: varchar({ length: 20 }).primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	category: varchar({ length: 20 }).notNull(),
	type: varchar({ length: 50 }).notNull(),
	templateCount: integer("template_count").default(0).notNull(),
	status: varchar({ length: 20 }).default('enabled').notNull(),
	editor: varchar({ length: 255 }).notNull(),
	updateTime: timestamp("update_time", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	config: jsonb(),
}, (table) => [
	index("ad_components_category_idx").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("ad_components_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("ad_components_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
	index("ad_components_update_time_idx").using("btree", table.updateTime.asc().nullsLast().op("timestamptz_ops")),
	pgPolicy("ad_components_允许公开删除", { as: "permissive", for: "delete", to: ["public"], using: sql`true` }),
	pgPolicy("ad_components_允许公开更新", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("ad_components_允许公开写入", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("ad_components_允许公开读取", { as: "permissive", for: "select", to: ["public"] }),
]);

export const sdkTemplates = pgTable("sdk_templates", {
	id: varchar({ length: 50 }).primaryKey().notNull(),
	type: varchar({ length: 30 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	adSlot: varchar("ad_slot", { length: 100 }),
	format: varchar({ length: 50 }),
	width: integer(),
	height: integer(),
	ratio: varchar({ length: 10 }),
	status: varchar({ length: 20 }).default('enabled').notNull(),
	creator: varchar({ length: 255 }).notNull(),
	createTime: timestamp("create_time", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updateTime: timestamp("update_time", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	linkedComponentCount: integer("linked_component_count").default(0).notNull(),
}, (table) => [
	index("sdk_templates_create_time_idx").using("btree", table.createTime.asc().nullsLast().op("timestamptz_ops")),
	index("sdk_templates_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("sdk_templates_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
	pgPolicy("sdk_templates_允许公开读取", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("sdk_templates_允许公开写入", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("sdk_templates_允许公开更新", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("sdk_templates_允许公开删除", { as: "permissive", for: "delete", to: ["public"] }),
]);

export const sdkTemplateComponents = pgTable("sdk_template_components", {
	id: varchar({ length: 50 }).primaryKey().notNull(),
	templateId: varchar("template_id", { length: 50 }).notNull(),
	componentId: varchar("component_id", { length: 50 }).notNull(),
	parentId: varchar("parent_id", { length: 50 }).notNull(),
	parentName: varchar("parent_name", { length: 255 }).notNull(),
	triggerRule: varchar("trigger_rule", { length: 50 }).notNull(),
	triggerTime: integer("trigger_time"),
	status: varchar({ length: 20 }).default('enabled').notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	createTime: timestamp("create_time", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("sdk_template_components_component_id_idx").using("btree", table.componentId.asc().nullsLast().op("text_ops")),
	index("sdk_template_components_template_id_idx").using("btree", table.templateId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [sdkTemplates.id],
			name: "sdk_template_components_template_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.componentId],
			foreignColumns: [adComponents.id],
			name: "sdk_template_components_component_id_fkey"
		}).onDelete("cascade"),
	pgPolicy("sdk_template_components_允许公开读取", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("sdk_template_components_允许公开写入", { as: "permissive", for: "insert", to: ["public"] }),
	pgPolicy("sdk_template_components_允许公开更新", { as: "permissive", for: "update", to: ["public"] }),
	pgPolicy("sdk_template_components_允许公开删除", { as: "permissive", for: "delete", to: ["public"] }),
]);
