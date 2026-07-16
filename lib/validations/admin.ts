import { z } from 'zod'

// ─── Image uploads ───────────────────────────────────────────────────────────

/** Only real, browser-safe raster formats. No SVG: it can carry script. */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024 // ~8MB

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export type ImageCheck =
  | { ok: true; ext: string; type: string }
  | { ok: false; error: string }

/**
 * Server-side gate for an uploaded image. Runs in the server action BEFORE the
 * bytes reach Storage - the client's `accept=` attribute is a hint to humans,
 * not a control.
 *
 * Note this trusts File.type, which is client-reported. That is acceptable here
 * because the bucket is write-gated to a single admin by RLS; the check is
 * about catching mistakes (a 40MB RAW file, a stray PDF), not about defending
 * against the one person allowed to upload.
 */
export function checkImage(file: File): ImageCheck {
  if (!file || file.size === 0) return { ok: false, error: 'Choose a file to upload.' }

  if (file.size > MAX_IMAGE_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1)
    return { ok: false, error: `That image is ${mb}MB. The limit is 8MB.` }
  }

  const type = file.type.toLowerCase()
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(type)) {
    return { ok: false, error: 'Images must be JPEG, PNG or WebP.' }
  }

  return { ok: true, ext: EXT_BY_TYPE[type], type }
}

// ─── Video URLs ──────────────────────────────────────────────────────────────

export type VideoSource =
  | { kind: 'youtube'; id: string }
  | { kind: 'vimeo'; id: string }
  | { kind: 'file'; url: string }

/**
 * Parse a pasted video URL into something we are willing to render.
 *
 * Allowlist, not denylist: a URL from this function ends up in an iframe `src`
 * or a <video> `src`, so anything unrecognised is rejected rather than passed
 * through. The CSP frame-src in next.config.ts is the second line of defence.
 */
export function parseVideoUrl(raw: string): VideoSource | null {
  let u: URL
  try {
    u = new URL(raw.trim())
  } catch {
    return null
  }
  if (u.protocol !== 'https:') return null

  const host = u.hostname.replace(/^www\./, '')

  // youtube.com/watch?v=ID · youtu.be/ID · youtube.com/embed/ID · /shorts/ID
  if (host === 'youtube.com' || host === 'm.youtube.com') {
    const v = u.searchParams.get('v')
    if (v && isYouTubeId(v)) return { kind: 'youtube', id: v }
    const m = u.pathname.match(/^\/(?:embed|shorts|v)\/([\w-]{11})$/)
    if (m) return { kind: 'youtube', id: m[1] }
    return null
  }
  if (host === 'youtu.be') {
    const id = u.pathname.slice(1)
    return isYouTubeId(id) ? { kind: 'youtube', id } : null
  }

  // vimeo.com/ID · player.vimeo.com/video/ID
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const m = u.pathname.match(/\/(?:video\/)?(\d+)/)
    if (m) return { kind: 'vimeo', id: m[1] }
    return null
  }

  // A direct video file we host in Storage (or any https mp4/webm).
  if (/\.(mp4|webm)$/i.test(u.pathname)) return { kind: 'file', url: u.toString() }

  return null
}

function isYouTubeId(id: string): boolean {
  return /^[\w-]{11}$/.test(id)
}

/** Embeddable URL for an iframe. Only for youtube/vimeo sources. */
export function videoEmbedUrl(src: VideoSource): string | null {
  if (src.kind === 'youtube') return `https://www.youtube.com/embed/${src.id}`
  if (src.kind === 'vimeo') return `https://player.vimeo.com/video/${src.id}`
  return null
}

// ─── Form schemas ────────────────────────────────────────────────────────────

/** Day must match a real trip day, or be blank for the general gallery. */
export const tripMediaFieldsSchema = z.object({
  day: z
    .union([z.literal(''), z.coerce.number().int().min(1).max(99)])
    .transform((v) => (v === '' ? null : v)),
  caption: z.string().max(300).optional(),
  sort: z.coerce.number().int().min(-999).max(999).catch(0),
})

export const postSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens only.'),
  title: z.string().min(1, 'Title is required').max(200),
  body: z.string().max(50_000).optional(),
  published: z.boolean().catch(false),
})

export const destinationOverrideSchema = z.object({
  slug: z.string().min(1).max(80),
  summary: z.string().max(2_000).optional(),
  remote_work_note: z.string().max(2_000).optional(),
})
