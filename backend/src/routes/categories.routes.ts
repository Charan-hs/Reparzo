import { Hono } from 'hono';
import { eq, asc, desc } from 'drizzle-orm';
import type { Env, Variables } from '../types';
import { getDb } from '../db';
import { categories } from '../db/schema/categories';
import { subCategories } from '../db/schema/subCategories';
import { services } from '../db/schema/services';
import { successResponse } from '../utils/response';
import { NotFoundError, BadRequestError } from '../utils/AppError';

export const categoriesRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// ── GET /api/categories ───────────────────────────────────────
categoriesRoutes.get('/', async (c) => {
  const db = getDb(c.env.DB);
  const includeSub = c.req.query('include') === 'subcategories' || c.req.query('include') === 'all';
  const showAll = c.req.query('all') === 'true'; // allows admin to see inactive too

  let catQuery = db.select().from(categories).orderBy(asc(categories.order));
  const catRows = showAll ? await catQuery : await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.order));

  if (!includeSub) {
    return c.json(
      successResponse(catRows, {
        timestamp: Date.now(),
        pagination: { page: 1, limit: catRows.length, total: catRows.length },
      })
    );
  }

  // Fetch subcategories and nest them
  const subRows = showAll
    ? await db.select().from(subCategories).orderBy(asc(subCategories.order))
    : await db.select().from(subCategories).where(eq(subCategories.isActive, true)).orderBy(asc(subCategories.order));

  const result = catRows.map((cat) => ({
    ...cat,
    subCategories: subRows.filter((s) => s.categoryId === cat.id || s.categorySlug === cat.slug),
  }));

  return c.json(
    successResponse(result, {
      timestamp: Date.now(),
      pagination: { page: 1, limit: result.length, total: result.length },
    })
  );
});

// ── GET /api/categories/:idOrSlug ─────────────────────────────
categoriesRoutes.get('/:idOrSlug', async (c) => {
  const { idOrSlug } = c.req.param();
  const db = getDb(c.env.DB);

  let cat = null;
  const byId = await db.select().from(categories).where(eq(categories.id, idOrSlug)).limit(1);
  if (byId.length > 0) {
    cat = byId[0];
  } else {
    const bySlug = await db.select().from(categories).where(eq(categories.slug, idOrSlug)).limit(1);
    if (bySlug.length > 0) cat = bySlug[0];
  }

  if (!cat) {
    throw new NotFoundError(`Category '${idOrSlug}' not found.`);
  }

  const subs = await db
    .select()
    .from(subCategories)
    .where(eq(subCategories.categoryId, cat.id))
    .orderBy(asc(subCategories.order));

  const srvs = await db
    .select()
    .from(services)
    .where(eq(services.categoryId, cat.id));

  return c.json(
    successResponse({
      ...cat,
      subCategories: subs,
      services: srvs,
    })
  );
});

// ── POST /api/categories (Create) ─────────────────────────────
categoriesRoutes.post('/', async (c) => {
  const db = getDb(c.env.DB);
  const body = await c.req.json<any>();

  if (!body.title) {
    throw new BadRequestError('Category title is required.');
  }

  const slug = body.slug || body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const id = body.id || `cat-${slug}`;

  const countRes = await db.select().from(categories);
  const nextOrder = body.order ?? countRes.length + 1;

  const newCat = {
    id,
    slug,
    title: body.title.trim(),
    iconName: body.iconName || 'Wrench',
    description: body.description || '',
    badge: body.badge || null,
    bgGradient: body.bgGradient || 'from-blue-600 to-cyan-500',
    image: body.image || null,
    isActive: body.isActive ?? true,
    order: nextOrder,
  };

  await db.insert(categories).values(newCat);
  return c.json(successResponse(newCat), 201);
});

// ── PUT /api/categories/:id (Update) ───────────────────────────
categoriesRoutes.put('/:id', async (c) => {
  const { id } = c.req.param();
  const db = getDb(c.env.DB);
  const body = await c.req.json<any>();

  const existing = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  if (existing.length === 0) {
    throw new NotFoundError(`Category with ID '${id}' not found.`);
  }

  const updateData: any = {};
  if (body.title !== undefined) updateData.title = body.title.trim();
  if (body.slug !== undefined) updateData.slug = body.slug;
  if (body.iconName !== undefined) updateData.iconName = body.iconName;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.badge !== undefined) updateData.badge = body.badge;
  if (body.bgGradient !== undefined) updateData.bgGradient = body.bgGradient;
  if (body.image !== undefined) updateData.image = body.image;
  if (body.isActive !== undefined) updateData.isActive = body.isActive;
  if (body.order !== undefined) updateData.order = body.order;

  await db.update(categories).set(updateData).where(eq(categories.id, id));

  const updated = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return c.json(successResponse(updated[0]));
});

// ── DELETE /api/categories/:id ────────────────────────────────
categoriesRoutes.delete('/:id', async (c) => {
  const { id } = c.req.param();
  const db = getDb(c.env.DB);

  const existing = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  if (existing.length === 0) {
    throw new NotFoundError(`Category with ID '${id}' not found.`);
  }

  await db.delete(categories).where(eq(categories.id, id));
  return c.json(successResponse({ deleted: true, id }));
});
