# Drizzle ORM — Type-Safe SQL Architecture Guide

Expert implementation patterns and best practices for building type-safe, high-performance database applications using Drizzle ORM with SQLite and Cloudflare D1.

---

## 1. Core Philosophy

Drizzle ORM is designed as "SQL-like, lightweight, and type-safe":
- **Zero runtime overhead**: Generates raw, clean SQL queries without complex abstractions.
- **Full type safety**: Infers TypeScript insert and select types directly from your schema definitions.
- **Dialect-specific**: Uses exact database features for SQLite/D1 (`sqliteTable`, `integer`, `text`, `blob`).

---

## 2. Schema Definition for SQLite & D1

Define tables and relations in `src/db/schema.ts`:

```typescript
import { sqliteTable, text, integer, real, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

// 1. Table Definitions
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: text('role', { enum: ['ADMIN', 'USER', 'VENDOR'] }).default('USER').notNull(),
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown>>(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(strftime('%s', 'now'))`)
    .notNull(),
}, (table) => ({
  emailIdx: uniqueIndex('idx_users_email').on(table.email),
}));

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  totalAmount: real('total_amount').notNull(),
  status: text('status', { enum: ['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'] })
    .default('PENDING')
    .notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(strftime('%s', 'now'))`)
    .notNull(),
}, (table) => ({
  userStatusIdx: index('idx_orders_user_status').on(table.userId, table.status),
}));

// 2. Relations Definitions (for db.query relational API)
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));

// 3. Inferred TypeScript Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
```

---

## 3. Initializing Drizzle with Cloudflare D1

In Cloudflare Workers or serverless handlers:

```typescript
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './db/schema';

export interface Env {
  DB: D1Database;
}

export function createDb(env: Env) {
  // Always pass the full schema to enable the relational queries API
  return drizzle(env.DB, { schema, logger: false });
}
```

---

## 4. Query Patterns

### Relational Queries API (`db.query`)
Load nested relations with automatic subquery/join management:
```typescript
const db = createDb(env);

// Fetch user with their latest 5 completed orders
const userWithOrders = await db.query.users.findFirst({
  where: (users, { eq }) => eq(users.id, 'usr_123'),
  with: {
    orders: {
      where: (orders, { eq }) => eq(orders.status, 'PAID'),
      limit: 5,
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    },
  },
});
```

### Standard SQL-like Query Builder
```typescript
import { eq, and, desc, gte } from 'drizzle-orm';

// SELECT with conditions
const highValueOrders = await db
  .select({
    orderId: orders.id,
    customerName: users.name,
    amount: orders.totalAmount,
  })
  .from(orders)
  .innerJoin(users, eq(orders.userId, users.id))
  .where(and(eq(orders.status, 'PAID'), gte(orders.totalAmount, 500)))
  .orderBy(desc(orders.totalAmount))
  .limit(20);

// UPSERT (Insert on conflict update)
await db
  .insert(users)
  .values({
    id: 'usr_123',
    name: 'Alice',
    email: 'alice@example.com',
  })
  .onConflictDoUpdate({
    target: users.id,
    set: { name: 'Alice Updated' },
  });
```

---

## 5. Atomic Batching in Drizzle with D1

Use `db.batch()` to combine multiple Drizzle queries into a single D1 execution round-trip:

```typescript
const [insertedUser, updatedOrder] = await db.batch([
  db.insert(users).values({ id: 'u1', name: 'Bob', email: 'bob@example.com' }).returning(),
  db.update(orders).set({ status: 'PAID' }).where(eq(orders.id, 'ord_999')),
]);
```

---

## 6. Migration Management with `drizzle-kit`

### `drizzle.config.ts`
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
});
```

### Workflow:
1. **Edit schema**: Modify `src/db/schema.ts`.
2. **Generate SQL migrations**:
   ```bash
   npx drizzle-kit generate
   ```
3. **Apply migrations to D1 via Wrangler**:
   ```bash
   # Local testing
   npx wrangler d1 migrations apply zetlod-prod-d1 --local
   # Remote production
   npx wrangler d1 migrations apply zetlod-prod-d1 --remote
   ```

---

## 7. Common Pitfalls & Anti-Patterns

1. **Forgetting schema in `drizzle(env.DB, { schema })`**:
   - Omitting `{ schema }` disables the `db.query` relational query API, causing runtime crashes when using `db.query.users`.
2. **Serial awaits instead of `db.batch()`**:
   - Writing consecutive `await db.insert()` calls generates multiple HTTP calls to D1. Combine them using `db.batch([query1, query2])`.
3. **Improper Timestamp handling**:
   - In SQLite/D1, timestamps should be stored as integer Unix timestamps (`{ mode: 'timestamp' }`) or ISO strings (`text`). Never store raw JS `Date` objects directly without specifying a mode.
4. **Modifying generated SQL migration files manually**:
   - Let `drizzle-kit generate` produce snapshots. Manual edits can desynchronize `_journal.json`.
