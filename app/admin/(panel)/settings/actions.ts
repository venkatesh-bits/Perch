'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { unstable_rethrow } from 'next/navigation'
import { SITE_SETTINGS_TAG } from '@/lib/queries/site-settings'
import { requireAdmin } from '@/lib/supabase/admin-guard'
import { createClient } from '@/lib/supabase/server'
import {
  copySettingsSchema,
  identitySettingsSchema,
  isSettingsSection,
  RESETTABLE_COLUMNS,
  SECTION_COLUMNS,
  themeSettingsSchema,
  typographySettingsSchema,
  type SettingsSection,
} from '@/lib/validations/admin'

/**
 * The site settings writes.
 *
 * Three actions, one shape: build a patch of column -> string|null, hand it to
 * the single row, then tell the public site to rebuild. Null is the only way to
 * say "default" (see 005 and lib/data/site-defaults.ts), so saving a blank field
 * and pressing "Reset to default" end in exactly the same UPDATE.
 *
 * requireAdmin() at the top of each is defence in depth, not the enforcement -
 * RLS on site_settings is what actually refuses a non-admin, and it would refuse
 * one even if these checks were deleted.
 */

export interface SettingsState {
  error?: string
  message?: string
}

/** Column -> value. Null means "clear the override". */
type SettingsPatch = Record<string, string | null>

/**
 * Send the change to visitors.
 *
 * Two steps, because there are two caches in the way. The tag call drops the
 * unstable_cache entry behind getSiteSettings, and revalidatePath('/', 'layout')
 * rebuilds the prerendered HTML that has the old colours and copy baked into it.
 * Tag alone would leave the static pages stale until the 1h backstop; path alone
 * would rebuild them from the cached settings and change nothing.
 *
 * updateTag, not revalidateTag: Next 16 deprecated the single-argument
 * revalidateTag, and its replacement - revalidateTag(tag, 'max') - is
 * stale-while-revalidate. That is the wrong trade here. The owner saves a colour
 * and reloads to check it; being served the old one while the new one warms up
 * in the background reads as "the save did not work". updateTag expires the tag
 * outright so the next read waits for fresh data, which is exactly the
 * read-your-own-writes case it exists for. It is server-action-only, which all
 * three functions below are.
 */
function refresh() {
  updateTag(SITE_SETTINGS_TAG)
  revalidatePath('/', 'layout')
}

/** Turn a Postgres complaint into something the owner can act on. */
function writeErrorMessage(error: { code?: string; message: string }): string {
  const notMigrated =
    error.code === '42P01' || error.code === 'PGRST205' || /schema cache/i.test(error.message)
  if (notMigrated) {
    return 'There is no site_settings table yet. Run supabase/migrations/005_site_settings.sql in the Supabase SQL editor, then try again.'
  }
  // RLS said no. Almost always the admins row was never bootstrapped (004).
  if (error.code === '42501' || /row-level security/i.test(error.message)) {
    return 'The database refused the write. This account is signed in but is not in the admins table.'
  }
  return `Could not save: ${error.message}`
}

/**
 * Validate one section's fields.
 *
 * Each section gets its own schema rather than one big partial, so a save can
 * only ever produce that section's columns - which is what keeps two tabs open
 * on two sections from writing over each other.
 */
function parseSection(
  section: SettingsSection,
  raw: Record<string, string>,
): { ok: true; values: SettingsPatch } | { ok: false; error: string } {
  const parsed =
    section === 'identity'
      ? identitySettingsSchema.safeParse(raw)
      : section === 'typography'
        ? typographySettingsSchema.safeParse(raw)
        : section === 'theme'
          ? themeSettingsSchema.safeParse(raw)
          : copySettingsSchema.safeParse(raw)

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Check the fields and try again.' }
  }
  return { ok: true, values: parsed.data as SettingsPatch }
}

/**
 * Write a patch to the one row.
 *
 * upsert rather than update: 005 seeds the row, but an update against a missing
 * row matches nothing and reports success, which would show "Saved." over a
 * change that never happened. Only the patch's columns travel, so on conflict
 * Postgres updates those and leaves every other section alone.
 *
 * Returns null on success, or the state to hand back to the form.
 */
async function writePatch(patch: SettingsPatch): Promise<SettingsState | null> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('site_settings')
    .upsert({ id: true, ...patch, updated_at: new Date().toISOString() }, { onConflict: 'id' })

  if (error) {
    console.error('[site-settings] write failed:', error.message)
    return { error: writeErrorMessage(error) }
  }
  return null
}

/** Save one section. Blank fields are stored as NULL, i.e. back to the default. */
export async function saveSettings(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  try {
    await requireAdmin()

    const section = String(formData.get('section') ?? '')
    if (!isSettingsSection(section)) return { error: 'Unknown settings section.' }

    // Only this section's columns are read off the form. Anything else the
    // request happens to carry is not a column we know, so it cannot become one.
    const raw = Object.fromEntries(
      SECTION_COLUMNS[section].map((column) => [column, String(formData.get(column) ?? '')]),
    )

    const parsed = parseSection(section, raw)
    if (!parsed.ok) return { error: parsed.error }

    const failure = await writePatch(parsed.values)
    if (failure) return failure

    refresh()
    return { message: 'Saved. The public pages are rebuilding now.' }
  } catch (e) {
    unstable_rethrow(e)
    console.error('[saveSettings] unexpected error:', e)
    return { error: 'Something went wrong saving those settings.' }
  }
}

/** Clear one column, from the "Reset to default" link beside a field. */
export async function resetSetting(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  try {
    await requireAdmin()

    // This lands in an UPDATE's column list, so it is checked against the
    // allowlist rather than trusted - the button's value is client-supplied
    // like anything else on the form.
    const column = String(formData.get('column') ?? '')
    if (!RESETTABLE_COLUMNS.includes(column)) return { error: 'Unknown setting.' }

    const failure = await writePatch({ [column]: null })
    if (failure) return failure

    refresh()
    return { message: 'Back to the default.' }
  } catch (e) {
    unstable_rethrow(e)
    console.error('[resetSetting] unexpected error:', e)
    return { error: 'Something went wrong resetting that field.' }
  }
}

/** Clear every column in one section. */
export async function resetSection(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  try {
    await requireAdmin()

    const section = String(formData.get('section') ?? '')
    if (!isSettingsSection(section)) return { error: 'Unknown settings section.' }

    const patch: SettingsPatch = Object.fromEntries(
      SECTION_COLUMNS[section].map((column) => [column, null]),
    )

    const failure = await writePatch(patch)
    if (failure) return failure

    refresh()
    return { message: 'Section reset to the built-in defaults.' }
  } catch (e) {
    unstable_rethrow(e)
    console.error('[resetSection] unexpected error:', e)
    return { error: 'Something went wrong resetting that section.' }
  }
}
