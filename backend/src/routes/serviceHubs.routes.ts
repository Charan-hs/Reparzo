import { Hono } from 'hono';
import { eq, asc } from 'drizzle-orm';
import type { Env, Variables } from '../types';
import { getDb } from '../db';
import { serviceHubs } from '../db/schema/serviceHubs';
import { successResponse } from '../utils/response';
import { NotFoundError, BadRequestError } from '../utils/AppError';
import { calculateDistanceKm, estimateEtaMinutes } from '../utils/geo';

export const serviceHubsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// ── GET /api/service-hubs ─────────────────────────────────────
serviceHubsRoutes.get('/', async (c) => {
  const db = getDb(c.env.DB);
  const showAll = c.req.query('all') === 'true';

  const rows = showAll
    ? await db.select().from(serviceHubs).orderBy(asc(serviceHubs.order))
    : await db
        .select()
        .from(serviceHubs)
        .where(eq(serviceHubs.isActive, true))
        .orderBy(asc(serviceHubs.order));

  return c.json(
    successResponse(rows, {
      timestamp: Date.now(),
      pagination: { page: 1, limit: rows.length, total: rows.length },
    })
  );
});

// ── POST /api/service-hubs/check-serviceability ───────────────
serviceHubsRoutes.post('/check-serviceability', async (c) => {
  const db = getDb(c.env.DB);
  const body = await c.req.json();
  const { latitude, longitude } = body;

  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw new BadRequestError('Valid latitude and longitude numbers are required.');
  }

  // Fetch all active hubs
  const activeHubs = await db
    .select()
    .from(serviceHubs)
    .where(eq(serviceHubs.isActive, true))
    .orderBy(asc(serviceHubs.order));

  if (activeHubs.length === 0) {
    return c.json(
      successResponse({
        isServiceable: false,
        nearestHub: null,
        distanceKm: 0,
        etaMinutes: 0,
        message: 'No service hubs currently active.',
      })
    );
  }

  // Calculate distance to each hub
  let nearestHub = activeHubs[0];
  let minDistance = calculateDistanceKm(
    latitude,
    longitude,
    nearestHub.latitude,
    nearestHub.longitude
  );

  for (const hub of activeHubs) {
    const dist = calculateDistanceKm(latitude, longitude, hub.latitude, hub.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      nearestHub = hub;
    }
  }

  const isServiceable = minDistance <= nearestHub.radiusKm;
  const etaMinutes = estimateEtaMinutes(
    minDistance,
    nearestHub.baseEtaMinutes,
    nearestHub.perKmEtaMinutes
  );

  return c.json(
    successResponse({
      isServiceable,
      nearestHub: {
        id: nearestHub.id,
        code: nearestHub.code,
        name: nearestHub.name,
        area: nearestHub.area,
        city: nearestHub.city,
        radiusKm: nearestHub.radiusKm,
      },
      distanceKm: minDistance,
      etaMinutes,
    })
  );
});

// ── POST /api/service-hubs ────────────────────────────────────
serviceHubsRoutes.post('/', async (c) => {
  const db = getDb(c.env.DB);
  const body = await c.req.json();

  if (!body.name || !body.code || typeof body.latitude !== 'number' || typeof body.longitude !== 'number') {
    throw new BadRequestError('name, code, latitude, and longitude are required.');
  }

  const newId = body.id || `hub-${Date.now()}`;
  const record = {
    id: newId,
    code: body.code,
    name: body.name,
    area: body.area || body.name,
    city: body.city || 'Davangere',
    pincode: body.pincode || '577002',
    fullAddress: body.fullAddress || `${body.area || body.name}, ${body.city || 'Davangere'}`,
    latitude: body.latitude,
    longitude: body.longitude,
    radiusKm: Number(body.radiusKm) || 8.0,
    baseEtaMinutes: Number(body.baseEtaMinutes) || 15,
    perKmEtaMinutes: Number(body.perKmEtaMinutes) || 2.0,
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    order: Number(body.order) || 0,
  };

  await db.insert(serviceHubs).values(record);

  return c.json(successResponse(record), 201);
});

// ── PUT /api/service-hubs/:id ─────────────────────────────────
serviceHubsRoutes.put('/:id', async (c) => {
  const { id } = c.req.param();
  const db = getDb(c.env.DB);
  const body = await c.req.json();

  const existing = await db.select().from(serviceHubs).where(eq(serviceHubs.id, id)).limit(1);
  if (existing.length === 0) {
    throw new NotFoundError(`Service hub '${id}' not found.`);
  }

  const updates: Record<string, any> = {
    updatedAt: new Date(),
  };

  if (body.name !== undefined) updates.name = body.name;
  if (body.code !== undefined) updates.code = body.code;
  if (body.area !== undefined) updates.area = body.area;
  if (body.city !== undefined) updates.city = body.city;
  if (body.pincode !== undefined) updates.pincode = body.pincode;
  if (body.fullAddress !== undefined) updates.fullAddress = body.fullAddress;
  if (body.latitude !== undefined) updates.latitude = Number(body.latitude);
  if (body.longitude !== undefined) updates.longitude = Number(body.longitude);
  if (body.radiusKm !== undefined) updates.radiusKm = Number(body.radiusKm);
  if (body.baseEtaMinutes !== undefined) updates.baseEtaMinutes = Number(body.baseEtaMinutes);
  if (body.perKmEtaMinutes !== undefined) updates.perKmEtaMinutes = Number(body.perKmEtaMinutes);
  if (body.isActive !== undefined) updates.isActive = Boolean(body.isActive);
  if (body.order !== undefined) updates.order = Number(body.order);

  await db.update(serviceHubs).set(updates).where(eq(serviceHubs.id, id));

  const updated = { ...existing[0], ...updates };
  return c.json(successResponse(updated));
});

// ── DELETE /api/service-hubs/:id ──────────────────────────────
serviceHubsRoutes.delete('/:id', async (c) => {
  const { id } = c.req.param();
  const db = getDb(c.env.DB);

  const existing = await db.select().from(serviceHubs).where(eq(serviceHubs.id, id)).limit(1);
  if (existing.length === 0) {
    throw new NotFoundError(`Service hub '${id}' not found.`);
  }

  await db.delete(serviceHubs).where(eq(serviceHubs.id, id));

  return c.json(successResponse({ id }));
});
