---
name: sql-optimization
description: >-
  Expert guide and patterns for SQL query optimization, database indexing strategies,
  execution plan analysis (EXPLAIN QUERY PLAN), pagination performance, and high-efficiency
  relational data access across SQLite, Cloudflare D1, and PostgreSQL.
---

# SQL Optimization — Patterns & Best Practices

Expert guidance for analyzing, rewriting, and indexing SQL queries to achieve sub-millisecond execution times, minimal disk I/O, and optimal memory utilization.

---

## 1. Query Execution Plan Analysis (`EXPLAIN QUERY PLAN`)

Never guess why a query is slow. Inspect the database execution plan before adding indexes or rewriting queries.

### SQLite & Cloudflare D1
```sql
EXPLAIN QUERY PLAN
SELECT u.id, u.email, o.total_amount
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.status = 'ACTIVE' AND o.created_at >= '2026-01-01';
```

#### Interpreting SQLite Execution Plans:
- **`SCAN TABLE <table>`**: Full table scan ($O(N)$). Red flag on large tables.
- **`SEARCH TABLE <table> USING INDEX <index_name> (col=?)`**: Fast index lookup ($O(\log N)$).
- **`SEARCH TABLE <table> USING COVERING INDEX <index_name>`**: Optimal — satisfied entirely from index without touching table pages.
- **`USE TEMP B-TREE FOR ORDER BY / GROUP BY`**: Sorting in temporary memory/disk structure. Can be eliminated with an index that orders columns appropriately.

---

## 2. Indexing Strategies

### The Equality-Range-Sort (ERS) Rule
When creating composite indexes for queries with `WHERE` and `ORDER BY`, order columns as:
1. **Equality columns** (`col = ?`)
2. **Sort columns** (`ORDER BY col`)
3. **Range columns** (`col > ?`, `col BETWEEN ? AND ?`)

```sql
-- Query:
SELECT id, total_amount, created_at 
FROM orders 
WHERE user_id = ? AND status = 'COMPLETED' 
ORDER BY created_at DESC 
LIMIT 20;

-- Optimal Composite Index:
CREATE INDEX idx_orders_user_status_created 
ON orders (user_id, status, created_at DESC);
```

### Covering Indexes
Include selected columns in the index to avoid table lookups (RowID dereferencing):
```sql
-- If frequently querying id, email, and role:
CREATE INDEX idx_users_status_covering 
ON users (status, id, email, role);
```

### Partial (Filtered) Indexes
Reduce index size and write overhead by only indexing rows that match a condition:
```sql
-- Only index active or unprocessed records:
CREATE INDEX idx_orders_unprocessed 
ON orders (created_at) 
WHERE status = 'PENDING';
```

### Functional (Expression) Indexes
If querying with functions like `LOWER()` or JSON extraction:
```sql
-- Index on lowercase email:
CREATE INDEX idx_users_lower_email ON users (LOWER(email));

-- Index on JSON field (SQLite/D1):
CREATE INDEX idx_products_category ON products (json_extract(metadata, '$.category'));
```

---

## 3. High-Performance Pagination: Keyset vs Offset

### The Anti-Pattern: `OFFSET`
```sql
-- DANGEROUS on large datasets:
-- Scans and discards 100,000 rows before returning 20.
SELECT * FROM products ORDER BY id ASC LIMIT 20 OFFSET 100000;
```

### The Solution: Keyset (Cursor-Based) Pagination
```sql
-- Uses index directly to seek to the next page in O(log N):
SELECT id, name, price, created_at
FROM products
WHERE (created_at, id) < (?, ?) -- cursor from last row of previous page
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

---

## 4. Preventing the N+1 Query Problem

### The Anti-Pattern:
```typescript
// 1 query for users + N queries for orders = N + 1 queries
const users = await db.query("SELECT id, name FROM users LIMIT 50");
for (const user of users) {
  user.orders = await db.query("SELECT * FROM orders WHERE user_id = ?", [user.id]);
}
```

### Solution A: Single JOIN with Aggregation / Grouping
```sql
SELECT 
  u.id AS user_id, 
  u.name, 
  o.id AS order_id, 
  o.total_amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.id IN (SELECT id FROM users LIMIT 50);
```

### Solution B: Batched IN Query (Application-level join)
```typescript
const users = await db.query("SELECT id, name FROM users LIMIT 50");
const userIds = users.map(u => u.id);

// 1 additional query instead of 50
const orders = await db.query(
  `SELECT * FROM orders WHERE user_id IN (${userIds.map(() => '?').join(',')})`,
  userIds
);
```

---

## 5. Bulk Operations & Write Optimization

### Explicit Transactions
SQLite and D1 run statements in implicit transactions by default. 1,000 individual `INSERT`s = 1,000 disk syncs.
```sql
-- 100x to 1000x faster:
BEGIN TRANSACTION;
INSERT INTO logs (message) VALUES ('log 1');
INSERT INTO logs (message) VALUES ('log 2');
...
COMMIT;
```

### Multi-row Insert
```sql
INSERT INTO items (category_id, name, price) VALUES
  (1, 'Item A', 10.99),
  (1, 'Item B', 15.50),
  (2, 'Item C', 7.25);
```

### Cloudflare D1 Batch API
```typescript
// D1 batches execute atomically in a single HTTP round-trip
const statements = items.map(item => 
  db.prepare("INSERT INTO items (name, price) VALUES (?, ?)").bind(item.name, item.price)
);
await db.batch(statements);
```

---

## 6. Common Pitfalls & Anti-Patterns

1. **Functions on indexed columns in `WHERE` clauses**:
   - Bad: `WHERE SUBSTR(phone, 1, 3) = '555'` (invalidates index on `phone`).
   - Good: `WHERE phone LIKE '555%'` or create an expression index.
2. **`SELECT *` in production queries**:
   - Fetches unneeded columns (bloating memory, network, and preventing covering indexes).
   - Explicitly list required fields: `SELECT id, name, status FROM ...`.
3. **Correlated Subqueries in `SELECT`**:
   - Bad: `SELECT id, (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) FROM users u;`
   - Good: `SELECT u.id, COUNT(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id;`
4. **Leading wildcards with `LIKE`**:
   - `LIKE '%term'` cannot use standard B-Tree indexes. Use FTS5 (Full-Text Search) instead.
