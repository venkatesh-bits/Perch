'use server'

import { revalidatePath } from 'next/cache'
import { unstable_rethrow } from 'next/navigation'
import { requireAdmin } from '@/lib/supabase/admin-guard'
import { createClient } from '@/lib/supabase/server'
import { deleteStorageObject, uploadImage } from '@/lib/supabase/storage'
import { parseVideoUrl, tripMediaFieldsSchema } from '@/lib/validations/admin'

export interface MediaState {
  error?: string
  message?: string
}

const TRIP_SLUG = 'kashmir'

/** Every mutation refreshes the public log, which is ISR-cached. */
function refresh() {
  revalidatePath('/kashmir')
  revalidatePath('/admin/trip-media')
}

function readFields(formData: FormData) {
  return tripMediaFieldsSchema.safeParse({
    day: formData.get('day') ?? '',
    caption: String(formData.get('caption') ?? ''),
    sort: formData.get('sort') ?? 0,
  })
}

/** Upload a photo to Storage and record it. */
export async function uploadTripPhoto(
  _prev: MediaState,
  formData: FormData,
): Promise<MediaState> {
  try {
    await requireAdmin()

    const fields = readFields(formData)
    if (!fields.success) return { error: 'Check the day, caption and sort values.' }

    const file = formData.get('file')
    if (!(file instanceof File)) return { error: 'Choose a photo to upload.' }

    const supabase = await createClient()

    // Validated server-side before a single byte goes to Storage.
    const uploaded = await uploadImage(supabase, file, TRIP_SLUG)
    if (!uploaded.ok) return { error: uploaded.error }

    const { error } = await supabase.from('trip_media').insert({
      trip_slug: TRIP_SLUG,
      day: fields.data.day,
      kind: 'photo',
      url: uploaded.url,
      caption: fields.data.caption?.trim() || null,
      sort: fields.data.sort,
    })

    if (error) {
      // The row failed, so do not leave the object behind.
      await deleteStorageObject(supabase, uploaded.url)
      console.error('[trip-media] insert failed:', error.message)
      return { error: `Could not save that photo: ${error.message}` }
    }

    refresh()
    return { message: 'Photo added.' }
  } catch (e) {
    unstable_rethrow(e)
    console.error('[uploadTripPhoto] unexpected error:', e)
    return { error: 'Something went wrong uploading that photo.' }
  }
}

/** Record a pasted YouTube/Vimeo link, or a direct mp4/webm URL. */
export async function addTripVideo(
  _prev: MediaState,
  formData: FormData,
): Promise<MediaState> {
  try {
    await requireAdmin()

    const fields = readFields(formData)
    if (!fields.success) return { error: 'Check the day, caption and sort values.' }

    const raw = String(formData.get('url') ?? '')
    const parsed = parseVideoUrl(raw)
    if (!parsed) {
      return { error: 'Paste a YouTube or Vimeo link, or a direct https .mp4/.webm URL.' }
    }

    const supabase = await createClient()
    const { error } = await supabase.from('trip_media').insert({
      trip_slug: TRIP_SLUG,
      day: fields.data.day,
      kind: 'video',
      url: raw.trim(),
      caption: fields.data.caption?.trim() || null,
      sort: fields.data.sort,
    })

    if (error) {
      console.error('[trip-media] video insert failed:', error.message)
      return { error: `Could not save that video: ${error.message}` }
    }

    refresh()
    return { message: 'Video added.' }
  } catch (e) {
    unstable_rethrow(e)
    console.error('[addTripVideo] unexpected error:', e)
    return { error: 'Something went wrong adding that video.' }
  }
}

/** Edit caption / day / sort on an existing item. */
export async function updateTripMedia(
  _prev: MediaState,
  formData: FormData,
): Promise<MediaState> {
  try {
    await requireAdmin()

    const id = String(formData.get('id') ?? '')
    if (!id) return { error: 'Missing item id.' }

    const fields = readFields(formData)
    if (!fields.success) return { error: 'Check the day, caption and sort values.' }

    const supabase = await createClient()
    const { error } = await supabase
      .from('trip_media')
      .update({
        day: fields.data.day,
        caption: fields.data.caption?.trim() || null,
        sort: fields.data.sort,
      })
      .eq('id', id)

    if (error) {
      console.error('[trip-media] update failed:', error.message)
      return { error: `Could not save: ${error.message}` }
    }

    refresh()
    return { message: 'Saved.' }
  } catch (e) {
    unstable_rethrow(e)
    console.error('[updateTripMedia] unexpected error:', e)
    return { error: 'Something went wrong saving that item.' }
  }
}

/** Delete a media row, and its Storage object when we host it. */
export async function deleteTripMedia(
  _prev: MediaState,
  formData: FormData,
): Promise<MediaState> {
  try {
    await requireAdmin()

    const id = String(formData.get('id') ?? '')
    if (!id) return { error: 'Missing item id.' }

    const supabase = await createClient()

    // Read the row first - once it is gone we cannot find the object path.
    const { data: row, error: readErr } = await supabase
      .from('trip_media')
      .select('url')
      .eq('id', id)
      .maybeSingle()

    if (readErr) {
      console.error('[trip-media] pre-delete read failed:', readErr.message)
      return { error: `Could not delete: ${readErr.message}` }
    }

    const { error } = await supabase.from('trip_media').delete().eq('id', id)
    if (error) {
      console.error('[trip-media] delete failed:', error.message)
      return { error: `Could not delete: ${error.message}` }
    }

    // No-op for a YouTube/Vimeo link; removes the file when it is ours.
    await deleteStorageObject(supabase, (row as { url: string } | null)?.url ?? null)

    refresh()
    return { message: 'Deleted.' }
  } catch (e) {
    unstable_rethrow(e)
    console.error('[deleteTripMedia] unexpected error:', e)
    return { error: 'Something went wrong deleting that item.' }
  }
}
