import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import type { Env, Variables } from '../types';
import { getDb } from '../db';
import { services } from '../db/schema/services';
import { successResponse } from '../utils/response';
import { NotFoundError } from '../utils/AppError';

export const servicesRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/services - list all active services with optional filtering
servicesRoutes.get('/', async (c) => {
  const db = getDb(c.env.DB);
  const categoryParam = c.req.query('category');
  const subCategoryParam = c.req.query('subcategory');
  const popularParam = c.req.query('popular');

  const conditions = [eq(services.isActive, true)];

  if (categoryParam) {
    conditions.push(eq(services.categorySlug, categoryParam));
  }
  if (subCategoryParam) {
    conditions.push(eq(services.subCategorySlug, subCategoryParam));
  }
  if (popularParam === 'true') {
    conditions.push(eq(services.isPopular, true));
  }

  const rows = await db
    .select()
    .from(services)
    .where(and(...conditions));

  return c.json(
    successResponse(rows, {
      timestamp: Date.now(),
      pagination: {
        page: 1,
        limit: rows.length,
        total: rows.length,
      },
    })
  );
});

// GET /api/services/:idOrSlug - get single service
servicesRoutes.get('/:idOrSlug', async (c) => {
  const { idOrSlug } = c.req.param();
  const db = getDb(c.env.DB);

  let service = null;
  const byId = await db.select().from(services).where(eq(services.id, idOrSlug)).limit(1);
  if (byId.length > 0) {
    service = byId[0];
  } else {
    const bySlug = await db.select().from(services).where(eq(services.slug, idOrSlug)).limit(1);
    if (bySlug.length > 0) service = bySlug[0];
  }

  if (!service) {
    throw new NotFoundError(`Service '${idOrSlug}' not found.`);
  }

  return c.json(successResponse(service));
});
