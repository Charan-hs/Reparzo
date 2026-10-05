import { Hono } from 'hono';
import { eq, desc } from 'drizzle-orm';
import type { Env, Variables } from '../types';
import { getDb } from '../db';
import { users } from '../db/schema/users';
import { userAddresses } from '../db/schema/userAddresses';
import { successResponse } from '../utils/response';
import { BadRequestError, NotFoundError } from '../utils/AppError';
import { requireAuth, requireAdmin } from '../middleware/auth';

export const usersRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// ── POST /api/users/sync (Sync / Upsert user profile to D1) ───
usersRoutes.post('/sync', requireAuth, async (c) => {
  const currentUser = c.get('user');
  if (!currentUser || !currentUser.id) {
    throw new BadRequestError('User identity could not be verified from token.');
  }

  const db = getDb(c.env.DB);
  const body = await c.req.json().catch(() => ({}));

  const userId = currentUser.id;
  const userEmail = currentUser.email || body.email || `${userId}@auth.reparzo.internal`;
  const userName = body.name || currentUser.name || userEmail.split('@')[0] || 'Reparzo User';
  const userPhone = body.phone || currentUser.phone || null;
  const userRole = currentUser.role || 'USER';

  // Check if user already exists
  const existing = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (existing.length === 0) {
    // Insert new user
    const newUser = {
      id: userId,
      name: userName,
      email: userEmail,
      role: userRole,
      status: 'ACTIVE' as const,
      phone: userPhone,
      metadata: body.metadata || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.insert(users).values(newUser);
    return c.json(successResponse(newUser), 201);
  } else {
    // Update existing user with freshest details
    const updates: Record<string, any> = {
      updatedAt: new Date(),
    };
    if (userName && userName !== existing[0].name) updates.name = userName;
    if (userPhone && userPhone !== existing[0].phone) updates.phone = userPhone;
    if (userRole && userRole !== existing[0].role) updates.role = userRole;
    if (body.metadata) updates.metadata = body.metadata;

    await db.update(users).set(updates).where(eq(users.id, userId));

    const updated = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return c.json(successResponse(updated[0]));
  }
});

// ── GET /api/users/me (Retrieve authenticated user & addresses) 
usersRoutes.get('/me', requireAuth, async (c) => {
  const currentUser = c.get('user');
  if (!currentUser) {
    throw new NotFoundError('User not authenticated.');
  }

  const db = getDb(c.env.DB);
  const userRows = await db.select().from(users).where(eq(users.id, currentUser.id)).limit(1);
  const addresses = await db
    .select()
    .from(userAddresses)
    .where(eq(userAddresses.userId, currentUser.id))
    .orderBy(desc(userAddresses.isDefault), desc(userAddresses.createdAt));

  const profile = userRows.length > 0 ? userRows[0] : {
    id: currentUser.id,
    name: currentUser.name || 'User',
    email: currentUser.email,
    role: currentUser.role,
    phone: currentUser.phone,
    status: 'ACTIVE',
  };

  return c.json(
    successResponse({
      ...profile,
      addresses,
    })
  );
});

// ── GET /api/users (List users - Admin only) ──────────────────
usersRoutes.get('/', requireAdmin, async (c) => {
  const db = getDb(c.env.DB);
  const rows = await db.select().from(users).orderBy(desc(users.createdAt)).limit(100);
  return c.json(
    successResponse(rows, {
      timestamp: Date.now(),
      pagination: { page: 1, limit: rows.length, total: rows.length },
    })
  );
});
