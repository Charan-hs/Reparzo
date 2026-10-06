import { Hono } from 'hono';
import { eq, desc, and, or, like } from 'drizzle-orm';
import type { Env, Variables } from '../types';
import { getDb } from '../db';
import { customRequests } from '../db/schema/customRequests';
import { users } from '../db/schema/users';
import { successResponse } from '../utils/response';
import { BadRequestError, NotFoundError } from '../utils/AppError';
import { optionalAuth, requireAdmin, requirePartnerOrAdmin } from '../middleware/auth';

export const customRequestsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// ── GET /api/custom-requests ───────────────────────────────────────────
// Admins see all requests. Partners see active/assigned requests.
// Regular users see their own requests based on ID, phone, or email.
customRequestsRoutes.get('/', optionalAuth, async (c) => {
  const db = getDb(c.env.DB);
  const currentUser = c.get('user');
  const statusFilter = c.req.query('status');
  const searchQuery = c.req.query('search');
  const phoneQuery = c.req.query('phone');

  try {
    const all = await db
      .select()
      .from(customRequests)
      .orderBy(desc(customRequests.createdAt));

    let filtered = all;

    // Access control filtering
    if (currentUser?.role === 'ADMIN') {
      // Admins have unrestricted access to all requests
    } else if (currentUser?.role === 'TECHNICIAN') {
      // Partners see all requests except cancelled, or requests assigned to them
      filtered = filtered.filter(
        (r) => r.status !== 'cancelled' || r.partnerPhone === currentUser.phone
      );
    } else if (currentUser) {
      // Authenticated regular users only see requests matching their account
      const userPhone = currentUser.phone?.replace(/\s+/g, '') || '';
      const userEmail = currentUser.email?.toLowerCase() || '';

      filtered = filtered.filter((r) => {
        const matchesUser = r.userId && r.userId === currentUser.id;
        const matchesPhone = userPhone && r.customerPhone?.replace(/\s+/g, '').includes(userPhone);
        const matchesEmail = userEmail && r.customerEmail?.toLowerCase() === userEmail;
        return matchesUser || matchesPhone || matchesEmail;
      });
    } else if (phoneQuery) {
      // Unauthenticated phone search (e.g. guest order tracking)
      const cleanPhone = phoneQuery.replace(/\s+/g, '');
      filtered = filtered.filter((r) =>
        r.customerPhone?.replace(/\s+/g, '').includes(cleanPhone)
      );
    } else {
      // Unauthenticated guest without query gets empty list
      filtered = [];
    }

    // Status filter
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // Search query
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((r) =>
        r.id.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.customerPhone.includes(q) ||
        r.title.toLowerCase().includes(q) ||
        r.categoryTitle.toLowerCase().includes(q)
      );
    }

    // Map timestamps to ISO strings for client compatibility
    const formatted = filtered.map((r) => ({
      ...r,
      isDelivery: Boolean(r.isDelivery),
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
    }));

    return c.json(
      successResponse(formatted, {
        timestamp: Date.now(),
        pagination: { page: 1, limit: formatted.length, total: formatted.length },
      })
    );
  } catch (err: any) {
    console.error('[customRequestsRoutes GET] Error:', err);
    return c.json(successResponse([], { timestamp: Date.now() }));
  }
});

// ── POST /api/custom-requests ──────────────────────────────────────────
// Creates a new custom errand, meat delivery, or repair request
customRequestsRoutes.post('/', optionalAuth, async (c) => {
  const db = getDb(c.env.DB);
  const currentUser = c.get('user');
  const body = await c.req.json().catch(() => null);

  if (!body) {
    throw new BadRequestError('Invalid JSON request body');
  }

  const {
    customerName,
    customerPhone,
    customerEmail,
    title,
    categoryType,
    categoryTitle,
    description,
    isDelivery,
    pickupAddress,
    dropAddress,
    serviceAddress,
    preferredDate,
    preferredTimeSlot,
    urgency,
    estimatedBudget,
  } = body;

  if (!customerName || !customerPhone || !title || !categoryType || !description) {
    throw new BadRequestError('Missing required custom request fields', {
      required: ['customerName', 'customerPhone', 'title', 'categoryType', 'description'],
    });
  }

  // Generate unique custom request ID (e.g., REQ-9102 format)
  let requestId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
  const existing = await db
    .select({ id: customRequests.id })
    .from(customRequests)
    .where(eq(customRequests.id, requestId))
    .limit(1);

  if (existing.length > 0) {
    requestId = `REQ-${Date.now().toString().slice(-4)}`;
  }

  // Ensure user exists if userId is supplied
  let userIdToUse = currentUser?.id || body.userId || null;
  if (userIdToUse) {
    try {
      const u = await db.select().from(users).where(eq(users.id, userIdToUse)).limit(1);
      if (u.length === 0) {
        await db.insert(users).values({
          id: userIdToUse,
          name: customerName,
          email: customerEmail || `${userIdToUse}@reparzo.internal`,
          phone: customerPhone,
          role: 'USER',
        });
      }
    } catch {
      // Non-blocking user auto-provision
    }
  }

  const newRecord = {
    id: requestId,
    userId: userIdToUse,
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    customerEmail: customerEmail ? customerEmail.trim() : null,
    title: title.trim(),
    categoryType: categoryType.trim(),
    categoryTitle: (categoryTitle || categoryType).trim(),
    description: description.trim(),
    isDelivery: Boolean(isDelivery),
    pickupAddress: pickupAddress ? pickupAddress.trim() : null,
    dropAddress: dropAddress ? dropAddress.trim() : null,
    serviceAddress: (serviceAddress || dropAddress || pickupAddress || 'Davangere').trim(),
    preferredDate: preferredDate || 'Today',
    preferredTimeSlot: preferredTimeSlot || 'Urgent (Immediate Dispatch)',
    urgency: urgency || 'same_day',
    estimatedBudget: estimatedBudget ? Number(estimatedBudget) : null,
    quotedPrice: null,
    status: 'submitted' as const,
    adminNotes: null,
    partnerName: null,
    partnerPhone: null,
    completionPin: Math.floor(1000 + Math.random() * 9000).toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(customRequests).values(newRecord);

  const formatted = {
    ...newRecord,
    isDelivery: Boolean(newRecord.isDelivery),
    createdAt: newRecord.createdAt.toISOString(),
    updatedAt: newRecord.updatedAt.toISOString(),
  };

  return c.json(
    successResponse(formatted, {
      timestamp: Date.now(),
    }),
    201
  );
});

// ── PATCH /api/custom-requests/:id ─────────────────────────────────────
// Admin / Partner updates request status, quote, notes, or assigned technician
customRequestsRoutes.patch('/:id', requirePartnerOrAdmin, async (c) => {
  const { id } = c.req.param();
  const db = getDb(c.env.DB);
  const body = await c.req.json().catch(() => null);

  if (!body) {
    throw new BadRequestError('Invalid JSON request body');
  }

  const existing = await db
    .select()
    .from(customRequests)
    .where(eq(customRequests.id, id))
    .limit(1);

  if (existing.length === 0) {
    throw new NotFoundError(`Custom request '${id}' not found`);
  }

  const updates: Record<string, any> = {
    updatedAt: new Date(),
  };

  if (body.status !== undefined) updates.status = body.status;
  if (body.quotedPrice !== undefined) updates.quotedPrice = body.quotedPrice ? Number(body.quotedPrice) : null;
  if (body.adminNotes !== undefined) updates.adminNotes = body.adminNotes;
  if (body.partnerName !== undefined) updates.partnerName = body.partnerName;
  if (body.partnerPhone !== undefined) updates.partnerPhone = body.partnerPhone;
  if (body.completionPin !== undefined) updates.completionPin = body.completionPin;
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.serviceAddress !== undefined) updates.serviceAddress = body.serviceAddress;

  await db
    .update(customRequests)
    .set(updates)
    .where(eq(customRequests.id, id));

  const updated = await db
    .select()
    .from(customRequests)
    .where(eq(customRequests.id, id))
    .limit(1);

  const r = updated[0];
  const formatted = {
    ...r,
    isDelivery: Boolean(r.isDelivery),
    createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
  };

  return c.json(successResponse(formatted));
});

// ── DELETE /api/custom-requests/:id ────────────────────────────────────
// Admin permanently removes custom request
customRequestsRoutes.delete('/:id', requireAdmin, async (c) => {
  const { id } = c.req.param();
  const db = getDb(c.env.DB);

  const existing = await db
    .select()
    .from(customRequests)
    .where(eq(customRequests.id, id))
    .limit(1);

  if (existing.length === 0) {
    throw new NotFoundError(`Custom request '${id}' not found`);
  }

  await db.delete(customRequests).where(eq(customRequests.id, id));

  return c.json(
    successResponse({ id, deleted: true, message: `Custom request '${id}' deleted successfully.` })
  );
});
