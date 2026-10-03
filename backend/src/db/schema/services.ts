import { sqliteTable, text, integer, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';
import { categories } from './categories';
import { subCategories } from './subCategories';
import { bookings } from './bookings';

export const services = sqliteTable(
  'services',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    category: text('category').notNull(),
    categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
    categorySlug: text('category_slug'),
    categoryTitle: text('category_title'),
    subCategoryId: text('sub_category_id').references(() => subCategories.id, { onDelete: 'set null' }),
    subCategorySlug: text('sub_category_slug'),
    subCategoryTitle: text('sub_category_title'),
    priceEstimated: real('price_estimated').notNull(),
    originalPrice: real('original_price'),
    durationMinutes: integer('duration_minutes').default(60).notNull(),
    icon: text('icon').default('Wrench').notNull(),
    rating: real('rating').default(4.9).notNull(),
    reviewsCount: integer('reviews_count').default(0).notNull(),
    inclusions: text('inclusions', { mode: 'json' }).$type<string[]>(),
    warrantyDays: integer('warranty_days').default(30).notNull(),
    image: text('image').default('/banners/ac-service.jpg').notNull(),
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
    categorySlugIdx: index('idx_services_cat_slug').on(table.categorySlug),
    subCategorySlugIdx: index('idx_services_subcat_slug').on(table.subCategorySlug),
    slugIdx: uniqueIndex('idx_services_slug').on(table.slug),
  })
);

export const servicesRelations = relations(services, ({ one, many }) => ({
  categoryRel: one(categories, {
    fields: [services.categoryId],
    references: [categories.id],
  }),
  subCategoryRel: one(subCategories, {
    fields: [services.subCategoryId],
    references: [subCategories.id],
  }),
  bookings: many(bookings),
}));

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
