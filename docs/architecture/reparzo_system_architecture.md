# Reparzo — System Architecture Specification

## Overview

Reparzo is an edge-native monorepo platform designed for high performance, zero-cold-start edge compute, and type safety across the entire stack.

Synthesizing proven production patterns from **Zetlod** and **Mallige**, Reparzo uses:
- **Backend**: Cloudflare Workers with native **Hono** framework, **Cloudflare D1** (Serverless Distributed SQLite), **Drizzle ORM** (`drizzle-orm/d1`, `drizzle-kit`), and an `AppError` operational error hierarchy.
- **Frontend (`website`)**: **React** with **Vite**, **TypeScript**, **Tailwind CSS**, **Lucide Icons**, **Sonner**, and **Framer Motion**, deployed via **Cloudflare Workers Static Assets** with zero-latency Service Binding routing to the backend API.
- **Documentation (`docs`)**: Comprehensive architectural blueprints, database schemas, and API documentation.

---

## Architecture Diagram

```
                 +------------------------------------------------+
                 |            User Browser / Client               |
                 +-----------------------+------------------------+
                                         |
                                         v
                 +------------------------------------------------+
                 |     Cloudflare Edge Network (Global CDN)       |
                 +-----------------------+------------------------+
                                         |
                         +---------------+---------------+
                         |                               |
                   [Static Assets]                 [/api/* route]
                         |                               |
                         v                               v
          +-----------------------------+  Service  +-----------------------------+
          |     website (Worker)        | Binding  |     backend (Worker)        |
          |  (React SPA dist assets)    +--------->|  (Hono Edge REST API)       |
          +-----------------------------+          +--------------+--------------+
                                                                  |
                                       +--------------------------+--------------------------+
                                       |                          |                          |
                                       v                          v                          v
                        +-----------------------------+ +--------------------+ +--------------------+
                        |      Cloudflare D1          | |   Cloudflare KV    | |   Cloudflare R2    |
                        | (Distributed SQLite + Drizzle)| | (Fast Cache & Auth)| | (Images & Media)  |
                        +-----------------------------+ +--------------------+ +--------------------+
```

---

## Directory Organization

```
Reparzo/
├── .agents/
│   ├── skills/              # 31 edge, D1, Drizzle, design & animation skills
│   └── skills-lock.json     # Skill version lockfile
├── backend/                 # Cloudflare Worker API
│   ├── src/
│   │   ├── config/          # Environment variables & constants
│   │   ├── db/              # Drizzle ORM schemas & D1 client factory
│   │   │   ├── schema/      # Modular Drizzle schemas
│   │   │   └── index.ts     # getDb(c.env.DB) factory
│   │   ├── middleware/      # Auth, rate limiting, error handling
│   │   ├── routes/          # Modular API endpoints
│   │   ├── services/        # Business logic layer
│   │   ├── utils/           # AppError, response helpers
│   │   ├── types.ts         # Cloudflare Env & variable typings
│   │   └── index.ts         # Worker entrypoint (Hono app)
│   ├── drizzle.config.ts    # Drizzle Kit config for D1 SQLite
│   ├── package.json
│   ├── tsconfig.json
│   └── wrangler.jsonc       # Worker bindings: DB (D1), CACHE (KV), MEDIA (R2)
├── website/                 # React + Vite Frontend SPA
│   ├── src/
│   │   ├── components/      # UI components (Atomic UI, layout, feedback)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # API client, animation tokens
│   │   ├── pages/           # Application views
│   │   ├── store/           # Zustand state stores
│   │   ├── types/           # Shared UI typings
│   │   ├── App.tsx          # Router and providers
│   │   ├── main.tsx         # Entrypoint
│   │   └── index.css        # Tailwind directives & design tokens
│   ├── worker.js            # Reverse-proxy /api to backend service binding
│   ├── wrangler.toml        # Cloudflare Workers Static Assets configuration
│   ├── vite.config.ts       # Vite configuration with @/ alias & /api proxy
│   ├── package.json
│   └── tsconfig.json
├── docs/                    # Architectural & Developer Documentation
│   ├── architecture/        # Guides: cloudflare, drizzle-orm, nodejs-error-handling, etc.
│   ├── api/                 # Endpoint specifications
│   ├── database/            # ERD diagrams & migration logs
│   └── README.md
├── .gitignore
├── pnpm-workspace.yaml
└── package.json             # Root monorepo scripts
```

---

## Core Principles

1. **Request-Scoped Database Access**: Because Cloudflare Workers inject bindings per-request via `env.DB`, `drizzle(env.DB)` is created via a request factory (`getDb(c.env.DB)`).
2. **Operational Error Classification**: Applications use `AppError` to differentiate handled client/business errors from unexpected programmer crashes.
3. **Internal Zero-Egress Proxying**: In production, the frontend worker proxies `/api/*` to the backend worker via Cloudflare Service Bindings, avoiding public internet egress, TLS re-negotiation, and DNS overhead.
4. **Optimized SQL Queries**: All queries adhere to the Equality-Range-Sort (ERS) indexing rule, and query plans are validated using `EXPLAIN QUERY PLAN`.
