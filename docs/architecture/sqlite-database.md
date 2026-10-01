# SQLite — Single-File Database

You are a file format specialist with deep expertise in SQLite, including the B-tree page structure, WAL journaling mode, PRAGMA configuration, type affinity, FTS5 full-text search, and application-embedded database patterns across Python, JavaScript, Rust, and Go.

## Overview

SQLite is a C library that implements a self-contained, serverless, zero-configuration, transactional SQL database engine. Unlike client-server databases (PostgreSQL, MySQL), SQLite reads and writes directly to a single file on disk. It is the most widely deployed database engine in the world — embedded in every smartphone (iOS and Android), web browser, and countless applications. The file format is stable, cross-platform, and guaranteed to be supported through at least 2050.

## Core Philosophy

SQLite embodies a philosophy that challenges the traditional client-server database model: the database is just a file. A single .sqlite file contains the entire database — tables, indexes, views, triggers, and data — in a well-documented, cross-platform binary format. No server process, no configuration, no network protocol. Open the file, run queries. This zero-configuration simplicity makes SQLite the most widely deployed database engine in the world (embedded in every smartphone, browser, and operating system).

SQLite is not a replacement for PostgreSQL or MySQL — it is a replacement for fopen(). The right comparison is not "SQLite vs. PostgreSQL" but "SQLite vs. CSV" or "SQLite vs. JSON." When your application needs structured data storage with query capabilities, type safety, transactions, and indexing, but does not need concurrent write access from multiple network clients, SQLite is almost certainly the right choice. It is faster, more reliable, and more feature-rich than any custom file format.

SQLite databases are excellent application file formats. Desktop applications can use .sqlite files as their document format, gaining full SQL query capability, ACID transactions, and schema evolution for free. The database format is stable, backward-compatible, and guaranteed by the SQLite developers to remain readable until at least the year 2050. For data distribution, SQLite databases are more queryable than CSV and more portable than PostgreSQL dumps.

## Technical Specifications

### File Format

SQLite databases are stored as a single file with a well-defined binary format:

- **Header**: First 100 bytes contain the magic string `SQLite format 3\000`, page size, file format versions, and database metadata.
- **Page-based**: Data organized in fixed-size pages (default 4096 bytes, configurable 512–65536).
- **B-tree structure**: Tables and indexes stored as B-trees within the page system.
- **Cross-platform**: The file is byte-order independent and works across architectures.
- **Maximum size**: 281 TB (practical limit depends on OS file system).

### SQL Support

```sql
-- SQLite supports most of SQL-92 plus modern extensions
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL,
    metadata JSON,              -- JSON support via json() functions
    created_at TEXT DEFAULT (datetime('now'))
);

-- Type affinity (not strict types by default)
-- SQLite uses 5 storage classes: NULL, INTEGER, REAL, TEXT, BLOB
-- Any column can hold any type unless STRICT mode is used

-- STRICT tables (SQLite 3.37+, 2021)
CREATE TABLE strict_example (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    count INTEGER NOT NULL
) STRICT;

-- Window functions
SELECT name, price,
    RANK() OVER (ORDER BY price DESC) as price_rank
FROM products;

-- Common Table Expressions
WITH RECURSIVE cnt(x) AS (
    VALUES(1) UNION ALL SELECT x+1 FROM cnt WHERE x < 100
)
SELECT x FROM cnt;

-- JSON operations
SELECT json_extract(metadata, '$.color') FROM products;

-- Full-text search (FTS5)
CREATE VIRTUAL TABLE docs USING fts5(title, body);
SELECT * FROM docs WHERE docs MATCH 'database query';
```

### Key Characteristics

- **Type affinity** (not strict typing): A column declared `INTEGER` will accept text.
- **Single-writer**: Only one write transaction at a time (readers don't block).
- **WAL mode**: Write-Ahead Logging allows concurrent reads during writes.
- **Transactions**: Full ACID compliance. Every statement runs in an implicit transaction.
- **No user management**: No authentication or access control — file-level permissions only.
- **In-memory databases**: `sqlite3 :memory:` for ephemeral databases.

## How to Work With It

### Command-Line Interface

```bash
# Open or create a database
sqlite3 myapp.db

# Execute SQL from command line
sqlite3 myapp.db "SELECT * FROM users;"

# Execute a SQL file
sqlite3 myapp.db < schema.sql

# Export to CSV
sqlite3 -header -csv myapp.db "SELECT * FROM users;" > users.csv

# Dump entire database as SQL
sqlite3 myapp.db .dump > backup.sql

# Import CSV
sqlite3 myapp.db
.mode csv
.import data.csv tablename

# Useful dot-commands
.tables                    -- list tables
.schema tablename          -- show CREATE statement
.headers on                -- show column headers
.mode column               -- columnar output
.quit
```

### Programmatic Access

```python
import sqlite3

# Python has sqlite3 in stdlib
conn = sqlite3.connect("myapp.db")
conn.row_factory = sqlite3.Row          # dict-like access
conn.execute("PRAGMA journal_mode=WAL") # enable WAL mode
conn.execute("PRAGMA foreign_keys=ON")  # enforce foreign keys (off by default!)

cur = conn.cursor()
cur.execute("SELECT * FROM users WHERE age > ?", (18,))
rows = cur.fetchall()

# Context manager for transactions
with conn:
    conn.execute("INSERT INTO users (name) VALUES (?)", ("Alice",))
# auto-commits on success, rolls back on exception

conn.close()
```

```javascript
// better-sqlite3 (synchronous, fast)
import Database from 'better-sqlite3';
const db = new Database('myapp.db', { readonly: false });
db.pragma('journal_mode = WAL');
const users = db.prepare('SELECT * FROM users WHERE age > ?').all(18);
db.close();
```

```rust
// rusqlite
use rusqlite::Connection;
let conn = Connection::open("myapp.db")?;
conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")?;
```

### Important PRAGMAs

```sql
PRAGMA journal_mode=WAL;     -- Better concurrency (enable this!)
PRAGMA foreign_keys=ON;       -- Enforce FK constraints (OFF by default!)
PRAGMA busy_timeout=5000;     -- Wait 5s on lock instead of failing immediately
PRAGMA cache_size=-64000;     -- 64MB page cache
PRAGMA synchronous=NORMAL;    -- Good balance of safety and speed with WAL
PRAGMA temp_store=MEMORY;     -- Keep temp tables in memory
```

### Tools

- **DB Browser for SQLite**: GUI tool for viewing and editing databases.
- **Datasette**: Web UI for exploring and publishing SQLite databases.
- **Litestream**: Continuous replication of SQLite to S3/cloud storage.
- **LiteFS**: Distributed SQLite with FUSE-based replication.
- **sqlite-utils**: Python CLI and library for manipulating SQLite databases.
- **sqlean**: Collection of SQLite extensions (stats, crypto, regex, etc.).

## Common Use Cases

- **Mobile apps**: Default database for iOS (Core Data) and Android (Room).
- **Desktop apps**: Browser history/bookmarks, email clients, Electron apps.
- **Embedded systems**: IoT devices, appliances, automotive.
- **Testing**: In-memory SQLite as a test double for PostgreSQL/MySQL.
- **Data analysis**: Local analysis of datasets, Datasette for exploration.
- **Application file format**: Use SQLite instead of inventing a custom binary format.
- **Edge/serverless**: Cloudflare D1, Turso, LiteFS on Fly.io.
- **Caching**: Local cache for web apps and API responses.

## Pros & Cons

### Pros
- Zero configuration — no server, no setup, no administration.
- Single file — easy to copy, backup, version, transfer.
- Incredibly reliable — billions of deployments, aviation-grade testing.
- Fast — often faster than file I/O for structured data.
- Cross-platform — same file works on any OS or architecture.
- ACID-compliant with full transaction support.
- Public domain — no licensing restrictions whatsoever.
- Stable file format guaranteed through 2050.

### Cons
- Single-writer limitation — not suitable for high write concurrency.
- No built-in replication or clustering (use Litestream/LiteFS).
- No user/role-based access control.
- Foreign keys off by default — must enable per connection.
- Type affinity can lead to unexpected data in columns.
- Not suitable for very large datasets (>1 TB) or high-throughput writes.
- No built-in network access — local file only (by design).
- Limited ALTER TABLE support (cannot drop/rename columns before 3.35).

## Compatibility

| Language    | Built-in | Popular Library           |
|------------|----------|---------------------------|
| Python     | Yes      | `sqlite3` (stdlib)        |
| JavaScript | No       | `better-sqlite3`, `sql.js`|
| Go         | No       | `mattn/go-sqlite3`, `modernc.org/sqlite` |
| Rust       | No       | `rusqlite`                |
| Java       | No       | `xerial/sqlite-jdbc`      |
| C#         | No       | `Microsoft.Data.Sqlite`   |
| C/C++      | Source   | `sqlite3.h` (amalgamation)|

MIME type: `application/vnd.sqlite3`. File extensions: `.db`, `.sqlite`, `.sqlite3`.

## Related Formats

- **DuckDB**: Analytical (OLAP) equivalent of SQLite — columnar, single-file.
- **PostgreSQL**: Full-featured client-server database for production workloads.
- **LevelDB / RocksDB**: Key-value stores (no SQL).
- **Parquet**: Columnar file format for analytics (not a database).
- **SQL files**: Plain text SQL scripts that can create/populate SQLite databases.
- **Realm**: Mobile database alternative to SQLite (object-oriented).

## Practical Usage

- Always enable WAL mode (`PRAGMA journal_mode=WAL`) for better concurrent read performance and reduced write contention -- this is the single most impactful optimization for most applications.
- Always enable foreign key enforcement (`PRAGMA foreign_keys=ON`) per connection -- SQLite disables it by default for backward compatibility, silently ignoring referential integrity.
- Use `PRAGMA busy_timeout=5000` to handle lock contention gracefully instead of failing immediately when another process is writing.
- Use SQLite as an application file format instead of inventing custom binary or JSON-based formats -- it provides indexing, querying, and ACID transactions for free.
- Use `sqlite-utils` (Python CLI) or Datasette for quick exploration and manipulation of SQLite databases without writing code.
- Back up SQLite databases with `.backup` command or Litestream for continuous replication rather than copying the file while it may be in use.

## Anti-Patterns

- **Using SQLite for high-concurrency write workloads** -- SQLite supports only one writer at a time; use PostgreSQL or MySQL for applications requiring many concurrent writes.
- **Forgetting to enable `foreign_keys` PRAGMA** -- Without this, foreign key constraints are silently ignored, allowing orphaned rows and broken relationships.
- **Copying the SQLite file while the database is being written to** -- This can produce a corrupted copy; use the `.backup` command, `VACUUM INTO`, or Litestream for safe backups.
- **Relying on SQLite's type affinity for data integrity** -- SQLite allows any value in any column by default; use `STRICT` tables (SQLite 3.37+) or add CHECK constraints to enforce types.
- **Using SQLite across a network filesystem (NFS, SMB)** -- SQLite's locking mechanism does not work reliably over network filesystems; use a client-server database or keep the SQLite file on local storage.
