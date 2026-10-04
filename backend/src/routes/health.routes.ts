import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { successResponse } from '../utils/response';

export const healthRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

healthRoutes.get('/', async (c) => {
  const start = Date.now();
  let dbStatus = 'disconnected';

  try {
    if (c.env.DB) {
      const result = await c.env.DB.prepare('SELECT 1 as alive').first<{ alive: number }>();
      if (result && result.alive === 1) {
        dbStatus = 'connected';
      }
    }
  } catch (err) {
    dbStatus = `error: ${err instanceof Error ? err.message : String(err)}`;
  }

  const durationMs = Date.now() - start;

  return c.json(
    successResponse(
      {
        service: 'reparzo-backend',
        status: 'healthy',
        environment: c.env.ENVIRONMENT || 'development',
        edgeRuntime: 'Distributed Edge Runtime (High Availability)',
        database: {
          engine: 'Distributed Relational Database',
          status: dbStatus,
        },
        cache: {
          engine: 'High-Performance Edge Cache',
          status: c.env.CACHE ? 'configured' : 'optional',
        },
        storage: {
          engine: 'Cloud Object Storage',
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
