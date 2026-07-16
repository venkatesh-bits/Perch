'use client'

import { useActionState } from 'react'
import Image from 'next/image'
import {
  addTripVideo,
  deleteTripMedia,
  updateTripMedia,
  uploadTripPhoto,
  type MediaState,
} from '@/app/admin/(panel)/trip-media/actions'
import { DeleteButton, fieldClass, labelClass, Notice, SubmitButton } from '@/components/admin/ui'
import type { TripMedia } from '@/lib/types/database'

export interface DayOption {
  day: number
  label: string
}

function DayField({ days, defaultValue }: { days: DayOption[]; defaultValue?: number | null }) {
  return (
    <select name="day" defaultValue={defaultValue ?? ''} className={fieldClass}>
      <option value="">General gallery (no day)</option>
      {days.map((d) => (
        <option key={d.day} value={d.day}>
          Day {d.day} · {d.label}
        </option>
      ))}
    </select>
  )
}

// ─── Upload a photo ──────────────────────────────────────────────────────────

function PhotoUploadForm({ days }: { days: DayOption[] }) {
  const [state, action] = useActionState<MediaState, FormData>(uploadTripPhoto, {})

  return (
    <form action={action} className="space-y-3">
      <div className="space-y-1.5">
        <label htmlFor="file" className={labelClass}>
          Photo
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required
          className={`${fieldClass} file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--paper-deep)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--ink)]`}
        />
        <p className="text-[11px] text-[var(--ink-soft)]">JPEG, PNG or WebP. Up to 8MB.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className={labelClass}>Day</label>
          <DayField days={days} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="photo-sort" className={labelClass}>
            Sort
          </label>
          <input id="photo-sort" name="sort" type="number" defaultValue={0} className={fieldClass} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="photo-caption" className={labelClass}>
          Caption
        </label>
        <input
          id="photo-caption"
          name="caption"
          type="text"
          maxLength={300}
          className={fieldClass}
          placeholder="Optional"
        />
      </div>

      <Notice state={state} />
      <SubmitButton pendingLabel="Uploading...">Upload photo</SubmitButton>
    </form>
  )
}

// ─── Add a video ─────────────────────────────────────────────────────────────

function VideoAddForm({ days }: { days: DayOption[] }) {
  const [state, action] = useActionState<MediaState, FormData>(addTripVideo, {})

  return (
    <form action={action} className="space-y-3">
      <div className="space-y-1.5">
        <label htmlFor="video-url" className={labelClass}>
          Video URL
        </label>
        <input
          id="video-url"
          name="url"
          type="url"
          required
          className={fieldClass}
          placeholder="https://youtube.com/watch?v=..."
        />
        <p className="text-[11px] text-[var(--ink-soft)]">
          YouTube or Vimeo link, or a direct https .mp4/.webm URL.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className={labelClass}>Day</label>
          <DayField days={days} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="video-sort" className={labelClass}>
            Sort
          </label>
          <input id="video-sort" name="sort" type="number" defaultValue={0} className={fieldClass} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="video-caption" className={labelClass}>
          Caption
        </label>
        <input
          id="video-caption"
          name="caption"
          type="text"
          maxLength={300}
          className={fieldClass}
          placeholder="Optional"
        />
      </div>

      <Notice state={state} />
      <SubmitButton pendingLabel="Adding...">Add video</SubmitButton>
    </form>
  )
}

// ─── One existing item ───────────────────────────────────────────────────────

function MediaRow({ item, days }: { item: TripMedia; days: DayOption[] }) {
  const [saveState, saveAction] = useActionState<MediaState, FormData>(updateTripMedia, {})
  const [delState, delAction] = useActionState<MediaState, FormData>(deleteTripMedia, {})

  return (
    <li className="card p-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-[var(--paper-deep)] sm:w-44">
          {item.kind === 'photo' ? (
            <Image
              src={item.url}
              alt={item.caption ?? 'Trip photo'}
              fill
              sizes="176px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 px-2 text-center">
              <span className="text-2xl">▶</span>
              <span className="line-clamp-2 break-all text-[10px] text-[var(--ink-soft)]">
                {item.url}
              </span>
            </div>
          )}
          <span className="absolute left-1.5 top-1.5 rounded-full bg-[var(--ink)]/75 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--paper)]">
            {item.kind}
          </span>
        </div>

        <div className="flex-1 space-y-3">
          <form action={saveAction} className="space-y-3">
            <input type="hidden" name="id" value={item.id} />

            <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
              <div className="space-y-1.5">
                <label className={labelClass}>Day</label>
                <DayField days={days} defaultValue={item.day} />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Sort</label>
                <input name="sort" type="number" defaultValue={item.sort} className={fieldClass} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Caption</label>
              <input
                name="caption"
                type="text"
                maxLength={300}
                defaultValue={item.caption ?? ''}
                className={fieldClass}
                placeholder="Optional"
              />
            </div>

            <Notice state={saveState} />
            <SubmitButton variant="ghost" pendingLabel="Saving...">
              Save
            </SubmitButton>
          </form>

          <form action={delAction}>
            <input type="hidden" name="id" value={item.id} />
            <Notice state={delState} />
            <DeleteButton
              confirm={
                item.kind === 'photo'
                  ? 'Delete this photo? The file is removed from storage too. This cannot be undone.'
                  : 'Remove this video from the log?'
              }
            />
          </form>
        </div>
      </div>
    </li>
  )
}

// ─── Manager ─────────────────────────────────────────────────────────────────

export function TripMediaManager({ media, days }: { media: TripMedia[]; days: DayOption[] }) {
  return (
    <div className="space-y-8">
      <section className="grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-display text-xl tracking-tight text-[var(--ink)]">Upload a photo</h2>
          <p className="mt-1 mb-4 text-xs text-[var(--ink-soft)]">
            Goes to the <code>media</code> bucket and shows up on /kashmir straight away.
          </p>
          <PhotoUploadForm days={days} />
        </div>

        <div className="card p-5">
          <h2 className="font-display text-xl tracking-tight text-[var(--ink)]">Add a video</h2>
          <p className="mt-1 mb-4 text-xs text-[var(--ink-soft)]">
            Nothing is uploaded - the link is embedded on the page.
          </p>
          <VideoAddForm days={days} />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display text-xl tracking-tight text-[var(--ink)]">
            On the page ({media.length})
          </h2>
          <p className="text-xs text-[var(--ink-soft)]">
            Lower sort values come first within a day.
          </p>
        </div>

        {media.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--ink-soft)]">
            Nothing here yet. The trip log looks exactly as it does today until you add something.
          </p>
        ) : (
          <ul className="space-y-4">
            {media.map((m) => (
              <MediaRow key={m.id} item={m} days={days} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
