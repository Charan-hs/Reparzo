import type { ApiResponse } from '../types';

export function successResponse<T>(data: T, meta?: ApiResponse<T>['meta']): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: Date.now(),
      ...meta,
    },
  };
}

export function errorResponse(code: string, message: string, details?: unknown): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: Date.now(),
    },
  };
}
