'use client'

import { createContext, useActionState, useContext, useId, useState } from 'react'
import {
  resetSection,
  resetSetting,
  saveSettings,
  type SettingsState,
} from '@/app/admin/(panel)/settings/actions'
import { fieldClass, labelClass, Notice, SubmitButton } from '@/components/admin/ui'
import { BODY_FONTS, DISPLAY_FONTS, fontOption, type FontOption } from '@/lib/data/fonts'
import { isHexColor, SITE_DEFAULTS, THEME_COLORS } from '@/lib/data/site-defaults'
import type { SiteSettings } from '@/lib/types/database'
import type { SettingsSection } from '@/lib/validations/admin'

/**
 * The settings editor.
 *
 * One idea runs through the whole panel: BLANK MEANS DEFAULT. Every input ships
 * the default as its placeholder, an empty box saves NULL, and "Reset to
 * default" is just a button that blanks the column. There is no third state and
 * no copy of the default in the database, so the site can always fall back to
 * lib/data/site-defaults.ts.
 */

// The per-field reset dispatch, handed down so each field can render its own
// reset button inside the section's single form (nested <form> is not legal).
const ResetContext = createContext<((formData: FormData) => void) | null>(null)

function ResetFieldButton({ column, show }: { column: string; show: boolean }) {
  const reset = useContext(ResetContext)
  if (!show || !reset) return null
  return (
    <button
      type="submit"
      formAction={reset}
      name="column"
      value={column}
      className="text-[11px] font-semibold text-[var(--clay)] underline-offset-2 transition-opacity hover:underline hover:opacity-80"
    >
      Reset to default
    </button>
  )
}

function SetTag() {
  return (
    <span className="rounded-full bg-[var(--brand-gold)]/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--clay)]">
      Custom
    </span>
  )
}

/** A section is one form: its own save, its own reset, its own columns. */
function Section({
  section,
  title,
  blurb,
  children,
}: {
  section: SettingsSection
  title: string
  blurb: string
  children: React.ReactNode
}) {
  const [saveState, saveAction] = useActionState<SettingsState, FormData>(saveSettings, {})
  const [fieldState, fieldAction] = useActionState<SettingsState, FormData>(resetSetting, {})
  const [sectionState, sectionAction] = useActionState<SettingsState, FormData>(resetSection, {})

  return (
    <form action={saveAction} className="card space-y-5 p-5">
      <input type="hidden" name="section" value={section} />

      <div>
        <h3 className="font-display text-xl tracking-tight text-[var(--ink)]">{title}</h3>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--ink-soft)]">{blurb}</p>
      </div>

      <ResetContext.Provider value={fieldAction}>{children}</ResetContext.Provider>

      <Notice state={saveState} />
      <Notice state={fieldState} />
      <Notice state={sectionState} />

      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--line)] pt-4">
        <SubmitButton pendingLabel="Saving...">Save {title.toLowerCase()}</SubmitButton>
        <button
          type="submit"
          formAction={sectionAction}
          className="rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[var(--ink-soft)] transition-colors hover:border-[var(--clay)]/50 hover:text-[var(--clay)]"
        >
          Reset this section
        </button>
      </div>
    </form>
  )
}

// ─── Fields ──────────────────────────────────────────────────────────────────

function TextField({
  column,
  label,
  value,
  fallback,
  hint,
  rows,
}: {
  column: string
  label: string
  value: string | null
  fallback: string
  hint?: string
  rows?: number
}) {
  const id = useId()
  const isSet = Boolean(value?.trim())

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <label htmlFor={id} className={labelClass}>
          {label}
        </label>
        {isSet ? <SetTag /> : null}
        <span className="ml-auto">
          <ResetFieldButton column={column} show={isSet} />
        </span>
      </div>

      {rows ? (
        <textarea
          id={id}
          name={column}
          rows={rows}
          defaultValue={value ?? ''}
          placeholder={fallback}
          className={fieldClass}
        />
      ) : (
        <input
          id={id}
          type="text"
          name={column}
          defaultValue={value ?? ''}
          placeholder={fallback}
          className={fieldClass}
        />
      )}

      <p className="text-[11px] leading-relaxed text-[var(--ink-soft)]">
        {hint ? `${hint} ` : ''}
        {isSet ? 'Clear the box and save to go back to the default.' : 'Blank, so the default shown above is live.'}
      </p>
    </div>
  )
}

function ColorField({
  def,
  value,
}: {
  def: (typeof THEME_COLORS)[number]
  value: string | null
}) {
  const id = useId()
  const [current, setCurrent] = useState(value ?? '')
  const isSet = Boolean(current.trim())
  // type=color will not accept a blank, so the picker shows the default while
  // the field is unset. The text input beside it is the one that gets saved.
  const swatch = isHexColor(current) ? current : def.fallback

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <label htmlFor={id} className={labelClass}>
          {def.label}
        </label>
        {isSet ? <SetTag /> : null}
        <span className="ml-auto">
          <ResetFieldButton column={def.column} show={Boolean(value?.trim())} />
        </span>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${def.label} colour picker`}
          value={swatch}
          onChange={(e) => setCurrent(e.target.value.toUpperCase())}
          className="h-9 w-11 shrink-0 cursor-pointer rounded-lg border border-[var(--line)] bg-[var(--surface)] p-1"
        />
        <input
          id={id}
          type="text"
          name={def.column}
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          placeholder={def.fallback}
          spellCheck={false}
          className={`${fieldClass} font-mono text-xs uppercase`}
        />
        <span
          aria-hidden="true"
          title={`Default ${def.fallback}`}
          className="h-9 w-9 shrink-0 rounded-lg border border-[var(--line)]"
          style={{ background: def.fallback }}
        />
      </div>

      <p className="text-[11px] leading-relaxed text-[var(--ink-soft)]">
        {def.note} Default <code className="font-mono">{def.fallback}</code>.
      </p>
    </div>
  )
}

function FontPicker({
  column,
  label,
  options,
  value,
  defaultKey,
  sample,
}: {
  column: string
  label: string
  options: readonly FontOption[]
  value: string | null
  defaultKey: string
  sample: string
}) {
  const [current, setCurrent] = useState(value ?? '')
  const defaultLabel = options.find((o) => o.key === defaultKey)?.label ?? defaultKey

  const choices: { key: string; label: string; note: string; cssVar: string | null }[] = [
    {
      key: '',
      label: `Default (${defaultLabel})`,
      note: 'Leave it alone and the site uses the face it shipped with.',
      cssVar: options.find((o) => o.key === defaultKey)?.cssVar ?? null,
    },
    ...options.map((o) => ({ key: o.key, label: o.label, note: o.note, cssVar: o.cssVar })),
  ]

  return (
    <fieldset className="space-y-2">
      <legend className={`${labelClass} mb-2`}>{label}</legend>

      <div className="grid gap-2 sm:grid-cols-2">
        {choices.map((c) => {
          const checked = current === c.key
          return (
            <label
              key={c.key || 'default'}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                checked
                  ? 'border-[var(--brand)] bg-[var(--brand)]/5'
                  : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--brand-mint)]'
              }`}
            >
              <input
                type="radio"
                name={column}
                value={c.key}
                checked={checked}
                onChange={() => setCurrent(c.key)}
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--brand)]"
              />
              <span className="min-w-0 flex-1">
                {/* Each option previews in its own face - the whole point of a
                    curated set is that you can see it before you pick it. */}
                <span
                  className="block truncate text-xl leading-tight text-[var(--ink)]"
                  style={c.cssVar ? { fontFamily: `var(${c.cssVar})` } : undefined}
                >
                  {sample}
                </span>
                <span className="mt-1 block text-xs font-semibold text-[var(--ink)]">{c.label}</span>
                <span className="mt-0.5 block text-[11px] leading-relaxed text-[var(--ink-soft)]">
                  {c.note}
                </span>
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

// ─── The panel ───────────────────────────────────────────────────────────────

export function SettingsManager({
  settings,
  heroBadgeFallback,
}: {
  settings: SiteSettings
  /** Built from the live catalogue count on the server. */
  heroBadgeFallback: string
}) {
  const displayNow = fontOption('display', settings.font_display)
  const bodyNow = fontOption('body', settings.font_body)

  return (
    <div className="space-y-6">
      <Section
        section="identity"
        title="Identity"
        blurb="The name and description search engines and link previews use. Blank falls back to lib/site.ts, which stays the source of truth."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            column="site_title"
            label="Site title"
            value={settings.site_title}
            fallback={SITE_DEFAULTS.siteTitle}
            hint="Used in the browser tab and as the suffix on every page title."
          />
          <TextField
            column="tagline"
            label="Tagline"
            value={settings.tagline}
            fallback={SITE_DEFAULTS.tagline}
            hint="Sits after the title on the home page tab and OG card."
          />
        </div>
        <TextField
          column="meta_description"
          label="Meta description"
          rows={3}
          value={settings.meta_description}
          fallback={SITE_DEFAULTS.metaDescription}
          hint="Around 150 to 160 characters is what Google actually shows."
        />
      </Section>

      <Section
        section="typography"
        title="Typography"
        blurb="Ten families are self-hosted at build time; picking one just rebinds a CSS variable. That is why the list is fixed - a font has to be compiled in before it can be chosen."
      >
        <FontPicker
          column="font_display"
          label={`Display face${displayNow ? ` - currently ${displayNow.label}` : ''}`}
          options={DISPLAY_FONTS}
          value={settings.font_display}
          defaultKey={SITE_DEFAULTS.fontDisplay}
          sample="Work from anywhere"
        />
        <FontPicker
          column="font_body"
          label={`Body face${bodyNow ? ` - currently ${bodyNow.label}` : ''}`}
          options={BODY_FONTS}
          value={settings.font_body}
          defaultKey={SITE_DEFAULTS.fontBody}
          sample="Will the WiFi hold for a call?"
        />
      </Section>

      <Section
        section="theme"
        title="Theme"
        blurb="Ten tokens, each a 6-digit hex. Anything else is refused rather than guessed at. The swatch on the right of each row is the default, for comparison."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {THEME_COLORS.map((def) => (
            <ColorField key={def.column} def={def} value={settings[def.column]} />
          ))}
        </div>
      </Section>

      <Section
        section="copy"
        title="Copy"
        blurb="The words on the home page and in the footer. Every box shows the live default as its placeholder - leave one blank and that default is what ships."
      >
        <TextField
          column="hero_badge"
          label="Hero badge"
          value={settings.hero_badge}
          fallback={heroBadgeFallback}
          hint="The pill above the headline. The default counts the catalogue; a custom one is fixed text."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            column="hero_title"
            label="Hero title"
            value={settings.hero_title}
            fallback={SITE_DEFAULTS.heroTitle}
          />
          <TextField
            column="hero_title_accent"
            label="Hero title accent"
            value={settings.hero_title_accent}
            fallback={SITE_DEFAULTS.heroTitleAccent}
            hint="The italic gradient line under the title."
          />
        </div>
        <TextField
          column="hero_subhead"
          label="Hero subhead"
          rows={3}
          value={settings.hero_subhead}
          fallback={SITE_DEFAULTS.heroSubhead}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            column="featured_eyebrow"
            label="Featured eyebrow"
            value={settings.featured_eyebrow}
            fallback={SITE_DEFAULTS.featuredEyebrow}
          />
          <TextField
            column="featured_heading"
            label="Featured heading"
            value={settings.featured_heading}
            fallback={SITE_DEFAULTS.featuredHeading}
          />
        </div>

        <TextField
          column="ev_heading"
          label="EV panel heading"
          value={settings.ev_heading}
          fallback={SITE_DEFAULTS.evHeading}
          hint="Left blank, this renders in two parts with the second half italic mint. Set it and it becomes one plain run of text."
        />
        <TextField
          column="ev_body"
          label="EV panel body"
          rows={4}
          value={settings.ev_body}
          fallback={SITE_DEFAULTS.evBody}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            column="cta_heading"
            label="CTA heading"
            value={settings.cta_heading}
            fallback={SITE_DEFAULTS.ctaHeading}
          />
          <TextField
            column="cta_body"
            label="CTA body"
            rows={3}
            value={settings.cta_body}
            fallback={SITE_DEFAULTS.ctaBody}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            column="footer_blurb"
            label="Footer blurb"
            rows={4}
            value={settings.footer_blurb}
            fallback={SITE_DEFAULTS.footerBlurb}
          />
          <TextField
            column="about_blurb"
            label="About blurb"
            rows={4}
            value={settings.about_blurb}
            fallback={SITE_DEFAULTS.aboutBlurb}
          />
        </div>
      </Section>
    </div>
  )
}
