import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { successResponse } from '../utils/response';

export const healthRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

healthRoutes.get('/', async (c) => {
  const start = Date.now();
  let d1Status = 'disconnected';

  try {
    if (c.env.DB) {
      const result = await c.env.DB.prepare('SELECT 1 as alive').first<{ alive: number }>();
      if (result && result.alive === 1) {
        d1Status = 'connected';
      }
    }
  } catch (err) {
    d1Status = `error: ${err instanceof Error ? err.message : String(err)}`;
  }

  const durationMs = Date.now() - start;

  return c.json(
    successResponse(
      {
        service: 'reparzo-backend',
        status: 'healthy',
        environment: c.env.ENVIRONMENT || 'development',
        edgeRuntime: 'Cloudflare Workers (V8 Isolate)',
        database: {
          engine: 'Cloudflare D1 (Distributed SQLite)',
          status: d1Status,
        },
        cache: {
          engine: 'Cloudflare KV',
          status: c.env.CACHE ? 'configured' : 'optional',
        },
        storage: {
          engine: 'Cloudflare R2',
          status: c.env.MEDIA ? 'configured' : 'optional',
        },
      },
      {
        timestamp: Date.now(),
        durationMs,
      }
    )
  );
});
