export interface AuthUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER' | 'TECHNICIAN';
  name?: string;
}

export interface Env {
  DB: D1Database;
  CACHE?: KVNamespace;
  MEDIA?: R2Bucket;
  ENVIRONMENT: string;
  FRONTEND_URL: string;
  JWT_SECRET: string;
}

export interface Variables {
  user?: AuthUser;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: number;
    durationMs?: number;
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}
