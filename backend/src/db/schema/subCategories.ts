import { sqliteTable, text, integer, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';
import { categories } from './categories';
import { services } from './services';

export const subCategories = sqliteTable(
  'sub_categories',
  {
    id: text('id').primaryKey(),
    categoryId: text('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    categorySlug: text('category_slug').notNull(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    iconName: text('icon_name'),
    description: text('description').notNull(),
    badge: text('badge'),
    startingPrice: real('starting_price').notNull(),
    originalPrice: real('original_price'),
    durationMinutes: integer('duration_minutes').default(45).notNull(),
    warrantyDays: integer('warranty_days').default(30).notNull(),
    image: text('image'),
    isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
    order: integer('display_order').default(0).notNull(),
    features: text('features', { mode: 'json' }).$type<string[]>(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s', 'now'))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s', 'now'))`)
      .notNull(),
  },
  (table) => ({
    categoryActiveIdx: index('idx_subcategories_category_active').on(table.categoryId, table.isActive),
    slugIdx: uniqueIndex('idx_subcategories_slug').on(table.slug),
    categorySlugIdx: index('idx_subcategories_cat_slug').on(table.categorySlug),
  })
);

export const subCategoriesRelations = relations(subCategories, ({ one, many }) => ({
  category: one(categories, {
    fields: [subCategories.categoryId],
    references: [categories.id],
  }),
  services: many(services),
}));

export type SubCategory = typeof subCategories.$inferSelect;
export type NewSubCategory = typeof subCategories.$inferInsert;
