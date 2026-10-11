import { Hono } from 'hono';
import { eq, asc, and, or } from 'drizzle-orm';
import type { Env, Variables } from '../types';
import { getDb } from '../db';
import { subCategories } from '../db/schema/subCategories';
import { categories } from '../db/schema/categories';
import { services } from '../db/schema/services';
import { successResponse } from '../utils/response';
import { NotFoundError, BadRequestError } from '../utils/AppError';
import { requireAdmin } from '../middleware/auth';

export const subcategoriesRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// ── GET /api/subcategories ────────────────────────────────────
subcategoriesRoutes.get('/', async (c) => {
  const db = getDb(c.env.DB);
  const categoryParam = c.req.query('category');
  const showAll = c.req.query('all') === 'true';

  const conditions = [];
  if (!showAll) {
    conditions.push(eq(subCategories.isActive, true));
  }
  if (categoryParam) {
    conditions.push(
      categoryParam.startsWith('cat-')
        ? eq(subCategories.categoryId, categoryParam)
        : eq(subCategories.categorySlug, categoryParam)
    );
  }

  const query = conditions.length > 0 ? and(...conditions) : undefined;
  const rows = query
    ? await db.select().from(subCategories).where(query).orderBy(asc(subCategories.order))
    : await db.select().from(subCategories).orderBy(asc(subCategories.order));

  return c.json(
    successResponse(rows, {
      timestamp: Date.now(),
      pagination: { page: 1, limit: rows.length, total: rows.length },
    })
  );
});

// ── GET /api/subcategories/:idOrSlug ──────────────────────────
subcategoriesRoutes.get('/:idOrSlug', async (c) => {
  const { idOrSlug } = c.req.param();
  const db = getDb(c.env.DB);

  let sub = null;
  const byId = await db.select().from(subCategories).where(eq(subCategories.id, idOrSlug)).limit(1);
  if (byId.length > 0) {
    sub = byId[0];
  } else {
    const bySlug = await db.select().from(subCategories).where(eq(subCategories.slug, idOrSlug)).limit(1);
    if (bySlug.length > 0) sub = bySlug[0];
  }

  if (!sub) {
    throw new NotFoundError(`Subcategory '${idOrSlug}' not found.`);
  }

  const relatedServices = await db.select().from(services).where(eq(services.subCategoryId, sub.id));

  return c.json(
    successResponse({
      ...sub,
      services: relatedServices,
    })
  );
});

// ── POST /api/subcategories (Create - Admin only) ─────────────
subcategoriesRoutes.post('/', requireAdmin, async (c) => {
  const db = getDb(c.env.DB);
  const body = await c.req.json<any>();

  if (!body.title) {
    throw new BadRequestError('Subcategory title is required.');
  }
  if (!body.categoryId && !body.categorySlug) {
    throw new BadRequestError('categoryId or categorySlug is required.');
  }

  let catId = body.categoryId;
  let catSlug = body.categorySlug;

  if (!catSlug && catId) {
    const parent = await db.select().from(categories).where(eq(categories.id, catId)).limit(1);
    if (parent.length > 0) catSlug = parent[0].slug;
  } else if (!catId && catSlug) {
    const parent = await db.select().from(categories).where(eq(categories.slug, catSlug)).limit(1);
    if (parent.length > 0) catId = parent[0].id;
  }

  const slug = body.slug || body.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const id = body.id || `sub-${slug}`;

  const currentCount = await db.select().from(subCategories).where(eq(subCategories.categoryId, catId));
  const nextOrder = body.order ?? currentCount.length + 1;

  const newSub = {
    id,
    categoryId: catId,
    categorySlug: catSlug,
    title: body.title.trim(),
    slug,
    iconName: body.iconName || null,
    description: body.description || '',
    badge: body.badge || null,
    startingPrice: Number(body.startingPrice) || 299,
    originalPrice: body.originalPrice ? Number(body.originalPrice) : null,
    durationMinutes: Number(body.durationMinutes) || 45,
    warrantyDays: Number(body.warrantyDays) || 30,
    image: body.image || null,
    isActive: body.isActive ?? true,
    order: nextOrder,
    features: Array.isArray(body.features)
      ? body.features
      : typeof body.features === 'string'
      ? body.features.split(',').map((f: string) => f.trim()).filter(Boolean)
      : [],
  };

  await db.insert(subCategories).values(newSub);

  // Automatically ensure matching service exists in services table
  try {
    const existingSrv = await db
      .select({ id: services.id })
      .from(services)
      .where(or(eq(services.subCategoryId, id), eq(services.slug, slug)))
      .limit(1);

    if (existingSrv.length === 0) {
      await db.insert(services).values({
        id: `srv-${slug}`,
        slug,
        title: newSub.title,
        description: newSub.description || `Professional ${newSub.title} service.`,
        category: catSlug || 'services',
        categoryId: catId,
        categorySlug: catSlug,
        categoryTitle: catSlug,
        subCategoryId: id,
        subCategorySlug: slug,
        subCategoryTitle: newSub.title,
        priceEstimated: newSub.startingPrice,
        originalPrice: newSub.originalPrice,
        durationMinutes: newSub.durationMinutes,
        warrantyDays: newSub.warrantyDays,
        icon: newSub.iconName || 'Wrench',
        image: newSub.image || '/banners/ac-service.jpg',
        inclusions: newSub.features,
        isPopular: false,
        isActive: newSub.isActive,
      });
    }
  } catch (err) {
    console.warn('[subcategories:post auto-create service notice]', err);
  }

  return c.json(successResponse(newSub), 201);
});

// ── PUT /api/subcategories/:id (Update - Admin only) ───────────
subcategoriesRoutes.put('/:id', requireAdmin, async (c) => {
  const { id } = c.req.param();
  const db = getDb(c.env.DB);
  const body = await c.req.json<any>();

  const existing = await db.select().from(subCategories).where(eq(subCategories.id, id)).limit(1);
  if (existing.length === 0) {
    throw new NotFoundError(`Subcategory with ID '${id}' not found.`);
  }

  const updateData: any = {};
  if (body.title !== undefined) updateData.title = body.title.trim();
  if (body.slug !== undefined) updateData.slug = body.slug;
  if (body.iconName !== undefined) updateData.iconName = body.iconName;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.badge !== undefined) updateData.badge = body.badge;
  if (body.startingPrice !== undefined) updateData.startingPrice = Number(body.startingPrice);
  if (body.originalPrice !== undefined) updateData.originalPrice = body.originalPrice ? Number(body.originalPrice) : null;
  if (body.durationMinutes !== undefined) updateData.durationMinutes = Number(body.durationMinutes);
  if (body.warrantyDays !== undefined) updateData.warrantyDays = Number(body.warrantyDays);
  if (body.image !== undefined) updateData.image = body.image;
  if (body.isActive !== undefined) updateData.isActive = body.isActive;
  if (body.order !== undefined) updateData.order = body.order;
  if (body.features !== undefined) {
    updateData.features = Array.isArray(body.features)
      ? body.features
      : typeof body.features === 'string'
      ? body.features.split(',').map((f: string) => f.trim()).filter(Boolean)
      : [];
  }
  if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
  if (body.categorySlug !== undefined) updateData.categorySlug = body.categorySlug;
  updateData.updatedAt = new Date();

  await db.update(subCategories).set(updateData).where(eq(subCategories.id, id));

  // ── Cascade price and metadata updates to linked services in `services` table ──
  const serviceCascadeUpdates: any = {
    updatedAt: new Date(),
  };
  if (body.startingPrice !== undefined) {
    serviceCascadeUpdates.priceEstimated = Number(body.startingPrice);
  }
  if (body.originalPrice !== undefined) {
    serviceCascadeUpdates.originalPrice = body.originalPrice ? Number(body.originalPrice) : null;
  }
  if (body.title !== undefined) {
    serviceCascadeUpdates.subCategoryTitle = body.title.trim();
  }
  if (body.image !== undefined) {
    serviceCascadeUpdates.image = body.image;
  }
  if (body.warrantyDays !== undefined) {
    serviceCascadeUpdates.warrantyDays = Number(body.warrantyDays);
  }
  if (body.durationMinutes !== undefined) {
    serviceCascadeUpdates.durationMinutes = Number(body.durationMinutes);
  }
  if (body.isActive !== undefined) {
    serviceCascadeUpdates.isActive = body.isActive;
  }

  try {
    const existingSlug = existing[0].slug;
    await db
      .update(services)
      .set(serviceCascadeUpdates)
      .where(
        or(
          eq(services.subCategoryId, id),
          eq(services.subCategorySlug, existingSlug),
          ...(body.slug ? [eq(services.subCategorySlug, body.slug)] : [])
        )
      );
  } catch (err) {
    console.warn('[subcategories:put cascade service price warning]', err);
  }

  const updated = await db.select().from(subCategories).where(eq(subCategories.id, id)).limit(1);
  return c.json(successResponse(updated[0]));
});

// ── DELETE /api/subcategories/:id (Delete - Admin only) ────────
subcategoriesRoutes.delete('/:id', requireAdmin, async (c) => {
  const { id } = c.req.param();
  const db = getDb(c.env.DB);

  const existing = await db.select().from(subCategories).where(eq(subCategories.id, id)).limit(1);
  if (existing.length === 0) {
    throw new NotFoundError(`Subcategory with ID '${id}' not found.`);
  }

  await db.delete(subCategories).where(eq(subCategories.id, id));
  return c.json(successResponse({ deleted: true, id }));
});
