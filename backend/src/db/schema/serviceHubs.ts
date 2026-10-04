import { sqliteTable, text, integer, real, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const serviceHubs = sqliteTable(
  'service_hubs',
  {
    id: text('id').primaryKey(),
    code: text('code').notNull().unique(),
    name: text('name').notNull(),
    area: text('area').notNull(),
    city: text('city').default('Bengaluru').notNull(),
    pincode: text('pincode').notNull(),
    fullAddress: text('full_address').notNull(),
    latitude: real('latitude').notNull(),
    longitude: real('longitude').notNull(),
    radiusKm: real('radius_km').default(8.0).notNull(), // Admin configurable radius in km
    baseEtaMinutes: integer('base_eta_minutes').default(15).notNull(),
    perKmEtaMinutes: real('per_km_eta_minutes').default(2.0).notNull(),
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
    codeIdx: uniqueIndex('idx_service_hubs_code').on(table.code),
    activeOrderIdx: index('idx_service_hubs_active_order').on(table.isActive, table.order),
  })
);

export type ServiceHub = typeof serviceHubs.$inferSelect;
export type NewServiceHub = typeof serviceHubs.$inferInsert;
