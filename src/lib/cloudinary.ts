/**
 * Minimal Cloudinary URL builder.
 *
 * No SDK needed — Cloudinary delivery URLs are just transformation strings,
 * so this keeps the build fast and the bundle empty. Every image goes out as
 * f_auto (AVIF/WebP where supported) and q_auto.
 */
const CLOUD_NAME =
  import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'zqexcwzv';

export interface CldOptions {
  /** Target width in pixels */
  width?: number;
  /** Target height in pixels */
  height?: number;
  /** Aspect ratio, e.g. '3:2' */
  aspectRatio?: string;
  /** How the image fits the box */
  crop?: 'fill' | 'fit' | 'limit' | 'thumb';
  /** Focal point. 'auto' lets Cloudinary find the subject. */
  gravity?: 'auto' | 'face' | 'faces' | 'center';
  quality?: string;
}

export function cldUrl(publicId: string, opts: CldOptions = {}): string {
  const {
    width,
    height,
    aspectRatio,
    crop = 'fill',
    gravity = 'auto',
    quality = 'auto:good',
  } = opts;

  const t: string[] = ['f_auto', `q_${quality}`];
  if (width) t.push(`w_${width}`);
  if (height) t.push(`h_${height}`);
  if (aspectRatio) t.push(`ar_${aspectRatio}`);
  if (width || height || aspectRatio) t.push(`c_${crop}`);
  if (crop === 'fill' || crop === 'thumb') t.push(`g_${gravity}`);

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${t.join(',')}/${publicId}`;
}

/** Responsive srcset across a set of widths. */
export function cldSrcSet(
  publicId: string,
  widths: number[],
  opts: CldOptions = {},
): string {
  return widths
    .map((w) => `${cldUrl(publicId, { ...opts, width: w })} ${w}w`)
    .join(', ');
}

/** Tiny blurred placeholder used as a CSS background while the real file loads. */
export function cldPlaceholder(publicId: string): string {
  return cldUrl(publicId, { width: 24, quality: 'auto:low' });
}

export const CLOUDINARY_CLOUD_NAME = CLOUD_NAME;
