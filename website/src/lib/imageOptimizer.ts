/**
 * Google Squoosh-inspired client-side WebP Image Optimizer
 * 
 * Features:
 * - High-fidelity bicubic resampling to preserve crisp edge details
 * - High-quality WebP encoding (0.90 quality level for visually lossless fidelity)
 * - Automatic resolution downsampling with aspect ratio preservation (max 1920x1080)
 * - Direct cloud media storage upload pipeline via /api/media/upload
 */

import { authFetch } from './authClient';

export interface CompressionResult {
  blob: Blob;
  previewUrl: string;
  originalName: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number; // percentage saved, e.g. 85.5%
  width: number;
  height: number;
  mimeType: string;
}

export interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 - 1.0 (default 0.90 for best visual quality)
}

/**
 * Compresses an image File or Blob to WebP using Google Squoosh best-practice parameters.
 */
export async function compressImageToWebP(
  file: File | Blob,
  options: OptimizeOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.90, // Google Squoosh recommended sweet spot for high-fidelity WebP
  } = options;

  const originalSize = file.size;
  const originalName = 'name' in file ? (file as File).name : 'uploaded-image';

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Maintain aspect ratio while bounding within maxWidth & maxHeight
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Create an offscreen rendering canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) {
        reject(new Error('Failed to acquire 2D canvas context for image optimization.'));
        return;
      }

      // Configure high-quality resampling (matches Squoosh Lanczos3 / Bicubic smoothing)
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw the image onto the canvas with smooth interpolation
      ctx.drawImage(img, 0, 0, width, height);

      // Export as WebP
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('WebP compression failed in this browser environment.'));
            return;
          }

          const compressedSize = blob.size;
          const ratio = Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100));
          const previewUrl = URL.createObjectURL(blob);

          resolve({
            blob,
            previewUrl,
            originalName,
            originalSize,
            compressedSize,
            compressionRatio: ratio,
            width,
            height,
            mimeType: 'image/webp',
          });
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Unable to decode image file. Please provide a valid JPG, PNG, or WebP.'));
    };

    img.src = objectUrl;
  });
}

/**
 * Uploads an optimized WebP blob to secure media cloud storage via Reparzo's /api/media/upload endpoint.
 */
export async function uploadImageToStorage(
  webpBlob: Blob,
  filename: string
): Promise<{ url: string; key: string; size: number }> {
  const formData = new FormData();
  
  // Ensure the filename has .webp extension
  const cleanBase = filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
  const targetFilename = `${cleanBase}.webp`;

  formData.append('file', webpBlob, targetFilename);
  formData.append('filename', targetFilename);

  const response = await authFetch('/api/media/upload', {
    method: 'POST',
    body: formData,
  });

  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json?.error?.message || 'Failed to upload image. Please try again.');
  }

  return {
    url: json.data.url,
    key: json.data.key,
    size: json.data.size,
  };
}

// Backwards-compatible alias for existing imports
export const uploadImageToR2 = uploadImageToStorage;

/**
 * Format bytes into human-readable string (KB, MB).
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
