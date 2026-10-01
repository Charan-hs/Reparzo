import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

/**
 * Factory creating a typed Drizzle ORM instance from the Cloudflare D1 binding.
 * Cloudflare Workers inject env.DB per request isolate.
 */
export function getDb(dbBinding: D1Database) {
  return drizzle(dbBinding, { schema });
}

export type AppDb = ReturnType<typeof getDb>;
