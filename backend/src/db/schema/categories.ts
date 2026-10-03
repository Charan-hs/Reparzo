import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';
import { subCategories } from './subCategories';
import { services } from './services';

export const categories = sqliteTable(
  'categories',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    iconName: text('icon_name').default('Wrench').notNull(),
    description: text('description').notNull(),
    badge: text('badge'),
    bgGradient: text('bg_gradient').default('from-blue-600 to-cyan-500').notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
    order: integer('display_order').default(0).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s', 'now'))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s', 'now'))`)
      .notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex('idx_categories_slug').on(table.slug),
    activeOrderIdx: index('idx_categories_active_order').on(table.isActive, table.order),
  })
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  subCategories: many(subCategories),
  services: many(services),
}));

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
