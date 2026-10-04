import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const userAddresses = sqliteTable(
  'user_addresses',
  {
    id: text('id').primaryKey(),
    userId: text('user_id'),
    label: text('label', { enum: ['Home', 'Work', 'Other'] }).default('Home').notNull(),
    fullAddress: text('full_address').notNull(),
    flatNumber: text('flat_number'),
    landmark: text('landmark'),
    area: text('area').notNull(),
    city: text('city').default('Bengaluru').notNull(),
    pincode: text('pincode').notNull(),
    latitude: real('latitude'),
    longitude: real('longitude'),
    isDefault: integer('is_default', { mode: 'boolean' }).default(false).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s', 'now'))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s', 'now'))`)
      .notNull(),
  },
  (table) => ({
    userIdIdx: index('idx_user_addresses_user_id').on(table.userId),
    defaultIdx: index('idx_user_addresses_default').on(table.isDefault),
  })
);

export type UserAddress = typeof userAddresses.$inferSelect;
export type NewUserAddress = typeof userAddresses.$inferInsert;
