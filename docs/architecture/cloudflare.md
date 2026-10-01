# Cloudflare Workers & D1 — Edge Architecture Guide

Comprehensive patterns and best practices for building serverless applications on Cloudflare Workers and Cloudflare D1 (serverless distributed SQLite).

---

## 1. Core Architecture

Cloudflare Workers run on V8 isolates rather than traditional Node.js containers or virtual machines.
- **Zero Cold Starts**: Sub-millisecond startup times across 300+ global data centers.
- **Isolate Sandbox**: Lightweight memory overhead per request.
- **Bindings**: Resources like D1 databases, KV namespaces, and R2 buckets are bound directly into the runtime context (`env.DB`, `env.KV`, etc.).

---

## 2. Cloudflare D1 (Serverless Distributed SQLite)

Cloudflare D1 provides queryable relational storage backed by SQLite, distributed globally with automated read replication and a centralized primary writer.

### Executing Queries via D1 Client API
```typescript
export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // 1. Single row retrieval: .first<T>()
    const user = await env.DB.prepare(
      "SELECT id, name, email FROM users WHERE id = ?"
    ).bind("usr_123").first<{ id: string; name: string; email: string }>();

    // 2. Multi-row retrieval: .all<T>()
    const { results } = await env.DB.prepare(
      "SELECT id, name, price FROM products WHERE category = ? LIMIT 20"
    ).bind("electronics").all();

    // 3. Write / Mutation: .run()
    const result = await env.DB.prepare(
      "INSERT INTO logs (event, timestamp) VALUES (?, ?)"
    ).bind("login_success", Date.now()).run();

    return Response.json({ user, products: results, meta: result.meta });
  },
};
```

---

## 3. Atomic Batch Operations (`db.batch`)

Every query sent to D1 over HTTP has network latency overhead. Always combine related writes or bulk operations into a single `db.batch()` call.

```typescript
// db.batch executes all statements in a single round-trip and runs as an implicit transaction
const statements = [
  env.DB.prepare("UPDATE accounts SET balance = balance - ? WHERE id = ?").bind(100, "acc_A"),
  env.DB.prepare("UPDATE accounts SET balance = balance + ? WHERE id = ?").bind(100, "acc_B"),
  env.DB.prepare("INSERT INTO transactions (from_id, to_id, amount) VALUES (?, ?, ?)").bind("acc_A", "acc_B", 100),
];

const results = await env.DB.batch(statements);
```

> **Rules for D1 Batching**:
> - Maximum 100 queries per batch.
> - Maximum 1,000,000 bytes per batch payload.
> - If any statement fails, previous statements in the batch are rolled back.

---

## 4. Wrangler Configuration & Migrations

### `wrangler.toml` Configuration
```toml
name = "zetlod-backend"
main = "src/index.ts"
compatibility_date = "2026-09-01"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "zetlod-prod-d1"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
migrations_dir = "drizzle/migrations"
```

### Wrangler CLI Commands
```bash
# Create a new D1 database
npx wrangler d1 create zetlod-prod-d1

# Apply migrations locally
npx wrangler d1 migrations apply zetlod-prod-d1 --local

# Apply migrations to production (remote)
npx wrangler d1 migrations apply zetlod-prod-d1 --remote

# Direct query execution
npx wrangler d1 execute zetlod-prod-d1 --remote --command "SELECT count(*) FROM users;"
```

---

## 5. D1 Operational Limits & Guardrails

| Parameter | Limit | Best Practice |
| :--- | :--- | :--- |
| **Max Database Size** | 10 GB per D1 database | Shard or offload blobs/files to Cloudflare R2 |
| **Max Query Duration** | 30 seconds | Keep queries indexed and under 50ms |
| **Max Query Parameters** | 100 per statement | Chunk bulk inserts into batches of 50-100 items |
| **Max Statements per Batch** | 100 statements | Split massive batch operations into chunks |
| **Max Result Size** | 10 MB per query | Use keyset pagination and explicit column selections |

---

## 6. Common Pitfalls & Anti-Patterns

1. **Query loops inside Workers**:
   - Never write `for (const item of items) await env.DB.prepare(...).run()`.
   - Always map to an array of prepared statements and execute `await env.DB.batch(statements)`.
2. **Storing large binaries/blobs in D1**:
   - Storing large images, PDFs, or videos in SQLite blobs quickly exhausts database limits and degrades B-Tree performance.
   - Store binaries in **Cloudflare R2** and keep only the object key/URL in D1.
3. **Assuming immediate strong consistency across global read replicas**:
   - Cloudflare D1 primary writes commit centrally and replicate. For read-after-write consistency in the same session, use bookmarking or perform critical reads through the primary session.
4. **Missing `nodejs_compat`**:
   - If using Node.js standard library APIs (e.g. `Buffer`, `crypto`, `events`), ensure `compatibility_flags = ["nodejs_compat"]` is declared in `wrangler.toml`.
