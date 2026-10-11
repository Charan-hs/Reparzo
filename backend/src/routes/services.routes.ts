import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import type { Env, Variables } from '../types';
import { getDb } from '../db';
import { services } from '../db/schema/services';
import { successResponse } from '../utils/response';
import { NotFoundError } from '../utils/AppError';
import { requireAdmin } from '../middleware/auth';

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

  function formatServiceRow(row: any) {
    let inclusions = row.inclusions;
    if (typeof inclusions === 'string') {
      try {
        inclusions = JSON.parse(inclusions);
      } catch {
        inclusions = [];
      }
    }
    return {
      ...row,
      price: row.priceEstimated,
      inclusions: inclusions || [],
    };
  }

  const formattedRows = rows.map(formatServiceRow);

  return c.json(
    successResponse(formattedRows, {
      timestamp: Date.now(),
      pagination: {
        page: 1,
        limit: formattedRows.length,
        total: formattedRows.length,
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

  let inclusions = service.inclusions;
  if (typeof inclusions === 'string') {
    try {
      inclusions = JSON.parse(inclusions);
    } catch {
      inclusions = [];
    }
  }

  const formatted = {
    ...service,
    price: service.priceEstimated,
    inclusions: inclusions || [],
  };

  return c.json(successResponse(formatted));
});

// PUT /api/services/:id - update a service (Admin only)
servicesRoutes.put('/:id', requireAdmin, async (c) => {
  const { id } = c.req.param();
  const db = getDb(c.env.DB);
  const body = await c.req.json<any>();

  const existing = await db.select().from(services).where(eq(services.id, id)).limit(1);
  if (existing.length === 0) {
    throw new NotFoundError(`Service with ID '${id}' not found.`);
  }

  const updateData: any = {
    updatedAt: new Date(),
  };

  if (body.title !== undefined) updateData.title = body.title.trim();
  if (body.description !== undefined) updateData.description = body.description;
  if (body.price !== undefined) updateData.priceEstimated = Number(body.price);
  if (body.priceEstimated !== undefined) updateData.priceEstimated = Number(body.priceEstimated);
  if (body.originalPrice !== undefined) updateData.originalPrice = body.originalPrice ? Number(body.originalPrice) : null;
  if (body.durationMinutes !== undefined) updateData.durationMinutes = Number(body.durationMinutes);
  if (body.warrantyDays !== undefined) updateData.warrantyDays = Number(body.warrantyDays);
  if (body.image !== undefined) updateData.image = body.image;
  if (body.icon !== undefined) updateData.icon = body.icon;
  if (body.isPopular !== undefined) updateData.isPopular = Boolean(body.isPopular);
  if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);
  if (body.inclusions !== undefined) {
    updateData.inclusions = Array.isArray(body.inclusions)
      ? body.inclusions
      : typeof body.inclusions === 'string'
      ? JSON.parse(body.inclusions)
      : [];
  }

  await db.update(services).set(updateData).where(eq(services.id, id));

  const updated = await db.select().from(services).where(eq(services.id, id)).limit(1);
  let inclusions = updated[0].inclusions;
  if (typeof inclusions === 'string') {
    try { inclusions = JSON.parse(inclusions); } catch { inclusions = []; }
  }

  const formatted = {
    ...updated[0],
    price: updated[0].priceEstimated,
    inclusions: inclusions || [],
  };

  return c.json(successResponse(formatted));
});
