import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';
import { users } from './users';

export const customRequests = sqliteTable(
  'custom_requests',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    customerName: text('customer_name').notNull(),
    customerPhone: text('customer_phone').notNull(),
    customerEmail: text('customer_email'),
    title: text('title').notNull(),
    categoryType: text('category_type').notNull(),
    categoryTitle: text('category_title').notNull(),
    description: text('description').notNull(),
    isDelivery: integer('is_delivery', { mode: 'boolean' }).default(false).notNull(),
    pickupAddress: text('pickup_address'),
    dropAddress: text('drop_address'),
    serviceAddress: text('service_address').notNull(),
    preferredDate: text('preferred_date').notNull(),
    preferredTimeSlot: text('preferred_time_slot').notNull(),
    urgency: text('urgency').default('same_day').notNull(),
    estimatedBudget: real('estimated_budget'),
    quotedPrice: real('quoted_price'),
    status: text('status').default('submitted').notNull(),
    adminNotes: text('admin_notes'),
    partnerName: text('partner_name'),
    partnerPhone: text('partner_phone'),
    completionPin: text('completion_pin'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s', 'now'))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s', 'now'))`)
      .notNull(),
  },
  (table) => ({
    statusIdx: index('idx_custom_requests_status').on(table.status),
    userStatusIdx: index('idx_custom_requests_user_status').on(table.userId, table.status),
    phoneIdx: index('idx_custom_requests_phone').on(table.customerPhone),
  })
);

export const customRequestsRelations = relations(customRequests, ({ one }) => ({
  user: one(users, {
    fields: [customRequests.userId],
    references: [users.id],
  }),
}));

export type CustomRequestRecord = typeof customRequests.$inferSelect;
export type NewCustomRequestRecord = typeof customRequests.$inferInsert;
