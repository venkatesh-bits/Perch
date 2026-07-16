'use client'

import { useActionState, useState } from 'react'
import Image from 'next/image'
import {
  createPost,
  deletePost,
  updatePost,
  type PostState,
} from '@/app/admin/(panel)/posts/actions'
import { DeleteButton, fieldClass, labelClass, Notice, SubmitButton } from '@/components/admin/ui'
import type { Post } from '@/lib/types/database'

function CoverField({ id, current }: { id: string; current?: string | null }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={labelClass}>
        Cover image
      </label>
      <input
        id={id}
        name="cover"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className={`${fieldClass} file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--paper-deep)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-[var(--ink)]`}
      />
      <p className="text-[11px] text-[var(--ink-soft)]">
        JPEG, PNG or WebP, up to 8MB.{current ? ' Choosing a new file replaces the current one.' : ''}
      </p>
    </div>
  )
}

function PublishedField({ id, defaultChecked }: { id: string; defaultChecked?: boolean }) {
  return (
    <label htmlFor={id} className="flex items-center gap-2.5 text-sm text-[var(--ink)]">
      <input
        id={id}
        name="published"
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-4 w-4 accent-[var(--brand)]"
      />
      Published
      <span className="text-xs text-[var(--ink-soft)]">(unchecked = draft, only you can see it)</span>
    </label>
  )
}

// ─── Create ──────────────────────────────────────────────────────────────────

function NewPostForm() {
  const [state, action] = useActionState<PostState, FormData>(createPost, {})
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn-primary text-sm">
        New post
      </button>
    )
  }

  return (
    <form action={action} className="card space-y-3 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl tracking-tight text-[var(--ink)]">New post</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-[var(--ink-soft)] underline"
        >
          Cancel
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="new-title" className={labelClass}>
            Title
          </label>
          <input id="new-title" name="title" type="text" required maxLength={200} className={fieldClass} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="new-slug" className={labelClass}>
            Slug
          </label>
          <input
            id="new-slug"
            name="slug"
            type="text"
            required
            maxLength={80}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            className={fieldClass}
            placeholder="a-short-url-name"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="new-body" className={labelClass}>
          Body
        </label>
        <textarea id="new-body" name="body" rows={8} className={fieldClass} />
      </div>

      <CoverField id="new-cover" />
      <PublishedField id="new-published" />

      <Notice state={state} />
      <SubmitButton pendingLabel="Creating...">Create post</SubmitButton>
    </form>
  )
}

// ─── Edit ────────────────────────────────────────────────────────────────────

function PostRow({ post }: { post: Post }) {
  const [saveState, saveAction] = useActionState<PostState, FormData>(updatePost, {})
  const [delState, delAction] = useActionState<PostState, FormData>(deletePost, {})
  const [open, setOpen] = useState(false)

  return (
    <li className="card p-4">
      <div className="flex flex-wrap items-center gap-3">
        {post.cover_url ? (
          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-[var(--paper-deep)]">
            <Image src={post.cover_url} alt="" fill sizes="64px" className="object-cover" />
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-[var(--ink)]">{post.title}</p>
          <p className="truncate text-xs text-[var(--ink-soft)]">/{post.slug}</p>
        </div>

        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
            post.published
              ? 'bg-[var(--brand)]/10 text-[var(--brand)]'
              : 'bg-[var(--paper-deep)] text-[var(--ink-soft)]'
          }`}
        >
          {post.published ? 'Published' : 'Draft'}
        </span>

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
          <form action={saveAction} className="space-y-3">
            <input type="hidden" name="id" value={post.id} />

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className={labelClass}>Title</label>
                <input
                  name="title"
                  type="text"
                  required
                  maxLength={200}
                  defaultValue={post.title}
                  className={fieldClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Slug</label>
                <input
                  name="slug"
                  type="text"
                  required
                  maxLength={80}
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  defaultValue={post.slug}
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Body</label>
              <textarea name="body" rows={10} defaultValue={post.body ?? ''} className={fieldClass} />
            </div>

            <CoverField id={`cover-${post.id}`} current={post.cover_url} />
            <PublishedField id={`published-${post.id}`} defaultChecked={post.published} />

            <Notice state={saveState} />
            <SubmitButton variant="ghost" pendingLabel="Saving...">
              Save
            </SubmitButton>
          </form>

          <form action={delAction}>
            <input type="hidden" name="id" value={post.id} />
            <Notice state={delState} />
            <DeleteButton confirm={`Delete "${post.title}"? This cannot be undone.`} />
          </form>
        </div>
      ) : null}
    </li>
  )
}

// ─── Manager ─────────────────────────────────────────────────────────────────

export function PostsManager({ posts }: { posts: Post[] }) {
  return (
    <div className="space-y-6">
      <NewPostForm />

      {posts.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--ink-soft)]">
          No posts yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {posts.map((p) => (
            <PostRow key={p.id} post={p} />
          ))}
        </ul>
      )}
    </div>
  )
}
