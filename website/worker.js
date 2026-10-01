export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Proxy API requests directly to the Reparzo backend worker via Cloudflare Service Binding
    if (url.pathname.startsWith('/api')) {
      if (env.BACKEND && typeof env.BACKEND.fetch === 'function') {
        return env.BACKEND.fetch(request);
      }
      // Direct HTTP fallback if accessed during preview or without binding
      const targetUrl = new URL(url.pathname + url.search, env.API_FALLBACK_URL || 'https://reparzo-backend.workers.dev');
      return fetch(targetUrl, request);
    }

    // Serve static SPA assets from the [assets] binding
    return env.ASSETS.fetch(request);
  },
};
