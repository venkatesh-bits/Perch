import type { SupabaseClient } from '@supabase/supabase-js'
import { checkImage } from '@/lib/validations/admin'

export const MEDIA_BUCKET = 'media'

const PUBLIC_PREFIX = `/storage/v1/object/public/${MEDIA_BUCKET}/`

export type UploadResult = { ok: true; url: string } | { ok: false; error: string }

/**
 * Upload an image to the `media` bucket and return its public URL.
 *
 * `supabase` MUST be the caller's authenticated client: the bucket's INSERT
 * policy calls is_admin(), so the upload is authorized by Postgres against the
 * real session rather than by anything this process asserts.
 */
export async function uploadImage(
  supabase: SupabaseClient,
  file: File,
  folder: string,
): Promise<UploadResult> {
  const check = checkImage(file)
  if (!check.ok) return { ok: false, error: check.error }

  const path = `${folder}/${crypto.randomUUID()}.${check.ext}`

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { contentType: check.type, upsert: false })

  if (error) {
    console.error('[storage] upload failed:', error.message)
    return { ok: false, error: `Upload failed: ${error.message}` }
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)
  return { ok: true, url: data.publicUrl }
}

/**
 * The object path inside the bucket for one of our public URLs, or null if the
 * URL is not ours (e.g. a pasted YouTube link - nothing to delete).
 */
export function storagePathFromUrl(url: string): string | null {
  try {
    const { pathname } = new URL(url)
    const i = pathname.indexOf(PUBLIC_PREFIX)
    if (i === -1) return null
    return decodeURIComponent(pathname.slice(i + PUBLIC_PREFIX.length))
  } catch {
    return null
  }
}

/**
 * Remove the Storage object behind a URL, if it is one of ours. Best-effort:
 * a failure here is logged, never thrown, so deleting the DB row still wins.
 * An orphaned object is a smaller problem than a row that will not delete.
 */
export async function deleteStorageObject(
  supabase: SupabaseClient,
  url: string | null,
): Promise<void> {
  if (!url) return
  const path = storagePathFromUrl(url)
  if (!path) return

  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path])
  if (error) console.error('[storage] delete failed:', path, error.message)
}
