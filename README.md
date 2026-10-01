# Reparzo

Reparzo is an edge-native monorepo built with **Cloudflare Workers**, **Cloudflare D1**, **Drizzle ORM**, and **React + Vite**.

## Monorepo Layout

- [`website/`](file:///Users/charan/Projects/Reparzo/website): Modern Single Page Application built with React 19/18, Vite, TypeScript, and Tailwind CSS. Deployed via Cloudflare Workers Static Assets with internal Service Binding to the backend API.
- [`backend/`](file:///Users/charan/Projects/Reparzo/backend): Edge REST API service built on Cloudflare Workers using the native Hono framework, Cloudflare D1 (serverless distributed SQLite), and Drizzle ORM.
- [`docs/`](file:///Users/charan/Projects/Reparzo/docs): Architecture specifications, database design guides, and API documentation.
- [`.agents/skills/`](file:///Users/charan/Projects/Reparzo/.agents/skills): 31 specialized AI agent skills for edge computing, database optimization, design taste, and motion design.

## Quick Start

### 1. Install Dependencies
```bash
npm install # or pnpm install
```

### 2. Development Mode
Run both backend edge server and frontend development server concurrently:
```bash
npm run dev
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8787`

### 3. Database Migrations (D1 + Drizzle)
```bash
# Generate new SQL migration from schema changes
npm run db:generate

# Apply migrations locally
npm run db:migrate

# Apply migrations to production Cloudflare D1
npm run db:migrate:remote
```

## Documentation

Read the full architecture and design standards in the [`docs/`](file:///Users/charan/Projects/Reparzo/docs) directory:
- [System Architecture](file:///Users/charan/Projects/Reparzo/docs/architecture/reparzo_system_architecture.md)
- [Cloudflare Workers & D1 Guide](file:///Users/charan/Projects/Reparzo/docs/architecture/cloudflare.md)
- [Drizzle ORM Guide](file:///Users/charan/Projects/Reparzo/docs/architecture/drizzle-orm.md)
- [Node.js Error Handling Patterns](file:///Users/charan/Projects/Reparzo/docs/architecture/nodejs-error-handling.md)
- [SQL Optimization Guide](file:///Users/charan/Projects/Reparzo/docs/architecture/sql-optimization.md)
- [SQLite on Cloudflare D1 Reference](file:///Users/charan/Projects/Reparzo/docs/architecture/sqlite-database.md)
