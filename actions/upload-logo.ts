// actions/upload-logo.ts
'use server';

import { getServiceSupabase } from '@/lib/supabase';

const BUCKET = 'startup-logos';
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif'];

export async function uploadLogoAction(formData: FormData) {
  try {
    const file = formData.get('logo');
    if (!(file instanceof File) || file.size === 0) {
      return { success: false as const, error: 'Logo file nahi mili.' };
    }
    if (!ALLOWED.includes(file.type)) {
      return { success: false as const, error: 'Sirf PNG, JPG, WEBP, SVG ya GIF allowed hai.' };
    }
    if (file.size > MAX_BYTES) {
      return { success: false as const, error: 'Logo 2MB se chhota hona chahiye.' };
    }

    const db = getServiceSupabase();

    // Bucket auto-create (public) if it does not exist yet
    const { data: bucket } = await db.storage.getBucket(BUCKET);
    if (!bucket) {
      const { error: createErr } = await db.storage.createBucket(BUCKET, {
        public: true,
        fileSizeLimit: MAX_BYTES,
        allowedMimeTypes: ALLOWED,
      });
      if (createErr && !/already exists/i.test(createErr.message)) {
        return { success: false as const, error: `Storage bucket error: ${createErr.message}` };
      }
    }

    const ext = file.type === 'image/svg+xml' ? 'svg' : file.type.split('/')[1];
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadErr } = await db.storage.from(BUCKET).upload(path, file, {
      contentType: file.type,
      cacheControl: '31536000',
      upsert: false,
    });
    if (uploadErr) {
      return { success: false as const, error: `Upload failed: ${uploadErr.message}` };
    }

    const { data } = db.storage.from(BUCKET).getPublicUrl(path);
    return { success: true as const, url: data.publicUrl };
  } catch (err: unknown) {
    console.error('Logo upload error:', err);
    return { success: false as const, error: 'Logo upload me issue aaya. Dobara try karein.' };
  }
}
