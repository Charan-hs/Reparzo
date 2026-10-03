import { Hono } from 'hono';
import { eq, asc } from 'drizzle-orm';
import type { Env, Variables } from '../types';
import { getDb } from '../db';
import { categories } from '../db/schema/categories';
import { subCategories } from '../db/schema/subCategories';
import { services } from '../db/schema/services';
import { successResponse } from '../utils/response';
import { NotFoundError } from '../utils/AppError';

export const categoriesRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/categories - list all categories (with optional nested subcategories)
categoriesRoutes.get('/', async (c) => {
  const db = getDb(c.env.DB);
  const includeSub = c.req.query('include') === 'subcategories' || c.req.query('include') === 'all';

  const catRows = await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.order));

  if (!includeSub) {
    return c.json(
      successResponse(catRows, {
        timestamp: Date.now(),
        pagination: {
          page: 1,
          limit: catRows.length,
          total: catRows.length,
        },
      })
    );
  }

  // Fetch subcategories and nest them
  const subRows = await db
    .select()
    .from(subCategories)
    .where(eq(subCategories.isActive, true))
    .orderBy(asc(subCategories.order));

  const result = catRows.map((cat) => ({
    ...cat,
    subCategories: subRows.filter((s) => s.categoryId === cat.id || s.categorySlug === cat.slug),
  }));

  return c.json(
    successResponse(result, {
      timestamp: Date.now(),
      pagination: {
        page: 1,
        limit: result.length,
        total: result.length,
      },
    })
  );
});

// GET /api/categories/:idOrSlug - get category with subcategories & services
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

// GET /api/categories/:idOrSlug/subcategories - get subcategories for a category
categoriesRoutes.get('/:idOrSlug/subcategories', async (c) => {
  const { idOrSlug } = c.req.param();
  const db = getDb(c.env.DB);

  let catId = idOrSlug;
  const cat = await db.select().from(categories).where(eq(categories.slug, idOrSlug)).limit(1);
  if (cat.length > 0) {
    catId = cat[0].id;
  }

  const subs = await db
    .select()
    .from(subCategories)
    .where(eq(subCategories.categoryId, catId))
    .orderBy(asc(subCategories.order));

  return c.json(successResponse(subs));
});
