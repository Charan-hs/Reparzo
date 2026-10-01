import type { Context } from 'hono';
import { AppError } from '../utils/AppError';
import type { Env, Variables } from '../types';

export function errorHandler(err: Error, c: Context<{ Bindings: Env; Variables: Variables }>) {
  if (err instanceof AppError) {
    return c.json(
      {
        success: false,
        error: {
          code: err.code,
          message: err.message,
          details: err.details,
        },
        meta: {
          timestamp: Date.now(),
        },
      },
      err.statusCode as any
    );
  }

  // Programmer Error or Unhandled Exception
  console.error('[Reparzo Edge Error]:', err);

  const isDev = c.env?.ENVIRONMENT === 'development';

  return c.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: isDev ? err.message : 'An unexpected server error occurred.',
        details: isDev ? err.stack : undefined,
      },
      meta: {
        timestamp: Date.now(),
      },
    },
    500
  );
}
