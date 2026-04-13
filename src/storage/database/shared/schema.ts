import { pgTable, serial, timestamp, varchar, integer, jsonb, index } from "drizzle-orm/pg-core"



export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 广告组件表
export const adComponents = pgTable(
  "ad_components",
  {
    id: varchar("id", { length: 20 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    category: varchar("category", { length: 20 }).notNull(), // static | animation
    type: varchar("type", { length: 50 }).notNull(),
    template_count: integer("template_count").default(0).notNull(),
    status: varchar("status", { length: 20 }).default("enabled").notNull(), // enabled | disabled
    editor: varchar("editor", { length: 255 }).notNull(),
    update_time: timestamp("update_time", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
    config: jsonb("config"),
  },
  (table) => [
    index("ad_components_category_idx").on(table.category),
    index("ad_components_status_idx").on(table.status),
    index("ad_components_type_idx").on(table.type),
    index("ad_components_update_time_idx").on(table.update_time),
  ]
);

export type AdComponent = typeof adComponents.$inferSelect;
export type InsertAdComponent = typeof adComponents.$inferInsert;
