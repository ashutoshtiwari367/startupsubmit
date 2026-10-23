// lib/image-utils.ts
// Client-only helpers for processing an uploaded startup logo.

export const DEFAULT_BRAND_COLOR = '#f97316'; // orange-500

export interface ProcessedLogo {
  blob: Blob;
  previewUrl: string;
  brandColor: string;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image load nahi ho payi.'));
    };
    img.src = url;
  });
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h * 60, s, l];
}

function hslToHex(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Finds the most vivid, frequent color in the image (ignores transparent / grey pixels). */
function extractBrandColor(img: HTMLImageElement): string {
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return DEFAULT_BRAND_COLOR;
  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  // Bucket by hue (24 buckets of 15deg), weight by saturation
  const buckets = new Map<number, { weight: number; h: number; s: number; l: number }>();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    if (s < 0.25 || l < 0.12 || l > 0.92) continue;
    const key = Math.floor(h / 15);
    const w = s * (1 - Math.abs(l - 0.5));
    const b = buckets.get(key) ?? { weight: 0, h: 0, s: 0, l: 0 };
    b.weight += w;
    b.h += h * w;
    b.s += s * w;
    b.l += l * w;
    buckets.set(key, b);
  }

  let best: { weight: number; h: number; s: number; l: number } | null = null;
  for (const b of buckets.values()) if (!best || b.weight > best.weight) best = b;
  if (!best || best.weight < 2) return DEFAULT_BRAND_COLOR;

  const h = best.h / best.weight;
  // Keep color vivid and readable on a dark background
  const s = Math.min(Math.max(best.s / best.weight, 0.55), 0.95);
  const l = Math.min(Math.max(best.l / best.weight, 0.5), 0.65);
  return hslToHex(h, s, l);
}

/** Resizes the logo to max 512px, compresses it to WebP and extracts its brand color. */
export async function processLogo(file: File): Promise<ProcessedLogo> {
  const img = await loadImage(file);
  const brandColor = extractBrandColor(img);

  const max = 512;
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas supported nahi hai.');
  ctx.drawImage(img, 0, 0, w, h);
  URL.revokeObjectURL(img.src);

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Image compress nahi ho payi.'))), 'image/webp', 0.9)
  );

  return { blob, previewUrl: URL.createObjectURL(blob), brandColor };
}

/** Hex -> rgba string helper for tinted backgrounds/borders. */
export function hexToRgba(hex: string | null | undefined, alpha: number): string {
  const clean = (hex || DEFAULT_BRAND_COLOR).replace('#', '');
  const n = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
