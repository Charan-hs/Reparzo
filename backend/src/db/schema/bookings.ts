import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';
import { users } from './users';
import { services } from './services';

export const bookings = sqliteTable(
  'bookings',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    serviceId: text('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'restrict' }),
    customerName: text('customer_name').notNull(),
    customerEmail: text('customer_email').notNull(),
    customerPhone: text('customer_phone').notNull(),
    address: text('address').notNull(),
    city: text('city').default('Bangalore').notNull(),
    pincode: text('pincode').notNull(),
    issueDescription: text('issue_description'),
    status: text('status', {
      enum: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    })
      .default('PENDING')
      .notNull(),
    scheduledAt: integer('scheduled_at', { mode: 'timestamp' }).notNull(),
    completedAt: integer('completed_at', { mode: 'timestamp' }),
    totalAmount: real('total_amount'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s', 'now'))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s', 'now'))`)
      .notNull(),
  },
  (table) => ({
    userStatusIdx: index('idx_bookings_user_status').on(table.userId, table.status),
    statusScheduledIdx: index('idx_bookings_status_scheduled').on(table.status, table.scheduledAt),
  })
);

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
}));

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
