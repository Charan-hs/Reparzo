import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const services = sqliteTable(
  'services',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    category: text('category').notNull(),
    priceEstimated: real('price_estimated').notNull(),
    durationMinutes: integer('duration_minutes').default(60).notNull(),
    icon: text('icon').default('Wrench').notNull(),
    isPopular: integer('is_popular', { mode: 'boolean' }).default(false).notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
    metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown>>(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s', 'now'))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s', 'now'))`)
      .notNull(),
  },
  (table) => ({
    categoryStatusIdx: index('idx_services_category_active').on(table.category, table.isActive),
    slugIdx: index('idx_services_slug').on(table.slug),
  })
);

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
