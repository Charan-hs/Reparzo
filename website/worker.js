export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Direct proxy for API, banners, and media to backend Worker via Service Binding
    if (
      url.pathname.startsWith('/api') ||
      url.pathname.startsWith('/banners') ||
      url.pathname.startsWith('/media')
    ) {
      if (env.BACKEND && typeof env.BACKEND.fetch === 'function') {
        const backendRes = await env.BACKEND.fetch(request);
        if (backendRes.status !== 404) {
          return backendRes;
        }
      } else {
        const targetUrl = new URL(
          url.pathname + url.search,
          env.API_FALLBACK_URL || 'https://reparzo-backend.reparzo-backend.workers.dev'
        );
        const backendRes = await fetch(targetUrl, request);
        if (backendRes.status !== 404) {
          return backendRes;
        }
      }
    }

    // 2. Fetch static assets from the [assets] binding (SPA files)
    const assetResponse = await env.ASSETS.fetch(request);

    // 3. Prevent SPA index.html fallback from masking missing images
    // If an image asset was requested but ASSETS returned HTML or 404, check backend media storage
    const isImageRequest = /\.(webp|jpg|jpeg|png|gif|svg|avif|ico)$/i.test(url.pathname);
    if (isImageRequest) {
      const contentType = assetResponse.headers.get('content-type') || '';
      if (assetResponse.status === 404 || contentType.includes('text/html')) {
        if (env.BACKEND && typeof env.BACKEND.fetch === 'function') {
          const mediaRes = await env.BACKEND.fetch(request);
          if (mediaRes.ok) {
            return mediaRes;
          }
        } else {
          const targetUrl = new URL(
            url.pathname + url.search,
            env.API_FALLBACK_URL || 'https://reparzo-backend.reparzo-backend.workers.dev'
          );
          const mediaRes = await fetch(targetUrl, request);
          if (mediaRes.ok) {
            return mediaRes;
          }
        }
      }
    }

    return assetResponse;
  },
};
