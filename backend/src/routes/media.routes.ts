import { Hono } from 'hono';
import type { Env, Variables } from '../types';
import { NotFoundError, BadRequestError } from '../utils/AppError';
import { successResponse } from '../utils/response';

export const mediaRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  gif: 'image/gif',
  avif: 'image/avif',
};

// POST /api/media/upload - Upload and store an image in cloud media storage
mediaRoutes.post('/upload', async (c) => {
  if (!c.env.MEDIA) {
    throw new NotFoundError('Media storage service is temporarily unavailable. Please try again later.');
  }

  const contentTypeHeader = c.req.header('content-type') || '';
  let filename = '';
  let buffer: ArrayBuffer;
  let mimeType = 'image/webp';

  if (contentTypeHeader.includes('multipart/form-data')) {
    const formData = await c.req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      throw new BadRequestError('No file provided in form-data.');
    }
    filename = (formData.get('filename') as string) || file.name || `banner-${Date.now()}.webp`;
    mimeType = file.type || 'image/webp';
    buffer = await file.arrayBuffer();
  } else {
    // Direct binary stream/body
    buffer = await c.req.arrayBuffer();
    if (!buffer || buffer.byteLength === 0) {
      throw new BadRequestError('Upload payload is empty.');
    }
    filename = c.req.header('x-filename') || `banner-${Date.now()}.webp`;
    mimeType = contentTypeHeader || 'image/webp';
  }

  // Clean filename: remove unsafe chars, enforce clean extension
  let cleanName = filename.toLowerCase().replace(/[^a-z0-9.-]/g, '-').replace(/-+/g, '-');
  if (!cleanName.endsWith('.webp') && mimeType.includes('webp')) {
    cleanName = cleanName.replace(/\.[^/.]+$/, '') + '.webp';
  }

  const key = `banners/${Date.now()}-${cleanName}`;

  await c.env.MEDIA.put(key, buffer, {
    httpMetadata: {
      contentType: mimeType,
      cacheControl: 'public, max-age=31536000, immutable',
    },
  });

  return c.json(
    successResponse(
      {
        key,
        url: `/api/media/${key}`,
        size: buffer.byteLength,
        contentType: mimeType,
      },
      {
        timestamp: Date.now(),
      }
    ),
    201
  );
});

// GET /api/media/list - List stored assets in media storage
mediaRoutes.get('/list', async (c) => {
  if (!c.env.MEDIA) {
    return c.json(
      successResponse({
        configured: false,
        message: 'Media storage is not configured',
        objects: [],
      })
    );
  }

  const prefix = c.req.query('prefix') || '';
  const limit = Math.min(Number(c.req.query('limit')) || 100, 500);
  const listed = await c.env.MEDIA.list({ prefix, limit });

  const objects = listed.objects.map((obj) => ({
    key: obj.key,
    size: obj.size,
    etag: obj.httpEtag,
    uploaded: obj.uploaded.toISOString(),
    contentType: obj.httpMetadata?.contentType || 'application/octet-stream',
    url: `/api/media/${obj.key}`,
  }));

  return c.json(
    successResponse({
      configured: true,
      bucket: 'reparzo-media',
      prefix,
      count: objects.length,
      truncated: listed.truncated,
      objects,
    })
  );
});

// OPTIONS /* - Preflight support for media endpoints
mediaRoutes.options('*', (c) => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    },
  });
});

// GET /* - Retrieve & stream image/media from storage
mediaRoutes.get('*', async (c) => {
  if (!c.env.MEDIA) {
    throw new NotFoundError('Media storage service is temporarily unavailable. Please try again later.');
  }

  const rawPath = c.req.path;
  // Cleanly extract key regardless of whether mounted at /api/media, /media, or /banners
  let key = rawPath
    .replace(/^\/api\/media\/?/, '')
    .replace(/^\/media\/?/, '')
    .replace(/^\//, '');

  if (!key) {
    throw new NotFoundError('Media key parameter is missing.');
  }

  // Attempt 1: Check key as-is (e.g. "banners/ac-service.jpg", "logo.png")
  let object = await c.env.MEDIA.get(key);

  // Attempt 2: If key doesn't start with banners/, try "banners/" prefix
  if (!object && !key.startsWith('banners/')) {
    object = await c.env.MEDIA.get(`banners/${key}`);
    if (object) key = `banners/${key}`;
  }

  // Attempt 3: If key starts with banners/, try without "banners/" prefix
  if (!object && key.startsWith('banners/')) {
    const unPrefixed = key.replace(/^banners\//, '');
    object = await c.env.MEDIA.get(unPrefixed);
    if (object) key = unPrefixed;
  }

  if (!object) {
    throw new NotFoundError(`Requested asset '${key}' was not found.`);
  }

  const ext = key.split('.').pop()?.toLowerCase() || '';
  const contentType = object.httpMetadata?.contentType || MIME_TYPES[ext] || 'application/octet-stream';

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Content-Type', contentType);
  headers.set('ETag', object.httpEtag);
  // High-performance immutable edge caching
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Cross-Origin-Resource-Policy', 'cross-origin');

  return new Response(object.body, { headers });
});
