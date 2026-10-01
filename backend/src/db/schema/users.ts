import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    role: text('role', { enum: ['ADMIN', 'USER', 'TECHNICIAN'] }).default('USER').notNull(),
    status: text('status', { enum: ['ACTIVE', 'SUSPENDED', 'PENDING'] }).default('ACTIVE').notNull(),
    phone: text('phone'),
    metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown>>(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s', 'now'))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .default(sql`(strftime('%s', 'now'))`)
      .notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex('idx_users_email').on(table.email),
    roleStatusIdx: index('idx_users_role_status').on(table.role, table.status),
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
