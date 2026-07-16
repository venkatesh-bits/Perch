'use server'

import { revalidatePath } from 'next/cache'
import { unstable_rethrow } from 'next/navigation'
import { requireAdmin } from '@/lib/supabase/admin-guard'
import { createClient } from '@/lib/supabase/server'
import { deleteStorageObject, uploadImage } from '@/lib/supabase/storage'
import { postSchema } from '@/lib/validations/admin'

export interface PostState {
  error?: string
  message?: string
}

function refresh() {
  revalidatePath('/admin/posts')
}

function readPost(formData: FormData) {
  return postSchema.safeParse({
    slug: String(formData.get('slug') ?? '').trim(),
    title: String(formData.get('title') ?? '').trim(),
    body: String(formData.get('body') ?? ''),
    published: formData.get('published') === 'on',
  })
}

/** Optional cover upload. Returns undefined when no new file was chosen. */
async function maybeCover(
  supabase: Awaited<ReturnType<typeof createClient>>,
  formData: FormData,
): Promise<{ url?: string; error?: string }> {
  const file = formData.get('cover')
  if (!(file instanceof File) || file.size === 0) return {}

  const uploaded = await uploadImage(supabase, file, 'posts')
  if (!uploaded.ok) return { error: uploaded.error }
  return { url: uploaded.url }
}

export async function createPost(_prev: PostState, formData: FormData): Promise<PostState> {
  try {
    await requireAdmin()

    const parsed = readPost(formData)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Check the fields and try again.' }
    }

    const supabase = await createClient()

    const cover = await maybeCover(supabase, formData)
    if (cover.error) return { error: cover.error }

    const { error } = await supabase.from('posts').insert({
      slug: parsed.data.slug,
      title: parsed.data.title,
      body: parsed.data.body?.trim() || null,
      cover_url: cover.url ?? null,
      published: parsed.data.published,
    })

    if (error) {
      if (cover.url) await deleteStorageObject(supabase, cover.url)
      console.error('[posts] insert failed:', error.message)
      const msg = error.code === '23505' ? 'A post with that slug already exists.' : error.message
      return { error: `Could not create the post: ${msg}` }
    }

    refresh()
    return { message: 'Post created.' }
  } catch (e) {
    unstable_rethrow(e)
    console.error('[createPost] unexpected error:', e)
    return { error: 'Something went wrong creating that post.' }
  }
}

export async function updatePost(_prev: PostState, formData: FormData): Promise<PostState> {
  try {
    await requireAdmin()

    const id = String(formData.get('id') ?? '')
    if (!id) return { error: 'Missing post id.' }

    const parsed = readPost(formData)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Check the fields and try again.' }
    }

    const supabase = await createClient()

    // Keep the old cover URL so we can bin the file if it gets replaced.
    const { data: existing } = await supabase
      .from('posts')
      .select('cover_url')
      .eq('id', id)
      .maybeSingle()
    const oldCover = (existing as { cover_url: string | null } | null)?.cover_url ?? null

    const cover = await maybeCover(supabase, formData)
    if (cover.error) return { error: cover.error }

    const { error } = await supabase
      .from('posts')
      .update({
        slug: parsed.data.slug,
        title: parsed.data.title,
        body: parsed.data.body?.trim() || null,
        published: parsed.data.published,
        updated_at: new Date().toISOString(),
        ...(cover.url ? { cover_url: cover.url } : {}),
      })
      .eq('id', id)

    if (error) {
      if (cover.url) await deleteStorageObject(supabase, cover.url)
      console.error('[posts] update failed:', error.message)
      const msg = error.code === '23505' ? 'A post with that slug already exists.' : error.message
      return { error: `Could not save: ${msg}` }
    }

    // Only bin the old file once the row is safely pointing at the new one.
    if (cover.url && oldCover && oldCover !== cover.url) {
      await deleteStorageObject(supabase, oldCover)
    }

    refresh()
    revalidatePath(`/posts/${parsed.data.slug}`)
    return { message: 'Saved.' }
  } catch (e) {
    unstable_rethrow(e)
    console.error('[updatePost] unexpected error:', e)
    return { error: 'Something went wrong saving that post.' }
  }
}

export async function deletePost(_prev: PostState, formData: FormData): Promise<PostState> {
  try {
    await requireAdmin()

    const id = String(formData.get('id') ?? '')
    if (!id) return { error: 'Missing post id.' }

    const supabase = await createClient()

    const { data: row } = await supabase
      .from('posts')
      .select('cover_url')
      .eq('id', id)
      .maybeSingle()

    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) {
      console.error('[posts] delete failed:', error.message)
      return { error: `Could not delete: ${error.message}` }
    }

    await deleteStorageObject(supabase, (row as { cover_url: string | null } | null)?.cover_url ?? null)

    refresh()
    return { message: 'Deleted.' }
  } catch (e) {
    unstable_rethrow(e)
    console.error('[deletePost] unexpected error:', e)
    return { error: 'Something went wrong deleting that post.' }
  }
}
