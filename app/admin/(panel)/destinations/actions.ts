'use server'

import { revalidatePath } from 'next/cache'
import { unstable_rethrow } from 'next/navigation'
import { requireAdmin } from '@/lib/supabase/admin-guard'
import { createClient } from '@/lib/supabase/server'
import { deleteStorageObject, uploadImage } from '@/lib/supabase/storage'
import { destinationOverrideSchema } from '@/lib/validations/admin'
import { getDestination } from '@/lib/data/destinations'

export interface OverrideState {
  error?: string
  message?: string
}

function refresh(slug: string) {
  // These pages are statically generated with ISR, so push the change now
  // rather than waiting out the revalidate window.
  revalidatePath(`/destinations/${slug}`)
  revalidatePath('/destinations')
  revalidatePath('/admin/destinations')
}

/**
 * Save an override for one destination.
 *
 * Only fields the owner actually filled in are stored; a blank field is written
 * as NULL, which the merge treats as "fall back to the static catalogue".
 */
export async function saveOverride(
  _prev: OverrideState,
  formData: FormData,
): Promise<OverrideState> {
  try {
    await requireAdmin()

    const parsed = destinationOverrideSchema.safeParse({
      slug: String(formData.get('slug') ?? '').trim(),
      summary: String(formData.get('summary') ?? ''),
      remote_work_note: String(formData.get('remote_work_note') ?? ''),
    })
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Check the fields and try again.' }
    }

    // The slug must be one of ours - never let an arbitrary string create a row.
    if (!getDestination(parsed.data.slug)) {
      return { error: 'Unknown destination.' }
    }

    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('destination_overrides')
      .select('image_url')
      .eq('slug', parsed.data.slug)
      .maybeSingle()
    const oldImage = (existing as { image_url: string | null } | null)?.image_url ?? null

    let imageUrl: string | undefined
    const file = formData.get('image')
    if (file instanceof File && file.size > 0) {
      const uploaded = await uploadImage(supabase, file, 'destinations')
      if (!uploaded.ok) return { error: uploaded.error }
      imageUrl = uploaded.url
    }

    const { error } = await supabase.from('destination_overrides').upsert(
      {
        slug: parsed.data.slug,
        summary: parsed.data.summary?.trim() || null,
        remote_work_note: parsed.data.remote_work_note?.trim() || null,
        updated_at: new Date().toISOString(),
        // Leave the stored image alone unless a new one was uploaded.
        ...(imageUrl ? { image_url: imageUrl } : {}),
      },
      { onConflict: 'slug' },
    )

    if (error) {
      if (imageUrl) await deleteStorageObject(supabase, imageUrl)
      console.error('[overrides] upsert failed:', error.message)
      return { error: `Could not save: ${error.message}` }
    }

    if (imageUrl && oldImage && oldImage !== imageUrl) {
      await deleteStorageObject(supabase, oldImage)
    }

    refresh(parsed.data.slug)
    return { message: 'Override saved.' }
  } catch (e) {
    unstable_rethrow(e)
    console.error('[saveOverride] unexpected error:', e)
    return { error: 'Something went wrong saving that override.' }
  }
}

/**
 * Drop the override row entirely, so the destination falls all the way back to
 * the static catalogue. Also bins the replacement image.
 */
export async function resetOverride(
  _prev: OverrideState,
  formData: FormData,
): Promise<OverrideState> {
  try {
    await requireAdmin()

    const slug = String(formData.get('slug') ?? '').trim()
    if (!slug) return { error: 'Missing destination slug.' }

    const supabase = await createClient()

    const { data: row } = await supabase
      .from('destination_overrides')
      .select('image_url')
      .eq('slug', slug)
      .maybeSingle()

    const { error } = await supabase.from('destination_overrides').delete().eq('slug', slug)
    if (error) {
      console.error('[overrides] delete failed:', error.message)
      return { error: `Could not reset: ${error.message}` }
    }

    await deleteStorageObject(supabase, (row as { image_url: string | null } | null)?.image_url ?? null)

    refresh(slug)
    return { message: 'Reset to the catalogue default.' }
  } catch (e) {
    unstable_rethrow(e)
    console.error('[resetOverride] unexpected error:', e)
    return { error: 'Something went wrong resetting that override.' }
  }
}
