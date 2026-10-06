import { Hono } from 'hono';
import { eq, desc } from 'drizzle-orm';
import type { Env, Variables } from '../types';
import { getDb } from '../db';
import { bookings } from '../db/schema/bookings';
import { users } from '../db/schema/users';
import { successResponse } from '../utils/response';
import { BadRequestError, NotFoundError } from '../utils/AppError';
import { requirePartnerOrAdmin, requireAdmin, optionalAuth } from '../middleware/auth';

export const bookingsRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

function formatBookingRow(row: any) {
  let items = [];
  if (row.items) {
    try {
      items = typeof row.items === 'string' ? JSON.parse(row.items) : row.items;
    } catch {
      items = [];
    }
  }

  let slot = { type: 'instant', dateLabel: 'Today', timeSlot: 'Next 30-45 Mins' };
  if (row.slot) {
    try {
      slot = typeof row.slot === 'string' ? JSON.parse(row.slot) : row.slot;
    } catch {
      // keep fallback
    }
  }

  return {
    id: row.id,
    items,
    itemTotal: row.itemTotal ?? row.totalAmount ?? 0,
    platformFee: row.platformFee ?? 0,
    discount: row.discount ?? 0,
    grandTotal: row.grandTotal ?? row.totalAmount ?? 0,
    address: row.address,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    customerEmail: row.customerEmail || undefined,
    slot,
    paymentMethod: row.paymentMethod || 'cash',
    paymentStatus: row.paymentStatus || 'pending',
    status: row.status || 'confirmed',
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
    technicianName: row.technicianName || undefined,
    technicianPhone: row.technicianPhone || undefined,
    completionPin: row.completionPin || undefined,
    adminNotes: row.adminNotes || undefined,
  };
}

// ── GET /api/bookings ──────────────────────────────────────────────────
// Admins see all bookings. Partners see available or assigned.
// Regular users see their own bookings based on user ID or phone.
bookingsRoutes.get('/', optionalAuth, async (c) => {
  const db = getDb(c.env.DB);
  const currentUser = c.get('user');
  const statusFilter = c.req.query('status');
  const searchQuery = c.req.query('search');
  const phoneQuery = c.req.query('phone');

  try {
    const all = await db
      .select()
      .from(bookings)
      .orderBy(desc(bookings.createdAt));

    let filtered = all;

    // Access control filtering
    if (currentUser?.role === 'ADMIN') {
      // Admins see everything
    } else if (currentUser?.role === 'TECHNICIAN') {
      // Partners see all active bookings
      filtered = filtered.filter(
        (b) => b.status !== 'cancelled' || b.technicianPhone === currentUser.phone
      );
    } else if (currentUser) {
      // Regular logged-in users only see their own bookings
      const userPhone = currentUser.phone?.replace(/\s+/g, '') || '';
      const userEmail = currentUser.email?.toLowerCase() || '';

      filtered = filtered.filter((b) => {
        const matchesUser = b.userId && b.userId === currentUser.id;
        const matchesPhone = userPhone && b.customerPhone?.replace(/\s+/g, '').includes(userPhone);
        const matchesEmail = userEmail && b.customerEmail?.toLowerCase() === userEmail;
        return matchesUser || matchesPhone || matchesEmail;
      });
    } else if (phoneQuery) {
      // Guest tracking lookup by phone
      const cleanPhone = phoneQuery.replace(/\s+/g, '');
      filtered = filtered.filter((b) =>
        b.customerPhone?.replace(/\s+/g, '').includes(cleanPhone)
      );
    } else {
      // Guest without query gets empty list
      filtered = [];
    }

    // Status filter
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter((b) => b.status === statusFilter);
    }

    // Search query
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((b) =>
        b.id.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.customerPhone.includes(q) ||
        b.address.toLowerCase().includes(q)
      );
    }

    const formatted = filtered.map(formatBookingRow);

    return c.json(
      successResponse(formatted, {
        timestamp: Date.now(),
        pagination: { page: 1, limit: formatted.length, total: formatted.length },
      })
    );
  } catch (err: any) {
    console.error('[bookingsRoutes GET] Error:', err);
    return c.json(successResponse([], { timestamp: Date.now() }));
  }
});

// ── POST /api/bookings ─────────────────────────────────────────────────
// Creates a new booking / order from storefront checkout or admin dispatch
bookingsRoutes.post('/', optionalAuth, async (c) => {
  // Operational Feature Flag: Block new requests when admin pauses ordering
  if (c.env.CACHE) {
    try {
      const cached = await c.env.CACHE.get('system:settings');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.isOrderingEnabled === false) {
          throw new BadRequestError(
            parsed.upgradeMessage ||
              'We are currently upgrading our service. We will be back in no time! Please check back later.'
          );
        }
      }
    } catch (err) {
      if (err instanceof BadRequestError) throw err;
    }
  }

  const body = await c.req.json().catch(() => null);

  if (!body) {
    throw new BadRequestError('Invalid JSON request body');
  }

  const {
    customerName,
    customerPhone,
    customerEmail,
    address,
    city = 'Davangere',
    pincode = '577005',
    items = [],
    itemTotal,
    platformFee = 19,
    discount = 0,
    grandTotal,
    slot,
    paymentMethod = 'cash',
    paymentStatus,
    status = 'confirmed',
    completionPin,
    issueDescription,
    serviceId,
  } = body;

  if (!customerName || !customerPhone || !address) {
    throw new BadRequestError('Missing required booking fields', {
      required: ['customerName', 'customerPhone', 'address'],
    });
  }

  const currentUser = c.get('user');
  let userIdToUse = currentUser?.id || body.userId || null;

  const db = getDb(c.env.DB);

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
      // Non-blocking auto-provision
    }
  }

  const bookingId = body.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const finalGrandTotal = grandTotal ?? itemTotal ?? 0;

  const newBooking = {
    id: bookingId,
    userId: userIdToUse,
    serviceId: serviceId || items[0]?.serviceId || items[0]?.id || null,
    customerName: customerName.trim(),
    customerEmail: customerEmail ? customerEmail.trim() : currentUser?.email || null,
    customerPhone: customerPhone.trim(),
    address: address.trim(),
    city: city.trim(),
    pincode: pincode.trim(),
    issueDescription: issueDescription || '',
    status: status || 'confirmed',
    items: typeof items === 'string' ? items : JSON.stringify(items),
    itemTotal: itemTotal ? Number(itemTotal) : Number(finalGrandTotal),
    platformFee: Number(platformFee),
    discount: Number(discount),
    grandTotal: Number(finalGrandTotal),
    totalAmount: Number(finalGrandTotal),
    slot: typeof slot === 'string' ? slot : JSON.stringify(slot || { type: 'instant', dateLabel: 'Today', timeSlot: 'Next 30-45 Mins' }),
    paymentMethod: paymentMethod || 'cash',
    paymentStatus: paymentStatus || (paymentMethod === 'cash' ? 'pending' : 'paid'),
    completionPin: completionPin || Math.floor(1000 + Math.random() * 9000).toString(),
    technicianName: body.technicianName || null,
    technicianPhone: body.technicianPhone || null,
    adminNotes: body.adminNotes || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(bookings).values(newBooking);

  const formatted = formatBookingRow(newBooking);

  return c.json(
    successResponse(
      {
        booking: formatted,
        message: 'Your service request has been confirmed! A technician will reach out shortly.',
      },
      { timestamp: Date.now() }
    ),
    201
  );
});

// ── PATCH /api/bookings/:id ────────────────────────────────────────────
// Partners or Admins update status, technician assignment, pin, or notes
bookingsRoutes.patch('/:id', requirePartnerOrAdmin, async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json().catch(() => null);

  if (!body) {
    throw new BadRequestError('Invalid JSON request body');
  }

  const db = getDb(c.env.DB);
  const existing = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);

  if (existing.length === 0) {
    throw new NotFoundError(`Booking '${id}' not found.`);
  }

  const updates: Record<string, any> = {
    updatedAt: new Date(),
  };

  if (body.status !== undefined) updates.status = body.status;
  if (body.technicianName !== undefined) updates.technicianName = body.technicianName;
  if (body.technicianPhone !== undefined) updates.technicianPhone = body.technicianPhone;
  if (body.adminNotes !== undefined) updates.adminNotes = body.adminNotes;
  if (body.completionPin !== undefined) updates.completionPin = body.completionPin;
  if (body.paymentStatus !== undefined) updates.paymentStatus = body.paymentStatus;
  if (body.address !== undefined) updates.address = body.address;

  await db
    .update(bookings)
    .set(updates)
    .where(eq(bookings.id, id));

  const updated = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return c.json(successResponse(formatBookingRow(updated[0])));
});

// ── DELETE /api/bookings/:id ───────────────────────────────────────────
// Admin permanently removes booking
bookingsRoutes.delete('/:id', requireAdmin, async (c) => {
  const { id } = c.req.param();
  const db = getDb(c.env.DB);

  const existing = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);

  if (existing.length === 0) {
    throw new NotFoundError(`Booking '${id}' not found.`);
  }

  await db.delete(bookings).where(eq(bookings.id, id));

  return c.json(
    successResponse({ id, deleted: true, message: `Booking '${id}' deleted successfully.` })
  );
});
