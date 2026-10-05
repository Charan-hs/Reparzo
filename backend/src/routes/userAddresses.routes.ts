import { Hono } from 'hono';
import { eq, and, desc } from 'drizzle-orm';
import type { Env, Variables } from '../types';
import { getDb } from '../db';
import { userAddresses } from '../db/schema/userAddresses';
import { users } from '../db/schema/users';
import { successResponse } from '../utils/response';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/AppError';
import { requireAuth } from '../middleware/auth';

export const userAddressesRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// ── GET /api/user-addresses (List addresses for authenticated user) ───
userAddressesRoutes.get('/', requireAuth, async (c) => {
  const currentUser = c.get('user');
  if (!currentUser?.id) {
    throw new BadRequestError('User identity could not be verified.');
  }

  const db = getDb(c.env.DB);
  const rows = await db
    .select()
    .from(userAddresses)
    .where(eq(userAddresses.userId, currentUser.id))
    .orderBy(desc(userAddresses.isDefault), desc(userAddresses.createdAt));

  return c.json(
    successResponse(rows, {
      timestamp: Date.now(),
      pagination: { page: 1, limit: rows.length, total: rows.length },
    })
  );
});

// ── POST /api/user-addresses (Create new address linked to user) ──────
userAddressesRoutes.post('/', requireAuth, async (c) => {
  const currentUser = c.get('user');
  if (!currentUser?.id) {
    throw new BadRequestError('User identity could not be verified.');
  }

  const db = getDb(c.env.DB);
  const body = await c.req.json().catch(() => null);

  if (!body) {
    throw new BadRequestError('Invalid JSON request body.');
  }

  if (!body.fullAddress || !body.area || !body.pincode) {
    throw new BadRequestError('fullAddress, area, and pincode are required.');
  }

  // Ensure user record exists in users table so foreign key relationship is guaranteed
  const existingUser = await db.select().from(users).where(eq(users.id, currentUser.id)).limit(1);
  if (existingUser.length === 0) {
    await db.insert(users).values({
      id: currentUser.id,
      name: currentUser.name || currentUser.email.split('@')[0] || 'User',
      email: currentUser.email || `${currentUser.id}@auth.reparzo.internal`,
      role: currentUser.role || 'USER',
      status: 'ACTIVE',
      phone: currentUser.phone || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  const isDefault = Boolean(body.isDefault);

  // If this address is set as default, reset other addresses for this user
  if (isDefault) {
    await db
      .update(userAddresses)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(eq(userAddresses.userId, currentUser.id));
  }

  const addrId = body.id || `addr-${Date.now()}`;
  const newAddr = {
    id: addrId,
    userId: currentUser.id,
    label: (['Home', 'Work', 'Other'].includes(body.label) ? body.label : 'Home') as 'Home' | 'Work' | 'Other',
    fullAddress: body.fullAddress.trim(),
    flatNumber: body.flatNumber || null,
    landmark: body.landmark || null,
    area: body.area.trim(),
    city: body.city || 'Davangere',
    pincode: body.pincode.trim(),
    latitude: typeof body.latitude === 'number' ? body.latitude : null,
    longitude: typeof body.longitude === 'number' ? body.longitude : null,
    isDefault,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(userAddresses).values(newAddr);

  return c.json(successResponse(newAddr), 201);
});

// ── PUT /api/user-addresses/:id (Update address) ─────────────────────
userAddressesRoutes.put('/:id', requireAuth, async (c) => {
  const { id } = c.req.param();
  const currentUser = c.get('user');
  const db = getDb(c.env.DB);
  const body = await c.req.json().catch(() => null);

  if (!body) {
    throw new BadRequestError('Invalid JSON request body.');
  }

  const existing = await db.select().from(userAddresses).where(eq(userAddresses.id, id)).limit(1);
  if (existing.length === 0) {
    throw new NotFoundError(`Address '${id}' not found.`);
  }

  if (existing[0].userId !== currentUser?.id && currentUser?.role !== 'ADMIN') {
    throw new ForbiddenError('You do not have permission to modify this address.');
  }

  if (body.isDefault === true) {
    await db
      .update(userAddresses)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(eq(userAddresses.userId, currentUser.id));
  }

  const updates: Record<string, any> = {
    updatedAt: new Date(),
  };

  if (body.label !== undefined) updates.label = body.label;
  if (body.fullAddress !== undefined) updates.fullAddress = body.fullAddress.trim();
  if (body.flatNumber !== undefined) updates.flatNumber = body.flatNumber;
  if (body.landmark !== undefined) updates.landmark = body.landmark;
  if (body.area !== undefined) updates.area = body.area.trim();
  if (body.city !== undefined) updates.city = body.city;
  if (body.pincode !== undefined) updates.pincode = body.pincode.trim();
  if (body.latitude !== undefined) updates.latitude = Number(body.latitude);
  if (body.longitude !== undefined) updates.longitude = Number(body.longitude);
  if (body.isDefault !== undefined) updates.isDefault = Boolean(body.isDefault);

  await db.update(userAddresses).set(updates).where(eq(userAddresses.id, id));

  const updated = await db.select().from(userAddresses).where(eq(userAddresses.id, id)).limit(1);
  return c.json(successResponse(updated[0]));
});

// ── DELETE /api/user-addresses/:id (Delete address) ──────────────────
userAddressesRoutes.delete('/:id', requireAuth, async (c) => {
  const { id } = c.req.param();
  const currentUser = c.get('user');
  const db = getDb(c.env.DB);

  const existing = await db.select().from(userAddresses).where(eq(userAddresses.id, id)).limit(1);
  if (existing.length === 0) {
    throw new NotFoundError(`Address '${id}' not found.`);
  }

  if (existing[0].userId !== currentUser?.id && currentUser?.role !== 'ADMIN') {
    throw new ForbiddenError('You do not have permission to delete this address.');
  }

  await db.delete(userAddresses).where(eq(userAddresses.id, id));

  return c.json(successResponse({ deleted: true, id }));
});
