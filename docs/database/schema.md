# Cloudflare D1 Database Schema Documentation

Reparzo utilizes **Cloudflare D1**, a globally distributed, serverless relational database built on SQLite with primary replication. Schema definitions are written declaratively using **Drizzle ORM** in `backend/src/db/schema/`.

---

## 1. Entity Relationship Overview

```mermaid
erDiagram
    USERS ||--o{ BOOKINGS : "places"
    SERVICES ||--o{ BOOKINGS : "requested_in"

    USERS {
        text id PK
        text name
        text email UK
        text role "USER | ADMIN | TECHNICIAN"
        text status "ACTIVE | SUSPENDED"
        text phone
        json metadata
        integer created_at
        integer updated_at
    }

    SERVICES {
        text id PK
        text slug UK
        text title
        text description
        text category
        real price_estimated
        integer duration_minutes
        text icon
        boolean is_popular
        boolean is_active
        json metadata
        integer created_at
        integer updated_at
    }

    BOOKINGS {
        text id PK
        text user_id FK
        text service_id FK
        text customer_name
        text customer_email
        text customer_phone
        text address
        text city
        text pincode
        text issue_description
        text status "PENDING | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED"
        integer scheduled_at
        integer completed_at
        real total_amount
        integer created_at
        integer updated_at
    }
```

---

## 2. Table Specifications & Indexing Strategy

All indexes adhere strictly to the **Equality-Range-Sort (ERS)** rule to ensure sub-millisecond index-only searches without temporary B-tree allocations:

### `users` Table
- `id` (TEXT, PK): Unique prefixed identifier (`usr_...`).
- `email` (TEXT, UNIQUE): User email address.
- `idx_users_email` (UNIQUE): Fast lookups during login/auth.
- `idx_users_role_status`: Composite index `(role, status)` for role-based dashboard filtering.

### `services` Table
- `id` (TEXT, PK): Unique service ID (`srv_...`).
- `slug` (TEXT, UNIQUE): SEO-friendly URL slug.
- `idx_services_category_active`: Composite index `(category, is_active)` for category browsing.
- `idx_services_slug`: Unique/covering index for single service lookups.

### `bookings` Table
- `id` (TEXT, PK): Unique booking ID (`bkg_...`).
- `user_id` (TEXT, FK): Optional relationship to registered user (`onDelete: 'set null'`).
- `service_id` (TEXT, FK): Required relationship to service (`onDelete: 'restrict'`).
- `idx_bookings_user_status`: Composite index `(user_id, status)` for customer booking history.
- `idx_bookings_status_scheduled`: Composite index `(status, scheduled_at)` for technician dispatch queries.

---

## 3. Migration Commands

```bash
# Generate SQL migration file in backend/drizzle/
npm --prefix backend run db:generate

# Execute locally on wrangler SQLite isolate
npm --prefix backend run db:migrate

# Apply to production Cloudflare D1
npm --prefix backend run db:migrate:remote
```
