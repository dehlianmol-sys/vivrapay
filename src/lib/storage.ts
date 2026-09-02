import imageCompression from 'browser-image-compression';
import { supabase } from './supabase';

const BUCKET = 'uploads';
export const LOGO_BUCKET = 'logos';
const MAX_WIDTH = 800;
const MAX_SIZE_KB = 300;

/** Public URL for a logo file stored at the root of the `logos` bucket. */
export function getLogoUrl(fileName: string): string {
  return supabase.storage.from(LOGO_BUCKET).getPublicUrl(fileName).data.publicUrl;
}


export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  try {
    return await imageCompression(file, {
      maxWidthOrHeight: MAX_WIDTH,
      maxSizeMB: MAX_SIZE_KB / 1024,
      useWebWorker: true,
    });
  } catch {
    return file;
  }
}

export function getPublicUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) return path;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  const compressed = await compressImage(file);
  const ext = compressed.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(fileName, compressed, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return fileName;
}

export function fileToObjectUrl(file: File): string {
  return URL.createObjectURL(file);
}
