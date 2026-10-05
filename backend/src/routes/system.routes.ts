import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { successResponse } from '../utils/response';
import { BadRequestError } from '../utils/AppError';
import { requireAdmin } from '../middleware/auth';

export const systemRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

export const DEFAULT_UPGRADE_MESSAGE =
  'We are currently upgrading our service. We will be back in no time! Please check back later.';

const SETTINGS_KEY = 'system:settings';

export interface SystemSettings {
  isOrderingEnabled: boolean;
  upgradeMessage: string;
  updatedAt?: string;
  updatedBy?: string;
}

// ── GET /api/system/settings (Public: Read current operational status) 
systemRoutes.get('/settings', async (c) => {
  let settings: SystemSettings = {
    isOrderingEnabled: true,
    upgradeMessage: DEFAULT_UPGRADE_MESSAGE,
  };

  if (c.env.CACHE) {
    try {
      const cached = await c.env.CACHE.get(SETTINGS_KEY);
      if (cached) {
        settings = JSON.parse(cached);
      }
    } catch {
      // Fallback to default enabled
    }
  }

  return c.json(
    successResponse(settings, {
      timestamp: Date.now(),
    })
  );
});

// ── POST /api/system/settings (Admin only: Toggle ordering / service upgrade flag)
systemRoutes.post('/settings', requireAdmin, async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body || typeof body.isOrderingEnabled !== 'boolean') {
    throw new BadRequestError('isOrderingEnabled boolean is required.');
  }

  const currentUser = c.get('user');

  const newSettings: SystemSettings = {
    isOrderingEnabled: body.isOrderingEnabled,
    upgradeMessage:
      typeof body.upgradeMessage === 'string' && body.upgradeMessage.trim().length > 0
        ? body.upgradeMessage.trim()
        : DEFAULT_UPGRADE_MESSAGE,
    updatedAt: new Date().toISOString(),
    updatedBy: currentUser?.email || 'Admin',
  };

  if (c.env.CACHE) {
    await c.env.CACHE.put(SETTINGS_KEY, JSON.stringify(newSettings));
  }

  return c.json(successResponse(newSettings));
});
