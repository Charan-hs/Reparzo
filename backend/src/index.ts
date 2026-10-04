import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import type { Env, Variables } from './types';
import { errorHandler } from './middleware/errorHandler';
import { apiRouter } from './routes';
import { mediaRoutes } from './routes/media.routes';
import { successResponse } from './utils/response';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// ── Global Edge Middleware ─────────────────────────────
app.use('*', logger());
app.use(
  '*',
  secureHeaders({
    crossOriginResourcePolicy: 'cross-origin',
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  '*',
  cors({
    origin: (origin, c) => {
      const allowed = [c.env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:5173'];
      if (!origin || allowed.includes(origin) || origin.endsWith('.workers.dev') || origin.endsWith('.reparzo.com')) {
        return origin || '*';
      }
      return allowed[0];
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
  })
);

// ── Root Endpoint ──────────────────────────────────────
app.get('/', (c) => {
  return c.json(
    successResponse({
      name: 'Reparzo API',
      version: '1.0.0',
      runtime: 'Reparzo High-Performance Edge Engine',
      database: 'Distributed Cloud Database',
      documentation: '/api/health',
    })
  );
});

// ── Direct Media Mounts for Edge Asset Streaming ───────
// Allows direct access to /banners/*, /media/* as well as /api/media/*
app.route('/banners', mediaRoutes);
app.route('/media', mediaRoutes);

// ── API Router Mount ───────────────────────────────────
app.route('/api', apiRouter);

// ── 404 Not Found Handler ──────────────────────────────
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: `Endpoint ${c.req.method} ${c.req.path} does not exist on Reparzo Edge API.`,
      },
      meta: {
        timestamp: Date.now(),
      },
    },
    404
  );
});

// ── Central Error Handler ──────────────────────────────
app.onError(errorHandler);

export default app;
