'use client'

import { useActionState, useMemo, useState } from 'react'
import Image from 'next/image'
import {
  resetOverride,
  saveOverride,
  type OverrideState,
} from '@/app/admin/(panel)/destinations/actions'
import { DeleteButton, fieldClass, labelClass, Notice, SubmitButton } from '@/components/admin/ui'
import { DESTINATIONS, type HillStation } from '@/lib/data/destinations'
import { destinationImage } from '@/lib/data/destination-images'
import type { OverrideMap } from '@/lib/queries/destination-overrides'
import type { DestinationOverride } from '@/lib/types/database'

/**
 * The 97 destinations come from the static catalogue import (same as the public
 * browser does) - only the small override map travels over the wire.
 */

function OverriddenTag() {
  return (
    <span className="rounded-full bg-[var(--brand-gold)]/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--clay)]">
      Overridden
    </span>
  )
}

function FieldEditor({
  name,
  label,
  staticValue,
  overrideValue,
  rows = 3,
}: {
  name: string
  label: string
  staticValue: string
  overrideValue: string | null
  rows?: number
}) {
  const isOverridden = Boolean(overrideValue?.trim())

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <label className={labelClass}>{label}</label>
        {isOverridden ? <OverriddenTag /> : null}
      </div>

      <textarea
        name={name}
        rows={rows}
        defaultValue={overrideValue ?? ''}
        className={fieldClass}
        placeholder="Leave blank to use the catalogue default"
      />

      <details className="text-[11px] text-[var(--ink-soft)]">
        <summary className="cursor-pointer select-none">
          {isOverridden ? 'Show the catalogue default' : 'Currently showing the catalogue default'}
        </summary>
        <p className="mt-1.5 rounded-lg border border-[var(--line)] bg-[var(--paper-deep)] p-2.5 leading-relaxed">
          {staticValue}
        </p>
      </details>
    </div>
  )
}

function DestinationRow({
  dest,
  override,
}: {
  dest: HillStation
  override: DestinationOverride | undefined
}) {
  const [saveState, saveAction] = useActionState<OverrideState, FormData>(saveOverride, {})
  const [resetState, resetAction] = useActionState<OverrideState, FormData>(resetOverride, {})
  const [open, setOpen] = useState(false)

  const staticImg = destinationImage(dest.slug)
  const shownImage = override?.image_url?.trim() || staticImg?.thumbUrl || null
  const imageOverridden = Boolean(override?.image_url?.trim())
  const anyOverride = Boolean(
    override?.summary?.trim() || override?.remote_work_note?.trim() || imageOverridden,
  )

  return (
    <li className="card p-4">
      <div className="flex flex-wrap items-center gap-3">
        {shownImage ? (
          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--paper-deep)]">
            <Image src={shownImage} alt="" fill sizes="64px" className="object-cover" />
          </div>
        ) : (
          <div className="h-12 w-16 shrink-0 rounded-lg bg-[var(--paper-deep)]" />
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-[var(--ink)]">{dest.name}</p>
          <p className="truncate text-xs text-[var(--ink-soft)]">
            {dest.region} · {dest.state} · /{dest.slug}
          </p>
        </div>

        {anyOverride ? <OverriddenTag /> : null}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-xl border border-[var(--line)] px-3 py-1.5 text-xs font-semibold text-[var(--ink-soft)] transition-colors hover:border-[var(--brand-mint)] hover:text-[var(--ink)]"
        >
          {open ? 'Close' : 'Edit'}
        </button>
      </div>

      {open ? (
        <div className="mt-4 space-y-3 border-t border-[var(--line)] pt-4">
          <form action={saveAction} className="space-y-4">
            <input type="hidden" name="slug" value={dest.slug} />

            <FieldEditor
              name="summary"
              label="Summary"
              rows={3}
              staticValue={dest.summary}
              overrideValue={override?.summary ?? null}
            />

            <FieldEditor
              name="remote_work_note"
              label="Remote work note"
              rows={3}
              staticValue={dest.remoteWorkNote}
              overrideValue={override?.remote_work_note ?? null}
            />

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <label htmlFor={`image-${dest.slug}`} className={labelClass}>
                  Replacement photo
                </label>
                {imageOverridden ? <OverriddenTag /> : null}
              </div>
              <input
                id={`image-${dest.slug}`}
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className={`${fieldClass} file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--paper-deep)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--ink)]`}
              />
              <p className="text-[11px] text-[var(--ink-soft)]">
                {imageOverridden
                  ? 'A replacement is in use. Upload another to change it, or reset below to go back to the Wikimedia photo.'
                  : 'Using the self-hosted Wikimedia photo. Upload one to replace it.'}
              </p>
            </div>

            <Notice state={saveState} />
            <SubmitButton variant="ghost" pendingLabel="Saving...">
              Save override
            </SubmitButton>
          </form>

          {anyOverride ? (
            <form action={resetAction} className="border-t border-[var(--line)] pt-3">
              <input type="hidden" name="slug" value={dest.slug} />
              <Notice state={resetState} />
              <DeleteButton
                confirm={`Reset ${dest.name} to the catalogue default? Any override text and replacement photo are removed.`}
              >
                Reset to default
              </DeleteButton>
            </form>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}

export function DestinationsManager({ overrides }: { overrides: OverrideMap }) {
  const [query, setQuery] = useState('')
  const [onlyOverridden, setOnlyOverridden] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return DESTINATIONS.filter((d) => {
      if (onlyOverridden && !overrides[d.slug]) return false
      if (!q) return true
      return (
        d.name.toLowerCase().includes(q) ||
        d.slug.toLowerCase().includes(q) ||
        d.state.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q)
      )
    })
  }, [query, onlyOverridden, overrides])

  const overrideCount = Object.keys(overrides).length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search 97 destinations by name, state or region"
          className={`${fieldClass} max-w-sm`}
        />
        <label className="flex items-center gap-2 text-xs text-[var(--ink-soft)]">
          <input
            type="checkbox"
            checked={onlyOverridden}
            onChange={(e) => setOnlyOverridden(e.target.checked)}
            className="h-4 w-4 accent-[var(--brand)]"
          />
          Only overridden ({overrideCount})
        </label>
        <p className="text-xs text-[var(--ink-soft)]">
          {filtered.length} shown
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--ink-soft)]">
          Nothing matches that search.
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((d) => (
            <DestinationRow key={d.slug} dest={d} override={overrides[d.slug]} />
          ))}
        </ul>
      )}
    </div>
  )
}
