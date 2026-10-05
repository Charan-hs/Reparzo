import { auth } from './firebase';

/**
 * Retrieves the current active Bearer authentication token.
 * 1. Checks Firebase Auth currentUser ID Token (auto-refreshes expired tokens).
 * 2. Falls back to localStorage tokens if stored.
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      if (token) return token;
    }
  } catch (err) {
    console.warn('[authClient] Error retrieving Firebase ID token:', err);
  }

  // Fallback to locally cached tokens
  if (typeof window !== 'undefined') {
    const localToken = 
      localStorage.getItem('reparzo_auth_token') || 
      localStorage.getItem('admin_token') ||
      localStorage.getItem('user_token');
    if (localToken) return localToken;
  }

  return null;
}

/**
 * Returns headers dictionary with Authorization Bearer header if a token is available.
 */
export async function getAuthHeaders(additionalHeaders: Record<string, string> = {}): Promise<Record<string, string>> {
  const token = await getAuthToken();
  const headers: Record<string, string> = { ...additionalHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Edge-compatible authenticated fetch wrapper.
 * Automatically attaches Authorization header if a token is present.
 */
export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = await getAuthToken();
  const headers = new Headers(init.headers || {});

  if (token && !headers.has('Authorization') && !headers.has('authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
