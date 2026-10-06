import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';
import { users } from './users';
import { services } from './services';

export const bookings = sqliteTable(
  'bookings',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    serviceId: text('service_id').references(() => services.id, { onDelete: 'set null' }),
    customerName: text('customer_name').notNull(),
    customerEmail: text('customer_email'),
    customerPhone: text('customer_phone').notNull(),
    address: text('address').notNull(),
    city: text('city').default('Davangere').notNull(),
    pincode: text('pincode').default('577005').notNull(),
    issueDescription: text('issue_description'),
    status: text('status').default('confirmed').notNull(),
    scheduledAt: integer('scheduled_at', { mode: 'timestamp' }),
    completedAt: integer('completed_at', { mode: 'timestamp' }),
    totalAmount: real('total_amount'),
    items: text('items'), // JSON representation of CartItem[]
    itemTotal: real('item_total'),
    platformFee: real('platform_fee'),
    discount: real('discount'),
    grandTotal: real('grand_total'),
    slot: text('slot'), // JSON representation of BookingSlot
    paymentMethod: text('payment_method').default('cash'),
    paymentStatus: text('payment_status').default('pending'),
    completionPin: text('completion_pin'),
    technicianName: text('technician_name'),
    technicianPhone: text('technician_phone'),
    adminNotes: text('admin_notes'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s', 'now'))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s', 'now'))`)
      .notNull(),
  },
  (table) => ({
    userStatusIdx: index('idx_bookings_user_status').on(table.userId, table.status),
    statusIdx: index('idx_bookings_status').on(table.status),
    phoneIdx: index('idx_bookings_customer_phone').on(table.customerPhone),
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
