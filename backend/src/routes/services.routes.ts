import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import type { Env, Variables } from '../types';
import { getDb } from '../db';
import { services } from '../db/schema/services';
import { successResponse } from '../utils/response';
import { NotFoundError } from '../utils/AppError';

export const servicesRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// Initial seed data if D1 has no rows yet (helpful for quick starts)
const INITIAL_SERVICES = [
  {
    id: 'srv_ac_repair',
    slug: 'ac-repair-and-service',
    title: 'AC Deep Clean & Repair',
    description: 'Comprehensive inspection, coil cleaning, gas charging, and filter sanitization by certified technicians.',
    category: 'Appliances',
    priceEstimated: 699,
    durationMinutes: 90,
    icon: 'Wind',
    isPopular: true,
    isActive: true,
  },
  {
    id: 'srv_refrig_repair',
    slug: 'refrigerator-diagnostics',
    title: 'Refrigerator Cooling Repair',
    description: 'Compressor check, thermostat calibration, frost management, and gas leak sealing.',
    category: 'Appliances',
    priceEstimated: 499,
    durationMinutes: 60,
    icon: 'Refrigerator',
    isPopular: true,
    isActive: true,
  },
  {
    id: 'srv_wash_repair',
    slug: 'washing-machine-service',
    title: 'Washing Machine Repair',
    description: 'Drum vibration resolution, motor repairs, PCB diagnosis, and water intake troubleshooting.',
    category: 'Appliances',
    priceEstimated: 549,
    durationMinutes: 75,
    icon: 'Disc',
    isPopular: false,
    isActive: true,
  },
  {
    id: 'srv_ro_purifier',
    slug: 'ro-water-purifier-service',
    title: 'RO Water Purifier Service',
    description: 'Membrane replacement, sediment filter flush, TDS level check, and UV lamp inspection.',
    category: 'Home Care',
    priceEstimated: 399,
    durationMinutes: 45,
    icon: 'Droplets',
    isPopular: true,
    isActive: true,
  },
  {
    id: 'srv_electrician',
    slug: 'home-electrical-repair',
    title: 'Expert Home Electrical Service',
    description: 'Short circuit troubleshooting, MCB replacement, fan installation, and complete wiring check.',
    category: 'Electrical',
    priceEstimated: 299,
    durationMinutes: 45,
    icon: 'Zap',
    isPopular: false,
    isActive: true,
  },
];

// GET /api/services - list all active services
servicesRoutes.get('/', async (c) => {
  const db = getDb(c.env.DB);
  let rows = [];

  try {
    rows = await db.select().from(services).where(eq(services.isActive, true));
  } catch (err) {
    // If table isn't migrated yet in local preview, fall back to seed services gracefully
    rows = INITIAL_SERVICES;
  }

  // Fallback to initial services if database is freshly seeded
  const result = rows.length > 0 ? rows : INITIAL_SERVICES;

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

// GET /api/services/:idOrSlug - get single service
servicesRoutes.get('/:idOrSlug', async (c) => {
  const { idOrSlug } = c.req.param();
  const db = getDb(c.env.DB);

  let service = null;
  try {
    const byId = await db.select().from(services).where(eq(services.id, idOrSlug)).limit(1);
    if (byId.length > 0) {
      service = byId[0];
    } else {
      const bySlug = await db.select().from(services).where(eq(services.slug, idOrSlug)).limit(1);
      if (bySlug.length > 0) service = bySlug[0];
    }
  } catch {
    // Fallback search in initial array
    service = INITIAL_SERVICES.find((s) => s.id === idOrSlug || s.slug === idOrSlug);
  }

  if (!service) {
    throw new NotFoundError(`Service '${idOrSlug}' not found.`);
  }

  return c.json(successResponse(service));
});
