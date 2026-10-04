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

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  priceEstimated: number;
  durationMinutes: number;
  icon: string;
  isPopular: boolean;
  isActive: boolean;
}

export interface BookingPayload {
  serviceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city?: string;
  pincode: string;
  issueDescription?: string;
  scheduledAt?: string;
}

const API_BASE = '/api';

export async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const payload: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    error: {
      code: 'PARSE_ERROR',
      message: 'Unable to parse server response. Please try again.',
    },
  }));

  if (!response.ok || !payload.success) {
    const errorMsg = payload.error?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return payload.data as T;
}

export const api = {
  getHealth: () => fetchApi<{ status: string; environment: string; database: { status: string } }>('/health'),
  getServices: () => fetchApi<ServiceItem[]>('/services'),
  getServiceBySlug: (slug: string) => fetchApi<ServiceItem>(`/services/${slug}`),
  createBooking: (booking: BookingPayload) =>
    fetchApi<{ booking: any; message: string }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    }),
};
